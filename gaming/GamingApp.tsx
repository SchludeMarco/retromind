import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DECADES, Game, GAMES, PLATFORM_COLORS } from './data/games';
import { HallTicker } from './components/HallTicker';
import { KIND_ICON, PLATFORMS, platformInfo, platformLabel } from './data/platforms';
import { archiveSupports, fetchArchive, searchArchive } from './lib/archive';
import { chip } from './lib/chiptune';
import { searchGames } from './lib/wiki';
import { PixelCover } from './components/PixelCover';
import { DayGame, fetchOnThisDay } from './lib/onThisDay';
import { useControls } from './lib/useControls';
import { Achievement, ACHIEVEMENTS, scoreOf, useArcadeState } from './lib/useArcadeState';
import { Entrance } from './components/Entrance';
import { GamingControls, GamingHandle } from './components/ControlHandle';
import { CartInsert } from './components/CartInsert';
import { CoinDrop } from './components/CoinDrop';
import { ATTRACT_AFTER_MS, AttractMode } from './components/AttractMode';
import { MuncherWander } from './components/MuncherWander';
import { GameDetail } from './components/GameDetail';
import { GuruChat } from './components/GuruChat';
import { ConsolePicker } from './components/ConsolePicker';
import { Settings } from './components/Settings';
import { Feedback } from './components/Feedback';
import { MINI_GAMES, MiniGameCorner, MiniGameDialog, MiniGameId } from './components/MiniGames';
import { EmulatorCorner } from './components/EmulatorCorner';
import { EmulatorDialog } from './components/EmulatorDialog';
import { EmuLaunch } from './lib/emulator';
import { countOpened } from '../lib/usage';
import { promptInstall, useInstall } from '../lib/install';
import { readPage, writePage } from '../lib/pageMemory';
import { useCloudSync } from './lib/useCloudSync';
import { useHallSpotify } from './lib/useHallSpotify';
import { useSpotifyAuth } from '../hooks/useSpotifyAuth';
import { SpotifyAsk } from './components/SpotifyAsk';
import { MusicDock, openMusicDock } from '../components/MusicDock';
import { QuestBoard } from './components/QuestBoard';
import { ActiveQuest, PRIZES } from './lib/quests';
import { asksMeaningOfLife, cheatFor, Egg } from './lib/eggs';
import { toggleMuted, useMuted, withMuteParam } from '../lib/mute';
import { withGoogleParam } from '../lib/googleLogin';
import { IMPRINT_URL, PRIVACY_URL, setConsent } from '../lib/privacy';
import { findSoundtrack, useAutoTheme, useSpotifyApi } from '../lib/spotifyApi';
import { scrollToTop, useScrolledDown } from '../hooks/useScrolledDown';
import { LANG, LOCALE, tr } from '../lib/i18n';

type View = 'catalog' | 'collection' | 'search' | 'trophies' | 'chill' | 'quests';


const pad = (n: number, len = 6) => String(n).padStart(len, '0');
// 'Fundstück' is the platform id for loose search finds (matched in lib/); only its label is translated.

/** The first sentences that fit a short teaser, so cards never stop mid-word. */
const teaser = (text: string, max = 120) => {
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [text];
  let out = '';
  for (const s of sentences) {
    if (out && (out + s).length > max) break;
    out += s;
  }
  return out.trim();
};

const Cartridge: React.FC<{ game: Game; fav: boolean; done: boolean; onOpen: () => void }> = ({ game, fav, done, onOpen }) => (
  <button
    className="cart has-cover"
    onClick={onOpen}
    data-nav
    style={{ ['--label' as string]: PLATFORM_COLORS[game.platform] ?? 'var(--a1)' }}
    aria-label={`${game.title}, ${platformLabel(game.platform)}${game.year ? `, ${game.year}` : ''}`}
  >
    <span className="cart-badges" aria-hidden="true">
      {fav && '★'}
      {done && '✓'}
    </span>
    <span className="cart-cover" aria-hidden="true">
      <PixelCover game={game} showText={false} />
    </span>
    <span className="cart-label">
      <span className="cart-meta">
        {platformLabel(game.platform)}
        {game.year ? ` · ${game.year}` : ''}
      </span>
      <span className="cart-title">{game.title}</span>
      {game.blurb && <span className="cart-blurb">{teaser(game.blurb)}</span>}
    </span>
  </button>
);

// Blinking lights on the cabinets in the hall picture, spread over its middle.
const HALL_LIGHTS = Array.from({ length: 12 }, (_, i) => ({
  x: 6 + ((i * 37) % 88),
  y: 22 + ((i * 53) % 55),
  c: ['#ff3b6b', '#3bd5ff', '#ffd84a', '#7cff6b'][i % 4],
  d: 2.2 + (i % 5) * 0.7,
  delay: (i * 0.9) % 4,
}));

// How long an Easter egg or badge note stays up.
const TOAST_MS = 12000;

// Where this tab was before a reload (hall or street, tab, filters, open game).
const PAGE_KEY = 'retromind-gaming.page';
type OpenPage = {
  screen: 'power' | 'hub';
  view: View;
  decade: string | null;
  year: number | null;
  platform: string | null;
  selected: Game | null;
  query: string;
  results: Game[] | null;
};

