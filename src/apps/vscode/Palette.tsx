import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { fuzzyScore } from './files';
import { C } from './theme';

export interface PaletteItem {
  id: string;
  label: string;
  detail?: string;
  run: () => void;
}

interface Props {
  placeholder: string;
  prefix?: string;
  items: PaletteItem[];
  onClose: () => void;
}

const MAX_RESULTS = 12;

export function Palette({ placeholder, prefix = '', items, onClose }: Props) {
  const [query, setQuery] = useState(prefix);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    input.current?.focus();
  }, []);

  const needle = query.startsWith('>') ? query.slice(1).trim() : query.trim();
  const shown = useMemo(() => {
    if (!needle) return items.slice(0, MAX_RESULTS);
    return items
      .map((item) => ({ item, score: fuzzyScore(needle, item.label) }))
      .filter((r) => r.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map((r) => r.item);
  }, [items, needle]);

  const choose = (item: PaletteItem | undefined): void => {
    if (!item) return;
    onClose();
    item.run();
  };

  const onKeyDown = (e: KeyboardEvent): void => {
    e.stopPropagation();
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, shown.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') choose(shown[active]);
  };

  return (
    <div className="absolute inset-x-0 top-0 z-30 flex justify-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()} style={{ height: '100%' }}>
      <div
        role="dialog"
        aria-label={placeholder}
        className="mt-1 h-fit w-[min(560px,92%)] overflow-hidden rounded-md text-[13px]"
        style={{ background: C.quickInput, border: `1px solid ${C.border}`, boxShadow: '0 0 8px rgba(0,0,0,0.6)', color: C.editorFg }}
        onKeyDown={onKeyDown}
      >
        <div className="p-1.5">
          <input
            ref={input}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            placeholder={placeholder}
            aria-label={placeholder}
            role="combobox"
            aria-expanded="true"
            aria-controls="vsc-palette-list"
            aria-activedescendant={shown[active] ? `vsc-opt-${shown[active].id}` : undefined}
            spellCheck={false}
            className="w-full rounded-sm px-2 py-1 outline-none"
            style={{ background: C.editor, border: `1px solid ${C.accent}`, color: C.editorFg }}
          />
        </div>
        <ul id="vsc-palette-list" role="listbox" aria-label="Results" className="m-0 max-h-[300px] list-none overflow-auto p-0 pb-1">
          {shown.length === 0 && <li className="px-3 py-1.5" style={{ color: C.muted }}>No matching results</li>}
          {shown.map((item, i) => (
            <li
              key={item.id}
              id={`vsc-opt-${item.id}`}
              role="option"
              aria-selected={i === active}
              onMouseMove={() => setActive(i)}
              onClick={() => choose(item)}
              className="flex cursor-pointer items-baseline gap-2 px-3 py-[3px]"
              style={{ background: i === active ? C.listActive : undefined, color: i === active ? '#fff' : undefined }}
            >
              <span className="truncate">{item.label}</span>
              {item.detail && <span className="truncate text-[12px]" style={{ color: C.muted }}>{item.detail}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
