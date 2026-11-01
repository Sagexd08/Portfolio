import type { ReactNode } from 'react';

// Shared pieces for the original macOS-style app icons: a true superellipse tile plus gradient/shadow helpers.

/** Superellipse (n=5) outline in a 100x100 box: a continuous-curvature squircle, not a rounded rectangle. */
export const SQUIRCLE = (() => {
  const exponent = 2 / 5;
  const steps = 96;
  const points = Array.from({ length: steps }, (_, i) => {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = 50 + 50 * Math.sign(c) * Math.abs(c) ** exponent;
    const y = 50 + 50 * Math.sign(s) * Math.abs(s) ** exponent;
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  return `M${points.join('L')}Z`;
})();

export interface IconDef {
  /** Tile gradient, top then bottom. */
  bg: readonly [string, string];
  /** Glyph layers in a 100x100 box. `p` is a per-instance id prefix; `${p}s` is a ready-made soft drop-shadow filter. */
  draw: (p: string) => ReactNode;
}

interface GradProps { id: string; a: string; b: string; x2?: number; y2?: number }

export function Grad({ id, a, b, x2 = 0, y2 = 1 }: GradProps) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
      <stop offset="0" stopColor={a} />
      <stop offset="1" stopColor={b} />
    </linearGradient>
  );
}

export function IconTile({ def, uid }: { def: IconDef; uid: string }) {
  const p = uid.replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" style={{ display: 'block' }}>
      <defs>
        <clipPath id={`${p}c`}><path d={SQUIRCLE} /></clipPath>
        <Grad id={`${p}b`} a={def.bg[0]} b={def.bg[1]} />
        <Grad id={`${p}h`} a="rgba(255,255,255,0.6)" b="rgba(255,255,255,0)" />
        <linearGradient id={`${p}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.75)" />
          <stop offset="0.45" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.4)" />
        </linearGradient>
        <Grad id={`${p}v`} a="rgba(0,0,0,0)" b="rgba(0,0,0,0.22)" />
        <filter id={`${p}s`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>
      <g clipPath={`url(#${p}c)`}>
        <rect width="100" height="100" fill={`url(#${p}b)`} />
        {def.draw(p)}
        <rect y="62" width="100" height="38" fill={`url(#${p}v)`} />
        <ellipse cx="50" cy="-12" rx="64" ry="46" fill={`url(#${p}h)`} />
        <path d={SQUIRCLE} fill="none" stroke={`url(#${p}r)`} strokeWidth="2.6" />
      </g>
    </svg>
  );
}
