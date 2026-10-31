import { useEffect, useSyncExternalStore, type RefObject } from 'react';

export type Overlay = 'spotlight' | 'notifications' | 'control' | 'launchpad' | null;

let current: Overlay = null;
const listeners = new Set<() => void>();

function set(next: Overlay): void {
  if (next === current) return;
  current = next;
  listeners.forEach((listener) => listener());
}

export const openOverlay = (overlay: Exclude<Overlay, null>): void => set(overlay);
export const closeOverlay = (): void => set(null);
export const toggleOverlay = (overlay: Exclude<Overlay, null>): void => set(current === overlay ? null : overlay);

/** Close an overlay on Escape or on a pointer press outside `ref` (menu-bar buttons opt out with data-overlay-toggle). */
export function useDismiss(ref: RefObject<HTMLElement>, active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') closeOverlay();
    };
    const onPointer = (event: PointerEvent): void => {
      const target = event.target as HTMLElement;
      if (ref.current && !ref.current.contains(target) && !target.closest('[data-overlay-toggle]')) closeOverlay();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [ref, active]);
}

export function useOverlay(): Overlay {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
    () => current,
  );
}
