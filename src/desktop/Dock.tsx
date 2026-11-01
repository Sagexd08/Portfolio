import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { APP_ICONS } from './apps';
import { APP_META, DOCK_ORDER } from './appMeta';
import { DockMenu, type DockMenuItem } from './dockMenu';
import { LAUNCHPAD_ICON, TRASH_ICON } from './icons';
import { toggleOverlay } from './overlays';
import { closeWindow, launchApp, openApp, useDesktop } from './store';
import type { AppId } from './types';
import './dock.css';

const BOUNCE_MS = 720;
const MAX_SCALE = 1.7;
const ICON = 52;
const SLOT = 58;
const RADIUS = SLOT * 3;
const LERP = 0.2;
const LONG_PRESS_MS = 500;
const PHONE_ICON = 48;
const PHONE_PINNED: AppId[] = ['finder', 'messages', 'projects', 'contact'];
const DEFAULT_BADGES: Partial<Record<AppId, number>> = { messages: 7 };

type DockId = AppId | 'trash';
interface DockItem { id: DockId; label: string; icon: ReactNode }

/** Cosine falloff: 1 at the pointer, back to rest scale at RADIUS. */
function scaleAt(distance: number): number {
  if (distance >= RADIUS) return 1;
  return 1 + (MAX_SCALE - 1) * (0.5 + 0.5 * Math.cos((Math.PI * distance) / RADIUS));
}

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.hasAttribute('data-reduce-motion');

const appItem = (id: AppId): DockItem => ({ id, label: APP_META[id].title, icon: APP_ICONS[id] });

interface MenuState { id: AppId; x: number; bottom: number }

