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
  /** About how long it takes, shown on the card ("30 s", "about 1 min"). */
  length: string;
  text: string;
}

// The regular mini games with a goal.
const OLD_POOL: Challenge[] = [
  { game: 'senso', goal: 6, length: tr('about 1 min', 'ca. 1 Min.'), text: tr('Color Echo: make it to round 6.', 'Farbecho: schaff Runde 6.') },
  { game: 'memory', goal: 18, length: tr('about 1 min', 'ca. 1 Min.'), text: tr('Pixel Memory: find all pairs in 18 moves or fewer.', 'Pixel-Memory: alle Pärchen in höchstens 18 Zügen.') },
  { game: 'puzzle', goal: 45, length: tr('about 2 min', 'ca. 2 Min.'), text: tr('Slide Puzzle: sort it in 45 moves or fewer.', 'Schiebepuzzle: sortiert in höchstens 45 Zügen.') },
  { game: 'quiz', goal: 4, length: tr('about 1 min', 'ca. 1 Min.'), text: tr('Name That Game: get 4 of 5 right.', 'Spiele-Quiz: 4 von 5 richtig.') },
  { game: 'snake', goal: 80, length: tr('about 1 min', 'ca. 1 Min.'), text: tr('Snake: eat 8 apples (80 points).', 'Snake: futter 8 Äpfel (80 Punkte).') },
  { game: 'breakout', goal: 400, length: tr('about 2 min', 'ca. 2 Min.'), text: tr('Brick Bash: score 400 points.', 'Mauerbrecher: hol 400 Punkte.') },
  { game: 'invaders', goal: 300, length: tr('about 1 min', 'ca. 1 Min.'), text: tr('Space Invasion: score 300 points.', 'Weltraum-Invasion: hol 300 Punkte.') },
  { game: 'copter', goal: 300, length: tr('about 1 min', 'ca. 1 Min.'), text: tr('Cave Copter: fly 300 meters.', 'Höhlenflug: flieg 300 Meter weit.') },
  { game: 'frogger', goal: 300, length: tr('about 1 min', 'ca. 1 Min.'), text: tr('Frog Hop: score 300 points.', 'Froschhüpfer: hol 300 Punkte.') },
  { game: 'asteroids', goal: 1500, length: tr('about 2 min', 'ca. 2 Min.'), text: tr('Asteroids: score 1,500 points.', 'Asteroiden: hol 1.500 Punkte.') },
  { game: 'pacman', goal: 1000, length: tr('about 2 min', 'ca. 2 Min.'), text: tr('Pac-Munch: score 1,000 points.', 'Pac-Mampf: hol 1.000 Punkte.') },
  { game: 'blocks', goal: 500, length: tr('about 2 min', 'ca. 2 Min.'), text: tr('Block Stacker: score 500 points.', 'Blockstapler: hol 500 Punkte.') },
];

// From 2026-10-22 on the Blitz games, made for it (Marco, 2026-10-21: 30
// seconds each, the same round for everyone on a day), take turns with them:
// about every other day is a Blitz game.
const BLITZ_FROM = '2026-10-22';
const BLITZ_POOL: Challenge[] = [
  { game: 'blitzbuttons', goal: 35, length: tr('30 s', '30 Sek.'), text: tr('Button Blitz: hit 35 lit buttons in 30 seconds.', 'Knopf-Blitz: triff 35 leuchtende Knöpfe in 30 Sekunden.') },
  { game: 'blitzconsole', goal: 8, length: tr('30 s', '30 Sek.'), text: tr('Console Sprint: 8 points in 30 seconds.', 'Konsolen-Sprint: 8 Punkte in 30 Sekunden.') },
  { game: 'blitzyear', goal: 8, length: tr('30 s', '30 Sek.'), text: tr('Year Sprint: 8 points in 30 seconds (which came out first?).', 'Jahres-Sprint: 8 Punkte in 30 Sekunden (was kam zuerst raus?).') },
];

/** Coins for making the day's challenge (once a day). */
export const CHALLENGE_REWARD = 25;

/** Today's challenge, the same for everyone; never this week's duel game, which has its own table. */
export function dailyChallenge(now = new Date()): Challenge & { day: string } {
  const day = today(now);
  const duel = duelGame(now);
  const rnd = seeded(`challenge:${day}`);
  const blitz = day >= BLITZ_FROM && rnd() < 0.5;
  const pool = (blitz ? BLITZ_POOL : OLD_POOL).filter((c) => c.game !== duel);
  return { ...pool[Math.floor((day < BLITZ_FROM ? seeded(`challenge:${day}`) : rnd)() * pool.length)], day };
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
