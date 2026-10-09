import React, { useEffect, useRef } from 'react';
import { Game, PLATFORM_COLORS } from '../data/games';
import { platformLabel } from '../data/platforms';
import { PixelCover } from './PixelCover';
import { chip } from '../lib/chiptune';

// Opening a game: the cartridge floats in, lines up over the console slot and
// is pushed in (masked below the slot line so it really goes inside) with a
// full thunk, clicks home, the power LED comes on and the TV switches on. Tap
// to skip.
export const INSERT_MS = 1300;

export const CartInsert: React.FC<{ game: Game; onDone: () => void }> = ({ game, onDone }) => {
  const finish = useRef(onDone);
  finish.current = onDone;
  useEffect(() => {
    // The push runs from 34 % to 55 % of the animation (ci-insert in gaming.css).
    const push = setTimeout(() => chip.insert(INSERT_MS * 0.21 / 1000), INSERT_MS * 0.34);
    const power = setTimeout(() => chip.play('start'), INSERT_MS * 0.74);
    const done = setTimeout(() => finish.current(), INSERT_MS);
    return () => {
      clearTimeout(push);
      clearTimeout(power);
      clearTimeout(done);
    };
  }, []);
  return (
    <div className="cart-insert" aria-hidden="true" onClick={() => finish.current()}>
      <div className="ci-stage">
        <div className="ci-console">
          <div className="ci-top">
            <span className="ci-slot" />
          </div>
          <div className="ci-front">
            <span className="ci-led" />
            <span className="ci-power" />
            <span className="ci-brand pixel-font">RETROMIND</span>
          </div>
        </div>
        <div className="ci-mask">
          <div className="ci-cart" style={{ ['--label' as string]: PLATFORM_COLORS[game.platform] ?? 'var(--a1)' }}>
            <span className="ci-label">
              <span className="ci-meta pixel-font">{platformLabel(game.platform)}</span>
              <PixelCover game={game} className="ci-cover" />
            </span>
          </div>
        </div>
        <span className="ci-lip" />
      </div>
      <div className="ci-crt" />
    </div>
  );
};
