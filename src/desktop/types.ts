// Shared contract between the desktop shell (src/desktop), apps (src/apps/*) and the AI layer (src/ai).
// Consumers: src/desktop/store.ts, src/desktop/apps.ts, every src/apps/*/index.tsx, src/ai/status.ts.

export type AppId =
  | 'notes'
  | 'about'
  | 'projects'
  | 'resume'
  | 'open-source'
  | 'gallery'
  | 'finder'
  | 'maps'
  | 'assistant'
  | 'contact'
  | 'help'
  | 'playground'
  | 'snake'
  | 'embeddings'
  | 'browser'
  | 'linkedin'
  | 'music';

export interface AppProps {
  windowId: string;
  /** Deep-link params, e.g. { slug: 'project-apex' } for projects, { note: 'intro' } for notes. */
  params: Record<string, string>;
}

export interface DesktopWindow {
  id: string;
  app: AppId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  params: Record<string, string>;
}

/** Implemented by src/desktop/store.ts. Apps call these to open/focus other windows. */
export interface DesktopActions {
  openApp: (app: AppId, params?: Record<string, string>) => void;
  closeWindow: (id: string) => void;
}

export type AiPhase = 'idle' | 'opened' | 'listening' | 'processing' | 'responding' | 'error';
