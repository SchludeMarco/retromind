import { DECADES_DB } from '../constants';

// The date the time machine travels to (Marco, 2026-11-23: "Im Hauptbildschirm
// sollte die Zeit zu der man reisen möchte anpassbar sein. Standard ist der
// 30.12.1989. Falls der Benutzer ein Geburtsdatum eingetragen hat, sollte das
// als Standardwert eingetragen sein. Mit dem eingetragenen Datum soll sich das
// Aussehen der Stube und die Musik entsprechend anpassen").
// The chosen date lives in the session (retromind.session.v2, synced like
// every retromind* key); without a choice the birthday is the destination,
// without a birthday the 30 December 1989.

export const DEFAULT_TRAVEL_DATE = '1989-12-30';
/** The earliest date the picker offers. */
export const MIN_TRAVEL_DATE = '1950-01-01';

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Whether `s` is a usable "YYYY-MM-DD" between MIN_TRAVEL_DATE and today. */
export function isTravelDate(s: string | null | undefined): s is string {
  const m = DATE_RE.exec(s ?? '');
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const real = new Date(y, mo - 1, d);
  if (real.getFullYear() !== y || real.getMonth() !== mo - 1 || real.getDate() !== d) return false;
  return s! >= MIN_TRAVEL_DATE && s! <= todayIso();
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Where the journey goes: the chosen date, else the birthday, else 30.12.1989. */
export function destinationOf(travelDate: string | null | undefined, birthDate: string | null | undefined): string {
  if (isTravelDate(travelDate)) return travelDate;
  if (isTravelDate(birthDate)) return birthDate;
  return DEFAULT_TRAVEL_DATE;
}

export const yearOf = (date: string): number => Number(date.slice(0, 4));

/** The music decade of a date: its decade, held within the decades that have music ("1960" … "2010"). */
export function musicDecadeOf(date: string): string {
  const decades = Object.keys(DECADES_DB).map(Number).sort((a, b) => a - b);
  const d = Math.floor(yearOf(date) / 10) * 10;
  return String(Math.min(decades[decades.length - 1], Math.max(decades[0], d)));
}

/** The same day in another decade (keeps the year within the decade): picking "1970s" in the settings with 30.12.1989 gives 30.12.1979. */
export function moveToDecade(date: string, decade: string): string {
  const year = Number(decade) + (yearOf(date) % 10);
  let next = `${year}${date.slice(4)}`;
  if (next.endsWith('-02-29') && !isTravelDate(next)) next = `${year}-02-28`;
  if (next > todayIso()) next = todayIso();
  return next;
}
