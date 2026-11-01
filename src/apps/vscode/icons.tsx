import type { ReactNode } from 'react';

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export type IconName = 'explorer' | 'search' | 'git' | 'extensions' | 'settings' | 'terminal' | 'branch' | 'close';

const ICONS: Record<IconName, ReactNode> = {
  explorer: <g {...S}><path d="M14 3H7a1 1 0 0 0-1 1v12h8a1 1 0 0 0 1-1V6z" /><path d="M14 3v3h3M4 7v12a1 1 0 0 0 1 1h9" /></g>,
  search: <g {...S}><circle cx="14" cy="10" r="5" /><path d="m10.5 13.5-6 6" /></g>,
  git: <g {...S}><circle cx="7" cy="5.5" r="2" /><circle cx="7" cy="18.5" r="2" /><circle cx="17" cy="9" r="2" /><path d="M7 7.5v9M17 11c0 3-4 3-9.5 6" /></g>,
  extensions: <g {...S}><rect x="4" y="11" width="6.5" height="6.5" /><rect x="11" y="11" width="6.5" height="6.5" /><rect x="4" y="4.5" width="6.5" height="6.5" /><path d="M14.5 3l3.5 3.5-3.5 3.5-3.5-3.5z" /></g>,
  settings: <g {...S}><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></g>,
  terminal: <g {...S}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m7 10 3 2.5L7 15M12.5 15H17" /></g>,
  branch: <g {...S}><circle cx="6" cy="5" r="2" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="8" r="2" /><path d="M6 7v10M18 10c0 4-8 3-12 7" /></g>,
  close: <g {...S}><path d="m6 6 12 12M18 6 6 18" /></g>,
};

export function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size}>{ICONS[name]}</svg>;
}
