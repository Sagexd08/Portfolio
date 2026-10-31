import { lazy, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import type { AppId, AppProps } from './types';

const icon = (children: ReactNode): ReactNode => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const APP_ICONS: Record<AppId, ReactNode> = {
  notes: icon(<><path d="M5 3h10l4 4v14H5z" /><path d="M15 3v4h4M8 12h8M8 16h6" /></>),
  about: icon(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></>),
  projects: icon(<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />),
  resume: icon(<><path d="M12 3v18" /><circle cx="12" cy="7" r="2" /><circle cx="12" cy="17" r="2" /><path d="M14 7h6M4 17h6" /></>),
  'open-source': icon(<><circle cx="6" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="9" r="2" /><path d="M6 8v8M18 11c0 3-3 5-8 5H6" /></>),
  gallery: icon(<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m21 16-5-5-9 9" /></>),
  finder: icon(<><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M12 4v16M8 9v1.5M16 9v1.5M7.5 15.5c2.5 2 6.5 2 9 0" /></>),
  maps: icon(<><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></>),
  assistant: icon(<><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 17v4M17 19h4" /></>),
  contact: icon(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>),
  help: icon(<><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01" /></>),
  playground: icon(<><circle cx="5" cy="6" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /><path d="M7 6l3.5 5M7 18l3.5-5M14 12h3" /></>),
  snake: icon(<><path d="M5 18h9a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h10" /><circle cx="19" cy="6" r="1" /></>),
  embeddings: icon(<><circle cx="6" cy="7" r="1.5" /><circle cx="14" cy="5" r="1.5" /><circle cx="18" cy="14" r="1.5" /><circle cx="8" cy="17" r="1.5" /><circle cx="12" cy="11" r="1.5" /></>),
};

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
};
