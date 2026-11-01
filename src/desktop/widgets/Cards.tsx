import { useEffect, useRef, useState, type FormEvent } from 'react';
import { skills } from '../../content/portfolio';
import { Card, btn, btnStyle, muted } from './Card';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CalendarCard({ now }: { now: Date }) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const lead = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const cells = [...Array.from({ length: lead }, () => 0), ...Array.from({ length: count }, (_, i) => i + 1)];
  return (
    <Card label={now.toLocaleDateString([], { month: 'long', year: 'numeric' })}>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px]" role="grid" aria-label="Calendar">
        {DAYS.map((d, i) => <span key={i} style={muted}>{d}</span>)}
        {cells.map((d, i) => (
          <span
            key={i}
            role="gridcell"
            aria-current={d === now.getDate() ? 'date' : undefined}
            className="mx-auto flex h-[22px] w-[22px] items-center justify-center rounded-full tabular-nums"
            style={d === now.getDate() ? { background: 'var(--accent, #0a84ff)', color: '#fff', fontWeight: 600 } : undefined}
          >
            {d || ''}
          </span>
        ))}
      </div>
    </Card>
  );
}

const ZONES = [
  { city: 'Kolkata', zone: 'Asia/Kolkata', tag: 'Home' },
  { city: 'San Francisco', zone: 'America/Los_Angeles', tag: 'Favorite' },
  { city: 'New York', zone: 'America/New_York', tag: 'Favorite' },
] as const;

export function WorldClockCard({ now }: { now: Date }) {
  return (
    <Card label="World clocks">
      <ul className="m-0 list-none space-y-2 p-0">
        {ZONES.map((z) => {
          const hour = Number(now.toLocaleTimeString('en-GB', { timeZone: z.zone, hour: '2-digit', hour12: false }));
          const day = hour >= 6 && hour < 18;
          return (
            <li key={z.zone} className="flex items-center gap-2">
              <span aria-hidden="true">{day ? '☀️' : '🌙'}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">{z.city}</span>
                <span className="block text-[10px]" style={muted}>{z.tag}</span>
              </span>
              <span className="text-[15px] font-semibold tabular-nums">{now.toLocaleTimeString([], { timeZone: z.zone, hour: 'numeric', minute: '2-digit' })}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

const FOCUS_SECONDS = 25 * 60;
const clock = (s: number): string => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export function FocusCard() {
  const [left, setLeft] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return undefined;
    const id = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (left === 0) {
      setRunning(false);
      setLeft(FOCUS_SECONDS);
    }
  }, [left]);
  return (
    <Card label="Focus timer">
      <p className="m-0 text-[30px] font-semibold tabular-nums leading-none" aria-live="off">{clock(left)}</p>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => setRunning((r) => !r)} className={btn.replace('mt-2 ', '')} style={btnStyle}>{running ? 'Pause' : 'Start'}</button>
        <button type="button" onClick={() => { setRunning(false); setLeft(FOCUS_SECONDS); }} className="rounded-full px-3 py-1 text-[12px]" style={{ border: '1px solid var(--hairline)' }}>Reset</button>
      </div>
    </Card>
  );
}

interface Goal {
  text: string;
  done: boolean;
}
const GOALS_KEY = 'desktop-goals-v1';
const DEFAULT_GOALS: Goal[] = [
  { text: 'Ship something I am proud of', done: false },
  { text: 'Land a forward-deployed / ML role', done: false },
  { text: 'Evaluate before I celebrate', done: true },
];

function loadGoals(): Goal[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(GOALS_KEY) ?? 'null') as unknown;
    if (!Array.isArray(parsed)) return DEFAULT_GOALS;
    return parsed.filter((g): g is Goal => typeof (g as Goal)?.text === 'string' && typeof (g as Goal)?.done === 'boolean').slice(0, 8);
  } catch {
    return DEFAULT_GOALS;
  }
}

export function GoalsCard() {
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  const [draft, setDraft] = useState('');
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    try {
      localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    } catch {
      // Storage blocked: goals live for this session only.
    }
  }, [goals]);
  const add = (e: FormEvent): void => {
    e.preventDefault();
    const text = draft.trim().slice(0, 60);
    if (text && goals.length < 8) setGoals([...goals, { text, done: false }]);
    setDraft('');
  };
  return (
    <Card label="Goals">
      <ul className="m-0 list-none space-y-1 p-0">
        {goals.map((g, i) => (
          <li key={i} className="flex items-center gap-2 text-[12.5px]">
            <input type="checkbox" checked={g.done} aria-label={g.text} onChange={() => setGoals(goals.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))} />
            <span className="min-w-0 flex-1" style={g.done ? { textDecoration: 'line-through', opacity: 0.55 } : undefined}>{g.text}</span>
            <button type="button" aria-label={`Remove ${g.text}`} onClick={() => setGoals(goals.filter((_, j) => j !== i))} className="px-1" style={muted}>×</button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="mt-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={60} placeholder="Add a goal" aria-label="Add a goal" className="w-full rounded-md bg-transparent px-2 py-1 text-[12px]" style={{ border: '1px solid var(--hairline)', color: 'var(--ink)' }} />
      </form>
    </Card>
  );
}

export function StackCard() {
  const top = skills.slice(0, 4);
  return (
    <Card label="Tech stack">
      <div className="space-y-2">
        {top.map((g) => (
          <div key={g.group}>
            <p className="m-0 text-[10.5px] font-semibold uppercase" style={muted}>{g.group}</p>
            <p className="m-0 flex flex-wrap gap-1 pt-1">
              {g.items.slice(0, 5).map((s) => <span key={s} className="rounded-full px-2 py-[1px] text-[11px]" style={{ background: 'color-mix(in srgb, var(--accent) 18%, transparent)' }}>{s}</span>)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

interface BatteryLike {
  level: number;
  charging: boolean;
}

export function BatteryCard() {
  const [b, setB] = useState<BatteryLike | null>(null);
  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryLike & EventTarget> };
    if (!nav.getBattery) return undefined;
    let dead = false;
    let cleanup: (() => void) | undefined;
    void nav.getBattery().then((bat) => {
      if (dead) return;
      const read = (): void => setB({ level: bat.level, charging: bat.charging });
      read();
      bat.addEventListener('levelchange', read);
      bat.addEventListener('chargingchange', read);
      cleanup = () => {
        bat.removeEventListener('levelchange', read);
        bat.removeEventListener('chargingchange', read);
      };
    });
    return () => {
      dead = true;
      cleanup?.();
    };
  }, []);
  const pct = Math.round((b?.level ?? 1) * 100);
  return (
    <Card label="Battery">
      <p className="m-0 text-[26px] font-semibold tabular-nums leading-none">{pct}%</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ background: 'var(--hairline)' }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Battery level">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct <= 20 && !b?.charging ? '#ff453a' : '#30d158' }} />
      </div>
      <p className="m-0 mt-1 text-[11px]" style={muted}>{b ? (b.charging ? 'Charging' : 'On battery') : 'Power Adapter (this browser hides battery info)'}</p>
    </Card>
  );
}
