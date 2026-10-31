import { projects, type Project } from '../content/portfolio';
import { openApp } from '../desktop/store';
import type { AppProps } from '../desktop/types';
import { ButtonLink, ProjectLogo, Tag } from './ui';

const verificationLabel: Record<Project['verification'], string> = {
  resume: 'From resume',
  github: 'GitHub description only',
};

function Row({ project, large }: { project: Project; large: boolean }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => openApp('projects', { slug: project.slug })}
        className="flex w-full items-start gap-3 rounded-xl p-3 text-left"
        style={{ border: '1px solid var(--hairline)', background: large ? 'var(--surface-2)' : 'transparent' }}
      >
        <ProjectLogo slug={project.slug} name={project.name} size={large ? 48 : 36} />
        <span className="min-w-0 flex-1">
          <span className={`block font-medium ${large ? 'text-[16px]' : 'text-[14px]'}`}>{project.name}</span>
          <span className="block text-[13px]" style={{ color: 'var(--muted)' }}>{project.description}</span>
          <span className="mt-2 flex flex-wrap items-center gap-1">
            <Tag>{project.category}</Tag>
            {project.technologies.slice(0, large ? 6 : 3).map((tech) => <Tag key={tech}>{tech}</Tag>)}
          </span>
        </span>
      </button>
    </li>
  );
}

function Detail({ project }: { project: Project }) {
  return (
    <article className="mx-auto max-w-[640px] p-6">
      <button type="button" onClick={() => openApp('projects')} className="mb-4 text-[13px]" style={{ color: 'var(--accent)' }}>‹ All projects</button>
      <header className="mb-4 flex items-center gap-3">
        <ProjectLogo slug={project.slug} name={project.name} size={56} />
        <div>
          <h2 className="m-0 text-[22px] font-semibold">{project.name}</h2>
          <p className="m-0 text-[13px]" style={{ color: 'var(--muted)' }}>{project.category}{project.status ? ` · ${project.status}` : ''}</p>
        </div>
      </header>
      <p className="mb-5 text-[14px] leading-relaxed">{project.description}</p>
      <dl className="mb-5 grid grid-cols-[110px_1fr] gap-y-2 text-[13px]">
        <dt style={{ color: 'var(--muted)' }}>My role</dt><dd className="m-0">{project.role}</dd>
        {project.technologies.length > 0 && (<><dt style={{ color: 'var(--muted)' }}>Stack</dt><dd className="m-0 flex flex-wrap gap-1">{project.technologies.map((tech) => <Tag key={tech}>{tech}</Tag>)}</dd></>)}
        <dt style={{ color: 'var(--muted)' }}>Evidence</dt><dd className="m-0">{verificationLabel[project.verification]}: {project.evidenceSources.join(', ')}</dd>
      </dl>
      <div className="flex flex-wrap gap-2">
        {project.githubUrl && <ButtonLink href={project.githubUrl}>GitHub repository</ButtonLink>}
        {project.liveUrl && <ButtonLink href={project.liveUrl}>Live site</ButtonLink>}
        {!project.githubUrl && !project.liveUrl && <p className="m-0 text-[12px]" style={{ color: 'var(--muted)' }}>No public repository or live link for this project.</p>}
      </div>
    </article>
  );
}

export default function ProjectsApp({ params }: AppProps) {
  const current = projects.find((project) => project.slug === params.slug);
  if (params.slug && !current) {
    return (
      <div className="p-6 text-[14px]">
        <p>No project called “{params.slug}”.</p>
        <button type="button" onClick={() => openApp('projects')} style={{ color: 'var(--accent)' }}>Back to all projects</button>
      </div>
    );
  }
  if (current) return <Detail project={current} />;

  const featured = projects.filter((project) => project.featured);
  const rest = projects.filter((project) => !project.featured);
  return (
    <div className="mx-auto max-w-[760px] p-5">
      <h2 className="m-0 mb-3 text-[13px] font-semibold">Featured</h2>
      <ul className="m-0 mb-6 grid list-none gap-3 p-0">{featured.map((project) => <Row key={project.slug} project={project} large />)}</ul>
      <h2 className="m-0 mb-3 text-[13px] font-semibold">More projects</h2>
      <ul className="m-0 grid list-none gap-2 p-0">{rest.map((project) => <Row key={project.slug} project={project} large={false} />)}</ul>
    </div>
  );
}
