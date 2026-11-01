import { Grad, type IconDef } from './iconKit';

// Original glyph art, group A: system and communication apps. 100x100 box, each drawn in 2-3 layers.
const LINE = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const GLYPHS_A = {
  finder: {
    bg: ['#3fa2ff', '#0b56d0'],
    draw: (p) => (
      <g>
        <defs><Grad id={`${p}a`} a="#f4fbff" b="#a9dcff" /></defs>
        <path d="M0 0H51C48 30 54 70 50 100H0Z" fill={`url(#${p}a)`} />
        <rect x="26" y="30" width="7" height="17" rx="3.5" fill="#0a2a66" />
        <rect x="67" y="30" width="7" height="17" rx="3.5" fill="#fff" />
        <path d="M53 34c-5 14-8 18-2 22h6" stroke="#0a2a66" strokeWidth="3.5" {...LINE} />
        <path d="M22 66q28 22 56 0" stroke="#0a2a66" strokeWidth="5" {...LINE} />
      </g>
    ),
  },
  browser: {
    bg: ['#62d6ff', '#0a5ad6'],
    draw: (p) => (
      <g>
        <defs><Grad id={`${p}a`} a="#ffffff" b="#bfd6f5" /><Grad id={`${p}d`} a="#ff6b5e" b="#d6201a" /></defs>
        <circle cx="50" cy="50" r="35" fill={`url(#${p}a)`} filter={`url(#${p}s)`} />
        <circle cx="50" cy="50" r="30" fill="#0e3f9c" opacity=".92" />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M50 22v4" stroke="#fff" strokeWidth={i % 3 ? 1 : 1.8} strokeLinecap="round" transform={`rotate(${i * 30} 50 50)`} />
        ))}
        <g transform="rotate(40 50 50)" filter={`url(#${p}s)`}>
          <path d="M50 20 59 50H41Z" fill={`url(#${p}d)`} />
          <path d="M50 80 41 50H59Z" fill="#f4f7fc" />
        </g>
        <circle cx="50" cy="50" r="3.6" fill="#fff" stroke="#0e3f9c" strokeWidth="1.2" />
      </g>
    ),
  },
  notes: {
    bg: ['#fff3a8', '#ffd24a'],
    draw: (p) => (
      <g>
        <defs><Grad id={`${p}a`} a="#ffc83a" b="#f0a313" /></defs>
        <rect width="100" height="24" fill={`url(#${p}a)`} />
        <path d="M0 24h100" stroke="rgba(120,70,0,.25)" strokeWidth="1.5" />
        {[40, 54, 68, 82].map((y) => <path key={y} d={`M14 ${y}H86`} stroke="rgba(150,105,10,.38)" strokeWidth="2" strokeLinecap="round" />)}
        <path d="M14 40v50" stroke="rgba(230,80,60,.35)" strokeWidth="1.6" />
        <path d="M30 12h40" stroke="rgba(255,255,255,.7)" strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
  },
  messages: {
    bg: ['#74f58a', '#0fae2f'],
    draw: (p) => (
      <g>
        <defs><Grad id={`${p}a`} a="#ffffff" b="#d8f5de" /></defs>
        <g filter={`url(#${p}s)`}>
          <ellipse cx="50" cy="46" rx="33" ry="27" fill={`url(#${p}a)`} />
          <path d="M26 64q-1 12-12 17 15 1 25-9Z" fill="#e4f8e8" />
        </g>
        <path d="M30 34q20-9 40 0" stroke="rgba(255,255,255,.9)" strokeWidth="2" {...LINE} />
      </g>
    ),
  },
  diary: {
    bg: ['#ffcf6b', '#e0701c'],
    draw: (p) => (
      <g>
        <defs><Grad id={`${p}a`} a="#fff6e0" b="#f3dba8" /></defs>
        <g filter={`url(#${p}s)`}>
          <rect x="24" y="16" width="52" height="68" rx="6" fill="#7a3b12" />
          <rect x="29" y="16" width="47" height="68" rx="5" fill={`url(#${p}a)`} />
          <path d="M38 34h30M38 44h30M38 54h22" stroke="rgba(120,70,20,.55)" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M60 16v22l5-4 5 4V16Z" fill="#e5383b" />
        </g>
      </g>
    ),
  },
  music: {
    bg: ['#ff6a8a', '#e60f3d'],
    draw: (p) => (
      <g>
        <defs><Grad id={`${p}a`} a="#ffffff" b="#ffd7df" /></defs>
        <g fill={`url(#${p}a)`} filter={`url(#${p}s)`}>
          <path d="M40 28 72 20v14L40 42Z" />
          <rect x="40" y="28" width="6" height="40" rx="2" />
          <rect x="66" y="20" width="6" height="36" rx="2" />
          <ellipse cx="35" cy="69" rx="10" ry="7.5" transform="rotate(-18 35 69)" />
          <ellipse cx="61" cy="62" rx="10" ry="7.5" transform="rotate(-18 61 62)" />
        </g>
        <path d="M42 34 70 27" stroke="rgba(230,15,61,.3)" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },
  contact: {
    bg: ['#5cc9ff', '#1767e0'],
    draw: (p) => (
      <g>
        <defs><Grad id={`${p}a`} a="#ffffff" b="#cfdff5" /><Grad id={`${p}d`} a="#eef5ff" b="#b6cdee" /></defs>
        <rect x="16" y="28" width="68" height="46" rx="7" fill={`url(#${p}a)`} filter={`url(#${p}s)`} />
        <path d="M18 34 50 58 82 34" stroke="#7fa6dc" strokeWidth="3" {...LINE} />
        <path d="M18 72 42 52M82 72 58 52" stroke="#a9c2e6" strokeWidth="2" {...LINE} />
        <path d="M16 36q34 26 68 0v-2q-34 22-68 0Z" fill={`url(#${p}d)`} opacity=".6" />
      </g>
    ),
  },
  terminal: {
    bg: ['#3b3b40', '#08080a'],
    draw: () => (
      <g>
        <rect width="100" height="17" fill="rgba(255,255,255,.08)" />
        <circle cx="12" cy="8.5" r="2.6" fill="#ff5f57" /><circle cx="21" cy="8.5" r="2.6" fill="#febc2e" /><circle cx="30" cy="8.5" r="2.6" fill="#28c840" />
        <path d="M24 40 42 54 24 68" stroke="#fff" strokeWidth="7" {...LINE} />
        <rect x="46" y="60" width="34" height="15" rx="7" fill="#34f06a" opacity=".18" />
        <rect x="50" y="64" width="26" height="7" rx="3.5" fill="#34f06a" />
      </g>
    ),
  },
  vscode: {
    bg: ['#2b9bf5', '#0a4fb8'],
    draw: (p) => (
      <g>
        <defs><Grad id={`${p}a`} a="#e4f3ff" b="#7cc3ff" /></defs>
        <g filter={`url(#${p}s)`}>
          <path d="M64 16 82 25V75L64 84Z" fill="#fff" />
          <path d="M64 16 24 50 64 84V67L44 50 64 33Z" fill={`url(#${p}a)`} />
        </g>
        <path d="M64 33 44 50 64 67Z" fill="#06357e" opacity=".55" />
      </g>
    ),
  },
  linkedin: {
    bg: ['#3aa0e6', '#0a58a6'],
    draw: (p) => (
      <g fill="#fff" filter={`url(#${p}s)`}>
        <rect x="21" y="39" width="13" height="40" rx="2.5" />
        <circle cx="27.5" cy="26" r="7.5" />
        <path d="M42 39h12.5v5.6c2.2-4 6.6-6.6 12.6-6.6 11 0 14 7 14 17V79H68V57c0-5-1.5-8.4-6-8.4s-7 3.3-7 8.4v22H42Z" />
      </g>
    ),
  },
  assistant: {
    bg: ['#b57cff', '#4a1fcf'],
    draw: (p) => (
      <g>
        <defs>
          <radialGradient id={`${p}a`} cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#fff" /><stop offset=".45" stopColor="#d4b8ff" /><stop offset="1" stopColor="#7b4af0" /></radialGradient>
        </defs>
        <circle cx="50" cy="50" r="30" fill={`url(#${p}a)`} filter={`url(#${p}s)`} />
        <path d="M50 30 54 46 70 50 54 54 50 70 46 54 30 50 46 46Z" fill="#fff" />
        <path d="M74 20 76 26 82 28 76 30 74 36 72 30 66 28 72 26Z" fill="#fff" opacity=".9" />
        <ellipse cx="40" cy="36" rx="9" ry="5" fill="#fff" opacity=".35" transform="rotate(-35 40 36)" />
      </g>
    ),
  },
} satisfies Record<string, IconDef>;
