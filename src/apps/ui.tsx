import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Real logos discovered in project repos live in public/logos and are listed here by slug. */
const LOGO_FILES: Record<string, string> = {
  'project-apex': '/logos/project-apex.png',
  'aether-ai': '/logos/aether-ai.svg',
  aether: '/logos/aether-ai.svg',
  zelda: '/logos/zelda.svg',
  'archi-dev': '/logos/archi-dev.svg',
  'archi.dev': '/logos/archi-dev.svg',
};

export function ProjectLogo({ slug, name, size = 40 }: { slug: string; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const file = LOGO_FILES[slug];
  const initials = name
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
  if (file && !failed) {
    return <img src={file} alt={`${name} logo`} width={size} height={size} loading="lazy" onError={() => setFailed(true)} className="rounded-lg object-contain" />;
  }
  return (
    <span
      role="img"
      aria-label={`${name} monogram`}
      className="mono flex flex-none items-center justify-center rounded-lg text-[13px] font-medium"
      style={{ width: size, height: size, background: 'var(--surface-2)', border: '1px solid var(--hairline)', color: 'var(--muted)' }}
    >
      {initials}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full px-2 py-[2px] text-[11px]" style={{ border: '1px solid var(--hairline)', color: 'var(--muted)' }}>
      {children}
    </span>
  );
}

export function ExternalLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`underline underline-offset-2 ${className}`} style={{ color: 'var(--accent)' }}>
      {children}
    </a>
  );
}

export function ButtonLink({ href, children, download }: { href: string; children: ReactNode; download?: boolean }) {
  return (
    <a
      href={href}
      download={download ? '' : undefined}
      target={download ? undefined : '_blank'}
      rel={download ? undefined : 'noopener noreferrer'}
      className="inline-flex items-center rounded-lg px-3 py-[6px] text-[13px]"
      style={{ border: '1px solid var(--hairline)', background: 'var(--surface-2)', color: 'var(--ink)' }}
    >
      {children}
    </a>
  );
}

export function useWidth<T extends HTMLElement>(): [React.RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(900);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

export function formatMonth(value?: string): string {
  if (!value) return '';
  if (value === 'present') return 'Present';
  const [year, month] = value.split('-');
  if (!month) return year;
  return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(new Date(Number(year), Number(month) - 1, 1));
}
