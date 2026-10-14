import React from 'react';
import { withMuteParam } from '../lib/mute';
import { withGoogleParam } from '../lib/googleLogin';
import { tr } from '../lib/i18n';
import '@fontsource/cinzel/latin-900.css';
import './gamingSignpost.css';

// ?from=zeitreise lets Gaming show a way back (gaming/lib/cameFrom.ts).
const GAMING_URL = 'https://retromind-gaming.vercel.app/?from=zeitreise';

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
// Red frame (Marco, 2026-10-14: "auffälliger, sowas wie rote Umrandung"): a
// red rim follows the torn board edge. Later the same day ("eher staubig"):
// the rim is matte and dusty, eaten away by a noise mask with pale dust specks.
// Light strip (Marco, 2026-10-14: "von einem animierten gelben Leuchtband
// umwickelt"): a yellow LED band winds around the board edge, dipping in
// front of it and out again, with lights chasing along it.
const BOARD = 'M10 25 L40 23 L44 27.5 L49 23 L120 24 L125 20.5 L131 25 L186 23 L203 36 L199.5 39.5 L222 52 L196 72 L191 69 L186 80 L151 79 L145 83.5 L139.5 79 L71 80 L65 76.5 L59 81 L13 79 L9 71 L13 66.5 L7 58 L10 46 L5.5 38.5 Z';
// A smooth stand-in for the torn board edge (the real edge is too jagged to
// wind a band around), rounded with Chaikin's corner cutting.
const STRIP_HULL: Array<[number, number]> = [
  [9, 27], [120, 23], [190, 24], [210, 40], [221, 52], [207, 64], [190, 79], [120, 80], [10, 78], [6, 52],
];
function smoothHull(points: Array<[number, number]>, rounds: number): Array<[number, number]> {
  let pts = points;
  for (let r = 0; r < rounds; r++) {
    const next: Array<[number, number]> = [];
    pts.forEach(([x0, y0], i) => {
      const [x1, y1] = pts[(i + 1) % pts.length];
      next.push([x0 * 0.75 + x1 * 0.25, y0 * 0.75 + y1 * 0.25], [x0 * 0.25 + x1 * 0.75, y0 * 0.25 + y1 * 0.75]);
    });
    pts = next;
  }
  return pts;
}
// The band: the hull, pushed in and out along its normal by a sine wave, so it
// crosses the board edge again and again. Where the wave runs inwards the band
// lies on the front of the board, where it runs outwards it is behind it, so
// it reads like a coil wound around the sign.
function stripPaths(): { back: string; front: string } {
  const hull = smoothHull(STRIP_HULL, 4);
  const dense: Array<[number, number]> = [];
  hull.forEach(([x0, y0], i) => {
    const [x1, y1] = hull[(i + 1) % hull.length];
    const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let k = 0; k < steps; k++) dense.push([x0 + ((x1 - x0) * k) / steps, y0 + ((y1 - y0) * k) / steps]);
  });
  const period = 30;
  let travelled = 0;
  const pts = dense.map(([x, y], i) => {
    const [px, py] = dense[(i - 1 + dense.length) % dense.length];
    const [nx, ny] = dense[(i + 1) % dense.length];
    if (i > 0) travelled += Math.hypot(x - px, y - py);
    const len = Math.hypot(nx - px, ny - py) || 1;
    // Outward normal (the hull runs clockwise on screen).
    const ox = (ny - py) / len;
    const oy = -(nx - px) / len;
    const phase = (travelled / period) * Math.PI * 2;
    const push = 7 * Math.sin(phase);
    return { at: `${(x + ox * push).toFixed(1)} ${(y + oy * push).toFixed(1)}`, front: Math.cos(phase) < 0 };
  });
  let front = '';
  pts.forEach((p, i) => {
    if (!p.front) return;
    front += `${i > 0 && pts[i - 1].front ? ' L' : ' M'}${p.at}`;
  });
  return { back: `M${pts.map((p) => p.at).join(' L')} Z`, front: front.trim() };
}
const STRIP = stripPaths();
const LETTER_LINES: Array<[string, number, number]> = [
  ['TO THE', 46, 15],
  ['GAMING ZONE', 68, 18],
];

const StripLayer: React.FC<{ d: string; dim?: boolean }> = ({ d, dim }) => (
  <g className="gaming-signpost-strip" pointerEvents="none" opacity={dim ? 0.75 : 1}>
    <path d={d} fill="none" stroke="#ffd21a" strokeWidth="6" opacity="0.55" filter="url(#gaming-sign-strip-glow)" />
    <path d={d} fill="none" stroke="#5a4a10" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={dim ? '#d9a800' : '#ffe066'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <path className="gaming-signpost-chase" d={d} fill="none" stroke="#fffbe0" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="0.1 6" />
  </g>
);

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
        {/* Matte, dusty red rim: noise eats holes into it. */}
        <filter id="gaming-sign-dusty" x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="3" seed="11" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  5 0 0 0 -1.4" result="mask" />
          <feComposite in="SourceGraphic" in2="mask" operator="in" />
        </filter>
        {/* Pale dust specks on the rim. */}
        <filter id="gaming-sign-dust" x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="5" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -1.5" result="mask" />
          <feComposite in="SourceGraphic" in2="mask" operator="in" />
        </filter>
        {/* Yellow halo of the light strip. */}
        <filter id="gaming-sign-strip-glow" x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="2.6" />
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
        {/* Back of the light strip, hidden behind the board where it crosses it. */}
        <StripLayer d={STRIP.back} dim />
        {/* Red frame: a dusty red rim peeking out past the dark edge. */}
        <path d={BOARD} fill="none" stroke="#9e2b21" strokeWidth="9" strokeLinejoin="miter" filter="url(#gaming-sign-dusty)" />
        <path d={BOARD} fill="none" stroke="#c9b7a0" strokeWidth="9" strokeLinejoin="miter" opacity="0.6" filter="url(#gaming-sign-dust)" />
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
        {/* Front of the light strip, lights chasing along it. */}
        <StripLayer d={STRIP.front} />
      </g>
    </svg>
  </a>
);
