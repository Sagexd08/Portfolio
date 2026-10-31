import { openSource, profile } from '../content/portfolio';
import snapshot from '../content/github.generated.json';
import { ProjectLogo, Tag, ExternalLink } from './ui';

interface RepoRow {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
  url: string;
}

const repos = snapshot.repos as RepoRow[];
const fetched = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(snapshot.fetchedAt));

export default function OpenSourceApp() {
  return (
    <div className="mx-auto max-w-[720px] p-6">
      <section aria-labelledby="overview" className="mb-6">
        <h2 id="overview" className="m-0 mb-2 text-[13px] font-semibold">Overview</h2>
        <dl className="m-0 grid grid-cols-2 gap-3 text-[13px] sm:grid-cols-3">
          <div className="rounded-xl p-3" style={{ border: '1px solid var(--hairline)' }}>
            <dt style={{ color: 'var(--muted)' }}>Contributions to other projects</dt>
            <dd className="m-0 text-[22px] font-semibold">{openSource.length}</dd>
          </div>
          <div className="rounded-xl p-3" style={{ border: '1px solid var(--hairline)' }}>
            <dt style={{ color: 'var(--muted)' }}>Own public repositories</dt>
            <dd className="m-0 text-[22px] font-semibold">{repos.length}</dd>
          </div>
        </dl>
        <p className="mb-0 mt-2 text-[12px]" style={{ color: 'var(--muted)' }}>
          Third-party contributions and my own repositories are counted separately. Own-repo data is a GitHub snapshot fetched {fetched}, not live.
        </p>
      </section>

      <section aria-labelledby="contrib" className="mb-6">
        <h2 id="contrib" className="m-0 mb-2 text-[13px] font-semibold">Contributions to other projects</h2>
        <ul className="m-0 list-none space-y-3 p-0">
          {openSource.map((item) => (
            <li key={item.id} className="rounded-xl p-4" style={{ border: '1px solid var(--hairline)' }}>
              <p className="m-0 text-[12px]" style={{ color: 'var(--muted)' }}><ExternalLink href={item.repoUrl}>{item.repo}</ExternalLink> · {item.meta}</p>
              <h3 className="m-0 my-1 text-[15px] font-semibold">{item.title}</h3>
              <p className="m-0 mb-2 text-[13px]">{item.description}</p>
              <ExternalLink href={item.url} className="text-[13px]">View on GitHub</ExternalLink>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="repos">
        <h2 id="repos" className="m-0 mb-2 text-[13px] font-semibold">Repository explorer <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(own, public, non-fork)</span></h2>
        <ul className="m-0 list-none space-y-2 p-0">
          {repos.map((repo) => (
            <li key={repo.name} className="flex items-start gap-3 rounded-xl p-3" style={{ border: '1px solid var(--hairline)' }}>
              <ProjectLogo slug={repo.name.toLowerCase()} name={repo.name} size={32} />
              <div className="min-w-0 flex-1">
                <ExternalLink href={repo.url} className="text-[14px] font-medium">{repo.name}</ExternalLink>
                <p className="m-0 text-[12px]" style={{ color: 'var(--muted)' }}>{repo.description || 'No description'}</p>
                <p className="m-0 mt-1 flex flex-wrap items-center gap-1 text-[11px]" style={{ color: 'var(--muted)' }}>
                  {repo.language && <Tag>{repo.language}</Tag>}
                  <span>★ {repo.stars}</span>
                  <span>· updated {new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(new Date(repo.pushedAt))}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[12px]"><ExternalLink href={profile.github}>All repositories on GitHub</ExternalLink></p>
      </section>
    </div>
  );
}
