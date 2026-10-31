import { useSyncExternalStore } from 'react';
import { APP_META } from './appMeta';
import type { AppId, DesktopWindow } from './types';

export const MENU_BAR_HEIGHT = 28;
export const DOCK_RESERVE = 92;
const EDGE = 8;

interface DesktopState {
  windows: DesktopWindow[];
  focusedId: string | null;
  topZ: number;
}

let state: DesktopState = { windows: [], focusedId: null, topZ: 10 };
const listeners = new Set<() => void>();

function commit(next: DesktopState): void {
  if (next === state) return;
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = (): DesktopState => state;

export function useDesktop(): DesktopState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getDesktop(): DesktopState {
  return state;
}

function viewport(): { w: number; h: number } {
  return { w: window.innerWidth, h: window.innerHeight };
}

function clampRect(
  position: { x: number; y: number },
  size: { width: number; height: number },
): Pick<DesktopWindow, 'position' | 'size'> {
  const { w, h } = viewport();
  const width = Math.max(320, Math.min(size.width, w - EDGE * 2));
  const height = Math.max(220, Math.min(size.height, h - MENU_BAR_HEIGHT - DOCK_RESERVE));
  const minY = MENU_BAR_HEIGHT + 4;
  const x = Math.min(Math.max(position.x, EDGE), Math.max(EDGE, w - width - EDGE));
  const y = Math.min(Math.max(position.y, minY), Math.max(minY, h - DOCK_RESERVE - height));
  return { position: { x, y }, size: { width, height } };
}

function sameParams(a: Record<string, string>, b: Record<string, string>): boolean {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
}

function patchWindow(id: string, patch: Partial<DesktopWindow>): DesktopState {
  return { ...state, windows: state.windows.map((win) => (win.id === id ? { ...win, ...patch } : win)) };
}

function createWindow(app: AppId, params: Record<string, string>, z: number): DesktopWindow {
  const meta = APP_META[app];
  const { w, h } = viewport();
  const cascade = (state.windows.length % 6) * 28;
  const rect = clampRect(
    { x: (w - meta.width) / 2 + cascade - 60, y: (h - meta.height) / 2 + cascade - 30 },
    { width: meta.width, height: meta.height },
  );
  return { id: `win-${app}`, app, title: meta.title, isOpen: true, isMinimized: false, isMaximized: false, zIndex: z, params, ...rect };
}

/** Open (or reuse) the window for an app and set its params exactly. */
export function openApp(app: AppId, params: Record<string, string> = {}): void {
  const id = `win-${app}`;
  const existing = state.windows.find((win) => win.id === id);
  if (!existing) {
    const z = state.topZ + 1;
    commit({ windows: [...state.windows, createWindow(app, params, z)], focusedId: id, topZ: z });
    return;
  }
  const settled = existing.isOpen && !existing.isMinimized && state.focusedId === id && sameParams(existing.params, params);
  if (settled) return;
  const z = state.topZ + 1;
  const next = patchWindow(id, { isOpen: true, isMinimized: false, params, zIndex: z });
  commit({ ...next, focusedId: id, topZ: z });
}

/** Dock behaviour: focus/restore the window, keeping its current params. */
export function launchApp(app: AppId): void {
  const existing = state.windows.find((win) => win.app === app);
  openApp(app, existing ? existing.params : {});
}

export function focusWindow(id: string): void {
  if (state.focusedId === id) return;
  const z = state.topZ + 1;
  commit({ ...patchWindow(id, { zIndex: z }), focusedId: id, topZ: z });
}

export function closeWindow(id: string): void {
  const windows = state.windows.filter((win) => win.id !== id);
  const top = [...windows].filter((win) => !win.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0];
  commit({ ...state, windows, focusedId: state.focusedId === id ? (top?.id ?? null) : state.focusedId });
}

export function minimizeWindow(id: string): void {
  const next = patchWindow(id, { isMinimized: true });
  const top = next.windows.filter((win) => !win.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0];
  commit({ ...next, focusedId: state.focusedId === id ? (top?.id ?? null) : state.focusedId });
}

export function toggleMaximize(id: string): void {
  const win = state.windows.find((item) => item.id === id);
  if (win) commit(patchWindow(id, { isMaximized: !win.isMaximized }));
}

export function moveWindow(id: string, position: { x: number; y: number }): void {
  const win = state.windows.find((item) => item.id === id);
  if (win) commit(patchWindow(id, clampRect(position, win.size)));
}

export function resizeWindow(id: string, size: { width: number; height: number }): void {
  const win = state.windows.find((item) => item.id === id);
  if (win) commit(patchWindow(id, clampRect(win.position, size)));
}

export function minimizeAll(): void {
  commit({ ...state, windows: state.windows.map((win) => ({ ...win, isMinimized: true })), focusedId: null });
}

export function resetLayout(): void {
  const { w, h } = viewport();
  const windows = state.windows.map((win, index) => ({
    ...win,
    isMaximized: false,
    ...clampRect(
      { x: (w - win.size.width) / 2 + index * 28 - 60, y: (h - win.size.height) / 2 + index * 28 - 30 },
      APP_META[win.app],
    ),
  }));
  commit({ ...state, windows });
}

/** Tile every visible window in an even grid inside the usable area. */
export function tileWindows(): void {
  const visible = state.windows.filter((win) => !win.isMinimized);
  if (visible.length === 0) return;
  const { w, h } = viewport();
  const cols = Math.ceil(Math.sqrt(visible.length));
  const rows = Math.ceil(visible.length / cols);
  const cellW = (w - EDGE * 2) / cols;
  const cellH = (h - MENU_BAR_HEIGHT - DOCK_RESERVE - EDGE) / rows;
  const ids = visible.map((win) => win.id);
  const windows = state.windows.map((win) => {
    const slot = ids.indexOf(win.id);
    if (slot < 0) return win;
    const rect = clampRect(
      { x: EDGE + (slot % cols) * cellW, y: MENU_BAR_HEIGHT + 4 + Math.floor(slot / cols) * cellH },
      { width: cellW - 6, height: cellH - 6 },
    );
    return { ...win, isMaximized: false, ...rect };
  });
  commit({ ...state, windows });
}
