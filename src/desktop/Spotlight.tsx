import { useEffect, useMemo, useRef, useState } from 'react';
import { experience, profile, projects } from '../content/portfolio';
import { APP_ICONS } from './apps';
import { APP_META, LAUNCHABLE } from './appMeta';
import { closeOverlay, useDismiss, useOverlay } from './overlays';
import { launchApp, openApp } from './store';
import type { AppId } from './types';

interface Result {
  id: string;
  label: string;
  hint: string;
  group: 'Applications' | 'Projects' | 'Experience' | 'Actions';
  app?: AppId;
  run: () => void;
}

const MAX_RESULTS = 9;

function downloadResume(): void {
  const link = document.createElement('a');
  link.href = profile.resumeUrl;
  link.download = 'Sohom_Chatterjee_Resume.pdf';
  link.click();
}

function buildIndex(): Result[] {
  return [
    ...LAUNCHABLE.map((app): Result => ({ id: `app-${app}`, label: APP_META[app].title, hint: 'Application', group: 'Applications', app, run: () => launchApp(app) })),
    ...projects.map((project): Result => ({ id: `p-${project.slug}`, label: project.name, hint: project.category, group: 'Projects', app: 'projects', run: () => openApp('projects', { slug: project.slug }) })),
    ...experience.map((entry): Result => ({ id: `e-${entry.id}`, label: `${entry.title}, ${entry.organization}`, hint: entry.type, group: 'Experience', app: 'resume', run: () => launchApp('resume') })),
    { id: 'a-resume', label: 'Download resume (PDF)', hint: 'Action', group: 'Actions', run: downloadResume },
    { id: 'a-email', label: `Email ${profile.name.split(' ')[0]}`, hint: profile.email, group: 'Actions', run: () => { window.location.href = `mailto:${profile.email}`; } },
    { id: 'a-ask', label: 'Ask the assistant', hint: 'Action', group: 'Actions', app: 'assistant', run: () => launchApp('assistant') },
  ];
}

export function Spotlight() {
  const overlay = useOverlay();
  const open = overlay === 'spotlight';
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const index = useMemo(buildIndex, []);
  useDismiss(panel, open);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      window.setTimeout(() => input.current?.focus(), 0);
    }
  }, [open]);

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const pool = terms.length ? index.filter((item) => terms.every((term) => `${item.label} ${item.hint}`.toLowerCase().includes(term))) : index.filter((item) => item.group === 'Applications');
    return pool.slice(0, MAX_RESULTS);
  }, [index, query]);

  if (!open) return null;

  const run = (item: Result | undefined): void => {
    if (!item) return;
    closeOverlay();
    item.run();
  };

  const onKey = (event: React.KeyboardEvent): void => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((i) => (i + 1) % Math.max(results.length, 1)); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setActive((i) => (i - 1 + results.length) % Math.max(results.length, 1)); }
    if (event.key === 'Enter') run(results[active]);
  };

  return (
    <div className="fixed inset-0 z-[24000] flex items-start justify-center pt-[16vh]" style={{ background: 'rgba(0,0,0,0.18)' }}>
      <div ref={panel} role="dialog" aria-label="Spotlight search" className="win-in glass w-[min(92vw,620px)] overflow-hidden" style={{ borderRadius: 26 }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input
            ref={input}
            role="combobox"
            aria-expanded="true"
            aria-controls="spotlight-results"
            aria-activedescendant={results[active] ? `sp-${results[active].id}` : undefined}
            aria-label="Search apps, projects and experience"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setActive(0); }}
            onKeyDown={onKey}
            placeholder="Spotlight Search"
            className="w-full bg-transparent text-[20px] outline-none"
          />
        </div>
        <ul id="spotlight-results" role="listbox" className="m-0 max-h-[52vh] list-none overflow-auto p-1 pt-0" style={{ borderTop: results.length ? '1px solid var(--hairline)' : 'none' }}>
          {results.map((item, i) => (
            <li key={item.id} id={`sp-${item.id}`} role="option" aria-selected={i === active}>
              <button type="button" onMouseEnter={() => setActive(i)} onClick={() => run(item)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left" style={{ background: i === active ? 'var(--accent)' : 'transparent', color: i === active ? '#fff' : 'var(--ink)' }}>
                <span className="flex h-7 w-7 flex-none items-center" aria-hidden="true">{item.app ? APP_ICONS[item.app] : null}</span>
                <span className="min-w-0 flex-1 truncate text-[14px]">{item.label}</span>
                <span className="text-[12px] opacity-70">{item.group === 'Applications' ? 'Application' : item.hint}</span>
              </button>
            </li>
          ))}
          {query && results.length === 0 && <li className="p-4 text-[13px]" style={{ color: 'var(--muted)' }}>No results for “{query}”.</li>}
        </ul>
      </div>
    </div>
  );
}
