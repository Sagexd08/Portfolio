import { useState } from 'react';
import { profile } from '../content/portfolio';
import { ButtonLink } from './ui';

type CopyState = 'idle' | 'copied' | 'failed';

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

export default function ContactApp() {
  const [copy, setCopy] = useState<CopyState>('idle');

  const onCopy = async (): Promise<void> => {
    setCopy((await copyText(profile.email)) ? 'copied' : 'failed');
    window.setTimeout(() => setCopy('idle'), 2200);
  };

  return (
    <div className="mx-auto max-w-[420px] p-6">
      <h2 className="m-0 mb-1 text-[20px] font-semibold">Let’s talk</h2>
      <p className="m-0 mb-5 text-[14px]" style={{ color: 'var(--muted)' }}>{profile.availability}. Email is the fastest way to reach me.</p>
      <div className="mb-4 rounded-xl p-4" style={{ border: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>
        <p className="mono m-0 mb-3 break-all text-[14px]">{profile.email}</p>
        <div className="flex flex-wrap items-center gap-2">
          <a href={`mailto:${profile.email}`} className="rounded-lg px-3 py-[6px] text-[13px] text-white" style={{ background: 'var(--accent)' }}>Send email</a>
          <button type="button" onClick={onCopy} className="rounded-lg px-3 py-[6px] text-[13px]" style={{ border: '1px solid var(--hairline)', background: 'var(--surface)' }}>
            Copy address
          </button>
          <span role="status" aria-live="polite" className="text-[12px]" style={{ color: copy === 'failed' ? '#c0504a' : 'var(--ok)' }}>
            {copy === 'copied' ? 'Copied to clipboard' : copy === 'failed' ? 'Copy failed. Select the address manually.' : ''}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <ButtonLink href={profile.linkedin}>LinkedIn</ButtonLink>
        <ButtonLink href={profile.github}>GitHub</ButtonLink>
        <ButtonLink href={profile.website}>Website</ButtonLink>
        <ButtonLink href={profile.resumeUrl} download>Download resume</ButtonLink>
      </div>
    </div>
  );
}
