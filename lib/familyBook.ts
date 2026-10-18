import { useSyncExternalStore } from 'react';

// The family book's side in the browser (api/_family.js, served at /api/family): the agreement to
// share, and the calls. Answers only go to the server after the person has
// agreed in the app; the agreement is a "retromind" key, so it travels with
// the rest of their data (lib/sync.ts) and "Delete my data" removes it.

export interface FamilyAnswer {
  name: string;
  text: string;
  question: string;
  at: number;
  mine: boolean;
}

export interface FamilyWeek {
  ready: boolean;
  answers: FamilyAnswer[];
  /** Weeks that have answers, oldest first. */
  weeks?: string[];
}

const CONSENT = 'retromind.family.consent';
const listeners = new Set<() => void>();

export function familyConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT) === 'yes';
  } catch {
    return false;
  }
}

export function setFamilyConsent(yes: boolean) {
  try {
    if (yes) localStorage.setItem(CONSENT, 'yes');
    else localStorage.removeItem(CONSENT);
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((fn) => fn());
}

export const useFamilyConsent = () =>
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    familyConsent
  );

async function call(url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, { credentials: 'same-origin', ...init });
  if (!res.ok) throw new Error(`family ${res.status}`);
  return res.json();
}

export const loadWeek = (week: string): Promise<FamilyWeek> =>
  call(`/api/family?week=${week}`).catch(() => ({ ready: false, answers: [] }));

export const saveAnswer = (week: string, name: string, text: string, question: string): Promise<FamilyWeek> =>
  call('/api/family', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ week, name, text, question }),
  });

export const deleteAnswer = (week: string): Promise<FamilyWeek> => call(`/api/family?week=${week}`, { method: 'DELETE' });

/** Removes every answer of this guest from the server ("Delete my data"). */
export const deleteAllAnswers = (): Promise<unknown> => call('/api/family?all=1', { method: 'DELETE' }).catch(() => null);

let newCount: Promise<number> | null = null;
/** How many answers others wrote after the given day (for the letter in the Stube); 0 without agreement. */
export function newAnswersSince(day: string): Promise<number> {
  if (!familyConsent()) return Promise.resolve(0);
  if (!newCount) newCount = call(`/api/family?since=${day}`).then((d) => Number(d.count) || 0).catch(() => 0);
  return newCount;
}
