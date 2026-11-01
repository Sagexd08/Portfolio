// Places shown in the Maps app. City- and landmark-level only; the home pin is the city, never an address.
// Every video id was checked against YouTube's oEmbed endpoint (embeddable).

export type PlaceKind = 'home' | 'favorite' | 'google';

export interface PlaceVideo {
  id: string;
  title: string;
  channel: string;
}

export interface Place {
  id: string;
  name: string;
  kind: PlaceKind;
  city: string;
  lat: number;
  lng: number;
  blurb: string;
  videos: readonly PlaceVideo[];
}

export const HOME_ID = 'kolkata';

export const PLACES: readonly Place[] = [
  {
    id: 'kolkata',
    name: 'Kolkata, India',
    kind: 'home',
    city: 'Kolkata',
    lat: 22.5726,
    lng: 88.3639,
    blurb: 'Home base. Open to remote and on-site forward-deployed or ML engineering roles, anywhere.',
    videos: [],
  },
  {
    id: 'san-francisco',
    name: 'San Francisco, CA',
    kind: 'favorite',
    city: 'San Francisco',
    lat: 37.7749,
    lng: -122.4194,
    blurb: 'One of my two favorite places in the world.',
    videos: [
      { id: 'kQy6UV5IflY', title: 'San Francisco 4K walking tour', channel: 'Walking OZ' },
      { id: 'UkCqCUFd1Kc', title: 'San Francisco Embarcadero walking tour 4K', channel: 'Walk The Globe 8K' },
    ],
  },
  {
    id: 'new-york',
    name: 'New York, NY',
    kind: 'favorite',
    city: 'New York',
    lat: 40.7128,
    lng: -74.006,
    blurb: 'The other favorite place.',
    videos: [
      { id: 'dJm43N7E_pA', title: 'New York: walking through Manhattan, 4K', channel: 'Walking OZ' },
      { id: '1fH8WXPcltQ', title: 'New York City walking tour, 6th Avenue sunset', channel: 'Julien In NYC' },
    ],
  },
  {
    id: 'googleplex',
    name: 'Googleplex, Mountain View',
    kind: 'google',
    city: 'Mountain View',
    lat: 37.422,
    lng: -122.0841,
    blurb: "Google's headquarters in Mountain View, California.",
    videos: [
      { id: 'TyuXOgC7vO0', title: 'I went to the Google headquarters', channel: 'pierson' },
      { id: 'eeWAsYRyEVk', title: 'Working from the Google headquarters in Mountain View', channel: 'LSH' },
    ],
  },
  {
    id: 'google-nyc',
    name: 'Google New York (Chelsea)',
    kind: 'google',
    city: 'New York',
    lat: 40.7416,
    lng: -74.0048,
    blurb: "Google's large New York campus in Chelsea.",
    videos: [
      { id: 'v2ozwGAfLAU', title: 'Inside Google NYC office', channel: 'Vishakha Sadhwani' },
      { id: '493ZLwZw_pY', title: 'Google office at New York, Little Island and Pier 57', channel: 'Nomadic Scholars' },
    ],
  },
  {
    id: 'google-sf',
    name: 'Google San Francisco',
    kind: 'google',
    city: 'San Francisco',
    lat: 37.7905,
    lng: -122.3908,
    blurb: "Google's San Francisco office near the waterfront.",
    videos: [
      { id: 'bYKJNJVibwo', title: "Inside Google's San Francisco office", channel: 'Jugal Bhatt' },
      { id: '--mAmtLuxkw', title: 'Google San Francisco office', channel: 'LSH' },
    ],
  },
];

/** Great-circle distance in kilometres. */
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const rad = (d: number): number => (d * Math.PI) / 180;
  const h = Math.sin(rad(bLat - aLat) / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(rad(bLng - aLng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
