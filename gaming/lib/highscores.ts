// Arcade high score tables with three initials (api/highscores.js), shared
// by everyone. This device keeps its own table too, which shows when the
// server has none (offline, or no database configured).

export type BoardGame = 'blocks' | 'pinball' | 'pacman' | 'senso' | 'breakout' | 'snake' | 'invaders';
export interface Entry {
  name: string;
  score: number;
  /** This player's entry, just made. */
  mine?: boolean;
}

const LOCAL = 'retromind.gaming.hiscores.v1';
const INITIALS = 'retromind.gaming.initials';
const SHOW = 10;

function localAll(): Partial<Record<BoardGame, Entry[]>> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL) || '{}') ?? {};
  } catch {
    return {};
  }
}

function localBoard(game: BoardGame): Entry[] {
  return (localAll()[game] ?? []).slice(0, SHOW);
}

function addLocal(game: BoardGame, entry: Entry) {
  const all = localAll();
  all[game] = [...(all[game] ?? []), { name: entry.name, score: entry.score }].sort((a, b) => b.score - a.score).slice(0, SHOW);
  try {
    localStorage.setItem(LOCAL, JSON.stringify(all));
  } catch {
    /* storage unavailable */
  }
}

export function lastInitials(): string {
  try {
    return localStorage.getItem(INITIALS) || 'AAA';
  } catch {
    return 'AAA';
  }
}

/** The table for a game: everyone's when the server has one, else this device's. */
export async function fetchBoard(game: BoardGame): Promise<Entry[]> {
  try {
    const res = await fetch(`/api/highscores?game=${game}`);
    const data = await res.json();
    if (data.ready) return data.scores;
  } catch {
    /* offline */
  }
  return localBoard(game);
}

/** Whether a score would make it onto the table. */
export function qualifies(board: Entry[], score: number): boolean {
  return score > 0 && (board.length < SHOW || score > board[board.length - 1].score);
}

export async function submitScore(game: BoardGame, name: string, score: number): Promise<Entry[]> {
  try {
    localStorage.setItem(INITIALS, name);
  } catch {
    /* fine */
  }
  addLocal(game, { name, score });
  let board: Entry[] | null = null;
  try {
    const res = await fetch('/api/highscores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game, name, score }),
    });
    const data = await res.json();
    if (data.ready) board = data.scores;
  } catch {
    /* offline */
  }
  const list = board ?? localBoard(game);
  let marked = false;
  return list.map((e) => {
    if (!marked && e.name === name && e.score === score) {
      marked = true;
      return { ...e, mine: true };
    }
    return e;
  });
}
