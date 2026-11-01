import { useEffect, useRef } from 'react';

export interface DockMenuItem {
  label: string;
  disabled?: boolean;
  onSelect: () => void;
}

const MENU_WIDTH = 188;
const EDGE = 8;

/** Right-click / long-press menu that opens above a dock icon. */
export function DockMenu({ x, bottom, items, onClose }: { x: number; bottom: number; items: DockMenuItem[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointer = (event: PointerEvent): void => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const left = Math.min(Math.max(x - MENU_WIDTH / 2, EDGE), window.innerWidth - MENU_WIDTH - EDGE);
  return (
    <div
      ref={ref}
      role="menu"
      className="glass fixed z-[9600] flex flex-col p-1 text-[13px]"
      style={{ left, bottom, width: MENU_WIDTH, borderRadius: 12, pointerEvents: 'auto' }}
      onContextMenu={(event) => event.preventDefault()}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          disabled={item.disabled}
          onClick={() => { item.onSelect(); onClose(); }}
          className="row-hover min-h-[32px] rounded-md px-3 text-left disabled:opacity-40"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
