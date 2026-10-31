// Non-LM answer composer: picks the most relevant sentences from retrieved chunks and cites them.
// It never adds words of its own, so it cannot hallucinate. It is also the grounding reference for the SLM.

import { tokenize, type Hit } from './retrieve';

export interface Source {
  n: number;
  title: string;
  url: string;
}

export interface Answer {
  text: string;
  sources: Source[];
  refused: boolean;
}

export const REFUSAL =
  "I don't have verified information about that in Sohom's portfolio. Try asking about his projects, experience, education, skills or open-source work.";

const MAX_SENTENCES = 4;
const MIN_SENTENCE_SCORE = 0.9;

function sentencesOf(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((line) => line.replace(/^[•\-*]\s*/, '').trim())
    .filter((line) => line.length > 25);
}

export function composeAnswer(query: string, hits: Hit[]): Answer {
  const terms = new Set(tokenize(query));
  if (terms.size === 0 || hits.length === 0) return { text: REFUSAL, sources: [], refused: true };

  const scored = hits.flatMap((hit, rank) =>
    sentencesOf(`${hit.text}`).map((sentence) => {
      const tokens = tokenize(sentence);
      const overlap = tokens.filter((token) => terms.has(token)).length;
      const titleBonus = tokenize(hit.title).filter((token) => terms.has(token)).length * 0.6;
      return { sentence, hit, rank, score: (overlap + titleBonus) / Math.sqrt(tokens.length + 4) * 3 - rank * 0.05 };
    }),
  );
  const chosen = scored
    .filter((item) => item.score >= MIN_SENTENCE_SCORE)
    .sort((a, b) => b.score - a.score)
    .filter((item, index, all) => all.findIndex((other) => other.sentence === item.sentence) === index)
    .slice(0, MAX_SENTENCES)
    .sort((a, b) => a.rank - b.rank);

  if (chosen.length === 0) return { text: REFUSAL, sources: [], refused: true };

  const sources: Source[] = [];
  const lines = chosen.map((item) => {
    let source = sources.find((entry) => entry.url === item.hit.url && entry.title === item.hit.title);
    if (!source) {
      source = { n: sources.length + 1, title: item.hit.title, url: item.hit.url };
      sources.push(source);
    }
    return `${item.sentence.replace(/[.\s]*$/, '.')} [${source.n}]`;
  });
  return { text: lines.join(' '), sources, refused: false };
}

const NUMBER = /\d[\d,.]*%?/g;
const CAPITALIZED = /\b[A-Z][a-zA-Z0-9]{2,}\b/g;
const MIN_OVERLAP = 0.6;

/** Cheap grounding check for SLM output: numbers and proper nouns must appear in the retrieved context. */
export function isGrounded(answer: string, hits: Hit[]): boolean {
  const context = hits.map((hit) => `${hit.title} ${hit.text}`).join(' ');
  const lower = context.toLowerCase();
  const numbers = answer.match(NUMBER) ?? [];
  if (numbers.some((value) => !context.includes(value.replace(/[.,]$/, '')))) return false;
  const names = (answer.match(CAPITALIZED) ?? []).filter((word) => !/^(The|This|That|His|He|Sohom|Lumeo|And|For|With|Not|But)$/.test(word));
  const unknown = names.filter((word) => !lower.includes(word.toLowerCase()));
  if (unknown.length > 1) return false;
  const tokens = tokenize(answer);
  if (tokens.length === 0) return false;
  const contextTokens = new Set(tokenize(context));
  return tokens.filter((token) => contextTokens.has(token)).length / tokens.length >= MIN_OVERLAP;
}
