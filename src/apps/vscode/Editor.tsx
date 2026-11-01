import { useEffect, useRef } from 'react';
import type { VFile } from './files';
import { highlightLine } from './highlight';
import { C } from './theme';

interface Props {
  file: VFile;
  line: number;
  onLine: (line: number) => void;
}

const LINE_H = 20;

export function Editor({ file, line, onLine }: Props) {
  const rows = file.content.split('\n');
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { if (box.current) box.current.scrollTop = 0; }, [file.path]);

  const onKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'ArrowDown') { e.preventDefault(); onLine(Math.min(line + 1, rows.length)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); onLine(Math.max(line - 1, 1)); }
  };

  return (
    <div className="flex min-h-0 flex-1">
      <div
        ref={box}
        role="textbox"
        aria-readonly="true"
        aria-multiline="true"
        aria-label={`${file.path}, read-only`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="mono min-w-0 flex-1 overflow-auto py-1 text-[13px] outline-none"
        style={{ background: C.editor, color: C.editorFg, lineHeight: `${LINE_H}px` }}
      >
        {rows.map((text, i) => {
          const n = i + 1;
          return (
            <div key={n} onClick={() => onLine(n)} className="flex" style={{ height: 'auto', minHeight: LINE_H, background: n === line ? 'rgba(255,255,255,0.04)' : undefined }}>
              <span aria-hidden="true" className="w-12 flex-none select-none pr-4 text-right" style={{ color: n === line ? C.lineNumberActive : C.lineNumber }}>{n}</span>
              <span className="whitespace-pre-wrap break-words pr-3">{text ? highlightLine(text, file.language) : ' '}</span>
            </div>
          );
        })}
      </div>
      <div aria-hidden="true" className="hidden w-[60px] flex-none overflow-hidden py-1 sm:block" style={{ background: C.editor, borderLeft: `1px solid ${C.border}` }}>
        {rows.slice(0, 160).map((text, i) => (
          <div key={i} className="mb-[1px] ml-1 h-[2px] rounded-[1px]" style={{ width: Math.min(52, Math.max(2, text.length * 0.5)), background: text ? 'rgba(204,204,204,0.28)' : 'transparent' }} />
        ))}
      </div>
    </div>
  );
}
