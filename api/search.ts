// Hybrid retrieval over Neon (pgvector cosine + full-text), fused with Reciprocal Rank Fusion.
// The query embedding is computed in the visitor's browser by the same bge-small model that built the index.

import { neon } from '@neondatabase/serverless';

const DIM = 384;
const MAX_QUERY = 400;
const MAX_K = 8;
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const CANDIDATES = 20;
const MIN_COSINE = 0.3;

// Best-effort per-instance limiter; use a shared store if traffic ever warrants it.
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

interface Parsed {
  query: string;
  embedding: number[];
  k: number;
}

function parse(body: unknown): Parsed | null {
  const input = body as Partial<Parsed> | null;
  if (!input || typeof input.query !== 'string') return null;
  const query = input.query.trim();
  if (query.length < 1 || query.length > MAX_QUERY) return null;
  if (!Array.isArray(input.embedding) || input.embedding.length !== DIM) return null;
  if (!input.embedding.every((value) => typeof value === 'number' && Number.isFinite(value))) return null;
  const k = Math.min(Math.max(Number(input.k) || 5, 1), MAX_K);
  return { query, embedding: input.embedding, k };
}

const SQL = `
WITH v AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY embedding <=> $1::vector) AS r
  FROM portfolio_chunks ORDER BY embedding <=> $1::vector LIMIT ${CANDIDATES}
), f AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY ts_rank(fts, plainto_tsquery('english', $2)) DESC) AS r
  FROM portfolio_chunks WHERE fts @@ plainto_tsquery('english', $2)
  ORDER BY ts_rank(fts, plainto_tsquery('english', $2)) DESC LIMIT ${CANDIDATES}
)
SELECT c.content, s.title, s.source_url, s.source_type,
       COALESCE(1.0 / (60 + v.r), 0) + COALESCE(1.0 / (60 + f.r), 0) AS score
FROM portfolio_chunks c
JOIN portfolio_sources s ON s.id = c.source_id
LEFT JOIN v ON v.id = c.id
LEFT JOIN f ON f.id = c.id
WHERE s.visibility = 'public'
  AND (f.id IS NOT NULL OR (v.id IS NOT NULL AND 1 - (c.embedding <=> $1::vector) >= ${MIN_COSINE}))
ORDER BY score DESC
LIMIT $3`;

export async function POST(request: Request): Promise<Response> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (limited(ip)) return json({ error: 'rate_limited' }, 429);
  const url = process.env.DATABASE_URL;
  if (!url) return json({ error: 'search_unavailable' }, 503);

  let parsed: Parsed | null = null;
  try {
    parsed = parse(await request.json());
  } catch {
    parsed = null;
  }
  if (!parsed) return json({ error: 'invalid_request' }, 400);

  try {
    const sql = neon(url);
    const rows = await sql.query(SQL, [`[${parsed.embedding.join(',')}]`, parsed.query, parsed.k]);
    return json({ chunks: rows, retrieval: 'hybrid' });
  } catch (error) {
    console.error('search failed', error instanceof Error ? error.message : error);
    return json({ error: 'search_unavailable' }, 503);
  }
}

export function GET(): Response {
  return json({ error: 'method_not_allowed' }, 405);
}
