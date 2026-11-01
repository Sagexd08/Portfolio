import { useState, type ReactNode } from 'react';
import { profile, projects } from '../content/portfolio';
import { APP_ICONS } from '../desktop/apps';
import { APP_META, LAUNCHABLE } from '../desktop/appMeta';
import { notify } from '../desktop/notify';
import { launchApp, openApp } from '../desktop/store';
import type { AppId } from '../desktop/types';
import type { AppProps } from '../desktop/types';

interface Entry {
  id: string;
  label: string;
  kind: string;
  icon: ReactNode;
  open: () => void;
}

interface Place {
  id: string;
  label: string;
  entries: () => Entry[];
}

function FileGlyph({ type, label }: { type: 'folder' | 'pdf' | 'doc'; label?: string }) {
  if (type === 'folder') {
    return (
      <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
        <path d="M4 12a4 4 0 0 1 4-4h10l4 4h18a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#4aa8f0" />
        <path d="M4 18a4 4 0 0 1 4-4h32a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#7cc4ff" />
        {label && <text x="24" y="34" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1f5f9e">{label}</text>}
      </svg>
    );
  }
  const accent = type === 'pdf' ? '#d2574d' : '#6a7585';
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <path d="M11 4h18l10 10v28a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#fff" stroke="#c9ccd3" strokeWidth="1.5" />
      <path d="M29 4v10h10" fill="#e6e8ee" stroke="#c9ccd3" strokeWidth="1.5" />
      <rect x="9" y="28" width="30" height="12" rx="2" fill={accent} />
      <text x="24" y="37.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">{type === 'pdf' ? 'PDF' : 'DOC'}</text>
    </svg>
  );
}

const appEntry = (app: AppId): Entry => ({ id: app, label: APP_META[app].title, kind: 'Application', icon: APP_ICONS[app], open: () => launchApp(app) });

const PLACES: Place[] = [
  { id: 'desktop', label: 'Desktop', entries: () => [appEntry('notes'), appEntry('about'), appEntry('contact')] },
  {
    id: 'projects',
    label: 'Projects',
    entries: () => projects.map((project) => ({
      id: project.slug,
      label: project.name,
      kind: project.category,
      icon: <FileGlyph type="folder" label={project.name[0]} />,
      open: () => openApp('projects', { slug: project.slug }),
    })),
  },
  { id: 'open-source', label: 'Open Source', entries: () => [appEntry('open-source')] },
  { id: 'pictures', label: 'Pictures', entries: () => [appEntry('gallery'), appEntry('maps')] },
  {
    id: 'documents',
    label: 'Documents',
    entries: () => [
      appEntry('resume'),
      {
        id: 'resume-pdf',
        label: 'Resume.pdf',
        kind: 'PDF document',
        icon: <FileGlyph type="pdf" />,
        open: () => {
          const link = document.createElement('a');
          link.href = profile.resumeUrl;
          link.download = 'Sohom_Chatterjee_Resume.pdf';
          link.click();
          notify({ title: 'Resume.pdf', body: 'Download started.' });
        },
      },
    ],
  },
  { id: 'applications', label: 'Applications', entries: () => [...LAUNCHABLE.map(appEntry), appEntry('playground')] },
];

export default function Finder(_props: AppProps) {
  const [placeId, setPlaceId] = useState('desktop');
  const [selected, setSelected] = useState<string | null>(null);
  const [list, setList] = useState(false);
  const place = PLACES.find((item) => item.id === placeId) ?? PLACES[0];
  const entries = place.entries();

  return (
    <div className="flex h-full" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>
      <nav aria-label="Finder sidebar" className="w-[160px] flex-none p-2 text-[13px]" style={{ background: 'var(--surface-2)', borderRight: '1px solid var(--hairline)' }}>
        <p className="m-0 px-2 pb-1 pt-1 text-[11px] font-semibold uppercase" style={{ color: 'var(--muted)' }}>Favorites</p>
        {PLACES.map((item) => (
          <button key={item.id} type="button" aria-current={item.id === placeId} onClick={() => { setPlaceId(item.id); setSelected(null); }} className="block w-full rounded-md px-2 py-1 text-left" style={{ background: item.id === placeId ? 'var(--hairline)' : 'transparent' }}>
            {item.label}
          </button>
        ))}
      </nav>
      <section className="flex min-w-0 flex-1 flex-col" aria-label={place.label}>
        <header className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid var(--hairline)' }}>
          <h2 className="m-0 text-[14px] font-semibold">{place.label}</h2>
          <div className="flex gap-1 text-[12px]" role="group" aria-label="View">
            {[false, true].map((isList) => (
              <button key={String(isList)} type="button" aria-pressed={list === isList} onClick={() => setList(isList)} className="rounded px-2 py-[2px]" style={{ background: list === isList ? 'var(--hairline)' : 'transparent' }}>{isList ? 'List' : 'Icons'}</button>
            ))}
          </div>
        </header>
        <ul className={list ? 'm-0 flex-1 list-none overflow-auto p-2' : 'm-0 grid flex-1 list-none content-start gap-3 overflow-auto p-4'} style={list ? undefined : { gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))' }}>
          {entries.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => setSelected(entry.id)}
                onDoubleClick={entry.open}
                onKeyDown={(event) => event.key === 'Enter' && entry.open()}
                aria-label={`${entry.label}, ${entry.kind}. Double-click or press Enter to open`}
                className={`${selected === entry.id ? '' : 'row-hover'} ${list ? 'flex w-full items-center gap-3 rounded-md px-2 py-1 text-left text-[13px]' : 'flex w-full flex-col items-center gap-1 rounded-xl p-2 text-center text-[12px]'}`}
                style={{ background: selected === entry.id ? 'var(--accent)' : 'transparent', color: selected === entry.id ? '#fff' : 'var(--ink)' }}
              >
                <span aria-hidden="true" className={list ? 'flex h-5 w-5 flex-none items-center' : 'flex h-14 w-14 items-center justify-center'}>{entry.icon}</span>
                <span className="min-w-0 flex-1 truncate">{entry.label}</span>
                {list && <span className="text-[12px] opacity-70">{entry.kind}</span>}
              </button>
            </li>
          ))}
        </ul>
        <footer className="px-4 py-1 text-[11px]" style={{ borderTop: '1px solid var(--hairline)', color: 'var(--muted)' }}>{entries.length} items</footer>
      </section>
    </div>
  );
}
