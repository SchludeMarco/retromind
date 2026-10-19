import { useSyncExternalStore } from 'react';

// Songs the visitor liked while they played (Marco, 2026-10-19: "Wenn ein
// geiler song kommt, möchte ich den speichern können damit ich weiß ich fand
// den geil! Optional auch mit kommentar"). A heart next to the song in the
// Zeitreise mini player and in the music panel of both apps saves it; the
// list lives in the music panel. One retromind key, so it syncs between the
// Zeitreise, the gaming hall and devices on its own (lib/sync).

export interface FavoriteSong {
  /** spotify:track:… when known, else "title:" + the lower-case title. */
  id: string;
  /** "Title · Artist" as shown in the player. */
  title: string;
  uri: string | null;
  image: string | null;
  /** Optional words of the visitor's own. */
  comment: string;
  /** Where it played, e.g. "Music of the 80s" or "Arcade music". */
  where: string;
  /** Saved at (ms). */
  at: number;
}

const KEY = 'retromind.favorite.songs';

const listeners = new Set<() => void>();
let songs: FavoriteSong[] = read();

function read(): FavoriteSong[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(list) ? list.filter((s) => s && typeof s.id === 'string' && typeof s.title === 'string') : [];
  } catch {
    return [];
  }
}

function write(next: FavoriteSong[]) {
  songs = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* not kept, still shown for this visit */
  }
  listeners.forEach((l) => l());
}

export function songId(title: string, uri: string | null): string {
  return uri ?? `title:${title.trim().toLowerCase()}`;
}

/** The saved entry for this song, if any (by Spotify id or by title). */
export function findFavorite(title: string | null, uri: string | null): FavoriteSong | null {
  if (!title) return null;
  const id = songId(title, uri);
  const t = title.trim().toLowerCase();
  return songs.find((s) => s.id === id || s.title.trim().toLowerCase() === t) ?? null;
}

/** Saves the song (newest on top) and returns its entry; an already saved one stays as it is. */
export function saveFavorite(song: { title: string; uri: string | null; image: string | null; where: string }): FavoriteSong {
  const known = findFavorite(song.title, song.uri);
  if (known) return known;
  const entry: FavoriteSong = { ...song, id: songId(song.title, song.uri), comment: '', at: Date.now() };
  write([entry, ...songs]);
  return entry;
}

export function setFavoriteComment(id: string, comment: string) {
  write(songs.map((s) => (s.id === id ? { ...s, comment: comment.slice(0, 500) } : s)));
}

export function removeFavorite(id: string) {
  write(songs.filter((s) => s.id !== id));
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useFavoriteSongs(): FavoriteSong[] {
  return useSyncExternalStore(subscribe, () => songs, () => songs);
}

// The little card that opens after tapping the heart (comment, remove).
let editing: string | null = null;
const editListeners = new Set<() => void>();
export function openFavoriteCard(id: string | null) {
  editing = id;
  editListeners.forEach((l) => l());
}
export function useFavoriteCard(): string | null {
  return useSyncExternalStore(
    (cb) => {
      editListeners.add(cb);
      return () => editListeners.delete(cb);
    },
    () => editing,
    () => editing
  );
}
