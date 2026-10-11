import React, { useMemo } from 'react';
import { Game, PLATFORM_COLORS } from '../data/games';
import { GRID, paint, sceneFor } from '../lib/coverArt';

// Our own box art: no scans of real covers (those belong to the publishers),
// but a pixel picture drawn by the app itself. Catalog games get a hand-made
// scene of their setting, every other game an automatic one built from a
// theme guessed from its title (lib/coverArt.ts). Title and year sit on a
// band underneath in the pixel font.

export const PixelCover: React.FC<{ game: Game; className?: string; showText?: boolean }> = ({
  game,
  className = '',
  showText = true,
}) => {
  const art = useMemo(() => paint(sceneFor(game)), [game]);
  const color = PLATFORM_COLORS[game.platform] ?? 'var(--a1)';
  return (
    <span className={`pxc ${className}`} style={{ ['--label' as string]: color }} aria-hidden="true">
      <svg className="pxc-art" viewBox={`0 0 ${GRID} ${GRID}`} preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges">
        {art.map((p, i) => (
          <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} fill={p.c} />
        ))}
      </svg>
      {showText && (
        <span className="pxc-band">
          <span className="pxc-title pixel-font">{game.title}</span>
          {game.year ? <span className="pxc-year pixel-font">{game.year}</span> : null}
        </span>
      )}
    </span>
  );
};
