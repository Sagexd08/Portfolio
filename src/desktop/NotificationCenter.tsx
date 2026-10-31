import { useRef } from 'react';
import { experience } from '../content/portfolio';
import { clearNotices, dismiss, dismissToast, useNotices, type Notice } from './notify';
import { closeOverlay, useDismiss, useOverlay } from './overlays';
import { setPrefs, usePrefs } from './prefs';
import { openApp } from './store';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function CalendarWidget() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cells = [...Array<null>(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <section aria-label="Calendar" className="rounded-2xl p-3" style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}>
      <p className="m-0 mb-1 text-[12px] font-semibold uppercase tracking-wide" style={{ color: '#e5645a' }}>{new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(now)}</p>
      <div className="grid grid-cols-7 gap-y-[2px] text-center text-[11px]">
        {DAY_LABELS.map((label, i) => <span key={i} style={{ color: 'var(--muted)' }}>{label}</span>)}
        {cells.map((day, i) => (
          <span key={i} className="mx-auto flex h-5 w-5 items-center justify-center rounded-full" style={day === now.getDate() ? { background: '#e5645a', color: '#fff' } : undefined}>{day}</span>
        ))}
      </div>
    </section>
  );
}

function NowWidget() {
  const current = experience.filter((entry) => entry.endDate === 'present');
  return (
    <section aria-label="Now" className="rounded-2xl p-3" style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}>
      <p className="m-0 mb-1 text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Now</p>
      <ul className="m-0 list-none space-y-1 p-0 text-[12.5px]">
        {current.map((entry) => <li key={entry.id}><strong>{entry.title}</strong><br /><span style={{ color: 'var(--muted)' }}>{entry.organization.split(',')[0]}</span></li>)}
      </ul>
    </section>
  );
}

function Row({ notice, onOpen, onClose }: { notice: Notice; onOpen: (notice: Notice) => void; onClose: (id: number) => void }) {
  return (
    <li className="group relative rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--hairline)' }}>
      <button type="button" onClick={() => onOpen(notice)} className="block w-full rounded-2xl p-3 pr-8 text-left">
        <span className="block text-[13px] font-semibold">{notice.title}</span>
        <span className="block text-[12.5px]" style={{ color: 'var(--muted)' }}>{notice.body}</span>
      </button>
      <button type="button" aria-label={`Dismiss: ${notice.title}`} onClick={() => onClose(notice.id)} className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full text-[12px] opacity-60 hover:opacity-100">×</button>
    </li>
  );
}

function open(notice: Notice): void {
  closeOverlay();
  if (notice.app) openApp(notice.app, notice.params ?? {});
}

export function NotificationCenter() {
  const active = useOverlay() === 'notifications';
  const { items } = useNotices();
  const prefs = usePrefs();
  const ref = useRef<HTMLElement>(null);
  useDismiss(ref, active);
  if (!active) return null;
  return (
    <aside ref={ref} aria-label="Notification Center" className="win-in fixed bottom-24 right-2 top-[34px] z-[24000] w-[min(94vw,360px)] overflow-auto rounded-2xl p-3" style={{ background: 'color-mix(in srgb, var(--chrome) 90%, transparent)', backdropFilter: 'blur(24px)', border: '1px solid var(--hairline)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)', color: 'var(--ink)' }}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="m-0 text-[15px] font-semibold">Notifications</h2>
        <div className="flex items-center gap-2 text-[12px]">
          <button type="button" aria-pressed={prefs.dnd} onClick={() => setPrefs({ dnd: !prefs.dnd })} className="rounded-full px-2 py-[2px]" style={{ border: '1px solid var(--hairline)', background: prefs.dnd ? 'var(--ink)' : 'transparent', color: prefs.dnd ? 'var(--surface)' : 'var(--ink)' }}>
            {prefs.dnd ? 'Do Not Disturb: on' : 'Do Not Disturb'}
          </button>
          {items.length > 0 && <button type="button" onClick={clearNotices} style={{ color: 'var(--accent)' }}>Clear all</button>}
        </div>
      </div>
      <ul className="m-0 mb-3 list-none space-y-2 p-0">
        {items.map((notice) => <Row key={notice.id} notice={notice} onOpen={open} onClose={dismiss} />)}
        {items.length === 0 && <li className="p-3 text-center text-[13px]" style={{ color: 'var(--muted)' }}>No new notifications</li>}
      </ul>
      <h2 className="m-0 mb-2 text-[13px] font-semibold" style={{ color: 'var(--muted)' }}>Widgets</h2>
      <div className="space-y-2"><CalendarWidget /><NowWidget /></div>
    </aside>
  );
}

export function Toasts() {
  const { toasts } = useNotices();
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-2 top-[34px] z-[23000] flex w-[min(94vw,340px)] flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} role="status" className="win-in pointer-events-auto rounded-2xl p-3" style={{ background: 'color-mix(in srgb, var(--chrome) 92%, transparent)', backdropFilter: 'blur(20px)', border: '1px solid var(--hairline)', boxShadow: '0 14px 36px rgba(0,0,0,0.35)', color: 'var(--ink)' }}>
          <button type="button" onClick={() => { dismissToast(toast.id); if (toast.app) openApp(toast.app, toast.params ?? {}); }} className="block w-full text-left">
            <span className="block text-[13px] font-semibold">{toast.title}</span>
            <span className="block text-[12.5px]" style={{ color: 'var(--muted)' }}>{toast.body}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
