import { useEffect, useState } from 'react';
import { useReducedMotion } from './useMedia';

const FADE_MS = 400;
const MIN_MS = 650;
const HARD_TIMEOUT_MS = 3000;

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0.15);
  const [leaving, setLeaving] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    let finished = false;
    const finish = (): void => {
      if (finished) return;
      finished = true;
      setLeaving(true);
      window.setTimeout(onDone, reduced ? 0 : FADE_MS);
    };
    const minimum = new Promise<void>((resolve) => window.setTimeout(resolve, reduced ? 100 : MIN_MS));
    const fonts = (document.fonts?.ready ?? Promise.resolve()).then(() => setProgress((p) => Math.max(p, 0.6)));
    const loaded = new Promise<void>((resolve) => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', () => resolve(), { once: true });
    }).then(() => setProgress(1));
    Promise.all([minimum, fonts, loaded]).then(finish, finish);
    const skip = window.setTimeout(() => setCanSkip(true), 300);
    const hard = window.setTimeout(finish, HARD_TIMEOUT_MS);
    return () => {
      window.clearTimeout(skip);
      window.clearTimeout(hard);
    };
  }, [onDone, reduced]);

  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[20000] flex flex-col items-center justify-center"
      style={{ background: '#000', opacity: leaving ? 0 : 1, transition: `opacity ${FADE_MS}ms ease` }}
    >
      <img
        src="/brand/avatar-192.png"
        alt=""
        width={84}
        height={84}
        className="rounded-full object-cover"
        style={{ animation: 'win-in 400ms ease both', border: '1.5px solid rgba(255,255,255,0.85)' }}
      />
      <div className="mt-8 h-[2px] w-40 overflow-hidden rounded" style={{ background: 'rgba(255,255,255,0.15)' }}>
        <div className="h-full origin-left bg-white" style={{ transform: `scaleX(${progress})`, transition: 'transform 300ms ease' }} />
      </div>
      {canSkip && (
        <button type="button" onClick={onDone} className="absolute bottom-8 rounded-full px-4 py-1 text-xs text-white" style={{ border: '1px solid rgba(255,255,255,0.3)' }}>
          Skip
        </button>
      )}
    </div>
  );
}
