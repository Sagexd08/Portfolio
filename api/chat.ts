// Hosted SLM proxy: validates the request, then pipes the Hugging Face router SSE stream back.
// HF_TOKEN is read from the server environment only.

const UPSTREAM = 'https://router.huggingface.co/v1/chat/completions';
const MODEL = 'ibm-granite/granite-4.2-3b';
const MAX_MESSAGES = 8;
const MAX_CONTENT = 6000;
const MAX_TOTAL = 12000;
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const UPSTREAM_TIMEOUT_MS = 25_000;
const ROLES = new Set(['system', 'user', 'assistant']);
const ALLOWED_ORIGINS = new Set(['https://sohomchatterjee.vercel.app']);
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

// Best-effort per-instance limiter; use a shared store if traffic ever warrants it.
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

const originAllowed = (origin: string | null): origin is string => origin !== null && (ALLOWED_ORIGINS.has(origin) || LOCAL_ORIGIN.test(origin));

const json = (body: unknown, status: number, origin: string | null): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', vary: 'origin', ...(originAllowed(origin) ? { 'access-control-allow-origin': origin } : {}) },
  });

function validMessages(body: unknown): { role: string; content: string }[] | null {
  const messages = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return null;
  let total = 0;
  const clean: { role: string; content: string }[] = [];
  for (const m of messages) {
    const { role, content } = (m ?? {}) as { role?: unknown; content?: unknown };
    if (typeof role !== 'string' || !ROLES.has(role) || typeof content !== 'string' || content.length > MAX_CONTENT) return null;
    total += content.length;
    clean.push({ role, content });
  }
  return total <= MAX_TOTAL ? clean : null;
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin');
  if (!originAllowed(origin)) return json({ error: 'Forbidden' }, 403, null);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (limited(ip)) return json({ error: 'Too many requests' }, 429, origin);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request' }, 400, origin);
  }
  const messages = validMessages(body);
  if (!messages) return json({ error: 'Invalid request' }, 400, origin);

  const token = process.env.HF_TOKEN;
  if (!token) return json({ error: 'Hosted model unavailable' }, 503, origin);

  try {
    const upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ model: MODEL, messages, max_tokens: 300, temperature: 0.2, stream: true }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!upstream.ok || !upstream.body) return json({ error: 'Hosted model unavailable' }, 503, origin);
    return new Response(upstream.body, {
      status: 200,
      headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-store', 'access-control-allow-origin': origin, vary: 'origin' },
    });
  } catch {
    return json({ error: 'Hosted model unavailable' }, 503, origin);
  }
}

export function OPTIONS(request: Request): Response {
  const origin = request.headers.get('origin');
  if (!originAllowed(origin)) return new Response(null, { status: 403 });
  return new Response(null, {
    status: 204,
    headers: { 'access-control-allow-origin': origin, 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', vary: 'origin' },
  });
}

export function GET(): Response {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'content-type': 'application/json', allow: 'POST' } });
}
