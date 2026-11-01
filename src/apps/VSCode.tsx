import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { profile } from '../content/portfolio';
import type { AppProps } from '../desktop/types';
import { openApp } from '../desktop/store';
import { TerminalView } from './terminal/TerminalView';
import { Editor } from './vscode/Editor';
import { Explorer } from './vscode/Explorer';
import { FILES, FILE_BY_PATH } from './vscode/files';
import { Icon, type IconName } from './vscode/icons';
import { Palette, type PaletteItem } from './vscode/Palette';
import { C } from './vscode/theme';

type PaletteMode = 'commands' | 'files' | null;

const LANGUAGE_LABEL = { markdown: 'Markdown', json: 'JSON', typescript: 'TypeScript' } as const;
const PANEL_PALETTE = { bg: C.sidebar, fg: C.editorFg, prompt: '#3794ff', accent: '#9cdcfe' };
const FOCUS = 'outline-none focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-2';

function ActivityButton({ icon, label, active, disabled, onClick }: { icon: IconName; label: string; active?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`flex h-12 w-12 flex-none items-center justify-center ${FOCUS}`}
      style={{ color: active ? C.activityFg : C.activityInactive, borderLeft: `2px solid ${active ? C.accent : 'transparent'}`, outlineColor: C.accent, opacity: disabled ? 0.6 : 1 }}
    >
      <Icon name={icon} size={24} />
    </button>
  );
}

interface TabsProps {
  tabs: string[];
  active: string;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
}

