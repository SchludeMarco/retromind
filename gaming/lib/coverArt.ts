// Our own cover pictures, one per catalog game. Not copies of the real box
// art: no characters, logos or cover layouts from the publishers, only a
// little pixel scene of our own that catches the game's setting and mood
// (a road at dusk, an airship between floating islands, ...). Each scene is a
// list of simple layers drawn on a 40×40 pixel grid.

export const GRID = 40;

/** Layers a scene is built from, painted in order. */
export type Layer =
  /** Sky from top to bottom, one colour per band, with dithered seams. */
  | { t: 'sky'; colors: string[]; to?: number }
  /** Scattered single pixels. */
  | { t: 'stars'; color: string; n: number; maxY?: number; seed?: number }
  /** Filled pixel circle. */
  | { t: 'disc'; x: number; y: number; r: number; color: string }
  /** Jagged silhouette from y down to the bottom (hills, dunes, ridges). */
  | { t: 'ridge'; y: number; amp: number; color: string; seed?: number; step?: number; smooth?: boolean }
  /** Skyline: blocks of random height from y down to the bottom, with windows. */
  | { t: 'city'; y: number; amp: number; color: string; lit?: string; seed?: number; minW?: number }
  | { t: 'rect'; x: number; y: number; w: number; h: number; color: string }
  /** Hand-drawn sprite: one string per row, one char per pixel, '.' is empty. */
  | { t: 'sprite'; x: number; y: number; rows: string[]; pal: Record<string, string>; flip?: boolean };

export type Scene = Layer[];

/** Small deterministic random generator, so a scene never changes between renders. */
export function rng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 0xffffffff;
  };
}

export type Px = { x: number; y: number; w: number; h: number; c: string };

/** Turns a scene into rectangles on the 40×40 grid. */
export function paint(scene: Scene): Px[] {
  const out: Px[] = [];
  const px = (x: number, y: number, c: string, w = 1, h = 1) => out.push({ x, y, w, h, c });
  for (const l of scene) {
    switch (l.t) {
      case 'sky': {
        const to = l.to ?? GRID;
        const band = to / l.colors.length;
        l.colors.forEach((c, i) => px(0, Math.round(i * band), c, GRID, Math.ceil(band) + 1));
        // Dither the row on each seam so the bands blend like an old palette.
        for (let i = 1; i < l.colors.length; i++) {
          const y = Math.round(i * band) - 1;
          for (let x = i % 2; x < GRID; x += 2) px(x, y, l.colors[i]);
        }
        break;
      }
      case 'stars': {
        const r = rng(l.seed ?? 7);
        for (let i = 0; i < l.n; i++) px(Math.floor(r() * GRID), Math.floor(r() * (l.maxY ?? GRID)), l.color);
        break;
      }
      case 'disc': {
        for (let dy = -l.r; dy <= l.r; dy++) {
          const half = Math.floor(Math.sqrt(l.r * l.r - dy * dy) + 0.35);
          px(l.x - half, l.y + dy, l.color, half * 2 + 1);
        }
        break;
      }
      case 'ridge': {
        const r = rng(l.seed ?? 3);
        const step = l.step ?? 1;
        let h = r() * l.amp;
        for (let x = 0; x < GRID; x += step) {
          h = l.smooth ? Math.max(0, Math.min(l.amp, h + (r() - 0.5) * 2)) : r() * l.amp;
          const top = Math.round(l.y - h);
          px(x, top, l.color, step, GRID - top);
        }
        break;
      }
      case 'city': {
        const r = rng(l.seed ?? 5);
        let x = 0;
        while (x < GRID) {
          const w = (l.minW ?? 3) + Math.floor(r() * 4);
          const top = Math.round(l.y - r() * l.amp);
          px(x, top, l.color, w, GRID - top);
          if (l.lit)
            for (let wy = top + 2; wy < GRID - 1; wy += 3)
              for (let wx = x + 1; wx < x + w - 1; wx += 2) if (r() < 0.4) px(wx, wy, l.lit);
          x += w + (r() < 0.3 ? 1 : 0);
        }
        break;
      }
      case 'rect':
        px(l.x, l.y, l.color, l.w, l.h);
        break;
      case 'sprite': {
        l.rows.forEach((row, y) => {
          const chars = l.flip ? [...row].reverse() : [...row];
          chars.forEach((ch, x) => {
            const c = l.pal[ch];
            if (c) px(l.x + x, l.y + y, c);
          });
        });
        break;
      }
    }
  }
  return out;
}

