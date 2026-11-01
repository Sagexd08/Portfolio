import type { ReactNode } from 'react';
import { songs } from '../../content/songs';
import type { MusicPlayer } from './useMusicPlayer';
import { Art, C, Icon, P } from './ui';

export type View = 'home' | 'explore' | 'library' | 'now';

export function TopBar({ query, onQuery }: { query: string; onQuery: (q: string) => void }) {
  return (
    <header className="flex h-16 flex-none items-center gap-4 px-4" style={{ background: C.bg, borderBottom: `1px solid ${C.line}` }}>
      <span className="flex w-[208px] flex-none items-center gap-2 text-[18px] font-semibold">
        <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: C.red }}><Icon size={16}>{P.play}</Icon></span>
        Music
      </span>
      <label className="flex h-10 max-w-[480px] flex-1 items-center gap-2 rounded-lg px-3" style={{ background: C.surface2, color: C.sub }}>
        <Icon size={20}>{P.search}</Icon>
        <input type="search" value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search songs, artists" aria-label="Search songs" className="min-w-0 flex-1 border-0 bg-transparent text-[14px] outline-none" style={{ color: C.text }} />
      </label>
    </header>
  );
}

const NAV: { id: View; label: string; icon: ReactNode }[] = [
  { id: 'home', label: 'Home', icon: P.home },
  { id: 'explore', label: 'Explore', icon: P.explore },
  { id: 'library', label: 'Library', icon: P.library },
];

export function Sidebar({ view, onView, children }: { view: View; onView: (v: View) => void; children: ReactNode }) {
  return (
    <nav aria-label="Music navigation" className="flex w-[240px] flex-none flex-col gap-1 p-3" style={{ background: C.bg, borderRight: `1px solid ${C.line}` }}>
      {NAV.map((item) => (
        <button key={item.id} type="button" aria-current={view === item.id ? 'page' : undefined} onClick={() => onView(item.id)} className="flex items-center gap-4 rounded-lg px-3 py-2 text-left text-[14px] font-medium transition-colors motion-reduce:transition-none" style={{ background: view === item.id ? C.surface2 : 'transparent', color: C.text }}>
          <Icon>{item.icon}</Icon>{item.label}
        </button>
      ))}
      <hr className="my-2 w-full border-0" style={{ height: 1, background: C.line }} />
      <button type="button" onClick={() => onView('library')} className="rounded-lg px-3 py-2 text-left text-[14px]" style={{ color: C.sub }}>Your favourites</button>
      <div className="mt-auto">{children}</div>
    </nav>
  );
}

export function QueuePanel({ player }: { player: MusicPlayer }) {
  const { queue, pos, playing, playSong } = player;
  return (
    <aside aria-label="Up next" className="flex w-[320px] flex-none flex-col" style={{ background: C.surface, borderLeft: `1px solid ${C.line}` }}>
      <h2 className="m-0 px-4 py-3 text-[14px] font-semibold">Up next</h2>
      <ol className="m-0 min-h-0 flex-1 list-none overflow-auto p-0">
        {queue.map((idx, i) => {
          const s = songs[idx];
          if (!s) return null;
          return (
            <li key={s.youtubeId}>
              <button type="button" aria-current={i === pos} onClick={() => playSong(idx)} className="flex w-full items-center gap-3 px-4 py-2 text-left" style={{ background: i === pos ? C.surface2 : 'transparent', color: C.text }}>
                <Art id={s.youtubeId} label={s.title} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{s.title}</span>
                  <span className="block truncate text-[12px]" style={{ color: C.sub }}>{i === pos && playing ? 'Playing - ' : ''}{s.artist}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
