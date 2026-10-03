import { useCallback, useEffect, useRef, useState } from 'react';
import { Game } from '../data/games';
import { hasMuteChoice, setMuted } from '../../lib/mute';
import { DEFAULT_TRACK, TrackId, isTrackId } from './tracks';

// Everything the Gaming edition remembers between visits, in localStorage
// only (separate key from the main RetroMind journey).

export type Palette = 'arcade' | 'gameboy' | 'amber';

export interface ArcadeState {
  favorites: string[];
  completed: string[];
  discovered: string[];
  achievements: string[];
  /** Searched games that were added to the collection, keyed by id. */
  customGames: Record<string, Game>;
  palette: Palette;
  music: boolean;
  /** The hub tune picked in the settings. */
  track: TrackId;
  sfx: boolean;
  hiScore: number;
}

const KEY = 'retromind.gaming.v1';

const DEFAULTS: ArcadeState = {
  favorites: [],
  completed: [],
  discovered: [],
  achievements: [],
  customGames: {},
  palette: 'arcade',
  music: true,
  track: DEFAULT_TRACK,
  sfx: true,
  hiScore: 0,
};

function load(): ArcadeState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const { muted, ...saved } = JSON.parse(raw);
    // The speaker button used to be stored here; it is app-wide now (lib/mute).
    if (muted === true && !hasMuteChoice()) setMuted(true);
    const state = { ...DEFAULTS, ...saved };
    return isTrackId(state.track) ? state : { ...state, track: DEFAULT_TRACK };
  } catch {
    return DEFAULTS;
  }
}

const union = (a: string[] = [], b: string[] = []) => Array.from(new Set([...a, ...b]));

/**
 * Combines this device's profile with one from the cloud on sign-in: nothing
 * collected on either side is lost, and the account's look and sound
 * settings come along to the new device.
 */
export function mergeStates(local: ArcadeState, remote: Partial<ArcadeState>): ArcadeState {
  return {
    ...local,
    favorites: union(local.favorites, remote.favorites),
    completed: union(local.completed, remote.completed),
    discovered: union(local.discovered, remote.discovered),
    achievements: union(local.achievements, remote.achievements),
    customGames: { ...(remote.customGames ?? {}), ...local.customGames },
    hiScore: Math.max(local.hiScore, remote.hiScore ?? 0),
    palette: remote.palette ?? local.palette,
    music: remote.music ?? local.music,
    track: isTrackId(remote.track) ? remote.track : local.track,
    sfx: remote.sfx ?? local.sfx,
  };
}

export interface Achievement {
  id: string;
  title: string;
  text: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-coin', title: 'Erste Münze', text: 'Erste Münze eingeworfen. Läuft bei dir!' },
  { id: 'explorer-5', title: 'Schatzsucher', text: '5 Games wiederentdeckt. Nice!' },
  { id: 'explorer-15', title: 'Videothek-Profi', text: '15 Games wiederentdeckt. Absolut goated.' },
  { id: 'collector', title: 'Sammler', text: 'Erstes Game im Stash. Ehrensache.' },
  { id: 'finisher', title: 'Abspann gesehen', text: 'Ein Game durchgezockt. GG!' },
  { id: 'digger', title: 'Grabbelkiste', text: 'Abseits des Katalogs gewühlt. Echter Digger.' },
  { id: 'konami', title: '↑↑↓↓←→←→BA', text: 'Den berühmtesten Cheat der Welt eingegeben. Oldschool-Legende!' },
];

/** Score = what a player would see on the HUD; a playful progress number. */
export function scoreOf(s: ArcadeState) {
  return s.discovered.length * 100 + s.favorites.length * 250 + s.completed.length * 500 + s.achievements.length * 1000;
}

export function useArcadeState(onAchievement: (a: Achievement) => void) {
  const [state, setState] = useState<ArcadeState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — non-fatal */
    }
  }, [state]);

  const stateRef = useRef(state);
  stateRef.current = state;

  const unlock = useCallback(
    (id: string) => {
      if (stateRef.current.achievements.includes(id)) return;
      // Mark immediately so a second call in the same tick doesn't toast twice.
      stateRef.current = { ...stateRef.current, achievements: [...stateRef.current.achievements, id] };
      setState((s) => (s.achievements.includes(id) ? s : { ...s, achievements: [...s.achievements, id] }));
      const a = ACHIEVEMENTS.find((x) => x.id === id);
      if (a) onAchievement(a);
    },
    [onAchievement]
  );

  // Derived achievements are checked whenever the counts change.
  useEffect(() => {
    if (state.discovered.length >= 5) unlock('explorer-5');
    if (state.discovered.length >= 15) unlock('explorer-15');
    if (state.favorites.length >= 1) unlock('collector');
    if (state.completed.length >= 1) unlock('finisher');
  }, [state.discovered.length, state.favorites.length, state.completed.length, unlock]);

  useEffect(() => {
    const score = scoreOf(state);
    if (score > state.hiScore) setState((s) => ({ ...s, hiScore: score }));
  }, [state]);

  const discover = useCallback((game: Game) => {
    setState((s) => (s.discovered.includes(game.id) ? s : { ...s, discovered: [...s.discovered, game.id] }));
  }, []);

  const toggleIn = useCallback((list: 'favorites' | 'completed', game: Game) => {
    setState((s) => {
      const has = s[list].includes(game.id);
      const customGames = game.custom && !has ? { ...s.customGames, [game.id]: game } : s.customGames;
      return { ...s, customGames, [list]: has ? s[list].filter((id) => id !== game.id) : [...s[list], game.id] };
    });
  }, []);

  const set = useCallback(<K extends keyof ArcadeState>(key: K, value: ArcadeState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const mergeIn = useCallback((remote: Partial<ArcadeState>) => {
    setState((s) => mergeStates(s, remote));
  }, []);

  return { state, discover, toggleIn, unlock, set, mergeIn };
}
