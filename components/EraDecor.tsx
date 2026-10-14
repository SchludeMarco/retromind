import React from 'react';
import type { EraStyle, RadioKind } from '../lib/roomEra';

// Wallpaper and radio of a decade for the Stube (lib/roomEra.ts): pastel
// stripes in the 50s, flower power in the 60s, orange circles in the 70s,
// Memphis squiggles in the 80s, sponged terracotta in the 90s, beige stripes
// in the 2000s, Scandinavian triangles in the 2010s, sage-green leaves in
// the 2020s. The radio on the window sill goes from the tube radio through
// the transistor, the ghetto blaster, the CD boombox and the iPod dock to the
// Bluetooth and the smart speaker.

/** An SVG <pattern> with the decade's wallpaper; use inside <defs>. */
export const EraWallpaper: React.FC<{ id: string; wall: EraStyle['wall'] }> = ({ id, wall }) => {
  const [g1, g2, a, b] = wall.colors;
  switch (wall.kind) {
    case 'stripes':
      return (
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill={g1} />
          <rect width="6" height="16" fill={g2} />
          <rect x="10" width="1.5" height="16" fill={a} />
          <circle cx="3" cy="8" r="1" fill={b} />
        </pattern>
      );
    case 'flowers':
      return (
        <pattern id={id} width="28" height="28" patternUnits="userSpaceOnUse">
          <rect width="28" height="28" fill={g1} />
          <rect x="14" width="14" height="28" fill={g2} />
          {[
            [7, 7, 3.2, a],
            [21, 21, 2.4, b],
          ].map(([x, y, r, c]) => (
            <g key={`${x}`} fill={c as string}>
              {[0, 72, 144, 216, 288].map((deg) => (
                <ellipse key={deg} cx={x as number} cy={(y as number) - (r as number)} rx={(r as number) * 0.55} ry={r as number} transform={`rotate(${deg} ${x} ${y})`} />
              ))}
              <circle cx={x as number} cy={y as number} r={(r as number) * 0.55} fill="#fff6e0" />
            </g>
          ))}
        </pattern>
      );
    case 'circles':
      return (
        <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill={g1} />
          <circle cx="12" cy="12" r="10" fill={b} />
          <circle cx="12" cy="12" r="7.5" fill={a} />
          <circle cx="12" cy="12" r="5" fill={g2} />
          <circle cx="12" cy="12" r="2.5" fill={a} />
        </pattern>
      );
    case 'memphis':
      return (
        <pattern id={id} width="32" height="32" patternUnits="userSpaceOnUse">
          <rect width="32" height="32" fill={g1} />
          <path d="M3 9l3-3 3 3 3-3 3 3" fill="none" stroke={a} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M20 24l4-7 4 7z" fill={b} />
          <circle cx="24" cy="7" r="1.6" fill="#f2c230" />
          <circle cx="8" cy="24" r="2.4" fill="none" stroke="#3a3a48" strokeWidth="1" />
          <rect x="13" y="14" width="2" height="2" fill="#3a3a48" />
        </pattern>
      );
    case 'sponge':
      return (
        <pattern id={id} width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill={g1} />
          <ellipse cx="8" cy="9" rx="7" ry="5" fill={a} opacity="0.55" />
          <ellipse cx="22" cy="22" rx="8" ry="5.5" fill={b} opacity="0.7" />
          <ellipse cx="24" cy="6" rx="4" ry="3" fill={g2} />
          <ellipse cx="6" cy="24" rx="4.5" ry="3" fill={b} opacity="0.5" />
        </pattern>
      );
    case 'beige':
      return (
        <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill={g1} />
          <rect width="9" height="20" fill={g2} />
          <rect x="9" width="0.8" height="20" fill={a} opacity="0.35" />
          <rect x="13" width="2" height="20" fill={b} opacity="0.5" />
        </pattern>
      );
    case 'triangles':
      return (
        <pattern id={id} width="24" height="20" patternUnits="userSpaceOnUse">
          <rect width="24" height="20" fill={g1} />
          <path d="M2 16l5-9 5 9z" fill="none" stroke={a} strokeWidth="1" />
          <path d="M14 8l4-7 4 7z" fill={b} opacity="0.7" />
        </pattern>
      );
    case 'leaves':
    default:
      return (
        <pattern id={id} width="26" height="26" patternUnits="userSpaceOnUse">
          <rect width="26" height="26" fill={g1} />
          <path d="M6 18c0-6 4-10 9-11-1 6-4 10-9 11z" fill={a} />
          <path d="M6 18l6-7" stroke={b} strokeWidth="0.8" />
          <path d="M18 24c1-4 4-6 7-6-1 4-4 6-7 6z" fill={b} />
        </pattern>
      );
  }
};

/**
 * The decade's radio, standing on (x, y): its bottom centre. About 34 wide
 * and up to 22 high, with a little note floating up from it.
 */
