import { useEffect, useRef, useState } from 'react';
import { useAiStatus } from '../ai/status';
import { profile } from '../content/portfolio';
import { launchApp } from './store';

const firstSentence = profile.summary.split('. ')[0] + '.';

function Bars() {
  return (
    <span aria-hidden="true" className="flex h-3 items-center gap-[2px]">
      {[0, 1, 2, 3].map((bar) => (
        <i key={bar} className="block h-3 w-[2px] rounded bg-white" style={{ animation: `bars 700ms ${bar * 110}ms ease-in-out infinite`, transformOrigin: 'center' }} />
      ))}
    </span>
  );
}

function Dots() {
  return (
    <span aria-hidden="true" className="flex gap-[3px]">
      {[0, 1, 2].map((dot) => (
        <i key={dot} className="block h-[4px] w-[4px] rounded-full bg-white" style={{ animation: `dots 1s ${dot * 160}ms infinite` }} />
      ))}
    </span>
  );
}

export function DynamicIsland() {
  const [expanded, setExpanded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const status = useAiStatus();

  useEffect(() => {
    if (!expanded) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setExpanded(false);
    };
    const onPointer = (event: PointerEvent): void => {
      if (root.current && !root.current.contains(event.target as Node)) setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [expanded]);

  const label: Record<typeof status.phase, string> = {
    idle: profile.availability,
    opened: 'Assistant ready',
    listening: 'Listening…',
    processing: 'Thinking…',
    responding: 'Answering…',
    error: status.message ?? 'Something went wrong',
  };
  const indicator = status.phase === 'listening' ? <Bars /> : status.phase === 'processing' ? <Dots /> : <i aria-hidden="true" className="block h-[6px] w-[6px] rounded-full" style={{ background: status.phase === 'error' ? '#e5645a' : 'var(--ok)' }} />;

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-expanded={expanded}
        aria-label="Status and introduction"
        onClick={() => setExpanded((value) => !value)}
        className="flex h-[22px] max-w-[min(62vw,360px)] items-center gap-2 rounded-full px-3 text-[11px] text-white"
        style={{ background: '#000', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        {indicator}
        <span className="truncate">{label[status.phase]}</span>
      </button>
      {status.phase === 'error' && status.retry && (
        <button type="button" onClick={status.retry} className="ml-2 rounded-full bg-black px-2 text-[11px] text-white" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
          Retry
        </button>
      )}
      {expanded && (
        <div
          role="region"
          aria-label="About Sohom"
          className="win-in absolute left-1/2 top-[30px] w-[min(92vw,340px)] -translate-x-1/2 rounded-2xl p-4 text-[12px] leading-relaxed text-white"
          style={{ background: '#000', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 18px 40px rgba(0,0,0,0.5)' }}
        >
          <p className="m-0 mb-2 text-[13px] font-medium">{profile.name}</p>
          <p className="m-0 mb-3 opacity-80">{firstSentence}</p>
          <p className="m-0 mb-1 opacity-60">Now</p>
          <p className="m-0 mb-3">Co-founder &amp; CEO at Lumeo · B.Tech CSE (Data Science), Sister Nivedita University</p>
          <p className="m-0 mb-1 opacity-60">Looking for</p>
          <p className="m-0 mb-3">{profile.targetRoles.join(' · ')}</p>
          <div className="flex gap-2">
            <button type="button" className="rounded-full bg-white px-3 py-1 text-black" onClick={() => { launchApp('assistant'); setExpanded(false); }}>
              Ask the assistant
            </button>
            <button type="button" className="rounded-full px-3 py-1" style={{ border: '1px solid rgba(255,255,255,0.3)' }} onClick={() => { launchApp('contact'); setExpanded(false); }}>
              Contact
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
