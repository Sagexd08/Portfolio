import { useEffect, useRef, useState } from 'react';
import { experience, profile, type ExperienceEntry, type ExperienceType } from '../content/portfolio';
import { openApp } from '../desktop/store';
import { ButtonLink, Tag, formatMonth } from './ui';

type Filter = 'all' | ExperienceType;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'founder', label: 'Founder' },
  { key: 'employment', label: 'Experience' },
  { key: 'education', label: 'Education' },
  { key: 'open-source', label: 'Open source' },
  { key: 'community', label: 'Community' },
];

function byStartDesc(a: ExperienceEntry, b: ExperienceEntry): number {
  return (b.startDate ?? '').localeCompare(a.startDate ?? '');
}

function range(entry: ExperienceEntry): string {
  if (!entry.startDate) return 'Undated';
  return `${formatMonth(entry.startDate)} – ${formatMonth(entry.endDate ?? entry.startDate)}`;
}

function Entry({ entry }: { entry: ExperienceEntry }) {
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([hit]) => hit.isIntersecting && node.classList.add('is-visible'), { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <li ref={ref} className="reveal relative pb-7 pl-7">
      <span aria-hidden="true" className="absolute left-0 top-[6px] h-[9px] w-[9px] rounded-full" style={{ background: 'var(--surface)', border: '1.5px solid var(--ink)', marginLeft: -4.5 }} />
      <p className="mono m-0 text-[11px]" style={{ color: 'var(--muted)' }}>{range(entry)}</p>
      <h3 className="m-0 text-[15px] font-semibold">{entry.title}</h3>
      <p className="m-0 mb-1 text-[13px]" style={{ color: 'var(--muted)' }}>{entry.organization}</p>
      <p className="m-0 mb-2 text-[13px] leading-relaxed">{entry.description}</p>
      {entry.achievements.length > 0 && (
        <details className="mb-2">
          <summary className="cursor-pointer text-[12px]" style={{ color: 'var(--accent)' }}>Details ({entry.achievements.length})</summary>
          <ul className="mt-2 space-y-1 pl-5 text-[13px] leading-relaxed">{entry.achievements.map((line) => <li key={line}>{line}</li>)}</ul>
        </details>
      )}
      <div className="flex flex-wrap items-center gap-1">
        {entry.technologies?.map((tech) => <Tag key={tech}>{tech}</Tag>)}
        {entry.projectSlug && (
          <button type="button" onClick={() => openApp('projects', { slug: entry.projectSlug! })} className="ml-1 text-[12px]" style={{ color: 'var(--accent)' }}>
            View project ›
          </button>
        )}
      </div>
    </li>
  );
}

export default function ResumeApp() {
  const [filter, setFilter] = useState<Filter>('all');
  const [progress, setProgress] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  const onScroll = (): void => {
    const node = scroller.current;
    if (!node) return;
    const max = node.scrollHeight - node.clientHeight;
    setProgress(max > 0 ? node.scrollTop / max : 1);
  };

  const shown = experience.filter((entry) => filter === 'all' || entry.type === filter);
  const dated = shown.filter((entry) => entry.startDate).sort(byStartDesc);
  const undated = shown.filter((entry) => !entry.startDate);

  return (
    <div ref={scroller} onScroll={onScroll} className="h-full overflow-auto">
      <div className="mx-auto max-w-[620px] p-6">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="m-0 text-[20px] font-semibold">{profile.name}</h2>
            <p className="m-0 text-[13px]" style={{ color: 'var(--muted)' }}>{profile.headline} · {profile.location}</p>
          </div>
          <ButtonLink href={profile.resumeUrl} download>Download resume (PDF)</ButtonLink>
        </header>
        <div className="mb-5 flex flex-wrap gap-1" role="group" aria-label="Filter timeline">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={filter === item.key}
              onClick={() => setFilter(item.key)}
              className="rounded-full px-3 py-[3px] text-[12px]"
              style={{ border: '1px solid var(--hairline)', background: filter === item.key ? 'var(--ink)' : 'transparent', color: filter === item.key ? 'var(--surface)' : 'var(--ink)' }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <span aria-hidden="true" className="absolute bottom-0 left-0 top-0 w-px" style={{ background: 'var(--hairline)' }} />
          <span aria-hidden="true" className="absolute left-0 top-0 h-full w-px origin-top" style={{ background: 'var(--ink)', transform: `scaleY(${progress})`, transition: 'transform 120ms linear' }} />
          <ol className="m-0 list-none p-0">{dated.map((entry) => <Entry key={entry.id} entry={entry} />)}</ol>
          {undated.length > 0 && (
            <>
              <h3 className="mb-3 ml-7 mt-2 text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Community &amp; open source (undated)</h3>
              <ol className="m-0 list-none p-0">{undated.map((entry) => <Entry key={entry.id} entry={entry} />)}</ol>
            </>
          )}
          {shown.length === 0 && <p className="ml-7 text-[13px]" style={{ color: 'var(--muted)' }}>Nothing in this category.</p>}
        </div>
      </div>
    </div>
  );
}
