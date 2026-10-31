import { useEffect, useMemo, useReducer, useState } from 'react';
import { profile, projects, skills } from '../content/portfolio';
import type { AppProps } from '../desktop/types';
import { useWidth } from './ui';

interface Note {
  id: string;
  title: string;
  body: string;
  kind: 'portfolio' | 'scratch';
  updatedAt?: string;
}

const STORE_KEY = 'portfolio.scratch.v1';
const HIDDEN_KEY = 'portfolio.hidden-seeds.v1';
const WIDE_LAYOUT_MIN = 720;

const featured = projects.filter((project) => project.featured);
const mlStack = skills.find((group) => group.group === 'ML / AI')?.items.slice(0, 6).join(', ') ?? '';

const SEEDS: Note[] = [
  {
    id: 'intro',
    kind: 'portfolio',
    title: 'A little about me',
    body: "I'm a third-year Computer Science and Engineering student specializing in Data Science. I enjoy understanding technology by building things myself, experimenting with unfamiliar systems and figuring out why things break.\n\nI'm interested in engineering, backend systems, AI/ML, infrastructure and early-stage products. I like taking an idea, exploring the technical possibilities and attempting to turn it into something people can actually use.",
  },
  {
    id: 'build',
    kind: 'portfolio',
    title: 'Build. Break. Understand. Rebuild.',
    body: "I learn best by building. I don't want to understand a technology only through its documentation. I want to implement it, test its limits, understand its trade-offs and find out what happens when it fails.",
  },
  {
    id: 'roles',
    kind: 'portfolio',
    title: 'What I am looking for',
    body: `${profile.availability}.\n\nI want to work with startups because I want to understand how technology works in practice: how engineering decisions affect products, how small teams execute, how systems evolve and how technical ideas become useful products.\n\nMy work at Deloitte and Lumeo has been close to clients and design partners, which is the part of forward-deployed engineering I enjoy most.`,
  },
  {
    id: 'interests',
    kind: 'portfolio',
    title: 'Current interests',
    body: `Building now\n${featured.map((project) => `• ${project.name}: ${project.description.split('. ')[0]}`).join('\n')}\n\nML / AI tools I reach for\n${mlStack}`,
  },
];

type Action =
  | { type: 'load'; notes: Note[] }
  | { type: 'add'; note: Note }
  | { type: 'edit'; id: string; patch: Partial<Pick<Note, 'title' | 'body'>> }
  | { type: 'remove'; id: string };

function reducer(notes: Note[], action: Action): Note[] {
  switch (action.type) {
    case 'load':
      return action.notes;
    case 'add':
      return [action.note, ...notes];
    case 'edit':
      return notes.map((note) => (note.id === action.id ? { ...note, ...action.patch, updatedAt: new Date().toISOString() } : note));
    case 'remove':
      return notes.filter((note) => note.id !== action.id);
  }
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private mode); notes then live only for this session.
  }
}

type Category = 'all' | 'portfolio' | 'scratch';

