import { experience, profile, projects, skills } from '../../content/portfolio';
import { ask } from './commands/ask';
import * as c from './commands/about';
import { APP_META, LAUNCHABLE } from '../../desktop/appMeta';
import { openApp } from '../../desktop/store';
import type { AppId } from '../../desktop/types';
import { FILES, FILE_BY_PATH } from '../vscode/files';

// A pure, in-memory command table. No real shell, no eval, no network.

export const HELP_GROUPS: Record<string, string[]> = {
  'About me': ['about', 'whoami', 'likes', 'skills', 'ask <question>'],
  Work: ['projects', 'project <name>', 'experience', 'education', 'open-source', 'looking-for'],
  Contact: ['contact', 'social', 'resume'],
  System: ['help', 'ls', 'cat <file>', 'neofetch', 'open <app>', 'clear', 'history', 'theme <name>', 'echo', 'date'],
};
export const COMMANDS = Object.values(HELP_GROUPS).flat().map((x) => x.split(' ')[0]);
export const THEMES = ['purple', 'basic', 'homebrew'] as const;
export type ThemeName = (typeof THEMES)[number];

export interface RunContext {
  history: readonly string[];
  setTheme: (theme: ThemeName) => void;
}

export interface RunResult {
  /** Output lines; undefined means clear the screen. */
  output: string[] | undefined;
}

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

const suggest = (cmd: string): string[] => COMMANDS.filter((x) => distance(cmd, x) <= 2 || x.startsWith(cmd));

const help = (): string[] => Object.entries(HELP_GROUPS).flatMap(([g, cmds]) => [`${g}:`, ...cmds.map((x) => `  ${x}`), '']);

const OPENABLE: AppId[] = [...LAUNCHABLE, 'vscode', 'terminal', 'playground'];

function neofetch(): string[] {
  const latest = experience[0];
  const stack = skills[0].items.slice(0, 4).join(', ');
  const info = [
    `${profile.name.replace(' ', '')}@portfolio`,
    '-----------------------',
    `Role:      ${profile.headline}`,
    `Location:  ${profile.location}`,
    `Now:       ${latest.title}, ${latest.organization}`,
    `Projects:  ${projects.length}`,
    `Languages: ${stack}`,
    `Email:     ${profile.email}`,
    `GitHub:    ${profile.github}`,
    '',
    'Type "help" to see all commands.',
  ];
  const art = ['  .----.  ', ' | >_   | ', ' |      | ', "  '----'  "];
  return info.map((line, i) => `${(art[i] ?? '').padEnd(14)}${line}`);
}

function cat(arg: string | undefined): string[] {
  if (!arg) return ['usage: cat <file>'];
  const file = FILE_BY_PATH.get(arg.replace(/^\.\//, ''));
  return file ? file.content.split('\n') : [`cat: ${arg}: No such file or directory`];
}

function ls(arg: string | undefined): string[] {
  const dir = arg?.replace(/\/$/, '');
  if (!dir) return ['README.md', 'projects/', 'skills.json', 'resume.md', 'open-source.md', 'contact.ts'];
  const inDir = FILES.filter((f) => f.path.startsWith(`${dir}/`)).map((f) => f.name);
  return inDir.length ? inDir : [`ls: ${arg}: No such file or directory`];
}

function open(arg: string | undefined): string[] {
  const app = OPENABLE.find((id) => id === arg || APP_META[id].title.toLowerCase() === arg?.toLowerCase());
  if (!app) return [arg ? `open: unknown app "${arg}"` : 'usage: open <app>', `apps: ${OPENABLE.join(', ')}`];
  openApp(app);
  return [`Opening ${APP_META[app].title}...`];
}

export function run(input: string, ctx: RunContext): RunResult | Promise<RunResult> {
  const [cmd, ...args] = input.trim().split(/\s+/);
  const out = (...lines: string[]): RunResult => ({ output: lines });
  switch (cmd) {
    case '':
      return out();
    case 'help':
      return { output: help() };
    case 'about':
      return { output: c.about() };
    case 'likes':
      return { output: c.likes() };
    case 'skills':
      return { output: c.skillsCmd() };
    case 'projects':
      return { output: c.projectList() };
    case 'project':
      return { output: c.projectDetail(args.join(' ')) };
    case 'experience':
      return { output: c.experienceCmd() };
    case 'education':
      return { output: c.educationCmd() };
    case 'open-source':
      return { output: c.openSourceCmd() };
    case 'looking-for':
      return { output: c.lookingFor() };
    case 'contact':
      return { output: c.contact() };
    case 'social':
      return { output: c.social() };
    case 'resume':
      openApp('resume');
      return out('Opening Resume...');
    case 'ask':
      return ask(args.join(' ')).then((output) => ({ output }));
    case 'ls':
      return { output: ls(args[0]) };
    case 'cat':
      return { output: cat(args[0]) };
    case 'whoami':
      return { output: c.whoami() };
    case 'neofetch':
      return { output: neofetch() };
    case 'open':
      return { output: open(args.join(' ') || undefined) };
    case 'clear':
      return { output: undefined };
    case 'history':
      return { output: ctx.history.map((h, i) => `${String(i + 1).padStart(4)}  ${h}`) };
    case 'echo':
      return out(args.join(' '));
    case 'date':
      return out(new Date().toString());
    case 'theme': {
      const name = THEMES.find((t) => t === args[0]);
      if (!name) return out(`usage: theme <${THEMES.join('|')}>`);
      ctx.setTheme(name);
      return out(`theme set to ${name}`);
    }
    default: {
      const near = suggest(cmd);
      return out(`zsh: command not found: ${cmd}`, ...(near.length ? [`did you mean: ${near.slice(0, 3).join(', ')}?`] : []));
    }
  }
}

/** Returns the full completed line, or undefined when there is no unique completion. */
export function complete(line: string): string | undefined {
  const m = /^(\S*)(?:\s+(.*))?$/.exec(line.trimStart());
  if (!m) return undefined;
  const [, cmd, arg] = m;
  if (arg === undefined) {
    const hits = COMMANDS.filter((x) => x.startsWith(cmd));
    return cmd && hits.length === 1 ? `${hits[0]} ` : undefined;
  }
  if (cmd === 'project') {
    const hits = projects.map((p) => p.slug).filter((slug) => slug.startsWith(arg.toLowerCase()));
    return arg && hits.length === 1 ? `project ${hits[0]}` : undefined;
  }
  return undefined;
}
