import { useSyncExternalStore } from 'react';

export type Theme = 'auto' | 'light' | 'dark';
export interface Prefs {
  theme: Theme;
  dnd: boolean;
  reduceMotion: boolean;
  wallpaper: string;
}

export const WALLPAPERS: { key: string; label: string }[] = [
  { key: 'sonoma', label: 'Sonoma' },
  { key: 'sequoia', label: 'Sequoia' },
  { key: 'monterey', label: 'Monterey' },
  { key: 'big-sur', label: 'Big Sur' },
  { key: 'graphite', label: 'Graphite' },
];

const KEY = 'portfolio.prefs.v1';
const DEFAULTS: Prefs = { theme: 'auto', dnd: false, reduceMotion: false, wallpaper: 'sonoma' };

function read(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

let state: Prefs = DEFAULTS;
const listeners = new Set<() => void>();

function apply(prefs: Prefs): void {
  const root = document.documentElement;
  if (prefs.theme === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', prefs.theme);
  root.toggleAttribute('data-reduce-motion', prefs.reduceMotion);
  root.setAttribute('data-wallpaper', prefs.wallpaper);
}

export function initPrefs(): void {
  state = read();
  apply(state);
}

export function setPrefs(patch: Partial<Prefs>): void {
  state = { ...state, ...patch };
  apply(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Preferences simply will not persist if storage is blocked.
  }
  listeners.forEach((listener) => listener());
}

export const getPrefs = (): Prefs => state;

export function usePrefs(): Prefs {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => state,
  );
}