// --- The scenes, keyed by game id (data/games.ts) ---

export const SCENES: Record<string, Scene> = {
  // Rocks drifting through deep space, a lone wedge-shaped ship in the middle.
  asteroids: [
    { t: 'sky', colors: ['#05060f', '#0b0d24', '#141738'] },
    { t: 'stars', color: '#8a8fb8', n: 40 },
    { t: 'stars', color: '#ffffff', n: 12, seed: 21 },
    { t: 'disc', x: 31, y: 8, r: 4, color: '#3a3550' },
    { t: 'disc', x: 30, y: 7, r: 2, color: '#56506e' },
    { t: 'disc', x: 7, y: 29, r: 5, color: '#3a3550' },
    { t: 'disc', x: 6, y: 28, r: 3, color: '#56506e' },
    { t: 'disc', x: 33, y: 31, r: 2, color: '#56506e' },
    {
      t: 'sprite',
      x: 16,
      y: 15,
      pal: { w: '#e8ecff', b: '#7fd4ff', o: '#ff9a3c', y: '#ffe066' },
      rows: [
        '...ww...',
        '...ww...',
        '..wbbw..',
        '..wbbw..',
        '.ww..ww.',
        '.w....w.',
        'ww....ww',
        '..oyyo..',
        '...oo...',
      ],
    },
  ],

  // Little walkers marching out of a trapdoor towards a cliff edge.
  lemmings: [
    { t: 'sky', colors: ['#1b2a5c', '#2d4a8a', '#4f78b8'], to: 30 },
    { t: 'ridge', y: 24, amp: 4, color: '#3a5a8c', seed: 11, step: 2, smooth: true },
    { t: 'rect', x: 0, y: 28, w: 26, h: 12, color: '#8a5a32' },
    { t: 'rect', x: 0, y: 28, w: 26, h: 2, color: '#5fbf3f' },
    { t: 'rect', x: 26, y: 30, w: 14, h: 10, color: '#14203f' },
    { t: 'rect', x: 34, y: 34, w: 6, h: 6, color: '#4a2f1a' },
    { t: 'rect', x: 34, y: 34, w: 6, h: 1, color: '#5fbf3f' },
    // Trapdoor hanging from the top.
    {
      t: 'sprite',
      x: 3,
      y: 4,
      pal: { g: '#9aa3b5', d: '#5b6375', k: '#1a1f2b' },
      rows: ['gggggggggg', 'gddddddddg', 'gdkkkkkkdg', 'gd......dg'],
    },
    ...[6, 12, 17, 22].map(
      (x, i): Layer => ({
        t: 'sprite',
        x,
        y: i === 0 ? 10 : 24,
        pal: { h: '#f2c14e', s: '#ffd9b0', c: '#4a7bd6' },
        rows: ['.h.', 'hs.', '.c.', 'c.c'],
      })
    ),
  ],

  // An empty country road at dusk, a little round car heading for the sunset.
  'beetle-adventure-racing': [
    { t: 'sky', colors: ['#2a1a4a', '#6b2f6b', '#c24d5c', '#f28a4a', '#ffc75a'], to: 18 },
    { t: 'disc', x: 20, y: 15, r: 5, color: '#ffe9a0' },
    { t: 'ridge', y: 16, amp: 4, color: '#4a2a55', seed: 4, step: 2, smooth: true },
    { t: 'rect', x: 0, y: 17, w: 40, h: 23, color: '#2f5a2f' },
    // Road narrowing to the horizon.
    ...Array.from({ length: 23 }, (_, i): Layer => {
      const half = 1 + Math.round(i * 0.75);
      return { t: 'rect', x: 20 - half, y: 17 + i, w: half * 2, h: 1, color: '#3b3b46' };
    }),
    ...[19, 22, 33, 37].map((y): Layer => ({ t: 'rect', x: 20, y, w: 1, h: y > 30 ? 2 : 1, color: '#f5f0d0' })),
    {
      t: 'sprite',
      x: 15,
      y: 25,
      pal: { r: '#e0483e', d: '#a12c2c', g: '#9fd3ff', k: '#151515', l: '#ffd84a' },
      rows: ['...rrrr...', '..rggggr..', '.rrrrrrrr.', 'rldddddddl', 'rrrrrrrrrr', '.kk....kk.'],
    },
  ],

  // An airship sailing between floating islands above the clouds.
  'skies-of-arcadia': [
    { t: 'sky', colors: ['#2f6fd6', '#4f8fe6', '#7fb3f2', '#b8d8ff'] },
    { t: 'disc', x: 32, y: 7, r: 3, color: '#fff6c8' },
    { t: 'disc', x: 6, y: 33, r: 4, color: '#ffffff' },
    { t: 'disc', x: 12, y: 35, r: 5, color: '#ffffff' },
    { t: 'disc', x: 22, y: 36, r: 4, color: '#f2f6ff' },
    { t: 'disc', x: 31, y: 34, r: 5, color: '#ffffff' },
    { t: 'rect', x: 0, y: 36, w: 40, h: 4, color: '#ffffff' },
    {
      t: 'sprite',
      x: 2,
      y: 12,
      pal: { g: '#4caf50', d: '#2e7d32', b: '#8d6e63', k: '#5d4037' },
      rows: ['..gggggg..', '.gggddggg.', 'bbbbbbbbbb', '.bbkkbbbb.', '..bkkkbb..', '...kkkb...', '....kk....'],
    },
    {
      t: 'sprite',
      x: 28,
      y: 18,
      pal: { g: '#66bb6a', b: '#a1887f', k: '#6d4c41' },
      rows: ['.gggggg.', 'bbbbbbbb', '.bkkbbb.', '..bkkb..', '...kk...'],
    },
    {
      t: 'sprite',
      x: 12,
      y: 15,
      pal: { s: '#f4ecd8', e: '#d9cdb0', w: '#8d5a32', d: '#5c3a1e', r: '#c0392b', y: '#ffd84a' },
      rows: [
        '.....r..........',
        '....sss.........',
        '...sssss..sss...',
        '..sseeeeesssss..',
        '.......w....e...',
        'wwwwwwwwwwwwwwyy',
        '.wwddwwddwwddww.',
        '..wwwwwwwwwwww..',
      ],
    },
  ],

  // Ink-wash mountains, a huge red sun and drifting blossom petals.
  okami: [
    { t: 'sky', colors: ['#f6efe0', '#efe4cc', '#e8d8b8'] },
    { t: 'disc', x: 27, y: 12, r: 7, color: '#d6403a' },
    { t: 'ridge', y: 26, amp: 9, color: '#8a8478', seed: 9, step: 1, smooth: true },
    { t: 'ridge', y: 32, amp: 6, color: '#4a463f', seed: 2, step: 1, smooth: true },
    { t: 'rect', x: 0, y: 36, w: 40, h: 4, color: '#2a2724' },
    {
      t: 'sprite',
      x: 2,
      y: 4,
      pal: { b: '#3a2a22', p: '#f4a7b9', q: '#e77f9a' },
      rows: [
        'bbbbbbbbb.......',
        '..ppbqb.bbb.....',
        '.pqppbppqp.bb...',
        '..pp.b.pp...b.p.',
        '.....b.......p..',
        '....pbq.........',
      ],
    },
    { t: 'stars', color: '#f4a7b9', n: 10, maxY: 30, seed: 33 },
  ],

  // Clean white rooftops, red accents, a runner leaping the gap.
  'mirrors-edge': [
    { t: 'sky', colors: ['#7fc4f0', '#a8d8f5', '#d8eefa'] },
    { t: 'city', y: 18, amp: 8, color: '#c8d4dc', seed: 14, minW: 3 },
    { t: 'rect', x: 0, y: 26, w: 16, h: 14, color: '#f4f6f8' },
    { t: 'rect', x: 0, y: 26, w: 16, h: 1, color: '#dfe5ea' },
    { t: 'rect', x: 24, y: 23, w: 16, h: 17, color: '#f4f6f8' },
    { t: 'rect', x: 24, y: 23, w: 16, h: 1, color: '#dfe5ea' },
    { t: 'rect', x: 29, y: 19, w: 5, h: 4, color: '#e0483e' },
    { t: 'rect', x: 5, y: 22, w: 3, h: 4, color: '#e0483e' },
    { t: 'rect', x: 34, y: 27, w: 3, h: 5, color: '#c9d3db' },
    {
      t: 'sprite',
      x: 16,
      y: 14,
      pal: { h: '#1d1d23', s: '#e8b48a', r: '#e0483e', k: '#2b2b33' },
      rows: ['...hh.', '...hs.', '.rrr..', 'r.rrr.', '..kk..', '.k..k.', 'k....k'],
    },
  ],
};
