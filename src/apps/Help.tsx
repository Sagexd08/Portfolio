import { launchApp } from '../desktop/store';
import type { AppProps } from '../desktop/types';

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl';

const TIPS: [string, string][] = [
  ['Dock', 'Open an app. Click again to focus it, or to restore it if minimized.'],
  ['Drag / resize', 'Drag a window by its title bar; resize from the edges. Double-click the title bar to maximize.'],
  ['Menu bar', 'File, View and Window list real actions: open apps, tile windows, switch between them.'],
  ['Island', 'Click the black pill at the top for a quick intro. It also shows what the assistant is doing.'],
  [`${MOD} K`, 'Open the assistant from anywhere.'],
  ['Mobile', 'On small screens, apps open as full-screen sheets and the dock becomes a bottom bar.'],
];

export default function HelpApp({ params }: AppProps) {
  return (
    <div className="mx-auto max-w-[460px] p-6">
      {params.missing && (
        <div role="alert" className="mb-4 rounded-xl p-3 text-[13px]" style={{ border: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>
          There is nothing at <code>{params.missing}</code>. Try the Dock below, or{' '}
          <button type="button" onClick={() => launchApp('notes')} style={{ color: 'var(--accent)' }}>open Notes</button>.
        </div>
      )}
      <h2 className="m-0 mb-3 text-[18px] font-semibold">How this desktop works</h2>
      <dl className="m-0 grid grid-cols-[110px_1fr] gap-y-3 text-[13px]">
        {TIPS.map(([term, text]) => (
          <div key={term} className="contents">
            <dt className="font-medium">{term}</dt>
            <dd className="m-0" style={{ color: 'var(--muted)' }}>{text}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-[12px]" style={{ color: 'var(--muted)' }}>A few things on this desktop are hidden. Poke around.</p>
    </div>
  );
}
