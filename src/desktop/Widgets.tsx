import { useSyncExternalStore, type ReactNode } from 'react';
import { profile } from '../content/portfolio';
import { songs } from '../content/songs';
import { launchApp } from './store';
import './desktop.css';

const KEY = 'desktop-widgets';
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}
let visible = read();

export const widgetsVisible = (): boolean => visible;
export function toggleWidgets(): void {
  visible = !visible;
  try {
    localStorage.setItem(KEY, visible ? 'on' : 'off');
  } catch {
    // Storage blocked: the toggle still works for this session.
  }
  listeners.forEach((l) => l());
}
export function useWidgetsVisible(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => visible,
    () => true,
  );
}

/** Layout contract shared with the first-load tiler. */
export const WIDGET_WIDTH = 252;
export const WIDGET_RIGHT = 108;
export const WIDGET_MIN_VIEWPORT = 1280;

const muted = { color: 'var(--muted)' } as const;
const btn = 'mt-2 inline-block rounded-full px-3 py-1 text-[12px] font-medium text-white no-underline';
const btnStyle = { background: 'var(--accent, #0a84ff)' } as const;

function Card({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section aria-label={label} className="widget glass p-4" style={{ color: 'var(--ink)' }}>
      <h2 className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-wide" style={muted}>{label}</h2>
      {children}
    </section>
  );
}

function useSecond(): number {
  return useSyncExternalStore(
    (l) => {
      const id = window.setInterval(l, 1000);
      return () => window.clearInterval(id);
    },
    () => Math.floor(Date.now() / 1000),
    () => 0,
  );
}

export function Widgets() {
  const shown = useWidgetsVisible();
  const second = useSecond();
  if (!shown) return null;
  const now = new Date(second * 1000);
  const song = songs[0];
  return (
    <aside
      aria-label="Widgets"
      className="fixed top-[40px] z-[1] hidden flex-col gap-3 min-[1280px]:flex"
      style={{ right: WIDGET_RIGHT, width: WIDGET_WIDTH }}
    >
      <Card label="Clock">
        <p className="m-0 text-[34px] font-semibold tabular-nums leading-none">{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
        <p className="m-0 mt-1 text-[12px]" style={muted}>{now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </Card>
      <Card label="Local time">
        <p className="m-0 text-[22px] font-semibold tabular-nums">{now.toLocaleTimeString([], { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' })}</p>
        <p className="m-0 text-[12px]" style={muted}>Kolkata, India (IST)</p>
      </Card>
      <Card label="Now playing">
        <p className="m-0 truncate text-[13px] font-semibold">{song.title}</p>
        <p className="m-0 truncate text-[12px]" style={muted}>{song.artist}</p>
        <button type="button" onClick={() => launchApp('music')} className={btn} style={btnStyle}>Open Music</button>
      </Card>
      <Card label="GitHub">
        <p className="m-0 text-[13px] font-semibold">@Sagexd08</p>
        <a href={profile.github} target="_blank" rel="noopener noreferrer" className={btn} style={btnStyle}>View profile</a>
      </Card>
      <Card label="Inference (demo)">
        <dl className="m-0 grid grid-cols-2 gap-x-2 text-[12px]">
          <dt style={muted}>Latency p50</dt><dd className="m-0 text-right tabular-nums">42 ms</dd>
          <dt style={muted}>Throughput</dt><dd className="m-0 text-right tabular-nums">118 tok/s</dd>
          <dt style={muted}>Batch</dt><dd className="m-0 text-right tabular-nums">8</dd>
        </dl>
        <p className="m-0 mt-2 text-[10px]" style={muted}>Demo numbers, not live.</p>
      </Card>
    </aside>
  );
}
