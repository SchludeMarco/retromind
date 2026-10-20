// The rivalry around the high score tables (Marco, 2026-10-19): when someone
// passes your best entry on a table, the server leaves you a note
// (api/highscores.js ?news=1), shown when you next open the arcade. It also
// comes as a push message, even with the app closed, as the notification
// settings allow (lib/push.ts, topic "rivals").

import { BoardGame } from './highscores';

export interface RivalNews {
  game: BoardGame;
  /** The rival's initials. */
  name: string;
  score: number;
  at: number;
}

// Synced (lib/sync.ts), so a note read on one device does not pop up on the next.
const SEEN = 'retromind.gaming.rivals.seen';

function seenAt(): number {
  try {
    return Number(localStorage.getItem(SEEN)) || 0;
  } catch {
    return 0;
  }
}

export function markRivalsSeen(at = Date.now()) {
  try {
    localStorage.setItem(SEEN, String(Math.max(at, seenAt())));
  } catch {
    /* storage unavailable */
  }
}

/** Notes about being overtaken, newest first. */
export async function fetchRivalNews(): Promise<RivalNews[]> {
  try {
    const res = await fetch('/api/highscores?news=1');
    const data = await res.json();
    return Array.isArray(data.news) ? data.news : [];
  } catch {
    return [];
  }
}

/** Notes not shown yet. The very first visit starts fresh instead of replaying old ones. */
export async function unseenRivalNews(): Promise<RivalNews[]> {
  const news = await fetchRivalNews();
  const since = seenAt();
  return since ? news.filter((n) => n.at > since) : [];
}
