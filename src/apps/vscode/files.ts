import { experience, openSource, profile, projects, skills } from '../../content/portfolio';

export type Language = 'markdown' | 'json' | 'typescript';

export interface VFile {
  path: string;
  name: string;
  language: Language;
  content: string;
}

const bullets = (items: readonly string[]): string => items.map((item) => `- ${item}`).join('\n');
const lines = (...parts: (string | false | undefined)[]): string => parts.filter((p): p is string => Boolean(p)).join('\n');

const readme = lines(
  `# ${profile.name}`,
  '',
  `**${profile.headline}** · ${profile.location}`,
  '',
  profile.summary,
  '',
  `> ${profile.availability}`,
  '',
  '## Links',
  '',
  `- GitHub: [${profile.github}](${profile.github})`,
  `- LinkedIn: [${profile.linkedin}](${profile.linkedin})`,
  `- Website: [${profile.website}](${profile.website})`,
  '',
  '## Workspace',
  '',
  bullets(['projects/ - one file per project', 'skills.json - tools and languages', 'resume.md - experience timeline', 'open-source.md - public contributions', 'contact.ts - how to reach me']),
);

const projectFiles: VFile[] = projects.map((p) => ({
  path: `projects/${p.slug}.md`,
  name: `${p.slug}.md`,
  language: 'markdown',
  content: lines(
    `# ${p.name}`,
    '',
    p.description,
    '',
    `- **Category:** ${p.category}`,
    `- **Role:** ${p.role}`,
    p.status && `- **Status:** ${p.status}`,
    `- **Stack:** ${p.technologies.join(', ')}`,
    p.githubUrl && `- **Source:** [${p.githubUrl}](${p.githubUrl})`,
    p.liveUrl && `- **Live:** [${p.liveUrl}](${p.liveUrl})`,
  ),
}));

const period = (e: (typeof experience)[number]): string => (e.startDate ? `${e.startDate} to ${e.endDate ?? 'n/a'}` : 'undated');

const resume = lines(
  '# Resume',
  '',
  ...experience.flatMap((e) => [
    `## ${e.title}`,
    '',
    `**${e.organization}** (${period(e)})`,
    '',
    e.description,
    '',
    bullets(e.achievements),
    '',
  ]),
);

const openSourceMd = lines(
  '# Open source',
  '',
  ...openSource.flatMap((o) => [`## ${o.title}`, '', `[${o.repo}](${o.url}) · ${o.meta}`, '', o.description, '']),
);

const skillsJson = JSON.stringify(Object.fromEntries(skills.map((s) => [s.group, s.items])), null, 2);

const contactTs = lines(
  'export const contact = {',
  `  name: ${JSON.stringify(profile.name)},`,
  `  email: ${JSON.stringify(profile.email)},`,
  `  github: ${JSON.stringify(profile.github)},`,
  `  linkedin: ${JSON.stringify(profile.linkedin)},`,
  `  website: ${JSON.stringify(profile.website)},`,
  `  location: ${JSON.stringify(profile.location)},`,
  '} as const;',
  '',
  `export const availability: string = ${JSON.stringify(profile.availability)};`,
);

const top = (path: string, language: Language, content: string): VFile => ({ path, name: path, language, content });

export const FILES: VFile[] = [
  top('README.md', 'markdown', readme),
  ...projectFiles,
  top('skills.json', 'json', skillsJson),
  top('resume.md', 'markdown', resume),
  top('open-source.md', 'markdown', openSourceMd),
  top('contact.ts', 'typescript', contactTs),
];

export const FILE_BY_PATH = new Map(FILES.map((f) => [f.path, f]));

export interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
}

/** Folders first, then files, alphabetically (VS Code Explorer order). */
export function buildTree(): TreeNode[] {
  const rootFiles = FILES.filter((f) => !f.path.includes('/'));
  const folders = new Map<string, TreeNode>();
  for (const f of FILES) {
    const [dir] = f.path.split('/');
    if (dir === f.path) continue;
    const node = folders.get(dir) ?? { name: dir, path: dir, children: [] };
    node.children?.push({ name: f.name, path: f.path });
    folders.set(dir, node);
  }
  const byName = (a: TreeNode, b: TreeNode): number => a.name.localeCompare(b.name);
  return [...[...folders.values()].sort(byName), ...rootFiles.map((f) => ({ name: f.name, path: f.path })).sort(byName)];
}

export function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let pos = 0;
  let score = 0;
  for (const ch of q) {
    const hit = t.indexOf(ch, pos);
    if (hit < 0) return -1;
    score += hit === pos ? 2 : 1;
    pos = hit + 1;
  }
  return score;
}
