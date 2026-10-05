import { useCallback, useEffect, useRef, useState } from 'react';
import { Game } from '../data/games';
import { hasMuteChoice, setMuted } from '../../lib/mute';
import { DEFAULT_TRACK, TrackId, isTrackId } from './tracks';
import { ActiveQuest, activeQuests, freshLog, mergeLogs, PRIZES, QuestEvent, QuestLog, record } from './quests';

// Everything the Gaming edition remembers between visits, in localStorage
// only (separate key from the main RetroMind journey).

export type Palette = 'modul' | 'arcade' | 'gameboy' | 'amber' | 'vapor' | 'virtualboy';

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
  /** Bumped when a new default design ships, so saved profiles switch once. */
  designRev: number;
  /** Spielmarken earned with quests, spent at the prize counter. */
  tokens: number;
  /** Prize ids bought at the prize counter. */
  owned: string[];
  quests: QuestLog;
}

/** 2 = the "Modul" design from Google Stitch (PR #93). */
const DESIGN_REV = 2;

const KEY = 'retromind.gaming.v1';

const DEFAULTS: ArcadeState = {
  favorites: [],
  completed: [],
  discovered: [],
  achievements: [],
  customGames: {},
  palette: 'modul',
  music: true,
  track: DEFAULT_TRACK,
  sfx: true,
  hiScore: 0,
  designRev: DESIGN_REV,
  tokens: 0,
  owned: [],
  quests: freshLog(undefined),
};

function load(): ArcadeState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const { muted, ...saved } = JSON.parse(raw);
    // The speaker button used to be stored here; it is app-wide now (lib/mute).
    if (muted === true && !hasMuteChoice()) setMuted(true);
    let state: ArcadeState = { ...DEFAULTS, ...saved };
    // Profiles from before the new default design get it once; picking
    // another design afterwards sticks.
    if (!(saved.designRev >= DESIGN_REV)) state = { ...state, palette: 'modul', designRev: DESIGN_REV };
    state = { ...state, quests: freshLog(state.quests) };
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
    // An old cloud backup must not switch the new default design back.
    palette: (remote.designRev ?? 0) >= DESIGN_REV ? remote.palette ?? local.palette : local.palette,
    designRev: Math.max(local.designRev, remote.designRev ?? 0),
    music: remote.music ?? local.music,
    track: isTrackId(remote.track) ? remote.track : local.track,
    sfx: remote.sfx ?? local.sfx,
    // Tokens can't be told apart per device, so the larger balance wins.
    tokens: Math.max(local.tokens, remote.tokens ?? 0),
    owned: union(local.owned, remote.owned),
    quests: mergeLogs(local.quests, remote.quests),
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
  { id: 'chill', title: 'Chillmodus', text: 'Ein Minispiel in der Chill-Ecke geschafft. Entspannt!' },
  { id: 'konami', title: '↑↑↓↓←→←→BA', text: 'Den berühmtesten Cheat der Welt eingegeben. Oldschool-Legende!' },
];

/** Score = what a player would see on the HUD; a playful progress number. */
export function scoreOf(s: ArcadeState) {
  return s.discovered.length * 100 + s.favorites.length * 250 + s.completed.length * 500 + s.achievements.length * 1000;
}

export function useArcadeState(onAchievement: (a: Achievement) => void, onQuest: (q: ActiveQuest) => void) {
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

  // Finished quests pay out their tokens once.
  const paid = useRef(new Set<string>());
  useEffect(() => {
    const done = activeQuests(state.quests).filter((q) => q.progress >= q.goal && !q.claimed && !paid.current.has(q.key));
    if (!done.length) return;
    done.forEach((q) => paid.current.add(q.key));
    setState((s) => ({
      ...s,
      tokens: s.tokens + done.reduce((n, q) => n + q.reward, 0),
      quests: { ...s.quests, claimed: [...s.quests.claimed, ...done.map((q) => q.key)] },
    }));
    done.forEach(onQuest);
  }, [state.quests, onQuest]);

  const track = useCallback((event: QuestEvent) => {
    setState((s) => ({ ...s, quests: record(s.quests, event) }));
  }, []);

  /** Buys a prize; false when the tokens aren't enough. */
  const buy = useCallback((id: string) => {
    const prize = PRIZES.find((p) => p.id === id);
    const s = stateRef.current;
    if (!prize || s.owned.includes(id) || s.tokens < prize.price) return false;
    stateRef.current = { ...s, tokens: s.tokens - prize.price, owned: [...s.owned, id] };
    setState((x) => (x.owned.includes(id) ? x : { ...x, tokens: x.tokens - prize.price, owned: [...x.owned, id] }));
    return true;
  }, []);

  const discover = useCallback((game: Game) => {
    setState((s) =>
      s.discovered.includes(game.id)
        ? s
        : { ...s, discovered: [...s.discovered, game.id], quests: record(s.quests, 'discover') }
    );
  }, []);

  const toggleIn = useCallback((list: 'favorites' | 'completed', game: Game) => {
    setState((s) => {
      const has = s[list].includes(game.id);
      const customGames = game.custom && !has ? { ...s.customGames, [game.id]: game } : s.customGames;
      const quests = has ? s.quests : record(s.quests, list === 'favorites' ? 'favorite' : 'finish');
      return { ...s, customGames, quests, [list]: has ? s[list].filter((id) => id !== game.id) : [...s[list], game.id] };
    });
  }, []);

  const set = useCallback(<K extends keyof ArcadeState>(key: K, value: ArcadeState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const mergeIn = useCallback((remote: Partial<ArcadeState>) => {
    setState((s) => mergeStates(s, remote));
  }, []);

  return { state, discover, toggleIn, unlock, set, mergeIn, track, buy };
}
