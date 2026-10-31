import { useSyncExternalStore } from 'react';

function useMedia(query: string): boolean {
  const subscribe = (notify: () => void): (() => void) => {
    const list = window.matchMedia(query);
    list.addEventListener('change', notify);
    return () => list.removeEventListener('change', notify);
  };
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useIsMobile = (): boolean => useMedia('(max-width: 767px)');
export const useReducedMotion = (): boolean => useMedia('(prefers-reduced-motion: reduce)');
