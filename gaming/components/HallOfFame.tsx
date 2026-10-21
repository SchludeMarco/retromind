import React, { useEffect, useMemo, useState } from 'react';
import { chip } from '../lib/chiptune';
import { BOARD_GAMES, BoardGame, Entry, fetchBoard, fetchWeekBoard, formatScore, isDuelGame } from '../lib/highscores';
import { Likes, fetchLikes, setLike } from '../lib/likes';
import { RivalNews, fetchRivalNews } from '../lib/rivals';
import { ScoreTable } from './minigames/HighscoreBoard';
import { MINI_GAMES } from './MiniGames';
import { loadBests } from './minigames/shared';
import { LOCALE, tr } from '../../lib/i18n';

// The "Hall of Fame" (Marco, 2026-10-19: a high score board per game in
// retro style): every mini game's table of all guests on one glowing screen,
// with this week's duel table and who passed you lately. Marco (2026-10-20)
// found paging game by game with arrows too clumsy for finding one game, so
// it opens on a searchable list of all games; a tap opens that game's table.
// Each game has a heart (Marco, 2026-10-21): guests like a game, everyone
// sees how many did.

const gameInfo = (g: BoardGame) => MINI_GAMES.find((m) => m.id === g)!;

function ago(at: number): string {
  const min = Math.round((Date.now() - at) / 60_000);
  if (min < 60) return tr(`${Math.max(min, 1)} min ago`, `vor ${Math.max(min, 1)} Min.`);
  const h = Math.round(min / 60);
  if (h < 24) return tr(`${h} h ago`, `vor ${h} Std.`);
  return new Date(at).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' });
}

const LikeButton: React.FC<{ game: BoardGame; likes: Likes; onToggle: (game: BoardGame) => void; big?: boolean }> = ({ game, likes, onToggle, big }) => {
  const liked = likes.mine.has(game);
  const count = likes.counts[game] ?? 0;
  const name = gameInfo(game)?.title ?? game;
  return (
    <button
      className={`hof-like${liked ? ' liked' : ''}${big ? ' big' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(game);
      }}
      aria-pressed={liked}
      aria-label={liked ? tr(`Unlike ${name} (${count} likes)`, `${name} nicht mehr liken (${count} Likes)`) : tr(`Like ${name} (${count} likes)`, `${name} liken (${count} Likes)`)}
      data-nav
    >
      <span className="hof-like-heart" aria-hidden="true">
        {liked ? '♥' : '♡'}
      </span>
      {big && <span className="pixel-font hof-like-word">{liked ? tr('LIKED', 'GELIKT') : tr('LIKE', 'LIKEN')}</span>}
      {(big || count > 0) && <span className="pixel-font hof-like-count">{count}</span>}
    </button>
  );
};

export const HallOfFame: React.FC<{ start?: BoardGame; onPlay: (game: BoardGame) => void; onClose: () => void }> = ({ start, onPlay, onClose }) => {
  const [game, setGame] = useState<BoardGame | null>(start ?? null);
  const [query, setQuery] = useState('');
  const [board, setBoard] = useState<Entry[] | null>(null);
  const [week, setWeek] = useState<Entry[] | null>(null);
  const [news, setNews] = useState<RivalNews[]>([]);
  const [likes, setLikes] = useState<Likes>({ counts: {}, mine: new Set() });
  const bests = useMemo(() => loadBests(), []);

  useEffect(() => {
    fetchRivalNews().then((n) => setNews(n.slice(0, 5)));
    fetchLikes().then(setLikes);
  }, []);

  const toggleLike = (g: BoardGame) => {
    const on = !likes.mine.has(g);
    chip.play(on ? 'select' : 'back');
    const mine = new Set(likes.mine);
    if (on) mine.add(g);
    else mine.delete(g);
    const guess = Math.max(0, (likes.counts[g] ?? 0) + (on ? 1 : -1));
    setLikes((l) => ({ counts: { ...l.counts, [g]: guess }, mine }));
    setLike(g, on).then((count) => {
      if (count !== null) setLikes((l) => ({ ...l, counts: { ...l.counts, [g]: count } }));
    });
  };

  useEffect(() => {
    if (!game) return;
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

  const open = (g: BoardGame) => {
    chip.play('blip');
    setGame(g);
  };
  const back = () => {
    chip.play('back');
    setGame(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (game) back();
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Search by the shown title and the German one, so either language finds it.
  const q = query.trim().toLowerCase();
  const games = BOARD_GAMES.filter((g) => {
    if (!q) return true;
    const m = gameInfo(g);
    return !!m && (m.title.toLowerCase().includes(q) || m.statKey.toLowerCase().includes(q) || g.includes(q));
  });
  const info = game ? gameInfo(game) : null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className={`dialog hof-dialog${game ? '' : ' picking'}`} role="dialog" aria-modal="true" aria-label={tr('Hall of Fame', 'Bestenliste')} onClick={(e) => e.stopPropagation()}>
        <button className="px-btn close-x" onClick={onClose} aria-label={tr('Close', 'Schließen')} data-nav>
          ✕
        </button>
        <h2 className="pixel-font hof-title">{tr('★ HALL OF FAME ★', '★ BESTENLISTE ★')}</h2>

        {!game || !info ? (
          <div>
            <div className="search hof-search">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tr('Find a game …', 'Spiel suchen …')}
                aria-label={tr('Find a game', 'Spiel suchen')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && games.length === 1) open(games[0]);
                }}
              />
            </div>
            <ul className="hof-list" aria-label={tr('All games', 'Alle Spiele')}>
              {games.map((g) => {
                const m = gameInfo(g);
                const best = bests[g as keyof typeof bests];
                return (
                  <li key={g} className="hof-item">
                    <button className="hof-row" onClick={() => open(g)} data-nav>
                      <span className="hof-row-icon" aria-hidden="true">
                        {m?.icon}
                      </span>
                      <span className="hof-row-text">
                        <span className="pixel-font hof-row-title">{m?.title ?? g}</span>
                        {best !== undefined && m && <span className="dim hof-row-best">{m.best(best)}</span>}
                      </span>
                      {isDuelGame(g) && <span className="pixel-font hof-row-duel">{tr('⚔️ DUEL', '⚔️ DUELL')}</span>}
                      <span className="hof-row-go" aria-hidden="true">
                        ▶
                      </span>
                    </button>
                    <LikeButton game={g} likes={likes} onToggle={toggleLike} />
                  </li>
                );
              })}
            </ul>
            {games.length === 0 && <p className="pixel-font hof-none">{tr('NO GAME BY THAT NAME.', 'KEIN SPIEL MIT DIESEM NAMEN.')}</p>}
          </div>
        ) : (
          <>
            <div className="hof-switch">
              <button className="px-btn hof-back" onClick={back} data-nav>
                ◀ {tr('ALL GAMES', 'ALLE SPIELE')}
              </button>
            </div>
            <div className="hof-game pixel-font" aria-live="polite">
              <span aria-hidden="true">{info.icon}</span> {info.title}
            </div>
            <div className="hof-like-row">
              <LikeButton game={game} likes={likes} onToggle={toggleLike} big />
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
          </>
        )}

        {news.length > 0 && (
          <section className="hof-news" aria-label={tr('Who passed you', 'Wer dich überholt hat')}>
            <h3 className="pixel-font">{tr('⚔️ WHO PASSED YOU', '⚔️ WER DICH ÜBERHOLT HAT')}</h3>
            <ul>
              {news.map((n) => (
                <li key={`${n.game}-${n.at}`}>
                  <button className="hof-news-item" onClick={() => open(n.game)} data-nav>
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
