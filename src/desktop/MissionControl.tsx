import { useEffect, useRef, useSyncExternalStore } from 'react';
import { launchApp, useDesktop } from './store';
import type { AppId } from './types';
import './desktop.css';

let open = false;
const listeners = new Set<() => void>();
function setOpen(next: boolean): void {
  if (next === open) return;
  open = next;
  listeners.forEach((l) => l());
}
export const toggleMissionControl = (): void => setOpen(!open);

const useOpen = (): boolean =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => open,
    () => false,
  );

export function MissionControl() {
  const isOpen = useOpen();
  const { windows } = useDesktop();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'F3' || (event.ctrlKey && event.key === 'ArrowUp')) {
        event.preventDefault();
        toggleMissionControl();
      } else if (event.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (isOpen) ref.current?.querySelector<HTMLElement>('button')?.focus();
  }, [isOpen]);

  if (!isOpen) return null;
  const pick = (app: AppId): void => {
    setOpen(false);
    launchApp(app);
  };
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Mission Control. Open windows"
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-[19000] overflow-auto p-10 pt-16"
      style={{ background: 'rgba(8,10,16,0.45)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
    >
      {windows.length === 0 ? (
        <p className="m-0 text-center text-white">No open windows. Press Esc to return.</p>
      ) : (
        <ul className="m-0 grid list-none gap-8 p-0" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {windows.map((win) => (
            <li key={win.id} className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); pick(win.app); }}
                aria-label={`${win.title}${win.isMinimized ? ' (minimized)' : ''}`}
                className="mc-card glass w-full rounded-xl p-3 text-left"
                style={{ aspectRatio: `${win.size.width} / ${win.size.height}`, maxHeight: 260, color: 'var(--ink)', opacity: win.isMinimized ? 0.6 : 1 }}
              >
                <span className="text-[13px] font-semibold">{win.title}</span>
              </button>
              <span className="text-[13px] text-white">{win.title}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
