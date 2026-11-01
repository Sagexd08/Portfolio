import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { APP_ICONS } from './apps';
import { APP_META, DOCK_ORDER } from './appMeta';
import { launchApp, useDesktop } from './store';
import type { AppId } from './types';

const BOUNCE_MS = 720;
const MAX_SCALE = 1.5;
const RADIUS = 120;
const EASE = 0.22;

/** Cosine falloff around the pointer, measured from un-magnified icon centres. */
function targetScale(distance: number): number {
  if (distance >= RADIUS) return 1;
  return 1 + (MAX_SCALE - 1) * (0.5 + 0.5 * Math.cos((Math.PI * distance) / RADIUS));
}

export function Dock({ mobile }: { mobile: boolean }) {
  const { windows, focusedId } = useDesktop();
  const [bouncing, setBouncing] = useState<AppId | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const mag = useRef({ x: null as number | null, centers: [] as number[], scales: [] as number[], raf: 0 });

  const tick = (): void => {
    const state = mag.current;
    let moving = false;
    items.current.forEach((el, i) => {
      if (!el) return;
      const goal = state.x === null ? 1 : targetScale(Math.abs(state.x - (state.centers[i] ?? 0)));
      const now = state.scales[i] ?? 1;
      const next = Math.abs(goal - now) < 0.003 ? goal : now + (goal - now) * EASE;
      state.scales[i] = next;
      if (next !== goal) moving = true;
      el.style.transform = next === 1 ? '' : `scale(${next})`;
    });
    state.raf = moving || state.x !== null ? requestAnimationFrame(tick) : 0;
  };
  const start = (): void => { if (!mag.current.raf) mag.current.raf = requestAnimationFrame(tick); };
  const onEnter = (): void => {
    const left = bar.current?.getBoundingClientRect().left ?? 0;
    mag.current.centers = items.current.map((el) => {
      const rect = el?.getBoundingClientRect();
      return rect ? rect.left - left + rect.width / 2 : 0;
    });
  };
  const onMove = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (mobile || !bar.current) return;
    mag.current.x = event.clientX - bar.current.getBoundingClientRect().left;
    start();
  };
  const onLeave = (): void => { mag.current.x = null; start(); };

  useEffect(() => () => cancelAnimationFrame(mag.current.raf), []);

  const open = (app: AppId): void => {
    if (!windows.some((win) => win.app === app)) {
      setBouncing(app);
      window.setTimeout(() => setBouncing(null), BOUNCE_MS);
    }
    launchApp(app);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const buttons = Array.from(bar.current?.querySelectorAll('button') ?? []);
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const step = event.key === 'ArrowRight' ? 1 : -1;
    buttons[(at + step + buttons.length) % buttons.length]?.focus();
  };

  return (
    <nav aria-label="Dock" className={mobile ? 'fixed inset-x-0 bottom-0 z-[9000]' : 'fixed inset-x-0 bottom-3 z-[9000] flex justify-center'}>
      <div
        ref={bar}
        onKeyDown={onKeyDown}
        onMouseEnter={onEnter}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={mobile ? 'glass flex h-16 items-center justify-around px-2' : 'glass glass-dock relative flex items-end gap-3 px-3 pb-2 pt-2'}
        style={mobile ? { borderRadius: 0 } : undefined}
      >
        {DOCK_ORDER.map((app, index) => {
          const win = windows.find((item) => item.app === app);
          const label = APP_META[app].title;
          return (
            <div key={app} className={`group relative flex flex-col items-center ${bouncing === app ? 'dock-bounce' : ''}`}>
              <span
                role="tooltip"
                className="glass pointer-events-none absolute -top-10 z-10 whitespace-nowrap rounded-md px-2 py-1 text-[11px] opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100"
                style={{ borderRadius: 10 }}
              >
                {label}
              </span>
              <div ref={(el) => { items.current[index] = el; }} style={{ transformOrigin: 'bottom center', willChange: mobile ? undefined : 'transform' }}>
                <button
                  type="button"
                  aria-label={win ? `${label} (open)` : label}
                  aria-pressed={focusedId === win?.id}
                  onClick={() => open(app)}
                  className="block"
                  style={{ width: mobile ? 40 : 52, height: mobile ? 40 : 52, borderRadius: '22.37%', boxShadow: '0 4px 10px rgba(0,0,0,0.28)' }}
                >
                  {APP_ICONS[app]}
                </button>
              </div>
              <span
                aria-hidden="true"
                className="mt-1 h-1 w-1 rounded-full"
                style={{ background: win ? 'var(--ink)' : 'transparent', opacity: win?.isMinimized ? 0.35 : 1 }}
              />
            </div>
          );
        })}
      </div>
    </nav>
  );
}