function Tabs({ tabs, active, onSelect, onClose }: TabsProps) {
  return (
    <div role="tablist" aria-label="Open editors" className="flex flex-none overflow-x-auto" style={{ background: C.tabInactive, borderBottom: `1px solid ${C.border}` }}>
      {tabs.map((path) => {
        const on = path === active;
        return (
          <div
            key={path}
            className="flex h-[35px] flex-none items-center text-[13px]"
            style={{ background: on ? C.editor : C.tabInactive, color: on ? '#fff' : C.muted, borderRight: `1px solid ${C.border}`, borderTop: `1px solid ${on ? C.tabActiveBorder : 'transparent'}` }}
            onAuxClick={(e) => e.button === 1 && onClose(path)}
          >
            <button type="button" role="tab" aria-selected={on} onClick={() => onSelect(path)} className={`h-full pl-3 pr-2 ${FOCUS}`} style={{ outlineColor: C.accent }}>
              {FILE_BY_PATH.get(path)?.name ?? path}
            </button>
            <button type="button" aria-label={`Close ${path}`} onClick={() => onClose(path)} className={`mr-1.5 flex h-5 w-5 items-center justify-center rounded-[3px] hover:bg-white/10 ${FOCUS}`} style={{ outlineColor: C.accent, opacity: on ? 1 : 0.5 }}>
              <Icon name="close" size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function Welcome() {
  const hints: [string, string][] = [['Show All Commands', 'Ctrl+Shift+P'], ['Go to File', 'Ctrl+P'], ['Toggle Terminal', 'Ctrl+`']];
  return (
    <div className="flex flex-1 items-center justify-center text-center" style={{ color: C.muted }}>
      <div>
        <p className="m-0 mb-3 text-[18px]">{profile.name}</p>
        {hints.map(([label, keys]) => <p key={label} className="m-0 leading-6">{label} <kbd className="mono rounded px-1" style={{ background: C.quickInput }}>{keys}</kbd></p>)}
      </div>
    </div>
  );
}

export default function VSCode(_props: AppProps) {
  const [tabs, setTabs] = useState<string[]>(['README.md']);
  const [active, setActive] = useState('README.md');
  const [line, setLine] = useState(1);
  const [sidebar, setSidebar] = useState(true);
  const [panel, setPanel] = useState(false);
  const [mode, setMode] = useState<PaletteMode>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => root.current?.focus(), []);

  const open = useCallback((path: string): void => {
    setTabs((t) => (t.includes(path) ? t : [...t, path]));
    setActive(path);
    setLine(1);
  }, []);

  const close = useCallback((path: string): void => {
    const next = tabs.filter((t) => t !== path);
    setTabs(next);
    if (path === active) setActive(next[Math.max(0, tabs.indexOf(path) - 1)] ?? '');
  }, [tabs, active]);

  const commands = useMemo<PaletteItem[]>(() => [
    { id: 'terminal', label: 'View: Toggle Terminal', detail: 'Ctrl+`', run: () => setPanel((p) => !p) },
    { id: 'sidebar', label: 'View: Toggle Primary Side Bar', detail: 'Ctrl+B', run: () => setSidebar((s) => !s) },
    { id: 'quick', label: 'Go to File...', detail: 'Ctrl+P', run: () => setMode('files') },
    { id: 'close', label: 'View: Close Editor', detail: 'Ctrl+W', run: () => active && close(active) },
    { id: 'closeall', label: 'View: Close All Editors', run: () => { setTabs([]); setActive(''); } },
    { id: 'app', label: 'Terminal: Open Terminal App', run: () => openApp('terminal') },
    { id: 'contact', label: 'Contact: Show Contact Details', run: () => open('contact.ts') },
  ], [active, close, open]);

  const fileItems = useMemo<PaletteItem[]>(() => FILES.map((f) => ({ id: f.path, label: f.name, detail: f.path.includes('/') ? f.path : undefined, run: () => open(f.path) })), [open]);

  const onKeyDown = (e: KeyboardEvent): void => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const key = e.key.toLowerCase();
    if (e.shiftKey && key === 'p') setMode('commands');
    else if (key === 'p') setMode('files');
    else if (key === '`') setPanel((p) => !p);
    else if (key === 'b') setSidebar((s) => !s);
    else if (key === 'w' && active) close(active);
    else return;
    e.preventDefault();
  };

  const file = FILE_BY_PATH.get(active);
  const crumbs = active ? ['portfolio', ...active.split('/')] : [];
  const lineCount = file ? file.content.split('\n').length : 0;
  const shownLine = Math.min(line, lineCount);

  return (
    <div ref={root} tabIndex={-1} onKeyDown={onKeyDown} aria-label="VS Code workbench" className="relative flex h-full flex-col text-[13px] outline-none" style={{ background: C.editor, color: C.editorFg, fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}>
      <div className="flex min-h-0 flex-1">
        <div role="toolbar" aria-orientation="vertical" aria-label="Activity bar" className="flex w-12 flex-none flex-col" style={{ background: C.activityBar, borderRight: `1px solid ${C.border}` }}>
          <ActivityButton icon="explorer" label="Explorer (Ctrl+B)" active={sidebar} onClick={() => setSidebar((s) => !s)} />
          <ActivityButton icon="search" label="Go to file (Ctrl+P)" onClick={() => setMode('files')} />
          <ActivityButton icon="git" label="Source Control (unavailable)" disabled />
          <ActivityButton icon="extensions" label="Extensions (unavailable)" disabled />
          <div className="flex-1" />
          <ActivityButton icon="settings" label="Command Palette (Ctrl+Shift+P)" onClick={() => setMode('commands')} />
        </div>
        {sidebar && <div className="w-[220px] flex-none" style={{ borderRight: `1px solid ${C.border}` }}><Explorer active={active} onOpen={open} /></div>}
        <main className="flex min-w-0 flex-1 flex-col">
          <Tabs tabs={tabs} active={active} onSelect={(p) => { setActive(p); setLine(1); }} onClose={close} />
          {file ? (
            <>
              <nav aria-label="Breadcrumbs" className="flex h-[22px] flex-none items-center px-4 text-[12px]" style={{ background: C.editor, color: C.muted }}>
                {crumbs.map((c, i) => <span key={`${c}-${i}`}>{i > 0 && <span aria-hidden="true"> › </span>}<span style={{ color: i === crumbs.length - 1 ? C.editorFg : undefined }}>{c}</span></span>)}
              </nav>
              <Editor file={file} line={shownLine} onLine={setLine} />
            </>
          ) : <Welcome />}
          {panel && (
            <section aria-label="Panel" className="flex h-[38%] min-h-[110px] flex-none flex-col" style={{ background: C.sidebar, borderTop: `1px solid ${C.border}` }}>
              <div className="flex h-[35px] flex-none items-center justify-between px-4 text-[11px] uppercase" style={{ color: C.editorFg }}>
                <span className="border-b pb-[3px]" style={{ borderColor: C.accent }}>Terminal</span>
                <button type="button" aria-label="Close panel" onClick={() => setPanel(false)} className="flex h-5 w-5 items-center justify-center rounded-[3px] hover:bg-white/10"><Icon name="close" size={14} /></button>
              </div>
              <div className="min-h-0 flex-1"><TerminalView palette={PANEL_PALETTE} label="Integrated terminal" autoFocus /></div>
            </section>
          )}
        </main>
      </div>
      <footer aria-label="Status bar" className="flex h-[22px] flex-none items-center justify-between px-2 text-[12px]" style={{ background: C.statusBar, color: C.statusFg, borderTop: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Icon name="branch" size={13} /> main</span>
          <button type="button" onClick={() => setPanel((p) => !p)} aria-pressed={panel} aria-label="Toggle terminal (Ctrl+`)" className="flex items-center gap-1 px-1 hover:bg-white/10"><Icon name="terminal" size={13} /> Terminal</button>
        </div>
        {file && (
          <div className="flex items-center gap-3">
            <span>Ln {shownLine}, Col 1</span>
            <span>Spaces: 2</span>
            <span>UTF-8</span>
            <span>LF</span>
            <span>{LANGUAGE_LABEL[file.language]}</span>
          </div>
        )}
      </footer>
      {mode && <Palette key={mode} placeholder={mode === 'files' ? 'Search files by name' : 'Type the name of a command to run'} items={mode === 'files' ? fileItems : commands} onClose={() => { setMode(null); root.current?.focus(); }} />}
    </div>
  );
}
