import type { CSSProperties } from 'react';
import type { MusicPlayer } from './useMusicPlayer';
import { Art, C, clock, Icon, P } from './ui';

const ctl = 'flex h-9 w-9 items-center justify-center rounded-full transition-colors motion-reduce:transition-none';
const range = { accentColor: C.red } satisfies CSSProperties;

interface Props { player: MusicPlayer; queueOpen: boolean; onToggleQueue: () => void; onOpenNow: () => void }

export function PlayerBar({ player: p, queueOpen, onToggleQueue, onOpenNow }: Props) {
  const { song } = p;
  const live = p.started && p.time.duration === 0;
  const toggleStyle = (on: boolean): CSSProperties => ({ color: on ? C.text : C.sub, background: on ? C.surface2 : 'transparent' });
  return (
    <div role="group" aria-label="Now playing" className="flex h-[72px] flex-none items-center gap-4 px-4" style={{ background: C.surface, borderTop: `1px solid ${C.line}` }}>
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Previous track" onClick={p.prev} className={ctl}><Icon>{P.prev}</Icon></button>
        <button type="button" aria-label={p.playing ? 'Pause' : 'Play'} onClick={p.toggle} className={`${ctl} h-11 w-11`} style={{ background: C.text, color: C.bg }}><Icon size={26}>{p.playing ? P.pause : P.play}</Icon></button>
        <button type="button" aria-label="Next track" onClick={p.next} className={ctl}><Icon>{P.next}</Icon></button>
      </div>
      <span className="w-[84px] flex-none text-[12px] tabular-nums" style={{ color: C.sub }}>{clock(p.time.current)} / {live ? 'LIVE' : clock(p.time.duration)}</span>
      {song && (
        <button type="button" onClick={onOpenNow} aria-label={`Open now playing: ${song.title}`} className="flex min-w-0 flex-1 items-center gap-3 text-left" style={{ color: C.text }}>
          <Art id={song.youtubeId} label={song.title} size={44} />
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-medium">{song.title}</span>
            <span className="block truncate text-[12px]" style={{ color: C.sub }}>{song.artist}</span>
          </span>
        </button>
      )}
      <input type="range" aria-label="Seek" min={0} max={Math.max(1, Math.floor(p.time.duration))} step={1} value={Math.min(Math.floor(p.time.current), Math.max(1, Math.floor(p.time.duration)))} disabled={!p.started || live} onChange={(e) => p.seek(Number(e.target.value))} className="w-[220px] flex-none" style={range} />
      <label className="flex flex-none items-center gap-1" style={{ color: C.sub }}>
        <Icon size={20}>{P.vol}</Icon>
        <input type="range" aria-label="Volume" min={0} max={100} value={p.volume} onChange={(e) => p.setVolume(Number(e.target.value))} className="w-20" style={range} />
      </label>
      <button type="button" aria-label="Shuffle" aria-pressed={p.shuffle} onClick={p.toggleShuffle} className={ctl} style={toggleStyle(p.shuffle)}><Icon size={20}>{P.shuffle}</Icon></button>
      <button type="button" aria-label={`Repeat: ${p.repeat}`} aria-pressed={p.repeat !== 'off'} onClick={p.cycleRepeat} className={`${ctl} relative`} style={toggleStyle(p.repeat !== 'off')}>
        <Icon size={20}>{P.repeat}</Icon>
        {p.repeat === 'one' && <span aria-hidden="true" className="absolute text-[9px] font-bold">1</span>}
      </button>
      <button type="button" aria-label="Up next" aria-pressed={queueOpen} onClick={onToggleQueue} className={ctl} style={toggleStyle(queueOpen)}><Icon size={20}>{P.queue}</Icon></button>
    </div>
  );
}
