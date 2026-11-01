import { composeAnswer } from '../../../ai/extractive';
import { retrieve } from '../../../ai/retrieve';
import { experience, profile, projects } from '../../../content/portfolio';

const NO_ANSWER = "I couldn't find a confident answer to that in Sohom's portfolio. Try: about, projects, experience, skills, or ask a more specific question.";

const STOP = new Set('a an the is are was what who how why does do did about of for to in on with sohom he his me my you your tell can could would please sage'.split(' '));

/** Loose fallback: best-matching portfolio sentences by shared keywords. */
function keywordAnswer(q: string): string[] | null {
  const words = q.toLowerCase().match(/[a-z0-9+#.]+/g)?.filter((w) => w.length > 2 && !STOP.has(w)) ?? [];
  if (!words.length) return null;
  const stems = words.map((w) => w.replace(/(ing|ed|es|s)$/, ''));
  const texts = [
    profile.summary,
    `${profile.availability}. Target roles: ${profile.targetRoles.join(', ')}. Based in ${profile.location}.`,
    ...projects.map((p) => `${p.name}: ${p.description}`),
    ...experience.map((e) => `${e.title} at ${e.organization}. ${e.description}`),
  ];
  const scored = texts
    .map((t) => ({ t, s: stems.filter((w) => t.toLowerCase().includes(w)).length }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
  return scored.length ? scored.slice(0, 2).map((x) => x.t) : null;
}

/** Extractive answer from the local index only; no network model. */
export async function ask(question: string): Promise<string[]> {
  const q = question.trim().slice(0, 400);
  if (!q) return ['usage: ask <question>'];
  try {
    const { hits } = await retrieve(q, 5);
    const answer = composeAnswer(q, hits);
    if (answer.refused) return keywordAnswer(q) ?? [NO_ANSWER];
    return [answer.text, '', 'Sources:', ...answer.sources.map((s) => `  [${s.n}] ${s.title} - ${s.url}`)];
  } catch {
    return ['Could not search the portfolio index right now. Please try again.'];
  }
}
