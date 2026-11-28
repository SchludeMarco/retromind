import { tr } from '../../lib/i18n';
import { seeded, today } from './quests';

// The boss of the day (Marco, 2026-11-28: "Ein Thema Endgegner … man sollte
// natürlich mehr Coins bekommen, wenn man gegen einen starken Gegner gewonnen
// hat"; "Jeden Tag gerne!"). Every day another boss waits in the hall. He is
// beaten in three rounds, each one a Blitz game (components/minigames/Blitz.tsx)
// with a hard goal, and the player has three hearts. Out of hearts, a continue
// costs Coins. On Sundays the Arcade Overlord comes: four rounds, higher goals,
// double the Coins. The fight lives in components/BossFight.tsx.

export type BossGame = 'blitzbuttons' | 'blitzconsole' | 'blitzyear' | 'blitzpixel' | 'blitzcolor' | 'blitzcombo';

export interface Boss {
  id: string;
  name: string;
  /** One line under the name. */
  title: string;
  /** Pixel art, one string per row; each letter is a color from `colors`, "." is empty. */
  sprite: string[];
  colors: Record<string, string>;
  /** The games he fights with; the rounds are drawn from these. */
  games: BossGame[];
  rounds: number;
  /** Goals and Coins are multiplied by this. */
  power: number;
  taunt: string;
  /** What he says when he loses a third of his life. */
  hurt: string[];
  /** What he says when the player misses a goal. */
  gloat: string[];
  defeat: string;
}

// Goals in a normal boss round; a bit above the daily challenge, which is
// meant to be made in a minute (challenge.ts).
const GOAL: Record<BossGame, number> = {
  blitzbuttons: 42,
  blitzconsole: 10,
  blitzyear: 10,
  blitzpixel: 6,
  blitzcolor: 18,
  blitzcombo: 50,
};

/** Later rounds are harder: the boss gets angry. */
const ROUND_FACTOR = [0.9, 1, 1.12, 1.2];

export const GAME_NAME: Record<BossGame, () => string> = {
  blitzbuttons: () => tr('Button Blitz', 'Knopf-Blitz'),
  blitzconsole: () => tr('Console Sprint', 'Konsolen-Sprint'),
  blitzyear: () => tr('Year Sprint', 'Jahres-Sprint'),
  blitzpixel: () => tr('Pixel Blitz', 'Pixel-Blitz'),
  blitzcolor: () => tr('Color Blitz', 'Farb-Blitz'),
  blitzcombo: () => tr('Combo Blitz', 'Combo-Blitz'),
};

export const HEARTS = 3;
export const CONTINUE_COST = 10;
/** Coins: each round won, the boss beaten, no heart lost, first in the hall today. Doubled on Sundays. */
export const BOSS_COINS = { round: 5, defeat: 50, perfect: 25, first: 15 };

const BOSSES: Omit<Boss, 'name' | 'title' | 'taunt' | 'hurt' | 'gloat' | 'defeat'>[] = [
  {
    id: 'glitch',
    sprite: [
      '...y.y.y.y...',
      '...yyyyyyy...',
      '..mmmmmmmmm..',
      '.mmcmmmmmcmm.',
      '.mmccmmmccmm.',
      '.mmmmmmmmmmm.',
      '.mm.mmmmm.mm.',
      '.mmmwwwwwmmm.',
      '..mmw.w.wmm..',
      '.c.mmmmmmm.c.',
      'cc..mm.mm..cc',
    ],
    colors: { y: '#facc15', m: '#d946ef', c: '#22d3ee', w: '#ffffff' },
    games: ['blitzbuttons', 'blitzcolor', 'blitzpixel'],
    rounds: 3,
    power: 1,
  },
  {
    id: 'kong',
    sprite: [
      '...ggggggg...',
      '..ggggggggg..',
      '..gsssssssg..',
      '..gsrsssrsg..',
      '..gsssssssg..',
      '...gsdddsg...',
      '.ggggggggggg.',
      'gg.gyyyyyg.gg',
      'gg.gyyyyyg.gg',
      'gg.ggggggg.gg',
      '...gg...gg...',
      '..ggg...ggg..',
    ],
    colors: { g: '#94a3b8', s: '#475569', r: '#ef4444', d: '#1e293b', y: '#facc15' },
    games: ['blitzbuttons', 'blitzcombo', 'blitzcolor'],
    rounds: 3,
    power: 1,
  },
  {
    id: 'witch',
    sprite: [
      '......pp.....',
      '.....ppp.....',
      '....ppppp....',
      '...ppppppp...',
      '.ppppppppppp.',
      '...ggggggg...',
      '...gyggggyg..',
      '...gggnggg...',
      '....gwwwg....',
      '...ppppppp...',
      '..ppppppppp..',
      '.ppppppppppp.',
    ],
    colors: { p: '#7c3aed', g: '#4ade80', y: '#facc15', n: '#166534', w: '#ffffff' },
    games: ['blitzpixel', 'blitzyear', 'blitzconsole'],
    rounds: 3,
    power: 1,
  },
  {
    id: 'drbit',
    sprite: [
      '...wwwwwww...',
      '..wwwwwwwww..',
      '..wsssssssw..',
      '..sbbsssbbs..',
      '..sbbsssbbs..',
      '..sssssssss..',
      '...sssmsss...',
      '..lllllllll..',
      '.llllrrrllll.',
      '.llllrrrllll.',
      '.ll.lllll.ll.',
      '....ll.ll....',
    ],
    colors: { w: '#e5e7eb', s: '#fcd34d', b: '#0f172a', m: '#b91c1c', l: '#f8fafc', r: '#dc2626' },
    games: ['blitzconsole', 'blitzyear', 'blitzcombo'],
    rounds: 3,
    power: 1,
  },
];

