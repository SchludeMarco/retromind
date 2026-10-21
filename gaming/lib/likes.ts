import { useEffect, useState } from 'react';
import { chip } from './chiptune';
import { BoardGame } from './highscores';

// Likes for the games in the Hall of Fame (Marco, 2026-10-21: "a button to
// like a game"): the mini games in the high score list, and the catalog games
// in the Hall of Fame show and on their pages (id "g:<game id>"). The server
// counts each guest once per game; this device keeps its own likes too, so
// the hearts stay lit offline.

export type LikeId = BoardGame | `g:${string}`;
export const catalogLike = (gameId: string): LikeId => `g:${gameId}`;

const KEY = 'retromind.gaming.likes';

export interface Likes {
  counts: Partial<Record<LikeId, number>>;
  mine: Set<LikeId>;
}

function localMine(): Set<LikeId> {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
}

function saveMine(mine: Set<LikeId>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...mine]));
  } catch {
    /* storage full or blocked */
  }
}

/** Everyone's like counts and this guest's own likes (only this device's offline). */
export async function fetchLikes(): Promise<Likes> {
  try {
    const res = await fetch('/api/highscores?likes=1');
    const data = await res.json();
    if (data.ready) {
      const mine = new Set<LikeId>(data.mine);
      saveMine(mine);
      return { counts: data.likes, mine };
    }
  } catch {
    /* offline */
  }
  const mine = localMine();
  return { counts: Object.fromEntries([...mine].map((g) => [g, 1])), mine };
}

/** Likes or unlikes a game; returns the new count from the server, or null offline. */
export async function setLike(game: LikeId, on: boolean): Promise<number | null> {
  const mine = localMine();
  if (on) mine.add(game);
  else mine.delete(game);
  saveMine(mine);
  try {
    const res = await fetch('/api/highscores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ like: game, on }),
    });
    const data = await res.json();
    if (data.ok) return data.count;
  } catch {
    /* offline */
  }
  return null;
}

/** Everyone's likes, loaded once, with a toggle that shows the change at once and then the server's count. */
export function useLikes(): [Likes, (id: LikeId) => void] {
  const [likes, setLikes] = useState<Likes>({ counts: {}, mine: new Set() });
  useEffect(() => {
    let alive = true;
    fetchLikes().then((l) => alive && setLikes(l));
    return () => {
      alive = false;
    };
  }, []);
  const toggle = (id: LikeId) => {
    const on = !likes.mine.has(id);
    chip.play(on ? 'select' : 'back');
    const mine = new Set(likes.mine);
    if (on) mine.add(id);
    else mine.delete(id);
    const guess = Math.max(0, (likes.counts[id] ?? 0) + (on ? 1 : -1));
    setLikes((l) => ({ counts: { ...l.counts, [id]: guess }, mine }));
    setLike(id, on).then((count) => {
      if (count !== null) setLikes((l) => ({ ...l, counts: { ...l.counts, [id]: count } }));
    });
  };
  return [likes, toggle];
}
