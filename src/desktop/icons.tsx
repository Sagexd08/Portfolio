import type { ReactNode } from 'react';
import { siGooglechrome, siYoutubemusic } from 'simple-icons';
import type { AppId } from './types';

// Original squircle app icons: CSS gradient tile + inline-SVG glyph. No third-party artwork or logo files.
// Chrome and YouTube Music use simple-icons marks. LinkedIn was removed from simple-icons, so it stays a plain original 'in' glyph.

type Stop = readonly [string, string];

const TILES: Record<AppId, Stop> = {
  notes: ['#ffe27a', '#f4a62a'],
  about: ['#8ad4ff', '#3a7bd5'],
  projects: ['#7fd1ff', '#2f80ed'],
  resume: ['#b69cff', '#6a4cd8'],
  'open-source': ['#6fe3a5', '#1f9d6a'],
  gallery: ['#ffb199', '#ff5f8a'],
  finder: ['#7ad7ff', '#2d6fe0'],
  maps: ['#8be28f', '#2f9e5b'],
  assistant: ['#c79bff', '#6a3fe0'],
  contact: ['#6bd0ff', '#1f7be8'],
  help: ['#b9c2d0', '#6b7585'],
  playground: ['#ffa86b', '#e5502f'],
  snake: ['#7be08c', '#1c7d3a'],
  embeddings: ['#7cc8ff', '#4a47d6'],
  browser: ['#f6f7fb', '#c9d1e0'],
  linkedin: ['#3b95d9', '#0a5ea8'],
  music: ['#ff2d2d', '#d10a0a'],
  vscode: ['#1f2a44', '#0f1626'],
  terminal: ['#3a3a3c', '#111112'],
  messages: ['#6cea7a', '#1fb53a'],
};

const STROKE = { fill: 'none', stroke: '#fff', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const GLYPHS: Record<AppId, ReactNode> = {
  notes: <g {...STROKE}><path d="M6 3.5h9l4 4V20H6z" /><path d="M14.5 3.5v4.5H19M9 12.5h7M9 16h5" /></g>,
  about: <g {...STROKE}><circle cx="12" cy="8.5" r="3.6" /><path d="M5 20c0-3.8 3.1-6 7-6s7 2.2 7 6" /></g>,
  projects: <g {...STROKE}><path d="M3.5 7.5a2 2 0 0 1 2-2H9l2 2h7.5a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" /></g>,
  resume: <g {...STROKE}><path d="M12 4v16" /><circle cx="12" cy="8" r="2" /><circle cx="12" cy="16" r="2" /><path d="M14 8h5M5 16h5" /></g>,
  'open-source': <g {...STROKE}><circle cx="7" cy="6.5" r="2" /><circle cx="7" cy="17.5" r="2" /><circle cx="17" cy="9.5" r="2" /><path d="M7 8.5v7M17 11.5c0 3-3 4.5-8 4.5" /></g>,
  gallery: <g {...STROKE}><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><circle cx="9" cy="10" r="1.5" /><path d="m20.5 16-4.5-4.5L8 19" /></g>,
  finder: <g {...STROKE}><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><path d="M12 4.5v15M8.5 9v1.5M15.5 9v1.5M8 15.2c2.3 1.7 5.7 1.7 8 0" /></g>,
  maps: <g {...STROKE}><path d="M12 20.5s-6-5-6-10a6 6 0 0 1 12 0c0 5-6 10-6 10z" /><circle cx="12" cy="10.5" r="2.2" /></g>,
  assistant: <g {...STROKE}><path d="M12 3.5l1.8 5 5 1.8-5 1.8-1.8 5-1.8-5-5-1.8 5-1.8z" /><path d="M19 17v3.5M17.2 18.8h3.6" /></g>,
  contact: <g {...STROKE}><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m3.5 8 8.5 5.5L20.5 8" /></g>,
  help: <g {...STROKE}><circle cx="12" cy="12" r="8.5" /><path d="M9.6 9.6a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1.1 1-1.1 1.7M12 16.8h.01" /></g>,
  playground: <g {...STROKE}><circle cx="5.5" cy="6.5" r="1.8" /><circle cx="5.5" cy="17.5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="18.5" cy="12" r="1.8" /><path d="m7 7.5 3.5 3.3M7 16.5l3.5-3.3M13.8 12h3" /></g>,
  snake: <g {...STROKE}><path d="M5 18h9a3 3 0 0 0 0-6H9.5a3 3 0 0 1 0-6H19" /><circle cx="19" cy="6" r=".6" fill="#fff" /></g>,
  embeddings: <g {...STROKE}><circle cx="6.5" cy="7.5" r="1.6" /><circle cx="14" cy="5.5" r="1.6" /><circle cx="18" cy="14" r="1.6" /><circle cx="8" cy="17" r="1.6" /><circle cx="12" cy="11.5" r="1.6" /></g>,
  // Brand marks come from the CC0 simple-icons package.
  browser: <path d={siGooglechrome.path} fill={`#${siGooglechrome.hex}`} />,
  linkedin: (
    <g fill="#fff">
      <rect x="5" y="9.5" width="3" height="9" rx=".6" />
      <circle cx="6.5" cy="6.2" r="1.8" />
      <path d="M10.5 9.5h2.8v1.3c.5-.9 1.6-1.5 3-1.5 2.6 0 3.2 1.7 3.2 3.9v5.3h-3v-4.7c0-1.1-.2-1.9-1.3-1.9-1.2 0-1.7.9-1.7 2v4.6h-3z" />
    </g>
  ),
  music: <path d={siYoutubemusic.path} fill="#fff" />,
  // simple-icons no longer ships a VS Code mark, so this is an original ribbon-style glyph.
  vscode: (
    <g>
      <path d="M17.5 3.5 8.2 12l9.3 8.5 3-1.4V4.9z" fill="#2aa7f5" />
      <path d="M17.5 3.5 8.2 12l-3.6-3-1.6 1.2v3.6l1.6 1.2 3.6-3 9.3 8.5V3.5z" fill="#0b78d4" opacity=".9" />
      <path d="M17.5 8.2v7.6L12.6 12z" fill="#0f1626" opacity=".55" />
    </g>
  ),
  terminal: <g {...STROKE}><path d="m5.5 8.5 4 3.5-4 3.5M12 16h6" /></g>,
  // Original filled speech bubble (green squircle tile above).
  messages: <path d="M12 4.2c-4.7 0-8.5 3-8.5 6.8 0 2.1 1.2 4 3.1 5.2-.1 1.1-.6 2.2-1.4 3 1.7-.1 3.2-.8 4.2-1.7.8.2 1.7.3 2.6.3 4.7 0 8.5-3 8.5-6.8S16.7 4.2 12 4.2z" fill="#fff" />,
};

function AppIcon({ app }: { app: AppId }) {
  const [top, bottom] = TILES[app];
  return (
    <span
      aria-hidden="true"
      className="app-icon"
      style={{ background: `linear-gradient(160deg, ${top}, ${bottom})`, boxShadow: app === 'browser' ? 'inset 0 0 0 1px rgba(0,0,0,0.12)' : undefined }}
    >
      <svg viewBox="0 0 24 24" width={app === 'browser' || app === 'music' ? '70%' : '62%'} height={app === 'browser' || app === 'music' ? '70%' : '62%'}>{GLYPHS[app]}</svg>
    </span>
  );
}

export const APP_ICONS = Object.fromEntries((Object.keys(TILES) as AppId[]).map((app) => [app, <AppIcon key={app} app={app} />])) as Record<AppId, ReactNode>;
