import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { profile } from '../content/portfolio';
import { APP_META, DOCK_ORDER } from './appMeta';
import { DynamicIsland } from './DynamicIsland';
import { toggleOverlay, type Overlay } from './overlays';
import {
  closeWindow,
  launchApp,
  minimizeAll,
  openApp,
  resetLayout,
  tileWindows,
  toggleMaximize,
  useDesktop,
} from './store';

type Item = { label: string; action: () => void; shortcut?: string; disabled?: boolean } | 'sep';
interface MenuDef {
  id: string;
  label: string;
  bold?: boolean;
  items: Item[];
}

const MARK_CLICKS_FOR_EGG = 7;
const MARK_CLICK_WINDOW_MS = 2500;
const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

function downloadResume(): void {
  const link = document.createElement('a');
  link.href = profile.resumeUrl;
  link.download = 'Sohom_Chatterjee_Resume.pdf';
  link.click();
}

function useMenus(): MenuDef[] {
  const { windows, focusedId } = useDesktop();
  const focused = windows.find((win) => win.id === focusedId);
  const external = (url: string) => () => window.open(url, '_blank', 'noopener,noreferrer');
  const appItems: Item[] = DOCK_ORDER.map((app) => ({ label: `Open ${APP_META[app].title}`, action: () => launchApp(app) }));

  return [
    { id: 'name', label: profile.name, bold: true, items: [
      { label: 'About Sohom', action: () => launchApp('about') },
      { label: 'Download Resume', action: downloadResume },
      'sep',
      { label: 'GitHub', action: external(profile.github) },
      { label: 'LinkedIn', action: external(profile.linkedin) },
    ] },
    { id: 'file', label: 'File', items: [
      ...appItems,
      'sep',
      { label: 'Close Window', action: () => focused && closeWindow(focused.id), disabled: !focused },
    ] },
    { id: 'view', label: 'View', items: [
      { label: focused?.isMaximized ? 'Restore Window' : 'Maximize Window', action: () => focused && toggleMaximize(focused.id), disabled: !focused },
      { label: 'Tile Windows', action: tileWindows, disabled: windows.length < 2 },
      { label: 'Reset Layout', action: resetLayout, disabled: windows.length === 0 },
      { label: 'Minimize All', action: minimizeAll, disabled: windows.length === 0 },
    ] },
    { id: 'window', label: 'Window', items: windows.length
      ? windows.map((win): Item => ({ label: `${win.id === focusedId ? '✓ ' : ''}${win.title}${win.isMinimized ? ' (minimized)' : ''}`, action: () => launchApp(win.app) }))
      : [{ label: 'No open windows', action: () => undefined, disabled: true }] },
    { id: 'help', label: 'Help', items: [
      { label: 'How this desktop works', action: () => launchApp('help') },
      { label: 'Ask the assistant', action: () => launchApp('assistant'), shortcut: isMac ? '⌘K' : 'Ctrl K' },
      { label: 'Contact Sohom', action: () => launchApp('contact') },
    ] },
  ];
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
    <time dateTime={now.toISOString()} className="text-[12px]">
      <span className="hidden sm:inline">{date}&nbsp;&nbsp;</span>
      {time}
    </time>
  );
}

