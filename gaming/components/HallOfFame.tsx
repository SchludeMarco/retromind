import React, { useEffect, useState } from 'react';
import { chip } from '../lib/chiptune';
import { BOARD_GAMES, BoardGame, Entry, fetchBoard, fetchWeekBoard, formatScore, isDuelGame } from '../lib/highscores';
import { RivalNews, fetchRivalNews } from '../lib/rivals';
import { ScoreTable } from './minigames/HighscoreBoard';
import { MINI_GAMES } from './MiniGames';
import { LOCALE, tr } from '../../lib/i18n';

// The "Hall of Fame" (Marco, 2026-10-19: a high score board per game in
// retro style): every mini game's table of all guests on one glowing screen,
// flipped through like the attract mode of an old cabinet, with this week's
// duel table and who passed you lately.

const gameInfo = (g: BoardGame) => MINI_GAMES.find((m) => m.id === g)!;

function ago(at: number): string {
  const min = Math.round((Date.now() - at) / 60_000);
  if (min < 60) return tr(`${Math.max(min, 1)} min ago`, `vor ${Math.max(min, 1)} Min.`);
  const h = Math.round(min / 60);
  if (h < 24) return tr(`${h} h ago`, `vor ${h} Std.`);
  return new Date(at).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' });
}

export const HallOfFame: React.FC<{ start?: BoardGame; onPlay: (game: BoardGame) => void; onClose: () => void }> = ({ start, onPlay, onClose }) => {
  const [game, setGame] = useState<BoardGame>(start ?? BOARD_GAMES[0]);
  const [board, setBoard] = useState<Entry[] | null>(null);
  const [week, setWeek] = useState<Entry[] | null>(null);
  const [news, setNews] = useState<RivalNews[]>([]);

  useEffect(() => {
    fetchRivalNews().then((n) => setNews(n.slice(0, 5)));
  }, []);

  useEffect(() => {
    let alive = true;
    setBoard(null);
    setWeek(null);
    Promise.all([fetchBoard(game), isDuelGame(game) ? fetchWeekBoard(game) : Promise.resolve(null)]).then(([b, w]) => {
      if (!alive) return;
      setBoard(b);
      setWeek(w);
    });
    return () => {
      alive = false;
    };
  }, [game]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const step = (d: number) => {
    chip.play('blip');
    setGame((g) => BOARD_GAMES[(BOARD_GAMES.indexOf(g) + d + BOARD_GAMES.length) % BOARD_GAMES.length]);
  };
  const info = gameInfo(game);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="dialog hof-dialog" role="dialog" aria-modal="true" aria-label={tr('Hall of Fame', 'Bestenliste')} onClick={(e) => e.stopPropagation()}>
        <button className="px-btn close-x" onClick={onClose} aria-label={tr('Close', 'Schließen')} data-nav>
          ✕
        </button>
        <h2 className="pixel-font hof-title">{tr('★ HALL OF FAME ★', '★ BESTENLISTE ★')}</h2>

        <div className="hof-switch">
          <button className="px-btn" onClick={() => step(-1)} aria-label={tr('Previous game', 'Voriges Spiel')} data-nav>
            ◀
          </button>
          <div className="hof-game pixel-font" aria-live="polite">
            <span aria-hidden="true">{info.icon}</span> {info.title}
          </div>
          <button className="px-btn" onClick={() => step(1)} aria-label={tr('Next game', 'Nächstes Spiel')} data-nav>
            ▶
          </button>
        </div>
        <div className="hof-dots" aria-hidden="true">
          {BOARD_GAMES.map((g) => (
            <span key={g} className={g === game ? 'on' : undefined} />
          ))}
        </div>

        <div className="hof-screen">
          {board === null ? (
            <p className="pixel-font hof-empty blink">{tr('LOADING …', 'LADE …')}</p>
          ) : (
            <>
              {week && week.length > 0 && (
                <>
                  <p className="pixel-font hs-week-title">{tr('THIS WEEK’S DUEL', 'WOCHEN-DUELL')}</p>
                  <ScoreTable game={game} entries={week.slice(0, 5)} />
                  <p className="pixel-font hs-week-title">{tr('ALL TIME', 'ALLE ZEITEN')}</p>
                </>
              )}
              {board.length > 0 ? (
                <ScoreTable game={game} entries={board} />
              ) : (
                <p className="pixel-font hof-empty">{tr('NO ENTRIES YET. BE THE FIRST!', 'NOCH KEIN EINTRAG. SEI DER ERSTE!')}</p>
              )}
            </>
          )}
        </div>
        <p className="dim hof-hint">{tr('Your own entries glow. Pass someone and they get a message.', 'Deine eigenen Einträge leuchten. Wen du überholst, der bekommt eine Nachricht.')}</p>

        <div className="settings-row hof-actions">
          <button
            className="px-btn big"
            onClick={() => {
              chip.play('select');
              onPlay(game);
            }}
            data-nav
            autoFocus
          >
            ▶ {tr('PLAY', 'SPIELEN')}
          </button>
        </div>

        {news.length > 0 && (
          <section className="hof-news" aria-label={tr('Who passed you', 'Wer dich überholt hat')}>
            <h3 className="pixel-font">{tr('⚔️ WHO PASSED YOU', '⚔️ WER DICH ÜBERHOLT HAT')}</h3>
            <ul>
              {news.map((n) => (
                <li key={`${n.game}-${n.at}`}>
                  <button className="hof-news-item" onClick={() => setGame(n.game)} data-nav>
                    <span className="pixel-font">{n.name}</span> {gameInfo(n.game)?.title ?? n.game} · {formatScore(n.game, n.score)}{' '}
                    <span className="dim">{ago(n.at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};
