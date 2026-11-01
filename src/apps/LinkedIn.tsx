import { experience, profile, type ExperienceEntry } from '../content/portfolio';
import type { AppProps } from '../desktop/types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WORK: ExperienceEntry['type'][] = ['founder', 'employment'];

function fmt(value?: string): string {
  if (!value) return '';
  if (value === 'present') return 'Present';
  const [year, month] = value.split('-');
  return month ? `${MONTHS[Number(month) - 1] ?? ''} ${year}` : year;
}

const span = (entry: ExperienceEntry): string => [fmt(entry.startDate), fmt(entry.endDate)].filter(Boolean).join(' - ');
const byStart = (a: ExperienceEntry, b: ExperienceEntry): number => (b.startDate ?? '').localeCompare(a.startDate ?? '');
const card = { background: 'var(--surface)', border: '1px solid var(--hairline)' } as const;

function Section({ title, items }: { title: string; items: ExperienceEntry[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title} className="rounded-xl p-4" style={card}>
      <h2 className="m-0 mb-3 text-[16px] font-semibold">{title}</h2>
      <ul className="m-0 list-none space-y-4 p-0">
        {items.map((entry) => (
          <li key={entry.id}>
            <p className="m-0 text-[14px] font-semibold">{entry.title}</p>
            <p className="m-0 text-[13px]">{entry.organization}</p>
            {span(entry) && <p className="m-0 text-[12px]" style={{ color: 'var(--muted)' }}>{span(entry)}</p>}
            <p className="m-0 mt-1 text-[13px]" style={{ color: 'var(--muted)' }}>{entry.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function LinkedIn(_props: AppProps) {
  const work = experience.filter((e) => WORK.includes(e.type)).sort(byStart);
  const education = experience.filter((e) => e.type === 'education').sort(byStart);
  return (
    <div className="h-full space-y-3 overflow-auto p-4" style={{ background: 'var(--surface-2)', color: 'var(--ink)' }}>
      <section aria-label="Profile" className="overflow-hidden rounded-xl" style={card}>
        <div className="h-24" style={{ background: 'linear-gradient(120deg, #3b95d9, #0a5ea8 60%, #123a6b)' }} />
        <div className="px-4 pb-4">
          <img src={profile.avatarUrl} alt={profile.avatarAlt} width={88} height={88} className="-mt-11 h-[88px] w-[88px] rounded-full object-cover" style={{ border: '4px solid var(--surface)' }} />
          <h1 className="m-0 mt-2 text-[20px] font-semibold">{profile.name}</h1>
          <p className="m-0 text-[14px]">{profile.headline}</p>
          <p className="m-0 text-[12.5px]" style={{ color: 'var(--muted)' }}>{profile.location}</p>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block rounded-full px-4 py-1.5 text-[13px] font-semibold text-white" style={{ background: '#0a66c2' }}>
            View on LinkedIn
          </a>
        </div>
      </section>
      <section aria-label="About" className="rounded-xl p-4" style={card}>
        <h2 className="m-0 mb-2 text-[16px] font-semibold">About</h2>
        <p className="m-0 text-[13.5px] leading-relaxed">{profile.summary}</p>
      </section>
      <Section title="Experience" items={work} />
      <Section title="Education" items={education} />
    </div>
  );
}
