import { useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import { moveWindow, resizeWindow } from './store';
import type { DesktopWindow } from './types';

export type Edge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
export const EDGES: Edge[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
const MIN_W = 320;
const MIN_H = 220;

const CURSORS: Record<Edge, string> = { n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize', ne: 'nesw-resize', sw: 'nesw-resize', nw: 'nwse-resize', se: 'nwse-resize' };

function placement(edge: Edge): CSSProperties {
  const side = 6;
  const corner = 14;
  const style: CSSProperties = {};
  if (edge.length === 2) {
    Object.assign(style, { width: corner, height: corner });
  } else if (edge === 'n' || edge === 's') {
    Object.assign(style, { left: corner, right: corner, height: side });
  } else {
    Object.assign(style, { top: corner, bottom: corner, width: side });
  }
  if (edge.includes('n')) style.top = -4;
  if (edge.includes('s')) style.bottom = -4;
  if (edge.includes('e')) style.right = -4;
  if (edge.includes('w')) style.left = -4;
  return style;
}

export function ResizeHandle({ win, edge }: { win: DesktopWindow; edge: Edge }) {
  const origin = useRef<{ x: number; y: number; px: number; py: number; w: number; h: number } | null>(null);

  const onDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    event.stopPropagation();
    origin.current = { x: event.clientX, y: event.clientY, px: win.position.x, py: win.position.y, w: win.size.width, h: win.size.height };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const o = origin.current;
    if (!o) return;
    const dx = event.clientX - o.x;
    const dy = event.clientY - o.y;
    const width = edge.includes('e') ? o.w + dx : edge.includes('w') ? Math.max(MIN_W, o.w - dx) : o.w;
    const height = edge.includes('s') ? o.h + dy : edge.includes('n') ? Math.max(MIN_H, o.h - dy) : o.h;
    resizeWindow(win.id, { width, height });
    // West/north edges also move the origin so the opposite edge stays put.
    if (edge.includes('w') || edge.includes('n')) {
      moveWindow(win.id, { x: edge.includes('w') ? o.px + (o.w - width) : o.px, y: edge.includes('n') ? o.py + (o.h - height) : o.py });
    }
  };
  return <div aria-hidden="true" style={{ position: 'absolute', cursor: CURSORS[edge], touchAction: 'none', ...placement(edge) }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={() => (origin.current = null)} />;
}

const GLYPHS: Record<string, string> = {
  Close: 'M3 3l6 6M9 3l-6 6',
  Minimize: 'M2.5 6h7',
  Zoom: 'M3.5 3.5h5v5zM8.5 8.5h-5v-5z',
};

export function TrafficLight({ label, color, onClick }: { label: 'Close' | 'Minimize' | 'Zoom'; color: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} title={label} className="tl-btn" onClick={onClick} onPointerDown={(event) => event.stopPropagation()}>
      <span className="tl-dot" style={{ background: color }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" aria-hidden="true">
          <path d={GLYPHS[label]} fill={label === 'Zoom' ? 'currentColor' : 'none'} />
        </svg>
      </span>
    </button>
  );
}
