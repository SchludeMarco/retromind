import React from 'react';

export const FontSizeControl: React.FC<{ scale: number; onChange: (n: number) => void }> = ({ scale, onChange }) => (
  <div className="rm-fixed fixed top-3 right-3 z-50 flex gap-1 bg-retro-cream border-2 border-retro-ink p-1" role="group" aria-label="Schriftgröße">
    {[1, 2, 3].map((n) => (
      <button
        key={n}
        onClick={() => onChange(n)}
        aria-pressed={scale === n}
        aria-label={`Schrift ${['normal', 'groß', 'sehr groß'][n - 1]}`}
        className={`w-8 h-8 font-bold border border-retro-ink ${scale === n ? 'bg-retro-ink text-white' : 'bg-white text-retro-ink'}`}
        style={{ fontSize: `${0.7 + n * 0.15}rem` }}
      >
        A
      </button>
    ))}
  </div>
);
