import { useEffect, useRef, useState } from 'react';
import { profile } from '../content/portfolio';
import { openApp } from './store';
import { useReducedMotion } from './useMedia';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const SOURCE_URL = 'https://github.com/Sagexd08/Portfolio';
const LR = 0.012;
const MAX_STEPS = 260;

// Himmelblau's function: four minima, a classic optimizer benchmark.
const f = (x: number, y: number): number => (x * x + y - 11) ** 2 + (x + y * y - 7) ** 2;
const grad = (x: number, y: number): [number, number] => [
  4 * x * (x * x + y - 11) + 2 * (x + y * y - 7),
  2 * (x * x + y - 11) + 4 * y * (x + y * y - 7),
];

function GradientDescent({ onClose, reduced }: { onClose: () => void; reduced: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [loss, setLoss] = useState<number | null>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    const w = (el.width = window.innerWidth);
    const h = (el.height = window.innerHeight);
    const toPx = (x: number, y: number): [number, number] => [((x + 6) / 12) * w, ((6 - y) / 12) * h];
    const cell = 14;
    for (let px = 0; px < w; px += cell) {
      for (let py = 0; py < h; py += cell) {
        const v = Math.log1p(f((px / w) * 12 - 6, 6 - (py / h) * 12));
        ctx.fillStyle = `hsl(${220 - v * 22}, 40%, ${10 + Math.max(0, 14 - v * 2.4)}%)`;
        ctx.fillRect(px, py, cell, cell);
      }
    }
    let [x, y] = [-0.3 + Math.random() * 0.6, -4 + Math.random() * 0.6];
    let step = 0;
    let frame = 0;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    const advance = (): void => {
      const [gx, gy] = grad(x, y);
      const [ax, ay] = toPx(x, y);
      x -= LR * gx;
      y -= LR * gy;
      const [bx, by] = toPx(x, y);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      step += 1;
    };
    const tick = (): void => {
      for (let i = 0; i < 3 && step < MAX_STEPS; i++) advance();
      setLoss(f(x, y));
      if (step < MAX_STEPS) frame = requestAnimationFrame(tick);
    };
    if (reduced) {
      while (step < MAX_STEPS) advance();
      setLoss(f(x, y));
    } else frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduced]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Gradient descent easter egg" className="fixed inset-0 z-[30000]" onClick={onClose}>
      <canvas ref={canvas} className="h-full w-full" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-16 text-center text-white">
        <p className="mono m-0 text-[13px]" role="status">step-size {LR} · loss = {loss === null ? '…' : loss.toFixed(5)}{loss !== null && loss < 0.01 ? ' · converged ✓' : ''}</p>
        <p className="m-0 mt-2 text-[15px]">Gradient descent on Himmelblau&rsquo;s function. {profile.name} is open to ML engineering roles.</p>
        <p className="m-0 mt-1 text-[12px] opacity-70">Click or press Esc to close</p>
      </div>
    </div>
  );
}

function ContextMenu({ at, onClose }: { at: { x: number; y: number }; onClose: () => void }) {
  const items: { label: string; run: () => void }[] = [
    { label: 'Train a tiny neural net…', run: () => openApp('playground') },
    { label: 'Open embedding space…', run: () => openApp('embeddings') },
    { label: 'View this site’s source', run: () => window.open(SOURCE_URL, '_blank', 'noopener,noreferrer') },
  ];
  useEffect(() => {
    const close = (): void => onClose();
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', close);
    };
  }, [onClose]);
  return (
    <div role="menu" aria-label="Desktop" className="win-in fixed z-[25000] min-w-[220px] rounded-lg py-1" style={{ left: at.x, top: at.y, background: 'var(--chrome)', border: '1px solid var(--hairline)', boxShadow: '0 14px 36px rgba(0,0,0,0.4)', color: 'var(--ink)' }} onPointerDown={(event) => event.stopPropagation()}>
      {items.map((item) => (
        <button key={item.label} type="button" role="menuitem" onClick={() => { onClose(); item.run(); }} className="block w-full px-3 py-[5px] text-left text-[12.5px]">
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function Eggs() {
  const [descent, setDescent] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const progress = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    console.info(
      '%c▍ Hello, curious one.%c\nI am looking for forward-deployed and ML engineering roles.\nTry: ↑↑↓↓←→←→BA, right-click the desktop, or click the logo seven times.\n' + profile.email,
      'font: 600 14px ui-monospace, monospace',
      'font: 12px ui-monospace, monospace',
    );
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      progress.current = key === KONAMI[progress.current] ? progress.current + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress.current === KONAMI.length) {
        progress.current = 0;
        setDescent(true);
      }
    };
    const onContext = (event: MouseEvent): void => {
      if (!(event.target as HTMLElement).closest('.wallpaper, main')) return;
      if ((event.target as HTMLElement).closest('section')) return;
      event.preventDefault();
      setMenu({ x: Math.min(event.clientX, window.innerWidth - 230), y: Math.min(event.clientY, window.innerHeight - 120) });
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('contextmenu', onContext);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('contextmenu', onContext);
    };
  }, []);

  return (
    <>
      {descent && <GradientDescent reduced={reduced} onClose={() => setDescent(false)} />}
      {menu && <ContextMenu at={menu} onClose={() => setMenu(null)} />}
    </>
  );
}
