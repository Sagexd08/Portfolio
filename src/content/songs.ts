// Edit this list to change the Music app playlist. `youtubeId` is the id after `v=` in a YouTube URL.
// Placeholders below are public lofi/ambient streams; replace with your favourites.
export interface Song {
  title: string;
  artist: string;
  youtubeId: string;
}

export const songs: Song[] = [
  { title: 'lofi hip hop radio: beats to relax/study to', artist: 'Lofi Girl', youtubeId: 'jfKfPfyJRdk' },
  { title: 'lofi hip hop radio: beats to sleep/chill to', artist: 'Lofi Girl', youtubeId: '28KRPhVzCus' },
  { title: 'synthwave radio: beats to chill/game to', artist: 'Lofi Girl', youtubeId: '4xDzrJKXOOY' },
];
