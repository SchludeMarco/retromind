import React, { useEffect, useRef } from 'react';
import { Game, PLATFORM_COLORS } from '../data/games';
import { platformLabel } from '../data/platforms';
import { useCover } from '../lib/covers';
import { chip } from '../lib/chiptune';

// Opening a game: the cartridge slides into a console slot, clicks home, the
// screen flickers, and the game page "boots" (gamer review, 2026-10-08).
export const INSERT_MS = 950;

export const CartInsert: React.FC<{ game: Game; onDone: () => void }> = ({ game, onDone }) => {
  const cover = useCover(game.wiki);
  const finish = useRef(onDone);
  finish.current = onDone;
  useEffect(() => {
    const click = setTimeout(() => chip.play('start'), INSERT_MS * 0.55);
    const done = setTimeout(() => finish.current(), INSERT_MS);
    return () => {
      clearTimeout(click);
      clearTimeout(done);
    };
  }, []);
  return (
    <div className="cart-insert" aria-hidden="true" onClick={() => finish.current()}>
      <div className="ci-cart" style={{ ['--label' as string]: PLATFORM_COLORS[game.platform] ?? 'var(--a1)' }}>
        {cover ? <img src={cover} alt="" /> : <span className="ci-title pixel-font">{game.title}</span>}
        <span className="ci-meta">{platformLabel(game.platform)}</span>
      </div>
      <div className="ci-console">
        <span className="ci-slot" />
        <span className="ci-led" />
      </div>
      <div className="ci-flash" />
    </div>
  );
};
