import React from 'react';

// The "Stube" at the top of the Retro Warm start page (Marco, 2026-10-13:
// "man soll sich direkt wie Zuhause auf der warmen Couch in der warmen Stube
// fühlen"): a living room drawn in SVG, with a caramel couch, a crocheted
// blanket, a floor lamp that glows, a cup of tea that steams, a wood stove
// that burns in the evening and a cat asleep on the rug. The window shows the real time of day, so in the evening the
// sun sets outside and at night the moon is up. Purely decorative; the
// gentle animations stop for people who ask for reduced motion (index.css).

export type DayTime = 'morning' | 'day' | 'evening' | 'night';

export function dayTime(hour = new Date().getHours()): DayTime {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 17) return 'day';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

const SKY: Record<DayTime, [string, string]> = {
  morning: ['#bfe0f0', '#ffe3a8'],
  day: ['#8fc9ea', '#dff1f8'],
  evening: ['#7d5a8c', '#f4a25a'],
  night: ['#1f2149', '#43386a'],
};

// The granny squares of the blanket over the armrest.
const GRANNY = ['#d95d39', '#e8a838', '#4b7b72', '#f3e1c4', '#a43716', '#e8a838', '#4b7b72', '#d95d39', '#f3e1c4'];

export const CozyRoom: React.FC<{ time?: DayTime; className?: string }> = ({ time = dayTime(), className = '' }) => {
  const [skyTop, skyBottom] = SKY[time];
  const lit = time === 'evening' || time === 'night';
  return (
    <svg
      viewBox="0 0 400 220"
      className={`cozy-room block w-full h-auto ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id="cozy-wallpaper" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill="#f2dcbc" />
          <rect width="12" height="24" fill="#efd5b2" />
          <circle cx="18" cy="6" r="1.6" fill="#e2b98a" />
          <circle cx="6" cy="18" r="1.6" fill="#e9c79c" />
        </pattern>
        <linearGradient id="cozy-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
        <radialGradient id="cozy-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd88a" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="#ffc46b" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffb85c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cozy-fire-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff8a3c" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#ff7a2a" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ff7a2a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cozy-couch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d48a4b" />
          <stop offset="1" stopColor="#b5672f" />
        </linearGradient>
        <linearGradient id="cozy-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8693e" />
          <stop offset="1" stopColor="#8c5430" />
        </linearGradient>
      </defs>

      {/* Wall and floor */}
      <rect width="400" height="168" fill="url(#cozy-wallpaper)" />
      <rect y="24" width="400" height="3" fill="#c9965f" opacity="0.6" />
      <rect y="166" width="400" height="54" fill="url(#cozy-floor)" />
      {[178, 192, 207].map((y) => (
        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#7a4626" strokeWidth="0.8" opacity="0.5" />
      ))}
      {[40, 130, 220, 310, 85, 175, 265, 355].map((x, i) => (
        <line key={x} x1={x} y1={i < 4 ? 166 : 178} x2={x} y2={i < 4 ? 178 : 192} stroke="#7a4626" strokeWidth="0.8" opacity="0.4" />
      ))}
      <rect y="160" width="400" height="7" fill="#7f4a29" />
      <rect y="160" width="400" height="1.5" fill="#a46a43" />

      {/* Window with the real time of day outside */}
      <g>
        <rect x="262" y="34" width="84" height="86" rx="3" fill="#fff4e2" />
        <rect x="268" y="40" width="72" height="74" fill="url(#cozy-sky)" />
        {time === 'morning' && <circle cx="292" cy="98" r="10" fill="#ffd36b" />}
        {time === 'day' && (
          <>
            <circle cx="320" cy="58" r="9" fill="#ffe08a" />
            <path d="M278 80a6 6 0 0 1 11-3 5 5 0 0 1 9 3z" fill="#ffffff" opacity="0.9" />
          </>
        )}
        {time === 'evening' && <circle cx="304" cy="112" r="13" fill="#ffb347" />}
        {time === 'night' && (
          <>
            <circle cx="318" cy="58" r="8" fill="#fff3c4" />
            <circle cx="322" cy="55" r="7" fill="#2a2a55" />
            {[[280, 52], [296, 66], [330, 86], [286, 92], [310, 76]].map(([x, y]) => (
              <circle key={`${x}-${y}`} className="cozy-star" cx={x} cy={y} r="1.1" fill="#fff8dc" />
            ))}
          </>
        )}
        {/* far hills */}
        <path d="M268 106q18-10 36-2t36-4v14h-72z" fill={lit ? '#3d3555' : '#9cc49a'} opacity="0.85" />
        <rect x="302.5" y="40" width="3" height="74" fill="#fff4e2" />
        <rect x="268" y="75" width="72" height="3" fill="#fff4e2" />
        <rect x="256" y="118" width="96" height="6" rx="2" fill="#e9d2b0" />
        {/* curtains, tied back */}
        <path d="M250 28h22c-2 30 6 52 2 70-3 14-12 20-20 22-6-28 2-60-4-92z" fill="#c2532f" />
        <path d="M358 28h-22c2 30-6 52-2 70 3 14 12 20 20 22 6-28-2-60 4-92z" fill="#c2532f" />
        <path d="M258 34c2 24-2 50 0 78M350 34c-2 24 2 50 0 78" stroke="#a43716" strokeWidth="1.4" fill="none" opacity="0.6" />
        <rect x="246" y="24" width="116" height="5" rx="2.5" fill="#8a5a33" />
        <circle cx="246" cy="26.5" r="4" fill="#8a5a33" />
        <circle cx="362" cy="26.5" r="4" fill="#8a5a33" />
      </g>

      {/* Pictures on the wall */}
      <g>
        <rect x="128" y="36" width="56" height="42" rx="2" fill="#c99a4c" />
        <rect x="133" y="41" width="46" height="32" fill="#f6e3bf" />
        <circle cx="168" cy="50" r="5" fill="#e8a838" />
        <path d="M133 73l13-15 9 9 7-6 17 12z" fill="#6f9a7c" />
        <ellipse cx="208" cy="58" rx="13" ry="16" fill="#c99a4c" />
        <ellipse cx="208" cy="58" rx="9.5" ry="12.5" fill="#f3e1c4" />
        <circle cx="208" cy="54" r="4" fill="#9a7b62" />
        <path d="M200 69c1-6 5-9 8-9s7 3 8 9" fill="#9a7b62" />
      </g>


      {/* Rug */}
      <ellipse cx="190" cy="198" rx="140" ry="17" fill="#c9553a" />
      <ellipse cx="190" cy="198" rx="128" ry="13" fill="#e2a868" />
      <ellipse cx="190" cy="198" rx="128" ry="13" fill="none" stroke="#fff1dc" strokeWidth="1.2" strokeDasharray="4 5" />
      <ellipse cx="190" cy="198" rx="80" ry="7" fill="none" stroke="#c9553a" strokeWidth="1.5" />

      {/* Wood stove (Marco, 2026-10-13): a cast-iron stove with a glass door.
          In the evening and at night the fire burns and flickers and throws
          its glow into the room; by day only the embers glow. */}
      <g>
        <rect x="27" y="0" width="9" height="122" fill="#3a302b" />
        <rect x="25" y="70" width="13" height="4" rx="1" fill="#2b231f" />
        <rect x="12" y="120" width="40" height="6" rx="2" fill="#2b231f" />
        <rect x="14" y="126" width="36" height="56" rx="5" fill="#3a302b" />
        <rect x="14" y="126" width="36" height="3" fill="#4d413a" />
        <rect x="16" y="182" width="5" height="9" rx="1" fill="#2b231f" />
        <rect x="43" y="182" width="5" height="9" rx="1" fill="#2b231f" />
        <rect x="19" y="134" width="26" height="30" rx="3" fill="#1c1411" stroke="#5c4d44" strokeWidth="1.5" />
        {/* logs */}
        <path d="M21 160l22-5M22 156l20 6" stroke="#6b4428" strokeWidth="3.5" strokeLinecap="round" />
        {lit ? (
          <g className="cozy-fire">
            <path className="cozy-flame cozy-flame-1" d="M24 159c-2-7 3-10 2-17 4 4 7 9 5 17z" fill="#e8552a" />
            <path className="cozy-flame cozy-flame-2" d="M29 159c-3-9 4-13 3-22 5 6 8 13 5 22z" fill="#ff9a3c" />
            <path className="cozy-flame cozy-flame-3" d="M35 159c-1-6 3-8 3-13 3 4 5 8 3 13z" fill="#ffd36b" />
            <path className="cozy-flame cozy-flame-1" d="M31 159c-1-4 1-6 1-9 2 3 3 6 1 9z" fill="#fff1b8" />
          </g>
        ) : (
          <ellipse className="cozy-ember" cx="32" cy="158" rx="9" ry="2.5" fill="#d9542a" opacity="0.7" />
        )}
        <rect x="19" y="134" width="26" height="30" rx="3" fill="#ffffff" opacity="0.06" />
        <rect x="46" y="146" width="2.5" height="8" rx="1" fill="#8a7a6e" />
        <rect x="18" y="169" width="28" height="6" rx="1.5" fill="#2b231f" />
        {/* kettle on the stove top */}
        <path d="M24 120c0-7 4-10 8-10s8 3 8 10z" fill="#c2532f" />
        <rect x="30" y="107" width="4" height="3" rx="1" fill="#2b231f" />
        <path d="M40 115l5-4" stroke="#c2532f" strokeWidth="2.2" strokeLinecap="round" />
        {/* firewood */}
        <g>
          <rect x="2" y="184" width="16" height="5" rx="2.5" fill="#8a5a33" />
          <rect x="4" y="179" width="14" height="5" rx="2.5" fill="#9c6a3e" />
          <circle cx="3" cy="186.5" r="2.3" fill="#d9a066" />
          <circle cx="5" cy="181.5" r="2.3" fill="#d9a066" />
        </g>
      </g>

      {/* Couch */}
      <g>
        <rect x="92" y="104" width="160" height="56" rx="18" fill="url(#cozy-couch)" />
        <path d="M120 112v40M172 112v40M224 112v40" stroke="#b5672f" strokeWidth="1.6" opacity="0.7" />
        <rect x="96" y="140" width="152" height="30" rx="10" fill="#c97b3f" />
        <path d="M172 142v26" stroke="#a8602c" strokeWidth="1.6" />
        <rect x="82" y="122" width="26" height="54" rx="12" fill="#b5672f" />
        <rect x="236" y="122" width="26" height="54" rx="12" fill="#b5672f" />
        <rect x="92" y="176" width="5" height="10" rx="1.5" fill="#5e3a22" />
        <rect x="247" y="176" width="5" height="10" rx="1.5" fill="#5e3a22" />
        {/* cushions */}
        <rect x="108" y="116" width="34" height="30" rx="9" fill="#4b7b72" transform="rotate(-8 125 131)" />
        <circle cx="125" cy="131" r="2.4" fill="#34645c" />
        <rect x="146" y="118" width="32" height="28" rx="9" fill="#f3e1c4" transform="rotate(5 162 132)" />
        <path d="M150 127h24M150 132h24M150 137h24" stroke="#e8a838" strokeWidth="2" transform="rotate(5 162 132)" />
        {/* crocheted blanket over the right armrest */}
        <g transform="translate(212 116) rotate(6)">
          {GRANNY.map((c, i) => (
            <rect key={i} x={(i % 3) * 13} y={Math.floor(i / 3) * 13} width="12" height="12" rx="1.5" fill={c} />
          ))}
          {GRANNY.map((_, i) => (
            <rect key={`c${i}`} x={(i % 3) * 13 + 4} y={Math.floor(i / 3) * 13 + 4} width="4" height="4" rx="1" fill="#fff6e6" opacity="0.8" />
          ))}
          <path d="M0 39l3 5 3-5 3 5 3-5 3 5 3-5 3 5 3-5 3 5 3-5 3 5 3-5" fill="none" stroke="#e8a838" strokeWidth="1.4" />
        </g>
      </g>

      {/* Floor lamp, in front of the couch's left arm */}
      <g transform="translate(20 0)">
        <ellipse cx="58" cy="190" rx="16" ry="4" fill="#5e3a22" />
        <rect x="56" y="78" width="4" height="112" fill="#6e4528" />
        <path d="M34 50h48l10 30H24z" fill="#f2b24f" />
        <path d="M34 50h48l10 30H24z" fill="#ffe2a4" opacity="0.45" />
        <path d="M24 80h68" stroke="#d98b2b" strokeWidth="2" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={26 + i * 5.8} y1="81" x2={26 + i * 5.8} y2="86" stroke="#d98b2b" strokeWidth="1.2" />
        ))}
      </g>

      {/* Side table with a cup of tea and a book */}
      <g>
        <rect x="282" y="146" width="48" height="6" rx="2" fill="#8a5a33" />
        <rect x="288" y="152" width="4" height="36" fill="#6e4528" />
        <rect x="320" y="152" width="4" height="36" fill="#6e4528" />
        <rect x="286" y="140" width="22" height="6" rx="1" fill="#4b7b72" />
        <rect x="288" y="135" width="18" height="5" rx="1" fill="#d95d39" />
        <path d="M312 132h12v8a6 6 0 0 1-12 0z" fill="#fff6e6" />
        <path d="M324 134a3.5 3.5 0 0 1 0 7" fill="none" stroke="#fff6e6" strokeWidth="1.8" />
        <ellipse cx="318" cy="146" rx="9" ry="1.6" fill="#e9d2b0" />
        <path className="cozy-steam" d="M316 128c-3-4 3-6 0-10s3-6 0-9" fill="none" stroke="#b98b62" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
        <path className="cozy-steam cozy-steam-2" d="M321 128c-3-4 3-6 0-10" fill="none" stroke="#b98b62" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
      </g>

      {/* Plant */}
      <g>
        <path d="M362 172h22l-3 18h-16z" fill="#c2532f" />
        <path d="M373 172c-2-14-12-20-18-22 6 8 9 14 10 22M373 172c1-16 8-26 16-30-4 10-7 20-8 30M373 172c0-12-2-24-1-34 3 10 4 22 3 34" fill="#5f8f6a" />
      </g>

      {/* Lamplight: in the evening the room dims a little and the lamp pours
          warm light over the couch; by day it only glows softly. */}
      {lit && <rect width="400" height="220" fill="#3b1f10" opacity={time === 'night' ? 0.2 : 0.1} />}
      <path d="M54 84L10 220h150L102 84z" fill="#ffd27a" opacity={lit ? 0.16 : 0.06} style={{ mixBlendMode: 'screen' }} />
      <circle
        className="cozy-glow"
        cx="78"
        cy="68"
        r={lit ? 130 : 80}
        fill="url(#cozy-glow)"
        opacity={lit ? 0.9 : 0.45}
        style={{ mixBlendMode: 'screen' }}
      />

      {lit && (
        <circle className="cozy-fire-glow" cx="32" cy="150" r="70" fill="url(#cozy-fire-glow)" style={{ mixBlendMode: 'screen' }} />
      )}

      {/* The cat, curled up asleep on the rug */}
      <g className="cozy-cat">
        <path className="cozy-tail" d="M198 196c10 4 22 2 24-6" fill="none" stroke="#6b5446" strokeWidth="5" strokeLinecap="round" />
        <ellipse className="cozy-cat-body" cx="182" cy="192" rx="20" ry="10" fill="#6b5446" />
        <path d="M172 186c3 2 5 2 8 0M182 184c3 2 5 2 8 0" stroke="#87705f" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="164" cy="190" r="8" fill="#6b5446" />
        <path d="M158 184l1-8 5 5zM166 182l4-7 2 7z" fill="#6b5446" />
        <path d="M159.5 190.5q2 1.5 4 0M165.5 190.5q2 1.5 4 0" stroke="#3c2e25" strokeWidth="1" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
};
