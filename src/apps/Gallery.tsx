import { useEffect, useRef, useState } from 'react';

interface Photo {
  src: string;
  alt: string;
  caption?: string;
  date?: string;
}

type Load = { state: 'loading' } | { state: 'ready'; photos: Photo[] } | { state: 'error' };

function isPhoto(value: unknown): value is Photo {
  const item = value as Photo;
  return typeof item?.src === 'string' && typeof item?.alt === 'string';
}

export default function GalleryApp() {
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/gallery/manifest.json', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { photos?: unknown[] }) => setLoad({ state: 'ready', photos: (data.photos ?? []).filter(isPhoto) }))
      .catch((error: unknown) => {
        if ((error as Error).name !== 'AbortError') setLoad({ state: 'error' });
      });
    return () => controller.abort();
  }, []);

  const photos = load.state === 'ready' ? load.photos : [];

  useEffect(() => {
    if (open === null) return;
    dialog.current?.focus();
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(null);
      if (event.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % photos.length));
      if (event.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, photos.length]);

  if (load.state === 'loading') return <p className="p-6 text-[13px]" style={{ color: 'var(--muted)' }}>Loading photos…</p>;
  if (load.state === 'error' || photos.length === 0) {
    return (
      <div className="p-8 text-center text-[14px]" style={{ color: 'var(--muted)' }}>
        <p className="m-0 mb-1 text-[16px]" style={{ color: 'var(--ink)' }}>No photos yet</p>
        <p className="m-0">Photos will appear here once they are added to the gallery.</p>
      </div>
    );
  }

  const current = open === null ? null : photos[open];
  return (
    <div className="p-4">
      <ul className="m-0 grid list-none gap-3 p-0" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}>
        {photos.map((photo, index) => (
          <li key={photo.src}>
            <button type="button" onClick={() => setOpen(index)} aria-label={`Open photo: ${photo.alt}`} className="block w-full overflow-hidden rounded-lg" style={{ border: '1px solid var(--hairline)' }}>
              <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" className="block aspect-[4/3] w-full object-cover" />
            </button>
          </li>
        ))}
      </ul>
      {current && (
        <div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          tabIndex={-1}
          className="fixed inset-0 z-[15000] flex flex-col items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.88)' }}
          onClick={() => setOpen(null)}
        >
          <img src={current.src} alt={current.alt} className="max-h-[78vh] max-w-full rounded-lg object-contain" onClick={(event) => event.stopPropagation()} />
          <p className="mt-3 text-[13px] text-white">{current.caption ?? current.alt}{current.date ? ` · ${current.date}` : ''}</p>
          <div className="mt-3 flex gap-2" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setOpen((open! - 1 + photos.length) % photos.length)} className="rounded-full px-3 py-1 text-[13px] text-white" style={{ border: '1px solid rgba(255,255,255,0.4)' }}>Previous</button>
            <button type="button" onClick={() => setOpen((open! + 1) % photos.length)} className="rounded-full px-3 py-1 text-[13px] text-white" style={{ border: '1px solid rgba(255,255,255,0.4)' }}>Next</button>
            <button type="button" onClick={() => setOpen(null)} className="rounded-full px-3 py-1 text-[13px] text-white" style={{ border: '1px solid rgba(255,255,255,0.4)' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
