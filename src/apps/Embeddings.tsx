import { useEffect, useState } from 'react';
import { launchApp, openApp } from '../desktop/store';

interface ChunkPoint {
  id: string;
  title: string;
  type: string;
  url: string;
  x: number;
  y: number;
}

type Load = { state: 'loading' } | { state: 'ready'; points: ChunkPoint[]; model: string } | { state: 'missing' };

const COLORS: Record<string, string> = { profile: '#4b6ea6', project: '#c8704a', experience: '#3d9a78', skills: '#8a6fb5', 'open-source': '#b59b3d', readme: '#6b8f9c' };
const PAD = 28;
const W = 700;
const H = 460;

export default function EmbeddingsApp() {
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [hover, setHover] = useState<ChunkPoint | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/rag/index.json', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('missing'))))
      .then((data: { model: string; chunks: { id: string; title: string; source_type: string; source_url: string; pca: [number, number] }[] }) =>
        setLoad({
          state: 'ready',
          model: data.model,
          points: data.chunks.map((c) => ({ id: c.id, title: c.title, type: c.source_type, url: c.source_url, x: c.pca[0], y: c.pca[1] })),
        }),
      )
      .catch((error: unknown) => {
        if ((error as Error).name !== 'AbortError') setLoad({ state: 'missing' });
      });
    return () => controller.abort();
  }, []);

  if (load.state === 'loading') return <p className="p-6 text-[13px]" style={{ color: 'var(--muted)' }}>Loading embeddings…</p>;
  if (load.state === 'missing') return <p className="p-6 text-[13px]" style={{ color: 'var(--muted)' }}>The index has not been built yet. Run <code>npm run ingest</code>.</p>;

  const xs = load.points.map((p) => p.x);
  const ys = load.points.map((p) => p.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const sx = (v: number): number => PAD + ((v - minX) / (maxX - minX || 1)) * (W - PAD * 2);
  const sy = (v: number): number => H - PAD - ((v - minY) / (maxY - minY || 1)) * (H - PAD * 2);
  const types = Array.from(new Set(load.points.map((p) => p.type)));

  return (
    <div className="p-4">
      <p className="m-0 mb-2 text-[13px]" style={{ color: 'var(--muted)' }}>
        Every chunk of this portfolio&rsquo;s knowledge base, embedded with <code>{load.model}</code> (384-d, runs locally) and projected to 2D with PCA. Nearby points mean similar content. This is what the assistant searches.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="2D projection of portfolio knowledge-base embeddings" className="w-full rounded-lg" style={{ border: '1px solid var(--hairline)', background: 'var(--surface-2)' }}>
        {load.points.map((p) => (
          <circle
            key={p.id}
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={hover?.id === p.id ? 8 : 5}
            fill={COLORS[p.type] ?? '#888'}
            fillOpacity={0.85}
            stroke="var(--surface)"
            tabIndex={0}
            role="link"
            aria-label={p.title}
            onMouseEnter={() => setHover(p)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(p)}
            onBlur={() => setHover(null)}
            onClick={() => (p.url.startsWith('/') ? openApp('projects') : window.open(p.url, '_blank', 'noopener,noreferrer'))}
            style={{ cursor: 'pointer', transition: 'r 140ms' }}
          />
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px]">
        {types.map((type) => (
          <span key={type} className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full" style={{ background: COLORS[type] ?? '#888' }} />{type}</span>
        ))}
        <span className="ml-auto" role="status" aria-live="polite">{hover ? hover.title : `${load.points.length} chunks`}</span>
      </div>
      <button type="button" onClick={() => launchApp('assistant')} className="mt-3 rounded-lg px-3 py-1 text-[13px]" style={{ border: '1px solid var(--hairline)' }}>Ask the assistant something</button>
    </div>
  );
}
