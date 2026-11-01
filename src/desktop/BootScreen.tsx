import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { profile } from '../content/portfolio';
import './desktop.css';

const FADE_MS = 400;
const IGNORED_KEYS = new Set(['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock']);

function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

const stop = (event: MouseEvent): void => event.stopPropagation();

/** Lock screen shown once per session; the live wallpaper behind it is blurred, not re-fetched. */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const now = useNow();
  const [leaving, setLeaving] = useState(false);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const unlock = useCallback(() => {
    setLeaving(true);
    window.setTimeout(onDone, reduced ? 0 : FADE_MS);
  }, [onDone, reduced]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (IGNORED_KEYS.has(event.key) || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.target instanceof HTMLAnchorElement && event.key === 'Enter') return;
      unlock();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [unlock]);

  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: false });
  const date = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Lock screen. ${profile.name}`}
      data-leaving={leaving}
      onClick={unlock}
      className="lock-screen fixed inset-0 z-[20000] flex cursor-pointer flex-col items-center justify-center text-center text-white"
      style={{ background: 'rgba(8,10,16,0.35)', backdropFilter: 'blur(28px) saturate(1.2)', WebkitBackdropFilter: 'blur(28px) saturate(1.2)', textShadow: '0 2px 18px rgba(0,0,0,0.35)' }}
    >
      <p className="m-0 text-[clamp(16px,2vw,22px)] font-medium opacity-90">{date}</p>
      <p className="lock-clock m-0 mt-1" aria-label={`Time ${time}`}>{time}</p>
      <div
        className="mt-10 flex h-[88px] w-[88px] items-center justify-center rounded-full text-[32px] font-semibold"
        style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.7)' }}
        aria-hidden="true"
      >
        {profile.initials}
      </div>
      <h2 className="m-0 mt-4 text-[22px] font-semibold">{profile.name}</h2>
      <p className="m-0 mt-1 max-w-[90vw] text-[15px] opacity-90">Open to forward-deployed engineering and ML roles</p>
      <div className="mt-5 flex gap-3">
        {[
          ['GitHub', profile.github],
          ['LinkedIn', profile.linkedin],
        ].map(([label, href]) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" onClick={stop} className="lock-pill rounded-full px-4 py-[6px] text-[13px] font-medium text-white no-underline">
            {label}
          </a>
        ))}
      </div>
      <button type="button" onClick={unlock} autoFocus className="mt-10 rounded-full bg-transparent px-4 py-1 text-[13px] text-white opacity-80">
        Click or press any key to unlock
      </button>
    </div>
  );
}
