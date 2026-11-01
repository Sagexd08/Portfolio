import { experience, openSource, profile, projects, skills, type ExperienceEntry, type Project } from '../../../content/portfolio';

// Every string here is derived from src/content/portfolio.ts. Nothing is invented.

const span = (e: ExperienceEntry): string => (e.startDate ? `${e.startDate} - ${e.endDate ?? '?'}` : 'undated');
const bullets = (items: readonly string[]): string[] => items.map((i) => `  - ${i}`);

export const about = (): string[] => [profile.name, profile.headline, profile.location, '', profile.summary, '', profile.availability];

export const whoami = (): string[] => [`${profile.name}: ${profile.headline}. ${profile.availability}.`];

export function likes(): string[] {
  const categories = [...new Set(projects.map((p) => p.category))];
  return [
    'What he enjoys building (from his projects and work):',
    ...bullets(categories),
    '',
    `Featured: ${projects.filter((p) => p.featured).map((p) => p.name).join(', ')}`,
  ];
}

export const skillsCmd = (): string[] => skills.flatMap((g) => [`${g.group}:`, `  ${g.items.join(', ')}`]);

export const projectList = (): string[] => [
  ...projects.map((p) => `${p.slug.padEnd(24)}${p.name} (${p.category})`),
  '',
  'Details: project <name>',
];

export function findProject(query: string): Project | undefined {
  const q = query.toLowerCase().trim();
  if (!q) return undefined;
  return projects.find((p) => p.slug === q || p.name.toLowerCase() === q) ?? projects.find((p) => p.slug.includes(q) || p.name.toLowerCase().includes(q));
}

export function projectDetail(query: string): string[] {
  if (!query.trim()) return ['usage: project <name>', ...projectList()];
  const p = findProject(query);
  if (!p) return [`project: no project matching "${query}"`, ...projectList()];
  return [
    p.name,
    `${p.category} · ${p.role}${p.status ? ` · ${p.status}` : ''}`,
    '',
    p.description,
    '',
    `Tech: ${p.technologies.join(', ')}`,
    ...(p.githubUrl ? [`GitHub: ${p.githubUrl}`] : []),
    ...(p.liveUrl ? [`Live: ${p.liveUrl}`] : []),
  ];
}

const entryLines = (e: ExperienceEntry): string[] => [`${e.title}, ${e.organization} (${span(e)})`, `  ${e.description}`, ...bullets(e.achievements).map((l) => `  ${l}`), ''];
const byType = (types: ExperienceEntry['type'][]): ExperienceEntry[] => experience.filter((e) => types.includes(e.type));

export const experienceCmd = (): string[] => byType(['employment', 'founder', 'achievement', 'community']).flatMap(entryLines);
export const educationCmd = (): string[] => {
  const rows = byType(['education']);
  return rows.length ? rows.flatMap(entryLines) : ['No education entries listed.'];
};

export const openSourceCmd = (): string[] => openSource.flatMap((o) => [`${o.repo}: ${o.title}`, `  ${o.description}`, `  ${o.meta}`, `  ${o.url}`, '']);

export const lookingFor = (): string[] => [profile.availability, `Target roles: ${profile.targetRoles.join(', ')}`, `Reach him: ${profile.email}`];

export const contact = (): string[] => [`Email:    ${profile.email}`, `GitHub:   ${profile.github}`, `LinkedIn: ${profile.linkedin}`, `Website:  ${profile.website}`];

export const social = (): string[] => [`GitHub:   ${profile.github}`, `LinkedIn: ${profile.linkedin}`, `Website:  ${profile.website}`];
