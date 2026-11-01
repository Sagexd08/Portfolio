import { Grad, type IconDef } from './iconKit';

// Original glyph art, group B: content apps, plus the dock-only Launchpad, Trash and Settings marks.
const LINE = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const gearPath = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    const w = 0.2;
    [[a - w, 27], [a - w * 0.6, 35], [a + w * 0.6, 35], [a + w, 27]].forEach(([t, r]) => pts.push(`${(50 + r * Math.cos(t)).toFixed(1)} ${(50 + r * Math.sin(t)).toFixed(1)}`));
  }
  return `M${pts.join('L')}Z`;
})();

export const GLYPHS_B = {
  projects: {
    bg: ['#7fd6ff', '#2b73e8'],
    draw: (p) => (
      <g>
        <defs><Grad id={`${p}a`} a="#a9e2ff" b="#4a9af0" /><Grad id={`${p}d`} a="#e6f6ff" b="#8cc9fb" /></defs>
        <path d="M14 30a6 6 0 0 1 6-6h17l7 8h36a6 6 0 0 1 6 6v36a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6Z" fill={`url(#${p}a)`} filter={`url(#${p}s)`} />
        <path d="M14 44h72v-4a6 6 0 0 0-6-6H44l-7-8H20a6 6 0 0 0-6 6Z" fill="rgba(0,40,110,.2)" />
        <path d="M14 46a6 6 0 0 1 6-6h60a6 6 0 0 1 6 6v28a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6Z" fill={`url(#${p}d)`} />
      </g>
    ),
  },
  resume: {
    bg: ['#c2a8ff', '#5b3ccf'],
    draw: (p) => (
      <g>
        <defs><Grad id={`${p}a`} a="#ffffff" b="#e1d9fa" /></defs>
        <g filter={`url(#${p}s)`}>
          <path d="M26 14h30l18 18v50a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4Z" fill={`url(#${p}a)`} />
        </g>
        <path d="M56 14v14a4 4 0 0 0 4 4h14Z" fill="#b9a8f0" />
        <circle cx="38" cy="44" r="6" fill="#7a5ce0" />
        <path d="M30 60q8-10 16 0" fill="#7a5ce0" />
        <path d="M52 42h14M52 50h14M32 70h34M32 78h24" stroke="#9c88d8" strokeWidth="3" {...LINE} />
      </g>
    ),
  },
  about: {
    bg: ['#8fd8ff', '#3472d8'],
    draw: (p) => (
      <g>
        <defs><Grad id={`${p}a`} a="#ffffff" b="#cfe4fb" /></defs>
        <g filter={`url(#${p}s)`} fill={`url(#${p}a)`}>
          <circle cx="50" cy="38" r="15" />
          <path d="M20 82c0-17 13-28 30-28s30 11 30 28Z" />
        </g>
      </g>
    ),
  },
  gallery: {
    bg: ['#fffdfb', '#e9e4ee'],
    draw: () => (
      <g style={{ mixBlendMode: 'multiply' }}>
        {['#ff453a', '#ff9f0a', '#ffd60a', '#30d158', '#32ade6', '#5e5ce6', '#bf5af2', '#ff2d78'].map((c, i) => (
          <ellipse key={c} cx="50" cy="29" rx="10" ry="19" fill={c} opacity=".82" transform={`rotate(${i * 45} 50 50)`} />
        ))}
      </g>
    ),
  },
  maps: {
    bg: ['#bff0b0', '#58b878'],
    draw: (p) => (
      <g>
        <defs><Grad id={`${p}a`} a="#ff7468" b="#d9261c" /></defs>
        <path d="M0 66c20-8 34 6 56-4s30-6 44-14v52H0Z" fill="#9ad7ff" />
        <path d="M-4 30 104 58" stroke="#fff" strokeWidth="9" opacity=".85" />
        <path d="M30 0 52 100" stroke="#fff" strokeWidth="6" opacity=".7" />
        <path d="M50 82C34 62 30 54 30 44a20 20 0 0 1 40 0c0 10-4 18-20 38Z" fill={`url(#${p}a)`} filter={`url(#${p}s)`} />
        <circle cx="50" cy="44" r="8" fill="#fff" />
      </g>
    ),
  },
  'open-source': {
    bg: ['#4a525f', '#14181f'],
    draw: (p) => (
      <g filter={`url(#${p}s)`}>
        <path d="M32 30v40M32 52c0-12 36-6 36-22" stroke="#7df0a8" strokeWidth="5" {...LINE} />
        {[[32, 28], [32, 72], [68, 28]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="9" fill="#e9fff2" stroke="#2fd37a" strokeWidth="4" />)}
      </g>
    ),
  },
  help: {
    bg: ['#d3dae6', '#76839a'],
    draw: (p) => (
      <g>
        <circle cx="50" cy="50" r="30" fill="#fff" filter={`url(#${p}s)`} />
        <path d="M40 41a10 10 0 1 1 15 8.6c-3.4 2-5 4-5 7.4M50 68.5v.5" stroke="#5a6780" strokeWidth="7" {...LINE} />
      </g>
    ),
  },
  playground: {
    bg: ['#ffb56e', '#e2432a'],
    draw: (p) => (
      <g filter={`url(#${p}s)`}>
        <path d="M24 30 50 50 76 30M24 70 50 50 76 70M24 30v40M76 30v40" stroke="rgba(255,255,255,.75)" strokeWidth="3" {...LINE} />
        {[[24, 30], [24, 70], [50, 50], [76, 30], [76, 70]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="8" fill="#fff" />)}
      </g>
    ),
  },
  snake: {
    bg: ['#88ec96', '#17802f'],
    draw: (p) => (
      <g filter={`url(#${p}s)`}>
        <path d="M22 72h40a12 12 0 0 0 0-24H38a12 12 0 0 1 0-24h38" stroke="#e8ffe9" strokeWidth="11" {...LINE} />
        <circle cx="76" cy="24" r="3" fill="#0d4d1b" />
        <circle cx="78" cy="68" r="5" fill="#ff5a4d" />
      </g>
    ),
  },
  embeddings: {
    bg: ['#79c8ff', '#4a3fd6'],
    draw: (p) => (
      <g filter={`url(#${p}s)`}>
        {[[28, 30, 7, '#fff'], [66, 24, 5, '#d8e8ff'], [74, 62, 8, '#fff'], [36, 70, 6, '#d8e8ff'], [50, 48, 9, '#ffe27a']].map(([x, y, r, c]) => <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill={String(c)} />)}
      </g>
    ),
  },
  launchpad: {
    bg: ['#f2f3f7', '#a9b0c0'],
    draw: () => (
      <g>
        {['#ff453a', '#ff9f0a', '#ffd60a', '#30d158', '#32ade6', '#5e5ce6', '#bf5af2', '#ff2d78', '#64d2ff'].map((c, i) => (
          <rect key={c} x={20 + (i % 3) * 22} y={20 + Math.floor(i / 3) * 22} width="17" height="17" rx="5" fill={c} />
        ))}
      </g>
    ),
  },
  trash: {
    bg: ['#dfe4ec', '#8c96a8'],
    draw: (p) => (
      <g filter={`url(#${p}s)`}>
        <path d="M30 34h40l-3 46a5 5 0 0 1-5 4H38a5 5 0 0 1-5-4Z" fill="rgba(255,255,255,.55)" stroke="#fff" strokeWidth="2.5" />
        <path d="M24 30h52M42 28v-5h16v5" stroke="#fff" strokeWidth="5" {...LINE} />
        <path d="M42 42v34M50 42v34M58 42v34" stroke="rgba(255,255,255,.8)" strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
  },
  settings: {
    bg: ['#aab2c0', '#4f5766'],
    draw: (p) => (
      <g filter={`url(#${p}s)`}>
        <defs><Grad id={`${p}a`} a="#f4f6fa" b="#a7b0c0" /></defs>
        <path d={gearPath} fill={`url(#${p}a)`} />
        <circle cx="50" cy="50" r="14" fill="#5b6475" />
        <circle cx="50" cy="50" r="8" fill="#2d3340" />
      </g>
    ),
  },
} satisfies Record<string, IconDef>;
