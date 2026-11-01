import { useEffect, useRef, useState, type FormEvent } from 'react';
import { IOT_PHOTOS, JOURNAL, READING, WATCHLIST, type Video } from '../content/diary';
import type { AppProps } from '../desktop/types';

type Tab = 'journal' | 'watch' | 'read' | 'iot';
const TABS: { id: Tab; label: string }[] = [
  { id: 'journal', label: 'Journal' },
  { id: 'watch', label: 'Watch' },
  { id: 'read', label: 'Read' },
  { id: 'iot', label: 'IoT' },
];

interface Entry {
  id: number;
  at: string;
  text: string;
}
const STORE = 'diary-entries-v1';
const MAX_ENTRIES = 50;
const MAX_TEXT = 2000;
const muted = { color: 'var(--muted)' } as const;

function loadEntries(): Entry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE) ?? '[]') as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e): e is Entry => typeof (e as Entry)?.id === 'number' && typeof (e as Entry)?.at === 'string' && typeof (e as Entry)?.text === 'string')
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

function Journal() {
  const [entries, setEntries] = useState<Entry[]>(loadEntries);
  const [draft, setDraft] = useState('');
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    try {
      localStorage.setItem(STORE, JSON.stringify(entries));
    } catch {
      // Storage blocked: entries live for this session only.
    }
  }, [entries]);
  const add = (e: FormEvent): void => {
    e.preventDefault();
    const text = draft.trim().slice(0, MAX_TEXT);
    if (!text) return;
    setEntries((all) => [{ id: Date.now(), at: new Date().toISOString(), text }, ...all].slice(0, MAX_ENTRIES));
    setDraft('');
  };
  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {JOURNAL.map((j) => (
          <article key={j.title}>
            <h3 className="m-0 text-[15px] font-semibold">{j.title}</h3>
            <p className="m-0 mt-1 text-[13.5px] leading-relaxed" style={{ color: 'var(--ink)' }}>{j.body}</p>
          </article>
        ))}
      </div>
      <section aria-label="Your notes" className="rounded-xl p-3" style={{ border: '1px solid var(--hairline)' }}>
        <h3 className="m-0 text-[12px] font-semibold uppercase" style={muted}>Your notes (saved in this browser)</h3>
        <form onSubmit={add} className="mt-2 flex gap-2">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={MAX_TEXT} rows={2} placeholder="Write something..." aria-label="New diary note" className="min-w-0 flex-1 resize-none rounded-md bg-transparent p-2 text-[13px]" style={{ border: '1px solid var(--hairline)', color: 'var(--ink)' }} />
          <button type="submit" className="self-start rounded-full px-3 py-1 text-[12px] font-medium text-white" style={{ background: 'var(--accent, #0a84ff)' }}>Add</button>
        </form>
        <ul className="m-0 mt-3 list-none space-y-2 p-0">
          {entries.map((en) => (
            <li key={en.id} className="rounded-lg p-2 text-[13px]" style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
              <p className="m-0 whitespace-pre-wrap break-words">{en.text}</p>
              <p className="m-0 mt-1 flex items-center justify-between text-[11px]" style={muted}>
                <time dateTime={en.at}>{new Date(en.at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</time>
                <button type="button" onClick={() => setEntries((all) => all.filter((x) => x.id !== en.id))} aria-label="Delete note" className="underline">Delete</button>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Watch() {
  const [playing, setPlaying] = useState<Video | null>(null);
  return (
    <div className="space-y-4">
      {playing ? (
        <div>
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
            <iframe key={playing.id} title={playing.title} src={`https://www.youtube-nocookie.com/embed/${playing.id}?autoplay=1&rel=0&playsinline=1`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full border-0" />
          </div>
          <p className="m-0 mt-2 text-[13px] font-medium">{playing.title}</p>
          <p className="m-0 text-[12px]" style={muted}>{playing.channel} · <a href={`https://www.youtube.com/watch?v=${playing.id}`} target="_blank" rel="noopener noreferrer" className="underline">Open on YouTube</a></p>
        </div>
      ) : null}
      {WATCHLIST.map((group) => (
        <section key={group.heading} aria-label={group.heading}>
          <h3 className="m-0 mb-2 text-[13px] font-semibold">{group.heading}</h3>
          <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 lg:grid-cols-3">
            {group.videos.map((v) => (
              <li key={v.id}>
                <button type="button" onClick={() => setPlaying(v)} aria-current={playing?.id === v.id} className="row-hover flex w-full flex-col gap-1 rounded-xl p-1.5 text-left">
                  <span className="relative block aspect-video w-full overflow-hidden rounded-lg" style={{ background: 'var(--surface-2)' }}>
                    <img src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
                    <span aria-hidden="true" className="absolute bottom-1 right-1 rounded px-1.5 text-[10px] font-semibold text-white" style={{ background: 'rgba(0,0,0,0.65)' }}>Play</span>
                  </span>
                  <span className="line-clamp-2 text-[12px] font-medium leading-snug">{v.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Read() {
  return (
    <ul className="m-0 list-none space-y-3 p-0">
      {READING.map((r) => (
        <li key={r.url} className="rounded-xl p-3" style={{ border: '1px solid var(--hairline)' }}>
          <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[14px] font-semibold underline">{r.title}</a>
          <p className="m-0 text-[12px]" style={muted}>{r.by}</p>
          <p className="m-0 mt-1 text-[13px]">{r.why}</p>
        </li>
      ))}
    </ul>
  );
}

function Iot() {
  return (
    <div>
      <p className="m-0 mb-3 text-[13px]" style={muted}>I like working on IoT but do not photograph it, so these are credited stock photos (Wikimedia Commons) of the kind of hardware I enjoy. Not my own builds.</p>
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-3">
        {IOT_PHOTOS.map((p) => (
          <li key={p.file}>
            <figure className="m-0">
              <img src={`/iot/${p.file}`} alt={p.title} loading="lazy" className="aspect-[4/3] w-full rounded-xl object-cover" />
              <figcaption className="mt-1 text-[11px]" style={muted}>
                {p.title} · <a href={p.page} target="_blank" rel="noopener noreferrer" className="underline">{p.artist}</a>, {p.license}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Diary(_props: AppProps) {
  const [tab, setTab] = useState<Tab>('journal');
  return (
    <div className="flex h-full flex-col" style={{ color: 'var(--ink)' }}>
      <div role="tablist" aria-label="Diary sections" className="flex flex-none gap-1 px-4 pt-3" style={{ borderBottom: '1px solid var(--hairline)' }}>
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`diary-tab-${t.id}`} aria-selected={tab === t.id} aria-controls="diary-panel" onClick={() => setTab(t.id)} className="rounded-t-lg px-3 py-1.5 text-[13px] font-medium" style={{ borderBottom: tab === t.id ? '2px solid var(--accent, #0a84ff)' : '2px solid transparent', color: tab === t.id ? 'var(--ink)' : 'var(--muted)' }}>
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="diary-panel" aria-labelledby={`diary-tab-${tab}`} className="min-h-0 flex-1 overflow-y-auto p-4">
        {tab === 'journal' ? <Journal /> : tab === 'watch' ? <Watch /> : tab === 'read' ? <Read /> : <Iot />}
      </div>
    </div>
  );
}
