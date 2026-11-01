import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { setAiStatus } from '../ai/status';
import { APP_META, appFromPath, pathFor } from './appMeta';
import { BootScreen } from './BootScreen';
import { ControlCenter } from './ControlCenter';
import { DesktopIcons } from './DesktopIcons';
import { Dock } from './Dock';
import { Launchpad } from './Launchpad';
import { notify, seedNotices } from './notify';
import { NotificationCenter, Toasts } from './NotificationCenter';
import { toggleOverlay } from './overlays';
import { Wallpaper } from './Wallpaper';
import { initPrefs } from './prefs';
import { Spotlight } from './Spotlight';
import { Eggs } from './Eggs';
import { MenuBar } from './MenuBar';
import { getDesktop, launchApp, openApp, useDesktop } from './store';
import { useIsMobile } from './useMedia';
import { WindowFrame } from './Window';

initPrefs();

const BOOT_FLAG = 'desktop-booted';
const SITE = 'https://sohomchatterjee.vercel.app';

function readBootFlag(): boolean {
  try {
    return sessionStorage.getItem(BOOT_FLAG) === '1';
  } catch {
    return false;
  }
}

function writeBootFlag(): void {
  try {
    sessionStorage.setItem(BOOT_FLAG, '1');
  } catch {
    // Storage can be blocked; the boot screen simply replays next visit.
  }
}

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string): void {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function applyPageMeta(title: string, description: string, path: string): void {
  const full = `${title} · Sohom Chatterjee`;
  document.title = full;
  setMeta('meta[name="description"]', 'name', 'description', description);
  setMeta('meta[property="og:title"]', 'property', 'og:title', full);
  setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  setMeta('meta[property="og:url"]', 'property', 'og:url', SITE + path);
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = SITE + path;
}

export default function Desktop() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { windows, focusedId } = useDesktop();
  const mobile = useIsMobile();
  const [booted, setBooted] = useState(readBootFlag);

  const finishBoot = useCallback(() => {
    writeBootFlag();
    setBooted(true);
  }, []);

  useEffect(() => {
    if (!booted) return;
    const target = appFromPath(pathname);
    if (target) openApp(target.app, target.params);
    else openApp('help', { missing: pathname });
  }, [pathname, booted]);

  const focused = windows.find((win) => win.id === focusedId);
  const focusedApp = focused?.app;
  const focusedSlug = focused?.params.slug;

  useEffect(() => {
    if (!booted || !focusedApp) return;
    const next = pathFor(focusedApp, getDesktop().windows.find((win) => win.app === focusedApp)?.params ?? {});
    if (next !== pathname) navigate(next);
    const meta = APP_META[focusedApp];
    applyPageMeta(focusedSlug ? `${focusedSlug} — ${meta.title}` : meta.title, meta.description, next);
    // pathname is intentionally excluded: this effect reacts to focus changes only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedApp, focusedSlug, booted, navigate]);

  useEffect(() => {
    if (!booted) return;
    setAiStatus({ phase: windows.some((win) => win.app === 'assistant' && !win.isMinimized) ? 'opened' : 'idle' });
  }, [windows, booted]);

  useEffect(() => {
    if (!booted) return;
    seedNotices();
    notify({ title: 'Welcome', body: 'Press Ctrl+Space for Spotlight, or open Control Center to change the wallpaper.' });
  }, [booted]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      const typing = event.target instanceof HTMLElement && /^(INPUT|TEXTAREA)$/.test(event.target.tagName);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        launchApp('assistant');
      } else if ((event.ctrlKey && event.code === 'Space') || (event.key === '/' && !typing)) {
        event.preventDefault();
        toggleOverlay('spotlight');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <Wallpaper />
      <MenuBar mobile={mobile} />
      <main aria-label="Desktop">
        <h1 className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          Sohom Chatterjee — CS undergraduate and ML engineer, open to forward-deployed and ML engineering roles
        </h1>
        {windows.map((win) => (
          <WindowFrame key={win.id} win={win} focused={win.id === focusedId} mobile={mobile} />
        ))}
      </main>
      <DesktopIcons hidden={mobile} />
      <Dock mobile={mobile} />
      <Spotlight />
      <NotificationCenter />
      <ControlCenter />
      <Launchpad />
      <Toasts />
      <Eggs />
      {!booted && <BootScreen onDone={finishBoot} />}
    </div>
  );
}
