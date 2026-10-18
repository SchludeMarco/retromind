import React from 'react';
import { TINT_TRACK, setColorTint, useColorTint } from '../lib/colorTint';
import { tr } from '../lib/i18n';

// The color slider from blue to orange (lib/colorTint.ts), under the text size.
export const ColorTintControl: React.FC = () => {
  const tint = useColorTint();
  const value = Math.round(tint * 100);
  return (
    <div className="mt-5">
      <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{tr('Screen color', 'Bildschirmfarbe')}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold" aria-hidden="true">{tr('Blue', 'Blau')}</span>
        <input
          type="range"
          min={-100}
          max={100}
          step={5}
          value={value}
          onChange={(e) => setColorTint(Number(e.target.value) / 100)}
          aria-label={tr('Screen color from blue to orange', 'Bildschirmfarbe von Blau bis Orange')}
          aria-valuetext={value === 0
            ? tr('As designed', 'Wie gestaltet')
            : value > 0
            ? tr(`${value} % towards orange`, `${value} % Richtung Orange`)
            : tr(`${-value} % towards blue`, `${-value} % Richtung Blau`)}
          className="rm-tint-slider flex-grow min-w-0"
          style={{ background: TINT_TRACK }}
        />
        <span className="text-xs font-bold" aria-hidden="true">{tr('Orange', 'Orange')}</span>
      </div>
      {value !== 0 && (
        <button
          type="button"
          onClick={() => setColorTint(0)}
          className="retro-button mt-2 px-3 py-1 border-2 border-retro-ink bg-white font-bold text-xs"
        >
          {tr('Back to normal', 'Zurück auf normal')}
        </button>
      )}
    </div>
  );
};