export const GamingApp: React.FC = () => {
  const scrolledDown = useScrolledDown();
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const reloaded = useMemo(() => readPage<OpenPage>(PAGE_KEY) ?? {}, []);
  const [screen, setScreen] = useState<'power' | 'hub'>(reloaded.screen === 'hub' ? 'hub' : 'power');
  // After the door the hub comes up out of the white picture.
  const [fromDoor, setFromDoor] = useState(false);
  const [toast, setToast] = useState<{ title: string; text: string; icon?: string; xbox?: boolean } | null>(null);
  const [rainbow, setRainbow] = useState(false);

  const showToast = useCallback((title: string, text: string, icon?: string, xbox?: boolean) => {
    setToast({ title, text, icon, xbox });
  }, []);
  // Found an egg or a badge: the note stays long enough to read it (Marco,
  // 2026-10-08: 3.8 s was far too short) and the x closes it earlier.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [toast]);

  const onAchievement = useCallback(
    (a: Achievement) => {
      // Like on a console: the round trophy pops up at the bottom with its "plopp".
      chip.play('plopp');
      showToast(tr('Achievement unlocked', 'Erfolg freigeschaltet'), a.title, '🏆', true);
    },
    [showToast]
  );
  const onQuest = useCallback(
    (q: ActiveQuest) => {
      chip.play('coin');
      showToast(tr(`QUEST COMPLETE: +${q.reward} COINS`, `QUEST GESCHAFFT: +${q.reward} COINS`), q.text, '🪙');
    },
    [showToast]
  );
  const onEgg = useCallback(
    (e: Egg) => {
      chip.play('powerup');
      showToast(tr(`EASTER EGG: ${e.title.toUpperCase()} · +${e.reward} COINS`, `EASTER EGG: ${e.title.toUpperCase()} · +${e.reward} COINS`), e.text, '🥚');
    },
    [showToast]
  );
  // The daily streak is counted at start but announced once the player is in the hall.
  const [streakNews, setStreakNews] = useState<{ days: number; coins: number; forgiven: boolean } | null>(null);
  const onStreak = useCallback((days: number, coins: number, forgiven: boolean) => setStreakNews({ days, coins, forgiven }), []);
  const { state, discover, toggleIn, unlock, set, track, buy, findEgg, earn } = useArcadeState(onAchievement, onQuest, onEgg, onStreak);
  const cloud = useCloudSync();
  // Easter eggs that count taps within one visit (eggs.ts).
  const [flicker, setFlicker] = useState(false);
  const eggCounts = useRef({ logo: 0, logoAt: 0, coins: 0, colors: 0 });
  useEffect(() => {
    if (screen !== 'hub' || !streakNews) return;
    const { days, coins, forgiven } = streakNews;
    setStreakNews(null);
    chip.play('coin');
    showToast(
      days === 1 ? tr(`DAILY VISIT: +${coins} COINS`, `TAGESBESUCH: +${coins} COINS`) : tr(`${days}-DAY STREAK: +${coins} COINS`, `${days} TAGE IN FOLGE: +${coins} COINS`),
      forgiven
        ? tr('You missed a day, but one per week is forgiven. Come back tomorrow and the streak grows.', 'Einen Tag hast du verpasst, aber einer pro Woche wird verziehen. Komm morgen wieder, dann wächst die Serie.')
        : days === 1
          ? tr('Come back tomorrow: every day in a row pays more, up to 30 Coins, and every 7th day 25 extra.', 'Komm morgen wieder: Jeder Tag in Folge bringt mehr, bis zu 30 Coins, und jeder 7. Tag 25 extra.')
          : tr(`Every day in a row pays more. Your best: ${state.streak?.best ?? days} days.`, `Jeder Tag in Folge bringt mehr. Dein Rekord: ${state.streak?.best ?? days} Tage.`),
      '🔥'
    );
  }, [screen, streakNews, showToast, state.streak?.best]);
  // "Nachteule": in the hall between midnight and four in the morning.
  useEffect(() => {
    if (screen === 'hub' && new Date().getHours() < 4) findEgg('night');
  }, [screen, findEgg]);
  const tapLogo = () => {
    const c = eggCounts.current;
    const now = Date.now();
    c.logo = now - c.logoAt < 1200 ? c.logo + 1 : 1;
    c.logoAt = now;
    if (c.logo < 5) return;
    c.logo = 0;
    chip.play('error');
    setFlicker(true);
    setTimeout(() => setFlicker(false), 1300);
    findEgg('logo');
  };
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const [view, setView] = useState<View>(reloaded.view ?? 'catalog');
  const [decade, setDecade] = useState<string | null>(reloaded.decade ?? null);
  // A single year inside the chosen decade narrows the filter further.
  const [year, setYear] = useState<number | null>(reloaded.year ?? null);
  const [platform, setPlatform] = useState<string | null>(reloaded.platform ?? null);
  const [query, setQuery] = useState(reloaded.query ?? '');
  const [results, setResults] = useState<Game[] | null>(reloaded.results ?? null);
  const [searching, setSearching] = useState(false);
  const [searchMore, setSearchMore] = useState<{
    term: string;
    total: number;
    next: number | null;
    loading: boolean;
    /** true once the list has moved on to games that only mention the term. */
    related: boolean;
    /** The headline over the results, fixed when the search runs. */
    label: string;
  }>({ term: '', total: 0, next: null, loading: false, related: false, label: '' });
  const [selected, setSelected] = useState<Game | null>(reloaded.selected ?? null);
  const [guruOpen, setGuruOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [miniGame, setMiniGame] = useState<MiniGameId | null>(null);
  const [emu, setEmu] = useState<EmuLaunch | null>(null);
  const [emuRunning, setEmuRunning] = useState(false);
  const [rolling, setRolling] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState(true);
  // Browsers that support installing web apps hand us a prompt to trigger later (lib/install.ts).
  const { canPrompt: installPrompt } = useInstall();
  const install = async () => {
    chip.play('powerup');
    await promptInstall();
  };

  // Sound settings follow the saved state.
  useEffect(() => {
    chip.sfxEnabled = state.sfx;
  }, [state.sfx]);
  useEffect(() => {
    chip.musicEnabled = state.music;
  }, [state.music]);
  // The speaker switch is shared by all RetroMind modules (lib/mute).
  const muted = useMuted();
  useEffect(() => {
    chip.muted = muted;
  }, [muted]);
  const toggleMute = toggleMuted;
  // Browser bar matches the light "Modul" design or the dark screens.
  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', state.palette === 'modul' ? '#e5e7eb' : '#07071a');
  }, [state.palette]);
  // A new pick in the settings restarts the hub music with that tune.
  // A YouTube video on a game page pauses the music until it stops.
  const [videoOn, setVideoPlaying] = useState(false);
  // The hall music also rests while the emulator plays.
  const videoPlaying = videoOn || emuRunning;
  // In the hall the 80s metal playlist from Spotify plays instead of the
  // chiptune tunes, once Spotify is allowed (useHallSpotify).
  // Optional Spotify login: with Premium the hall music fades in
  // (lib/spotifyPremium). It also picks up Spotify's redirect back here.
  const spotifyAuth = useSpotifyAuth();
  // Without Premium at the door, the metal intro plays first when you walk
  // in, then Spotify takes over (Marco, 2026-10-07).
  const [introRunning, setIntroRunning] = useState(false);
  const spotify = useHallSpotify(
    state.musicSource === 'spotify',
    screen === 'hub' && state.music && !videoPlaying && !introRunning,
    screen === 'power' && state.music,
    spotifyAuth.status === 'signed_in' && spotifyAuth.user?.product === 'premium'
  );
  useEffect(() => {
    if (screen !== 'hub' || !spotify.active || !state.music || videoPlaying) return;
    // The entrance queues the intro unless the song already played outside.
    if (!chip.introQueued) return;
    if (chip.startIntro(() => setIntroRunning(false))) setIntroRunning(true);
  }, [screen, spotify.active, state.music, videoPlaying]);
  useEffect(() => {
    if (introRunning && (!state.music || videoPlaying)) {
      chip.stopIntro();
      setIntroRunning(false);
    }
  }, [introRunning, state.music, videoPlaying]);
  // Music to the topic (Marco, 2026-10-07): signed in with Spotify, a game
  // page plays the game's soundtrack if Spotify has one; closing it goes
  // back to the hall's metal. Switch: "Musik zum Thema" in the player panel.
  const spotifyApi = useSpotifyApi();
  const autoTheme = useAutoTheme();
  const spotifyRef = useRef(spotify);
  spotifyRef.current = spotify;
  useEffect(() => {
    if (!selected || !spotifyApi || !autoTheme || !spotifyRef.current.active) return;
    // Something picked in the search keeps playing.
    const picked = spotifyRef.current.special;
    if (picked && !picked.auto) return;
    let live = true;
    findSoundtrack(selected.title).then((hit) => {
      if (live && hit) spotifyRef.current.playUri(hit, true);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, spotifyApi, autoTheme]);
  useEffect(() => {
    if (!selected && spotifyRef.current.special?.auto) spotifyRef.current.backToTheme();
  }, [selected]);
  // When Spotify stays silent, the own tunes stand in (useHallSpotify's
  // watchdog), so the hall is never quiet (Marco, 2026-10-13).
  const ownMusic = !spotify.active || (spotify.fallback && !spotify.paused);
  useEffect(() => {
    chip.track = state.track;
    if (screen === 'hub') chip.setMusic(state.music && !videoPlaying && !introRunning && ownMusic);
    return () => chip.stopMusic();
  }, [screen, state.music, state.track, videoPlaying, introRunning, ownMusic]);
  // Phones suspend the sound when the screen locks, a call comes in or the
  // app goes to the background; the entrance's wake-up listeners are gone in
  // the hall, so the sound is woken here again on return and on every tap.
  useEffect(() => {
    if (screen !== 'hub') return;
    const wake = () => chip.unlock();
    const onVisible = () => {
      if (document.visibilityState === 'visible') wake();
    };
    const events = ['pointerdown', 'touchend', 'keydown', 'click'];
    events.forEach((e) => window.addEventListener(e, wake, true));
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', wake);
    return () => {
      events.forEach((e) => window.removeEventListener(e, wake, true));
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', wake);
    };
  }, [screen]);

  // Ask the server once whether the AI key is configured.
  useEffect(() => {
    fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ping', lang: LANG }),
    })
      .then((r) => setAiAvailable(r.ok))
      .catch(() => setAiAvailable(false));
  }, []);

  // The game page itself; `from` is the side a swiped-in game slides from.
  const [slideFrom, setSlideFrom] = useState<'left' | 'right' | null>(null);
  const show = useCallback(
    (game: Game) => {
      discover(game);
      track('open');
      countOpened('gaming', 'game', game.title);
      setSelected(game);
    },
    [discover, track]
  );
  // A tapped card first slides into the console slot (CartInsert).
  const [inserting, setInserting] = useState<Game | null>(null);
  const open = useCallback(
    (game: Game) => {
      chip.play('select');
      setSlideFrom(null);
      if (reducedMotion) show(game);
      else setInserting(game);
    },
    [show, reducedMotion]
  );
  const insertDone = () => {
    if (inserting) show(inserting);
    setInserting(null);
  };
  const closeDetail = useCallback(() => {
    chip.play('back');
    setSelected(null);
  }, []);

  useControls({
    onMove: () => chip.play('blip'),
    onBack: () => {
      if (selected) closeDetail();
      else if (miniGame) setMiniGame(null);
      else if (pickerOpen) setPickerOpen(false);
      else if (guruOpen) setGuruOpen(false);
    },
    onKonami: () => {
      unlock('konami');
      findEgg('konami');
      chip.play('powerup');
      showToast(tr('+30 LIVES', '+30 LEBEN'), tr('Cheat activated. Totally rad, Player 1. Legend!', 'Cheat aktiviert. Voll krass, Player 1. Ehrenmann!'));
      setRainbow(true);
      setTimeout(() => setRainbow(false), 6000);
    },
  });

  const collection = useMemo(() => {
    const ids = Array.from(new Set([...state.favorites, ...state.completed]));
    return ids.map((id) => GAMES.find((g) => g.id === id) ?? state.customGames[id]).filter(Boolean) as Game[];
  }, [state.favorites, state.completed, state.customGames]);
  // The "had it back then" shelf next to the stash.
  const [shelf, setShelf] = useState<'stash' | 'hadback'>('stash');
  const hadBackGames = useMemo(
    () => state.hadBack.map((id) => GAMES.find((g) => g.id === id) ?? state.customGames[id]).filter(Boolean) as Game[],
    [state.hadBack, state.customGames]
  );

  // The years the filter covers: one year, a decade, or none (all of them).
  const yearRange = useMemo(() => {
    if (year) return { from: year, to: year };
    const d = DECADES.find((x) => x.id === decade);
    return d ? { from: d.from, to: d.to } : null;
  }, [decade, year]);
  const decadeYears = useMemo(() => {
    const d = DECADES.find((x) => x.id === decade);
    if (!d) return [];
    const last = Math.min(d.to, new Date().getFullYear());
    return Array.from({ length: last - d.from + 1 }, (_, i) => d.from + i);
  }, [decade]);

  const catalog = useMemo(
    () => GAMES.filter((g) => (!yearRange || (g.year >= yearRange.from && g.year <= yearRange.to)) && (!platform || g.platform === platform)),
    [yearRange, platform]
  );

  // Every system from the platform list, in release order, plus any the
  // curated catalog uses on top (e.g. Multiplattform).
  const platforms = useMemo(
    () => [...PLATFORMS.map((p) => p.id), ...Array.from(new Set(GAMES.map((g) => g.platform))).filter((p) => !PLATFORMS.some((x) => x.id === p))],
    []
  );

  // The live archive fills a filter with everything Wikipedia lists for it.
  const [archive, setArchive] = useState<{ key: string; games: Game[]; total: number; next: number | null; loading: boolean }>({
    key: '',
    games: [],
    total: 0,
    next: null,
    loading: false,
  });
  const archiveQuery = useMemo(() => {
    // With no filter at all, the archive spans the edition's whole era.
    const range = yearRange ?? (platform ? null : { from: 1980, to: new Date().getFullYear() });
    return { platform, decade: range };
  }, [yearRange, platform]);
  const archiveKey = `${platform}|${decade}|${year}`;
  useEffect(() => {
    if (view !== 'catalog' || !archiveSupports(archiveQuery)) return;
    let alive = true;
    setArchive({ key: archiveKey, games: [], total: 0, next: null, loading: true });
    fetchArchive(archiveQuery, 0).then((page) => {
      if (alive) setArchive({ key: archiveKey, games: page.games, total: page.total, next: page.nextOffset, loading: false });
    });
    return () => {
      alive = false;
    };
  }, [archiveKey, archiveQuery, view]);
  const loadMore = async () => {
    if (archive.next === null || archive.loading) return;
    chip.play('coin');
    const key = archiveKey;
    setArchive((a) => ({ ...a, loading: true }));
    const page = await fetchArchive(archiveQuery, archive.next);
    setArchive((a) =>
      a.key !== key ? a : { ...a, games: [...a.games, ...page.games], next: page.nextOffset, loading: false }
    );
  };
  const archiveShown = useMemo(() => {
    if (archive.key !== archiveKey) return [];
    const curated = new Set(catalog.map((g) => g.wiki));
    const seen = new Set<string>();
    return archive.games.filter((g) => !curated.has(g.wiki) && !seen.has(g.wiki) && seen.add(g.wiki));
  }, [archive, archiveKey, catalog]);
  const archiveActive = view === 'catalog' && archiveSupports(archiveQuery);

  // INSERT COIN: titles spin like a slot machine, then a random game opens —
  // preferring ones the player hasn't discovered yet.
  const rollingTimer = useRef<number | null>(null);
  const insertCoin = () => {
    if (rolling) return;
    chip.play('coin');
    unlock('first-coin');
    track('coin');
    if (++eggCounts.current.coins >= 10) findEgg('coins');
    const fresh = GAMES.filter((g) => !state.discovered.includes(g.id));
    const pool = fresh.length ? fresh : GAMES;
    const winner = pool[Math.floor(Math.random() * pool.length)];
    let ticks = reducedMotion ? 0 : 14;
    const spin = () => {
      if (ticks-- <= 0) {
        setRolling(null);
        open(winner);
        return;
      }
      setRolling(GAMES[Math.floor(Math.random() * GAMES.length)].title);
      chip.play('blip');
      rollingTimer.current = window.setTimeout(spin, 70 + (14 - ticks) * 12);
    };
    spin();
  };
  useEffect(() => () => {
    if (rollingTimer.current) clearTimeout(rollingTimer.current);
  }, []);

  // A hit we already curated opens with its tips and German teaser.
  const withCurated = (g: Game) => GAMES.find((c) => c.wiki === g.wiki) ?? g;

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    // Old cheat codes typed into the search find an easter egg instead.
    const cheat = cheatFor(q);
    if (cheat) {
      setQuery('');
      findEgg(cheat);
      return;
    }
    chip.play('select');
    unlock('digger');
    track('search');
    setView('search');
    setSearching(true);
    // Games with the words in their title first; games that merely mention
    // them come on request, and the plain article search is only the
    // fallback for names Wikipedia files without a game infobox.
    let related = false;
    let page = await searchArchive(q);
    if (!page.games.length) {
      related = true;
      page = await searchArchive(q, 0, true);
    }
    let hits = page.games.map(withCurated);
    if (!hits.length) {
      hits = (await searchGames(q)).map((h) =>
        withCurated({
          id: `wiki:${h.title}`,
          title: h.title.replace(/ \((\d{4} )?video game\)$/i, ''),
          year: 0,
          platform: 'Fundstück',
          developer: '',
          genre: tr('from the bargain bin', 'aus der Grabbelkiste'),
          wiki: h.title,
          blurb: h.snippet,
          custom: true,
        })
      );
    }
    setSearching(false);
    setResults(hits);
    const total = page.total || hits.length;
    const n = total.toLocaleString(LOCALE);
    const label = !page.games.length
      ? tr(`${n} ${total === 1 ? 'hit' : 'hits'} for “${q}”. Nice!`, `${n} Treffer zu „${q}“. Nice!`)
      : related
        ? tr(`No game goes by that name, but ${n} mention “${q}”. Lowkey interesting too.`, `Kein Game heißt so, aber ${n} erwähnen „${q}“. Lowkey auch spannend.`)
        : tr(`${n} ${total === 1 ? 'game' : 'games'} with “${q}” in the title. Sweet!`, `${n} ${total === 1 ? 'Game' : 'Games'} mit „${q}“ im Titel. Läuft!`);
    setSearchMore({ term: q, total, next: page.nextOffset, loading: false, related, label });
    chip.play(hits.length ? 'powerup' : 'error');
  };

  const loadMoreResults = async () => {
    if ((searchMore.next === null && searchMore.related) || searchMore.loading) return;
    chip.play('coin');
    const { term } = searchMore;
    // Past the last title match, continue with the games that mention it.
    const related = searchMore.related || searchMore.next === null;
    const next = searchMore.next ?? 0;
    setSearchMore((m) => ({ ...m, loading: true }));
    const page = await searchArchive(term, next, related);
    setResults((r) => {
      const seen = new Set((r ?? []).map((g) => g.wiki));
      return [...(r ?? []), ...page.games.map(withCurated).filter((g) => !seen.has(g.wiki))];
    });
    setSearchMore((m) => (m.term !== term ? m : { ...m, next: page.nextOffset, loading: false, related }));
  };

  // Opening the Chill-Ecke (also from the dock) brings its games into view.
  useEffect(() => {
    if (view !== 'chill') return;
    const btn = document.querySelector('.chill-btn');
    if (btn) btn.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [view, reducedMotion]);

  // A reload keeps this page (Marco, 2026-10-13); only the search keeps its hits.
  useEffect(() => {
    writePage(PAGE_KEY, {
      screen,
      view,
      decade,
      year,
      platform,
      selected,
      query,
      results: view === 'search' ? results : null,
    } satisfies OpenPage);
  }, [screen, view, decade, year, platform, selected, query, results]);

  // Out of the hall again: the game closes, the music stops and the
  // entrance with the muffled bass from inside is back.
  const leaveClub = () => {
    chip.play('select');
    chip.stopIntro();
    setIntroRunning(false);
    setSelected(null);
    setVideoPlaying(false);
    setFromDoor(false);
    setScreen('power');
    window.scrollTo(0, 0);
  };

  const switchView = (v: View) => {
    chip.play('blip');
    setView(v);
  };

  // Settings changes; switching the screen color 8 times finds an egg.
  const setFromSettings: typeof set = (key, value) => {
    set(key, value);
    if (key === 'palette' && value !== state.palette && ++eggCounts.current.colors >= 8) findEgg('colors');
  };

  const score = scoreOf(state);
  // Shelves list games oldest first; games without a known year go last.
  // Search results keep their relevance order.
  const byYear = (list: Game[]) => [...list].sort((a, b) => (a.year || 9999) - (b.year || 9999));
  const shown: Game[] = useMemo(
    () =>
      view === 'catalog'
        ? byYear([...catalog, ...archiveShown])
        : view === 'collection'
          ? byYear(shelf === 'hadback' ? hadBackGames : collection)
          : view === 'search'
            ? results ?? []
            : [],
    [view, catalog, archiveShown, shelf, hadBackGames, collection, results]
  );

  // Swiping on the game page flips through the cards the way they are shown,
  // like browsing a shelf.
  const neighbor = (dir: 1 | -1): Game | undefined => {
    if (!selected) return undefined;
    const i = shown.findIndex((g) => g.id === selected.id);
    return i < 0 ? undefined : shown[i + dir];
  };
  const browse = (dir: 1 | -1) => {
    const g = neighbor(dir);
    if (!g) return;
    chip.play('blip');
    setSlideFrom(dir === 1 ? 'right' : 'left');
    show(g);
  };

  // "Today X years ago": a game released on this date, once per visit.
  const [dayGame, setDayGame] = useState<DayGame | null>(null);
  useEffect(() => {
    if (screen !== 'hub') return;
    let alive = true;
    fetchOnThisDay().then((list) => alive && setDayGame(list[0] ?? null));
    return () => {
      alive = false;
    };
  }, [screen]);
  const play = (launch: EmuLaunch) => {
    chip.play('select');
    countOpened('gaming', 'minigame', `EMULATOR: ${'rom' in launch ? launch.title : 'eigene Datei'}`);
    setEmu(launch);
  };

  const openDayGame = () => {
    if (!dayGame) return;
    const title = dayGame.wiki.replace(/ \((\d{4} )?video game\)$/i, '');
    open(
      withCurated({
        id: `wiki:${dayGame.wiki}`,
        title,
        year: dayGame.year,
        platform: 'Fundstück',
        developer: '',
        genre: tr('released on this day', 'heute vor Jahren erschienen'),
        wiki: dayGame.wiki,
        custom: true,
      })
    );
  };

  // Attract mode: a minute without input in the hall and the covers run by.
  const [attract, setAttract] = useState(false);
  const attractAllowed = screen === 'hub' && !selected && !inserting && !miniGame && !emu && !videoPlaying && !settingsOpen && !feedbackOpen && !guruOpen && !pickerOpen;
  useEffect(() => {
    if (!attractAllowed || reducedMotion) return;
    let id = window.setTimeout(() => setAttract(true), ATTRACT_AFTER_MS);
    const reset = () => {
      clearTimeout(id);
      id = window.setTimeout(() => setAttract(true), ATTRACT_AFTER_MS);
    };
    const events = ['pointerdown', 'keydown', 'wheel', 'scroll', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(id);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [attractAllowed, reducedMotion]);

  return (
    <div
      className={`arcade${rainbow ? ' rainbow' : ''}${flicker ? ' flicker' : ''}${state.partyLogo && state.owned.includes('party') ? ' party' : ''}`}
      data-palette={state.palette}
    >
      <div className="stars" aria-hidden="true" />
      {/* Off-screen, always mounted: Spotify's player for the hall music. */}
      {/* Spotify swaps the ref'd element for its own iframe, so the hiding
          sits on a wrapper around it (gaming.css .spotify-host). */}
      <div aria-hidden="true" className="spotify-host">
        <div ref={spotify.containerRef} />
      </div>
      {screen === 'hub' && (
        // Inside the hall: Marco's picture of the arcade (Nano Banana), toned
        // down behind the UI. On wide screens a blurred copy fills the sides.
        <div className="hall-bg" aria-hidden="true">
          <img className="hb-photo" src="/gaming/arcade-innen.webp" alt="" />
          <div className="hb-tint" />
          {/* The cabinets' lights keep blinking behind the catalog. */}
          <div className="hb-lights">
            {HALL_LIGHTS.map((l, i) => (
              <span
                key={i}
                style={{ left: `${l.x}%`, top: `${l.y}%`, ['--c' as string]: l.c, ['--d' as string]: `${l.d}s`, ['--delay' as string]: `${-l.delay}s` }}
              />
            ))}
          </div>
        </div>
      )}
      {screen === 'hub' && <MuncherWander onCatch={() => findEgg('pacman')} />}

      {screen === 'power' ? (
        <Entrance
          reducedMotion={reducedMotion}
          muted={muted}
          music={state.music}
          doorSong={spotify.doorSong}
          onToggleMute={toggleMute}
          cloud={cloud}
          spotifyAuth={spotifyAuth}
          onEnter={() => {
            setScreen('hub');
            setFromDoor(!reducedMotion);
          }}
        />
      ) : (
        <main className="hub">
          <header className="hud pixel-font">
            <h1 className="brand rgb-split" onClick={tapLogo}>
              <img className="brand-motif" src="/gaming/motif.webp" alt="" />
              RETROMIND
              <small>GAMING</small>
            </h1>
            {cloud.status === 'signed_in' && cloud.user?.name && (
              <div>
                <span className="label">PLAYER</span> <span className="value">{cloud.user.name.split(' ')[0].toUpperCase()}</span>
              </div>
            )}
            {/* Spielmarken from the quests; a tap opens the quests and the prize counter. */}
            <button
              className="hud-tokens"
              onClick={() => switchView('quests')}
              aria-label={tr(
                `${state.tokens} Coins${cloud.status === 'signed_in' ? '' : ', only saved on this device'}, go to quests, Easter eggs and the prize counter`,
                `${state.tokens} Coins${cloud.status === 'signed_in' ? '' : ', nur auf diesem Gerät gespeichert'}, zu den Quests, Easter Eggs und zum Preis-Tresen`
              )}
              title={cloud.status === 'signed_in' ? tr('Coins: to the prize counter', 'Coins: zum Preis-Tresen') : tr('Coins: only saved on this device. Sign in with Google to keep them safe.', 'Coins: nur auf diesem Gerät gespeichert. Mit Google anmelden, um sie zu sichern.')}
              data-nav
            >
              <span className="label">🪙 COINS</span>{' '}
              <span key={state.tokens} className="value bump">
                {state.tokens}
              </span>
              {cloud.status !== 'signed_in' && <span className="token-local">{tr('ONLY HERE', 'NUR HIER')}</span>}
            </button>
            <div className="hud-stats">
              {(state.streak?.count ?? 0) > 1 && (
                <span title={tr('Days in a row in the arcade', 'Tage in Folge in der Spielhalle')}>
                  <span className="label">🔥 {tr('STREAK', 'SERIE')}</span> <span className="value">{state.streak!.count}</span>
                </span>
              )}
              <span title={tr('Points for found games, stash and achievements', 'Punkte für entdeckte Games, Stash und Erfolge')}>
                <span className="label">SCORE</span> <span className="value">{pad(score)}</span>
              </span>
              <span>
                <span className="label">{tr('FOUND', 'ENTDECKT')}</span>{' '}
                <span className="value">
                  {state.discovered.filter((id) => GAMES.some((g) => g.id === id)).length}/{GAMES.length}
                </span>
              </span>
            </div>
          </header>

          {/* Only search and the coin slot up here; the sections live in the
              dock at the bottom, music, SFX and colors in the settings. */}
          <div className="toolbar top-bar">
            <form className="search" onSubmit={runSearch} role="search">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tr('Which game, dude? e.g. Rayman, Golden Axe …', 'Welches Game, Digga? z. B. Rayman, Golden Axe …')}
                aria-label={tr('Search for a game', 'Spiel suchen')}
                data-nav
              />
              <button className="px-btn" type="submit" data-nav>
                GO!
              </button>
            </form>
            <CoinDrop
              onInsert={insertCoin}
              label={rolling ? `▶ ${rolling}` : tr('INSERT COIN · SURPRISE ME!', 'INSERT COIN · ÜBERRASCH MICH!')}
            />
            {results && view !== 'search' && (
              <button className="px-btn" onClick={() => switchView('search')} data-nav>
                {tr('◄ BACK TO SEARCH RESULTS', '◄ ZURÜCK ZU DEN SUCHERGEBNISSEN')}
              </button>
            )}
            {installPrompt && (
              <button className="px-btn" onClick={install} data-nav>
                {tr('⬇ GET THE APP', '⬇ ALS APP')}
              </button>
            )}
          </div>

          {dayGame && view === 'catalog' && (
            <button className="day-game" onClick={openDayGame} data-nav>
              <span className="pixel-font">
                {tr(`TODAY ${new Date().getFullYear() - dayGame.year} YEARS AGO`, `HEUTE VOR ${new Date().getFullYear() - dayGame.year} JAHREN`)}
              </span>
              <span>
                {dayGame.wiki.replace(/ \((\d{4} )?video game\)$/i, '')} {tr('came out', 'kam raus')} ({dayGame.year}) ►
              </span>
            </button>
          )}

          {/* The mini games: one of the sections in the dock. */}
          {view === 'chill' && (
            <div className="chill-panel">
              <EmulatorCorner onPlay={play} />
              <MiniGameCorner
                onPick={(id) => {
                  chip.play('select');
                  countOpened('gaming', 'minigame', MINI_GAMES.find((m) => m.id === id)?.statKey ?? id);
                  setMiniGame(id);
                }}
              />
            </div>
          )}

          {view === 'catalog' && (
            <>
            <div className="filters scroll-row" aria-label={tr('Decade and console', 'Jahrzehnt und Konsole')}>
              <button className="px-btn" aria-pressed={!decade && !platform} onClick={() => { setDecade(null); setYear(null); setPlatform(null); chip.play('blip'); }} data-nav>
                {tr('ALL', 'ALLE')}
              </button>
              {DECADES.map((d) => (
                <button
                  key={d.id}
                  className="px-btn"
                  aria-pressed={decade === d.id}
                  onClick={() => { setDecade(decade === d.id ? null : d.id); setYear(null); chip.play('blip'); }}
                  data-nav
                >
                  {d.label.toUpperCase()}
                </button>
              ))}
              <button
                className="px-btn console-button"
                aria-pressed={platform !== null}
                aria-haspopup="dialog"
                onClick={() => { setPickerOpen(true); chip.play('select'); }}
                data-nav
              >
                {platform
                  ? `${KIND_ICON[platformInfo(platform)?.kind ?? 'console']} ${platformLabel(platform).toUpperCase()} ▾`
                  : tr('🎮 WHICH SYSTEM? ▾', '🎮 WELCHE KISTE? ▾')}
              </button>
              {platform && (
                <button
                  className="px-btn"
                  onClick={() => { setPlatform(null); chip.play('back'); }}
                  aria-label={tr('Remove console filter', 'Konsolen-Filter entfernen')}
                  data-nav
                >
                  ✕
                </button>
              )}
            </div>
            {decadeYears.length > 0 && (
              <div className="filters years scroll-row" aria-label={tr('Year', 'Jahr')}>
                <button className="px-btn" aria-pressed={!year} onClick={() => { setYear(null); chip.play('blip'); }} data-nav>
                  {tr('WHOLE DECADE', 'GANZES JAHRZEHNT')}
                </button>
                {decadeYears.map((y) => (
                  <button
                    key={y}
                    className="px-btn"
                    aria-pressed={year === y}
                    onClick={() => { setYear(year === y ? null : y); chip.play('blip'); }}
                    data-nav
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
            </>
          )}

          {view === 'collection' && (
            <>
              <div className="filters scroll-row" aria-label={tr('Shelf', 'Regal')}>
                <button className="px-btn" aria-pressed={shelf === 'stash'} onClick={() => { setShelf('stash'); chip.play('blip'); }} data-nav>
                  {tr('★ MY STASH', '★ MEIN STASH')} ({collection.length})
                </button>
                <button className="px-btn" aria-pressed={shelf === 'hadback'} onClick={() => { setShelf('hadback'); chip.play('blip'); }} data-nav>
                  {tr('♥ HAD IT BACK THEN', '♥ HATTE ICH DAMALS')} ({hadBackGames.length + state.hadSystems.length})
                </button>
              </div>
              {shelf === 'hadback' && (
                <div className="panel had-systems">
                  <h3 className="pixel-font">{tr('MY SYSTEMS BACK THEN', 'MEINE KISTEN DAMALS')}</h3>
                  <p className="dim" style={{ margin: '0 0 8px' }}>
                    {tr('Tap the consoles and computers you really had as a kid.', 'Tipp die Konsolen und Computer an, die du als Kind wirklich hattest.')}
                  </p>
                  <div className="filters">
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.id}
                        className="px-btn"
                        aria-pressed={state.hadSystems.includes(p.id)}
                        onClick={() => {
                          const on = state.hadSystems.includes(p.id);
                          chip.play(on ? 'back' : 'coin');
                          set('hadSystems', on ? state.hadSystems.filter((x) => x !== p.id) : [...state.hadSystems, p.id]);
                        }}
                        data-nav
                      >
                        {KIND_ICON[p.kind]} {platformLabel(p.id)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {view === 'chill' ? null : view === 'quests' ? (
            <QuestBoard
              state={state}
              signedIn={cloud.status === 'signed_in'}
              onPlay={(id) => {
                chip.play('select');
                countOpened('gaming', 'minigame', MINI_GAMES.find((m) => m.id === id)?.statKey ?? id);
                setMiniGame(id);
              }}
              onOpenSettings={() => {
                chip.play('select');
                setSettingsOpen(true);
              }}
              onBuy={(id) => {
                if (!buy(id)) return chip.play('error');
                const prize = PRIZES.find((p) => p.id === id)!;
                chip.play('powerup');
                if (prize.kind === 'effect') {
                  set('partyLogo', true);
                  showToast(tr(`UNLOCKED: ${prize.label}`, `FREIGESCHALTET: ${prize.label}`), tr('Active right now. You can switch it off and back on at the prize counter anytime.', 'Läuft ab sofort. Am Preis-Tresen kannst du es jederzeit aus- und wieder anschalten.'), '🪙');
                  return;
                }
                set(prize.kind, id as never);
                showToast(tr(`UNLOCKED: ${prize.label}`, `FREIGESCHALTET: ${prize.label}`), tr('Active right now. You can switch back in the settings anytime.', 'Läuft ab sofort. In den Einstellungen kannst du jederzeit zurückwechseln.'), '🪙');
              }}
              onUse={(id) => {
                const prize = PRIZES.find((p) => p.id === id)!;
                chip.play('select');
                if (prize.kind === 'effect') set('partyLogo', !state.partyLogo);
                else set(prize.kind, id as never);
              }}
            />
          ) : view === 'trophies' ? (
            <div className="links" style={{ marginTop: 16 }}>
              {ACHIEVEMENTS.map((a) => {
                const got = state.achievements.includes(a.id);
                return (
                  <div key={a.id} className="panel" style={{ opacity: got ? 1 : 0.45 }}>
                    <h3 className="pixel-font">
                      {got ? '🏆' : '🔒'} {got || a.id !== 'konami' ? a.title : '???'}
                    </h3>
                    {got || a.id !== 'konami' ? a.text : tr('Top secret. If you were cool back then, you know …', 'Top secret. Wer damals cool war, kennt’s …')}
                  </div>
                );
              })}
            </div>
          ) : searching || (archiveActive && archive.loading && !shown.length) ? (
            <p className="loading pixel-font" style={{ fontSize: 11 }} role="status">
              {searching ? tr('DIGGING THROUGH THE BARGAIN BIN … HANG ON, BRO', 'WÜHLE IN DER GRABBELKISTE … SEKUNDE, BRO') : tr('LOADING … PLEASE DO NOT TURN OFF', 'LOADING … BITTE NICHT AUSSCHALTEN')} <span className="blink">▮</span>
            </p>
          ) : shown.length ? (
            <>
              {archiveActive && (
                <p className="dim archive-count">
                  {catalog.length > 0 &&
                    tr(
                      `${catalog.length} ${catalog.length === 1 ? 'hand-picked gem' : 'hand-picked gems'}, plus `,
                      `${catalog.length} ${catalog.length === 1 ? 'handverlesene Perle' : 'handverlesene Perlen'}, dazu `
                    )}
                  {archive.total > 0
                    ? tr(`${archive.total.toLocaleString(LOCALE)} games from the Wikipedia archive. Awesome!`, `${archive.total.toLocaleString(LOCALE)} Games aus dem Wikipedia-Archiv. Fett!`)
                    : archive.loading
                      ? tr('the archive is loading …', 'das Archiv wird geladen …')
                      : tr('the archive is offline right now. Nothing doing.', 'das Archiv ist gerade offline. Tote Hose.')}
                </p>
              )}
              {view === 'search' && searchMore.term && (
                <p className="dim archive-count">
                  {searchMore.label}
                </p>
              )}
              <div className="grid" style={{ marginTop: 12 }}>
                {shown.map((g) => (
                  <Cartridge
                    key={g.id}
                    game={g}
                    fav={state.favorites.includes(g.id)}
                    done={state.completed.includes(g.id)}
                    onOpen={() => open(g)}
                  />
                ))}
              </div>
              {view === 'search' && searchMore.term && (searchMore.next !== null || !searchMore.related) && (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <button className="px-btn big" onClick={loadMoreResults} disabled={searchMore.loading} data-nav>
                    {searchMore.loading
                      ? tr('LOADING …', 'LADE …')
                      : searchMore.next !== null
                        ? tr('▼ MORE OF THAT, PLEASE', '▼ MEHR DAVON, BITTE')
                        : tr('▼ SHOW RELATED GAMES', '▼ ÄHNLICHE GAMES ZEIGEN')}
                  </button>
                </div>
              )}
              {archiveActive && archive.key === archiveKey && (archive.next !== null || archive.loading) && (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <button className="px-btn big" onClick={loadMore} disabled={archive.loading} data-nav>
                    {archive.loading ? tr('LOADING …', 'LADE …') : tr('▼ GIMME MORE', '▼ GIB MIR MEHR')}
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="empty pixel-font" style={{ fontSize: 11 }}>
              {view === 'collection' && shelf === 'hadback'
                ? tr('NO GAMES ON THIS SHELF YET. OPEN A GAME AND TAP ♥ HAD IT.', 'NOCH KEINE GAMES IM REGAL. ÖFFNE EIN GAME UND TIPP AUF ♥ HATTE ICH.')
                : view === 'collection'
                ? tr('NOTHING HERE YET. ★ COLLECT THE GAMES THAT SHAPED YOU.', 'TOTE HOSE HIER. ★ SAMMLE GAMES, DIE DICH GEPRÄGT HABEN.')
                : view === 'search'
                  ? tr('NOTHING FOUND. EPIC FAIL. TRY ANOTHER NAME.', 'NIX GEFUNDEN. EPIC FAIL. PROBIER NEN ANDEREN NAMEN.')
                  : tr('NOTHING HERE. NEW FILTER, NEW LUCK.', 'HIER IST NIX. ANDERER FILTER, NEUES GLÜCK.')}
            </p>
          )}

          <footer className="dim" style={{ marginTop: 48, fontSize: 18 }}>
            {tr(
              'Content live from Wikipedia (CC BY-SA). Game titles and images belong to their respective owners. RetroMind only links to legal ways of playing old games today.',
              'Inhalte live aus Wikipedia (CC BY-SA). Spieletitel und Bilder gehören ihren Rechteinhabern. RetroMind verlinkt nur auf legale Wege, alte Games heute zu zocken.'
            )}{' '}
            <a
              href={withGoogleParam(withMuteParam('https://retromind.vercel.app/'))}
              // At click time, so the data handed over (lib/sync.ts) is the latest.
              onClick={(e) => (e.currentTarget.href = withGoogleParam(withMuteParam('https://retromind.vercel.app/')))}
            >
              {tr('Back to RetroMind', 'Zurück zu RetroMind')}
            </a>
            {' · '}
            <a href={PRIVACY_URL}>{tr('Privacy', 'Datenschutz')}</a>
            {' · '}
            <a href={IMPRINT_URL}>{tr('Legal notice', 'Impressum')}</a>
          </footer>
        </main>
      )}

      {/* The fun-fact ticker, pinned just above the dock (Marco, 2026-10-18). */}
      {screen === 'hub' && <HallTicker onOpen={open} onSound={() => chip.play('blip')} />}

      {/* Every control behind one handle at the right edge (Marco, 2026-10-18). */}
      {screen === 'hub' && !settingsOpen && (
        <GamingHandle
          dot={cloud.status === 'signed_in' && cloud.sync === 'error'}
          onOpen={() => {
            chip.play('select');
            setSettingsOpen(true);
          }}
        />
      )}
      {settingsOpen && (
        <Settings
          cloud={cloud}
          spotifyAuth={spotifyAuth}
          state={state}
          set={setFromSettings}
          onClose={() => setSettingsOpen(false)}
          controls={
            screen === 'hub' ? (
              <GamingControls<View>
                sections={[
                  { id: 'catalog', label: tr('CATALOG', 'KATALOG') },
                  { id: 'systems', label: tr('SYSTEMS', 'KISTEN') },
                  { id: 'collection', label: 'STASH' },
                  { id: 'trophies', label: tr('TROPHIES', 'TROPHÄEN') },
                  { id: 'chill', label: tr('CHILL', 'CHILLEN') },
                  { id: 'quests', label: 'QUESTS' },
                ]}
                current={view}
                onSection={(id) => {
                  setSettingsOpen(false);
                  if (id === 'systems') {
                    if (view !== 'catalog') switchView('catalog');
                    setPickerOpen(true);
                    chip.play('select');
                  } else {
                    switchView(id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                music={
                  state.music && spotify.active ? (
                    <>
                      <div className="gm-controls-music">
                        <button className="px-btn" onClick={() => { chip.play('blip'); spotify.playPrevious(); }} disabled={!spotify.canSkip} aria-label={tr('Previous song', 'Vorheriger Song')} data-nav>
                          ◄◄
                        </button>
                        <button className="px-btn" onClick={() => { chip.play('blip'); spotify.togglePlay(); }} aria-label={spotify.playing ? 'Pause' : tr('Play', 'Abspielen')} data-nav>
                          {spotify.playing ? '❚❚' : '►'}
                        </button>
                        <button className="px-btn" onClick={() => { chip.play('blip'); spotify.playNext(); }} disabled={!spotify.canSkip} aria-label={tr('Next song', 'Nächster Song')} data-nav>
                          ►►
                        </button>
                        <span className="gm-controls-song">{spotify.songTitle ?? tr("Arcade music · '80s heavy metal", 'Hallenmusik · 80er Heavy Metal')}</span>
                      </div>
                      <button
                        className="px-btn"
                        onClick={() => {
                          setSettingsOpen(false);
                          openMusicDock();
                        }}
                        data-nav
                      >
                        {tr('♫ MORE MUSIC: VOLUME, SEARCH', '♫ MEHR MUSIK: LAUTSTÄRKE, SUCHE')}
                      </button>
                    </>
                  ) : undefined
                }
                muted={muted}
                onToggleMute={toggleMute}
                guruOpen={guruOpen}
                onGuru={() => {
                  chip.play(guruOpen ? 'back' : 'select');
                  setSettingsOpen(false);
                  setGuruOpen(!guruOpen);
                }}
                onFeedback={() => {
                  chip.play('select');
                  setSettingsOpen(false);
                  setFeedbackOpen(true);
                }}
                onLeave={() => {
                  setSettingsOpen(false);
                  leaveClub();
                }}
              />
            ) : undefined
          }
        />
      )}
      {feedbackOpen && <Feedback onClose={() => setFeedbackOpen(false)} />}

      {screen === 'hub' && (
        <>
          <button
            className={`px-btn to-top${scrolledDown ? ' shown' : ''}`}
            onClick={() => {
              chip.play('blip');
              scrollToTop();
            }}
            aria-label={tr('Back to top', 'Nach oben')}
            title={tr('Back to top', 'Nach oben')}
            aria-hidden={!scrolledDown}
            tabIndex={scrolledDown ? 0 : -1}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 1l7 7h-4v7H5V8H1z" />
            </svg>
          </button>
          {/* Music controls behind a small metal button, bottom centre
              between "Nach oben" and the Guru (Marco, 2026-10-06). */}
          {state.music && spotify.active && (
            <MusicDock
              hideKnob
              icon="bolt"
              ownMusic
              title={spotify.songTitle}
              source={tr('Arcade music · \'80s heavy metal', 'Hallenmusik · 80er Heavy Metal')}
              playing={spotify.playing}
              ready={spotify.ready || spotify.fallback}
              canSkip={spotify.canSkip}
              onPrev={() => {
                chip.play('blip');
                spotify.playPrevious();
              }}
              onToggle={() => {
                chip.play('blip');
                spotify.togglePlay();
              }}
              onNext={() => {
                chip.play('blip');
                spotify.playNext();
              }}
              muted={muted}
              onToggleMute={toggleMute}
              onOpenChange={(open) => chip.play(open ? 'select' : 'back')}
              extras={{
                status: spotify.status,
                signedIn: spotifyApi,
                onSignIn:
                  spotifyAuth.status === 'not_configured'
                    ? undefined
                    : () => {
                        setConsent('spotify', true);
                        spotifyAuth.signIn();
                      },
                onSeek: spotify.seek,
                onVolume: spotify.setVolume,
                onPick: (hit) => {
                  chip.play('coin');
                  spotify.playUri(hit);
                },
                special: spotify.special,
                themeName: tr("'80s Metal", '80er Metal'),
                onBackToTheme: () => {
                  chip.play('blip');
                  spotify.backToTheme();
                },
                themeHint: tr('Open a game and its soundtrack plays, if Spotify has one.', 'Öffnest du ein Spiel, läuft sein Soundtrack, wenn Spotify einen hat.'),
              }}
            />
          )}
          {guruOpen && (
            <GuruChat
              onClose={() => setGuruOpen(false)}
              onAsk={(text) => {
                track('guru');
                if (asksMeaningOfLife(text)) findEgg('guru42');
              }}
            />
          )}
        </>
      )}

      {pickerOpen && (
        <ConsolePicker
          current={platform}
          extras={platforms.filter((p) => !platformInfo(p))}
          onPick={(p) => {
            if (p && p !== platform) track('console');
            setPlatform(p);
            setPickerOpen(false);
            chip.play(p ? 'coin' : 'blip');
          }}
          onClose={() => {
            setPickerOpen(false);
            chip.play('back');
          }}
        />
      )}

      {miniGame && (
        <MiniGameDialog
          id={miniGame}
          onWin={() => {
            unlock('chill');
            track('minigame');
          }}
          onEarn={earn}
          onClose={() => {
            chip.play('back');
            setMiniGame(null);
          }}
        />
      )}

      {inserting && <CartInsert game={inserting} onDone={insertDone} />}

      {attract && (
        <AttractMode
          onExit={() => setAttract(false)}
          onOpen={(game) => {
            setAttract(false);
            open(game);
          }}
        />
      )}

      {selected && (
        <GameDetail
          key={selected.id}
          game={selected}
          slideFrom={slideFrom}
          onPrev={neighbor(-1) ? () => browse(-1) : undefined}
          onNext={neighbor(1) ? () => browse(1) : undefined}
          isFavorite={state.favorites.includes(selected.id)}
          isCompleted={state.completed.includes(selected.id)}
          isHadBack={state.hadBack.includes(selected.id)}
          onToggleHadBack={() => {
            chip.play(state.hadBack.includes(selected.id) ? 'back' : 'coin');
            toggleIn('hadBack', selected);
          }}
          onToggleFavorite={() => {
            chip.play(state.favorites.includes(selected.id) ? 'back' : 'coin');
            toggleIn('favorites', selected);
          }}
          onToggleCompleted={() => {
            chip.play(state.completed.includes(selected.id) ? 'back' : 'powerup');
            toggleIn('completed', selected);
          }}
          onClose={closeDetail}
          aiAvailable={aiAvailable}
          onVideoChange={setVideoPlaying}
          onPlay={play}
        />
      )}

      {emu && (
        <EmulatorDialog
          key={'rom' in emu ? emu.rom : emu.file.name}
          launch={emu}
          onRunning={setEmuRunning}
          onClose={() => {
            chip.play('back');
            setEmu(null);
          }}
        />
      )}

      {toast && (
        <div className={`toast${toast.xbox ? ' xbox' : ''}`} role="status">
          <span style={{ fontSize: 28 }} aria-hidden="true">
            {toast.icon ?? '🏆'}
          </span>
          <div>
            <div className="pixel-font">{toast.title}</div>
            <div>{toast.text}</div>
          </div>
          <button className="toast-close" onClick={() => setToast(null)} aria-label={tr('Close', 'Schließen')} title={tr('Close', 'Schließen')}>
            ×
          </button>
        </div>
      )}

      {screen === 'hub' && !emu && state.music && state.musicSource === 'spotify' && <SpotifyAsk />}

      {fromDoor && <div className="white-in" aria-hidden="true" onAnimationEnd={() => setFromDoor(false)} />}
      <div className="crt-glass" aria-hidden="true" />
    </div>
  );
};
