import React from 'react';
import { tr } from '../lib/i18n';

export const FontSizeControl: React.FC<{ scale: number; onChange: (n: number) => void }> = ({ scale, onChange }) => (
  <div>
    <span className="block text-xs uppercase font-bold text-retro-brown mb-2">{tr('Text size', 'Schriftgröße')}</span>
    <div className="flex gap-1" role="group" aria-label={tr('Text size', 'Schriftgröße')}>
      {[1, 2, 3].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          aria-pressed={scale === n}
          aria-label={tr(`Text ${['normal', 'large', 'extra large'][n - 1]}`, `Schrift ${['normal', 'groß', 'sehr groß'][n - 1]}`)}
          className={`w-10 h-10 font-bold border-2 border-retro-ink ${scale === n ? 'bg-retro-ink text-white' : 'bg-white text-retro-ink'}`}
          style={{ fontSize: `${0.7 + n * 0.15}rem` }}
        >
          A
        </button>
      ))}
    </div>
  </div>
);
