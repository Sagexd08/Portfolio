import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { HOME_ID, PLACES, distanceKm, type Place, type PlaceKind, type PlaceVideo } from '../content/places';
import type { AppProps } from '../desktop/types';

const KIND_COLOR: Record<PlaceKind, string> = { home: '#4b6ea6', favorite: '#e5383b', google: '#34a853' };
const KIND_LABEL: Record<PlaceKind, string> = { home: 'Home', favorite: 'Favorite', google: 'Google' };
const HOME = PLACES.find((p) => p.id === HOME_ID) ?? PLACES[0];
const muted = { color: 'var(--muted)' } as const;

function Details({ place, playing, onPlay }: { place: Place; playing: PlaceVideo | null; onPlay: (v: PlaceVideo) => void }) {
  const km = Math.round(distanceKm(HOME.lat, HOME.lng, place.lat, place.lng));
  return (
    <section aria-label={`${place.name} details`} className="flex min-h-0 flex-none gap-3 overflow-y-auto p-3" style={{ borderTop: '1px solid var(--hairline)', background: 'var(--surface-2)', maxHeight: '45%' }}>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[14px] font-semibold">{place.name}</p>
        <p className="m-0 text-[12px]" style={muted}>{KIND_LABEL[place.kind]}{place.id === HOME_ID ? '' : ` · ${km.toLocaleString()} km from Kolkata`}</p>
        <p className="m-0 mt-1 text-[12.5px]">{place.blurb}</p>
        <a href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=12/${place.lat}/${place.lng}`} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[12px] underline">Open in OpenStreetMap</a>
        <ul className="m-0 mt-2 flex list-none gap-2 overflow-x-auto p-0" hidden={place.videos.length === 0}>
          {place.videos.map((v) => (
            <li key={v.id} className="w-[120px] flex-none">
              <button type="button" onClick={() => onPlay(v)} aria-label={`Play ${v.title}`} aria-current={playing?.id === v.id} className="row-hover block w-full rounded-lg p-0.5 text-left">
                <img src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" loading="lazy" className="aspect-video w-full rounded-md object-cover" />
                <span className="line-clamp-2 mt-1 block text-[11px] leading-snug">{v.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {playing ? (
        <div className="w-[260px] flex-none">
          <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
            <iframe key={playing.id} title={playing.title} src={`https://www.youtube-nocookie.com/embed/${playing.id}?autoplay=1&rel=0&playsinline=1`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="h-full w-full border-0" />
          </div>
          <p className="m-0 mt-1 truncate text-[11px]" style={muted}>{playing.channel}</p>
        </div>
      ) : null}
    </section>
  );
}

export default function Maps({ params }: AppProps) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef(new Map<string, L.CircleMarker>());
  const initial = PLACES.some((p) => p.id === params.place) ? String(params.place) : HOME_ID;
  const [selected, setSelected] = useState(initial);
  const [playing, setPlaying] = useState<PlaceVideo | null>(null);
  const place = PLACES.find((p) => p.id === selected) ?? HOME;

  useEffect(() => {
    if (!host.current) return undefined;
    const m = L.map(host.current, { center: [HOME.lat, HOME.lng], zoom: 3, zoomControl: true, worldCopyJump: true });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(m);
    for (const p of PLACES) {
      const marker = L.circleMarker([p.lat, p.lng], { radius: 8, color: '#fff', weight: 2, fillColor: KIND_COLOR[p.kind], fillOpacity: 1 }).addTo(m);
      marker.bindTooltip(p.name);
      marker.on('click', () => {
        setSelected(p.id);
        setPlaying(null);
      });
      markers.current.set(p.id, marker);
    }
    map.current = m;
    const resize = new ResizeObserver(() => m.invalidateSize());
    resize.observe(host.current);
    return () => {
      resize.disconnect();
      markers.current.clear();
      m.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    map.current?.flyTo([place.lat, place.lng], place.kind === 'google' ? 13 : 10, { duration: 0.9 });
    markers.current.forEach((marker, id) => marker.setStyle({ radius: id === selected ? 11 : 8, weight: id === selected ? 3 : 2 }));
  }, [place, selected]);

  const choose = (id: string): void => {
    setSelected(id);
    setPlaying(null);
  };

  return (
    <div className="flex h-full" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>
      <aside aria-label="Places" className="hidden w-[200px] flex-none overflow-y-auto p-2 text-[13px] sm:block" style={{ background: 'var(--surface-2)', borderRight: '1px solid var(--hairline)' }}>
        <p className="m-0 mb-1 px-2 text-[11px] font-semibold uppercase" style={muted}>Places</p>
        <ul className="m-0 list-none space-y-0.5 p-0">
          {PLACES.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => choose(p.id)} aria-current={p.id === selected} className="row-hover flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left" style={{ background: p.id === selected ? 'color-mix(in srgb, var(--accent) 22%, transparent)' : undefined }}>
                <span aria-hidden="true" className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: KIND_COLOR[p.kind] }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{p.name}</span>
                  <span className="block text-[11px]" style={muted}>{KIND_LABEL[p.kind]}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <label className="flex-none p-2 sm:hidden">
          <span className="sr-only">Choose a place</span>
          <select value={selected} onChange={(e) => choose(e.target.value)} className="w-full rounded-md bg-transparent p-1.5 text-[13px]" style={{ border: '1px solid var(--hairline)' }}>
            {PLACES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <div ref={host} className="maps-tiles min-h-[160px] min-w-0 flex-1" role="application" aria-label={`Map showing ${place.name}`} />
        <Details place={place} playing={playing} onPlay={setPlaying} />
      </div>
    </div>
  );
}