const OVERLORD: Omit<Boss, 'name' | 'title' | 'taunt' | 'hurt' | 'gloat' | 'defeat'> = {
  id: 'overlord',
  sprite: [
    '.y...y.y...y.',
    '.yy.yyyyy.yy.',
    '..yyyyyyyyy..',
    '..rrrrrrrrr..',
    '.rrrrrrrrrrr.',
    'rrkrrrrrrrkrr',
    'rrkkrrrrrkkrr',
    'rrrrrrrrrrrrr',
    '.rrwkwkwkwrr.',
    '..rrrrrrrrr..',
    '.o.rrrrrrr.o.',
    'oo..rr.rr..oo',
  ],
  colors: { y: '#facc15', r: '#b91c1c', k: '#000000', w: '#fef08a', o: '#f97316' },
  games: ['blitzbuttons', 'blitzconsole', 'blitzyear', 'blitzpixel', 'blitzcolor', 'blitzcombo'],
  rounds: 4,
  power: 1.15,
};

/** Names and lines, in the language of the moment. */
function words(id: string): Pick<Boss, 'name' | 'title' | 'taunt' | 'hurt' | 'gloat' | 'defeat'> {
  switch (id) {
    case 'glitch':
      return {
        name: tr('THE GLITCH KING', 'DER GLITCH-KÖNIG'),
        title: tr('Ruler of the broken pixels', 'Herrscher der kaputten Pixel'),
        taunt: tr('Your fingers are too slow for my kingdom!', 'Deine Finger sind zu langsam für mein Königreich!'),
        hurt: [tr('Error! ERROR!', 'Fehler! FEHLER!'), tr('My pixels… they’re falling off!', 'Meine Pixel … sie fallen ab!'), tr('Impossible!', 'Unmöglich!')],
        gloat: [tr('Ha! A lag on your side!', 'Ha! Ein Ruckler auf deiner Seite!'), tr('Game over… almost!', 'Game over … fast!')],
        defeat: tr('System… shutting… down…', 'System … fährt … herunter …'),
      };
    case 'kong':
      return {
        name: tr('MECHA-KONG', 'MECHA-KONG'),
        title: tr('Twelve tons of scrap metal and anger', 'Zwölf Tonnen Altmetall und Wut'),
        taunt: tr('I will crush you like a barrel!', 'Ich zerquetsche dich wie ein Fass!'),
        hurt: [tr('Gears grinding! GRRR!', 'Zahnräder knirschen! GRRR!'), tr('Oil leak!', 'Ölleck!'), tr('Armor broken!', 'Panzerung gebrochen!')],
        gloat: [tr('BOOM! Too slow!', 'BUMM! Zu langsam!'), tr('Kong is stronger!', 'Kong ist stärker!')],
        defeat: tr('Rust… in… peace…', 'Rost … in … Frieden …'),
      };
    case 'witch':
      return {
        name: tr('THE PIXEL WITCH', 'DIE PIXEL-HEXE'),
        title: tr('She knows every game ever made', 'Sie kennt jedes Spiel, das es je gab'),
        taunt: tr('Your memory is mine, mortal!', 'Dein Gedächtnis gehört mir, Sterblicher!'),
        hurt: [tr('My spell! Broken!', 'Mein Zauber! Gebrochen!'), tr('Curses!', 'Verflucht!'), tr('You know more than I thought…', 'Du weißt mehr, als ich dachte …')],
        gloat: [tr('Hee hee hee! Forgotten already?', 'Hihihi! Schon vergessen?'), tr('Wrong, wrong, wrong!', 'Falsch, falsch, falsch!')],
        defeat: tr('I’m melting… into pixels…', 'Ich zerfalle … zu Pixeln …'),
      };
    case 'drbit':
      return {
        name: tr('DR. BIT', 'DR. BIT'),
        title: tr('Mad scientist of the 8-bit era', 'Verrückter Wissenschaftler der 8-Bit-Zeit'),
        taunt: tr('My calculations say: you lose!', 'Meine Berechnungen sagen: Du verlierst!'),
        hurt: [tr('That wasn’t in my calculations!', 'Das stand nicht in meinen Berechnungen!'), tr('Overflow!', 'Überlauf!'), tr('Recalculating…', 'Neu berechnen …')],
        gloat: [tr('As calculated! Mwahaha!', 'Wie berechnet! Muahaha!'), tr('Science wins!', 'Die Wissenschaft siegt!')],
        defeat: tr('Divided… by… zero…', 'Geteilt … durch … null …'),
      };
    default:
      return {
        name: tr('THE ARCADE OVERLORD', 'DER ARCADE-OVERLORD'),
        title: tr('Sunday’s final boss: four rounds, double Coins', 'Sonntags-Endboss: vier Runden, doppelte Coins'),
        taunt: tr('Nobody leaves my arcade undefeated!', 'Niemand verlässt meine Spielhalle unbesiegt!'),
        hurt: [tr('You dare?!', 'Du wagst es?!'), tr('My throne is shaking!', 'Mein Thron wackelt!'), tr('Not my coins!', 'Nicht meine Münzen!'), tr('NOOO!', 'NEEEIN!')],
        gloat: [tr('Insert another coin!', 'Wirf noch eine Münze ein!'), tr('The arcade always wins!', 'Die Spielhalle gewinnt immer!')],
        defeat: tr('The arcade… is… yours…', 'Die Spielhalle … gehört … dir …'),
      };
  }
}

