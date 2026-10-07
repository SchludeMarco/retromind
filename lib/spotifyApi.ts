import { useSyncExternalStore } from 'react';

// Spotify Web API for signed-in visitors (Marco, 2026-10-07: with a Spotify
// login the player should do much more, play music matching the topic on
// its own and search for tracks, albums and artists). The login
// (hooks/useSpotifyAuth) registers its token source here; without a login
// none of this shows up and the music runs as before.

const API = 'https://api.spotify.com/v1';

type TokenSource = () => Promise<string | null>;
let tokenSource: TokenSource | null = null;
const listeners = new Set<() => void>();

export function setSpotifyApiToken(source: TokenSource | null) {
  if (source === tokenSource) return;
  tokenSource = source;
  listeners.forEach((l) => l());
}

/** true while someone is signed in with Spotify. */
export function useSpotifyApi(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => !!tokenSource
  );
}

async function get(path: string): Promise<any | null> {
  const token = await tokenSource?.();
  if (!token) return null;
  try {
    const res = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export interface SpotifyHit {
  uri: string;
  /** What to show: song, album or artist name. */
  name: string;
  /** Second line: artists, or "Album · Artist", or "Künstler:in". */
  sub: string;
  image: string | null;
  kind: 'track' | 'album' | 'artist' | 'playlist';
}

const smallestImage = (images: any[] | undefined): string | null => {
  if (!Array.isArray(images) || !images.length) return null;
  const sorted = [...images].sort((a, b) => (a.width || 0) - (b.width || 0));
  return (sorted.find((i) => (i.width || 0) >= 64) || sorted[sorted.length - 1])?.url ?? null;
};
const artistNames = (artists: any[] | undefined) => (artists ?? []).map((a) => a?.name).filter(Boolean).join(', ');

/** Tracks, albums and artists for the search box in the player. */
export async function searchSpotify(query: string): Promise<SpotifyHit[]> {
  const q = query.trim();
  if (!q) return [];
  const data = await get(`/search?type=track,album,artist&limit=6&q=${encodeURIComponent(q)}`);
  if (!data) return [];
  const tracks: SpotifyHit[] = (data.tracks?.items ?? []).filter(Boolean).map((t: any) => ({
    uri: t.uri,
    name: t.name,
    sub: artistNames(t.artists),
    image: smallestImage(t.album?.images),
    kind: 'track',
  }));
  const artists: SpotifyHit[] = (data.artists?.items ?? []).filter(Boolean).slice(0, 3).map((a: any) => ({
    uri: a.uri,
    name: a.name,
    sub: 'Künstler:in',
    image: smallestImage(a.images),
    kind: 'artist',
  }));
  const albums: SpotifyHit[] = (data.albums?.items ?? []).filter(Boolean).slice(0, 4).map((a: any) => ({
    uri: a.uri,
    name: a.name,
    sub: `Album · ${artistNames(a.artists)}`,
    image: smallestImage(a.images),
    kind: 'album',
  }));
  return [...tracks, ...artists, ...albums];
}

const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

/**
 * The soundtrack of a video game: an album (or playlist) whose name
 * contains the game's title, preferring "soundtrack"/"OST" in the name.
 */
export async function findSoundtrack(title: string): Promise<SpotifyHit | null> {
  const need = words(title);
  if (!need.length) return null;
  const data = await get(`/search?type=album,playlist&limit=10&q=${encodeURIComponent(`${title} soundtrack`)}`);
  if (!data) return null;
  const candidates: SpotifyHit[] = [
    ...(data.albums?.items ?? []).filter(Boolean).map((a: any) => ({
      uri: a.uri,
      name: a.name,
      sub: `Soundtrack · ${artistNames(a.artists)}`,
      image: smallestImage(a.images),
      kind: 'album' as const,
    })),
    ...(data.playlists?.items ?? []).filter(Boolean).map((p: any) => ({
      uri: p.uri,
      name: p.name,
      sub: 'Soundtrack-Playlist',
      image: smallestImage(p.images),
      kind: 'playlist' as const,
    })),
  ];
  const matches = candidates.filter((c) => {
    const have = words(c.name);
    return need.every((w) => have.includes(w));
  });
  const ost = (c: SpotifyHit) => /soundtrack|\bost\b|music from|original/i.test(c.name);
  return matches.find(ost) ?? matches[0] ?? null;
}

/** The best matching song for a word like an artist or a hit of the time. */
export async function findTrack(query: string, decade?: string): Promise<SpotifyHit | null> {
  const year = decade && /^\d{4}$/.test(decade) ? ` year:${decade}-${Number(decade) + 9}` : '';
  const pick = async (q: string) => {
    const data = await get(`/search?type=track&limit=5&q=${encodeURIComponent(q)}`);
    const t = (data?.tracks?.items ?? []).filter(Boolean)[0];
    return t
      ? ({ uri: t.uri, name: t.name, sub: artistNames(t.artists), image: smallestImage(t.album?.images), kind: 'track' } as SpotifyHit)
      : null;
  };
  return (year && (await pick(query + year))) || pick(query);
}

// --- "Musik zum Thema" switch ---------------------------------------------
// On by default: a music word in the Zeitreise plays its song, a game page
// in the gaming hall plays the game's soundtrack. Kept per device.

const AUTO_KEY = 'retromind.spotify.autoTheme';
const autoListeners = new Set<() => void>();
function readAuto(): boolean {
  try {
    return localStorage.getItem(AUTO_KEY) !== '0';
  } catch {
    return true;
  }
}
let autoTheme = typeof window === 'undefined' ? true : readAuto();

export function setAutoTheme(on: boolean) {
  autoTheme = on;
  try {
    localStorage.setItem(AUTO_KEY, on ? '1' : '0');
  } catch {
    /* only for this visit */
  }
  autoListeners.forEach((l) => l());
}

export function useAutoTheme(): boolean {
  return useSyncExternalStore(
    (cb) => {
      autoListeners.add(cb);
      return () => autoListeners.delete(cb);
    },
    () => autoTheme
  );
}
