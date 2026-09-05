import React from 'react';

// Purely decorative background watermark: an old-fashioned analog clock
// face, hands fixed at the classic "ten past ten" display position (never
// ticks — it's not meant to tell real time). Color/opacity/size are left to
// the caller via className so this stays reusable.
export const AnalogClock: React.FC<{ className?: string }> = ({ className }) => {
  const numerals = [
    { n: 'XII', x: 100, y: 26 },
    { n: 'I', x: 137, y: 35.9 },
    { n: 'II', x: 164.1, y: 63 },
    { n: 'III', x: 174, y: 100 },
    { n: 'IV', x: 164.1, y: 137 },
    { n: 'V', x: 137, y: 164.1 },
    { n: 'VI', x: 100, y: 174 },
    { n: 'VII', x: 63, y: 164.1 },
    { n: 'VIII', x: 35.9, y: 137 },
    { n: 'IX', x: 26, y: 100 },
    { n: 'X', x: 35.9, y: 63 },
    { n: 'XI', x: 63, y: 35.9 },
  ];

  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className={className} fill="none" stroke="currentColor">
      <circle cx="100" cy="100" r="97" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="88" strokeWidth="1" />
      {Array.from({ length: 60 }, (_, i) => {
        const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
        const isHour = i % 5 === 0;
        const r1 = isHour ? 80 : 84;
        return (
          <line
            key={i}
            x1={100 + r1 * Math.cos(angle)}
            y1={100 + r1 * Math.sin(angle)}
            x2={100 + 88 * Math.cos(angle)}
            y2={100 + 88 * Math.sin(angle)}
            strokeWidth={isHour ? 1.5 : 0.6}
          />
        );
      })}
      {numerals.map(({ n, x, y }) => (
        <text
          key={n}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="13"
          fontFamily="var(--font-serif)"
          stroke="none"
          fill="currentColor"
        >
          {n}
        </text>
      ))}
      {/* Hour hand, pointing toward X */}
      <line x1="100" y1="100" x2="56.7" y2="75" strokeWidth="4" strokeLinecap="round" />
      {/* Minute hand, pointing toward II (ten past) */}
      <line x1="100" y1="100" x2="160.6" y2="65" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="100" r="4" fill="currentColor" stroke="none" />
    </svg>
  );
};
