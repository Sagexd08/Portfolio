import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { AppId, AppProps } from './types';

export { APP_ICONS } from './icons';

type AppComponent = LazyExoticComponent<ComponentType<AppProps>>;

export const APP_COMPONENTS: Record<AppId, AppComponent> = {
  notes: lazy(() => import('../apps/Notes')),
  about: lazy(() => import('../apps/About')),
  projects: lazy(() => import('../apps/Projects')),
  resume: lazy(() => import('../apps/Resume')),
  'open-source': lazy(() => import('../apps/OpenSource')),
  gallery: lazy(() => import('../apps/Gallery')),
  finder: lazy(() => import('../apps/Finder')),
  maps: lazy(() => import('../apps/Maps')),
  assistant: lazy(() => import('../apps/Assistant')),
  contact: lazy(() => import('../apps/Contact')),
  help: lazy(() => import('../apps/Help')),
  playground: lazy(() => import('../apps/Playground')),
  snake: lazy(() => import('../apps/Snake')),
  embeddings: lazy(() => import('../apps/Embeddings')),
  browser: lazy(() => import('../apps/Browser')),
  linkedin: lazy(() => import('../apps/LinkedIn')),
  music: lazy(() => import('../apps/Music')),
  vscode: lazy(() => import('../apps/VSCode')),
  terminal: lazy(() => import('../apps/Terminal')),
  messages: lazy(() => import('../apps/Messages')),
  diary: lazy(() => import('../apps/Diary')),
};