export function Dock({ mobile, badges = DEFAULT_BADGES }: { mobile: boolean; badges?: Partial<Record<AppId, number>> }) {
  const { windows, focusedId } = useDesktop();
  const [bouncing, setBouncing] = useState<AppId | null>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const slots = useRef<(HTMLDivElement | null)[]>([]);
  const press = useRef({ timer: 0, fired: false });
  const mag = useRef({ x: null as number | null, rest: [] as number[], scales: [] as number[], raf: 0 });

  const docked = mobile ? PHONE_PINNED : DOCK_ORDER;
  const extras = mobile ? [] : windows.filter((win) => !DOCK_ORDER.includes(win.app)).map((win) => win.app);
  const items: DockItem[] = [...docked, ...extras].map(appItem);
  const trash: DockItem = { id: 'trash', label: 'Trash', icon: TRASH_ICON };
  const dividerAt = items.length;
  const all = mobile ? items : [...items, trash];

  const tick = useCallback((): void => {
    const state = mag.current;
    let moving = false;
    let extra = 0;
    let nearest = -1;
    let nearestDist = Infinity;
    state.scales = all.map((_, i) => {
      const goal = state.x === null ? 1 : scaleAt(Math.abs(state.x - (state.rest[i] ?? 0)));
      const now = state.scales[i] ?? 1;
      const next = Math.abs(goal - now) < 0.003 ? goal : now + (goal - now) * LERP;
      if (next !== goal) moving = true;
      extra += (next - 1) * SLOT;
      const dist = Math.abs((state.x ?? Infinity) - (state.rest[i] ?? 0));
      if (dist < nearestDist) { nearest = i; nearestDist = dist; }
      return next;
    });
    let before = 0;
    state.scales.forEach((s, i) => {
      if (i < nearest) before += (s - 1) * SLOT;
    });
    state.scales.forEach((s, i) => {
      const el = slots.current[i];
      if (!el) return;
      el.style.width = `${SLOT * s}px`;
      el.style.setProperty('--s', String(s));
      (el.firstElementChild as HTMLElement | null)?.style.setProperty('transform', s === 1 ? '' : `scale(${s})`);
    });
    // Keep the icon under the pointer: shift the (centred, growing) bar so the nearest slot stays put.
    let shift = 0;
    if (nearest >= 0 && state.x !== null) {
      const s = state.scales[nearest];
      const restCentre = state.rest[nearest];
      const actual = restCentre - extra / 2 + before + ((s - 1) * SLOT) / 2;
      shift = restCentre + (state.x - restCentre) * s - actual;
    }
    if (bar.current) bar.current.style.transform = state.x === null && !moving ? '' : `translateX(${shift}px)`;
    state.raf = moving || state.x !== null ? requestAnimationFrame(tick) : 0;
  }, [all.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = (): void => { if (!mag.current.raf) mag.current.raf = requestAnimationFrame(tick); };
  const onEnter = (): void => {
    if (mag.current.raf) return;
    mag.current.rest = all.map((_, i) => {
      const rect = slots.current[i]?.getBoundingClientRect();
      return rect ? rect.left + rect.width / 2 : 0;
    });
  };
  const onMove = (event: MouseEvent<HTMLDivElement>): void => {
    if (mobile || prefersReducedMotion()) return;
    mag.current.x = event.clientX;
    start();
  };
  const onLeave = (): void => { mag.current.x = null; start(); };
  useEffect(() => () => cancelAnimationFrame(mag.current.raf), []);

  const open = (id: DockId): void => {
    if (press.current.fired) { press.current.fired = false; return; }
    if (id === 'trash') { openApp('finder'); return; }
    if (!windows.some((win) => win.app === id)) {
      setBouncing(id);
      window.setTimeout(() => setBouncing(null), BOUNCE_MS);
    }
    launchApp(id);
  };

  const showMenu = (id: DockId, target: HTMLElement, x: number): void => {
    if (id === 'trash') return;
    setMenu({ id, x, bottom: window.innerHeight - target.getBoundingClientRect().top + 10 });
  };
  const onContext = (event: MouseEvent<HTMLElement>, id: DockId): void => {
    event.preventDefault();
    showMenu(id, event.currentTarget, event.clientX);
  };
  const onPointerDown = (event: PointerEvent<HTMLElement>, id: DockId): void => {
    if (event.pointerType !== 'touch') return;
    const target = event.currentTarget;
    const x = event.clientX;
    window.clearTimeout(press.current.timer);
    press.current.timer = window.setTimeout(() => { press.current.fired = true; showMenu(id, target, x); }, LONG_PRESS_MS);
  };
  const cancelPress = (): void => window.clearTimeout(press.current.timer);

  const closeMenu = useCallback(() => setMenu(null), []);
  const menuItems = (id: AppId): DockMenuItem[] => {
    const win = windows.find((item) => item.app === id);
    return [
      { label: 'Open', onSelect: () => launchApp(id) },
      { label: 'Show in Finder', onSelect: () => openApp('finder') },
      { label: 'Options', onSelect: () => openApp('help') },
      { label: 'Quit', disabled: !win, onSelect: () => win && closeWindow(win.id) },
    ];
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const buttons = Array.from(bar.current?.querySelectorAll('button') ?? []);
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const step = event.key === 'ArrowRight' ? 1 : -1;
    buttons[(at + step + buttons.length) % buttons.length]?.focus();
  };

  const size = mobile ? PHONE_ICON : ICON;
  const renderSlot = (item: DockItem, index: number): ReactNode => {
    const win = item.id === 'trash' ? undefined : windows.find((w) => w.app === item.id);
    const count = item.id === 'trash' ? undefined : badges[item.id];
    return (
      <div
        key={item.id}
        ref={(el) => { slots.current[index] = el; }}
        data-dock-app={item.id}
        className={`dock-slot relative flex flex-none flex-col items-center ${bouncing === item.id ? 'dock-bounce' : ''}`}
        style={{ width: mobile ? undefined : SLOT, minWidth: mobile ? 44 : undefined }}
      >
        <div className="relative" style={{ width: size, height: size, transformOrigin: 'bottom center', willChange: mobile ? undefined : 'transform' }}>
          <button
            type="button"
            aria-label={win ? `${item.label} (open)` : item.label}
            aria-pressed={win ? focusedId === win.id : undefined}
            onClick={() => open(item.id)}
            onContextMenu={(event) => onContext(event, item.id)}
            onPointerDown={(event) => onPointerDown(event, item.id)}
            onPointerUp={cancelPress}
            onPointerLeave={cancelPress}
            onPointerCancel={cancelPress}
            className="block"
            style={{ width: size, height: size, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))', WebkitTouchCallout: 'none' }}
          >
            {item.icon}
          </button>
          {count ? <span className="dock-badge" aria-label={`${count} unread`}>{count}</span> : null}
        </div>
        {mobile ? null : <span role="tooltip" className="dock-tip glass" style={{ borderRadius: 8 }}>{item.label}</span>}
        <span
          aria-hidden="true"
          className="mt-1 h-1 w-1 rounded-full"
          style={{ background: win ? 'var(--ink)' : 'transparent', opacity: win?.isMinimized ? 0.35 : 1 }}
        />
      </div>
    );
  };

  const slotNodes: ReactNode[] = [];
  all.forEach((item, index) => {
    if (!mobile && index === dividerAt) slotNodes.push(<span key="divider" aria-hidden="true" className="dock-divider flex-none" />);
    slotNodes.push(renderSlot(item, index));
  });

  return (
    <nav aria-label="Dock" className="fixed inset-x-0 bottom-0 z-[9000] flex justify-center px-2" style={{ paddingBottom: mobile ? 'max(8px, env(safe-area-inset-bottom))' : 12, pointerEvents: 'none' }}>
      <div
        ref={bar}
        onKeyDown={onKeyDown}
        onMouseEnter={onEnter}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={mobile ? 'glass glass-dock flex max-w-full items-end justify-around gap-1 px-3 pb-2 pt-2' : 'glass glass-dock relative flex items-end px-3 pb-2 pt-2'}
        style={{ pointerEvents: 'auto' }}
      >
        {slotNodes}
        {mobile ? (
          <div className="flex flex-none flex-col items-center" style={{ minWidth: 44 }}>
            <button
              type="button"
              data-overlay-toggle
              aria-label="Launchpad"
              onClick={() => toggleOverlay('launchpad')}
              style={{ width: size, height: size, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
            >
              {LAUNCHPAD_ICON}
            </button>
            <span aria-hidden="true" className="mt-1 h-1 w-1" />
          </div>
        ) : null}
      </div>
      {menu ? <DockMenu x={menu.x} bottom={menu.bottom} items={menuItems(menu.id)} onClose={closeMenu} /> : null}
    </nav>
  );
}
