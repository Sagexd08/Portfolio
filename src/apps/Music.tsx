import { useCallback, useEffect, useRef, useState } from 'react';
import { songs } from '../content/songs';
import type { AppProps } from '../desktop/types';

const YT_ORIGIN = 'https://www.youtube-nocookie.com';
const PLAYING_STATE = 1;

function artGradient(id: string): string {
  const hue = [...id].reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) % 360, 7);
  return `linear-gradient(145deg, hsl(${hue} 70% 55%), hsl(${(hue + 50) % 360} 65% 32%))`;
}

function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function Art({ id, size, label }: { id: string; size: number; label: string }) {
  return (
    <span aria-hidden="true" className="flex flex-none items-center justify-center rounded-lg text-white" style={{ width: size, height: size, background: artGradient(id), fontSize: size / 2.6, fontWeight: 600, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)' }}>
      {label[0]?.toUpperCase()}
    </span>
  );
}

const PLAY = <path d="M8 5.5v13l11-6.5z" />;
const PAUSE = <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />;

function Icon({ size = 18, children }: { size?: number; children: React.ReactNode }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{children}</svg>;
}

export default function Music(_props: AppProps) {
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const frame = useRef<HTMLIFrameElement>(null);
  const song = songs[index];

  const post = useCallback((payload: object): void => {
    frame.current?.contentWindow?.postMessage(JSON.stringify(payload), YT_ORIGIN);
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent): void => {
      if (event.origin !== YT_ORIGIN || typeof event.data !== 'string') return;
      try {
        const data = JSON.parse(event.data) as { event?: string; info?: { currentTime?: number; duration?: number; playerState?: number } };
        if (data.event !== 'infoDelivery' || !data.info) return;
        const { currentTime, duration, playerState } = data.info;
        if (typeof playerState === 'number') setPlaying(playerState === PLAYING_STATE);
        if (typeof currentTime === 'number') setTime((prev) => ({ current: currentTime, duration: duration ?? prev.duration }));
      } catch {
        // Ignore non-JSON messages from the player.
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const select = (next: number): void => {
    setIndex((next + songs.length) % songs.length);
    setStarted(true);
    setPlaying(true);
    setTime({ current: 0, duration: 0 });
  };
  const toggle = (): void => {
    if (!started) return select(index);
    post({ event: 'command', func: playing ? 'pauseVideo' : 'playVideo', args: [] });
    setPlaying(!playing);
  };

  if (!song) return <p className="p-6 text-sm" style={{ color: 'var(--muted)' }}>The playlist is empty. Add songs in src/content/songs.ts.</p>;
  const live = started && time.duration === 0;
  const pct = time.duration === 0 ? 0 : Math.min(100, (time.current / time.duration) * 100);
  const src = `${YT_ORIGIN}/embed/${song.youtubeId}?enablejsapi=1&autoplay=1&playsinline=1&rel=0&origin=${encodeURIComponent(window.location.origin)}`;

  return (
    <div className="flex h-full flex-col" style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--accent) 18%, var(--surface)), var(--surface) 60%)', color: 'var(--ink)' }}>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4 sm:flex-row">
        <div className="flex-none sm:w-[340px]">
          <div className="aspect-video w-full overflow-hidden rounded-xl" style={{ background: artGradient(song.youtubeId), boxShadow: '0 12px 30px rgba(0,0,0,0.3)' }}>
            {started ? (
              <iframe key={song.youtubeId} ref={frame} onLoad={() => post({ event: 'listening', id: 1, channel: 'widget' })} title={`${song.title} (YouTube player)`} src={src} allow="autoplay; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full border-0" />
            ) : (
              <button type="button" onClick={toggle} aria-label={`Play ${song.title}`} className="flex h-full w-full items-center justify-center text-white"><Icon size={56}>{PLAY}</Icon></button>
            )}
          </div>
          <h2 className="m-0 mt-3 text-[16px] font-semibold leading-snug">{song.title}</h2>
          <p className="m-0 text-[13px]" style={{ color: 'var(--muted)' }}>{song.artist}</p>
          <a href={`https://music.youtube.com/watch?v=${song.youtubeId}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block rounded-full px-3 py-1 text-[12.5px] font-medium" style={{ background: 'var(--ink)', color: 'var(--surface)' }}>
            Open in YouTube Music
          </a>
        </div>
        <section aria-label="Queue" className="min-w-0 flex-1">
          <h3 className="m-0 mb-2 text-[12px] font-semibold uppercase" style={{ color: 'var(--muted)' }}>Up next</h3>
          <ul className="m-0 list-none space-y-1 p-0">
            {songs.map((item, i) => (
              <li key={item.youtubeId}>
                <button type="button" aria-current={i === index} onClick={() => select(i)} className="row-hover flex w-full items-center gap-3 rounded-xl p-2 text-left" style={{ background: i === index ? 'color-mix(in srgb, var(--accent) 22%, transparent)' : undefined }}>
                  <Art id={item.youtubeId} size={44} label={item.title} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium">{item.title}</span>
                    <span className="block truncate text-[12px]" style={{ color: 'var(--muted)' }}>{item.artist}</span>
                  </span>
                  {i === index && playing && <span className="text-[11px]" style={{ color: 'var(--accent)' }}>Playing</span>}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="flex flex-none items-center gap-4 px-4 py-3" role="group" aria-label="Now playing" style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--hairline)' }}>
        <div className="flex min-w-0 items-center gap-3 sm:w-[240px]">
          <Art id={song.youtubeId} size={40} label={song.title} />
          <span className="min-w-0"><span className="block truncate text-[13px] font-medium">{song.title}</span><span className="block truncate text-[11.5px]" style={{ color: 'var(--muted)' }}>{song.artist}</span></span>
        </div>
        <div className="flex flex-none items-center gap-1">
          <button type="button" aria-label="Previous track" onClick={() => select(index - 1)} className="ctl"><Icon><path d="M6 5h2v14H6zM20 5v14L9 12z" /></Icon></button>
          <button type="button" aria-label={playing ? 'Pause' : 'Play'} onClick={toggle} className="ctl ctl-main"><Icon size={20}>{playing ? PAUSE : PLAY}</Icon></button>
          <button type="button" aria-label="Next track" onClick={() => select(index + 1)} className="ctl"><Icon><path d="M16 5h2v14h-2zM4 5l11 7-11 7z" /></Icon></button>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 text-[11px]" style={{ color: 'var(--muted)' }}>
          <span className="w-9 text-right tabular-nums">{started ? clock(time.current) : '0:00'}</span>
          <div role="progressbar" aria-label="Playback progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} className="h-1 min-w-0 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--hairline)' }}>
            <div className="h-full rounded-full" style={{ width: `${live ? 100 : pct}%`, background: 'var(--accent)', opacity: live ? 0.5 : 1 }} />
          </div>
          <span className="w-9 tabular-nums">{live ? 'LIVE' : clock(time.duration)}</span>
        </div>
      </div>
    </div>
  );
}
