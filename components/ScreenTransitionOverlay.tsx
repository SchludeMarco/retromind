import React, { useEffect, useMemo, useRef, useState } from 'react';
import { buildPixelCells } from '../lib/pixelGrid';

// --- Screen transition overlay ---
// Whenever the app moves to a different screen, the same pixel-dissolve
// language from the boot sequence covers the switch — but chunkier and
// jerkier, like the heavy mechanism of a time machine grinding into a new
// position rather than a smooth cut. Bigger cells, a held beat of black
// while the new screen mounts underneath, and a stepped (not eased) fade
// so the reveal ticks rather than glides.
const GRID_COLS = 8;
const GRID_ROWS = 5;
const HOLD_MS = 200; // beat of solid black while the new screen mounts behind it
const REVEAL_MAX_DELAY_MS = 380;
const REVEAL_MIN_DURATION_MS = 480;
const REVEAL_MAX_EXTRA_DURATION_MS = 380;
const TOTAL_MS = HOLD_MS + REVEAL_MAX_DELAY_MS + REVEAL_MIN_DURATION_MS + REVEAL_MAX_EXTRA_DURATION_MS;

export const ScreenTransitionOverlay: React.FC<{ screenKey: string }> = ({ screenKey }) => {
  const [active, setActive] = useState(false);
  const [dissolve, setDissolve] = useState(false);
  const prevKey = useRef(screenKey);
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  const cellsRef = useRef(buildPixelCells(GRID_COLS * GRID_ROWS, REVEAL_MAX_DELAY_MS, REVEAL_MIN_DURATION_MS, REVEAL_MAX_EXTRA_DURATION_MS));

  useEffect(() => {
    if (prevKey.current === screenKey) return;
    prevKey.current = screenKey;
    if (prefersReducedMotion) return;

    cellsRef.current = buildPixelCells(GRID_COLS * GRID_ROWS, REVEAL_MAX_DELAY_MS, REVEAL_MIN_DURATION_MS, REVEAL_MAX_EXTRA_DURATION_MS);
    setDissolve(false);
    setActive(true);
    const holdTimer = setTimeout(() => setDissolve(true), HOLD_MS);
    const endTimer = setTimeout(() => setActive(false), TOTAL_MS);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(endTimer);
    };
  }, [screenKey, prefersReducedMotion]);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[85] grid pointer-events-none ${dissolve ? '' : 'rm-transition-shudder'}`}
      style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)` }}
    >
      {cellsRef.current.map((cell, i) => (
        <div
          key={i}
          className="bg-black"
          style={{
            opacity: dissolve ? 0 : 1,
            transition: dissolve ? `opacity ${cell.duration}ms steps(4, jump-end) ${cell.delay}ms` : 'none',
          }}
        />
      ))}
    </div>
  );
};
