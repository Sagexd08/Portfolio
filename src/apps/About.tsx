import { profile, skills } from '../content/portfolio';
import { launchApp } from '../desktop/store';
import { ButtonLink, Tag } from './ui';

const PRINCIPLES = ['Learn by building.', 'Understand systems by testing their limits.', 'Create useful things, not just demonstrations.'];

export default function AboutApp() {
  return (
    <div className="mx-auto max-w-[640px] p-6">
      <div className="mb-5 flex items-center gap-4">
        <img src={profile.avatarUrl} alt={profile.avatarAlt} width={72} height={72} loading="lazy" className="rounded-full object-cover" style={{ width: 72, height: 72, border: '1px solid var(--hairline)' }} />
        <div>
          <h2 className="m-0 text-[22px] font-semibold leading-tight">Third-year Computer Science student. Builder by curiosity. Engineer by experimentation.</h2>
          <p className="m-0 mt-1 text-[13px]" style={{ color: 'var(--muted)' }}>{profile.name} · {profile.location}</p>
        </div>
      </div>
      <p className="mb-5 text-[14px] leading-relaxed">{profile.summary}</p>

      <section aria-labelledby="looking" className="mb-5 rounded-xl p-4" style={{ border: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>
        <h3 id="looking" className="m-0 mb-1 text-[13px] font-semibold">Looking for</h3>
        <p className="m-0 mb-3 text-[14px]">{profile.targetRoles.join(' and ')} roles, ideally at an early-stage startup.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => launchApp('resume')} className="rounded-lg px-3 py-[6px] text-[13px]" style={{ border: '1px solid var(--hairline)', background: 'var(--surface)' }}>See the timeline</button>
          <button type="button" onClick={() => launchApp('contact')} className="rounded-lg px-3 py-[6px] text-[13px]" style={{ border: '1px solid var(--hairline)', background: 'var(--surface)' }}>Get in touch</button>
          <ButtonLink href={profile.resumeUrl} download>Download resume</ButtonLink>
        </div>
      </section>

      <section aria-labelledby="principles" className="mb-5">
        <h3 id="principles" className="m-0 mb-2 text-[13px] font-semibold">How I work</h3>
        <ol className="m-0 space-y-1 pl-5 text-[14px]">{PRINCIPLES.map((line) => <li key={line}>{line}</li>)}</ol>
      </section>

      <section aria-labelledby="startups" className="mb-5">
        <h3 id="startups" className="m-0 mb-2 text-[13px] font-semibold">Why early-stage teams</h3>
        <p className="m-0 text-[14px] leading-relaxed">
          Early-stage startups expose engineers to the whole product lifecycle. I want to work with small, ambitious teams, take ownership of technical problems and learn from real-world engineering trade-offs. At Lumeo I run that loop as a founder; at Deloitte I ran it for a client.
        </p>
      </section>

      <section aria-labelledby="interests">
        <h3 id="interests" className="m-0 mb-2 text-[13px] font-semibold">Technical interests, grouped by evidence in my resume</h3>
        <div className="space-y-3">
          {skills.map((group) => (
            <div key={group.group}>
              <p className="m-0 mb-1 text-[12px]" style={{ color: 'var(--muted)' }}>{group.group}</p>
              <div className="flex flex-wrap gap-1">{group.items.map((item) => <Tag key={item}>{item}</Tag>)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
