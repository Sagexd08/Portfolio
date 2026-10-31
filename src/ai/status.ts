import { useSyncExternalStore } from 'react';
import type { AiPhase } from '../desktop/types';

export interface AiStatus {
  phase: AiPhase;
  message?: string;
  retry?: () => void;
}

let current: AiStatus = { phase: 'idle' };
const listeners = new Set<() => void>();

export function setAiStatus(next: AiStatus): void {
  current = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAiStatus(): AiStatus {
  return useSyncExternalStore(subscribe, () => current, () => current);
}
