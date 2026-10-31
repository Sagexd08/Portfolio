// Runs both local models off the main thread: the bge-small embedder (CPU/WASM) and the SmolLM2-360M
// generator (WebGPU). Weights are fetched from the Neon storage bucket and cached by the browser.

import { env, pipeline, TextStreamer, InterruptableStoppingCriteria } from '@huggingface/transformers';

type Which = 'embedder' | 'slm';
type Message = { role: string; content: string };

type InMessage =
  | { type: 'load'; which: Which; base: string }
  | { type: 'embed'; id: number; text: string }
  | { type: 'generate'; id: number; messages: Message[] }
  | { type: 'stop' };

interface Extractor {
  (text: string, opts: Record<string, unknown>): Promise<{ data: Float32Array }>;
}
interface Generator {
  (messages: Message[], opts: Record<string, unknown>): Promise<{ generated_text: Message[] | string }[]>;
  tokenizer: unknown;
}
type Make = (task: string, model: string, opts: Record<string, unknown>) => Promise<unknown>;

const make = pipeline as unknown as Make;
const QUERY_PREFIX = 'Represent this sentence for searching relevant passages: ';
const post = (message: Record<string, unknown>): void => self.postMessage(message);

let embedder: Extractor | null = null;
let generator: Generator | null = null;
const stopping = new InterruptableStoppingCriteria();

function progressReporter(which: Which): (event: { status: string; file?: string; loaded?: number; total?: number }) => void {
  const files = new Map<string, { loaded: number; total: number }>();
  return (event) => {
    if (event.status !== 'progress' || !event.file) return;
    files.set(event.file, { loaded: event.loaded ?? 0, total: event.total ?? 0 });
    const all = [...files.values()];
    post({ type: 'progress', which, loaded: all.reduce((s, f) => s + f.loaded, 0), total: all.reduce((s, f) => s + f.total, 0) });
  };
}

async function load(which: Which, base: string): Promise<void> {
  env.allowLocalModels = false;
  env.remoteHost = base.endsWith('/') ? base : `${base}/`;
  env.remotePathTemplate = '{model}/';
  if (which === 'embedder' && !embedder) {
    embedder = (await make('feature-extraction', 'bge-small-en-v1.5', { dtype: 'q8', progress_callback: progressReporter('embedder') })) as Extractor;
  }
  if (which === 'slm' && !generator) {
    generator = (await make('text-generation', 'SmolLM2-360M-Instruct', { device: 'webgpu', dtype: 'q4f16', progress_callback: progressReporter('slm') })) as Generator;
  }
  post({ type: 'ready', which });
}

async function embed(id: number, text: string): Promise<void> {
  if (!embedder) throw new Error('Embedder is not loaded');
  const output = await embedder(QUERY_PREFIX + text, { pooling: 'cls', normalize: true });
  post({ type: 'embedding', id, vector: Array.from(output.data) });
}

async function generate(id: number, messages: Message[]): Promise<void> {
  if (!generator) throw new Error('Model is not loaded');
  stopping.reset();
  let text = '';
  const streamer = new TextStreamer(generator.tokenizer as never, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (chunk: string) => {
      text += chunk;
      post({ type: 'token', id, text: chunk });
    },
  });
  await generator(messages, { max_new_tokens: 220, do_sample: false, repetition_penalty: 1.1, streamer, stopping_criteria: stopping });
  post({ type: 'done', id, text });
}

self.onmessage = (event: MessageEvent<InMessage>) => {
  const message = event.data;
  const fail = (error: unknown, extra: Record<string, unknown>): void => post({ type: 'error', message: (error as Error).message, ...extra });
  if (message.type === 'stop') stopping.interrupt();
  if (message.type === 'load') load(message.which, message.base).catch((error) => fail(error, { which: message.which }));
  if (message.type === 'embed') embed(message.id, message.text).catch((error) => fail(error, { id: message.id }));
  if (message.type === 'generate') generate(message.id, message.messages).catch((error) => fail(error, { id: message.id }));
};
