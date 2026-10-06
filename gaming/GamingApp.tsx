import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DECADES, Game, GAMES, PLATFORM_COLORS, TICKER_FACTS } from './data/games';
import { KIND_ICON, PLATFORMS, platformInfo } from './data/platforms';
import { archiveSupports, fetchArchive, searchArchive } from './lib/archive';
import { chip } from './lib/chiptune';
import { searchGames } from './lib/wiki';
import { useControls } from './lib/useControls';
import { Achievement, ACHIEVEMENTS, scoreOf, useArcadeState } from './lib/useArcadeState';
import { Entrance } from './components/Entrance';
import { MuteButton } from './components/MuteButton';
import { GameDetail } from './components/GameDetail';
import { GuruChat } from './components/GuruChat';
import { ConsolePicker } from './components/ConsolePicker';
import { Settings, PALETTES } from './components/Settings';
import { Feedback } from './components/Feedback';
import { MiniGameCorner, MiniGameDialog, MiniGameId } from './components/MiniGames';
import { useCloudSync } from './lib/useCloudSync';
import { useHallSpotify } from './lib/useHallSpotify';
import { SpotifyAsk } from './components/SpotifyAsk';
import { SpotifyBar } from '../components/SpotifyBar';
import { QuestBoard } from './components/QuestBoard';
import { ActiveQuest, isOwned, PRIZES } from './lib/quests';
import { toggleMuted, useMuted, withMuteParam } from '../lib/mute';
import { withGoogleParam } from '../lib/googleLogin';
import { IMPRINT_URL, PRIVACY_URL } from '../lib/privacy';
import { scrollToTop, useScrolledDown } from '../hooks/useScrolledDown';

type View = 'catalog' | 'collection' | 'search' | 'trophies' | 'chill' | 'quests';


const pad = (n: number, len = 6) => String(n).padStart(len, '0');

const Cartridge: React.FC<{ game: Game; fav: boolean; done: boolean; onOpen: () => void }> = ({ game, fav, done, onOpen }) => (
  <button
    className="cart"
    onClick={onOpen}
    data-nav
    style={{ ['--label' as string]: PLATFORM_COLORS[game.platform] ?? 'var(--a1)' }}
    aria-label={`${game.title}, ${game.platform}${game.year ? `, ${game.year}` : ''}`}
  >
    <span className="cart-badges" aria-hidden="true">
      {fav && '★'}
      {done && '✓'}
    </span>
    <span className="cart-label">
      <span className="cart-meta">
        {game.platform}
        {game.year ? ` · ${game.year}` : ''}
      </span>
      <span className="cart-title">{game.title}</span>
      {game.blurb && <span className="cart-blurb">{game.blurb.length > 110 ? `${game.blurb.slice(0, 108)}…` : game.blurb}</span>}
    </span>
  </button>
);

