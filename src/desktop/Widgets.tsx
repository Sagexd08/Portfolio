import { lazy, Suspense, useState, useSyncExternalStore, type ReactNode } from 'react';
import { profile } from '../content/portfolio';
import { songs } from '../content/songs';
import { launchApp } from './store';
import { BatteryCard, CalendarCard, FocusCard, GoalsCard, StackCard, WorldClockCard } from './widgets/Cards';
import { Card, btn, btnStyle, muted } from './widgets/Card';
import { DEFAULT_ORDER, WIDGET_LABELS, resetWidgetPrefs, setAccent, toggleWidget, useWidgetPrefs, type WidgetId } from './widgets/prefs';
import './desktop.css';

const MiniMe = lazy(() => import('./widgets/MiniMe'));

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

const ACCENTS = ['#4b6ea6', '#0a84ff', '#ff375f', '#30d158', '#bf5af2', '#ff9f0a'];

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

function EditPanel({ on }: { on: readonly WidgetId[] }) {
  return (
    <Card label="Edit widgets">
      <ul className="m-0 list-none space-y-1 p-0">
        {DEFAULT_ORDER.map((id) => (
          <li key={id}>
            <label className="flex items-center gap-2 text-[12.5px]">
              <input type="checkbox" checked={on.includes(id)} onChange={() => toggleWidget(id)} />
              {WIDGET_LABELS[id]}
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-1" role="group" aria-label="Accent color">
        <span className="mr-1 text-[10.5px]" style={muted}>Accent</span>
        {ACCENTS.map((c) => (
          <button key={c} type="button" aria-label={`Accent ${c}`} onClick={() => setAccent(c === ACCENTS[0] ? null : c)} className="h-4 w-4 rounded-full" style={{ background: c, outline: '1px solid rgba(255,255,255,0.4)' }} />
        ))}
      </div>
      <button type="button" onClick={resetWidgetPrefs} className="mt-2 text-[10.5px] underline" style={muted}>Reset all</button>
    </Card>
  );
}

function renderWidget(id: WidgetId, now: Date): ReactNode {
  const song = songs[0];
  switch (id) {
    case 'minime':
      return <Suspense fallback={<Card label="Mini me"><p className="m-0 h-[190px] text-[12px]" style={muted}>Loading 3D…</p></Card>}><MiniMe /></Suspense>;
    case 'clock':
      return (
        <Card label="Clock">
          <p className="m-0 text-[34px] font-semibold tabular-nums leading-none">{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
          <p className="m-0 mt-1 text-[12px]" style={muted}>{now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </Card>
      );
    case 'calendar':
      return <CalendarCard now={now} />;
    case 'worldclock':
      return <WorldClockCard now={now} />;
    case 'focus':
      return <FocusCard />;
    case 'goals':
      return <GoalsCard />;
    case 'stack':
      return <StackCard />;
    case 'battery':
      return <BatteryCard />;
    case 'music':
      return (
        <Card label="Now playing">
          <p className="m-0 truncate text-[13px] font-semibold">{song.title}</p>
          <p className="m-0 truncate text-[12px]" style={muted}>{song.artist}</p>
          <button type="button" onClick={() => launchApp('music')} className={btn} style={btnStyle}>Open Music</button>
        </Card>
      );
    case 'github':
      return (
        <Card label="GitHub">
          <p className="m-0 text-[13px] font-semibold">@Sagexd08</p>
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className={btn} style={btnStyle}>View profile</a>
        </Card>
      );
    case 'inference':
      return (
        <Card label="Inference (demo)">
          <dl className="m-0 grid grid-cols-2 gap-x-2 text-[12px]">
            <dt style={muted}>Latency p50</dt><dd className="m-0 text-right tabular-nums">42 ms</dd>
            <dt style={muted}>Throughput</dt><dd className="m-0 text-right tabular-nums">118 tok/s</dd>
            <dt style={muted}>Batch</dt><dd className="m-0 text-right tabular-nums">8</dd>
          </dl>
          <p className="m-0 mt-2 text-[10px]" style={muted}>Demo numbers, not live.</p>
        </Card>
      );
  }
}

export function Widgets() {
  const shown = useWidgetsVisible();
  const second = useSecond();
  const { on } = useWidgetPrefs();
  const [editing, setEditing] = useState(false);
  if (!shown) return null;
  const now = new Date(second * 1000);
  return (
    <aside
      aria-label="Widgets"
      className="widget-column fixed top-[40px] z-[1] hidden flex-col gap-3 overflow-y-auto min-[1280px]:flex"
      style={{ right: WIDGET_RIGHT, width: WIDGET_WIDTH, maxHeight: 'calc(100vh - 140px)' }}
    >
      {DEFAULT_ORDER.filter((id) => on.includes(id)).map((id) => <div key={id}>{renderWidget(id, now)}</div>)}
      {editing ? <EditPanel on={on} /> : null}
      <button type="button" onClick={() => setEditing((e) => !e)} aria-expanded={editing} className="self-center rounded-full px-3 py-1 text-[11px] font-medium glass" style={{ color: 'var(--ink)' }}>
        {editing ? 'Done' : 'Edit widgets'}
      </button>
    </aside>
  );
}
