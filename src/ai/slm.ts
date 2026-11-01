// Main-thread client for the model worker. Models are optional: the assistant works without them.

import type { ChatMessage } from './prompt';

type Which = 'embedder' | 'slm';
type Progress = (loaded: number, total: number) => void;

const BASE = (import.meta as unknown as { env: Record<string, string | undefined> }).env.VITE_MODELS_BASE_URL;

let worker: Worker | null = null;
let nextId = 1;
const loaders = new Map<Which, { resolve: () => void; reject: (error: Error) => void; progress?: Progress }>();
const requests = new Map<number, { resolve: (value: never) => void; reject: (error: Error) => void; onToken?: (text: string) => void }>();
const ready = new Set<Which>();

export const modelsConfigured = (): boolean => Boolean(BASE);
export const webgpuAvailable = (): boolean => typeof navigator !== 'undefined' && 'gpu' in navigator;
export const isReady = (which: Which): boolean => ready.has(which);

function handle(data: Record<string, unknown>): void {
  const id = data.id as number | undefined;
  const which = data.which as Which | undefined;
  if (data.type === 'progress' && which) loaders.get(which)?.progress?.(data.loaded as number, data.total as number);
  if (data.type === 'ready' && which) {
    ready.add(which);
    loaders.get(which)?.resolve();
    loaders.delete(which);
  }
  if (data.type === 'token' && id !== undefined) requests.get(id)?.onToken?.(data.text as string);
  if (data.type === 'embedding' && id !== undefined) requests.get(id)?.resolve(data.vector as never);
  if (data.type === 'done' && id !== undefined) requests.get(id)?.resolve(data.text as never);
  if (data.type === 'error') {
    const error = new Error(String(data.message));
    if (which) loaders.get(which)?.reject(error);
    if (id !== undefined) requests.get(id)?.reject(error);
  }
  if ((data.type === 'done' || data.type === 'embedding' || data.type === 'error') && id !== undefined) requests.delete(id);
}

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./slm.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<Record<string, unknown>>) => handle(event.data);
  }
  return worker;
}

function load(which: Which, progress?: Progress): Promise<void> {
  if (!BASE) return Promise.reject(new Error('Local models are not configured for this deployment.'));
  if (ready.has(which)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    loaders.set(which, { resolve, reject, progress });
    getWorker().postMessage({ type: 'load', which, base: BASE });
  });
}

export const loadEmbedder = (progress?: Progress): Promise<void> => load('embedder', progress);
export const loadSlm = (progress?: Progress): Promise<void> => load('slm', progress);

export function embedQuery(text: string): Promise<number[]> {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    requests.set(id, { resolve: resolve as (value: never) => void, reject });
    getWorker().postMessage({ type: 'embed', id, text });
  });
}

// Hosted SLM via the /api/chat proxy (no download). Throws on any non-200 so callers can fall back.
export async function generateRemote(messages: ChatMessage[], onToken: (text: string) => void, signal?: AbortSignal): Promise<string> {
  const response = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages }), signal });
  if (response.status !== 200 || !response.body) throw new Error('Hosted model unavailable');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const data = line.startsWith('data:') ? line.slice(5).trim() : '';
      if (!data || data === '[DONE]') continue;
      try {
        const token = (JSON.parse(data) as { choices?: { delta?: { content?: string } }[] }).choices?.[0]?.delta?.content;
        if (token) {
          text += token;
          onToken(token);
        }
      } catch {
        // partial or non-JSON frame; skip
      }
    }
  }
  return text;
}

export function generate(messages: ChatMessage[], onToken: (text: string) => void, signal?: AbortSignal): Promise<string> {
  const id = nextId++;
  signal?.addEventListener('abort', () => getWorker().postMessage({ type: 'stop' }));
  return new Promise((resolve, reject) => {
    requests.set(id, { resolve: resolve as (value: never) => void, reject, onToken });
    getWorker().postMessage({ type: 'generate', id, messages });
  });
}
