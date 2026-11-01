import { Suspense, memo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { APP_COMPONENTS, APP_ICONS } from './apps';
import { ErrorBoundary } from './ErrorBoundary';
import {
  DOCK_RESERVE,
  MENU_BAR_HEIGHT,
  closeWindow,
  focusWindow,
  minimizeWindow,
  moveWindow,
  resizeWindow,
  toggleMaximize,
} from './store';
import type { DesktopWindow } from './types';
import { EDGES, ResizeHandle, TrafficLight } from './windowParts';

interface Props {
  win: DesktopWindow;
  focused: boolean;
  mobile: boolean;
  /** Optional unified-toolbar content. Apps may also portal into `#<windowId>-toolbar`. */
  toolbar?: ReactNode;
}

type Snap = 'left' | 'right' | 'top' | null;

const DRAG_THRESHOLD = 5;
const SNAP_EDGE = 24;
const EXIT_MS = 200;
const MIN_MS = 280;
const ZOOM_MS = 340;
const GAP = 8;

function frameStyle(win: DesktopWindow, mobile: boolean): CSSProperties {
  if (mobile) return { top: MENU_BAR_HEIGHT, left: 0, right: 0, bottom: 64, zIndex: win.zIndex };
  if (win.isMaximized) {
    return { top: MENU_BAR_HEIGHT, left: 0, width: '100%', height: `calc(100% - ${MENU_BAR_HEIGHT + DOCK_RESERVE - 12}px)`, zIndex: win.zIndex };
  }
  return { top: win.position.y, left: win.position.x, width: win.size.width, height: win.size.height, zIndex: win.zIndex };
}

function snapRect(snap: Exclude<Snap, null>): { x: number; y: number; width: number; height: number } {
  const w = window.innerWidth;
  const height = window.innerHeight - MENU_BAR_HEIGHT - DOCK_RESERVE;
  const half = w / 2 - GAP * 1.5;
  if (snap === 'top') return { x: 0, y: MENU_BAR_HEIGHT, width: w, height: height + 12 };
  return { x: snap === 'left' ? GAP : w / 2 + GAP / 2, y: MENU_BAR_HEIGHT + 4, width: half, height };
}

function snapZone(x: number, y: number): Snap {
  if (y <= MENU_BAR_HEIGHT + 4) return 'top';
  if (x <= SNAP_EDGE) return 'left';
  if (x >= window.innerWidth - SNAP_EDGE) return 'right';
  return null;
}

/** Offset (px) from this window's centre to its dock icon, falling back to bottom centre. */
function dockOffset(el: HTMLElement, app: string): { x: number; y: number } {
  const box = el.getBoundingClientRect();
  const icon = document.querySelector(`[data-dock-app="${app}"]`)?.getBoundingClientRect();
  const tx = icon ? icon.left + icon.width / 2 : window.innerWidth / 2;
  const ty = icon ? icon.top + icon.height / 2 : window.innerHeight - 30;
  return { x: tx - (box.left + box.width / 2), y: ty - (box.top + box.height / 2) };
}

function WindowFrameImpl({ win, focused, mobile, toolbar }: Props) {
  const [exit, setExit] = useState<'close' | 'min' | null>(null);
  const [snap, setSnap] = useState<Snap>(null);
  const [zooming, setZooming] = useState(false);
  const frame = useRef<HTMLElement>(null);
  const drag = useRef<{ sx: number; sy: number; moved: boolean; snap: Snap } | null>(null);
  const AppView = APP_COMPONENTS[win.app];
  const canDrag = !mobile && !win.isMaximized;
  const titleId = `${win.id}-title`;

  const leave = (kind: 'close' | 'min', done: (id: string) => void): void => {
    if (kind === 'min' && frame.current) {
      const { x, y } = dockOffset(frame.current, win.app);
      frame.current.style.setProperty('--min-x', `${x}px`);
      frame.current.style.setProperty('--min-y', `${y}px`);
    }
    setExit(kind);
    window.setTimeout(() => { done(win.id); setExit(null); }, kind === 'min' ? MIN_MS : EXIT_MS);
  };

  const zoom = (): void => {
    if (mobile) return;
    setZooming(true);
    toggleMaximize(win.id);
    window.setTimeout(() => setZooming(false), ZOOM_MS);
  };

  const startDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    if (!canDrag || event.button !== 0) return;
    drag.current = { sx: event.clientX, sy: event.clientY, moved: false, snap: null };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    const d = drag.current;
    if (!d || !frame.current) return;
    const dx = event.clientX - d.sx;
    const dy = event.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    d.moved = true;
    frame.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    const zone = snapZone(event.clientX, event.clientY);
    if (zone !== d.snap) { d.snap = zone; setSnap(zone); }
  };
  const cancelDrag = (): void => {
    drag.current = null;
    if (frame.current) frame.current.style.transform = '';
    setSnap(null);
  };
  const endDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved || !frame.current) return;
    frame.current.style.transform = '';
    setSnap(null);
    if (d.snap === 'top') {
      zoom();
    } else if (d.snap) {
      const rect = snapRect(d.snap);
      resizeWindow(win.id, { width: rect.width, height: rect.height });
      moveWindow(win.id, { x: rect.x, y: rect.y });
    } else {
      moveWindow(win.id, { x: win.position.x + event.clientX - d.sx, y: win.position.y + event.clientY - d.sy });
    }
  };

  const preview = snap ? snapRect(snap) : null;

  return (
    <section
      ref={frame}
      role="region"
      aria-labelledby={titleId}
      data-active={focused}
      className={`${exit ? `win-${exit}` : 'win-in'}${zooming ? ' win-zoom' : ''} glass-win fixed flex flex-col overflow-hidden`}
      style={{ ...frameStyle(win, mobile), display: win.isMinimized ? 'none' : 'flex', borderRadius: mobile ? 0 : 'var(--radius-window)' }}
      onPointerDownCapture={() => focusWindow(win.id)}
    >
      <header
        className="win-toolbar flex h-[52px] flex-none items-center gap-2 px-2"
        style={{ cursor: canDrag ? 'grab' : 'default', touchAction: 'none' }}
        onPointerDown={startDrag}
        onPointerMove={onDrag}
        onPointerUp={endDrag}
        onPointerCancel={cancelDrag}
        onDoubleClick={zoom}
      >
        <div className="tl-group">
          <TrafficLight label="Close" color="#FF5F57" onClick={() => leave('close', closeWindow)} />
          {!mobile && <TrafficLight label="Minimize" color="#FEBC2E" onClick={() => leave('min', minimizeWindow)} />}
          {!mobile && <TrafficLight label="Zoom" color="#28C840" onClick={zoom} />}
        </div>
        <div id={`${win.id}-toolbar`} className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex h-4 w-4 flex-none items-center" style={{ opacity: focused ? 1 : 0.6 }}>{APP_ICONS[win.app]}</span>
          <h2 id={titleId} className={`m-0 truncate text-[13px] font-semibold leading-4 ${toolbar ? 'sr-only' : ''}`} style={{ color: focused ? 'var(--label)' : 'var(--label-secondary)' }}>
            {win.title}
          </h2>
          {toolbar}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-auto" style={{ color: 'var(--ink)' }}>
        <ErrorBoundary label={win.title}>
          <Suspense fallback={<div className="p-6 text-sm" style={{ color: 'var(--muted)' }}>Loading…</div>}>
            <AppView windowId={win.id} params={win.params} />
          </Suspense>
        </ErrorBoundary>
      </div>
      {canDrag && EDGES.map((edge) => <ResizeHandle key={edge} win={win} edge={edge} />)}
      {preview && createPortal(<div className="snap-preview" style={{ left: preview.x, top: preview.y, width: preview.width, height: preview.height }} />, document.body)}
    </section>
  );
}

/** Memoised: other windows do not re-render while one is dragged. */
export const WindowFrame = memo(WindowFrameImpl);
