import type { ReactNode } from 'react';
import type { Language } from './files';
import { TOKEN } from './theme';

type Rule = readonly [RegExp, string];

const TS_KEYWORDS = 'export|const|let|var|as|type|interface|import|from|function|return|true|false|null|undefined';

const RULES: Record<Language, Rule[]> = {
  typescript: [
    [/\/\/.*/y, TOKEN.comment],
    [/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/y, TOKEN.string],
    [/\d+(?:\.\d+)?/y, TOKEN.number],
    [new RegExp(`(?:${TS_KEYWORDS})\\b`, 'y'), TOKEN.keyword],
    [/[A-Za-z_]\w*(?=\s*:)/y, TOKEN.variable],
    [/[A-Z]\w*/y, TOKEN.type],
  ],
  json: [
    [/"(?:[^"\\]|\\.)*"(?=\s*:)/y, TOKEN.variable],
    [/"(?:[^"\\]|\\.)*"/y, TOKEN.string],
    [/-?\d+(?:\.\d+)?/y, TOKEN.number],
    [/(?:true|false|null)\b/y, TOKEN.keyword],
  ],
  markdown: [
    [/\*\*[^*]+\*\*/y, TOKEN.keyword],
    [/`[^`]+`/y, TOKEN.string],
    [/\[[^\]]+\]/y, TOKEN.string],
    [/\([^)\s]+\)/y, TOKEN.link],
  ],
};

function inline(line: string, language: Language): ReactNode[] {
  const rules = RULES[language];
  const out: ReactNode[] = [];
  let plain = '';
  let i = 0;
  const flush = (): void => {
    if (plain) out.push(plain);
    plain = '';
  };
  while (i < line.length) {
    let matched = false;
    for (const [re, color] of rules) {
      re.lastIndex = i;
      const m = re.exec(line);
      if (!m) continue;
      flush();
      out.push(<span key={i} style={{ color }}>{m[0]}</span>);
      i += m[0].length;
      matched = true;
      break;
    }
    if (!matched) plain += line[i++];
  }
  flush();
  return out;
}

export function highlightLine(line: string, language: Language): ReactNode {
  if (language !== 'markdown') return inline(line, language);
  if (/^#{1,6}\s/.test(line)) return <span style={{ color: TOKEN.heading, fontWeight: 700 }}>{line}</span>;
  if (line.startsWith('>')) return <span style={{ color: TOKEN.comment }}>{line}</span>;
  const bullet = /^(\s*[-*]\s)(.*)$/.exec(line);
  if (bullet) return <><span style={{ color: TOKEN.keyword }}>{bullet[1]}</span>{inline(bullet[2], language)}</>;
  return inline(line, language);
}
