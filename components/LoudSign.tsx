import React, { useEffect, useRef, useState } from 'react';
import './loudSign.css';

// A wooden sign hammered into the ground to the right of the start button,
// only while the sound is on (Marco, 2026-10-07): "Warning, extreme loud!".
// Switching the sound off buries it (it sinks into its mound of earth),
// switching it back on lets it rise again (Marco, 2026-10-07: "soll sich der
// Wegweiser vergraben"). Muted from the start, only the mound shows.
// Used by the Zeitreise welcome screen (SplashScreen) and the gaming
// entrance (gaming/components/Entrance). The sound itself also starts quiet
// and rises slowly (lib/startupFade), so there is time to switch it off.
export const LoudSign: React.FC<{ show: boolean }> = ({ show }) => {
  // No animation for the state the page opens with when that is "buried".
  const [moved, setMoved] = useState(show);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setMoved(true);
  }, [show]);
  return (
    <span
      className={`loud-sign ${show ? 'is-up' : 'is-buried'}${moved ? '' : ' no-anim'}`}
      role={show ? 'note' : undefined}
      aria-label={show ? 'Warning, extreme loud!' : undefined}
      aria-hidden={show ? undefined : true}
    >
      {/* Everything below the ground line is cut off, so the sign can sink in. */}
      <span className="loud-sign-clip">
        <svg className="loud-sign-body" viewBox="0 0 132 124" aria-hidden="true">
          <defs>
            <linearGradient id="loud-sign-board" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#c08a4e" />
              <stop offset="0.55" stopColor="#a06a35" />
              <stop offset="1" stopColor="#7a4d24" />
            </linearGradient>
            <linearGradient id="loud-sign-post" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#6b4320" />
              <stop offset="0.5" stopColor="#8d5c2e" />
              <stop offset="1" stopColor="#5a3818" />
            </linearGradient>
          </defs>
          {/* The stake; its point sits in the ground below. */}
          <path d="M60 52 h12 v58 l-6 9 l-6 -9z" fill="url(#loud-sign-post)" stroke="#3b2410" strokeWidth="1.5" />
          {/* The board, a little crooked, with wood grain and four nails. */}
          <g transform="rotate(-5 66 36)">
            <rect x="6" y="6" width="120" height="62" rx="4" fill="url(#loud-sign-board)" stroke="#3b2410" strokeWidth="2.5" />
            <path d="M12 20 q30 -4 56 1 t52 -2 M12 44 q34 4 60 -1 t48 2 M14 58 q24 -3 46 0" stroke="#6b4320" strokeWidth="1.2" fill="none" opacity="0.55" />
            <path d="M108 8 l-5 9 l3 6" stroke="#3b2410" strokeWidth="1.2" fill="none" opacity="0.7" />
            {[
              [14, 14],
              [118, 14],
              [14, 60],
              [118, 60],
            ].map(([x, y]) => (
              <g key={`${x}-${y}`}>
                <circle cx={x} cy={y} r="3.2" fill="#3d3d3d" />
                <circle cx={x - 0.9} cy={y - 0.9} r="1.1" fill="#bdbdbd" />
              </g>
            ))}
            <text className="loud-sign-text" x="66" y="28" textAnchor="middle" fontSize="16.5">
              WARNING,
            </text>
            <text className="loud-sign-text" x="66" y="44" textAnchor="middle" fontSize="16.5">
              EXTREME
            </text>
            <text className="loud-sign-text" x="66" y="62" textAnchor="middle" fontSize="16.5">
              LOUD!
            </text>
          </g>
        </svg>
      </span>
      {/* The little mound of earth the stake is driven into; it stays. */}
      <svg className="loud-sign-ground" viewBox="0 110 132 14" aria-hidden="true">
        <ellipse cx="66" cy="118" rx="22" ry="5" fill="#2a1a0c" opacity="0.75" />
        <path d="M42 118 q24 -11 48 0z" fill="#4a3018" />
        <path d="M50 116 l3 -2 M70 113 l3 1 M80 116 l2 -2" stroke="#2a1a0c" strokeWidth="1" />
      </svg>
    </span>
  );
};
