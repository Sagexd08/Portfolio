import { composeAnswer } from '../../../ai/extractive';
import { retrieve } from '../../../ai/retrieve';

const NO_ANSWER = "I couldn't find a confident answer to that in Sohom's portfolio. Try: about, projects, experience, skills, or ask a more specific question.";

/** Extractive answer from the local index only; no network model. */
export async function ask(question: string): Promise<string[]> {
  const q = question.trim().slice(0, 400);
  if (!q) return ['usage: ask <question>'];
  try {
    const { hits } = await retrieve(q, 5);
    const answer = composeAnswer(q, hits);
    if (answer.refused) return [NO_ANSWER];
    return [answer.text, '', 'Sources:', ...answer.sources.map((s) => `  [${s.n}] ${s.title} - ${s.url}`)];
  } catch {
    return ['Could not search the portfolio index right now. Please try again.'];
  }
}
