import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DECADES, Game, GAMES, PLATFORM_COLORS, TICKER_FACTS } from './data/games';
import { chip } from './lib/chiptune';
import { searchGames } from './lib/wiki';
import { useControls } from './lib/useControls';
import { Achievement, ACHIEVEMENTS, Palette, scoreOf, useArcadeState } from './lib/useArcadeState';
import { PowerOn } from './components/PowerOn';
import { GameDetail } from './components/GameDetail';
import { GuruChat } from './components/GuruChat';

type View = 'catalog' | 'collection' | 'search' | 'trophies';

const PALETTES: { id: Palette; label: string }[] = [
  { id: 'arcade', label: 'ARCADE' },
  { id: 'gameboy', label: 'HANDHELD' },
  { id: 'amber', label: 'BERNSTEIN' },
];

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
  const reducedMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const [screen, setScreen] = useState<'power' | 'hub'>('power');
  const [toast, setToast] = useState<{ title: string; text: string } | null>(null);
  const [rainbow, setRainbow] = useState(false);

  const showToast = useCallback((title: string, text: string) => {
    setToast({ title, text });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3800);
    return () => clearTimeout(id);
  }, [toast]);

  const onAchievement = useCallback(
    (a: Achievement) => {
      chip.play('achievement');
      showToast(`ERFOLG: ${a.title}`, a.text);
    },
    [showToast]
  );
  const { state, discover, toggleIn, unlock, set } = useArcadeState(onAchievement);

  const [view, setView] = useState<View>('catalog');
  const [decade, setDecade] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Game[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Game | null>(null);
  const [guruOpen, setGuruOpen] = useState(false);
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
    if (screen === 'hub') chip.setMusic(state.music);
    return () => chip.stopMusic();
  }, [screen, state.music]);

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
      setSelected(game);
    },
    [discover]
  );
  const closeDetail = useCallback(() => {
    chip.play('back');
    setSelected(null);
  }, []);

  useControls({
    onMove: () => chip.play('blip'),
    onBack: () => {
      if (selected) closeDetail();
      else if (guruOpen) setGuruOpen(false);
    },
    onKonami: () => {
      unlock('konami');
      chip.play('powerup');
      showToast('+30 LEBEN', 'Cheat aktiviert. Respekt, Player 1.');
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

  const platforms = useMemo(() => Array.from(new Set(GAMES.map((g) => g.platform))), []);

  // INSERT COIN: titles spin like a slot machine, then a random game opens —
  // preferring ones the player hasn't discovered yet.
  const rollingTimer = useRef<number | null>(null);
  const insertCoin = () => {
    if (rolling) return;
    chip.play('coin');
    unlock('first-coin');
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

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    chip.play('select');
    unlock('digger');
    setView('search');
    setSearching(true);
    const hits = await searchGames(q);
    setSearching(false);
    setResults(
      hits.map((h) => {
        const curated = GAMES.find((g) => g.wiki === h.title);
        return (
          curated ?? {
            id: `wiki:${h.title}`,
            title: h.title.replace(/ \((\d{4} )?video game\)$/i, ''),
            year: 0,
            platform: 'Fundstück',
            developer: 'unbekannt',
            genre: 'aus der Grabbelkiste',
            wiki: h.title,
            blurb: h.snippet,
            custom: true,
          }
        );
      })
    );
    chip.play(hits.length ? 'powerup' : 'error');
  };

  const switchView = (v: View) => {
    chip.play('blip');
    setView(v);
  };

  const cyclePalette = () => {
    chip.play('select');
    const i = PALETTES.findIndex((p) => p.id === state.palette);
    set('palette', PALETTES[(i + 1) % PALETTES.length].id);
  };

  const score = scoreOf(state);
  const shown: Game[] =
    view === 'catalog' ? catalog : view === 'collection' ? collection : view === 'search' ? results ?? [] : [];

  return (
    <div className={`arcade${rainbow ? ' rainbow' : ''}`} data-palette={state.palette}>
      <div className="stars" aria-hidden="true" />

      {screen === 'power' ? (
        <PowerOn reducedMotion={reducedMotion} onStart={() => setScreen('hub')} />
      ) : (
        <main className="hub">
          <header className="hud pixel-font">
            <h1 className="brand rgb-split">
              RETROMIND
              <small>GAMING</small>
            </h1>
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
            <span>WUSSTEST DU? ★ {tickerFact}</span>
          </div>

          <div className="toolbar">
            <button className="px-btn big" onClick={insertCoin} data-nav aria-live="polite">
              {rolling ? `▶ ${rolling}` : '● INSERT COIN · ZUFALLSFUND'}
            </button>
            <form className="search" onSubmit={runSearch} role="search">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Welches Spiel suchst du? z. B. Rayman, Golden Axe …"
                aria-label="Spiel suchen"
                data-nav
              />
              <button className="px-btn" type="submit" data-nav>
                SUCHEN
              </button>
            </form>
          </div>

          <div className="toolbar" style={{ marginTop: 4 }}>
            <button className="px-btn" aria-pressed={view === 'catalog'} onClick={() => switchView('catalog')} data-nav>
              VERGESSENE SCHÄTZE
            </button>
            <button className="px-btn" aria-pressed={view === 'collection'} onClick={() => switchView('collection')} data-nav>
              MEINE SAMMLUNG ({collection.length})
            </button>
            <button className="px-btn" aria-pressed={view === 'trophies'} onClick={() => switchView('trophies')} data-nav>
              ERFOLGE {state.achievements.length}/{ACHIEVEMENTS.length}
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
            <div className="filters" aria-label="Filter">
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
              {platforms.map((p) => (
                <button
                  key={p}
                  className="px-btn"
                  aria-pressed={platform === p}
                  onClick={() => { setPlatform(platform === p ? null : p); chip.play('blip'); }}
                  data-nav
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {view === 'trophies' ? (
            <div className="links" style={{ marginTop: 16 }}>
              {ACHIEVEMENTS.map((a) => {
                const got = state.achievements.includes(a.id);
                return (
                  <div key={a.id} className="panel" style={{ opacity: got ? 1 : 0.45 }}>
                    <h3 className="pixel-font">
                      {got ? '🏆' : '🔒'} {got || a.id !== 'konami' ? a.title : '???'}
                    </h3>
                    {got || a.id !== 'konami' ? a.text : 'Ein Geheimnis. Vielleicht kennst du es aus alten Zeiten …'}
                  </div>
                );
              })}
            </div>
          ) : searching ? (
            <p className="loading pixel-font" style={{ fontSize: 11 }} role="status">
              DURCHSUCHE DIE GRABBELKISTE … <span className="blink">▮</span>
            </p>
          ) : shown.length ? (
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
          ) : (
            <p className="empty pixel-font" style={{ fontSize: 11 }}>
              {view === 'collection'
                ? 'NOCH LEER. ★ SAMMLE SPIELE, AN DIE DU DICH ERINNERST.'
                : view === 'search'
                  ? 'NICHTS GEFUNDEN. VERSUCH EINEN ANDEREN NAMEN.'
                  : 'KEINE SPIELE FÜR DIESEN FILTER.'}
            </p>
          )}

          <footer className="dim" style={{ marginTop: 48, fontSize: 18 }}>
            Inhalte live aus Wikipedia (CC BY-SA). Spieletitel und Bilder gehören ihren Rechteinhabern. RetroMind
            verlinkt nur auf legale Wege, alte Spiele heute zu spielen.{' '}
            <a href="https://retromind.vercel.app/">Zurück zu RetroMind</a>
          </footer>
        </main>
      )}

      {screen === 'hub' && (
        <>
          <button
            className="px-btn big guru-fab"
            onClick={() => {
              chip.play(guruOpen ? 'back' : 'select');
              setGuruOpen(!guruOpen);
            }}
            aria-expanded={guruOpen}
          >
            {guruOpen ? '✕' : '☻ GURU'}
          </button>
          {guruOpen && <GuruChat onClose={() => setGuruOpen(false)} />}
        </>
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
        />
      )}

      {toast && (
        <div className="toast" role="status">
          <span style={{ fontSize: 28 }} aria-hidden="true">
            🏆
          </span>
          <div>
            <div className="pixel-font">{toast.title}</div>
            <div>{toast.text}</div>
          </div>
        </div>
      )}

      <div className="crt-glass" aria-hidden="true" />
    </div>
  );
};
