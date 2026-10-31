import { useState } from 'react';
import { profile } from '../content/portfolio';
import { notify } from './notify';
import { launchApp } from './store';
import type { AppId } from './types';

interface DesktopItem {
  id: string;
  label: string;
  glyph: 'folder' | 'pdf' | 'photos';
  open: () => void;
}

const downloadResume = (): void => {
  const link = document.createElement('a');
  link.href = profile.resumeUrl;
  link.download = 'Sohom_Chatterjee_Resume.pdf';
  link.click();
  notify({ title: 'Resume.pdf', body: 'Download started.' });
};

const folder = (app: AppId) => (): void => launchApp(app);

const ITEMS: DesktopItem[] = [
  { id: 'resume', label: 'Resume.pdf', glyph: 'pdf', open: downloadResume },
  { id: 'projects', label: 'Projects', glyph: 'folder', open: folder('projects') },
  { id: 'pictures', label: 'Pictures', glyph: 'photos', open: folder('gallery') },
  { id: 'oss', label: 'Open Source', glyph: 'folder', open: folder('open-source') },
];

function Glyph({ kind }: { kind: DesktopItem['glyph'] }) {
  const fill = kind === 'pdf' ? '#f4f3f0' : kind === 'photos' ? '#8fb0e6' : '#6d9bd8';
  return (
    <svg viewBox="0 0 56 56" width="52" height="52" aria-hidden="true">
      {kind === 'pdf' ? (
        <>
          <path d="M14 6h22l10 10v34H14z" fill={fill} stroke="#bdbbb6" />
          <path d="M36 6v10h10" fill="#dcdad5" stroke="#bdbbb6" />
          <text x="30" y="40" textAnchor="middle" fontSize="11" fontWeight="700" fill="#d2574d" fontFamily="system-ui">PDF</text>
        </>
      ) : (
        <>
          <path d="M6 16a4 4 0 0 1 4-4h12l5 5h19a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill={fill} />
          <path d="M6 22h44v20a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" fill={kind === 'photos' ? '#a9c3ee' : '#86b0e8'} />
          {kind === 'photos' && <circle cx="22" cy="31" r="3" fill="#fff" opacity="0.9" />}
        </>
      )}
    </svg>
  );
}

export function DesktopIcons({ hidden }: { hidden: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  if (hidden) return null;
  return (
    <ul className="fixed right-3 top-[40px] z-[1] m-0 flex list-none flex-col gap-3 p-0" aria-label="Desktop items" onPointerDown={(event) => event.target === event.currentTarget && setSelected(null)}>
      {ITEMS.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => setSelected(item.id)}
            onDoubleClick={item.open}
            onKeyDown={(event) => event.key === 'Enter' && item.open()}
            aria-label={`${item.label}. Double-click or press Enter to open`}
            className="flex w-[88px] flex-col items-center gap-1 rounded-lg p-1 text-[12px] text-white"
            style={{ background: selected === item.id ? 'rgba(75,110,166,0.55)' : 'transparent', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}
          >
            <Glyph kind={item.glyph} />
            <span className="rounded px-1" style={{ background: selected === item.id ? '#4b6ea6' : 'transparent' }}>{item.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
