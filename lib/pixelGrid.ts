// Shared helper for the pixel-dissolve grids used by BootOverlay (app start)
// and ScreenTransitionOverlay (screen changes) — each cell fades on its own
// random delay/duration so the reveal looks organic rather than uniform.
export interface PixelCell {
  delay: number;
  duration: number;
}

export function buildPixelCells(
  count: number,
  maxDelay: number,
  minDuration: number,
  maxExtraDuration: number
): PixelCell[] {
  return Array.from({ length: count }, () => ({
    delay: Math.random() * maxDelay,
    duration: minDuration + Math.random() * maxExtraDuration,
  }));
}
