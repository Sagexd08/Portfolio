import { useSyncExternalStore } from 'react';
import { getPrefs } from './prefs';
import type { AppId } from './types';

export interface Notice {
  id: number;
  title: string;
  body: string;
  app?: AppId;
  params?: Record<string, string>;
  /** ISO time for notices created by a real action; seeded portfolio updates have none. */
  at?: string;
}

interface NoticeState {
  items: Notice[];
  toasts: Notice[];
}

const TOAST_MS = 4200;
let state: NoticeState = { items: [], toasts: [] };
let nextId = 1;
const listeners = new Set<() => void>();

function commit(next: NoticeState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

export function notify(notice: Omit<Notice, 'id' | 'at'>): void {
  const full: Notice = { ...notice, id: nextId++, at: new Date().toISOString() };
  const showToast = !getPrefs().dnd;
  commit({ items: [full, ...state.items], toasts: showToast ? [...state.toasts, full] : state.toasts });
  if (showToast) window.setTimeout(() => dismissToast(full.id), TOAST_MS);
}

/** Portfolio facts shown in Notification Center. Every entry comes from the resume. */
export function seedNotices(): void {
  if (state.items.length > 0) return;
  const seeds: Omit<Notice, 'id'>[] = [
    { title: 'Open to forward-deployed & ML engineering roles', body: 'Ask the assistant a question or get in touch.', app: 'contact' },
    { title: 'Open source: Graphify fix merged', body: 'Import-type normalizer performance fix, v0.9.56 (issue #3359).', app: 'open-source' },
    { title: 'Lumeo: 40,000+ waitlist signups', body: 'Pre-launch, with zero ad spend. Sohom is co-founder and CEO.', app: 'projects', params: { slug: 'lumeo' } },
    { title: 'Deloitte: OCR workflow, 20% faster', body: 'Document-intelligence pipeline for a healthcare client.', app: 'resume' },
  ];
  commit({ items: seeds.map((seed) => ({ ...seed, id: nextId++ })), toasts: [] });
}

export function dismiss(id: number): void {
  commit({ items: state.items.filter((item) => item.id !== id), toasts: state.toasts.filter((item) => item.id !== id) });
}

export function dismissToast(id: number): void {
  commit({ ...state, toasts: state.toasts.filter((item) => item.id !== id) });
}

export const clearNotices = (): void => commit({ items: [], toasts: [] });

export function useNotices(): NoticeState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => state,
    () => state,
  );
}
