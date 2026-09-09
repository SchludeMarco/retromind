import { AppPhase, SessionState, UserProfile, BuzzwordCategory } from '../types';

export const STORAGE_KEY = 'retromind.session.v2';
export const PHASES: AppPhase[] = ['intro', 'onboarding', 'induction', 'exploration', 'diary', 'book', 'finish'];
export const EMPTY_USER: UserProfile = { name: '', gender: '', birthDate: '', interests: [], favoriteArtists: [] };
export const INTEREST_TO_CATEGORY: Record<string, BuzzwordCategory> = {
  Musik: 'music', Technik: 'tech', Spielzeug: 'toy', Alltag: 'lifestyle', Mode: 'lifestyle', Essen: 'food',
};

export function loadSession(): Partial<SessionState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const s = JSON.parse(raw);
    return s && s.version === 2 ? s : {};
  } catch {
    return {};
  }
}

export function persistSession(s: SessionState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
