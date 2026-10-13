import React from 'react';
import { withMuteParam } from '../lib/mute';
import { withGoogleParam } from '../lib/googleLogin';
import { tr } from '../lib/i18n';
import '@fontsource/cinzel/latin-900.css';
import './gamingSignpost.css';

const GAMING_URL = 'https://retromind-gaming.vercel.app/';

// Wooden signpost on the Zeitreise start page (Marco, 2026-10-07): "To the
// gaming zone", a click leads to RetroMind – Gaming. Same wood as the
// "Warning, extreme loud!" sign (LoudSign.tsx), but with an arrow board.
// The gaming edition lives on its own origin, so the mute and Google choice
// travel along as URL parameters; they are read at click time so a toggle
// made after the page rendered still counts.
// Lettering (Marco, 2026-10-13): chiseled Greek capitals in brushed metal,
// reminiscent of the God of War logo. The original logo font is not free,
// so this uses Cinzel (SIL Open Font License), self-hosted via Fontsource.
// Battle-worn (Marco, 2026-10-13): torn board edges, blade cuts, scorch marks
// and a cracked outline around the letters. The outline is eroded by a fixed
// noise pattern (seeded), so it looks the same on every visit.
const BOARD = 'M10 25 L40 23 L44 27.5 L49 23 L120 24 L125 20.5 L131 25 L186 23 L203 36 L199.5 39.5 L222 52 L196 72 L191 69 L186 80 L151 79 L145 83.5 L139.5 79 L71 80 L65 76.5 L59 81 L13 79 L9 71 L13 66.5 L7 58 L10 46 L5.5 38.5 Z';
const LETTER_LINES: Array<[string, number, number]> = [
  ['TO THE', 46, 15],
  ['GAMING ZONE', 68, 18],
];

export const GamingSignpost: React.FC = () => (
  <a
    className="gaming-signpost"
    href={withGoogleParam(withMuteParam(GAMING_URL))}
    onClick={(e) => {
      e.currentTarget.href = withGoogleParam(withMuteParam(GAMING_URL));
    }}
    aria-label={tr('To the gaming zone – to RetroMind Gaming', 'To the gaming zone – zu RetroMind Gaming')}
  >
    <svg viewBox="0 0 230 150" aria-hidden="true">
      <defs>
        <linearGradient id="gaming-sign-board" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c08a4e" />
          <stop offset="0.55" stopColor="#a06a35" />
          <stop offset="1" stopColor="#7a4d24" />
        </linearGradient>
        <linearGradient id="gaming-sign-post" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6b4320" />
          <stop offset="0.5" stopColor="#8d5c2e" />
          <stop offset="1" stopColor="#5a3818" />
        </linearGradient>
        <linearGradient id="gaming-sign-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f1ea" />
          <stop offset="0.45" stopColor="#c9c4ba" />
          <stop offset="0.55" stopColor="#8e877c" />
          <stop offset="1" stopColor="#d8d2c6" />
        </linearGradient>
        <radialGradient id="gaming-sign-scorch">
          <stop offset="0" stopColor="#120600" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#2b1104" stopOpacity="0.75" />
          <stop offset="0.75" stopColor="#5a2a0c" stopOpacity="0.35" />
          <stop offset="1" stopColor="#5a2a0c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="gaming-sign-ember">
          <stop offset="0" stopColor="#ff8a2a" stopOpacity="0" />
          <stop offset="0.55" stopColor="#ff8a2a" stopOpacity="0" />
          <stop offset="0.7" stopColor="#ff6a10" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ff6a10" stopOpacity="0" />
        </radialGradient>
        <clipPath id="gaming-sign-clip">
          <path d={BOARD} />
        </clipPath>
        {/* Noise mask that knocks gaps into the letter outline. */}
        <filter id="gaming-sign-cracked" x="-5%" y="-30%" width="110%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.32" numOctaves="3" seed="7" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  9 0 0 0 -3.9" result="mask" />
          <feComposite in="SourceGraphic" in2="mask" operator="in" />
        </filter>
        {/* Slightly rough, chipped metal faces. */}
        <filter id="gaming-sign-chipped" x="-5%" y="-30%" width="110%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.9" result="rough" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  10 0 0 0 -2.0" result="mask" />
          <feComposite in="rough" in2="mask" operator="in" />
        </filter>
      </defs>
      {/* The post, standing in a little mound of earth. */}
      <ellipse cx="46" cy="144" rx="24" ry="5" fill="#2a1a0c" opacity="0.6" />
      <path d="M40 14 h12 v122 l-6 8 l-6 -8z" fill="url(#gaming-sign-post)" stroke="#3b2410" strokeWidth="1.5" />
      <path d="M22 143 q24 -9 48 0" fill="#4a3018" />
      {/* The arrow board, pointing right, a little crooked. */}
      <g className="gaming-signpost-board" transform="rotate(-4 46 52)">
        <path d={BOARD} fill="url(#gaming-sign-board)" stroke="#3b2410" strokeWidth="2.2" strokeLinejoin="miter" />
        <g clipPath="url(#gaming-sign-clip)">
          <path
            d="M14 36 q40 -4 80 1 t86 -2 M14 70 q46 4 90 -1 t80 2"
            stroke="#6b4320"
            strokeWidth="1.2"
            fill="none"
            opacity="0.55"
          />
          {/* Scorch marks: charred arrow tip, burnt lower corner, a smudge on top. */}
          <ellipse cx="214" cy="52" rx="34" ry="30" fill="url(#gaming-sign-scorch)" />
          <ellipse cx="214" cy="52" rx="34" ry="30" fill="url(#gaming-sign-ember)" />
          <ellipse cx="6" cy="80" rx="30" ry="20" fill="url(#gaming-sign-scorch)" />
          <ellipse cx="6" cy="80" rx="30" ry="20" fill="url(#gaming-sign-ember)" />
          <ellipse cx="130" cy="20" rx="26" ry="9" fill="url(#gaming-sign-scorch)" opacity="0.8" />
          <ellipse cx="148" cy="84" rx="20" ry="8" fill="url(#gaming-sign-scorch)" opacity="0.7" />
          {/* Blade cuts: dark gash with a pale splintered edge. */}
          {[
            'M20 31 L39 47',
            'M150 27 L176 41',
            'M156 25 L183 39',
            'M88 73 L118 77.5',
            'M176 62 L196 50',
          ].map((d) => (
            <g key={d}>
              <path d={d} stroke="#e2b37a" strokeWidth="2.6" strokeLinecap="round" opacity="0.55" />
              <path d={d} stroke="#1c0b02" strokeWidth="1.4" strokeLinecap="round" />
            </g>
          ))}
        </g>
        {[
          [46, 32],
          [46, 72],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="3.2" fill="#3d3d3d" />
            <circle cx={x - 0.9} cy={y - 0.9} r="1.1" fill="#bdbdbd" />
          </g>
        ))}
        {LETTER_LINES.map(([word, y, size]) => (
          <g key={word}>
            <text
              className="gaming-signpost-text gaming-signpost-edge"
              x="116"
              y={y}
              textAnchor="middle"
              fontSize={size}
              filter="url(#gaming-sign-cracked)"
            >
              {word}
            </text>
            <text
              className="gaming-signpost-text gaming-signpost-face"
              x="116"
              y={y}
              textAnchor="middle"
              fontSize={size}
              filter="url(#gaming-sign-chipped)"
            >
              {word}
            </text>
          </g>
        ))}
      </g>
    </svg>
  </a>
);
