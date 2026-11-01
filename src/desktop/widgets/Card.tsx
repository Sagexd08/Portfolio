import type { ReactNode } from 'react';

export const muted = { color: 'var(--muted)' } as const;
export const btn = 'mt-2 inline-block rounded-full px-3 py-1 text-[12px] font-medium text-white no-underline';
export const btnStyle = { background: 'var(--accent, #0a84ff)' } as const;

export function Card({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section aria-label={label} className="widget widget-card glass p-4" style={{ color: 'var(--ink)' }}>
      <h2 className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-wide" style={muted}>{label}</h2>
      {children}
    </section>
  );
}