const dayNumber = (day: string) => Math.floor(Date.parse(`${day}T12:00:00Z`) / 86_400_000);

/** Today's boss, the same for everyone: the four take turns, on Sundays the Overlord. */
export function bossOfDay(day = today()): Boss & { day: string; fight: BossGame[]; goals: number[]; super: boolean } {
  const sunday = new Date(`${day}T12:00:00Z`).getUTCDay() === 0;
  const base = sunday ? OVERLORD : BOSSES[dayNumber(day) % BOSSES.length];
  const rnd = seeded(`boss:${day}`);
  // The rounds: the boss's games in a shuffled order (each once, if there are enough).
  const pool = [...base.games];
  const fight: BossGame[] = [];
  while (fight.length < base.rounds) {
    if (!pool.length) pool.push(...base.games);
    fight.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  }
  const goals = fight.map((g, i) => Math.max(1, Math.round(GOAL[g] * ROUND_FACTOR[i] * base.power)));
  return { ...base, ...words(base.id), day, fight, goals, super: sunday };
}

/** What the player did against today's boss (kept in the arcade state, so it syncs). */
export interface BossLog {
  day: string;
  /** The next round to play (0-based); equals the number of rounds won. */
  round: number;
  hearts: number;
  continues: number;
  /** Each round's best score so far. */
  scores: number[];
  won?: boolean;
  /** The first-in-the-hall check is done (paid or not). */
  firstChecked?: boolean;
  first?: boolean;
  /** On today's table of boss slayers. */
  entered?: boolean;
  /** Coins paid today. */
  coins: number;
  /** Bosses beaten in total, and without losing a heart. */
  wins: number;
  perfects: number;
}

/** Today's log: yesterday's fight is over, the totals stay. */
export function todaysBoss(log: BossLog | undefined, day = today()): BossLog {
  if (log && log.day === day) return log;
  return { day, round: 0, hearts: HEARTS, continues: 0, scores: [], coins: 0, wins: log?.wins ?? 0, perfects: log?.perfects ?? 0 };
}

export const coinsFor = (boss: { super: boolean }, n: number) => (boss.super ? n * 2 : n);

/** The result of a round: the new log and the Coins it pays. */
export function playRound(log: BossLog, boss: ReturnType<typeof bossOfDay>, score: number): { log: BossLog; coins: number; hit: boolean } {
  const i = log.round;
  const scores = [...log.scores];
  scores[i] = Math.max(scores[i] ?? 0, score);
  if (score < boss.goals[i]) return { log: { ...log, scores, hearts: Math.max(0, log.hearts - 1) }, coins: 0, hit: false };
  let coins = coinsFor(boss, BOSS_COINS.round);
  const round = i + 1;
  const won = round >= boss.fight.length;
  const perfect = won && log.hearts === HEARTS && log.continues === 0;
  if (won) coins += coinsFor(boss, BOSS_COINS.defeat) + (perfect ? coinsFor(boss, BOSS_COINS.perfect) : 0);
  return {
    log: {
      ...log,
      scores,
      round,
      won,
      coins: log.coins + coins,
      wins: log.wins + (won ? 1 : 0),
      perfects: log.perfects + (perfect ? 1 : 0),
    },
    coins,
    hit: true,
  };
}

/** A continue: all hearts back, for Coins. */
export const continued = (log: BossLog): BossLog => ({ ...log, hearts: HEARTS, continues: log.continues + 1 });

/** Points on the day's "boss slayers" table: how far above the goals, hearts left, continues cost. */
export function bossScore(log: BossLog, boss: ReturnType<typeof bossOfDay>): number {
  const margin = boss.goals.reduce((n, g, i) => n + Math.round((100 * (log.scores[i] ?? 0)) / g), 0);
  return Math.max(1, Math.min(9999, margin + 100 * log.hearts - 150 * log.continues));
}

/** The boss's life left, 0 to 1. */
export const bossLife = (log: BossLog, boss: { fight: unknown[] }) => 1 - log.round / boss.fight.length;
