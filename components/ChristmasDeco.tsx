import React from 'react';
import { useChristmas } from '../lib/season';

// The Christmas look (lib/season.ts): a string of fairy lights along the top
// edge and soft snow drifting down behind the pages. Purely decorative, never
// in the way of a tap; with reduced motion the snow stays still.

const FLAKES = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 4 + ((i * 7) % 6),
  delay: -((i * 1.9) % 14),
  duration: 11 + ((i * 3) % 9),
  drift: (i % 2 ? 1 : -1) * (10 + ((i * 5) % 20)),
}));

const BULBS = ['#d6312b', '#f2b630', '#2f8f4e', '#2f6fd6', '#f2b630'];

export const ChristmasDeco: React.FC = () => {
  if (!useChristmas()) return null;
  return (
    <>
    <div aria-hidden="true" className="xmas-deco">
      <div className="xmas-snow">
        {FLAKES.map((f, i) => (
          <span
            key={i}
            style={{
              left: `${f.left}%`,
              width: f.size,
              height: f.size,
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.duration}s`,
              ['--drift' as string]: `${f.drift}px`,
            }}
          />
        ))}
      </div>
    </div>
    <div aria-hidden="true" className="xmas-garland">
      <svg className="xmas-lights" viewBox="0 0 1000 24" preserveAspectRatio="none">
        <path d="M0 4 Q 50 18 100 4 T 200 4 T 300 4 T 400 4 T 500 4 T 600 4 T 700 4 T 800 4 T 900 4 T 1000 4" fill="none" stroke="#2c4a2e" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="xmas-bulbs">
        {Array.from({ length: 20 }, (_, i) => (
          <span key={i} style={{ background: BULBS[i % BULBS.length], color: BULBS[i % BULBS.length], animationDelay: `${(i % 4) * 0.45}s` }} />
        ))}
      </div>
    </div>
    </>
  );
};
