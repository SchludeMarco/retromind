import React, { useMemo } from 'react';
import { Game, PLATFORM_COLORS } from '../data/games';

// Our own box art: no scans of real covers (those belong to the publishers),
// but a tile drawn by the app itself. A little 8×8 sprite, mirrored like a
// Space Invader and worked out from the title, so every game always gets the
// same one, with the title and year underneath in the pixel font.

const SIZE = 8;

/** A small, stable number per title (FNV-1a), the seed for the sprite. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Pixels of the sprite: 0 empty, 1 main colour, 2 highlight. Left half random, right half mirrored. */
function sprite(seed: number): number[][] {
  let s = seed || 1;
  const next = () => {
    // xorshift32
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
  const rows: number[][] = [];
  for (let y = 0; y < SIZE; y++) {
    const half: number[] = [];
    for (let x = 0; x < SIZE / 2; x++) {
      const r = next();
      half.push(r < 0.45 ? 0 : r < 0.85 ? 1 : 2);
    }
    rows.push([...half, ...half.slice().reverse()]);
  }
  return rows;
}

export const PixelCover: React.FC<{ game: Game; className?: string; showText?: boolean }> = ({
  game,
  className = '',
  showText = true,
}) => {
  const pixels = useMemo(() => sprite(hash(game.title)), [game.title]);
  const color = PLATFORM_COLORS[game.platform] ?? 'var(--a1)';
  return (
    <span className={`pxc ${className}`} style={{ ['--label' as string]: color }} aria-hidden="true">
      <svg className="pxc-sprite" viewBox={`-1 -1 ${SIZE + 2} ${SIZE + 2}`} shapeRendering="crispEdges">
        {pixels.flatMap((row, y) =>
          row.map((p, x) =>
            p ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={p === 1 ? color : '#ffd84a'} /> : null
          )
        )}
      </svg>
      {showText && (
        <>
          <span className="pxc-title pixel-font">{game.title}</span>
          {game.year ? <span className="pxc-year pixel-font">{game.year}</span> : null}
        </>
      )}
    </span>
  );
};
