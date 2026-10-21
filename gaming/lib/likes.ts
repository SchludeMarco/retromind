import { BoardGame } from './highscores';

// Likes for the games in the Hall of Fame (Marco, 2026-10-21: "a button to
// like a game"). The server counts each guest once per game; this device
// keeps its own likes too, so the hearts stay lit offline.

const KEY = 'retromind.gaming.likes';

export interface Likes {
  counts: Partial<Record<BoardGame, number>>;
  mine: Set<BoardGame>;
}

function localMine(): Set<BoardGame> {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
}

function saveMine(mine: Set<BoardGame>) {
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
      const mine = new Set<BoardGame>(data.mine);
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
export async function setLike(game: BoardGame, on: boolean): Promise<number | null> {
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
