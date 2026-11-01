import { useEffect, useRef, useState, type FormEvent } from 'react';
import { composeAnswer, isGrounded, type Source } from '../ai/extractive';
import { buildMessages } from '../ai/prompt';
import { retrieve, type Hit } from '../ai/retrieve';
import { embedQuery, generate, generateRemote, isReady, loadEmbedder, loadSlm, modelsConfigured, webgpuAvailable } from '../ai/slm';
import { setAiStatus } from '../ai/status';
import { startListening, voiceSupported } from '../ai/voice';
import { openApp } from '../desktop/store';
import type { AppProps } from '../desktop/types';
import { ExternalLink } from './ui';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  sources?: Source[];
  label?: string;
}

const SUGGESTIONS = ['Who is Sohom?', 'Explain Project Apex DB', 'What does Lumeo do?', 'What is his experience with Rust?', 'Which open-source projects has he contributed to?', 'How can I contact him?'];
const MAX_INPUT = 400;

const COMMANDS: Record<string, { reply: string; run?: () => void }> = {
  '/help': { reply: 'Commands: /hire, /loss, /embed, /sudo hire sohom. Anything else is treated as a question.' },
  '/hire': { reply: 'Opening contact. He is looking for forward-deployed and ML engineering roles.', run: () => openApp('contact') },
  '/sudo hire sohom': { reply: 'Permission granted. Opening contact.', run: () => openApp('contact') },
  '/loss': { reply: 'Opening the playground: a neural net trained from scratch, live.', run: () => openApp('playground') },
  '/embed': { reply: 'Opening the embedding space of this knowledge base.', run: () => openApp('embeddings') },
};

const mb = (bytes: number): string => `${Math.round(bytes / 1048576)} MB`;