export const EraRadio: React.FC<{ kind: RadioKind; x: number; y: number }> = ({ kind, x, y }) => (
  <g transform={`translate(${x} ${y})`} className="cozy-era-radio">
    {kind === 'tube' && (
      <g>
        <path d="M-15 0v-14a6 6 0 0 1 6-6h18a6 6 0 0 1 6 6v14z" fill="#8a5a33" />
        <rect x="-12" y="-16" width="14" height="13" rx="2" fill="#e9d2b0" />
        {[-13, -10, -7].map((yy) => (
          <line key={yy} x1="-11" y1={yy} x2="1" y2={yy} stroke="#c9a77a" strokeWidth="0.8" />
        ))}
        <circle cx="9" cy="-13" r="3.2" fill="#f3e1c4" stroke="#5e3a22" strokeWidth="0.8" />
        <circle cx="9" cy="-5" r="2" fill="#5e3a22" />
      </g>
    )}
    {kind === 'transistor' && (
      <g>
        <rect x="-15" y="-17" width="30" height="17" rx="6" fill="#e86a2a" />
        <line x1="10" y1="-17" x2="18" y2="-30" stroke="#b9b9b9" strokeWidth="1" strokeLinecap="round" />
        <circle cx="-6" cy="-8.5" r="6" fill="#3a302b" />
        {[-9, -6, -3].map((xx) => (
          <circle key={xx} cx={xx} cy="-8.5" r="0.8" fill="#6e625b" />
        ))}
        <rect x="3" y="-13" width="9" height="4" rx="1" fill="#fff4e2" />
        <circle cx="7.5" cy="-4.5" r="2" fill="#fff4e2" />
      </g>
    )}
    {kind === 'boombox' && (
      <g>
        <path d="M-10 -16v-4h20v4" fill="none" stroke="#6b6f78" strokeWidth="1.6" />
        <rect x="-17" y="-16" width="34" height="16" rx="2.5" fill="#c9ccd1" />
        <circle cx="-10" cy="-7.5" r="5.5" fill="#2b2b30" stroke="#8a8f99" strokeWidth="1" />
        <circle cx="10" cy="-7.5" r="5.5" fill="#2b2b30" stroke="#8a8f99" strokeWidth="1" />
        <rect x="-3.5" y="-12" width="7" height="6" rx="0.8" fill="#4a4f58" />
        <circle cx="-1.5" cy="-9" r="0.9" fill="#c9ccd1" />
        <circle cx="1.5" cy="-9" r="0.9" fill="#c9ccd1" />
        <rect x="-3.5" y="-4" width="7" height="1.6" fill="#ef6fa0" />
      </g>
    )}
    {kind === 'cdbox' && (
      <g>
        <rect x="-17" y="-15" width="34" height="15" rx="3" fill="#2a2a2e" />
        <circle cx="-10.5" cy="-7.5" r="5" fill="#44464c" />
        <circle cx="10.5" cy="-7.5" r="5" fill="#44464c" />
        <circle cx="0" cy="-9" r="4" fill="#8a8f99" />
        <circle cx="0" cy="-9" r="1.2" fill="#2a2a2e" />
        <circle cx="0" cy="-2.5" r="0.9" fill="#4cd964" />
      </g>
    )}
    {kind === 'dock' && (
      <g>
        <rect x="-15" y="-9" width="30" height="9" rx="4" fill="#f4f4f2" stroke="#d6d6d2" strokeWidth="0.6" />
        <circle cx="-9" cy="-4.5" r="3" fill="#dcdcd8" />
        <circle cx="9" cy="-4.5" r="3" fill="#dcdcd8" />
        <rect x="-4" y="-21" width="8" height="13" rx="1.5" fill="#fafafa" stroke="#c8c8c4" strokeWidth="0.6" />
        <rect x="-3" y="-20" width="6" height="4.5" rx="0.6" fill="#7fb2d9" />
        <circle cx="0" cy="-11.5" r="2.2" fill="none" stroke="#c8c8c4" strokeWidth="0.8" />
      </g>
    )}
    {kind === 'speaker' && (
      <g>
        <rect x="-15" y="-12" width="30" height="12" rx="6" fill="#d95d39" />
        {[-9, -5, -1, 3, 7].map((xx) => (
          <line key={xx} x1={xx} y1="-9" x2={xx} y2="-3" stroke="#a8401f" strokeWidth="1.2" strokeLinecap="round" />
        ))}
        <circle cx="11" cy="-6" r="1" fill="#fff6e6" />
      </g>
    )}
    {kind === 'smart' && (
      <g>
        <rect x="-7" y="-20" width="14" height="20" rx="5" fill="#e2ddd5" />
        <ellipse cx="0" cy="-19" rx="6" ry="1.6" fill="#6fc0e8" />
        {[-14, -10, -6].map((yy) => (
          <line key={yy} x1="-5" y1={yy} x2="5" y2={yy} stroke="#cfc8bd" strokeWidth="0.8" />
        ))}
      </g>
    )}
    <g className="cozy-era-notes" fill="#6b5446">
      <path d="M14 -24v-7l5-1.5v6" fill="none" stroke="#6b5446" strokeWidth="0.9" />
      <circle cx="13" cy="-24" r="1.6" />
      <circle cx="18" cy="-25.5" r="1.6" />
    </g>
  </g>
);
