import { useEffect, useId, useRef } from 'react';
import { DEFAULT_STYLE, setMiniMeStyle, useWidgetPrefs, type MiniMeStyle } from './prefs';
import { Card, muted } from './Card';

const SHIRTS = ['#b3262e', '#1d4ed8', '#0f766e', '#7c3aed', '#111827', '#f59e0b'];
const SKINS = ['#f1c9a5', '#cf9870', '#c68642', '#8d5524', '#5c3a21'];
const HAIRS = ['#1b1613', '#4a2c17', '#a56b2a', '#d9b25f', '#7a7a7a'];
const INK = '#1a1414';

function Mascot({ style }: { style: MiniMeStyle }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const plaid = `plaid${uid}`;
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let frame = 0;
    const move = (e: PointerEvent): void => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        box.current?.style.setProperty('--hx', `${(x * 4).toFixed(2)}px`);
        box.current?.style.setProperty('--hy', `${(y * 3).toFixed(2)}px`);
        box.current?.style.setProperty('--hr', `${(x * 4).toFixed(2)}deg`);
      });
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
    };
  }, []);

  const line = { stroke: INK, strokeWidth: 4, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <div ref={box} className="sage" role="img" aria-label="Sage, a cartoon mascot of Sohom with thin round glasses and messy short hair, giving a thumbs up">
      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
        <defs>
          <pattern id={plaid} width="24" height="24" patternUnits="userSpaceOnUse">
            <rect width="24" height="24" fill={style.shirt} />
            <rect y="5" width="24" height="9" fill="rgba(12,10,16,0.62)" />
            <rect x="5" width="9" height="24" fill="rgba(12,10,16,0.62)" />
            <rect y="19" width="24" height="1.6" fill="rgba(0,0,0,0.5)" />
            <rect x="19" width="1.6" height="24" fill="rgba(0,0,0,0.5)" />
          </pattern>
        </defs>
        <g className="sage-bob">
          <rect x="89" y="116" width="22" height="26" rx="8" fill={style.skin} {...line} />
          <path d="M40 202 C40 152 70 136 100 136 C130 136 160 152 160 202 Z" fill={`url(#${plaid})`} {...line} />
          <path d="M83 137 L100 160 L117 137 Z" fill={style.skin} {...line} strokeWidth={3} />
          <path d="M96 175 h8 v6 h-8z" fill={INK} opacity="0.55" />
          <g>
            <path d="M52 152 C44 168 42 184 44 200" fill="none" stroke={INK} strokeWidth="26" strokeLinecap="round" />
            <path d="M52 152 C44 168 42 184 44 200" fill="none" stroke={`url(#${plaid})`} strokeWidth="19" strokeLinecap="round" />
          </g>
          <g className="sage-arm">
            <path d="M148 152 C168 148 176 132 172 112" fill="none" stroke={INK} strokeWidth="26" strokeLinecap="round" />
            <path d="M148 152 C168 148 176 132 172 112" fill="none" stroke={`url(#${plaid})`} strokeWidth="19" strokeLinecap="round" />
            <ellipse cx="172" cy="88" rx="6.5" ry="12" fill={style.skin} {...line} strokeWidth={3.5} />
            <circle cx="172" cy="104" r="12" fill={style.skin} {...line} strokeWidth={3.5} />
            <path d="M163 105 h16 M164 110 h14" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          </g>
          <g className="sage-head">
            <circle cx="60" cy="92" r="8.5" fill={style.skin} {...line} strokeWidth={3} />
            <circle cx="140" cy="92" r="8.5" fill={style.skin} {...line} strokeWidth={3} />
            <ellipse cx="100" cy="86" rx="40" ry="44" fill={style.skin} {...line} />
            <path d="M128 78 l-6 10 M133 90 l-6 10 M130 102 l-5 8" stroke={INK} strokeWidth="1.8" strokeLinecap="round" opacity="0.28" />
            <path d="M56 86 C48 52 70 32 102 32 C134 32 152 54 144 86 C143 72 138 63 130 60 L124 69 L116 58 L108 68 L98 57 L90 68 L80 59 L72 70 L66 64 C60 70 57 78 56 86 Z" fill={style.hair} {...line} strokeWidth={3} />
            <path d="M76 44 l12 -5 M96 38 l12 -2 M118 40 l12 4 M70 56 l6 -4 M132 54 l6 4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.2" />
            <path d="M72 74 Q84 67 95 73 M105 73 Q116 67 128 74" fill="none" stroke={style.hair} strokeWidth="5" strokeLinecap="round" />
            <path d="M72 74 Q84 67 95 73 M105 73 Q116 67 128 74" fill="none" stroke={INK} strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
            <g className="sage-eyes">
              <circle cx="84" cy="93" r="3.4" fill={INK} />
              <circle cx="116" cy="93" r="3.4" fill={INK} />
            </g>
            <ellipse cx="84" cy="93" rx="14" ry="12.5" fill="rgba(255,255,255,0.14)" stroke="#2b2b30" strokeWidth="2.2" />
            <ellipse cx="116" cy="93" rx="14" ry="12.5" fill="rgba(255,255,255,0.14)" stroke="#2b2b30" strokeWidth="2.2" />
            <path d="M80 88 q4 -3 8 -1 M112 88 q4 -3 8 -1" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
            <path d="M98 91 Q100 89 102 91 M70 91 L60 88 M130 91 L140 88" fill="none" stroke="#2b2b30" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M100 99 Q96 107 101 109" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
            <path d="M86 115 Q100 128 114 115" fill="#fff" stroke={INK} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="73" cy="109" r="6" fill="#ff6b6b" opacity="0.28" />
            <circle cx="127" cy="109" r="6" fill="#ff6b6b" opacity="0.28" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Swatches({ label, colors, value, onPick }: { label: string; colors: readonly string[]; value: string; onPick: (c: string) => void }) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <span className="w-9 text-[10px]" style={muted}>{label}</span>
      {colors.map((c) => (
        <button key={c} type="button" aria-label={`${label} ${c}`} aria-pressed={value === c} onClick={() => onPick(c)} className="h-4 w-4 rounded-full" style={{ background: c, outline: value === c ? '2px solid var(--accent, #0a84ff)' : '1px solid rgba(255,255,255,0.35)', outlineOffset: 1 }} />
      ))}
    </div>
  );
}

export default function MiniMe() {
  const { style } = useWidgetPrefs();
  return (
    <Card label="Sage">
      <div className="relative h-[190px] overflow-hidden rounded-xl" style={{ background: 'linear-gradient(160deg, color-mix(in srgb, var(--accent) 38%, transparent), transparent)' }}>
        <Mascot style={style} />
        <span className="absolute bottom-2 left-2 rounded-full px-2 py-[2px] text-[11px] font-semibold text-white" style={{ background: 'rgba(0,0,0,0.45)' }}>Sage · I&apos;m okay 👍</span>
      </div>
      <div className="mt-2 space-y-1">
        <Swatches label="Shirt" colors={SHIRTS} value={style.shirt} onPick={(shirt) => setMiniMeStyle({ shirt })} />
        <Swatches label="Skin" colors={SKINS} value={style.skin} onPick={(skin) => setMiniMeStyle({ skin })} />
        <Swatches label="Hair" colors={HAIRS} value={style.hair} onPick={(hair) => setMiniMeStyle({ hair })} />
        <button type="button" onClick={() => setMiniMeStyle(DEFAULT_STYLE)} className="text-[10.5px] underline" style={muted}>Reset look</button>
      </div>
    </Card>
  );
}
