import { useEffect, useRef, useState } from 'react';
import { songs } from '../../content/songs';

export const YT_ORIGIN = 'https://www.youtube-nocookie.com';
export type RepeatMode = 'off' | 'all' | 'one';

const STATE_ENDED = 0;
const STATE_PLAYING = 1;
const STATE_PAUSED = 2;
const BLOCKED_ERRORS = new Set([101, 150]);
const SKIP_DELAY_MS = 2500;
const RESTART_THRESHOLD_S = 3;
const inOrder = (): number[] => songs.map((_, i) => i);

function shuffled(rest: number[]): number[] {
  const out = [...rest];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

interface PlayerMessage { event?: string; info?: unknown }
interface Info { currentTime?: number; duration?: number; playerState?: number }

export function useMusicPlayer() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [queue, setQueue] = useState<number[]>(inOrder);
  const [pos, setPos] = useState(0);
  const [firstId, setFirstId] = useState<string | null>(null); // iframe src is fixed once mounted
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [volume, setVolumeState] = useState(80);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [blockedId, setBlockedId] = useState<string | null>(null);
  const lastState = useRef(-2);
  const streak = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const fns = useRef({ ended: () => {}, fail: (_code: number) => {} });

  const songIndex = queue[pos] ?? 0;
  const song = songs[songIndex];
  const started = firstId !== null;

  const post = (payload: object): void => {
    frame.current?.contentWindow?.postMessage(JSON.stringify(payload), YT_ORIGIN);
  };
  const command = (func: string, args: unknown[] = []): void => post({ event: 'command', func, args });

  const go = (nextPos: number): void => {
    window.clearTimeout(timer.current);
    const id = songs[queue[nextPos] ?? 0]?.youtubeId;
    if (!id) return;
    setPos(nextPos);
    setPlaying(true);
    setBlockedId(null);
    setTime({ current: 0, duration: 0 });
    if (firstId === null) setFirstId(id);
    else command('loadVideoById', [id]);
  };

  const step = (dir: 1 | -1, auto: boolean): void => {
    let n = pos + dir;
    if (n >= queue.length || n < 0) {
      if (auto && repeat !== 'all') { setPlaying(false); return; }
      n = (n + queue.length) % queue.length;
    }
    go(n);
  };

  const seek = (sec: number): void => {
    command('seekTo', [sec, true]);
    setTime((t) => ({ ...t, current: sec }));
  };
  const playSong = (idx: number): void => go(Math.max(0, queue.indexOf(idx)));
  const next = (): void => step(1, false);
  const prev = (): void => (time.current > RESTART_THRESHOLD_S ? seek(0) : step(-1, false));
  const toggle = (): void => {
    if (!started) return go(pos);
    command(playing ? 'pauseVideo' : 'playVideo');
    setPlaying(!playing);
  };
  const setVolume = (v: number): void => {
    setVolumeState(v);
    command('setVolume', [v]);
  };
  const toggleShuffle = (): void => {
    const rest = inOrder().filter((i) => i !== songIndex);
    setQueue(shuffle ? inOrder() : [songIndex, ...shuffled(rest)]);
    setPos(shuffle ? songIndex : 0);
    setShuffle(!shuffle);
  };
  const cycleRepeat = (): void => setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));
  const onFrameLoad = (): void => {
    post({ event: 'listening', id: 1, channel: 'widget' });
    command('setVolume', [volume]);
  };

  fns.current = {
    ended: () => {
      if (repeat === 'one') { command('seekTo', [0, true]); command('playVideo'); } else step(1, true);
    },
    fail: (code) => {
      if (!BLOCKED_ERRORS.has(code) || !song) return;
      setBlockedId(song.youtubeId);
      setPlaying(false);
      streak.current += 1;
      if (streak.current >= queue.length) return; // every track failed: stop skipping
      timer.current = window.setTimeout(() => step(1, true), SKIP_DELAY_MS);
    },
  };

  useEffect(() => {
    const onMessage = (event: MessageEvent): void => {
      if (event.origin !== YT_ORIGIN || event.source !== frame.current?.contentWindow || typeof event.data !== 'string') return;
      let msg: PlayerMessage;
      try { msg = JSON.parse(event.data) as PlayerMessage; } catch { return; }
      if (msg.event === 'onError' && typeof msg.info === 'number') return fns.current.fail(msg.info);
      let state: number | undefined;
      if (msg.event === 'onStateChange' && typeof msg.info === 'number') state = msg.info;
      if (msg.event === 'infoDelivery' && msg.info && typeof msg.info === 'object') {
        const info = msg.info as Info;
        state = info.playerState;
        const cur = info.currentTime;
        if (typeof cur === 'number') setTime((t) => ({ current: cur, duration: info.duration ?? t.duration }));
      }
      if (typeof state !== 'number' || state === lastState.current) return;
      lastState.current = state;
      if (state === STATE_PLAYING) streak.current = 0;
      if (state === STATE_PLAYING || state === STATE_PAUSED) setPlaying(state === STATE_PLAYING);
      if (state === STATE_ENDED) fns.current.ended();
    };
    window.addEventListener('message', onMessage);
    return () => { window.removeEventListener('message', onMessage); window.clearTimeout(timer.current); };
  }, []);

  return { frame, queue, pos, song, firstId, started, playing, time, volume, shuffle, repeat, blockedId, playSong, next, prev, toggle, seek, setVolume, toggleShuffle, cycleRepeat, onFrameLoad };
}

export type MusicPlayer = ReturnType<typeof useMusicPlayer>;
