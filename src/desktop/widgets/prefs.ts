import { useSyncExternalStore } from 'react';

export type WidgetId = 'clock' | 'calendar' | 'worldclock' | 'minime' | 'focus' | 'goals' | 'stack' | 'battery' | 'music' | 'github' | 'inference';

export const WIDGET_LABELS: Record<WidgetId, string> = {
  clock: 'Clock',
  calendar: 'Calendar',
  worldclock: 'World clocks',
  minime: 'Sage (mascot)',
  focus: 'Focus timer',
  goals: 'Goals',
  stack: 'Tech stack',
  battery: 'Battery',
  music: 'Now playing',
  github: 'GitHub',
  inference: 'Inference (demo)',
};

export const DEFAULT_ORDER: readonly WidgetId[] = ['minime', 'clock', 'calendar', 'worldclock', 'music', 'focus', 'goals', 'stack', 'battery', 'github', 'inference'];
const DEFAULT_ON: readonly WidgetId[] = ['minime', 'clock', 'calendar', 'worldclock', 'music', 'goals'];

export interface MiniMeStyle {
  shirt: string;
  skin: string;
  hair: string;
}
export const DEFAULT_STYLE: MiniMeStyle = { shirt: '#b3262e', skin: '#cf9870', hair: '#1b1613' };

interface Prefs {
  on: WidgetId[];
  accent: string | null;
  style: MiniMeStyle;
}

const KEY = 'desktop-widget-prefs-v1';
const HEX = /^#[0-9a-f]{6}$/i;
const listeners = new Set<() => void>();

function load(): Prefs {
  const fallback: Prefs = { on: [...DEFAULT_ON], accent: null, style: DEFAULT_STYLE };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    const on = Array.isArray(parsed.on) ? parsed.on.filter((id): id is WidgetId => id in WIDGET_LABELS) : fallback.on;
    const accent = typeof parsed.accent === 'string' && HEX.test(parsed.accent) ? parsed.accent : null;
    const style: MiniMeStyle = { ...DEFAULT_STYLE };
    for (const k of ['shirt', 'skin', 'hair'] as const) {
      const v = parsed.style?.[k];
      if (typeof v === 'string' && HEX.test(v)) style[k] = v;
    }
    return { on, accent, style };
  } catch {
    return fallback;
  }
}

let prefs: Prefs = load();

function applyAccent(): void {
  if (typeof document === 'undefined') return;
  if (prefs.accent) document.documentElement.style.setProperty('--accent', prefs.accent);
  else document.documentElement.style.removeProperty('--accent');
}
applyAccent();

function commit(next: Prefs): void {
  prefs = next;
  applyAccent();
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // Storage blocked: personalization still works for this session.
  }
  listeners.forEach((l) => l());
}

export const toggleWidget = (id: WidgetId): void => commit({ ...prefs, on: prefs.on.includes(id) ? prefs.on.filter((x) => x !== id) : [...prefs.on, id] });
export const setAccent = (accent: string | null): void => commit({ ...prefs, accent });
export const setMiniMeStyle = (patch: Partial<MiniMeStyle>): void => commit({ ...prefs, style: { ...prefs.style, ...patch } });
export const resetWidgetPrefs = (): void => commit({ on: [...DEFAULT_ON], accent: null, style: DEFAULT_STYLE });

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
export function useWidgetPrefs(): Prefs {
  return useSyncExternalStore(subscribe, () => prefs, () => prefs);
}
