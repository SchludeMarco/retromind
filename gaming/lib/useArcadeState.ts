import { useCallback, useEffect, useRef, useState } from 'react';
import { Game } from '../data/games';
import { hasMuteChoice, setMuted } from '../../lib/mute';
import { DEFAULT_TRACK, TrackId, isTrackId } from './tracks';
import { ActiveQuest, activeQuests, freshLog, mergeLogs, PRIZES, QuestEvent, QuestLog, record } from './quests';
import { Egg, EGGS } from './eggs';
import { tr } from '../../lib/i18n';

// Everything the Gaming edition remembers between visits, in localStorage
// only (separate key from the main RetroMind journey).

export type Palette = 'modul' | 'arcade' | 'gameboy' | 'amber' | 'vapor' | 'virtualboy';

export type MusicSource = 'spotify' | 'chip';
const isMusicSource = (v: unknown): v is MusicSource => v === 'spotify' || v === 'chip';

export interface ArcadeState {
  favorites: string[];
  completed: string[];
  discovered: string[];
  achievements: string[];
  /** Searched games that were added to the collection, keyed by id. */
  customGames: Record<string, Game>;
  palette: Palette;
  music: boolean;
  /** Hall music: the 80s metal playlist from Spotify, or the chiptune tunes. */
  musicSource: MusicSource;
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
  /** Easter eggs found (eggs.ts); each paid its tokens once. */
  eggs: string[];
  /** The rainbow logo from the prize counter, switched on. */
  partyLogo: boolean;
  /** "Had it back then": games and systems the player really owned as a kid. */
  hadBack: string[];
  hadSystems: string[];
}

/** 2 = the "Modul" design from Google Stitch (PR #93), 3 = dark "Arcade" as default again. */
const DESIGN_REV = 3;
const DEFAULT_PALETTE: Palette = 'arcade';

const KEY = 'retromind.gaming.v1';

const DEFAULTS: ArcadeState = {
  favorites: [],
  completed: [],
  discovered: [],
  achievements: [],
  customGames: {},
  palette: DEFAULT_PALETTE,
  music: true,
  musicSource: 'spotify',
  track: DEFAULT_TRACK,
  sfx: true,
  hiScore: 0,
  designRev: DESIGN_REV,
  tokens: 0,
  owned: [],
  quests: freshLog(undefined),
  eggs: [],
  partyLogo: false,
  hadBack: [],
  hadSystems: [],
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
    if (!(saved.designRev >= DESIGN_REV)) state = { ...state, palette: DEFAULT_PALETTE, designRev: DESIGN_REV };
    state = { ...state, quests: freshLog(state.quests) };
    if (!isMusicSource(state.musicSource)) state = { ...state, musicSource: DEFAULTS.musicSource };
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
    musicSource: isMusicSource(remote.musicSource) ? remote.musicSource : local.musicSource,
    track: isTrackId(remote.track) ? remote.track : local.track,
    sfx: remote.sfx ?? local.sfx,
    // Tokens can't be told apart per device, so the larger balance wins.
    tokens: Math.max(local.tokens, remote.tokens ?? 0),
    owned: union(local.owned, remote.owned),
    quests: mergeLogs(local.quests, remote.quests),
    eggs: union(local.eggs, remote.eggs),
    partyLogo: remote.partyLogo ?? local.partyLogo,
    hadBack: union(local.hadBack, remote.hadBack),
    hadSystems: union(local.hadSystems, remote.hadSystems),
  };
}

export interface Achievement {
  id: string;
  title: string;
  text: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-coin', title: tr('First Quarter', 'Erste Münze'), text: tr('Dropped your first quarter. You’re on a roll!', 'Erste Münze eingeworfen. Läuft bei dir!') },
  { id: 'explorer-5', title: tr('Treasure Hunter', 'Schatzsucher'), text: tr('Rediscovered 5 games. Nice!', '5 Games wiederentdeckt. Nice!') },
  { id: 'explorer-15', title: tr('Video Store Pro', 'Videothek-Profi'), text: tr('Rediscovered 15 games. Absolutely goated.', '15 Games wiederentdeckt. Absolut goated.') },
  { id: 'collector', title: tr('Collector', 'Sammler'), text: tr('First game in your stash. Obviously.', 'Erstes Game im Stash. Ehrensache.') },
  { id: 'finisher', title: tr('Saw the Credits', 'Abspann gesehen'), text: tr('Beat a game. GG!', 'Ein Game durchgezockt. GG!') },
  { id: 'digger', title: tr('Bargain Bin', 'Grabbelkiste'), text: tr('Dug around beyond the catalog. A true crate digger.', 'Abseits des Katalogs gewühlt. Echter Digger.') },
  { id: 'chill', title: tr('Chill Mode', 'Chillmodus'), text: tr('Beat a minigame in the Chill Zone. Relaxed!', 'Ein Minispiel in der Chill-Ecke geschafft. Entspannt!') },
  { id: 'konami', title: '↑↑↓↓←→←→BA', text: tr('Entered the most famous cheat in the world. Old-school legend!', 'Den berühmtesten Cheat der Welt eingegeben. Oldschool-Legende!') },
];

/** Score = what a player would see on the HUD; a playful progress number. */
export function scoreOf(s: ArcadeState) {
  return s.discovered.length * 100 + s.favorites.length * 250 + s.completed.length * 500 + s.achievements.length * 1000;
}

export function useArcadeState(
  onAchievement: (a: Achievement) => void,
  onQuest: (q: ActiveQuest) => void,
  onEgg: (e: Egg) => void
) {
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

  /** Marks an easter egg as found and pays its tokens, once per profile. */
  const findEgg = useCallback(
    (id: string) => {
      const egg = EGGS.find((e) => e.id === id);
      const s = stateRef.current;
      if (!egg || s.eggs.includes(id)) return;
      stateRef.current = { ...s, eggs: [...s.eggs, id], tokens: s.tokens + egg.reward };
      setState((x) => (x.eggs.includes(id) ? x : { ...x, eggs: [...x.eggs, id], tokens: x.tokens + egg.reward }));
      onEgg(egg);
    },
    [onEgg]
  );

  /** Coins won outside the quests (the game quiz). */
  const earn = useCallback((n: number) => {
    stateRef.current = { ...stateRef.current, tokens: stateRef.current.tokens + n };
    setState((s) => ({ ...s, tokens: s.tokens + n }));
  }, []);

  const discover = useCallback((game: Game) => {
    setState((s) =>
      s.discovered.includes(game.id)
        ? s
        : { ...s, discovered: [...s.discovered, game.id], quests: record(s.quests, 'discover') }
    );
  }, []);

  const toggleIn = useCallback((list: 'favorites' | 'completed' | 'hadBack', game: Game) => {
    setState((s) => {
      const has = s[list].includes(game.id);
      const customGames = game.custom && !has ? { ...s.customGames, [game.id]: game } : s.customGames;
      const quests = has || list === 'hadBack' ? s.quests : record(s.quests, list === 'favorites' ? 'favorite' : 'finish');
      return { ...s, customGames, quests, [list]: has ? s[list].filter((id) => id !== game.id) : [...s[list], game.id] };
    });
  }, []);

  const set = useCallback(<K extends keyof ArcadeState>(key: K, value: ArcadeState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
  }, []);

  const mergeIn = useCallback((remote: Partial<ArcadeState>) => {
    setState((s) => mergeStates(s, remote));
  }, []);

  return { state, discover, toggleIn, unlock, set, mergeIn, track, buy, findEgg, earn };
}
