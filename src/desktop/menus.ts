import { profile } from '../content/portfolio';
import { APP_META, DOCK_ORDER } from './appMeta';
import {
  closeWindow,
  launchApp,
  minimizeAll,
  minimizeWindow,
  resetLayout,
  tileWindows,
  toggleMaximize,
  useDesktop,
} from './store';
import type { AppId } from './types';

export interface MenuItem {
  label: string;
  action: () => void;
  /** Display string for the shortcut column. */
  shortcut?: string;
  /** Bound key (with Cmd/Ctrl) handled globally by MenuBar. */
  key?: string;
  /** SVG path data on a 24x24 grid. */
  icon?: string;
  checked?: boolean;
  disabled?: boolean;
}
export type Item = MenuItem | 'sep';
export interface MenuDef {
  id: string;
  label: string;
  bold?: boolean;
  items: Item[];
}

export const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl+';

const ICON = {
  info: 'M12 8v.01M11 12h1v5h1M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  file: 'M7 3h7l4 4v14H7zM14 3v4h4',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  close: 'M6 6l12 12M18 6L6 18',
  min: 'M5 12h14',
  zoom: 'M5 5h6M5 5v6M19 19h-6M19 19v-6',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  play: 'M8 5l11 7-11 7z',
  next: 'M6 5l9 7-9 7zM18 5v14',
  prev: 'M18 5l-9 7 9 7zM6 5v14',
  term: 'M4 6l6 6-6 6M12 18h8',
  help: 'M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17v.01',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  chat: 'M4 5h16v11H9l-5 4z',
};

const appEvent = (name: string, detail: string) => () => window.dispatchEvent(new CustomEvent(name, { detail }));
const external = (url: string) => () => window.open(url, '_blank', 'noopener,noreferrer');
const exec = (command: string) => () => { document.execCommand(command); };

function downloadResume(): void {
  const link = document.createElement('a');
  link.href = profile.resumeUrl;
  link.download = 'Sohom_Chatterjee_Resume.pdf';
  link.click();
}

/** App-specific menu inserted between View and Window. */
function appMenu(app: AppId | undefined): MenuDef | null {
  if (app === 'music') {
    return { id: 'playback', label: 'Playback', items: [
      { label: 'Play / Pause', icon: ICON.play, shortcut: 'Space', action: appEvent('portfolio:music', 'toggle') },
      { label: 'Next Song', icon: ICON.next, shortcut: `${MOD}→`, action: appEvent('portfolio:music', 'next') },
      { label: 'Previous Song', icon: ICON.prev, shortcut: `${MOD}←`, action: appEvent('portfolio:music', 'prev') },
    ] };
  }
  if (app === 'terminal') {
    return { id: 'shell', label: 'Shell', items: [
      { label: 'New Command', icon: ICON.term, action: () => launchApp('terminal') },
      { label: 'Clear Screen', shortcut: `${MOD}K`, action: appEvent('portfolio:terminal', 'clear') },
    ] };
  }
  return null;
}

export function useMenus(): MenuDef[] {
  const { windows, focusedId } = useDesktop();
  const focused = windows.find((win) => win.id === focusedId);
  const appName = focused ? APP_META[focused.app].title : 'Portfolio';
  const none = !focused;

  const menus: MenuDef[] = [
    { id: 'name', label: profile.name, items: [
      { label: 'About Sohom', icon: ICON.info, action: () => launchApp('about') },
      { label: 'Download Resume', icon: ICON.file, action: downloadResume },
      'sep',
      { label: 'GitHub', icon: ICON.link, action: external(profile.github) },
      { label: 'LinkedIn', icon: ICON.link, action: external(profile.linkedin) },
    ] },
    { id: 'app', label: appName, bold: true, items: [
      { label: `About ${appName}`, icon: ICON.info, action: () => focused && launchApp(focused.app), disabled: none },
      'sep',
      { label: `Close ${appName}`, icon: ICON.close, shortcut: `${MOD}W`, key: 'w', action: () => focused && closeWindow(focused.id), disabled: none },
    ] },
    { id: 'file', label: 'File', items: [
      ...DOCK_ORDER.map((app): Item => ({ label: `Open ${APP_META[app].title}`, icon: ICON.grid, action: () => launchApp(app) })),
      'sep',
      { label: 'Close Window', icon: ICON.close, action: () => focused && closeWindow(focused.id), disabled: none },
    ] },
    { id: 'edit', label: 'Edit', items: [
      { label: 'Undo', shortcut: `${MOD}Z`, action: exec('undo') },
      { label: 'Redo', shortcut: `${MOD}⇧Z`, action: exec('redo') },
      'sep',
      { label: 'Cut', shortcut: `${MOD}X`, action: exec('cut') },
      { label: 'Copy', shortcut: `${MOD}C`, action: exec('copy') },
      { label: 'Select All', shortcut: `${MOD}A`, action: exec('selectAll') },
    ] },
    { id: 'view', label: 'View', items: [
      { label: focused?.isMaximized ? 'Exit Full Size' : 'Enter Full Size', icon: ICON.zoom, action: () => focused && toggleMaximize(focused.id), disabled: none },
      { label: 'Tile Windows', icon: ICON.grid, action: tileWindows, disabled: windows.length < 2 },
      { label: 'Reset Layout', action: resetLayout, disabled: windows.length === 0 },
    ] },
  ];
  const specific = appMenu(focused?.app);
  if (specific) menus.push(specific);
  menus.push(
    { id: 'window', label: 'Window', items: [
      { label: 'Minimize', icon: ICON.min, shortcut: `${MOD}M`, key: 'm', action: () => focused && minimizeWindow(focused.id), disabled: none },
      { label: 'Minimize All', action: minimizeAll, disabled: windows.length === 0 },
      'sep',
      ...(windows.length
        ? windows.map((win): Item => ({ label: `${win.title}${win.isMinimized ? ' (minimized)' : ''}`, checked: win.id === focusedId, action: () => launchApp(win.app) }))
        : [{ label: 'No open windows', action: () => undefined, disabled: true }]),
    ] },
    { id: 'help', label: 'Help', items: [
      { label: 'How this desktop works', icon: ICON.help, action: () => launchApp('help') },
      { label: 'Ask the assistant', icon: ICON.chat, shortcut: isMac ? '⌘K' : 'Ctrl K', action: () => launchApp('assistant') },
      { label: 'Contact Sohom', icon: ICON.mail, action: () => launchApp('contact') },
    ] },
  );
  return menus;
}
