import { Suspense, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
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

interface Props {
  win: DesktopWindow;
  focused: boolean;
  mobile: boolean;
}

type Edge = 'e' | 's' | 'se';

function frameStyle(win: DesktopWindow, mobile: boolean): CSSProperties {
  if (mobile) return { top: MENU_BAR_HEIGHT, left: 0, right: 0, bottom: 64, zIndex: win.zIndex };
  if (win.isMaximized) {
    return { top: MENU_BAR_HEIGHT, left: 0, width: '100%', height: `calc(100% - ${MENU_BAR_HEIGHT + DOCK_RESERVE - 12}px)`, zIndex: win.zIndex };
  }
  return { top: win.position.y, left: win.position.x, width: win.size.width, height: win.size.height, zIndex: win.zIndex };
}

function ResizeHandle({ win, edge }: { win: DesktopWindow; edge: Edge }) {
  const start = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const cursor = edge === 'e' ? 'ew-resize' : edge === 's' ? 'ns-resize' : 'nwse-resize';
  const place: CSSProperties =
    edge === 'e' ? { right: -3, top: 8, bottom: 8, width: 6 } : edge === 's' ? { bottom: -3, left: 8, right: 8, height: 6 } : { right: -4, bottom: -4, width: 14, height: 14 };

  const onDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    event.stopPropagation();
    start.current = { x: event.clientX, y: event.clientY, w: win.size.width, h: win.size.height };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const origin = start.current;
    if (!origin) return;
    resizeWindow(win.id, {
      width: edge === 's' ? origin.w : origin.w + event.clientX - origin.x,
      height: edge === 'e' ? origin.h : origin.h + event.clientY - origin.y,
    });
  };
  return <div aria-hidden="true" style={{ position: 'absolute', cursor, touchAction: 'none', ...place }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={() => (start.current = null)} />;
}

function TrafficLight({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      onPointerDown={(event) => event.stopPropagation()}
      className="h-3 w-3 rounded-full border"
      style={{ background: color, borderColor: 'rgba(0,0,0,0.18)' }}
    />
  );
}

export function WindowFrame({ win, focused, mobile }: Props) {
  const AppView = APP_COMPONENTS[win.app];
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const canDrag = !mobile && !win.isMaximized;

  const startDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    if (!canDrag || event.button !== 0) return;
    drag.current = { dx: event.clientX - win.position.x, dy: event.clientY - win.position.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onDrag = (event: ReactPointerEvent<HTMLElement>): void => {
    const origin = drag.current;
    if (origin) moveWindow(win.id, { x: event.clientX - origin.dx, y: event.clientY - origin.dy });
  };

  return (
    <section
      role="dialog"
      aria-label={win.title}
      className="win-in fixed flex flex-col overflow-hidden"
      style={{
        ...frameStyle(win, mobile),
        display: win.isMinimized ? 'none' : 'flex',
        background: 'var(--surface)',
        border: '1px solid var(--hairline)',
        borderRadius: mobile ? 0 : 'var(--radius)',
        boxShadow: focused ? '0 18px 50px rgba(0,0,0,0.38)' : '0 8px 24px rgba(0,0,0,0.22)',
      }}
      onPointerDownCapture={() => focusWindow(win.id)}
    >
      <header
        className="flex h-[38px] flex-none items-center gap-3 px-3"
        style={{ background: 'var(--chrome)', borderBottom: '1px solid var(--hairline)', cursor: canDrag ? 'grab' : 'default', touchAction: 'none' }}
        onPointerDown={startDrag}
        onPointerMove={onDrag}
        onPointerUp={() => (drag.current = null)}
        onDoubleClick={() => !mobile && toggleMaximize(win.id)}
      >
        <div className="flex gap-2">
          <TrafficLight label="Close" color="#e5645a" onClick={() => closeWindow(win.id)} />
          {!mobile && <TrafficLight label="Minimize" color="#e0b44a" onClick={() => minimizeWindow(win.id)} />}
          {!mobile && <TrafficLight label={win.isMaximized ? 'Restore' : 'Maximize'} color="#5cb870" onClick={() => toggleMaximize(win.id)} />}
        </div>
        <span className="flex h-4 w-4 items-center" style={{ color: 'var(--muted)', opacity: focused ? 1 : 0.6 }}>
          {APP_ICONS[win.app]}
        </span>
        <h2 className="m-0 truncate text-[13px] font-medium" style={{ color: focused ? 'var(--ink)' : 'var(--muted)' }}>
          {win.title}
        </h2>
      </header>
      <div className="min-h-0 flex-1 overflow-auto" style={{ color: 'var(--ink)' }}>
        <ErrorBoundary label={win.title}>
          <Suspense fallback={<div className="p-6 text-sm" style={{ color: 'var(--muted)' }}>Loading…</div>}>
            <AppView windowId={win.id} params={win.params} />
          </Suspense>
        </ErrorBoundary>
      </div>
      {canDrag && (
        <>
          <ResizeHandle win={win} edge="e" />
          <ResizeHandle win={win} edge="s" />
          <ResizeHandle win={win} edge="se" />
        </>
      )}
    </section>
  );
}
