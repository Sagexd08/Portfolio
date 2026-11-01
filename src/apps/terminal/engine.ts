import { experience, profile, projects, skills } from '../../content/portfolio';
import { APP_META, LAUNCHABLE } from '../../desktop/appMeta';
import { openApp } from '../../desktop/store';
import type { AppId } from '../../desktop/types';
import { FILES, FILE_BY_PATH } from '../vscode/files';

// A pure, in-memory command table. No real shell, no eval, no network.

export const COMMANDS = ['help', 'ls', 'cat', 'whoami', 'neofetch', 'open', 'clear', 'history', 'theme', 'echo', 'date'] as const;
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

export function run(input: string, ctx: RunContext): RunResult {
  const [cmd, ...args] = input.trim().split(/\s+/);
  const out = (...lines: string[]): RunResult => ({ output: lines });
  switch (cmd) {
    case '':
      return out();
    case 'help':
      return out('Built-in commands:', ...COMMANDS.map((c) => `  ${c}`), 'Try: cat README.md, neofetch, open projects');
    case 'ls':
      return { output: ls(args[0]) };
    case 'cat':
      return { output: cat(args[0]) };
    case 'whoami':
      return out(profile.name.toLowerCase().replace(' ', '.'));
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
    default:
      return out(`zsh: command not found: ${cmd}`);
  }
}

export function complete(partial: string): string | undefined {
  if (!partial || /\s/.test(partial)) return undefined;
  const hits = COMMANDS.filter((c) => c.startsWith(partial));
  return hits.length === 1 ? hits[0] : undefined;
}
