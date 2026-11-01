import { useRef } from 'react';
import { closeOverlay, openOverlay, useDismiss, useOverlay } from './overlays';
import { setPrefs, usePrefs, WALLPAPERS, type Theme } from './prefs';

const THEMES: { key: Theme; label: string }[] = [
  { key: 'auto', label: 'Auto' },
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
];

function Toggle({ label, hint, on, onChange }: { label: string; hint: string; on: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex w-full items-center justify-between rounded-xl p-3 text-left" style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}>
      <span>
        <span className="block text-[13px] font-medium">{label}</span>
        <span className="block text-[11.5px]" style={{ color: 'var(--muted)' }}>{hint}</span>
      </span>
      <span aria-hidden="true" className="relative h-5 w-9 flex-none rounded-full" style={{ background: on ? 'var(--ok)' : 'var(--hairline)', transition: 'background 160ms' }}>
        <i className="absolute top-[2px] block h-4 w-4 rounded-full bg-white" style={{ left: on ? 18 : 2, transition: 'left 160ms var(--ease)' }} />
      </span>
    </button>
  );
}

export function ControlCenter() {
  const active = useOverlay() === 'control';
  const prefs = usePrefs();
  const ref = useRef<HTMLElement>(null);
  useDismiss(ref, active);
  if (!active) return null;
  return (
    <section ref={ref} aria-label="Control Center" className="win-in glass fixed right-2 top-[34px] z-[24000] w-[min(94vw,320px)] space-y-2 p-3" style={{ borderRadius: 26 }}>
      <div className="rounded-xl p-3" style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}>
        <p className="m-0 mb-2 text-[12px] font-semibold" style={{ color: 'var(--muted)' }}>Appearance</p>
        <div className="flex gap-1" role="radiogroup" aria-label="Appearance">
          {THEMES.map((theme) => (
            <button key={theme.key} type="button" role="radio" aria-checked={prefs.theme === theme.key} onClick={() => setPrefs({ theme: theme.key })} className="flex-1 rounded-lg px-2 py-1 text-[12.5px]" style={{ background: prefs.theme === theme.key ? 'var(--accent)' : 'var(--surface-2)', color: prefs.theme === theme.key ? '#fff' : 'var(--ink)' }}>
              {theme.label}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-xl p-3" style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}>
        <p className="m-0 mb-2 text-[12px] font-semibold" style={{ color: 'var(--muted)' }}>Wallpaper</p>
        <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Wallpaper">
          {WALLPAPERS.map((wp) => (
            <button key={wp.key} type="button" role="radio" aria-checked={prefs.wallpaper === wp.key} onClick={() => setPrefs({ wallpaper: wp.key })} className="rounded-lg px-2 py-1 text-[12.5px]" style={{ background: prefs.wallpaper === wp.key ? 'var(--accent)' : 'var(--surface-2)', color: prefs.wallpaper === wp.key ? '#fff' : 'var(--ink)' }}>
              {wp.label}
            </button>
          ))}
        </div>
      </div>
      <Toggle label="Do Not Disturb" hint="Silence pop-up notifications" on={prefs.dnd} onChange={(value) => setPrefs({ dnd: value })} />
      <Toggle label="Reduce Motion" hint="Turn off window and dock animation" on={prefs.reduceMotion} onChange={(value) => setPrefs({ reduceMotion: value })} />
      <div className="flex gap-2">
        <button type="button" onClick={() => openOverlay('notifications')} className="flex-1 rounded-xl p-2 text-[12.5px]" style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}>Notifications</button>
        <button type="button" onClick={() => { closeOverlay(); openOverlay('spotlight'); }} className="flex-1 rounded-xl p-2 text-[12.5px]" style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}>Spotlight</button>
      </div>
    </section>
  );
}
