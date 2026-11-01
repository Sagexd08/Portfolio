import { useState } from 'react';

// Colours follow community YouTube Music themes; exact values are UNVERIFIED against the live site.
export const C = { bg: '#030303', surface: '#121212', surface2: '#212121', text: '#FFFFFF', sub: '#AAAAAA', red: '#FF0000', line: 'rgba(255,255,255,0.1)' } as const;

export const thumbUrl = (id: string): string => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export function gradient(id: string): string {
  const hue = [...id].reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) % 360, 7);
  return `linear-gradient(145deg, hsl(${hue} 70% 50%), hsl(${(hue + 50) % 360} 65% 28%))`;
}

export function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Square cover: real YouTube thumbnail (cropped from 4:3) over a gradient fallback. `size` omitted = fill width. */
export function Art({ id, label, size, radius = 4 }: { id: string; label: string; size?: number; radius?: number }) {
  const [failed, setFailed] = useState(false);
  const box = size ? { width: size, height: size } : { width: '100%', aspectRatio: '1 / 1' };
  return (
    <span aria-hidden="true" className="relative flex flex-none items-center justify-center overflow-hidden font-semibold text-white" style={{ ...box, borderRadius: radius, background: gradient(id), fontSize: (size ?? 120) / 2.6 }}>
      {label[0]?.toUpperCase()}
      {!failed && <img src={thumbUrl(id)} alt="" loading="lazy" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full object-cover" />}
    </span>
  );
}

export function Icon({ size = 22, children }: { size?: number; children: React.ReactNode }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{children}</svg>;
}

export const P = {
  play: <path d="M8 5.5v13l11-6.5z" />,
  pause: <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />,
  prev: <path d="M6 5h2v14H6zM20 5v14L9 12z" />,
  next: <path d="M16 5h2v14h-2zM4 5l11 7-11 7z" />,
  shuffle: <path d="M17 3l4 4-4 4V8h-2.6l-3.1 4.1L8.6 8.6A2 2 0 0 0 7 8H3V6h4a4 4 0 0 1 3.2 1.6l.8 1 2-2.6A3 3 0 0 1 15.4 6H17zM3 16h4a2 2 0 0 0 1.6-.8L10 13.3l1.6 2.1-.8 1A4 4 0 0 1 7 18H3zm14-1h-1.6c-.9 0-1.8-.4-2.4-1.2l-.1-.1 1.2-1.6.1.1c.2.3.6.5 1.2.5H17v-3l4 4-4 4z" />,
  repeat: <path d="M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2z" />,
  vol: <path d="M3 9v6h4l5 5V4L7 9zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4z" />,
  queue: <path d="M3 6h12v2H3zm0 5h12v2H3zm0 5h8v2H3zm13-1v6l5-3z" />,
  home: <path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z" />,
  explore: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm3.5 6.5l-2 5-5 2 2-5z" />,
  library: <path d="M4 5h2v14H4zm4 0h2v14H8zm4.5.5l1.9-.5 4.1 13.5-1.9.5z" />,
  search: <path d="M15.5 14h-.8l-.3-.3A6.5 6.5 0 1 0 14 15.5l.3.3v.8l5 5 1.5-1.5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />,
};
