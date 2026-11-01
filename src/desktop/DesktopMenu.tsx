import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { openOverlay } from './overlays';
import { launchApp, openApp } from './store';
import { toggleWidgets, useWidgetsVisible } from './Widgets';
import './desktop.css';

const SOURCE_URL = 'https://github.com/Sagexd08/Portfolio';
const MENU_W = 230;
const MENU_H = 300;
const ITEM = '[role^="menuitem"]:not([disabled])';

interface Entry {
  label: string;
  run?: () => void;
  checked?: boolean;
  separator?: boolean;
}

/**
 * Right-click menu for the bare desktop. It listens in the capture phase and stops propagation,
 * so the older menu in Eggs.tsx never opens; its three easter-egg actions are folded in here.
 */
export function DesktopMenu() {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const widgets = useWidgetsVisible();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onContext = (event: MouseEvent): void => {
      const target = event.target as HTMLElement;
      if (!target.closest('.wallpaper, main') || target.closest('section')) return;
      event.preventDefault();
      event.stopPropagation();
      setAt({ x: Math.min(event.clientX, window.innerWidth - MENU_W - 8), y: Math.min(event.clientY, window.innerHeight - MENU_H) });
    };
    window.addEventListener('contextmenu', onContext, true);
    return () => window.removeEventListener('contextmenu', onContext, true);
  }, []);

  useEffect(() => {
    if (!at) return;
    ref.current?.querySelector<HTMLElement>(ITEM)?.focus();
    const close = (event: Event): void => {
      if (!ref.current?.contains(event.target as Node)) setAt(null);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [at]);

  if (!at) return null;
  const entries: Entry[] = [
    { label: 'New Folder' },
    { label: 'Change Wallpaper…', run: () => openOverlay('control') },
    { label: 'Show Widgets', checked: widgets, run: toggleWidgets },
    { label: 'sep1', separator: true },
    { label: 'Train a tiny neural net…', run: () => openApp('playground') },
    { label: 'Open embedding space…', run: () => openApp('embeddings') },
    { label: 'View this site’s source', run: () => window.open(SOURCE_URL, '_blank', 'noopener,noreferrer') },
    { label: 'sep2', separator: true },
    { label: 'About This Mac', run: () => launchApp('about') },
  ];

  const onKeyDown = (event: KeyboardEvent): void => {
    const items = [...(ref.current?.querySelectorAll<HTMLElement>(ITEM) ?? [])];
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === 'Escape') setAt(null);
    else if (event.key === 'ArrowDown') items[(index + 1) % items.length]?.focus();
    else if (event.key === 'ArrowUp') items[(index - 1 + items.length) % items.length]?.focus();
    else return;
    event.preventDefault();
  };

  return (
    <div
      ref={ref}
      role="menu"
      aria-label="Desktop"
      onKeyDown={onKeyDown}
      className="glass win-in fixed z-[25000] py-1"
      style={{ left: at.x, top: at.y, width: MENU_W, borderRadius: 12, color: 'var(--ink)' }}
    >
      {entries.map((e) =>
        e.separator ? (
          <div key={e.label} role="separator" className="my-1 h-px" style={{ background: 'var(--hairline)' }} />
        ) : (
          <button
            key={e.label}
            type="button"
            role={e.checked === undefined ? 'menuitem' : 'menuitemcheckbox'}
            aria-checked={e.checked}
            disabled={!e.run}
            onClick={() => { setAt(null); e.run?.(); }}
            className="block w-full px-3 py-[5px] text-left text-[12.5px] disabled:opacity-40"
          >
            {e.checked !== undefined && <span aria-hidden="true">{e.checked ? '✓ ' : ' '}</span>}
            {e.label}
          </button>
        ),
      )}
    </div>
  );
}
