import { searchPlaylists } from './spotifyApi';
import { playlistTracksWithin } from './spotifyEmbed';
import { tr } from './i18n';

// The songs of *your* years (Marco, 2026-10-14: "es sollte automatisch eine
// passende Playlist für das Jahr ausgewählt werden oder für die Dekade").
// Signed in with Spotify, the background music no longer draws only from
// the decade's one big playlist: for the years of the decade in which the
// visitor was between 6 and 19, it looks up a "hits of <year>" playlist
// each and mixes their songs. Without a login (no search possible) or when
// too little comes back, the decade's playlist stays as before.

const MIN_TRACKS = 15;
const MAX_YEARS = 6;

/** The years of `decade` the person lived through aged 6 to 19, or the whole decade. */
export function youthYears(decade: string, birthYear: number | null): number[] {
  const start = Number(decade);
  if (!Number.isFinite(start)) return [];
  const all = Array.from({ length: 10 }, (_, i) => start + i).filter((y) => y <= new Date().getFullYear());
  const mine = birthYear ? all.filter((y) => y - birthYear >= 6 && y - birthYear <= 19) : [];
  const years = mine.length ? mine : all;
  if (years.length <= MAX_YEARS) return years;
  // Spread evenly over the span.
  return Array.from({ length: MAX_YEARS }, (_, i) => years[Math.round((i * (years.length - 1)) / (MAX_YEARS - 1))]);
}

export interface YouthPool {
  tracks: string[];
  /** "Hits 1983–1989" for the player. */
  label: string;
}

const pools = new Map<string, Promise<YouthPool | null>>();

/** Songs from year playlists for the person's years in `decade`, or null. Never rejects. */
export function youthPool(decade: string, birthYear: number | null): Promise<YouthPool | null> {
  const key = `${decade}:${birthYear ?? ''}`;
  let pool = pools.get(key);
  if (!pool) {
    pool = build(decade, birthYear).catch(() => null);
    pools.set(key, pool);
    pool.then((p) => {
      if (!p) pools.delete(key);
    });
  }
  return pool;
}

async function build(decade: string, birthYear: number | null): Promise<YouthPool | null> {
  const years = youthYears(decade, birthYear);
  if (!years.length) return null;
  const lists = await Promise.all(
    years.map(async (year) => {
      const found = await searchPlaylists(`hits ${year}`);
      // A playlist that really is about that year (its name carries it).
      const hit = found.find((p) => p.name.includes(String(year)));
      return hit ? playlistTracksWithin(hit.id, 5000) : [];
    })
  );
  const tracks = [...new Set(lists.flat())];
  if (tracks.length < MIN_TRACKS) return null;
  const first = years[0];
  const last = years[years.length - 1];
  return {
    tracks,
    label: first === last ? tr(`Hits of ${first}`, `Hits von ${first}`) : tr(`Hits of ${first}–${last}`, `Hits von ${first}–${last}`),
  };
}
