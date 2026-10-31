import { useRef, useState, type KeyboardEvent } from 'react';
import { APP_ICONS } from './apps';
import { APP_META, DOCK_ORDER } from './appMeta';
import { launchApp, useDesktop } from './store';
import type { AppId } from './types';

const BOUNCE_MS = 420;

function magnification(index: number, hovered: number | null): number {
  if (hovered === null) return 1;
  return 1 + 0.32 * Math.max(0, 1 - Math.abs(index - hovered) / 2);
}

export function Dock({ mobile }: { mobile: boolean }) {
  const { windows, focusedId } = useDesktop();
  const [hovered, setHovered] = useState<number | null>(null);
  const [bouncing, setBouncing] = useState<AppId | null>(null);
  const bar = useRef<HTMLDivElement>(null);

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
        onMouseLeave={() => setHovered(null)}
        className={mobile ? 'flex h-16 items-center justify-around px-2' : 'flex items-end gap-2 rounded-2xl px-3 pb-2 pt-2'}
        style={{ background: 'color-mix(in srgb, var(--chrome) 88%, transparent)', border: '1px solid var(--hairline)', backdropFilter: 'blur(10px)' }}
      >
        {DOCK_ORDER.map((app, index) => {
          const win = windows.find((item) => item.app === app);
          const label = APP_META[app].title;
          return (
            <div key={app} className="group relative flex flex-col items-center" onMouseEnter={() => setHovered(index)}>
              <span
                role="tooltip"
                className="pointer-events-none absolute -top-8 whitespace-nowrap rounded-md px-2 py-1 text-[11px] opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100"
                style={{ background: 'var(--ink)', color: 'var(--surface)' }}
              >
                {label}
              </span>
              <button
                type="button"
                aria-label={win ? `${label} (open)` : label}
                aria-pressed={focusedId === win?.id}
                onClick={() => open(app)}
                className={`flex items-center justify-center rounded-[12px] ${bouncing === app ? 'dock-bounce' : ''}`}
                style={{
                  width: mobile ? 40 : 48,
                  height: mobile ? 40 : 48,
                  padding: mobile ? 8 : 11,
                  background: 'var(--surface)',
                  border: '1px solid var(--hairline)',
                  color: 'var(--ink)',
                  transform: mobile ? undefined : `scale(${magnification(index, hovered)})`,
                  transformOrigin: 'bottom center',
                  transition: 'transform 160ms var(--ease)',
                }}
              >
                {APP_ICONS[app]}
              </button>
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
