// When this device last opened the app (Marco, 2026-10-18: testers lose
// interest after a while). Read once at start, then set to now. It feeds the
// "since your last visit" letter in the Stube, the streak in the Gaming hall,
// and an anonymous bucket in the usage count (lib/usage.ts) that tells the
// admin page whether people come back. Kept per device and per app (never
// synced, lib/sync.ts), and never sent as a date.
export type VisitApp = 'zeitreise' | 'gaming';
/** How long ago the previous visit on this device was. */
export type ReturnBucket = 'first' | 'same' | 'day' | 'week' | 'month' | 'later';

const KEY = (app: VisitApp) => `retromind.visit.${app}`;
const DAY = 86_400_000;

const previous: Partial<Record<VisitApp, number | null>> = {};

/** The previous visit's time (ms), or null on the first one. Stamps this visit the first time it is called. */
export function previousVisit(app: VisitApp): number | null {
  if (app in previous) return previous[app] ?? null;
  let last: number | null = null;
  try {
    const raw = Number(localStorage.getItem(KEY(app)));
    last = raw > 0 ? raw : null;
    localStorage.setItem(KEY(app), String(Date.now()));
  } catch {
    /* storage unavailable: every visit looks like the first */
  }
  previous[app] = last;
  return last;
}

/** Calendar days since the previous visit (0 = earlier today), or null on the first visit. */
export function daysAway(app: VisitApp, now = new Date()): number | null {
  const last = previousVisit(app);
  if (last === null) return null;
  const a = new Date(last);
  a.setHours(0, 0, 0, 0);
  const b = new Date(now);
  b.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / DAY));
}

export function returnBucket(app: VisitApp): ReturnBucket {
  const d = daysAway(app);
  if (d === null) return 'first';
  if (d === 0) return 'same';
  if (d === 1) return 'day';
  if (d <= 7) return 'week';
  if (d <= 31) return 'month';
  return 'later';
}

/** YYYY-MM-DD of the previous visit, for "what's new since then". */
export function previousVisitDay(app: VisitApp): string | null {
  const last = previousVisit(app);
  if (last === null) return null;
  const d = new Date(last);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
