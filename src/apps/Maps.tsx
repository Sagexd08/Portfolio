import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import type { AppProps } from '../desktop/types';

// City-level only: the pin marks Kolkata, never a street address.
const KOLKATA: L.LatLngExpression = [22.5726, 88.3639];

export default function Maps(_props: AppProps) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!host.current) return;
    const map = L.map(host.current, { center: KOLKATA, zoom: 10, zoomControl: true });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    L.circleMarker(KOLKATA, { radius: 9, color: '#fff', weight: 3, fillColor: '#4b6ea6', fillOpacity: 1 })
      .addTo(map)
      .bindPopup('<strong>Sohom Chatterjee</strong><br/>Based in Kolkata, India')
      .openPopup();
    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="flex h-full" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>
      <aside aria-label="Places" className="hidden w-[190px] flex-none p-3 text-[13px] sm:block" style={{ background: 'var(--surface-2)', borderRight: '1px solid var(--hairline)' }}>
        <p className="m-0 mb-2 text-[11px] font-semibold uppercase" style={{ color: 'var(--muted)' }}>Places</p>
        <p className="m-0 font-medium">Kolkata, India</p>
        <p className="m-0 mt-1 text-[12px]" style={{ color: 'var(--muted)' }}>Home base. Open to remote and on-site forward-deployed or ML engineering roles, anywhere.</p>
      </aside>
      <div ref={host} className="maps-tiles min-w-0 flex-1" role="application" aria-label="Map centered on Kolkata, India" />
    </div>
  );
}
