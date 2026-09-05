import React from 'react';

const FACE_CX = 135;
const FACE_CY = 110;
const NUMERAL_R = 48;

const numerals = Array.from({ length: 12 }, (_, i) => {
  const hour = i + 1;
  const angle = (hour / 12) * 2 * Math.PI - Math.PI / 2;
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][i];
  return {
    n: roman,
    x: FACE_CX + NUMERAL_R * Math.cos(angle),
    y: FACE_CY + NUMERAL_R * Math.sin(angle),
  };
});

const ticks = Array.from({ length: 60 }, (_, i) => {
  const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
  const isHour = i % 5 === 0;
  const rOuter = 58;
  const rInner = isHour ? 50 : 54;
  return {
    x1: FACE_CX + rInner * Math.cos(angle),
    y1: FACE_CY + rInner * Math.sin(angle),
    x2: FACE_CX + rOuter * Math.cos(angle),
    y2: FACE_CY + rOuter * Math.sin(angle),
    strokeWidth: isHour ? 1.4 : 0.5,
  };
});

// A stylized old wooden "tambour" mantel clock, dim and almost swallowed by
// the dark — only the brass and the dial's faint glow catch the light.
// Purely decorative background watermark (aria-hidden). Hands start at the
// classic "ten past ten" pose and then drift on, slowly and not to real
// time — this is meant to feel a little uncanny, not tell the hour.
export const MantelClock: React.FC<{ className?: string }> = ({ className }) => {
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <svg aria-hidden="true" viewBox="0 0 320 220" className={className}>
      <defs>
        <linearGradient id="mc-wood" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3a2414" />
          <stop offset="55%" stopColor="#23150c" />
          <stop offset="100%" stopColor="#0d0906" />
        </linearGradient>
        <radialGradient id="mc-dome" cx="32%" cy="28%" r="85%">
          <stop offset="0%" stopColor="#4a3220" />
          <stop offset="45%" stopColor="#2b1c11" />
          <stop offset="100%" stopColor="#0d0805" />
        </radialGradient>
        <radialGradient id="mc-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#caa869" stopOpacity="0.35" />
          <stop offset="55%" stopColor="#caa869" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#caa869" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mc-brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e6c477" />
          <stop offset="40%" stopColor="#9c7a34" />
          <stop offset="70%" stopColor="#e6c477" />
          <stop offset="100%" stopColor="#5a4520" />
        </linearGradient>
        <radialGradient id="mc-dial" cx="48%" cy="42%" r="65%">
          <stop offset="0%" stopColor="#3a2c1a" />
          <stop offset="60%" stopColor="#1c1610" />
          <stop offset="100%" stopColor="#0d0905" />
        </radialGradient>
        <linearGradient id="mc-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="30%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="65%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="mc-glass-clip">
          <circle cx={FACE_CX} cy={FACE_CY} r="66" />
        </clipPath>
      </defs>

      {/* ground shadow */}
      <ellipse cx="165" cy="203" rx="130" ry="11" fill="#000000" opacity="0.35" />

      {/* napoleon-hat case, rising steep on the left behind the face and
          tapering low to the right, like the case receding away from camera */}
      <path
        d="M40,178 C40,55 95,18 150,18 C205,18 262,55 272,115 C276,145 276,163 272,178 Z"
        fill="url(#mc-dome)"
        stroke="#000000"
        strokeWidth="1"
      />

      {/* base plinth with small feet */}
      <rect x="20" y="178" width="280" height="30" rx="6" fill="url(#mc-wood)" stroke="#000000" strokeWidth="1" />
      <rect x="24" y="180" width="272" height="6" rx="3" fill="#4a3220" opacity="0.4" />
      <ellipse cx="45" cy="211" rx="9" ry="6" fill="url(#mc-wood)" />
      <ellipse cx="275" cy="211" rx="9" ry="6" fill="url(#mc-wood)" />

      {/* a faint warm glow, as if the dial were lit from within */}
      <circle cx={FACE_CX} cy={FACE_CY} r="95" fill="url(#mc-halo)" />

      {/* brass bezel */}
      <circle cx={FACE_CX} cy={FACE_CY} r="76" fill="url(#mc-brass)" stroke="#1c0f08" strokeWidth="1.5" />
      <circle cx={FACE_CX} cy={FACE_CY} r="68" fill="none" stroke="#5a4520" strokeWidth="1" />
      {/* dial */}
      <circle cx={FACE_CX} cy={FACE_CY} r="62" fill="url(#mc-dial)" stroke="#3a2c1a" strokeWidth="1" />

      {ticks.map((t, i) => (
        <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#a88f5a" strokeWidth={t.strokeWidth} />
      ))}
      {numerals.map(({ n, x, y }) => (
        <text
          key={n}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fontFamily="var(--font-serif)"
          fill="#d8c48a"
        >
          {n}
        </text>
      ))}

      {/* hands: start at "ten past ten", then drift on slowly and
          continuously — not tracking real time on purpose */}
      <g transform={`translate(${FACE_CX} ${FACE_CY})`}>
        <g>
          {!reduceMotion && (
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="300s" repeatCount="indefinite" />
          )}
          <line x1="0" y1="0" x2="0" y2="-45" transform="rotate(-60)" stroke="#e8d9a8" strokeWidth="4" strokeLinecap="round" />
        </g>
      </g>
      <g transform={`translate(${FACE_CX} ${FACE_CY})`}>
        <g>
          {!reduceMotion && (
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="90s" repeatCount="indefinite" />
          )}
          <line x1="0" y1="0" x2="0" y2="-62" transform="rotate(60)" stroke="#e8d9a8" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
      <circle cx={FACE_CX} cy={FACE_CY} r="4" fill="#caa869" stroke="#5a4520" strokeWidth="0.5" />

      {/* curved glass reflection over the dial */}
      <g clipPath="url(#mc-glass-clip)">
        <rect x="60" y="40" width="150" height="140" fill="url(#mc-glass)" transform="rotate(-18 135 110)" />
      </g>
    </svg>
  );
};
