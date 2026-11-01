import { songs, type Song } from '../../content/songs';
import type { MusicPlayer } from './useMusicPlayer';
import type { View } from './Chrome';
import { Art, C, thumbUrl, gradient } from './ui';

const ytmUrl = (id: string): string => `https://music.youtube.com/watch?v=${id}`;

function Card({ song, onPlay }: { song: Song; onPlay: () => void }) {
  return (
    <button type="button" onClick={onPlay} aria-label={`Play ${song.title} by ${song.artist}`} className="flex w-[160px] flex-none flex-col gap-2 text-left" style={{ color: C.text }}>
      <Art id={song.youtubeId} label={song.title} radius={6} />
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-medium">{song.title}</span>
        <span className="block truncate text-[12px]" style={{ color: C.sub }}>{song.artist}</span>
      </span>
    </button>
  );
}

function Row({ song, n, current, playing, onPlay }: { song: Song; n: number; current: boolean; playing: boolean; onPlay: () => void }) {
  return (
    <li>
      <button type="button" aria-current={current} onClick={onPlay} className="flex w-full items-center gap-4 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5 motion-reduce:transition-none" style={{ background: current ? C.surface2 : undefined, color: C.text }}>
        <span className="w-5 text-right text-[13px] tabular-nums" style={{ color: current ? C.red : C.sub }}>{current && playing ? '>' : n}</span>
        <Art id={song.youtubeId} label={song.title} size={44} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-medium">{song.title}</span>
          <span className="block truncate text-[12px]" style={{ color: C.sub }}>{song.artist}</span>
        </span>
      </button>
    </li>
  );
}

function NowPlaying({ player: p }: { player: MusicPlayer }) {
  const { song } = p;
  if (!song) return null;
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center gap-4 overflow-hidden p-8 text-center">
      <div aria-hidden="true" className="absolute inset-0" style={{ background: gradient(song.youtubeId), opacity: 0.5 }} />
      <img aria-hidden="true" alt="" src={thumbUrl(song.youtubeId)} onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 h-full w-full scale-125 object-cover opacity-50" style={{ filter: 'blur(48px)' }} />
      <div className="relative w-full max-w-[360px]" style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
        <Art id={song.youtubeId} label={song.title} radius={8} />
      </div>
      <div className="relative">
        <h2 className="m-0 text-[22px] font-semibold">{song.title}</h2>
        <p className="m-0 text-[14px]" style={{ color: C.sub }}>{song.artist}</p>
      </div>
      <a href={ytmUrl(song.youtubeId)} target="_blank" rel="noopener noreferrer" className="relative rounded-full px-4 py-1.5 text-[13px] font-medium" style={{ background: C.text, color: C.bg }}>Open in YouTube Music</a>
    </div>
  );
}

interface Props { player: MusicPlayer; view: View; query: string }

export function MainView({ player: p, view, query }: Props) {
  if (view === 'now') return <NowPlaying player={p} />;
  const q = query.trim().toLowerCase();
  const list = songs.map((s, i) => ({ s, i })).filter(({ s }) => !q || `${s.title} ${s.artist}`.toLowerCase().includes(q));
  const curId = p.song?.youtubeId;
  const rows = (
    <ul className="m-0 list-none p-0">
      {list.map(({ s, i }, n) => <Row key={s.youtubeId} song={s} n={n + 1} current={s.youtubeId === curId && p.started} playing={p.playing} onPlay={() => p.playSong(i)} />)}
    </ul>
  );
  const empty = <p className="text-[14px]" style={{ color: C.sub }}>No songs match "{query}".</p>;
  const head = (t: string) => <h2 className="m-0 mb-3 text-[22px] font-bold">{t}</h2>;

  if (q) return <div className="p-6">{head('Search results')}{list.length ? rows : empty}</div>;
  if (view === 'explore') {
    return (
      <div className="p-6">
        {head('Explore')}
        <div className="flex flex-wrap gap-4">{list.map(({ s, i }) => <Card key={s.youtubeId} song={s} onPlay={() => p.playSong(i)} />)}</div>
      </div>
    );
  }
  if (view === 'library') return <div className="p-6">{head('Your favourites')}{rows}</div>;
  return (
    <div className="flex flex-col gap-8 p-6">
      <section aria-label="Listen again">
        {head('Listen again')}
        <div className="flex gap-4 overflow-x-auto pb-2">{list.map(({ s, i }) => <Card key={s.youtubeId} song={s} onPlay={() => p.playSong(i)} />)}</div>
      </section>
      <section aria-label="Top tracks">
        {head("Sohom's top tracks")}
        {rows}
      </section>
    </div>
  );
}
