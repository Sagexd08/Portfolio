import { profile } from '../content/portfolio';
import type { AppId } from './types';

export interface AppMeta {
  title: string;
  path: string;
  width: number;
  height: number;
  description: string;
}

export const APP_META: Record<AppId, AppMeta> = {
  notes: { title: 'Notes', path: '/', width: 880, height: 560, description: profile.summary },
  about: { title: 'About', path: '/about', width: 720, height: 600, description: 'Who Sohom Chatterjee is and how he builds.' },
  projects: { title: 'Projects', path: '/projects', width: 920, height: 620, description: 'Projects by Sohom Chatterjee: Project Apex DB, Lumeo, AETHER AI and more.' },
  resume: { title: 'Resume', path: '/resume', width: 760, height: 640, description: 'Career timeline: Lumeo, HackQuest, Deloitte and education.' },
  'open-source': { title: 'Open Source', path: '/open-source', width: 820, height: 600, description: 'Open-source contributions and public repositories.' },
  gallery: { title: 'Gallery', path: '/gallery', width: 860, height: 600, description: 'Photos by Sohom Chatterjee.' },
  finder: { title: 'Finder', path: '/finder', width: 840, height: 560, description: 'Browse Sohom’s projects, documents and pictures.' },
  maps: { title: 'Maps', path: '/maps', width: 880, height: 600, description: 'Where Sohom is based: Kolkata, India.' },
  assistant: { title: 'Assistant', path: '/assistant', width: 560, height: 640, description: 'Ask questions about Sohom. Answers come only from verified sources.' },
  contact: { title: 'Contact', path: '/contact', width: 520, height: 520, description: 'Get in touch with Sohom Chatterjee.' },
  help: { title: 'Help', path: '/help', width: 520, height: 480, description: 'How to use this desktop.' },
  playground: { title: 'Playground', path: '/playground', width: 720, height: 560, description: 'A neural network trained live in your browser.' },
  snake: { title: 'Snake', path: '/snake', width: 440, height: 520, description: 'A tiny Snake game. Beat your best score.' },
  embeddings: { title: 'Embedding Space', path: '/embeddings', width: 760, height: 600, description: 'The portfolio knowledge base, embedded and projected to 2D.' },
};

export const DOCK_ORDER: AppId[] = ['finder', 'notes', 'about', 'projects', 'resume', 'open-source', 'maps', 'gallery', 'assistant', 'contact'];

/** Apps shown in Launchpad and Spotlight (hidden easter-egg apps are excluded). */
export const LAUNCHABLE: AppId[] = [...DOCK_ORDER, 'snake', 'help'];

export function appFromPath(pathname: string): { app: AppId; params: Record<string, string> } | null {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const project = clean.match(/^\/projects\/([\w-]+)$/);
  if (project) return { app: 'projects', params: { slug: project[1] } };
  const hit = (Object.keys(APP_META) as AppId[]).find((id) => APP_META[id].path === clean);
  return hit ? { app: hit, params: {} } : null;
}

export function pathFor(app: AppId, params: Record<string, string>): string {
  if (app === 'projects' && params.slug) return `/projects/${params.slug}`;
  return APP_META[app].path;
}
