import { useState, type KeyboardEvent } from 'react';
import { songs } from '../content/songs';
import type { AppProps } from '../desktop/types';
import { QueuePanel, Sidebar, TopBar, type View } from './music/Chrome';
import { PlayerBar } from './music/PlayerBar';
import { MainView } from './music/Views';
import { C } from './music/ui';
import { useMusicPlayer, YT_ORIGIN } from './music/useMusicPlayer';

const INTERACTIVE = new Set(['BUTTON', 'INPUT', 'A', 'TEXTAREA']);

export default function Music(_props: AppProps) {
  const player = useMusicPlayer();
  const [view, setView] = useState<View>('home');
  const [query, setQuery] = useState('');
  const [queueOpen, setQueueOpen] = useState(true);
  const { song, firstId } = player;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key !== ' ' || INTERACTIVE.has((e.target as HTMLElement).tagName)) return;
    e.preventDefault();
    player.toggle();
  };

  if (!song) return <p className="p-6 text-sm" style={{ color: C.sub }}>The playlist is empty. Add songs in src/content/songs.ts.</p>;
  const src = firstId ? `${YT_ORIGIN}/embed/${firstId}?enablejsapi=1&autoplay=1&playsinline=1&rel=0&origin=${encodeURIComponent(window.location.origin)}` : null;

  return (
    <div tabIndex={-1} onKeyDown={onKeyDown} className="flex h-full flex-col outline-none" style={{ background: C.bg, color: C.text }}>
      <TopBar query={query} onQuery={setQuery} />
      <div className="flex min-h-0 flex-1">
        <Sidebar view={view} onView={(v) => { setView(v); setQuery(''); }}>
          {/* The player stays mounted (fixed src; tracks change via loadVideoById) so playback survives UI changes. */}
          <div className="aspect-video w-full overflow-hidden rounded-lg" style={{ background: C.surface2 }}>
            {src && <iframe ref={player.frame} onLoad={player.onFrameLoad} title="YouTube player" src={src} allow="autoplay; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full border-0" />}
          </div>
          {player.blockedId && (
            <p role="alert" className="m-0 mt-2 text-[12px]" style={{ color: C.sub }}>
              This track can't play here -{' '}
              <a href={`https://music.youtube.com/watch?v=${player.blockedId}`} target="_blank" rel="noopener noreferrer" style={{ color: C.text, textDecoration: 'underline' }}>open in YouTube Music</a>
            </p>
          )}
        </Sidebar>
        <main className="min-w-0 flex-1 overflow-auto" style={{ background: C.surface }}>
          <MainView player={player} view={view} query={query} />
        </main>
        {queueOpen && <QueuePanel player={player} />}
      </div>
      <PlayerBar player={player} queueOpen={queueOpen} onToggleQueue={() => setQueueOpen((o) => !o)} onOpenNow={() => setView('now')} />
    </div>
  );
}
