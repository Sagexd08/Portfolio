import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { toggleOverlay, type Overlay } from './overlays';
import { useMenus, type MenuDef } from './menus';
import { launchApp, openApp } from './store';

const MARK_CLICKS_FOR_EGG = 7;
const MARK_CLICK_WINDOW_MS = 2500;

const Glyph = ({ d, size = 14 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

interface BatteryManager extends EventTarget { level: number; charging: boolean }

function Battery() {
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  useEffect(() => {
    const getBattery = (navigator as Navigator & { getBattery?: () => Promise<BatteryManager> }).getBattery;
    if (!getBattery) return;
    let manager: BatteryManager | undefined;
    const sync = (): void => manager && setBattery({ level: manager.level, charging: manager.charging });
    let cancelled = false;
    void getBattery.call(navigator).then((b) => {
      if (cancelled) return;
      manager = b;
      sync();
      b.addEventListener('levelchange', sync);
      b.addEventListener('chargingchange', sync);
    }).catch(() => undefined);
    return () => {
      cancelled = true;
      manager?.removeEventListener('levelchange', sync);
      manager?.removeEventListener('chargingchange', sync);
    };
  }, []);
  const pct = battery ? Math.round(battery.level * 100) : null;
  return (
    <span className="flex items-center gap-1 px-1 text-[12px]" aria-label={pct === null ? 'Battery' : `Battery ${pct}%${battery?.charging ? ', charging' : ''}`} role="img">
      {pct !== null && <span className="hidden sm:inline">{pct}%</span>}
      <svg width="22" height="12" viewBox="0 0 22 12" fill="none" aria-hidden="true">
        <rect x="0.5" y="0.5" width="18" height="11" rx="3" stroke="currentColor" opacity="0.6" />
        <rect x="2" y="2" width={pct === null ? 15 : Math.max(2, 15 * (battery?.level ?? 1))} height="8" rx="1.8" fill="currentColor" />
        <path d="M20 4v4" stroke="currentColor" strokeLinecap="round" opacity="0.6" />
      </svg>
    </span>
  );
}

function Wifi() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const sync = (): void => setOnline(navigator.onLine);
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => { window.removeEventListener('online', sync); window.removeEventListener('offline', sync); };
  }, []);
  return (
    <span role="img" aria-label={online ? 'Wi-Fi connected' : 'Wi-Fi offline'} className="flex h-5 w-6 items-center justify-center" style={{ opacity: online ? 1 : 0.45 }}>
      <Glyph d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.8 16a5 5 0 0 1 6.4 0M12 19.5v.01" />
    </span>
  );
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);
  const date = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(now);
  const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(now);
  return (
    <time dateTime={now.toISOString()} className="text-[13px] font-medium">
      <span className="hidden sm:inline">{date}&nbsp;&nbsp;</span>
      {time}
    </time>
  );
}

function Dropdown({ menu, onPick }: { menu: MenuDef; onPick: () => void }) {
  return (
    <div role="menu" aria-label={menu.label} className="menu-in glass absolute left-0 top-[26px] min-w-[230px] p-1 text-[13px]" style={{ borderRadius: 'var(--radius-menu)' }}>
      {menu.items.map((item, index) =>
        item === 'sep' ? (
          <hr key={index} className="mx-2 my-1 border-0 border-t" style={{ borderColor: 'var(--separator)' }} />
        ) : (
          <button
            key={item.label}
            type="button"
            role={item.checked === undefined ? 'menuitem' : 'menuitemcheckbox'}
            aria-checked={item.checked}
            disabled={item.disabled}
            onClick={() => { onPick(); item.action(); }}
            className="row-hover grid w-full grid-cols-[14px_16px_1fr_auto] items-center gap-2 px-2 py-[3px] text-left leading-4 disabled:opacity-40"
            style={{ borderRadius: 'var(--radius-menu-item)', color: 'var(--label)' }}
          >
            <span aria-hidden="true">{item.checked && <Glyph d="M5 12.5l4.5 4.5L19 7.5" size={12} />}</span>
            <span aria-hidden="true" style={{ color: 'var(--label-secondary)' }}>{item.icon && <Glyph d={item.icon} size={14} />}</span>
            <span>{item.label}</span>
            <span className="ml-6 text-[12px]" style={{ color: 'var(--label-secondary)' }}>{item.shortcut}</span>
          </button>
        ),
      )}
    </div>
  );
}