export default function AssistantApp({ params }: AppProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(params.q ?? '');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState('');
  const [embedderOn, setEmbedderOn] = useState(isReady('embedder'));
  const [slmOn, setSlmOn] = useState(isReady('slm'));
  const [progress, setProgress] = useState<string>('');
  const abort = useRef<AbortController | null>(null);
  const stopVoice = useRef<(() => void) | null>(null);
  const nextId = useRef(1);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAiStatus({ phase: 'opened' });
    return () => {
      stopVoice.current?.();
      abort.current?.abort();
      setAiStatus({ phase: 'idle' });
    };
  }, []);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [messages]);

  const push = (message: Omit<Message, 'id'>): number => {
    const id = nextId.current++;
    setMessages((all) => [...all, { ...message, id }]);
    return id;
  };
  const patch = (id: number, change: Partial<Message>): void => setMessages((all) => all.map((m) => (m.id === id ? { ...m, ...change } : m)));

  const ask = async (raw: string): Promise<void> => {
    const question = raw.trim().slice(0, MAX_INPUT);
    if (!question || busy) return;
    setInput('');
    push({ role: 'user', text: question });
    const command = COMMANDS[question.toLowerCase()];
    if (command) {
      push({ role: 'assistant', text: command.reply, label: 'Command' });
      command.run?.();
      return;
    }
    setBusy(true);
    abort.current = new AbortController();
    setAiStatus({ phase: 'processing' });
    try {
      const vector = embedderOn ? await embedQuery(question) : undefined;
      const { hits, path } = await retrieve(question, 5, vector, abort.current.signal);
      const answer = composeAnswer(question, hits);
      const id = push({ role: 'assistant', text: answer.text, sources: answer.sources, label: `Extractive · ${path}` });
      if (!answer.refused) await refine(id, question, hits, answer.sources, path);
      setAiStatus({ phase: 'opened' });
    } catch (error) {
      if ((error as Error).name === 'AbortError') setAiStatus({ phase: 'opened' });
      else {
        push({ role: 'assistant', text: 'Something went wrong while searching. Please try again.', label: 'Error' });
        setAiStatus({ phase: 'error', message: 'Assistant error', retry: () => void ask(question) });
      }
    } finally {
      setBusy(false);
    }
  };

  const refine = async (id: number, question: string, hits: Hit[], sources: Source[], path: string): Promise<void> => {
    const local = slmOn;
    const name = local ? 'On-device SLM' : 'Hosted SLM';
    let draft = '';
    const onToken = (token: string): void => { draft += token; patch(id, { label: `${name} · writing…` }); };
    const messages = buildMessages(question, hits);
    let text: string;
    setAiStatus({ phase: 'responding' });
    try {
      text = local ? await generate(messages, onToken, abort.current?.signal) : await generateRemote(messages, onToken, abort.current?.signal);
    } catch (error) {
      if (local || (error as Error).name === 'AbortError') throw error;
      patch(id, { label: `Extractive · ${path}` });
      return;
    }
    const final = (text || draft).trim();
    if (final && isGrounded(final, hits)) patch(id, { text: final, sources, label: `${name} · checked against sources${local ? ` · ${path}` : ''}` });
    else patch(id, { label: `Extractive · SLM draft rejected (not grounded) · ${path}` });
  };

  const onSubmit = (event: FormEvent): void => {
    event.preventDefault();
    void ask(input);
  };

  const toggleMic = (): void => {
    if (listening) {
      stopVoice.current?.();
      return;
    }
    setNotice('');
    setListening(true);
    setAiStatus({ phase: 'listening' });
    stopVoice.current = startListening({
      onTranscript: (text) => setInput(text.slice(0, MAX_INPUT)),
      onError: (message) => setNotice(message),
      onEnd: () => {
        setListening(false);
        setAiStatus({ phase: 'opened' });
      },
    });
  };

  const download = async (which: 'embedder' | 'slm'): Promise<void> => {
    setProgress('Starting download…');
    try {
      const onProgress = (loaded: number, total: number): void => setProgress(`Downloading ${mb(loaded)} / ${mb(total)}`);
      if (which === 'embedder') {
        await loadEmbedder(onProgress);
        setEmbedderOn(true);
      } else {
        await loadSlm(onProgress);
        setSlmOn(true);
      }
      setProgress('');
    } catch (error) {
      setProgress('');
      setNotice(`Could not load the model: ${(error as Error).message}`);
    }
  };

  const canModels = modelsConfigured();
  return (
    <div className="flex h-full flex-col">
      <div ref={log} role="log" aria-live="polite" aria-label="Conversation" className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
        {messages.length === 0 && (
          <div>
            <p className="m-0 mb-1 text-[15px] font-medium">Ask about Sohom</p>
            <p className="m-0 mb-3 text-[13px]" style={{ color: 'var(--muted)' }}>Answers come only from verified portfolio sources and always link to them. If the sources don’t say it, I’ll say so.</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((text) => (
                <button key={text} type="button" onClick={() => void ask(text)} className="rounded-full px-3 py-1 text-[12px]" style={{ border: '1px solid var(--hairline)' }}>{text}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className={message.role === 'user' ? 'flex justify-end' : ''}>
            <div className="max-w-[88%] rounded-2xl px-3 py-2 text-[13.5px] leading-relaxed" style={{ background: message.role === 'user' ? 'var(--accent)' : 'var(--surface-2)', color: message.role === 'user' ? '#fff' : 'var(--ink)' }}>
              <p className="m-0 whitespace-pre-line">{message.text}</p>
              {message.sources && message.sources.length > 0 && (
                <ol className="m-0 mt-2 list-none space-y-[2px] p-0 text-[12px]">
                  {message.sources.map((source) => (
                    <li key={source.n}>[{source.n}] <ExternalLink href={source.url}>{source.title}</ExternalLink></li>
                  ))}
                </ol>
              )}
              {message.label && <p className="m-0 mt-1 text-[11px]" style={{ color: 'var(--muted)' }}>{message.label}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 p-3" style={{ borderTop: '1px solid var(--hairline)' }}>
        {notice && <p role="alert" className="m-0 text-[12px]" style={{ color: '#c0504a' }}>{notice}</p>}
        {canModels && (
          <div className="flex flex-wrap items-center gap-2 text-[11.5px]" style={{ color: 'var(--muted)' }}>
            <button type="button" disabled={embedderOn || Boolean(progress)} onClick={() => void download('embedder')} className="rounded-md px-2 py-[2px]" style={{ border: '1px solid var(--hairline)' }}>
              {embedderOn ? 'Semantic search on' : 'Enable semantic search (~34 MB)'}
            </button>
            <button type="button" disabled={slmOn || Boolean(progress) || !webgpuAvailable()} onClick={() => void download('slm')} title={webgpuAvailable() ? undefined : 'Needs a WebGPU-capable browser'} className="rounded-md px-2 py-[2px]" style={{ border: '1px solid var(--hairline)' }}>
              {slmOn ? 'On-device SLM on' : 'Load on-device model (~273 MB)'}
            </button>
            <span role="status">{progress || (webgpuAvailable() ? 'Runs entirely in your browser.' : 'On-device model needs WebGPU; extractive answers still work.')}</span>
          </div>
        )}
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <input
            autoFocus
            aria-label="Your question"
            value={input}
            maxLength={MAX_INPUT}
            onChange={(event) => setInput(event.target.value)}
            placeholder={listening ? 'Listening…' : 'Ask a question, or try /help'}
            className="min-w-0 flex-1 rounded-lg px-3 py-2 text-[13.5px] outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline)' }}
          />
          {input && <button type="button" aria-label="Clear input" onClick={() => setInput('')} className="rounded-md px-2 py-1 text-[12px]" style={{ border: '1px solid var(--hairline)' }}>Clear</button>}
          <button
            type="button"
            aria-label={listening ? 'Stop listening' : 'Start voice input'}
            aria-pressed={listening}
            onClick={toggleMic}
            disabled={!voiceSupported()}
            title={voiceSupported() ? undefined : 'Voice input is not supported in this browser. Type instead.'}
            className="rounded-md px-2 py-1 text-[12px]"
            style={{ border: '1px solid var(--hairline)', background: listening ? '#c0504a' : 'transparent', color: listening ? '#fff' : 'var(--ink)' }}
          >
            {listening ? 'Stop' : 'Mic'}
          </button>
          {busy ? (
            <button type="button" onClick={() => abort.current?.abort()} className="rounded-lg px-3 py-2 text-[13px]" style={{ border: '1px solid var(--hairline)' }}>Stop</button>
          ) : (
            <button type="submit" disabled={!input.trim()} className="rounded-lg px-3 py-2 text-[13px] text-white disabled:opacity-40" style={{ background: 'var(--accent)' }}>Send</button>
          )}
        </form>
        <p className="m-0 text-[11px]" style={{ color: 'var(--muted)' }}>Voice uses your browser’s speech recognition (some browsers send audio to their vendor). Transcripts are never sent automatically. Nothing you type is stored.</p>
      </div>
    </div>
  );
}
