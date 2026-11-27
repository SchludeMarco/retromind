import React, { useEffect, useRef, useState } from 'react';
import { chip } from '../lib/chiptune';
import { EmuLaunch, FREE_GAMES } from '../lib/emulator';
import { platformLabel } from '../data/platforms';
import { isBlitz, MINI_GAMES, MiniGameCorner, MiniGameId } from './MiniGames';
import { EmulatorCorner } from './EmulatorCorner';
import { loadBests } from './minigames/shared';
import { tr } from '../../lib/i18n';

// "Selbst zocken" (Marco, 2026-11-25: "ganz oben rechts ein Symbol zum
// Selbstzocken. Die ganzen Spiele, die man selbst zocken kann mit der
// integrierten Konsole und die Schnellspiele"). The page behind the PLAY /
// ZOCKEN corner at the top right (PlayCorner) and the ZOCKEN section in the
// side panel: a random pick, the Lightning Round (the 30-second games, open
// on top), today's Blitz Challenge pinned under it, the Retro-Konsole games (last played first) and every quick game as a tile
// with the player's own record.

/** Ids in ArcadeState.recentPlays: "emu:<FreeGame id>" or "mini:<MiniGameId>". */
export const emuPlayId = (id: string) => `emu:${id}`;
export const miniPlayId = (id: MiniGameId) => `mini:${id}`;
/** The newest play first, at most 12 remembered. */
export const withRecent = (recent: string[] | undefined, id: string) => [id, ...(recent ?? []).filter((x) => x !== id)].slice(0, 12);

/** The small corner at the top right of the HUD that opens this page. */
export const PlayCorner: React.FC<{ active: boolean; onOpen: () => void }> = ({ active, onOpen }) => (
  <button
    className="play-corner"
    onClick={onOpen}
    aria-pressed={active}
    aria-label={tr('Play yourself: retro console and quick games', 'Selbst zocken: Retro-Konsole und Schnellspiele')}
    title={tr('Play yourself: retro console and quick games', 'Selbst zocken: Retro-Konsole und Schnellspiele')}
    data-nav
  >
    <img src="/gaming/play-icon.webp" alt="" width={200} height={160} decoding="async" />
    <span>{tr('PLAY', 'ZOCKEN')}</span>
  </button>
);

type Pick = { title: string; go: () => void };

export const PlayZone: React.FC<{
  recent: string[];
  reducedMotion: boolean;
  /** Today's Blitz Challenge card, pinned on top. */
  challenge: React.ReactNode;
  onPlay: (launch: EmuLaunch, id?: string) => void;
  onPickMini: (id: MiniGameId) => void;
  onHall: () => void;
}> = ({ recent, reducedMotion, challenge, onPlay, onPickMini, onHall }) => {
  const bests = loadBests();
  const quick = MINI_GAMES.filter((g) => !isBlitz(g.id));
  const blitz = MINI_GAMES.filter((g) => isBlitz(g.id));
  const rank = (id: string) => {
    const i = recent.indexOf(id);
    return i < 0 ? Infinity : i;
  };
  // Console games: last played first, the others in their usual order.
  const consoleGames = FREE_GAMES.map((g, i) => ({ g, i })).sort((a, b) => rank(emuPlayId(a.g.id)) - rank(emuPlayId(b.g.id)) || a.i - b.i).map((x) => x.g);
  const lastConsole = recent.find((id) => id.startsWith('emu:'));

  // The random pick spins through the titles like the coin slot, then starts one.
  const [rolling, setRolling] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const pool: Pick[] = [
    ...FREE_GAMES.map((g) => ({ title: g.title, go: () => onPlay({ title: g.title, core: g.core, rom: g.rom }, g.id) })),
    ...quick.map((g) => ({ title: g.title, go: () => onPickMini(g.id) })),
  ];
  const randomGame = () => {
    if (rolling) return;
    chip.play('coin');
    const winner = pool[Math.floor(Math.random() * pool.length)];
    let ticks = reducedMotion ? 0 : 12;
    const spin = () => {
      if (ticks-- <= 0) {
        setRolling(null);
        winner.go();
        return;
      }
      setRolling(pool[Math.floor(Math.random() * pool.length)].title);
      chip.play('blip');
      timer.current = window.setTimeout(spin, 70 + (12 - ticks) * 14);
    };
    spin();
  };

  return (
    <div className="chill-panel play-zone">
      <h2 className="pixel-font play-zone-title">{tr('🕹️ PLAY YOURSELF', '🕹️ SELBST ZOCKEN')}</h2>
      <div className="play-zone-actions">
        <button className="px-btn big play-random" onClick={randomGame} data-nav>
          {rolling ? `▶ ${rolling}` : tr('🎲 RANDOM GAME', '🎲 ZUFALLSSPIEL')}
        </button>
        <button
          className="px-btn"
          onClick={() => {
            chip.play('select');
            onHall();
          }}
          data-nav
        >
          {tr('🏆 HALL OF FAME', '🏆 BESTENLISTE')}
        </button>
      </div>

      {/* The 30-second games come first and stand open (Marco, 2026-11-27:
          "Die Blitz spiele sollen im Zocken-Abteil als erstes kommen und die
          Liste soll direkt ausgeklappt sein"), under an American name. */}
      <section className="play-row" aria-label="Lightning Round">
        <details className="chill-list lightning-round" open>
          <summary data-nav>
            ⚡ LIGHTNING ROUND ({blitz.length})
          </summary>
          <MiniGameCorner onPick={onPickMini} blitz />
        </details>
      </section>

      {challenge}

      <section className="play-row" aria-label={tr('The retro console', 'Die Retro-Konsole')}>
        <h3 className="pixel-font">{tr('📺 THE RETRO CONSOLE', '📺 DIE RETRO-KONSOLE')}</h3>
        <div className="play-tiles">
          {consoleGames.map((g) => (
            <button
              key={g.id}
              className="panel play-tile"
              onClick={() => onPlay({ title: g.title, core: g.core, rom: g.rom }, g.id)}
              title={g.text}
              data-nav
            >
              {lastConsole === emuPlayId(g.id) && <span className="play-badge">{tr('LAST PLAYED', 'ZULETZT')}</span>}
              <span className="mini-icon" aria-hidden="true">
                {g.platform === 'NES' ? '🎮' : '🔋'}
              </span>
              <span className="pixel-font play-tile-title">{g.title.toUpperCase()}</span>
              <span className="dim play-tile-sub">
                {platformLabel(g.platform)} · {g.year}
              </span>
            </button>
          ))}
        </div>
        <details className="chill-list">
          <summary data-nav>{tr('💾 YOUR OWN GAME FILE', '💾 DEINE EIGENE SPIELDATEI')}</summary>
          <EmulatorCorner onPlay={(l) => onPlay(l)} ownOnly />
        </details>
      </section>

      <section className="play-row" aria-label={tr('Quick games', 'Schnellspiele')}>
        <h3 className="pixel-font">{tr('⚡ QUICK GAMES', '⚡ SCHNELLSPIELE')}</h3>
        <div className="play-tiles">
          {quick.map((g) => (
            <button key={g.id} className="panel play-tile" onClick={() => onPickMini(g.id)} title={g.text} data-nav>
              <span className="mini-icon" aria-hidden="true">
                {g.icon}
              </span>
              <span className="pixel-font play-tile-title">{g.title}</span>
              <span className={`play-tile-sub${bests[g.id] === undefined ? ' dim' : ' play-best'}`}>
                {bests[g.id] !== undefined ? g.best(bests[g.id]!) : tr('No record yet', 'Noch kein Rekord')}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
