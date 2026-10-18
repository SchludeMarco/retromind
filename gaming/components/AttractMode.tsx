import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Game, GAMES, PLATFORM_COLORS } from '../data/games';
import { platformLabel } from '../data/platforms';
import { PixelCover } from './PixelCover';
import { tr } from '../../lib/i18n';

// Like an arcade cabinet nobody plays: after a while without input, the pixel
// tiles of the hand-picked games run by and INSERT COIN blinks. Any touch ends it.
// Browsing (Marco, 2026-10-17): ◀ / ▶ (or a swipe, or the arrow keys) go to
// the previous game or on to the next random one, and tapping the game opens
// its page.
export const ATTRACT_AFTER_MS = 60_000;
const SLIDE_MS = 3500;
const SWIPE_PX = 40;

const Slide: React.FC<{ game: Game; onOpen: () => void }> = ({ game, onOpen }) => {
  return (
    <button
      type="button"
      className="am-slide"
      style={{ ['--label' as string]: PLATFORM_COLORS[game.platform] ?? 'var(--a1)' }}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      aria-label={tr(`Open ${game.title}`, `${game.title} öffnen`)}
    >
      <PixelCover game={game} className="am-cover" showText={false} />
      <span className="pixel-font am-title">{game.title}</span>
      <span className="am-meta">
        {platformLabel(game.platform)}
        {game.year ? ` · ${game.year}` : ''}
      </span>
    </button>
  );
};

export const AttractMode: React.FC<{ onExit: () => void; onOpen: (game: Game) => void }> = ({ onExit, onOpen }) => {
  const order = useMemo(() => [...GAMES].sort(() => Math.random() - 0.5), []);
  const [i, setI] = useState(0);
  // Bumped by every manual step, so the clock starts over from there.
  const [steps, setSteps] = useState(0);
  const go = useCallback(
    (by: number) => {
      setI((n) => (n + by + order.length) % order.length);
      setSteps((s) => s + 1);
    },
    [order.length]
  );
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % order.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [order.length, steps]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Enter') onOpen(order[i]);
      else onExit();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onExit, onOpen, go, order, i]);

  // A swipe sideways steps through the games instead of ending the show.
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const onPointerDown = (e: React.PointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY };
    swiped.current = false;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(e.clientY - s.y)) {
      swiped.current = true;
      go(dx < 0 ? 1 : -1);
    }
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (!swiped.current) return;
    swiped.current = false;
    e.stopPropagation();
  };
  const step = (by: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    go(by);
  };

  return (
    <div
      className="attract"
      role="button"
      tabIndex={0}
      aria-label={tr('Back to the hall', 'Zurück in die Halle')}
      onClick={onExit}
      onClickCapture={onClickCapture}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <p className="pixel-font am-head">{tr('HALL OF FAME', 'HALL OF FAME')}</p>
      <div className="am-stage">
        <button type="button" className="am-nav pixel-font" onClick={step(-1)} aria-label={tr('Previous game', 'Vorheriges Spiel')}>
          ◀
        </button>
        <Slide key={order[i].id} game={order[i]} onOpen={() => onOpen(order[i])} />
        <button type="button" className="am-nav pixel-font" onClick={step(1)} aria-label={tr('Next game', 'Nächstes Spiel')}>
          ▶
        </button>
      </div>
      <p className="pixel-font am-coin blink">INSERT COIN</p>
      <p className="am-hint">
        {tr('Tap the game to open it, anywhere else to play', 'Spiel antippen zum Öffnen, daneben zum Weiterspielen')}
      </p>
    </div>
  );
};
