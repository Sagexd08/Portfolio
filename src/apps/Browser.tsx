import { useState, type FormEvent } from 'react';
import { siGithub, siGooglechrome } from 'simple-icons';
import { profile, projects } from '../content/portfolio';
import type { AppProps } from '../desktop/types';

interface Tab {
  id: number;
  history: (string | null)[];
  index: number;
  reload: number;
}

interface Shortcut {
  label: string;
  url: string;
  path?: string;
  hex?: string;
}

const SHORTCUTS: Shortcut[] = [
  { label: 'GitHub', url: profile.github, path: siGithub.path, hex: siGithub.hex },
  { label: 'LinkedIn', url: profile.linkedin },
  { label: 'Website', url: profile.website },
  ...projects.flatMap((p) => (p.liveUrl ? [{ label: p.name, url: p.liveUrl }] : [])),
];

// Only Sohom's own sites are tried in an iframe; everything else shows the fallback card.
const EMBEDDABLE_HOSTS = new Set(
  [profile.website, ...projects.map((p) => p.liveUrl)].flatMap((u) => {
    try { return u ? [new URL(u).host] : []; } catch { return []; }
  }),
);

/** Accepts http/https only. Bare hostnames get https://. Returns null when invalid. */
export function parseWebUrl(raw: string): string | null {
  const text = raw.trim();
  if (!text || /\s/.test(text)) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : /^[a-z][a-z0-9+.-]*:/i.test(text) && !/^[\w.-]+:\d+/.test(text) ? '' : `https://${text}`;
  if (!withScheme) return null;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname.includes('.') && url.hostname !== 'localhost') return null;
    return url.href;
  } catch {
    return null;
  }
}

const canEmbed = (url: string): boolean => {
  const host = new URL(url).host;
  return host === window.location.host || EMBEDDABLE_HOSTS.has(host);
};

const newTab = (id: number): Tab => ({ id, history: [null], index: 0, reload: 0 });
const current = (tab: Tab): string | null => tab.history[tab.index] ?? null;
const hostOf = (url: string | null): string => (url ? new URL(url).hostname.replace(/^www\./, '') : 'New Tab');

function NavButton({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="ctl flex h-7 w-7 items-center justify-center rounded-full disabled:opacity-35">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
    </button>
  );
}

function Blocked({ url }: { url: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
      <h2 className="m-0 text-[17px] font-semibold">This site doesn't allow embedding</h2>
      <p className="m-0 max-w-[360px] text-[13px]" style={{ color: 'var(--muted)' }}>{hostOf(url)} can't be shown inside another page. You can open it in a new browser tab instead.</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="rounded-full px-4 py-1.5 text-[13px] font-semibold text-white" style={{ background: 'var(--accent)' }}>Open in new tab</a>
    </div>
  );
}

