// Arcade high score tables with three initials (api/highscores.js), shared
// by everyone, one per mini game. This device keeps its own table too, which shows when the
// server has none (offline, or no database configured). The initials are
// the player's own tag from the settings (lib/initials.ts).

import { getInitials, setInitials } from '../../lib/initials';
import { duelGame, today, weekOf } from './quests';
import { isChallengeGame } from './challenge';
import { tr } from '../../lib/i18n';

export type BoardGame =
  | 'blocks'
  | 'pinball'
  | 'pacman'
  | 'senso'
  | 'breakout'
  | 'snake'
  | 'invaders'
  | 'poker'
  | 'blackjack'
  | 'quiz'
  | 'memory'
  | 'puzzle'
  | 'sudoku'
  | 'solitaire'
  | 'asteroids'
  | 'frogger'
  | 'copter'
  | 'merge'
  | 'missile'
  | 'blitzbuttons'
  | 'blitzconsole'
  | 'blitzyear'
  | 'blitzpixel'
  | 'blitzcolor'
  | 'blitzcombo';
export interface Entry {
  name: string;
  score: number;
  /** This player's entry, just made. */
  mine?: boolean;
  /** One of this player's entries (the server knows them by the guest sign-in). */
  me?: boolean;
}

/** How each table counts: points (more is better), or moves and seconds (fewer is better). */
const UNIT: Record<BoardGame, 'points' | 'rounds' | 'right' | 'moves' | 'time' | 'meters'> = {
  blocks: 'points',
  pinball: 'points',
  pacman: 'points',
  senso: 'rounds',
  breakout: 'points',
  snake: 'points',
  invaders: 'points',
  poker: 'points',
  blackjack: 'points',
  quiz: 'right',
  memory: 'moves',
  puzzle: 'moves',
  sudoku: 'time',
  solitaire: 'time',
  asteroids: 'points',
  frogger: 'points',
  copter: 'meters',
  merge: 'points',
  missile: 'points',
  blitzbuttons: 'points',
  blitzconsole: 'points',
  blitzyear: 'points',
  blitzpixel: 'points',
  blitzcolor: 'points',
  blitzcombo: 'points',
};

/** Every game with a table, in the order of the Zock-Ecke. */
export const BOARD_GAMES: BoardGame[] = ['senso', 'memory', 'puzzle', 'sudoku', 'blocks', 'pinball', 'pacman', 'quiz', 'breakout', 'snake', 'invaders', 'poker', 'blackjack', 'solitaire', 'asteroids', 'frogger', 'copter', 'merge', 'missile', 'blitzbuttons', 'blitzconsole', 'blitzyear', 'blitzpixel', 'blitzcolor', 'blitzcombo'];

export const lowerIsBetter = (game: BoardGame) => UNIT[game] === 'moves' || UNIT[game] === 'time';

/** A score as the table shows it: 12,340 · 1:05 · 23 MOVES. */
export function formatScore(game: BoardGame, score: number): string {
  switch (UNIT[game]) {
    case 'time':
      return `${Math.floor(score / 60)}:${String(score % 60).padStart(2, '0')}`;
    case 'moves':
      return tr(`${score} MOVES`, `${score} ZÜGE`);
    case 'rounds':
      return tr(`ROUND ${score}`, `RUNDE ${score}`);
    case 'meters':
      return `${score.toLocaleString('en-US')} M`;
    case 'right':
      return `${score}/5`;
    default:
      return score.toLocaleString('en-US');
  }
}

const LOCAL = 'retromind.gaming.hiscores.v1';
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
  const sign = lowerIsBetter(game) ? -1 : 1;
  all[game] = [...(all[game] ?? []), { name: entry.name, score: entry.score }].sort((a, b) => sign * (b.score - a.score)).slice(0, SHOW);
  try {
    localStorage.setItem(LOCAL, JSON.stringify(all));
  } catch {
    /* storage unavailable */
  }
}

/** The player's tag, or AAA as on a fresh cabinet. */
export function lastInitials(): string {
  return getInitials() || 'AAA';
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

/** The weekly duel's table (everyone's; empty offline). */
export async function fetchWeekBoard(game: BoardGame, week = weekOf()): Promise<Entry[]> {
  try {
    const res = await fetch(`/api/highscores?game=${game}&week=${week}`);
    const data = await res.json();
    if (data.ready) return data.scores;
  } catch {
    /* offline */
  }
  return [];
}

/** The daily challenge's table for today (everyone's; empty offline). */
export async function fetchDayBoard(game: BoardGame, day = today()): Promise<Entry[]> {
  try {
    const res = await fetch(`/api/highscores?game=${game}&day=${day}`);
    const data = await res.json();
    if (data.ready) return data.scores;
  } catch {
    /* offline */
  }
  return [];
}

export const isDuelGame = (game: BoardGame) => duelGame() === game;

/** Whether a score would make it onto the table. */
export function qualifies(board: Entry[], score: number, game: BoardGame): boolean {
  if (!(score > 0)) return false;
  if (board.length < SHOW) return true;
  const last = board[board.length - 1].score;
  return lowerIsBetter(game) ? score < last : score > last;
}

export async function submitScore(game: BoardGame, name: string, score: number): Promise<Entry[]> {
  // Initials typed at a table become the player's tag, as on a cabinet.
  setInitials(name);
  addLocal(game, { name, score });
  let board: Entry[] | null = null;
  try {
    const res = await fetch('/api/highscores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // This week's duel game also goes on the weekly table, today's challenge game on the day's.
      body: JSON.stringify({ game, name, score, week: isDuelGame(game) ? weekOf() : undefined, day: isChallengeGame(game) ? today() : undefined }),
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
