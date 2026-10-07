import React from 'react';
import { withMuteParam } from '../lib/mute';
import { withGoogleParam } from '../lib/googleLogin';
import './gamingSignpost.css';

const GAMING_URL = 'https://retromind-gaming.vercel.app/';

// Wooden signpost on the Zeitreise start page (Marco, 2026-10-07): "To the
// gaming zone", a click leads to RetroMind – Gaming. Same wood as the
// "Warning, extreme loud!" sign (LoudSign.tsx), but with an arrow board.
// The gaming edition lives on its own origin, so the mute and Google choice
// travel along as URL parameters; they are read at click time so a toggle
// made after the page rendered still counts.
export const GamingSignpost: React.FC = () => (
  <a
    className="gaming-signpost"
    href={withGoogleParam(withMuteParam(GAMING_URL))}
    onClick={(e) => {
      e.currentTarget.href = withGoogleParam(withMuteParam(GAMING_URL));
    }}
    aria-label="To the gaming zone – zu RetroMind Gaming"
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
      </defs>
      {/* The post, standing in a little mound of earth. */}
      <ellipse cx="46" cy="144" rx="24" ry="5" fill="#2a1a0c" opacity="0.6" />
      <path d="M40 14 h12 v122 l-6 8 l-6 -8z" fill="url(#gaming-sign-post)" stroke="#3b2410" strokeWidth="1.5" />
      <path d="M22 143 q24 -9 48 0" fill="#4a3018" />
      {/* The arrow board, pointing right, a little crooked. */}
      <g className="gaming-signpost-board" transform="rotate(-4 46 52)">
        <path
          d="M8 24 H186 L222 52 L186 80 H8 Z"
          fill="url(#gaming-sign-board)"
          stroke="#3b2410"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M14 36 q40 -4 80 1 t86 -2 M14 70 q46 4 90 -1 t80 2"
          stroke="#6b4320"
          strokeWidth="1.2"
          fill="none"
          opacity="0.55"
        />
        {[
          [46, 32],
          [46, 72],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="3.2" fill="#3d3d3d" />
            <circle cx={x - 0.9} cy={y - 0.9} r="1.1" fill="#bdbdbd" />
          </g>
        ))}
        <text className="gaming-signpost-text" x="110" y="48" textAnchor="middle" fontSize="17">
          TO THE
        </text>
        <text className="gaming-signpost-text" x="110" y="70" textAnchor="middle" fontSize="20">
          GAMING ZONE
        </text>
      </g>
    </svg>
  </a>
);