export default function NotesApp({ params }: AppProps) {
  const [scratch, dispatch] = useReducer(reducer, [], () => readJson<Note[]>(STORE_KEY, []));
  const [hidden, setHidden] = useState<string[]>(() => readJson<string[]>(HIDDEN_KEY, []));
  const [category, setCategory] = useState<Category>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>(params.note ?? 'intro');
  const [confirming, setConfirming] = useState(false);
  const [showDetail, setShowDetail] = useState(Boolean(params.note));
  const [rootRef, width] = useWidth<HTMLDivElement>();
  const wide = width >= WIDE_LAYOUT_MIN;

  useEffect(() => writeJson(STORE_KEY, scratch), [scratch]);
  useEffect(() => writeJson(HIDDEN_KEY, hidden), [hidden]);
  useEffect(() => {
    if (params.note) {
      setSelectedId(params.note);
      setShowDetail(true);
    }
  }, [params.note]);

  const visible = useMemo(() => {
    const all = [...SEEDS.filter((note) => !hidden.includes(note.id)), ...scratch];
    const needle = query.trim().toLowerCase();
    return all.filter((note) => (category === 'all' || note.kind === category) && (!needle || `${note.title} ${note.body}`.toLowerCase().includes(needle)));
  }, [scratch, hidden, category, query]);

  const selected = visible.find((note) => note.id === selectedId) ?? (wide ? visible[0] : undefined);

  const addScratch = (): void => {
    const note: Note = { id: `s-${Date.now()}`, kind: 'scratch', title: 'Untitled note', body: '', updatedAt: new Date().toISOString() };
    dispatch({ type: 'add', note });
    setSelectedId(note.id);
    setCategory('scratch');
    setShowDetail(true);
  };

  const removeSelected = (): void => {
    if (!selected) return;
    if (selected.kind === 'scratch') dispatch({ type: 'remove', id: selected.id });
    else setHidden((ids) => [...ids, selected.id]);
    setConfirming(false);
    setShowDetail(false);
  };

  const list = (
    <ul className="m-0 list-none p-0" aria-label="Notes">
      {visible.map((note) => (
        <li key={note.id}>
          <button
            type="button"
            onClick={() => { setSelectedId(note.id); setShowDetail(true); setConfirming(false); }}
            aria-current={selected?.id === note.id}
            className="block w-full px-3 py-2 text-left"
            style={{ background: selected?.id === note.id ? 'var(--surface-2)' : 'transparent', borderBottom: '1px solid var(--hairline)' }}
          >
            <span className="block truncate text-[13px] font-medium">{note.title}</span>
            <span className="block truncate text-[12px]" style={{ color: 'var(--muted)' }}>
              {note.kind === 'portfolio' ? '🔒 Portfolio · ' : 'Scratch · '}
              {note.body.replace(/\s+/g, ' ').slice(0, 50) || 'No content'}
            </span>
          </button>
        </li>
      ))}
      {visible.length === 0 && <li className="p-4 text-[13px]" style={{ color: 'var(--muted)' }}>No notes match. Clear the search or restore portfolio notes.</li>}
    </ul>
  );

  const detail = selected ? (
    <article className="flex h-full flex-col p-5">
      {wide ? null : (
        <button type="button" onClick={() => setShowDetail(false)} className="mb-3 self-start text-[13px]" style={{ color: 'var(--accent)' }}>
          ‹ All notes
        </button>
      )}
      {selected.kind === 'scratch' ? (
        <>
          <input
            aria-label="Note title"
            value={selected.title}
            onChange={(event) => dispatch({ type: 'edit', id: selected.id, patch: { title: event.target.value } })}
            className="mb-3 w-full bg-transparent text-[20px] font-semibold outline-none"
          />
          <textarea
            aria-label="Note body"
            value={selected.body}
            onChange={(event) => dispatch({ type: 'edit', id: selected.id, patch: { body: event.target.value } })}
            className="min-h-[200px] w-full flex-1 resize-none bg-transparent text-[14px] leading-relaxed outline-none"
            placeholder="Write something. Stored only in this browser."
          />
        </>
      ) : (
        <>
          <h2 className="m-0 mb-1 text-[20px] font-semibold">{selected.title}</h2>
          <p className="m-0 mb-4 text-[12px]" style={{ color: 'var(--muted)' }}>🔒 Portfolio note · read-only</p>
          <div className="whitespace-pre-line text-[14px] leading-relaxed">{selected.body}</div>
        </>
      )}
      <div className="mt-4 flex items-center gap-2">
        {confirming ? (
          <>
            <span className="text-[13px]">{selected.kind === 'scratch' ? 'Delete this note?' : 'Hide this portfolio note?'}</span>
            <button type="button" onClick={removeSelected} className="rounded-md px-2 py-1 text-[12px] text-white" style={{ background: '#c0504a' }}>Confirm</button>
            <button type="button" onClick={() => setConfirming(false)} className="rounded-md px-2 py-1 text-[12px]" style={{ border: '1px solid var(--hairline)' }}>Cancel</button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="rounded-md px-2 py-1 text-[12px]" style={{ border: '1px solid var(--hairline)', color: 'var(--muted)' }}>
            {selected.kind === 'scratch' ? 'Delete' : 'Hide'}
          </button>
        )}
      </div>
    </article>
  ) : (
    <div className="p-6 text-[13px]" style={{ color: 'var(--muted)' }}>Select a note, or create a scratch note with +.</div>
  );

  const categoryButtons = (['all', 'portfolio', 'scratch'] as Category[]).map((key) => (
    <button
      key={key}
      type="button"
      onClick={() => setCategory(key)}
      aria-pressed={category === key}
      className="block w-full rounded-md px-2 py-1 text-left text-[13px] capitalize"
      style={{ background: category === key ? 'var(--surface-2)' : 'transparent' }}
    >
      {key === 'scratch' ? 'Scratch (this browser)' : key}
    </button>
  ));

  return (
    <div ref={rootRef} className="flex h-full flex-col">
      <div className="flex items-center gap-2 p-2" style={{ borderBottom: '1px solid var(--hairline)' }}>
        <input
          type="search"
          aria-label="Search notes"
          placeholder="Search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-0 flex-1 rounded-md px-2 py-1 text-[13px] outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline)' }}
        />
        <button type="button" aria-label="New scratch note" title="New scratch note" onClick={addScratch} className="rounded-md px-2 py-1 text-[15px] leading-none" style={{ border: '1px solid var(--hairline)' }}>+</button>
        {hidden.length > 0 && (
          <button type="button" onClick={() => setHidden([])} className="rounded-md px-2 py-1 text-[12px]" style={{ border: '1px solid var(--hairline)' }}>Restore portfolio notes</button>
        )}
      </div>
      {wide ? (
        <div className="grid min-h-0 flex-1" style={{ gridTemplateColumns: '170px 250px 1fr' }}>
          <nav aria-label="Categories" className="space-y-1 p-2" style={{ borderRight: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>{categoryButtons}</nav>
          <div className="overflow-auto" style={{ borderRight: '1px solid var(--hairline)' }}>{list}</div>
          <div className="overflow-auto">{detail}</div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          {showDetail ? detail : (
            <>
              <div className="flex gap-1 p-2" role="group" aria-label="Categories">{categoryButtons.map((button) => <div key={button.key} className="flex-1">{button}</div>)}</div>
              {list}
            </>
          )}
        </div>
      )}
    </div>
  );
}
