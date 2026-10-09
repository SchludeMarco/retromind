import React, { useEffect, useMemo, useState } from 'react';
import { Game, GAMES, PLATFORM_COLORS } from '../data/games';
import { platformLabel } from '../data/platforms';
import { PixelCover } from './PixelCover';
import { tr } from '../../lib/i18n';

// Like an arcade cabinet nobody plays: after a while without input, the pixel
// tiles of the hand-picked games run by and INSERT COIN blinks. Any touch ends it.
export const ATTRACT_AFTER_MS = 60_000;
const SLIDE_MS = 3500;

const Slide: React.FC<{ game: Game }> = ({ game }) => {
  return (
    <div className="am-slide" style={{ ['--label' as string]: PLATFORM_COLORS[game.platform] ?? 'var(--a1)' }}>
      <PixelCover game={game} className="am-cover" showText={false} />
      <p className="pixel-font am-title">{game.title}</p>
      <p className="am-meta">
        {platformLabel(game.platform)}
        {game.year ? ` · ${game.year}` : ''}
      </p>
    </div>
  );
};

export const AttractMode: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const order = useMemo(() => [...GAMES].sort(() => Math.random() - 0.5), []);
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % order.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [order.length]);
  useEffect(() => {
    const exit = () => onExit();
    window.addEventListener('keydown', exit);
    return () => window.removeEventListener('keydown', exit);
  }, [onExit]);
  return (
    <div className="attract" role="button" tabIndex={0} aria-label={tr('Back to the hall', 'Zurück in die Halle')} onClick={onExit}>
      <p className="pixel-font am-head">{tr('HALL OF FAME', 'HALL OF FAME')}</p>
      <Slide key={order[i].id} game={order[i]} />
      <p className="pixel-font am-coin blink">INSERT COIN</p>
      <p className="am-hint">{tr('Tap anywhere to play', 'Irgendwo tippen zum Weiterspielen')}</p>
    </div>
  );
};