function NewTabPage({ go }: { go: (url: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6">
      <svg viewBox="0 0 24 24" width="56" height="56" aria-hidden="true"><path d={siGooglechrome.path} fill={`#${siGooglechrome.hex}`} /></svg>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,96px)] justify-center gap-4 p-0" style={{ maxWidth: 560 }}>
        {SHORTCUTS.map((item) => (
          <li key={item.url}>
            <button type="button" onClick={() => go(item.url)} className="row-hover flex w-full flex-col items-center gap-2 rounded-2xl p-2 text-[12px]">
              <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'var(--surface-2)', border: '1px solid var(--hairline)' }}>
                {item.path ? <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d={item.path} fill="currentColor" /></svg> : <span className="text-[18px] font-semibold">{item.label[0]}</span>}
              </span>
              <span className="w-full truncate">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Browser(_props: AppProps) {
  const [tabs, setTabs] = useState<Tab[]>([newTab(1)]);
  const [activeId, setActiveId] = useState(1);
  const [nextId, setNextId] = useState(2);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const tab = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const url = current(tab);

  const patch = (id: number, fn: (t: Tab) => Tab): void => setTabs((all) => all.map((t) => (t.id === id ? fn(t) : t)));
  const navigate = (target: string): void => {
    patch(tab.id, (t) => ({ ...t, history: [...t.history.slice(0, t.index + 1), target], index: t.index + 1 }));
    setDraft(target);
    setError('');
  };
  const step = (delta: number): void => {
    const index = tab.index + delta;
    patch(tab.id, (t) => ({ ...t, index }));
    setDraft(tab.history[index] ?? '');
    setError('');
  };
  const addTab = (): void => {
    setTabs((all) => [...all, newTab(nextId)]);
    setActiveId(nextId);
    setNextId(nextId + 1);
    setDraft('');
    setError('');
  };
  const closeTab = (id: number): void => {
    if (tabs.length === 1) return;
    const rest = tabs.filter((t) => t.id !== id);
    setTabs(rest);
    if (id === activeId) {
      setActiveId(rest[0].id);
      setDraft(current(rest[0]) ?? '');
    }
  };
  const activate = (t: Tab): void => { setActiveId(t.id); setDraft(current(t) ?? ''); setError(''); };
  const submit = (event: FormEvent): void => {
    event.preventDefault();
    const parsed = parseWebUrl(draft);
    if (parsed) navigate(parsed);
    else setError('Enter a valid http or https address.');
  };

  return (
    <div className="flex h-full flex-col" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>
      <div role="tablist" aria-label="Tabs" className="flex flex-none items-end gap-1 px-2 pt-2" style={{ background: 'var(--surface-2)' }}>
        {tabs.map((t) => (
          <div key={t.id} className="flex min-w-0 max-w-[200px] flex-1 items-center rounded-t-lg" style={{ background: t.id === tab.id ? 'var(--surface)' : 'transparent' }}>
            <button type="button" role="tab" aria-selected={t.id === tab.id} onClick={() => activate(t)} className="min-w-0 flex-1 truncate px-3 py-1.5 text-left text-[12.5px]">{hostOf(current(t))}</button>
            {tabs.length > 1 && <button type="button" aria-label={`Close tab ${hostOf(current(t))}`} onClick={() => closeTab(t.id)} className="mr-1 h-5 w-5 flex-none rounded-full text-[13px] opacity-60 hover:opacity-100">×</button>}
          </div>
        ))}
        <button type="button" aria-label="New tab" onClick={addTab} className="ctl mb-1 h-6 w-6 rounded-full text-[16px]">+</button>
      </div>
      <form onSubmit={submit} className="flex flex-none items-center gap-1 px-2 py-1.5" style={{ borderBottom: '1px solid var(--hairline)' }}>
        <NavButton label="Back" disabled={tab.index === 0} onClick={() => step(-1)}><path d="M15 5l-7 7 7 7" /></NavButton>
        <NavButton label="Forward" disabled={tab.index >= tab.history.length - 1} onClick={() => step(1)}><path d="M9 5l7 7-7 7" /></NavButton>
        <NavButton label="Reload" disabled={!url} onClick={() => patch(tab.id, (t) => ({ ...t, reload: t.reload + 1 }))}><path d="M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5" /></NavButton>
        <input aria-label="Address" aria-invalid={Boolean(error)} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Search or enter an address" spellCheck={false} className="min-w-0 flex-1 rounded-full px-4 py-1 text-[13px] outline-none" style={{ background: 'var(--surface-2)', border: `1px solid ${error ? '#d2574d' : 'var(--hairline)'}` }} />
        {url && <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Open in new tab" title="Open in new tab" className="ctl flex h-7 w-7 items-center justify-center rounded-full"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5" /></svg></a>}
      </form>
      {error && <p role="alert" className="m-0 px-4 py-1 text-[12px]" style={{ color: '#d2574d' }}>{error}</p>}
      <div className="min-h-0 flex-1">
        {!url ? <NewTabPage go={navigate} /> : canEmbed(url) ? <iframe key={`${tab.id}-${url}-${tab.reload}`} title={hostOf(url)} src={url} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" referrerPolicy="no-referrer" className="h-full w-full border-0 bg-white" /> : <Blocked url={url} />}
      </div>
    </div>
  );
}
