// The rivalry around the high score tables (Marco, 2026-10-19): when someone
// passes your best entry on a table, the server leaves you a note
// (api/highscores.js ?news=1), shown when you next open the arcade. On
// devices where you switch on rival alerts the note also comes as a push
// message, even with the app closed (the service workers public/sw.js and
// public/gaming/sw.js show it). Push only after you ask for it; the browser
// asks for permission once more.

import { topicOff, topicOn, topicState } from '../../lib/push';
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

/* ---------------------------------------------------------------- Push */

// Shared with the chat corner (lib/push.ts): one subscription per device, topics on the server.
export type { PushState } from '../../lib/push';
export const pushState = () => topicState('rivals');
export const turnPushOn = () => topicOn('rivals');
export const turnPushOff = () => topicOff('rivals');
