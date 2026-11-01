import { useEffect, useRef, useState } from 'react';
import { APP_ICONS } from './apps';
import { APP_META, LAUNCHABLE } from './appMeta';
import { closeOverlay, useOverlay } from './overlays';
import { launchApp } from './store';

export function Launchpad() {
  const active = useOverlay() === 'launchpad';
  const [query, setQuery] = useState('');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!active) return;
    setQuery('');
    input.current?.focus();
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') closeOverlay();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  if (!active) return null;
  const apps = LAUNCHABLE.filter((app) => APP_META[app].title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div role="dialog" aria-label="Launchpad" className="fixed inset-0 z-[24500] flex flex-col items-center px-6 pt-[8vh]" style={{ background: 'rgba(12,13,16,0.5)', WebkitBackdropFilter: 'blur(20px) saturate(160%)', backdropFilter: 'blur(20px) saturate(160%)' }} onClick={closeOverlay}>
      <input
        ref={input}
        aria-label="Search apps"
        placeholder="Search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClick={(event) => event.stopPropagation()}
        className="mb-10 w-[min(80vw,260px)] rounded-lg px-3 py-1 text-center text-[14px] text-white outline-none"
        style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.18)' }}
      />
      <ul className="m-0 grid max-w-[860px] list-none gap-x-8 gap-y-8 p-0" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', width: 'min(92vw, 860px)' }}>
        {apps.map((app, i) => (
          <li key={app} className="lp-in flex justify-center" style={{ '--i': i } as React.CSSProperties}>
            <button type="button" onClick={(event) => { event.stopPropagation(); closeOverlay(); launchApp(app); }} className="group flex flex-col items-center gap-2 text-[12.5px] text-white">
              <span className="flex h-[68px] w-[68px] transition-transform duration-200 group-hover:scale-110 group-active:scale-95" style={{ boxShadow: '0 10px 22px rgba(0,0,0,0.35)', borderRadius: '22.37%' }}>{APP_ICONS[app]}</span>
              {APP_META[app].title}
            </button>
          </li>
        ))}
        {apps.length === 0 && <li className="col-span-full text-center text-[14px] text-white opacity-70">No apps match “{query}”.</li>}
      </ul>
    </div>
  );
}
