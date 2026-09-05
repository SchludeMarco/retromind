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

// A stylized old wooden "tambour" mantel clock — round glass-and-brass face
// set into a napoleon-hat-shaped case on a footed base, drawn at a slight
// perspective. Purely decorative background watermark (aria-hidden), hands
// fixed at the classic "ten past ten" display position.
export const MantelClock: React.FC<{ className?: string }> = ({ className }) => (
  <svg aria-hidden="true" viewBox="0 0 320 220" className={className}>
    <defs>
      <linearGradient id="mc-wood" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6b4423" />
        <stop offset="55%" stopColor="#4a2f1c" />
        <stop offset="100%" stopColor="#2c1810" />
      </linearGradient>
      <radialGradient id="mc-dome" cx="32%" cy="28%" r="85%">
        <stop offset="0%" stopColor="#8a5a34" />
        <stop offset="45%" stopColor="#5b3a22" />
        <stop offset="100%" stopColor="#2c1810" />
      </radialGradient>
      <linearGradient id="mc-brass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f5e1a4" />
        <stop offset="40%" stopColor="#c9962e" />
        <stop offset="70%" stopColor="#f5e1a4" />
        <stop offset="100%" stopColor="#8a6a2f" />
      </linearGradient>
      <radialGradient id="mc-dial" cx="48%" cy="42%" r="65%">
        <stop offset="0%" stopColor="#faf3df" />
        <stop offset="100%" stopColor="#e2cfa0" />
      </radialGradient>
      <linearGradient id="mc-glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38" />
        <stop offset="30%" stopColor="#ffffff" stopOpacity="0.06" />
        <stop offset="65%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      <clipPath id="mc-glass-clip">
        <circle cx={FACE_CX} cy={FACE_CY} r="66" />
      </clipPath>
    </defs>

    {/* ground shadow */}
    <ellipse cx="165" cy="203" rx="130" ry="11" fill="#000000" opacity="0.16" />

    {/* napoleon-hat case, rising steep on the left behind the face and
        tapering low to the right, like the case receding away from camera */}
    <path
      d="M40,178 C40,55 95,18 150,18 C205,18 262,55 272,115 C276,145 276,163 272,178 Z"
      fill="url(#mc-dome)"
      stroke="#1c0f08"
      strokeWidth="1"
    />

    {/* base plinth with small feet */}
    <rect x="20" y="178" width="280" height="30" rx="6" fill="url(#mc-wood)" stroke="#1c0f08" strokeWidth="1" />
    <rect x="24" y="180" width="272" height="6" rx="3" fill="#8a5a34" opacity="0.45" />
    <ellipse cx="45" cy="211" rx="9" ry="6" fill="url(#mc-wood)" />
    <ellipse cx="275" cy="211" rx="9" ry="6" fill="url(#mc-wood)" />

    {/* brass bezel */}
    <circle cx={FACE_CX} cy={FACE_CY} r="76" fill="url(#mc-brass)" stroke="#3a2410" strokeWidth="1.5" />
    <circle cx={FACE_CX} cy={FACE_CY} r="68" fill="none" stroke="#8a6a2f" strokeWidth="1" />
    {/* dial */}
    <circle cx={FACE_CX} cy={FACE_CY} r="62" fill="url(#mc-dial)" stroke="#8a6a3f" strokeWidth="1" />

    {ticks.map((t, i) => (
      <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#2c1810" strokeWidth={t.strokeWidth} />
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
        fill="#2c1810"
      >
        {n}
      </text>
    ))}

    {/* hands, fixed at "ten past ten" */}
    <line x1={FACE_CX} y1={FACE_CY} x2="96" y2="87.5" stroke="#2c1810" strokeWidth="4" strokeLinecap="round" />
    <line x1={FACE_CX} y1={FACE_CY} x2="188.7" y2="79" stroke="#2c1810" strokeWidth="3" strokeLinecap="round" />
    <circle cx={FACE_CX} cy={FACE_CY} r="4" fill="#c9962e" stroke="#3a2410" strokeWidth="0.5" />

    {/* curved glass reflection over the dial */}
    <g clipPath="url(#mc-glass-clip)">
      <rect x="60" y="40" width="150" height="140" fill="url(#mc-glass)" transform="rotate(-18 135 110)" />
    </g>
  </svg>
);
