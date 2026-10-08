import React, { useEffect, useRef } from 'react';
import { Game, PLATFORM_COLORS } from '../data/games';
import { platformLabel } from '../data/platforms';
import { useCover } from '../lib/covers';
import { chip } from '../lib/chiptune';

// Opening a game: the cartridge floats in, lines up over the console slot and
// is pushed in (masked below the slot line so it really goes inside), clicks
// home, the power LED comes on and the TV switches on. Tap to skip.
export const INSERT_MS = 1300;

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
              {cover ? <img src={cover} alt="" /> : <span className="ci-title pixel-font">{game.title}</span>}
            </span>
          </div>
        </div>
        <span className="ci-lip" />
      </div>
      <div className="ci-crt" />
    </div>
  );
};
