import { tr } from '../../lib/i18n';
import { BoardGame, lowerIsBetter } from './highscores';
import { duelGame, seeded, today } from './quests';

// The daily challenge (Marco, 2026-10-21: "nobody has much time anymore"):
// one short task a day in a mini game, the same for everyone, done in a
// minute or two. Making it pays Coins once a day, and the day's best scores
// stand on their own table (api/highscores.js `day`) until midnight.

export interface Challenge {
  game: BoardGame;
  /** Points, rounds or meters to reach, or at most this many moves. */
  goal: number;
  /** Rough minutes it takes, shown on the card. */
  minutes: number;
  text: string;
}

const POOL: Challenge[] = [
  { game: 'senso', goal: 6, minutes: 1, text: tr('Color Echo: make it to round 6.', 'Farbecho: schaff Runde 6.') },
  { game: 'memory', goal: 18, minutes: 1, text: tr('Pixel Memory: find all pairs in 18 moves or fewer.', 'Pixel-Memory: alle Pärchen in höchstens 18 Zügen.') },
  { game: 'puzzle', goal: 45, minutes: 2, text: tr('Slide Puzzle: sort it in 45 moves or fewer.', 'Schiebepuzzle: sortiert in höchstens 45 Zügen.') },
  { game: 'quiz', goal: 4, minutes: 1, text: tr('Name That Game: get 4 of 5 right.', 'Spiele-Quiz: 4 von 5 richtig.') },
  { game: 'snake', goal: 80, minutes: 1, text: tr('Snake: eat 8 apples (80 points).', 'Snake: futter 8 Äpfel (80 Punkte).') },
  { game: 'breakout', goal: 400, minutes: 2, text: tr('Brick Bash: score 400 points.', 'Mauerbrecher: hol 400 Punkte.') },
  { game: 'invaders', goal: 300, minutes: 1, text: tr('Space Invasion: score 300 points.', 'Weltraum-Invasion: hol 300 Punkte.') },
  { game: 'copter', goal: 300, minutes: 1, text: tr('Cave Copter: fly 300 meters.', 'Höhlenflug: flieg 300 Meter weit.') },
  { game: 'frogger', goal: 300, minutes: 1, text: tr('Frog Hop: score 300 points.', 'Froschhüpfer: hol 300 Punkte.') },
  { game: 'asteroids', goal: 1500, minutes: 2, text: tr('Asteroids: score 1,500 points.', 'Asteroiden: hol 1.500 Punkte.') },
  { game: 'pacman', goal: 1000, minutes: 2, text: tr('Pac-Munch: score 1,000 points.', 'Pac-Mampf: hol 1.000 Punkte.') },
  { game: 'blocks', goal: 500, minutes: 2, text: tr('Block Stacker: score 500 points.', 'Blockstapler: hol 500 Punkte.') },
];

/** Coins for making the day's challenge (once a day). */
export const CHALLENGE_REWARD = 25;

/** Today's challenge, the same for everyone; never this week's duel game, which has its own table. */
export function dailyChallenge(now = new Date()): Challenge & { day: string } {
  const day = today(now);
  const duel = duelGame(now);
  const pool = POOL.filter((c) => c.game !== duel);
  return { ...pool[Math.floor(seeded(`challenge:${day}`)() * pool.length)], day };
}

/** Whether a result makes the challenge. */
export const meets = (c: Challenge, score: number) => score > 0 && (lowerIsBetter(c.game) ? score <= c.goal : score >= c.goal);

/** Today's challenge game, or null. */
export const isChallengeGame = (game: BoardGame) => dailyChallenge().game === game;

/** What the player did in today's challenge (kept in the arcade state, so it syncs). */
export interface ChallengeLog {
  day: string;
  /** Best result today in the challenge game. */
  best?: number;
  /** Made it today (Coins paid). */
  won?: boolean;
  /** Challenges made in total. */
  wins: number;
}

/** Records a result in the challenge game; `paid` is true the first time today's goal is met. */
export function recordChallenge(log: ChallengeLog | undefined, game: BoardGame, score: number, now = new Date()): { log: ChallengeLog; paid: boolean } | null {
  const c = dailyChallenge(now);
  if (c.game !== game || !(score > 0)) return null;
  const prev: ChallengeLog = log?.day === c.day ? log : { day: c.day, wins: log?.wins ?? 0 };
  const better = prev.best === undefined || (lowerIsBetter(game) ? score < prev.best : score > prev.best);
  const paid = !prev.won && meets(c, score);
  return {
    log: { ...prev, best: better ? score : prev.best, won: prev.won || paid, wins: prev.wins + (paid ? 1 : 0) },
    paid,
  };
}

/** Today's part of the log (empty when it is from another day). */
export const todaysLog = (log: ChallengeLog | undefined): ChallengeLog => (log?.day === today() ? log : { day: today(), wins: log?.wins ?? 0 });

/** A game's result as the mini games report it (minigames/shared Done). */
export const RESULT_EVENT = 'retromind:mini-result';
export const reportResult = (game: BoardGame, score: number) =>
  window.dispatchEvent(new CustomEvent(RESULT_EVENT, { detail: { game, score } }));
