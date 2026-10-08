import { tr } from '../../lib/i18n';

// Quests and the prize counter: every day three small tasks in the hall and
// one bigger one per week. Each finished quest pays tokens (Spielmarken),
// which the prize counter trades for extra designs and hub tunes, like the
// ticket counter in a real arcade.

/** What the app counts for quests. */
export type QuestEvent = 'discover' | 'open' | 'coin' | 'search' | 'minigame' | 'favorite' | 'finish' | 'console' | 'guru';

export interface Quest {
  id: string;
  event: QuestEvent;
  goal: number;
  reward: number;
  text: string;
}

const DAILY: Quest[] = [
  { id: 'discover', event: 'discover', goal: 3, reward: 15, text: tr('Discover 3 games you’ve never opened before.', 'Entdecke 3 Games, die du noch nie geöffnet hast.') },
  { id: 'open', event: 'open', goal: 5, reward: 10, text: tr('Take a closer look at 5 games.', 'Schau dir 5 Games genauer an.') },
  { id: 'coin', event: 'coin', goal: 2, reward: 10, text: tr('Drop a quarter in the slot twice (Insert Coin).', 'Wirf 2-mal eine Münze ein (Insert Coin).') },
  { id: 'search', event: 'search', goal: 2, reward: 10, text: tr('Search for a game twice.', 'Such 2-mal nach einem Game.') },
  { id: 'minigame', event: 'minigame', goal: 1, reward: 20, text: tr('Beat a minigame in the Chill Zone.', 'Schaff ein Minispiel in der Chill-Ecke.') },
  { id: 'favorite', event: 'favorite', goal: 1, reward: 15, text: tr('Put a game in your stash.', 'Pack ein Game in deinen Stash.') },
  { id: 'console', event: 'console', goal: 2, reward: 10, text: tr('Browse 2 consoles (Which System?).', 'Stöber bei 2 Konsolen (Welche Kiste?).') },
  { id: 'guru', event: 'guru', goal: 1, reward: 15, text: tr('Ask the Guru a question.', 'Stell dem Guru eine Frage.') },
];

const WEEKLY: Quest[] = [
  { id: 'w-discover', event: 'discover', goal: 15, reward: 60, text: tr('Discover 15 new games this week.', 'Entdecke diese Woche 15 neue Games.') },
  { id: 'w-minigame', event: 'minigame', goal: 5, reward: 60, text: tr('Beat 5 minigames this week.', 'Schaff diese Woche 5 Minispiele.') },
  { id: 'w-open', event: 'open', goal: 25, reward: 50, text: tr('Check out 25 games this week.', 'Schau dir diese Woche 25 Games an.') },
  { id: 'w-finish', event: 'finish', goal: 1, reward: 50, text: tr('Mark a game as beaten this week.', 'Markier diese Woche ein Game als durchgezockt.') },
];

