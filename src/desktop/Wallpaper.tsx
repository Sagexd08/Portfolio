import { useEffect, useState } from 'react';
import { isPhoto, PHOTOS } from './wallpapers';
import { usePrefs } from './prefs';

/** Photo layers mount on first selection only (lazy) and crossfade via opacity. */
export function Wallpaper() {
  const { wallpaper } = usePrefs();
  const [visited, setVisited] = useState<string[]>(() => (isPhoto(wallpaper) ? [wallpaper] : []));

  useEffect(() => {
    if (isPhoto(wallpaper)) setVisited((v) => (v.includes(wallpaper) ? v : [...v, wallpaper]));
  }, [wallpaper]);

  return (
    <div className="wallpaper" aria-hidden="true">
      {PHOTOS.filter((p) => visited.includes(p.key)).map((p) => (
        <div key={p.key} className="wp-layer" style={{ opacity: p.key === wallpaper ? 1 : 0, backgroundImage: `url(${p.tiny})` }}>
          <img src={p.src} alt="" decoding="async" fetchPriority={p.key === wallpaper ? 'high' : 'low'} onLoad={(e) => e.currentTarget.classList.add('wp-loaded')} />
        </div>
      ))}
      <div className="wp-dim" />
    </div>
  );
}