const TOGGLES: [NonNullable<Overlay>, string, ReactNode][] = [
  ['launchpad', 'Launchpad', <path key="p" d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z" />],
  ['spotlight', 'Spotlight search', <g key="s"><circle cx="11" cy="11" r="6" /><path d="m20 20-4.2-4.2" /></g>],
  ['control', 'Control Center', <path key="c" d="M4 8h10M18 8h2M4 16h2M10 16h10M14 6v4M6 14v4" />],
];

export function MenuBar({ mobile }: { mobile: boolean }) {
  const menus = useMenus();
  const [openId, setOpenId] = useState<string | null>(null);
  const root = useRef<HTMLElement>(null);
  const clicks = useRef<number[]>([]);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const menusRef = useRef(menus);
  menusRef.current = menus;

  useEffect(() => {
    if (!openId) return;
    const onPointer = (event: PointerEvent): void => {
      if (root.current && !root.current.contains(event.target as Node)) setOpenId(null);
    };
    window.addEventListener('pointerdown', onPointer);
    return () => window.removeEventListener('pointerdown', onPointer);
  }, [openId]);

  // Focus the first enabled item whenever a menu opens.
  useEffect(() => {
    if (openId) root.current?.querySelector<HTMLButtonElement>('[role^="menuitem"]:not(:disabled)')?.focus();
  }, [openId]);

  // Bound shortcuts (Cmd/Ctrl + key) declared in menus.ts.
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent): void => {
      if (!(event.metaKey || event.ctrlKey) || event.shiftKey || event.altKey) return;
      for (const menu of menusRef.current) {
        for (const item of menu.items) {
          if (item !== 'sep' && item.key === event.key.toLowerCase() && !item.disabled) {
            event.preventDefault();
            item.action();
            return;
          }
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const close = (): void => setOpenId(null);
  const toggle = (id: string): void => setOpenId((current) => (current === id ? null : id));

  const onMark = (): void => {
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < MARK_CLICK_WINDOW_MS), now];
    if (clicks.current.length >= MARK_CLICKS_FOR_EGG) {
      clicks.current = [];
      close();
      openApp('embeddings');
      return;
    }
    toggle('name');
  };

  const onMenuKey = (event: KeyboardEvent<HTMLElement>): void => {
    const items = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]:not(:disabled)') ?? []);
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    const ids = menus.map((menu) => menu.id);
    const index = openId ? ids.indexOf(openId) : -1;
    const step = (to: HTMLButtonElement | undefined): void => { event.preventDefault(); to?.focus(); };
    switch (event.key) {
      case 'Escape':
        if (openId) { event.preventDefault(); triggers.current[openId]?.focus(); close(); }
        break;
      case 'ArrowDown':
        if (openId && items.length) step(items[(at + 1) % items.length]);
        else if (document.activeElement && Object.values(triggers.current).includes(document.activeElement as HTMLButtonElement)) {
          event.preventDefault();
          setOpenId(ids.find((id) => triggers.current[id] === document.activeElement) ?? null);
        }
        break;
      case 'ArrowUp':
        if (openId && items.length) step(items[(at - 1 + items.length) % items.length]);
        break;
      case 'Home':
        if (openId) step(items[0]);
        break;
      case 'End':
        if (openId) step(items[items.length - 1]);
        break;
      case 'ArrowRight':
        if (index >= 0) { event.preventDefault(); setOpenId(ids[(index + 1) % ids.length]); }
        break;
      case 'ArrowLeft':
        if (index >= 0) { event.preventDefault(); setOpenId(ids[(index - 1 + ids.length) % ids.length]); }
        break;
    }
  };

  const named = menus.find((menu) => menu.id === 'name');
  const rest = mobile ? [] : menus.filter((menu) => menu.id !== 'name');

  return (
    <header ref={root} onKeyDown={onMenuKey} className="glass-bar fixed inset-x-0 top-0 z-[9500] flex items-center justify-between px-2 text-[13px] font-medium" style={{ height: 28 }}>
      <nav aria-label="Menu bar" className="flex items-center">
        <div className="relative">
          <button
            ref={(el) => { triggers.current.name = el; }}
            type="button"
            aria-label="Portfolio menu"
            aria-haspopup="menu"
            aria-expanded={openId === 'name'}
            onClick={onMark}
            onMouseEnter={() => openId && setOpenId('name')}
            className="mr-2 flex h-5 w-5 items-center justify-center overflow-hidden rounded-full"
            style={{ border: '1px solid rgba(255,255,255,0.6)' }}
          >
            <img src="/brand/avatar-192.png" alt="" width={20} height={20} className="h-full w-full object-cover" />
          </button>
          {openId === 'name' && named && <Dropdown menu={named} onPick={close} />}
        </div>
        {rest.map((menu) => (
          <div key={menu.id} className="relative">
            <button
              ref={(el) => { triggers.current[menu.id] = el; }}
              type="button"
              aria-haspopup="menu"
              aria-expanded={openId === menu.id}
              onClick={() => toggle(menu.id)}
              onMouseEnter={() => openId && setOpenId(menu.id)}
              className="px-2 py-[2px]"
              style={{ borderRadius: 'var(--radius-menu-item)', fontWeight: menu.bold ? 700 : 500, background: openId === menu.id ? 'rgba(255,255,255,0.22)' : 'transparent' }}
            >
              {menu.label}
            </button>
            {openId === menu.id && <Dropdown menu={menu} onPick={close} />}
          </div>
        ))}
      </nav>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => launchApp('contact')}
          className="mr-1 flex max-w-[38vw] items-center gap-1.5 truncate px-2 py-[2px] text-[12px]"
          style={{ borderRadius: 'var(--radius-menu-item)', background: 'rgba(255,255,255,0.14)' }}
        >
          <i aria-hidden="true" className="block h-[6px] w-[6px] flex-none rounded-full" style={{ background: 'var(--ok)' }} />
          <span className="truncate">Open to FDE / ML roles</span>
        </button>
        <Battery />
        <Wifi />
        {TOGGLES.map(([id, label, glyph]) => (
          <button key={id} type="button" data-overlay-toggle aria-label={label} onClick={() => toggleOverlay(id)} className="flex h-5 w-6 items-center justify-center rounded">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">{glyph}</svg>
          </button>
        ))}
        <button type="button" data-overlay-toggle aria-label="Notification Center" onClick={() => toggleOverlay('notifications')} className="rounded px-1"><Clock /></button>
      </div>
    </header>
  );
}