export interface QuestLog {
  /** Local date the daily counts belong to (YYYY-MM-DD). */
  day: string;
  /** Monday of the week the weekly counts belong to. */
  week: string;
  daily: Partial<Record<QuestEvent, number>>;
  weekly: Partial<Record<QuestEvent, number>>;
  /** Quests already paid out, as "day:id" or "week:id". */
  claimed: string[];
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const today = (now = new Date()) => iso(now);

export function weekOf(now = new Date()) {
  const d = new Date(now);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return iso(d);
}

export const emptyLog = (now = new Date()): QuestLog => ({ day: today(now), week: weekOf(now), daily: {}, weekly: {}, claimed: [] });

/** The log for right now: counts from an earlier day or week start over. */
export function freshLog(log: QuestLog | undefined, now = new Date()): QuestLog {
  if (!log) return emptyLog(now);
  const day = today(now);
  const week = weekOf(now);
  if (log.day === day && log.week === week) return log;
  return {
    day,
    week,
    daily: log.day === day ? log.daily : {},
    weekly: log.week === week ? log.weekly : {},
    claimed: log.claimed.filter((k) => k.startsWith(`${day}:`) || k.startsWith(`${week}:`)),
  };
}

export function record(log: QuestLog | undefined, event: QuestEvent, n = 1): QuestLog {
  const l = freshLog(log);
  return {
    ...l,
    daily: { ...l.daily, [event]: (l.daily[event] ?? 0) + n },
    weekly: { ...l.weekly, [event]: (l.weekly[event] ?? 0) + n },
  };
}

/** Small deterministic shuffle so everyone gets the same quests on a day. */
function seeded(key: string) {
  let h = 2166136261;
  for (const c of key) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export interface ActiveQuest extends Quest {
  key: string;
  progress: number;
  weekly: boolean;
  claimed: boolean;
}

export function activeQuests(log: QuestLog): ActiveQuest[] {
  const rnd = seeded(log.day);
  const pool = [...DAILY];
  const daily = Array.from({ length: 3 }, () => pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  const weekly = WEEKLY[Math.floor(seeded(log.week)() * WEEKLY.length)];
  return [
    ...daily.map((q) => ({ ...q, key: `${log.day}:${q.id}`, progress: log.daily[q.event] ?? 0, weekly: false })),
    { ...weekly, key: `${log.week}:${weekly.id}`, progress: log.weekly[weekly.event] ?? 0, weekly: true },
  ].map((q) => ({ ...q, progress: Math.min(q.progress, q.goal), claimed: log.claimed.includes(q.key) }));
}

/** Merges two logs of the same device history (cloud sync). */
export function mergeLogs(a: QuestLog | undefined, b: QuestLog | undefined): QuestLog {
  const x = freshLog(a);
  const y = freshLog(b);
  const max = (p: QuestLog['daily'], q: QuestLog['daily']) => {
    const out = { ...p };
    for (const k of Object.keys(q) as QuestEvent[]) out[k] = Math.max(out[k] ?? 0, q[k] ?? 0);
    return out;
  };
  return { ...x, daily: max(x.daily, y.daily), weekly: max(x.weekly, y.weekly), claimed: Array.from(new Set([...x.claimed, ...y.claimed])) };
}

// --- Prize counter ---

export interface Prize {
  id: string;
  kind: 'palette' | 'track' | 'effect';
  label: string;
  text: string;
  price: number;
}

export const PRIZES: Prize[] = [
  { id: 'vapor', kind: 'palette', label: 'VAPORWAVE', text: tr('A design in pink, purple and teal like a ’90s sunset.', 'Design in Pink, Lila und Türkis wie ein 90er-Sonnenuntergang.'), price: 40 },
  { id: 'virtualboy', kind: 'palette', label: 'VIRTUAL BOY', text: tr('A design in red on black like Nintendo’s legendary flop.', 'Design in Rot auf Schwarz wie Nintendos legendärer Flop.'), price: 50 },
  { id: 'space', kind: 'track', label: tr('OUTER SPACE', 'WELTRAUM'), text: tr('Hall music like a shoot ’em up in space.', 'Hallen-Musik wie ein Shoot ’em up im All.'), price: 30 },
  { id: 'boss', kind: 'track', label: tr('BOSS FIGHT', 'BOSSKAMPF'), text: tr('Hall music for the final boss: frantic and dramatic.', 'Hallen-Musik für den Endgegner: hektisch und dramatisch.'), price: 30 },
  { id: 'party', kind: 'effect', label: tr('PARTY LOGO', 'PARTY-LOGO'), text: tr('The logo up top glows in every color of the rainbow, all the time.', 'Das Logo oben leuchtet dauerhaft in allen Regenbogenfarben.'), price: 35 },
];

/** Designs and tunes that are only available from the prize counter. */
export const PRIZE_IDS = new Set(PRIZES.map((p) => p.id));
export const isOwned = (id: string, owned: string[]) => !PRIZE_IDS.has(id) || owned.includes(id);
