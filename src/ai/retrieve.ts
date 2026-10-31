// Retrieval: server hybrid search (pgvector + full-text, fused with RRF) when a query embedding is
// available, with an always-on local fallback (BM25, plus cosine/RRF over the static index).

export interface Hit {
  id: string;
  title: string;
  text: string;
  url: string;
  type: string;
  score: number;
}

export interface IndexChunk {
  id: string;
  title: string;
  text: string;
  source_url: string;
  source_type: string;
  embedding?: number[];
}

export interface Retrieval {
  hits: Hit[];
  path: 'server-hybrid' | 'local-hybrid' | 'local-bm25';
}

const STOP = new Set('a an and are as at be by for from has have he his how i in is it of on or that the this to was what when where which who why with you does did do about tell me his him sohom'.split(' '));
const SERVER_TIMEOUT_MS = 8000;
const RRF_K = 60;
const MIN_COSINE = 0.3;

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9+#.]+/g) ?? []).map((token) => token.replace(/^\.+|\.+$/g, '')).filter((token) => token.length > 1 && !STOP.has(token));
}

function toHit(chunk: IndexChunk, score: number): Hit {
  return { id: chunk.id, title: chunk.title, text: chunk.text, url: chunk.source_url, type: chunk.source_type, score };
}

export function bm25Rank(chunks: IndexChunk[], query: string): { chunk: IndexChunk; score: number }[] {
  const terms = tokenize(query);
  const docs = chunks.map((chunk) => tokenize(`${chunk.title} ${chunk.text}`));
  const avg = docs.reduce((sum, doc) => sum + doc.length, 0) / (docs.length || 1);
  const df = new Map<string, number>();
  docs.forEach((doc) => new Set(doc).forEach((term) => df.set(term, (df.get(term) ?? 0) + 1)));
  const k1 = 1.5;
  const b = 0.75;
  return chunks
    .map((chunk, index) => {
      const doc = docs[index];
      const score = terms.reduce((sum, term) => {
        const tf = doc.filter((token) => token === term).length;
        if (!tf) return sum;
        const idf = Math.log(1 + (docs.length - (df.get(term) ?? 0) + 0.5) / ((df.get(term) ?? 0) + 0.5));
        return sum + (idf * tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * doc.length) / avg));
      }, 0);
      return { chunk, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b2) => b2.score - a.score);
}

export function cosineRank(chunks: IndexChunk[], query: number[]): { chunk: IndexChunk; score: number }[] {
  return chunks
    .filter((chunk) => chunk.embedding)
    .map((chunk) => ({ chunk, score: chunk.embedding!.reduce((sum, value, i) => sum + value * query[i], 0) }))
    .filter((item) => item.score >= MIN_COSINE)
    .sort((a, b) => b.score - a.score);
}

/** Reciprocal Rank Fusion over several ranked lists of chunks. */
export function rrf(lists: { chunk: IndexChunk }[][], k: number): Hit[] {
  const scores = new Map<string, { chunk: IndexChunk; score: number }>();
  lists.forEach((list) =>
    list.forEach((item, rank) => {
      const entry = scores.get(item.chunk.id) ?? { chunk: item.chunk, score: 0 };
      entry.score += 1 / (RRF_K + rank + 1);
      scores.set(item.chunk.id, entry);
    }),
  );
  return [...scores.values()].sort((a, b) => b.score - a.score).slice(0, k).map((entry) => toHit(entry.chunk, entry.score));
}

let indexCache: Promise<IndexChunk[]> | null = null;

function loadIndex(): Promise<IndexChunk[]> {
  indexCache ??= fetch('/rag/index.json')
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error('index missing'))))
    .then((data: { chunks: IndexChunk[] }) => data.chunks);
  return indexCache;
}

async function serverSearch(query: string, embedding: number[], k: number, signal?: AbortSignal): Promise<Hit[]> {
  const timeout = new AbortController();
  const timer = window.setTimeout(() => timeout.abort(), SERVER_TIMEOUT_MS);
  signal?.addEventListener('abort', () => timeout.abort());
  try {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, embedding, k }),
      signal: timeout.signal,
    });
    if (!res.ok) throw new Error(`search ${res.status}`);
    const data = (await res.json()) as { chunks: { content: string; title: string; source_url: string; source_type: string; score: number }[] };
    return data.chunks.map((chunk, index) => ({ id: `srv-${index}-${chunk.source_url}`, title: chunk.title, text: chunk.content, url: chunk.source_url, type: chunk.source_type, score: chunk.score }));
  } finally {
    window.clearTimeout(timer);
  }
}

export async function retrieve(query: string, k = 5, embedding?: number[], signal?: AbortSignal): Promise<Retrieval> {
  if (embedding) {
    try {
      const hits = await serverSearch(query, embedding, k, signal);
      if (hits.length > 0) return { hits, path: 'server-hybrid' };
    } catch (error) {
      if ((error as Error).name === 'AbortError' && signal?.aborted) throw error;
      // Server or database unavailable: fall through to the local index.
    }
  }
  const chunks = await loadIndex();
  const lexical = bm25Rank(chunks, query);
  if (!embedding) return { hits: lexical.slice(0, k).map((item) => toHit(item.chunk, item.score)), path: 'local-bm25' };
  return { hits: rrf([lexical, cosineRank(chunks, embedding)], k), path: 'local-hybrid' };
}
