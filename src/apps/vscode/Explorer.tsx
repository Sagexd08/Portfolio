import { useState } from 'react';
import { buildTree, type TreeNode } from './files';
import { C } from './theme';

const TREE = buildTree();
const FILE_COLOR: Record<string, string> = { md: '#519aba', json: '#cbcb41', ts: '#3178c6' };

function Row({ node, depth, active, onOpen }: { node: TreeNode; depth: number; active: string; onOpen: (path: string) => void }) {
  const [open, setOpen] = useState(true);
  const isDir = Boolean(node.children);
  const selected = !isDir && node.path === active;
  const ext = node.name.split('.').pop() ?? '';
  return (
    <>
      <button
        type="button"
        role="treeitem"
        aria-level={depth + 1}
        aria-expanded={isDir ? open : undefined}
        aria-selected={selected}
        onClick={() => (isDir ? setOpen(!open) : onOpen(node.path))}
        className="vsc-row flex h-[22px] w-full items-center gap-1.5 text-left text-[13px]"
        style={{ paddingLeft: 8 + depth * 12, background: selected ? C.listActive : undefined, color: selected ? '#fff' : C.editorFg }}
      >
        <span aria-hidden="true" className="w-3 flex-none text-center text-[10px]" style={{ color: C.muted }}>{isDir ? (open ? '▾' : '▸') : ''}</span>
        <span aria-hidden="true" className="mono flex-none text-[9px] font-bold" style={{ color: isDir ? C.muted : FILE_COLOR[ext] ?? C.muted }}>{isDir ? '■' : ext === 'md' ? 'M↓' : ext === 'json' ? '{}' : 'TS'}</span>
        <span className="truncate">{node.name}</span>
      </button>
      {isDir && open && node.children?.map((child) => <Row key={child.path} node={child} depth={depth + 1} active={active} onOpen={onOpen} />)}
    </>
  );
}

export function Explorer({ active, onOpen }: { active: string; onOpen: (path: string) => void }) {
  return (
    <nav aria-label="Explorer" className="flex h-full min-h-0 flex-col" style={{ background: C.sidebar }}>
      <h3 className="m-0 flex-none px-5 py-[9px] text-[11px] font-normal uppercase tracking-wide" style={{ color: C.editorFg }}>Explorer</h3>
      <div className="flex-none px-2 py-[3px] text-[11px] font-bold uppercase" style={{ color: C.editorFg }}>Portfolio</div>
      <div role="tree" aria-label="Portfolio files" className="min-h-0 flex-1 overflow-auto">
        {TREE.map((node) => <Row key={node.path} node={node} depth={0} active={active} onOpen={onOpen} />)}
      </div>
    </nav>
  );
}
