import React from 'react';

export const FontSizeControl: React.FC<{ scale: number; onChange: (n: number) => void }> = ({ scale, onChange }) => (
  <div>
    <span className="block text-xs uppercase font-bold text-retro-brown mb-2">Schriftgröße</span>
    <div className="flex gap-1" role="group" aria-label="Schriftgröße">
      {[1, 2, 3].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          aria-pressed={scale === n}
          aria-label={`Schrift ${['normal', 'groß', 'sehr groß'][n - 1]}`}
          className={`w-10 h-10 font-bold border-2 border-retro-ink ${scale === n ? 'bg-retro-ink text-white' : 'bg-white text-retro-ink'}`}
          style={{ fontSize: `${0.7 + n * 0.15}rem` }}
        >
          A
        </button>
      ))}
    </div>
  </div>
);