export const GamingApp: React.FC = () => {
  const scrolledDown = useScrolledDown();
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const [screen, setScreen] = useState<'power' | 'hub'>('power');
  // After the door the hub comes up out of the white picture.
  const [fromDoor, setFromDoor] = useState(false);
  const [toast, setToast] = useState<{ title: string; text: string; icon?: string } | null>(null);
  const [rainbow, setRainbow] = useState(false);

  const showToast = useCallback((title: string, text: string, icon?: string) => {
    setToast({ title, text, icon });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(id);
  }, [toast]);

  const onAchievement = useCallback(
    (a: Achievement) => {
      chip.play('achievement');
      showToast(`ACHIEVEMENT UNLOCKED: ${a.title}`, a.text);
    },
    [showToast]
  );
  const onQuest = useCallback(
    (q: ActiveQuest) => {
      chip.play('coin');
      showToast(`QUEST GESCHAFFT: +${q.reward} SPIELMARKEN`, q.text, '🪙');
    },
    [showToast]
  );
  const { state, discover, toggleIn, unlock, set, mergeIn, track, buy } = useArcadeState(onAchievement, onQuest);
  const cloud = useCloudSync(state, mergeIn);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const [view, setView] = useState<View>('catalog');
  const [decade, setDecade] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Game[] | null>(null);
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
  const [selected, setSelected] = useState<Game | null>(null);
  const [guruOpen, setGuruOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [miniGame, setMiniGame] = useState<MiniGameId | null>(null);
  const [rolling, setRolling] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState(true);
  const tickerFact = useMemo(() => TICKER_FACTS.join('   ★   '), []);
  // Browsers that support installing web apps hand us a prompt to trigger later.
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    const onInstalled = () => setInstallPrompt(null);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    chip.play('powerup');
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => null);
    setInstallPrompt(null);
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
  const [videoPlaying, setVideoPlaying] = useState(false);
  // In the hall the 80s metal playlist from Spotify plays instead of the
  // chiptune tunes, once Spotify is allowed (useHallSpotify).
  const spotify = useHallSpotify(state.musicSource === 'spotify', screen === 'hub' && state.music && !videoPlaying);
  useEffect(() => {
    chip.track = state.track;
    if (screen === 'hub') chip.setMusic(state.music && !videoPlaying && !spotify.active);
    return () => chip.stopMusic();
  }, [screen, state.music, state.track, videoPlaying, spotify.active]);

  // Ask the server once whether the AI key is configured.
  useEffect(() => {
    fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ping' }),
    })
      .then((r) => setAiAvailable(r.ok))
      .catch(() => setAiAvailable(false));
  }, []);

  const open = useCallback(
    (game: Game) => {
      chip.play('select');
      discover(game);
      track('open');
      setSelected(game);
    },
    [discover, track]
  );
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
      chip.play('powerup');
      showToast('+30 LEBEN', 'Cheat aktiviert. Voll krass, Player 1. Ehrenmann!');
      setRainbow(true);
      setTimeout(() => setRainbow(false), 6000);
    },
  });

  const collection = useMemo(() => {
    const ids = Array.from(new Set([...state.favorites, ...state.completed]));
    return ids.map((id) => GAMES.find((g) => g.id === id) ?? state.customGames[id]).filter(Boolean) as Game[];
  }, [state.favorites, state.completed, state.customGames]);

  const catalog = useMemo(() => {
    const d = DECADES.find((x) => x.id === decade);
    return GAMES.filter((g) => (!d || (g.year >= d.from && g.year <= d.to)) && (!platform || g.platform === platform));
  }, [decade, platform]);

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
    const d = DECADES.find((x) => x.id === decade);
    // With no filter at all, the archive spans the edition's whole era.
    const range = d ? { from: d.from, to: d.to } : platform ? null : { from: 1980, to: new Date().getFullYear() };
    return { platform, decade: range };
  }, [decade, platform]);
  const archiveKey = `${platform}|${decade}`;
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
          genre: 'aus der Grabbelkiste',
          wiki: h.title,
          blurb: h.snippet,
          custom: true,
        })
      );
    }
    setSearching(false);
    setResults(hits);
    const total = page.total || hits.length;
    const n = total.toLocaleString('de-DE');
    const label = !page.games.length
      ? `${n} Treffer zu „${q}“. Nice!`
      : related
        ? `Kein Game heißt so, aber ${n} erwähnen „${q}“. Lowkey auch spannend.`
        : `${n} ${total === 1 ? 'Game' : 'Games'} mit „${q}“ im Titel. Läuft!`;
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

  const switchView = (v: View) => {
    chip.play('blip');
    setView(v);
  };

  const cyclePalette = () => {
    chip.play('select');
    const mine = PALETTES.filter((p) => isOwned(p.id, state.owned));
    const i = mine.findIndex((p) => p.id === state.palette);
    set('palette', mine[(i + 1) % mine.length].id);
  };

  const score = scoreOf(state);
  const shown: Game[] =
    view === 'catalog' ? [...catalog, ...archiveShown] : view === 'collection' ? collection : view === 'search' ? results ?? [] : [];

  return (
    <div className={`arcade${rainbow ? ' rainbow' : ''}`} data-palette={state.palette}>
      <div className="stars" aria-hidden="true" />
      {/* Off-screen, always mounted: Spotify's player for the hall music. */}
      <div ref={spotify.containerRef} aria-hidden="true" className="spotify-host" />
      {screen === 'hub' && (
        // Inside the hall: Marco's picture of the arcade (Nano Banana), toned
        // down behind the UI. On wide screens a blurred copy fills the sides.
        <div className="hall-bg" aria-hidden="true">
          <img className="hb-photo" src="/gaming/arcade-innen.webp" alt="" />
          <div className="hb-tint" />
        </div>
      )}

      {screen === 'power' ? (
        <Entrance
          reducedMotion={reducedMotion}
          muted={muted}
          music={state.music}
          onToggleMute={toggleMute}
          onEnter={() => {
            setScreen('hub');
            setFromDoor(!reducedMotion);
          }}
        />
      ) : (
        <main className="hub">
          <header className="hud pixel-font">
            <h1 className="brand rgb-split">
              <img className="brand-motif" src="/gaming/motif.webp" alt="" />
              RETROMIND
              <small>GAMING</small>
            </h1>
            <button
              className="px-btn feedback-btn"
              onClick={() => {
                chip.play('select');
                setFeedbackOpen(true);
              }}
              data-nav
              aria-label="Feedback geben"
              title="Feedback geben"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M1 3h14v10H1zM2 4v8h12V4z" />
                <path d="M3 5h1v1h1v1h1v1h1v1h2V8h1V7h1V6h1V5h1v1h-1v1h-1v1h-1v1h-1v1H7V9H6V8H5V7H4V6H3z" />
              </svg>
            </button>
            <MuteButton className="hud-mute" muted={muted} onToggle={toggleMute} />
            <button
              className="px-btn settings-btn"
              onClick={() => {
                chip.play('select');
                setSettingsOpen(true);
              }}
              data-nav
              aria-label={cloud.status === 'signed_in' ? `Einstellungen, angemeldet als ${cloud.user?.name ?? ''}` : 'Einstellungen und Anmeldung'}
              title="Einstellungen"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M7 1h2v2h1V2h2v2h-1v1h2v2h1v2h-1v2h-2v1h1v2h-2v-1H9v2H7v-2H6v1H4v-2h1v-1H3V9H2V7h1V5h2V4H4V2h2v1h1zM6 6v4h4V6z" />
              </svg>
              {cloud.status === 'signed_in' && <span className={`settings-dot${cloud.sync === 'error' ? ' warn' : ''}`} />}
            </button>
            {cloud.status === 'signed_in' && cloud.user?.name && (
              <div>
                <span className="label">PLAYER</span> <span className="value">{cloud.user.name.split(' ')[0].toUpperCase()}</span>
              </div>
            )}
            {/* Spielmarken from the quests; a tap opens the quests and the prize counter. */}
            <button
              className="hud-tokens"
              onClick={() => switchView('quests')}
              aria-label={`${state.tokens} Spielmarken, zu den Quests und zum Preis-Tresen`}
              title="Spielmarken: zum Preis-Tresen"
              data-nav
            >
              <span className="label">MARKEN</span>{' '}
              <span key={state.tokens} className="value bump">
                {state.tokens}
              </span>
            </button>
            <div>
              <span className="label">1UP</span> <span className="value">{pad(score)}</span>
            </div>
            <div>
              <span className="label">HI-SCORE</span> <span className="value">{pad(state.hiScore)}</span>
            </div>
            <div>
              <span className="label">ENTDECKT</span>{' '}
              <span className="value">
                {state.discovered.filter((id) => GAMES.some((g) => g.id === id)).length}/{GAMES.length}
              </span>
            </div>
          </header>

          <div className="ticker" aria-hidden="true">
            <span>FUN FACT, DIGGA ★ {tickerFact}</span>
          </div>

          <div className="toolbar">
            <button className="px-btn big" onClick={insertCoin} data-nav aria-live="polite">
              {rolling ? `▶ ${rolling}` : '● INSERT COIN · ÜBERRASCH MICH!'}
            </button>
            <button
              className="px-btn big chill-btn"
              aria-pressed={view === 'chill'}
              onClick={() => switchView(view === 'chill' ? 'catalog' : 'chill')}
              data-nav
            >
              {view === 'chill' ? '◄ ZURÜCK ZUM KATALOG' : '♥ CHILL-ECKE · MINISPIELE'}
            </button>
            {/* The games open right under their button, not further down the page. */}
            {view === 'chill' && (
              <div className="chill-panel">
                <MiniGameCorner
                  onPick={(id) => {
                    chip.play('select');
                    setMiniGame(id);
                  }}
                />
              </div>
            )}
            <form className="search" onSubmit={runSearch} role="search">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Welches Game, Digga? z. B. Rayman, Golden Axe …"
                aria-label="Spiel suchen"
                data-nav
              />
              <button className="px-btn" type="submit" data-nav>
                GO!
              </button>
            </form>
          </div>

          <div className="toolbar" style={{ marginTop: 4 }}>
            <button className="px-btn view-tab" aria-pressed={view === 'catalog'} onClick={() => switchView('catalog')} data-nav>
              OLDSCHOOL-PERLEN
            </button>
            <button className="px-btn view-tab" aria-pressed={view === 'collection'} onClick={() => switchView('collection')} data-nav>
              MEIN STASH ({collection.length})
            </button>
            <button className="px-btn view-tab" aria-pressed={view === 'trophies'} onClick={() => switchView('trophies')} data-nav>
              ACHIEVEMENTS {state.achievements.length}/{ACHIEVEMENTS.length}
            </button>
            <button className="px-btn view-tab" aria-pressed={view === 'quests'} onClick={() => switchView('quests')} data-nav>
              QUESTS · {state.tokens} MARKEN
            </button>
            {results && (
              <button className="px-btn" aria-pressed={view === 'search'} onClick={() => switchView('search')} data-nav>
                SUCHE
              </button>
            )}
            <span style={{ flex: 1 }} />
            <button
              className="px-btn"
              aria-pressed={state.music}
              onClick={() => set('music', !state.music)}
              data-nav
              aria-label="Musik an/aus"
            >
              ♪ {state.music ? 'AN' : 'AUS'}
            </button>
            <button
              className="px-btn"
              aria-pressed={state.sfx}
              onClick={() => set('sfx', !state.sfx)}
              data-nav
              aria-label="Soundeffekte an/aus"
            >
              SFX {state.sfx ? 'AN' : 'AUS'}
            </button>
            {installPrompt && (
              <button className="px-btn" onClick={install} data-nav>
                ⬇ ALS APP
              </button>
            )}
            <button className="px-btn" onClick={cyclePalette} data-nav aria-label="Bildschirmfarbe wechseln">
              ▣ {PALETTES.find((p) => p.id === state.palette)?.label}
            </button>
          </div>

          {view === 'catalog' && (
            <>
            <div className="filters" aria-label="Jahrzehnt">
              <button className="px-btn" aria-pressed={!decade && !platform} onClick={() => { setDecade(null); setPlatform(null); chip.play('blip'); }} data-nav>
                ALLE
              </button>
              {DECADES.map((d) => (
                <button
                  key={d.id}
                  className="px-btn"
                  aria-pressed={decade === d.id}
                  onClick={() => { setDecade(decade === d.id ? null : d.id); chip.play('blip'); }}
                  data-nav
                >
                  {d.label.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="filters" aria-label="Konsole">
              <button
                className="px-btn big console-button"
                aria-pressed={platform !== null}
                aria-haspopup="dialog"
                onClick={() => { setPickerOpen(true); chip.play('select'); }}
                data-nav
              >
                {platform
                  ? `${KIND_ICON[platformInfo(platform)?.kind ?? 'console']} KISTE: ${platform.toUpperCase()} ▾`
                  : '🎮 WELCHE KISTE? ▾'}
              </button>
              {platform && (
                <button
                  className="px-btn"
                  onClick={() => { setPlatform(null); chip.play('back'); }}
                  aria-label="Konsolen-Filter entfernen"
                  data-nav
                >
                  ✕
                </button>
              )}
            </div>
            </>
          )}

          {view === 'chill' ? null : view === 'quests' ? (
            <QuestBoard
              state={state}
              onBuy={(id) => {
                if (!buy(id)) return chip.play('error');
                const prize = PRIZES.find((p) => p.id === id)!;
                chip.play('powerup');
                set(prize.kind, id as never);
                showToast(`FREIGESCHALTET: ${prize.label}`, 'Läuft ab sofort. In den Einstellungen kannst du jederzeit zurückwechseln.', '🪙');
              }}
              onUse={(id) => {
                const prize = PRIZES.find((p) => p.id === id)!;
                chip.play('select');
                set(prize.kind, id as never);
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
                    {got || a.id !== 'konami' ? a.text : 'Top secret. Wer damals cool war, kennt’s …'}
                  </div>
                );
              })}
            </div>
          ) : searching || (archiveActive && archive.loading && !shown.length) ? (
            <p className="loading pixel-font" style={{ fontSize: 11 }} role="status">
              {searching ? 'WÜHLE IN DER GRABBELKISTE … SEKUNDE, BRO' : 'LOADING … BITTE NICHT AUSSCHALTEN'} <span className="blink">▮</span>
            </p>
          ) : shown.length ? (
            <>
              {archiveActive && (
                <p className="dim archive-count">
                  {catalog.length > 0 && `${catalog.length} ${catalog.length === 1 ? 'handverlesene Perle' : 'handverlesene Perlen'}, dazu `}
                  {archive.total > 0
                    ? `${archive.total.toLocaleString('de-DE')} Games aus dem Wikipedia-Archiv. Fett!`
                    : archive.loading
                      ? 'das Archiv wird geladen …'
                      : 'das Archiv ist gerade offline. Tote Hose.'}
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
                      ? 'LADE …'
                      : searchMore.next !== null
                        ? '▼ MEHR DAVON, BITTE'
                        : '▼ ÄHNLICHE GAMES ZEIGEN'}
                  </button>
                </div>
              )}
              {archiveActive && archive.key === archiveKey && (archive.next !== null || archive.loading) && (
                <div style={{ textAlign: 'center', marginTop: 24 }}>
                  <button className="px-btn big" onClick={loadMore} disabled={archive.loading} data-nav>
                    {archive.loading ? 'LADE …' : '▼ GIB MIR MEHR'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="empty pixel-font" style={{ fontSize: 11 }}>
              {view === 'collection'
                ? 'TOTE HOSE HIER. ★ SAMMLE GAMES, DIE DICH GEPRÄGT HABEN.'
                : view === 'search'
                  ? 'NIX GEFUNDEN. EPIC FAIL. PROBIER NEN ANDEREN NAMEN.'
                  : 'HIER IST NIX. ANDERER FILTER, NEUES GLÜCK.'}
            </p>
          )}

          <footer className="dim" style={{ marginTop: 48, fontSize: 18 }}>
            Inhalte live aus Wikipedia (CC BY-SA). Spieletitel und Bilder gehören ihren Rechteinhabern. RetroMind
            verlinkt nur auf legale Wege, alte Games heute zu zocken.{' '}
            <a href={withGoogleParam(withMuteParam('https://retromind.vercel.app/'))}>Zurück zu RetroMind</a>
            {' · '}
            <a href={PRIVACY_URL}>Datenschutz</a>
            {' · '}
            <a href={IMPRINT_URL}>Impressum</a>
          </footer>
        </main>
      )}

      {screen === 'hub' && state.palette === 'modul' && (
        <nav className="dock" aria-label="Bereiche">
          <button className="dock-btn" aria-current={view === 'catalog' ? 'page' : undefined} onClick={() => switchView('catalog')} data-nav>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v13l-2 2H8l-2-2zM9 7h6v5H9zM8 21h8" /></svg>
            KATALOG
          </button>
          <button
            className="dock-btn"
            aria-haspopup="dialog"
            onClick={() => {
              if (view !== 'catalog') switchView('catalog');
              setPickerOpen(true);
              chip.play('select');
            }}
            data-nav
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h18v8H3zM7 11v4M5 13h4M15 12h.01M18 14h.01" /></svg>
            KISTEN
          </button>
          <button className="dock-btn" aria-current={view === 'collection' ? 'page' : undefined} onClick={() => switchView('collection')} data-nav>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h11l3 3v15H5zM8 3v5h7V3M8 21v-7h8v7" /></svg>
            STASH
          </button>
          <button className="dock-btn" aria-current={view === 'trophies' ? 'page' : undefined} onClick={() => switchView('trophies')} data-nav>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8 21h8M9 18h6" /></svg>
            TROPHÄEN
          </button>
          <button className="dock-btn" aria-current={view === 'chill' ? 'page' : undefined} onClick={() => switchView('chill')} data-nav>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3" /></svg>
            CHILLEN
          </button>
          <button className="dock-btn" aria-current={view === 'quests' ? 'page' : undefined} onClick={() => switchView('quests')} data-nav>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M12 8v8M9 10h6M9 14h6" /></svg>
            QUESTS
          </button>
        </nav>
      )}

      {settingsOpen && <Settings cloud={cloud} state={state} set={set} onClose={() => setSettingsOpen(false)} />}
      {feedbackOpen && <Feedback onClose={() => setFeedbackOpen(false)} />}

      {screen === 'hub' && (
        <>
          <button
            className={`px-btn to-top${scrolledDown ? ' shown' : ''}`}
            onClick={() => {
              chip.play('blip');
              scrollToTop();
            }}
            aria-label="Nach oben"
            title="Nach oben"
            aria-hidden={!scrolledDown}
            tabIndex={scrolledDown ? 0 : -1}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 1l7 7h-4v7H5V8H1z" />
            </svg>
          </button>
          {/* Spotify player bar, bottom centre between "Nach oben" and the
              Guru (Marco, 2026-10-06). On small screens the Guru button then
              shows only its face so the three fit side by side. */}
          {state.music && spotify.active && (
            <SpotifyBar
              className="hall-spotify-bar"
              title={spotify.songTitle}
              playing={spotify.playing}
              ready={spotify.ready}
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
            />
          )}
          <button
            className={`px-btn big guru-fab${state.music && spotify.active ? ' compact' : ''}`}
            onClick={() => {
              chip.play(guruOpen ? 'back' : 'select');
              setGuruOpen(!guruOpen);
            }}
            aria-expanded={guruOpen}
            aria-label={guruOpen ? 'Guru schließen' : 'Game-Guru'}
          >
            {guruOpen ? '✕' : (
              <>
                ☻<span className="guru-label"> GURU</span>
              </>
            )}
          </button>
          {guruOpen && <GuruChat onClose={() => setGuruOpen(false)} onAsk={() => track('guru')} />}
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
          onClose={() => {
            chip.play('back');
            setMiniGame(null);
          }}
        />
      )}

      {selected && (
        <GameDetail
          game={selected}
          isFavorite={state.favorites.includes(selected.id)}
          isCompleted={state.completed.includes(selected.id)}
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
        />
      )}

      {toast && (
        <div className="toast" role="status">
          <span style={{ fontSize: 28 }} aria-hidden="true">
            {toast.icon ?? '🏆'}
          </span>
          <div>
            <div className="pixel-font">{toast.title}</div>
            <div>{toast.text}</div>
          </div>
        </div>
      )}

      {screen === 'hub' && state.music && state.musicSource === 'spotify' && <SpotifyAsk />}

      {fromDoor && <div className="white-in" aria-hidden="true" onAnimationEnd={() => setFromDoor(false)} />}
      <div className="crt-glass" aria-hidden="true" />
    </div>
  );
};
