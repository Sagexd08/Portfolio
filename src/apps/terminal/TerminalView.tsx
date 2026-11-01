import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { complete, run, type ThemeName } from './engine';

export interface Palette {
  bg: string;
  fg: string;
  prompt: string;
  accent: string;
}

export const PALETTES: Record<ThemeName, Palette> = {
  purple: { bg: '#2b1f3d', fg: '#e8e2f2', prompt: '#b794f6', accent: '#6bd0ff' },
  basic: { bg: '#fefefe', fg: '#1d1d1f', prompt: '#1d1d1f', accent: '#0a5ea8' },
  homebrew: { bg: '#000000', fg: '#28fe14', prompt: '#28fe14', accent: '#28fe14' },
};

interface Line {
  id: number;
  text: string;
  isCommand?: boolean;
}

const PROMPT = 'sohom@Sohoms-MacBook ~ %';
const WELCOME = ['Last login: today on ttys000', 'Type "help" to see what this shell can do.'];

interface Props {
  palette?: Palette;
  className?: string;
  onTheme?: (theme: ThemeName) => void;
  autoFocus?: boolean;
  label?: string;
  /** Command to auto-run once on mount, e.g. 'neofetch'. */
  initialCommand?: string;
}

export function TerminalView({ palette = PALETTES.purple, className, onTheme, autoFocus, label = 'Terminal', initialCommand }: Props) {
  const nextId = useRef(0);
  const mk = (text: string, isCommand?: boolean): Line => ({ id: nextId.current++, text, isCommand });
  const [lines, setLines] = useState<Line[]>(() => {
    const base = WELCOME.map((t) => mk(t));
    if (!initialCommand) return base;
    const r = run(initialCommand, { history: [initialCommand], setTheme: () => undefined });
    return 'then' in r || !r.output ? base : [...base, mk(`${PROMPT} ${initialCommand}`, true), ...r.output.map((t) => mk(t))];
  });
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => end.current?.scrollIntoView({ block: 'end' }), [lines]);
  useEffect(() => {
    if (autoFocus) input.current?.focus();
  }, [autoFocus]);

  const submit = (): void => {
    const command = value;
    const nextHistory = command.trim() ? [...history, command] : history;
    setHistory(nextHistory);
    setCursor(null);
    setValue('');
    const result = run(command, { history: nextHistory, setTheme: (t) => onTheme?.(t) });
    const echo = mk(`${PROMPT} ${command}`, true);
    if ('then' in result) {
      const pending = mk('Searching the portfolio...');
      setLines((prev) => [...prev, echo, pending]);
      void result.then((r) => setLines((prev) => [...prev.filter((l) => l.id !== pending.id), ...(r.output ?? []).map((t) => mk(t))]));
    } else {
      setLines((prev) => (result.output ? [...prev, echo, ...result.output.map((t) => mk(t))] : []));
    }
  };

  const recall = (delta: -1 | 1): void => {
    if (!history.length) return;
    const at = cursor === null ? history.length : cursor;
    const next = Math.min(Math.max(at + delta, 0), history.length);
    setCursor(next === history.length ? null : next);
    setValue(history[next] ?? '');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') submit();
    else if (e.key === 'ArrowUp') { e.preventDefault(); recall(-1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); recall(1); }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const done = complete(value);
      if (done) setValue(done);
    } else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); setLines([]); }
    e.stopPropagation();
  };

  return (
    <div
      className={`mono h-full overflow-auto p-3 text-[13px] leading-[1.45] ${className ?? ''}`}
      style={{ background: palette.bg, color: palette.fg }}
      onClick={() => input.current?.focus()}
    >
      <div role="log" aria-label={`${label} output`} aria-live="polite">
        {lines.map((l) => (
          <div key={l.id} className="whitespace-pre-wrap break-words" style={l.isCommand ? { color: palette.accent } : undefined}>{l.text || ' '}</div>
        ))}
      </div>
      <label className="flex items-center gap-2">
        <span style={{ color: palette.prompt }} className="flex-none">{PROMPT}</span>
        <input
          ref={input}
          value={value}
          onChange={(e) => { setValue(e.target.value); setCursor(null); }}
          onKeyDown={onKeyDown}
          aria-label={`${label} command input`}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="mono min-w-0 flex-1 border-0 bg-transparent p-0 outline-none"
          style={{ color: palette.fg, caretColor: palette.prompt }}
        />
      </label>
      <div ref={end} />
    </div>
  );
}