export function MenuBar({ mobile }: { mobile: boolean }) {
  const menus = useMenus();
  const [openId, setOpenId] = useState<string | null>(null);
  const root = useRef<HTMLElement>(null);
  const clicks = useRef<number[]>([]);

  useEffect(() => {
    if (!openId) return;
    const onPointer = (event: PointerEvent): void => {
      if (root.current && !root.current.contains(event.target as Node)) setOpenId(null);
    };
    window.addEventListener('pointerdown', onPointer);
    return () => window.removeEventListener('pointerdown', onPointer);
  }, [openId]);

  const onMark = (): void => {
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < MARK_CLICK_WINDOW_MS), now];
    if (clicks.current.length >= MARK_CLICKS_FOR_EGG) {
      clicks.current = [];
      setOpenId(null);
      openApp('embeddings');
      return;
    }
    setOpenId((id) => (id === 'name' ? null : 'name'));
  };

  const onMenuKey = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key === 'Escape') setOpenId(null);
    const items = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? []);
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'ArrowDown') items[(at + 1) % items.length]?.focus();
    if (event.key === 'ArrowUp') items[(at - 1 + items.length) % items.length]?.focus();
    const ids = menus.map((menu) => menu.id);
    const index = openId ? ids.indexOf(openId) : -1;
    if (event.key === 'ArrowRight' && index >= 0) setOpenId(ids[(index + 1) % ids.length]);
    if (event.key === 'ArrowLeft' && index >= 0) setOpenId(ids[(index - 1 + ids.length) % ids.length]);
  };

  const visible = mobile ? menus.filter((menu) => menu.id === 'name') : menus;

  return (
    <header
      ref={root}
      onKeyDown={onMenuKey}
      className="glass-bar fixed inset-x-0 top-0 z-[9500] flex items-center justify-between px-2"
      style={{ height: 28 }}
    >
      <nav aria-label="Menu bar" className="flex items-center">
        <button type="button" aria-label="Portfolio menu" onClick={onMark} className="mr-2 flex h-5 w-5 items-center justify-center overflow-hidden rounded-full" style={{ border: '1px solid rgba(255,255,255,0.6)' }}>
          <img src="/brand/avatar-192.png" alt="" width={20} height={20} className="h-full w-full object-cover" />
        </button>
        {visible.map((menu) => (
          <div key={menu.id} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={openId === menu.id}
              onClick={() => setOpenId((id) => (id === menu.id ? null : menu.id))}
              onMouseEnter={() => openId && setOpenId(menu.id)}
              className="rounded px-2 py-[2px] text-[12.5px]"
              style={{ fontWeight: menu.bold ? 600 : 400, background: openId === menu.id ? 'rgba(255,255,255,0.18)' : 'transparent' }}
            >
              {mobile ? 'Menu' : menu.label}
            </button>
            {openId === menu.id && (
              <div role="menu" aria-label={menu.label} className="win-in glass absolute left-0 top-[26px] min-w-[210px] rounded-xl p-1">
                {menu.items.map((item, index) =>
                  item === 'sep' ? (
                    <hr key={index} className="my-1 border-0 border-t" style={{ borderColor: 'var(--hairline)' }} />
                  ) : (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      disabled={item.disabled}
                      onClick={() => { setOpenId(null); item.action(); }}
                      className="row-hover flex w-full items-center justify-between rounded-md px-3 py-[5px] text-left text-[12.5px] disabled:opacity-40"
                    >
                      <span>{item.label}</span>
                      {item.shortcut && <span className="ml-6 text-[11px]" style={{ color: 'var(--muted)' }}>{item.shortcut}</span>}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        ))}
      </nav>
      <div className="absolute left-1/2 -translate-x-1/2"><DynamicIsland /></div>
      <div className="flex items-center gap-1">
        {([['launchpad', 'Launchpad', <path key="p" d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z" />], ['spotlight', 'Spotlight search', <><circle key="c" cx="11" cy="11" r="6" /><path key="l" d="m20 20-4.2-4.2" /></>], ['control', 'Control Center', <path key="s" d="M4 8h10M18 8h2M4 16h2M10 16h10M14 6v4M6 14v4" />]] as [NonNullable<Overlay>, string, React.ReactNode][]).map(([id, label, glyph]) => (
          <button key={id} type="button" data-overlay-toggle aria-label={label} onClick={() => toggleOverlay(id)} className="flex h-5 w-6 items-center justify-center rounded">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">{glyph}</svg>
          </button>
        ))}
        <button type="button" data-overlay-toggle aria-label="Notification Center" onClick={() => toggleOverlay('notifications')} className="rounded px-1"><Clock /></button>
      </div>
    </header>
  );
}
