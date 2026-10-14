import React, { useEffect } from 'react';
import { useChristmas } from '../lib/season';
import { playHoHoHo, playJingle } from '../lib/xmasSounds';

// The Christmas look (lib/season.ts): a string of fairy lights along the top
// edge, many small lights twinkling behind the pages and soft snow drifting
// down. Purely decorative, never in the way of a tap; with reduced motion
// the snow and lights stay still. Now and then a quiet jingle sounds, and
// every third one Santa says "Ho ho ho" (lib/xmasSounds.ts).

const FLAKES = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 4 + ((i * 7) % 6),
  delay: -((i * 1.9) % 14),
  duration: 11 + ((i * 3) % 9),
  drift: (i % 2 ? 1 : -1) * (10 + ((i * 5) % 20)),
}));

const BULBS = ['#d6312b', '#f2b630', '#2f8f4e', '#2f6fd6', '#f2b630'];

// Little lights scattered over the page, each blinking at its own pace.
const SPARKS = Array.from({ length: 44 }, (_, i) => ({
  left: (i * 29 + 7) % 100,
  top: (i * 53 + 11) % 100,
  size: 4 + (i % 3),
  color: BULBS[(i * 3) % BULBS.length],
  delay: -((i * 0.7) % 3),
  duration: 1.4 + ((i * 0.37) % 1.8),
}));

/** First jingle a while after the first tap, then every one to two minutes. */
function useChristmasSounds(on: boolean) {
  useEffect(() => {
    if (!on) return;
    let timer = 0;
    let count = 0;
    const next = (ms: number) => {
      timer = window.setTimeout(() => {
        if (document.visibilityState === 'visible') {
          count += 1;
          playJingle();
          if (count % 3 === 2) window.setTimeout(playHoHoHo, 3200);
        }
        next(60000 + Math.random() * 60000);
      }, ms);
    };
    // Browsers only play sound after a tap; start counting from there.
    const start = () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
      next(25000 + Math.random() * 15000);
    };
    window.addEventListener('pointerdown', start);
    window.addEventListener('keydown', start);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, [on]);
}

export const ChristmasDeco: React.FC = () => {
  const christmas = useChristmas();
  useChristmasSounds(christmas);
  if (!christmas) return null;
  return (
    <>
    <div aria-hidden="true" className="xmas-deco">
      <div className="xmas-sparks">
        {SPARKS.map((p, i) => (
          <span
            key={i}
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              color: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>
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
        {Array.from({ length: 36 }, (_, i) => (
          <span
            key={i}
            style={{
              background: BULBS[i % BULBS.length],
              color: BULBS[i % BULBS.length],
              animationDelay: `${(i % 4) * 0.45}s`,
              animationDuration: `${1.1 + (i % 5) * 0.3}s`,
            }}
          />
        ))}
      </div>
    </div>
    </>
  );
};
