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
  | { t: 'stars'; color: string; n: number; minY?: number; maxY?: number; seed?: number }
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
        const top = l.minY ?? 0;
        const span = (l.maxY ?? GRID) - top;
        for (let i = 0; i < l.n; i++) px(Math.floor(r() * GRID), top + Math.floor(r() * span), l.color);
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

// Shorthands for the scenes below.
const rect = (x: number, y: number, w: number, h: number, color: string): Layer => ({ t: 'rect', x, y, w, h, color });
const disc = (x: number, y: number, r: number, color: string): Layer => ({ t: 'disc', x, y, r, color });
const spr = (x: number, y: number, pal: Record<string, string>, rows: string[], flip = false): Layer => ({
  t: 'sprite',
  x,
  y,
  pal,
  rows,
  flip,
});
const cloud = (x: number, y: number, color = '#ffffff'): Layer[] => [
  disc(x, y, 2, color),
  disc(x + 3, y - 1, 3, color),
  disc(x + 7, y, 2, color),
  rect(x - 2, y + 1, 12, 2, color),
];
const pine = (x: number, y: number, color: string, trunk = '#4a2f1a'): Layer =>
  spr(x, y, { g: color, t: trunk }, ['..g..', '..g..', '.ggg.', '.ggg.', 'ggggg', '.ggg.', 'ggggg', '..t..']);
/** A strip of water from y down, with a few light ripples. */
const sea = (y: number, color: string, ripple: string, seed = 1): Layer[] => [
  rect(0, y, GRID, GRID - y, color),
  { t: 'stars', color: ripple, n: 14, seed, minY: y + 2 },
  rect(0, y, GRID, 1, ripple),
];

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
  // Two paddles and a ball on a glowing black-and-white screen.
  pong: [
    { t: 'sky', colors: ['#0a0a0a', '#141414'] },
    ...Array.from({ length: 10 }, (_, i) => rect(19, 2 + i * 4, 2, 2, '#5a5a5a')),
    rect(4, 14, 2, 8, '#f2f2f2'),
    rect(34, 20, 2, 8, '#f2f2f2'),
    rect(24, 16, 2, 2, '#ffffff'),
    rect(27, 15, 1, 1, '#555555'),
    rect(29, 14, 1, 1, '#333333'),
    spr(11, 4, { w: '#d0d0d0' }, ['www.www', '..w...w', 'www.www', 'w.....w', 'www.www']),
  ],

  // A wall of coloured bricks, half knocked out, and a paddle below.
  'breakout-1976': [
    { t: 'sky', colors: ['#0b0b16', '#12122a'] },
    ...['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db'].flatMap((c, row) =>
      Array.from({ length: 8 }, (_, i) => i)
        .filter((i) => row < 2 || (row * 7 + i * 3) % 5 !== 1)
        .map((i) => rect(1 + i * 5, 8 + row * 3, 4, 2, c))
    ),
    rect(22, 26, 2, 2, '#ffffff'),
    rect(16, 32, 9, 2, '#9fd3ff'),
  ],

  // Two little tanks facing off between low walls on a green field.
  combat: [
    { t: 'sky', colors: ['#3f7a2a', '#4d8c33'] },
    rect(18, 10, 4, 20, '#c9a36b'),
    rect(6, 6, 10, 2, '#c9a36b'),
    rect(26, 32, 10, 2, '#c9a36b'),
    spr(4, 17, { a: '#2e5fd6', b: '#173a8c', k: '#0d1d45' }, ['bbbbbb...', '.aaaa....', '.aaaaaaaa', '.aaaa....', 'bbbbbb...']),
    spr(27, 21, { a: '#d64a2e', b: '#8c2717', k: '#45110d' }, ['bbbbbb...', '.aaaa....', '.aaaaaaaa', '.aaaa....', 'bbbbbb...'], true),
    rect(14, 19, 2, 1, '#ffe066'),
  ],

  // A flying saucer beaming down over a sleeping city, a cannon waiting below.
  'space-invaders': [
    { t: 'sky', colors: ['#05060f', '#0e1030', '#1a1d4a'], to: 30 },
    { t: 'stars', color: '#c8ccff', n: 30, maxY: 22 },
    rect(15, 13, 10, 15, '#9fe3a033'),
    rect(17, 13, 6, 15, '#c8ffc844'),
    spr(12, 9, { g: '#9fe3a0', d: '#4caf50', y: '#ffe066' }, ['....gggggg......', '..gggggggggg....', 'dddydddyddddyd..', '..dddddddddd....'].map((r) => r.slice(0, 14))),
    { t: 'city', y: 28, amp: 5, color: '#11142c', lit: '#ffd84a', seed: 8 },
    spr(17, 31, { g: '#5fe35f' }, ['...gg...', '.gggggg.', 'gggggggg']),
  ],

  // A swarm of winged alien ships diving out of formation at a lone fighter.
  galaxian: [
    { t: 'sky', colors: ['#020208', '#070a1c', '#0d1230'] },
    { t: 'stars', color: '#ffffff', n: 25 },
    { t: 'stars', color: '#ff6b6b', n: 8, seed: 41 },
    ...[
      [6, 8],
      [14, 8],
      [22, 8],
      [30, 8],
      [10, 13],
      [26, 13],
    ].map(([x, y]) => spr(x, y, { p: '#2ec4a8', y: '#c8fff0', r: '#1a7a6a' }, ['p...p', 'pp.pp', '.prp.', '..y..'])),
    spr(18, 19, { p: '#7ad4ff', y: '#ffffff', r: '#2a7ab8' }, ['p...p', 'pp.pp', '.prp.', '..y..']),
    spr(17, 28, { w: '#e8ecff', b: '#4da3ff', r: '#ffb84a' }, ['...w...', '..wbw..', 'r.www.r', 'wwwwwww', 'w.w.w.w']),
    rect(20, 24, 1, 2, '#ffffff'),
  ],

  // A bed drifting through a candy-coloured night sky full of dreams.
  'little-nemo': [
    { t: 'sky', colors: ['#1a1042', '#2e1d6b', '#53358f', '#8a5bb8'] },
    { t: 'stars', color: '#fff3b0', n: 30, maxY: 26 },
    disc(30, 9, 5, '#fff3b0'),
    disc(32, 8, 4, '#2e1d6b'),
    ...cloud(4, 30, '#c9b6ff'),
    ...cloud(26, 33, '#c9b6ff'),
    spr(10, 18, { w: '#8d5a32', s: '#ffffff', b: '#e05a8a', p: '#f6b8d0', k: '#5c3a1e' }, [
      'w...............',
      'w.ss............',
      'w.ssbbbbbbbbbbb.',
      'wwbbbppbbppbbbbw',
      'wwwwwwwwwwwwwwww',
      'k..............k',
    ]),
    spr(6, 11, { r: '#ff4d6d', w: '#ffffff' }, ['.r.', 'rwr', '.r.']),
    spr(29, 22, { y: '#ffd84a', w: '#ffffff' }, ['.y.', 'ywy', '.y.']),
  ],

  // A dark castle under a blood-red sky, bats circling the towers.
  'gargoyles-quest': [
    { t: 'sky', colors: ['#2a0a12', '#5c1420', '#a0282e', '#d9573a'], to: 30 },
    disc(10, 10, 5, '#ffcf8a'),
    { t: 'ridge', y: 31, amp: 3, color: '#1a0a0e', seed: 6, step: 2 },
    spr(19, 9, { k: '#1a0a0e', y: '#ffb84a' }, [
      'k.k.....k.k.',
      'kkk.....kkk.',
      '.k...k...k..',
      '.k..kkk..k..',
      '.k..kkk..k..',
      '.kkkkkkkkk..',
      '.kkkkykkkk..',
      '.kkkkkkkkk..',
      '.kykkkkkyk..',
      '.kkkkkkkkk..',
      '.kkkkkkkkk..',
      'kkkkkkkkkkkk',
      'kkkkkkkkkkkk',
      'kkkkkkkkkkkk',
      'kkkkk..kkkkk',
      'kkkkk..kkkkk',
      'kkkkk..kkkkk',
    ]),
    rect(19, 26, 12, 14, '#1a0a0e'),
    ...[
      [5, 18],
      [13, 21],
      [33, 14],
    ].map(([x, y]) => spr(x, y, { k: '#1a0a0e' }, ['k...k', 'kk.kk', '.kkk.'])),
  ],

  // A rocket trail streaking past a steam-powered castle on a cliff.
  'rocket-knight': [
    { t: 'sky', colors: ['#4fa3e6', '#7cc0f0', '#b3dcf7'], to: 30 },
    ...cloud(4, 8),
    ...cloud(27, 13),
    { t: 'ridge', y: 30, amp: 4, color: '#5a8a3a', seed: 12, step: 2, smooth: true },
    rect(26, 16, 10, 16, '#8a7a6a'),
    rect(28, 12, 3, 4, '#8a7a6a'),
    rect(33, 10, 2, 6, '#5a4a3a'),
    rect(33, 6, 2, 3, '#d9d9d9'),
    rect(32, 4, 4, 2, '#eeeeee'),
    rect(29, 20, 2, 3, '#ffd84a'),
    ...Array.from({ length: 12 }, (_, i) => rect(2 + i, 24 - i, 2, 1, i % 3 ? '#ffb84a' : '#ffe9a0')),
    spr(13, 9, { s: '#c8d0dc', d: '#7d8794', r: '#e0483e', o: '#ff9a3c' }, ['..ss', '.sss', 'rssd', 'oo..']),
  ],

  // A grassy chunk of land with a winding road, floating in space.
  'toejam-earl': [
    { t: 'sky', colors: ['#0a0420', '#1c0a3a', '#2e1050'] },
    { t: 'stars', color: '#ffe066', n: 20 },
    { t: 'stars', color: '#7fffd4', n: 12, seed: 17 },
    disc(8, 9, 3, '#ff7ad9'),
    rect(6, 18, 28, 8, '#3fbf3f'),
    rect(8, 26, 24, 2, '#8a5a32'),
    rect(11, 28, 18, 2, '#6b4426'),
    rect(15, 30, 10, 2, '#4a2f1a'),
    rect(18, 32, 4, 2, '#4a2f1a'),
    spr(8, 19, { r: '#d9c9a8' }, ['rrrr......', '...rrrrr..', '.......rrr', '........rr', '......rrr.', 'rrrrrrr...']),
    spr(24, 14, { b: '#4d7cff', w: '#ffffff', r: '#ff4d6d' }, ['.r.r.', '..r..', 'bbrbb', 'bwrwb', 'bbrbb']),
    pine(29, 11, '#2e8b2e'),
  ],

  // Desert pyramids under the moon, a mysterious saucer hovering above.
  'zak-mckracken': [
    { t: 'sky', colors: ['#0d1440', '#1f2a6b', '#3b4a9a', '#6b6fb8'], to: 28 },
    { t: 'stars', color: '#ffffff', n: 20, maxY: 18 },
    disc(32, 7, 3, '#f5f0d0'),
    rect(0, 28, 40, 12, '#c9a35a'),
    { t: 'ridge', y: 30, amp: 2, color: '#b08a45', seed: 4, step: 3, smooth: true },
    ...Array.from({ length: 10 }, (_, i) => rect(8 - i, 18 + i, 2 + i * 2, 1, i % 2 ? '#d9b46a' : '#c9a35a')),
    ...Array.from({ length: 7 }, (_, i) => rect(27 - i, 21 + i, 2 + i * 2, 1, i % 2 ? '#d9b46a' : '#c9a35a')),
    spr(13, 8, { s: '#b8c4d0', d: '#6a7888', g: '#7fffb0' }, ['....ssss....', '..ssssssss..', 'dgddgddgddgd', '..dddddddd..']),
    rect(17, 12, 4, 10, '#7fffb033'),
  ],

  // A longship with a striped sail between icebergs in a cold fjord.
  'lost-vikings': [
    { t: 'sky', colors: ['#9fd0f0', '#c5e3f7', '#e3f2fb'], to: 26 },
    { t: 'ridge', y: 24, amp: 8, color: '#8aa3b8', seed: 19, step: 1, smooth: true },
    ...sea(26, '#2a6fa8', '#7fb8e0', 3),
    spr(2, 18, { w: '#ffffff', b: '#cfe8f7' }, ['..ww...', '.wwwb..', 'wwwwbb.', 'wwwwwbb']),
    spr(10, 13, { r: '#d63a2e', w: '#f4ecd8', m: '#6b4426', b: '#8d5a32', y: '#ffd84a', s: '#b8c4d0' }, [
      '.........m.........',
      '.....rwrwrwrw......',
      '.....rwrwrwrw......',
      '.....rwrwrwrw......',
      '.....rwrwrwrw......',
      '.........m.........',
      'b........m........b',
      'bb.sysysysysysy..bb',
      '.bbbbbbbbbbbbbbbbb.',
      '..bbbbbbbbbbbbbbb..',
    ]),
  ],

  // A strange alien world: two moons, rock arches and a still pool.
  'another-world': [
    { t: 'sky', colors: ['#1a2a4a', '#2f4a6b', '#5a6f8a', '#a08a7a'], to: 28 },
    disc(28, 8, 5, '#e8d8c0'),
    disc(10, 12, 2, '#c0b0a0'),
    spr(0, 14, { k: '#1a1418' }, [
      'kkk..........',
      'kkkk.........',
      'kkkkkk.......',
      'kkkkkkkk.....',
      'kkk...kkk....',
      'kk.....kkk...',
      'k.......kk...',
      'k........kk..',
      'k........kk..',
      'k........kkk.',
      'k........kkkk',
      'kk.......kkkk',
      'kkk.....kkkkk',
      'kkkk..kkkkkkk',
    ]),
    { t: 'ridge', y: 28, amp: 2, color: '#2a2024', seed: 23, step: 2 },
    rect(16, 30, 20, 3, '#2f6f8a'),
    rect(18, 30, 14, 1, '#7fc4d8'),
    rect(30, 22, 1, 6, '#1a1418'),
  ],

  // A futuristic tower rising out of a dark jungle planet at night.
  flashback: [
    { t: 'sky', colors: ['#06101a', '#0d2030', '#1a3a4a'], to: 30 },
    { t: 'stars', color: '#bfe8ff', n: 16, maxY: 16 },
    disc(8, 7, 3, '#cde8d0'),
    rect(25, 6, 6, 28, '#2a3a4a'),
    rect(26, 4, 4, 2, '#3a4a5a'),
    rect(27, 2, 2, 2, '#ff4d4d'),
    ...Array.from({ length: 8 }, (_, i) => rect(27, 8 + i * 3, 2, 1, '#7fe3ff')),
    { t: 'ridge', y: 28, amp: 8, color: '#0f3a24', seed: 31, step: 2 },
    { t: 'ridge', y: 33, amp: 5, color: '#082414', seed: 13, step: 1 },
    spr(10, 22, { c: '#7fe3ff', w: '#e8fbff' }, ['.ccc.', 'cwwwc', 'cwcwc', 'cwwwc', '.ccc.']),
  ],

  // Laser beams fanning across a hostile metal world under a violet sky.
  'turrican-2': [
    { t: 'sky', colors: ['#12062a', '#2a0a4a', '#4a1470', '#7a2a8a'], to: 30 },
    { t: 'stars', color: '#ffffff', n: 14, maxY: 18 },
    disc(30, 9, 4, '#ff9a3c'),
    { t: 'city', y: 30, amp: 6, color: '#2a2a3a', lit: '#ff4d6d', seed: 29, minW: 4 },
    rect(0, 32, 40, 8, '#3a3a4a'),
    rect(0, 32, 40, 1, '#8a8aa0'),
    ...Array.from({ length: 5 }, (_, i) =>
      Array.from({ length: 16 }, (_, j) => rect(10 + j, 22 - Math.round(((i - 2) * j) / 3), 1, 1, ['#7fe3ff', '#bff3ff', '#ffffff', '#bff3ff', '#7fe3ff'][i]))
    ).flat(),
    spr(5, 18, { s: '#b8c4d0', d: '#6a7888', y: '#ffd84a' }, ['.ss.', 'ssyd', 'sssd', '.dd.', 'd..d']),
  ],

  // Floating brick ledges and sparkling diamonds in a dreamy blue sky.
  'giana-sisters': [
    { t: 'sky', colors: ['#3a6fd8', '#5a8fe8', '#8ab8f5'] },
    ...cloud(4, 8),
    ...cloud(27, 6),
    { t: 'ridge', y: 32, amp: 4, color: '#3a9a3a', seed: 8, step: 3, smooth: true },
    ...[
      [4, 22, 4],
      [16, 16, 3],
      [27, 22, 4],
    ].flatMap(([x, y, n]) =>
      Array.from({ length: n }, (_, i) => [rect(x + i * 3, y, 3, 3, '#b8562e'), rect(x + i * 3, y, 3, 1, '#e08a5a'), rect(x + i * 3 + 2, y + 1, 1, 2, '#7a3418')]).flat()
    ),
    ...[
      [8, 17],
      [19, 11],
      [31, 17],
    ].map(([x, y]) => spr(x, y, { c: '#ff4dd2', w: '#ffffff', d: '#b0208a' }, ['.c.', 'cwc', 'dcd', '.d.'])),
  ],

  // Bright toy-like blocks and a shining gem on a cheerful cartoon planet.
  'mischief-makers': [
    { t: 'sky', colors: ['#ffd84a', '#ffb84a', '#ff8a5a'] },
    disc(20, 30, 14, '#5fd35f'),
    disc(20, 30, 12, '#4fbf4f'),
    rect(0, 34, 40, 6, '#3a9a3a'),
    spr(3, 10, { r: '#e0483e', w: '#ffffff' }, ['rrrr', 'rwwr', 'rwwr', 'rrrr']),
    spr(33, 12, { b: '#3a6fd8', w: '#ffffff' }, ['bbbb', 'bwwb', 'bwwb', 'bbbb']),
    spr(10, 4, { p: '#b05cff', w: '#ffffff' }, ['ppp', 'pwp', 'ppp']),
    spr(16, 8, { y: '#ffe9a0', c: '#4dd2ff', w: '#ffffff', d: '#1a8ab8' }, [
      '...ccc...',
      '..cwwcc..',
      '.cwccccc.',
      'ccccccccc',
      '.dcccccd.',
      '..dcccd..',
      '...dcd...',
      '....d....',
    ]),
    { t: 'stars', color: '#ffffff', n: 8, maxY: 20, seed: 51 },
  ],

  // A swarm of giant insects closing in on a ship over a green alien planet.
  'jet-force-gemini': [
    { t: 'sky', colors: ['#04040c', '#0a0a1c', '#141430'] },
    { t: 'stars', color: '#ffffff', n: 30 },
    disc(20, 44, 18, '#2a7a4a'),
    disc(20, 44, 16, '#3a9a5a'),
    ...[
      [4, 6],
      [12, 10],
      [28, 5],
      [33, 12],
      [22, 14],
    ].map(([x, y]) => spr(x, y, { k: '#c0392b', d: '#7a1a12', w: '#d9e8ff' }, ['w.w..', '.ww..', 'kkkkd', '.d.d.'])),
    spr(14, 19, { s: '#d9d9e8', d: '#6a7888', r: '#e0483e', o: '#ffb84a' }, ['....ss....', '.ssssssss.', 'rsssddsssr', '..s....s..', '..o....o..']),
  ],

  // A jungle clearing with a bunch of bananas and a waiting capture net.
  'ape-escape': [
    { t: 'sky', colors: ['#7fd4ff', '#a8e3ff'], to: 20 },
    { t: 'ridge', y: 18, amp: 6, color: '#1f6a2a', seed: 15, step: 2 },
    { t: 'ridge', y: 26, amp: 5, color: '#2a8a3a', seed: 44, step: 2 },
    rect(0, 30, 40, 10, '#6b8a2a'),
    rect(0, 30, 40, 1, '#8ab83a'),
    spr(5, 14, { y: '#ffe066', d: '#c9a32a', g: '#4a3a1a' }, ['...g...', '..yyg..', '.yyy.y.', 'yyy.yy.', 'yy.yy..', '.d.d...']),
    spr(22, 12, { w: '#e8e8e8', k: '#8a8a8a', h: '#c0392b', b: '#3a3a3a' }, [
      '..kwkwk...',
      '.kwkwkwk..',
      'kwkwkwkwk.',
      '.kwkwkwk..',
      '..kwkwk...',
      '....b.....',
      '.....b....',
      '......b...',
      '.......h..',
      '........hh',
    ]),
  ],

  // Moonlit ruins of a medieval town, a lone sword stuck in the stones.
  'vagrant-story': [
    { t: 'sky', colors: ['#120a14', '#2a1424', '#4a1e2e', '#6a2a3a'], to: 30 },
    disc(9, 9, 4, '#f0e0d0'),
    { t: 'stars', color: '#e8d0d8', n: 12, maxY: 18 },
    spr(16, 6, { s: '#5a4a48', d: '#3a2e2e', w: '#8a7070' }, [
      '....ss....ss........',
      '....ss....ss........',
      '...ssss..ssss.......',
      '...s..s..s..s.......',
      '..ss..ss.s..s..ss...',
      '..s....s.s..s..ss...',
      '.ss....ssss.ss.ss.s.',
      '.s......ss...s.s..s.',
      '.s......ss...s.s..s.',
      'ss......ss...sss..ss',
      'sd......sd...sdd..sd',
      'sd......sd...sdd..sd',
      'sd......sd...sdd..sd',
      'sd......sd...sdd..sd',
      'sd......sd...sdd..sd',
      'sd......sd...sdd..sd',
      'sd......sd...sdd..sd',
      'sd......sd...sdd..sd',
      'sd......sd...sdd..sd',
      'sd......sd...sdd..sd',
    ]),
    rect(0, 30, 40, 10, '#2a1e1e'),
    rect(0, 30, 40, 1, '#4a3a38'),
    spr(5, 21, { s: '#d0d8e0', g: '#c9a32a', r: '#8a1a2a' }, ['.s.', '.s.', '.s.', '.s.', '.s.', 'ggg', '.r.', '.r.', '.g.']),
  ],

  // A spray can and fresh paint splashes on a sunny city wall.
  'jet-set-radio': [
    { t: 'sky', colors: ['#3ab8ff', '#7fd4ff'], to: 12 },
    { t: 'city', y: 12, amp: 5, color: '#8ab0c8', seed: 21 },
    rect(0, 13, 40, 20, '#d8c8b0'),
    ...Array.from({ length: 6 }, (_, i) => rect(0, 15 + i * 3, 40, 1, '#c8b8a0')),
    disc(11, 22, 5, '#ff4dd2'),
    disc(16, 19, 3, '#ffe066'),
    disc(25, 23, 4, '#4dff7a'),
    disc(29, 19, 2, '#3a6fd8'),
    spr(8, 18, { k: '#1a1a1a' }, ['kkk..kkk..kk.', 'k.k..k.k..k.k', 'kk...kkk..k.k', 'k.k..k.k..k.k', 'k.k..k.k..kk.']),
    rect(0, 33, 40, 7, '#5a5a6a'),
    rect(0, 33, 40, 1, '#8a8a9a'),
    spr(30, 25, { r: '#e0483e', s: '#d0d8e0', k: '#3a3a3a', w: '#ffffff' }, ['.k..', 'sss.', 'rrr.', 'rwr.', 'rrr.', 'rrr.', 'sss.']),
    spr(25, 25, { p: '#ff4dd2' }, ['p.p', '.p.', 'p..']),
  ],

  // A starship cruising past a ringed planet over a navigation grid.
  'star-control-2': [
    { t: 'sky', colors: ['#02020a', '#060618', '#0c0c28'] },
    ...Array.from({ length: 5 }, (_, i) => rect(0, 26 + i * 3, 40, 1, '#123a5a')),
    ...Array.from({ length: 8 }, (_, i) => rect(i * 5 + 2, 26, 1, 14, '#123a5a')),
    { t: 'stars', color: '#ffffff', n: 25, maxY: 24 },
    disc(26, 12, 7, '#c97a3a'),
    rect(19, 10, 14, 1, '#e8a86a'),
    rect(20, 14, 12, 1, '#a8582a'),
    rect(14, 12, 24, 1, '#e8d8a0'),
    spr(5, 17, { s: '#c8d0dc', d: '#6a7888', b: '#4da3ff', o: '#ff9a3c' }, ['.ss.......', 'osssssss..', 'ossdddbbss', 'osssssss..', '.ss.......']),
    rect(24, 31, 2, 2, '#ffe066'),
  ],

  // A home-made rocket parked on the red dust of Mars.
  'commander-keen': [
    { t: 'sky', colors: ['#1a0a2a', '#3a0a3a', '#6a1a3a', '#a03a2a'], to: 26 },
    { t: 'stars', color: '#ffffff', n: 16, maxY: 16 },
    disc(30, 8, 2, '#e8d8c0'),
    { t: 'ridge', y: 26, amp: 5, color: '#8a2a1a', seed: 9, step: 2, smooth: true },
    rect(0, 28, 40, 12, '#c0482a'),
    rect(0, 28, 40, 1, '#e06a3a'),
    { t: 'stars', color: '#8a2a1a', n: 14, seed: 66 },
    spr(16, 12, { s: '#d0d8e0', r: '#e0483e', b: '#4da3ff', d: '#8a94a0', o: '#ffb84a' }, [
      '...r...',
      '..rrr..',
      '..sss..',
      '..sbs..',
      '..sss..',
      '..sss..',
      '..sds..',
      '.rsssr.',
      'rrsssrr',
      'r.ooo.r',
      '...o...',
    ]),
  ],

  // A young planet rising out of the dark, a crystal glowing beside it.
  terranigma: [
    { t: 'sky', colors: ['#020208', '#06061a', '#0a0a2a'] },
    { t: 'stars', color: '#ffffff', n: 30 },
    disc(20, 36, 16, '#1a5aa8'),
    spr(8, 22, { g: '#3a9a3a', d: '#2a7a2a', s: '#d9c08a' }, [
      '....gg..............',
      '...gggg.......ggg...',
      '..gggdgg.....ggggg..',
      '...ggggg....ggdggg..',
      '....gss......gggg...',
      '.....g.........g....',
      '........gg..........',
      '.......gggg.........',
    ]),
    spr(29, 6, { c: '#7fe3ff', w: '#ffffff', d: '#2a8ab8' }, ['..c..', '.cwc.', '.cwc.', 'ccwcc', '.cdc.', '.cdc.', '..d..']),
    { t: 'stars', color: '#bff3ff', n: 8, maxY: 16, seed: 77 },
  ],

  // A small dragon flying over the sea towards a hilltop castle at sunset.
  'wonder-boy-3': [
    { t: 'sky', colors: ['#3a2a6a', '#8a3a7a', '#e06a5a', '#ffb86a'], to: 26 },
    disc(10, 22, 4, '#ffe9a0'),
    ...sea(26, '#2a3a7a', '#e06a5a', 9),
    { t: 'ridge', y: 25, amp: 3, color: '#3a5a2a', seed: 2, step: 2, smooth: true },
    spr(26, 18, { k: '#4a3a5a', r: '#c0392b' }, ['.r...r..', '.k...k..', 'kkk.kkk.', 'kkkkkkk.', 'kk.k.kk.', 'kkkkkkk.', 'kkkkkkkk', 'kkkkkkkk']),
    spr(5, 9, { g: '#3fbf3f', d: '#2a8a2a', y: '#ffd84a', r: '#e0483e' }, ['..g.......', '.ggg...g..', 'gggggggg..', '.gydgggggr', '..gggdd.g.', '..g...g...']),
  ],

  // A neon grid world full of floating blocks, like a stage inside a game.
  'kid-chameleon': [
    { t: 'sky', colors: ['#0a0420', '#1a0a3a', '#2a0a4a'], to: 24 },
    { t: 'stars', color: '#ff7ad9', n: 14, maxY: 20 },
    rect(0, 24, 40, 16, '#140428'),
    ...Array.from({ length: 6 }, (_, i) => rect(0, 24 + Math.round(i * i * 0.5) + i, 40, 1, '#ff4dd2')),
    ...Array.from({ length: 9 }, (_, i) => {
      const x = 20 + (i - 4) * 2;
      return Array.from({ length: 16 }, (_, j) => rect(Math.round(x + ((x - 20) * j) / 3), 24 + j, 1, 1, '#ff4dd2'));
    }).flat(),
    ...[
      [6, 10],
      [17, 6],
      [28, 11],
    ].flatMap(([x, y]) => [rect(x, y, 6, 6, '#4dd2ff'), rect(x + 1, y + 1, 4, 4, '#1a8ab8'), rect(x + 2, y + 2, 2, 2, '#ffe066')]),
  ],

  // A huge pale moon over violet grassland and a lone gnarled tree.
  'shadow-of-the-beast': [
    { t: 'sky', colors: ['#1a1a4a', '#3a2a6a', '#6a3a8a', '#9a5aa0'], to: 30 },
    disc(26, 13, 8, '#e8e0f0'),
    disc(23, 11, 2, '#d0c8e0'),
    { t: 'ridge', y: 26, amp: 4, color: '#3a2a5a', seed: 18, step: 2, smooth: true },
    rect(0, 28, 40, 3, '#5a4a8a'),
    rect(0, 31, 40, 3, '#4a3a7a'),
    rect(0, 34, 40, 6, '#2a1a4a'),
    spr(4, 10, { k: '#140a20' }, [
      '.kk...k....',
      '..kk.kk..k.',
      'k..kkk..kk.',
      '.k..kk.kk..',
      '..kkkkkk...',
      '....kk.....',
      '....kk.....',
      '....kk.....',
      '....kk.....',
      '...kkk.....',
      '...kkkk....',
      '...kkkk....',
      '..kkkkkk...',
      '..kkkkkk...',
      '.kkkkkkkk..',
      'kkkkkkkkkk.',
      'kkkkkkkkkkk',
      'kkkkkkkkkkk',
    ]),
  ],

  // A pale castle on a sea cliff, joined to the land by a long thin bridge.
  ico: [
    { t: 'sky', colors: ['#e8f0f0', '#d8e8e8', '#c8dce0'], to: 28 },
    ...sea(28, '#7aa0a8', '#b8d0d0', 5),
    spr(22, 6, { s: '#a8b0a8', d: '#8a928a', w: '#c8d0c8' }, [
      '.....ss.......',
      '.....ss.......',
      '....ssss......',
      '....ssss...s..',
      '..s.ssss..sss.',
      '.sss.ssss.sss.',
      '.sssssssssssss',
      '.sdsssssdsssds',
      '.ssssssssssss.',
      'ssssssssssssss',
      'sdssssddsssdss',
      'ssssssssssssss',
      'dssssssssssssd',
      'ddsssssssssssd',
      'dddssssssssddd',
      'dddddsssssdddd',
      'ddddddddddddd.',
      '.ddddddddddd..',
      '..ddddddddd...',
      '...ddddddd....',
      '....ddddd.....',
      '.....ddd......',
    ]),
    rect(2, 16, 21, 1, '#8a928a'),
    ...Array.from({ length: 5 }, (_, i) => rect(3 + i * 4, 17, 1, 11, '#9aa29a')),
    rect(0, 14, 4, 26, '#7a827a'),
  ],

  // A tactical map: red and blue tanks facing off across rivers and woods.
  'advance-wars': [
    { t: 'sky', colors: ['#5fbf3f', '#4faf3a'] },
    ...Array.from({ length: 8 }, (_, i) => rect(i * 5, 0, 1, 40, '#4a9a34')),
    ...Array.from({ length: 8 }, (_, i) => rect(0, i * 5, 40, 1, '#4a9a34')),
    rect(15, 0, 5, 40, '#3a8ad8'),
    rect(15, 0, 1, 40, '#7fc0f0'),
    rect(0, 20, 40, 4, '#c9b48a'),
    rect(15, 20, 5, 4, '#8a6a4a'),
    pine(5, 6, '#2a6a2a'),
    pine(26, 30, '#2a6a2a'),
    pine(31, 5, '#2a6a2a'),
    spr(26, 8, { m: '#a89a8a', w: '#ffffff' }, ['..w..', '.mwm.', 'mmmmm']),
    spr(4, 26, { a: '#e0483e', b: '#8a1a12' }, ['.aa...', 'aaaaaa', 'bbbbb.']),
    spr(8, 30, { a: '#e0483e', b: '#8a1a12' }, ['.aa...', 'aaaaaa', 'bbbbb.']),
    spr(25, 13, { a: '#3a6fd8', b: '#1a3a8a' }, ['...aa.', 'aaaaaa', '.bbbbb']),
    spr(29, 16, { a: '#3a6fd8', b: '#1a3a8a' }, ['...aa.', 'aaaaaa', '.bbbbb']),
  ],

  // A lighthouse on a little island at dusk, a hovercraft on the waves.
  'beyond-good-evil': [
    { t: 'sky', colors: ['#2a3a6a', '#4a5a8a', '#8a7aa0', '#e0a08a'], to: 26 },
    { t: 'stars', color: '#ffffff', n: 10, maxY: 12 },
    ...sea(26, '#1a4a6a', '#5a8aa8', 12),
    spr(22, 4, { w: '#f0f0f0', r: '#c0392b', y: '#ffe066', k: '#3a3a3a', g: '#3a7a3a', s: '#8a7a6a' }, [
      '.....k......',
      '....kyk.....',
      '....kyk.....',
      '....kkk.....',
      '....www.....',
      '....rrr.....',
      '....www.....',
      '....rrr.....',
      '...wwww.....',
      '...rrrr.....',
      '...wwww.....',
      '...rrrr.....',
      '...wwww.....',
      '..ggggggg...',
      '.ggsssssggg.',
      'sssssssssss.',
      '.ssssssss...',
    ]),
    rect(28, 5, 12, 1, '#ffe06688'),
    spr(5, 25, { g: '#3a8a6a', d: '#1a5a4a', w: '#ffffff', y: '#ffd84a' }, ['...gg....', '.ggggggg.', 'dddddddd.', '.wwwwwww.']),
  ],

  // A summer camp at night: pine trees, a still lake and a crackling campfire.
  psychonauts: [
    { t: 'sky', colors: ['#0a0a2a', '#1a1a4a', '#2a2a5a'], to: 24 },
    { t: 'stars', color: '#ffffff', n: 26, maxY: 18 },
    disc(30, 7, 3, '#f5f0d0'),
    ...sea(24, '#1a2a4a', '#3a4a7a', 8),
    rect(0, 32, 40, 8, '#2a3a1a'),
    rect(0, 32, 40, 1, '#3a4a2a'),
    pine(0, 16, '#14301a'),
    pine(5, 13, '#1a3a20'),
    pine(32, 15, '#14301a'),
    pine(36, 17, '#1a3a20'),
    spr(10, 26, { b: '#c9a35a', d: '#8a6a3a' }, ['...b...', '..bdb..', '.bdddb.', 'bdddddb', 'bdd.ddb']),
    spr(23, 27, { r: '#e0483e', y: '#ffe066', o: '#ff9a3c', b: '#6b4426' }, ['..y..', '.yoy.', '.oro.', 'orrro', 'b.b.b', '.bbb.']),
  ],

  // A sun-drenched desert of dunes, a hover bike resting under a giant moon.
  sable: [
    { t: 'sky', colors: ['#8ad0e8', '#b8e0e8', '#f0e0c0'], to: 24 },
    disc(28, 10, 7, '#f8f4e8'),
    disc(30, 9, 2, '#e8e0d0'),
    { t: 'ridge', y: 24, amp: 4, color: '#e8b87a', seed: 5, step: 1, smooth: true },
    { t: 'ridge', y: 30, amp: 5, color: '#d89a5a', seed: 27, step: 1, smooth: true },
    { t: 'ridge', y: 35, amp: 3, color: '#c0804a', seed: 3, step: 1, smooth: true },
    spr(7, 20, { t: '#4ab8a8', d: '#2a7a70', s: '#3a3a3a', w: '#f0f0f0' }, ['......ww..', '.tttttt...', 'ttdddtttt.', '.ss....ss.']),
    rect(16, 7, 1, 13, '#c0804a'),
    spr(14, 6, { r: '#e05a3a' }, ['rrrr.', '.rrr', 'rr..']),
  ],

  // A black-and-white line drawing being brought to life with paint.
  chicory: [
    { t: 'sky', colors: ['#ffffff', '#fafafa'] },
    spr(2, 8, { k: '#1a1a1a' }, [
      '.......kkkk........................',
      '.....kk....kk..........kkkk........',
      '....k........k.......kk....kk......',
      '....k........k......k........k.....',
      '.....kk....kk.......k........k.....',
      '.......k..k..........kk....kk......',
      '.......k..k............k..k........',
      '.......k..k............k..k........',
      'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    ]),
    disc(9, 11, 3, '#ff7ab8'),
    disc(30, 13, 3, '#ffd84a'),
    disc(20, 22, 4, '#7ad4ff'),
    disc(13, 28, 2, '#8aeb6a'),
    disc(27, 27, 3, '#c08aff'),
    spr(4, 19, { w: '#c9a35a', k: '#1a1a1a', p: '#ff7ab8', s: '#9a9aa0' }, [
      '..........k',
      '.........kw',
      '........kw.',
      '.......kw..',
      '......kw...',
      '.....kw....',
      '....ss.....',
      '..pps......',
      '.ppp.......',
      'pp.........',
    ]),
  ],

  // An overgrown green island with ancient stone ruins and a golden door.
  tunic: [
    { t: 'sky', colors: ['#bfe8e0', '#d8f0e8'], to: 14 },
    rect(0, 14, 40, 26, '#4aa860'),
    ...Array.from({ length: 6 }, (_, i) => rect(i * 7, 14 + (i % 3) * 7, 5, 1, '#5fc070')),
    spr(12, 11, { s: '#c8c8b8', d: '#9a9a8a', y: '#ffd84a', k: '#3a3a3a' }, [
      '.ssssssssssss.',
      'ssdssssssssdss',
      'ss.ssssssss.ss',
      'ss.ssyyyyss.ss',
      'ss.ssykkyss.ss',
      'ss.ssykkyss.ss',
      'ss.ssykkyss.ss',
      'dd.ddykkydd.dd',
    ]),
    rect(16, 19, 6, 12, '#d9c08a'),
    rect(18, 19, 2, 12, '#e8d0a0'),
    pine(2, 14, '#2a7a3a'),
    pine(6, 22, '#2a7a3a'),
    pine(30, 17, '#2a7a3a'),
    pine(34, 25, '#2a7a3a'),
    spr(26, 28, { g: '#ffd84a', w: '#ffffff' }, ['.g.', 'gwg', '.g.']),
  ],

  // Night skyline cut by red laser beams, a spotlight sweeping the clouds.
  'alpha-protocol': [
    { t: 'sky', colors: ['#06080e', '#0e1420', '#1a2230'] },
    ...Array.from({ length: 22 }, (_, i) => rect(26 - Math.round(i / 2), 18 - i, 2 + Math.round(i / 3), 1, '#26303c')),
    { t: 'city', y: 26, amp: 10, color: '#0a0e14', lit: '#ffd84a', seed: 37, minW: 3 },
    ...Array.from({ length: 40 }, (_, i) => rect(i, 18 + Math.round(i * 0.25), 1, 1, '#ff2a2a')),
    ...Array.from({ length: 40 }, (_, i) => rect(i, 29 - Math.round(i * 0.3), 1, 1, '#ff2a2a')),
    spr(16, 27, { k: '#2a1a12', g: '#c9a32a' }, ['..kk..', 'kkkkkk', 'kgkkgk', 'kkkkkk']),
  ],

  // Chunks of a city floating in an endless sunset sky.
  'gravity-rush': [
    { t: 'sky', colors: ['#2a2a6a', '#6a3a8a', '#c06a8a', '#ffb88a', '#ffe0a8'] },
    ...cloud(2, 34, '#ffd0b0'),
    ...cloud(26, 36, '#ffd0b0'),
    spr(4, 10, { r: '#a03a3a', w: '#e8d8c0', k: '#4a3a3a', y: '#ffd84a' }, [
      '..rr.....rrr........',
      '.rrrr...rrrrr..rr...',
      '.wwww...wwyww.rrrr..',
      '.wyww...wwwww.wwyw..',
      '.wwww.r.wwywwrwwww..',
      'kkkkkkkkkkkkkkkkkkkk',
      '.kkkkkkkkkkkkkkkkkk.',
      '...kkkkkkkkkkkkkk...',
      '.....kkkkkkkkkk.....',
      '.......kkkkkk.......',
      '.........kk.........',
    ]),
    spr(29, 22, { r: '#a03a3a', w: '#e8d8c0', k: '#4a3a3a' }, ['.rr..', 'wwww.', 'kkkkk', '.kkk.', '..k..']),
    spr(25, 6, { y: '#ffe9a0', k: '#3a2a4a' }, ['y.k.y', '.kkk.', 'k.k.k', '..k..', '.k.k.']),
  ],

  // An orange sunset over a wild city, sparks flying off a grind rail.
  'sunset-overdrive': [
    { t: 'sky', colors: ['#ff5a2a', '#ff7a3a', '#ff9a4a', '#ffc85a'], to: 26 },
    disc(30, 20, 6, '#fff0a0'),
    { t: 'city', y: 26, amp: 10, color: '#4a1a4a', lit: '#ff7ad9', seed: 3 },
    ...Array.from({ length: 40 }, (_, i) => rect(i, 30 - Math.round(i * 0.2), 1, 1, '#d0d8e0')),
    ...Array.from({ length: 6 }, (_, i) => rect(4 + i * 7, 31 - Math.round((4 + i * 7) * 0.2), 1, 9, '#6a6a7a')),
    spr(17, 21, { y: '#ffe066', w: '#ffffff', o: '#ff9a3c' }, ['y...w', '.o.y.', 'w.y..', '..o.y', '.y...']),
    spr(28, 12, { g: '#4dff7a', k: '#1a1a1a', w: '#ffffff' }, ['.kk.', 'gggg', 'gwwg', 'gggg', 'gggg', 'gggg']),
  ],

  // A giant robot standing guard over a battlefield in the dust.
  'titanfall-2': [
    { t: 'sky', colors: ['#5a6a7a', '#8a8a8a', '#c0a88a'], to: 30 },
    disc(8, 10, 3, '#f0e0c0'),
    { t: 'ridge', y: 29, amp: 4, color: '#6a5a4a', seed: 14, step: 2, smooth: true },
    rect(0, 31, 40, 9, '#8a7a5a'),
    spr(15, 4, { g: '#7a8290', d: '#4a525e', y: '#ff4d4d', k: '#2a2a2a' }, [
      '.....gggg.....',
      '....gyyyyg....',
      '....gggggg....',
      '.ggggddggggg..',
      'gggggggggggggg',
      'gg.gggddggg.gg',
      'gg.gggggggg.gg',
      'gg.ggggdggg.gg',
      'kk.gggggggg.kk',
      'kk..gggggg..kk',
      '....gg..gg....',
      '....gg..gg....',
      '...ggg..ggg...',
      '...gg....gg...',
      '...gg....gg...',
      '..ggg....ggg..',
      '..ggg....ggg..',
      '.dddd....dddd.',
    ]),
    spr(29, 9, { k: '#3a3a4a', o: '#ff9a3c' }, ['..kkk...', 'kkkkkkkk', '.k....k.', '.o....o.']),
  ],

  // A loudspeaker blasting music notes over a bright comic-book factory.
  'hi-fi-rush': [
    { t: 'sky', colors: ['#ffd84a', '#ffc83a'] },
    ...Array.from({ length: 10 }, (_, y) => Array.from({ length: 10 }, (_, x) => rect(x * 4 + (y % 2) * 2, y * 4, 1, 1, '#ffb82a'))).flat(),
    { t: 'city', y: 30, amp: 6, color: '#3a2a6a', lit: '#ff4dd2', seed: 25, minW: 5 },
    rect(6, 26, 2, 8, '#3a2a6a'),
    rect(32, 23, 2, 10, '#3a2a6a'),
    spr(7, 9, { k: '#1a1a2a', g: '#5a5a7a', w: '#ffffff', p: '#ff4dd2' }, [
      'kkkkkkkkkk',
      'kgggggggk.',
      'kg.kkkk.gk',
      'kgkwwwwkgk',
      'kgkwppwkgk',
      'kgkwppwkgk',
      'kgkwwwwkgk',
      'kg.kkkk.gk',
      'kgggggggk.',
      'kkkkkkkkkk',
    ]),
    ...[
      [22, 8],
      [29, 13],
      [24, 18],
    ].map(([x, y]) => spr(x, y, { k: '#1a1a2a' }, ['..kk', '..k.', '..k.', 'kkk.', 'kk..'])),
  ],
};

// --- Automatic scenes for every other game (archive and search results) ---
// Thousands of games come live from Wikipedia, far too many to draw by hand.
// They get a scene built from a theme guessed from the title (a racing game
// gets a road, a dragon game a castle), varied per title by a seed, so no two
// pictures look quite the same.

/** A small, stable number per text (FNV-1a), the seed for a scene. */
export function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

type Theme = (r: () => number, seed: number) => Scene;
const pick = <T,>(r: () => number, list: T[]): T => list[Math.floor(r() * list.length) % list.length];

const THEMES: Record<string, Theme> = {
  space: (r, seed) => {
    const sky = pick(r, [
      ['#02020a', '#080a22', '#121640'],
      ['#0a0214', '#1a0630', '#2e0a4a'],
      ['#020a0e', '#06202a', '#0a3440'],
    ]);
    const planet = pick(r, ['#c97a3a', '#3a8ad8', '#8a4ac0', '#3aa86a', '#d8584a']);
    const px = 6 + Math.floor(r() * 28);
    const py = 6 + Math.floor(r() * 10);
    return [
      { t: 'sky', colors: sky },
      { t: 'stars', color: '#ffffff', n: 30, seed },
      { t: 'stars', color: '#8a8fb8', n: 25, seed: seed + 1 },
      disc(px, py, 4 + Math.floor(r() * 4), planet),
      disc(px - 1, py - 1, 2, '#ffffff22'),
      spr(14 + Math.floor(r() * 8), 22, { w: '#e8ecff', b: '#7fd4ff', o: '#ff9a3c' }, ['..w..', '.wbw.', 'wwwww', 'w.w.w', '.o.o.']),
    ];
  },
  race: (r, seed) => {
    const sky = pick(r, [
      ['#2a1a4a', '#6b2f6b', '#c24d5c', '#f28a4a'],
      ['#3a8ad8', '#7fc0f0', '#c8e8ff'],
      ['#06060f', '#141430', '#2a2a5a'],
    ]);
    const grass = pick(r, ['#2f5a2f', '#5a7a2a', '#7a6a4a']);
    const car = pick(r, ['#e0483e', '#3a6fd8', '#ffd84a', '#2ecc71', '#f5f5f5']);
    return [
      { t: 'sky', colors: sky, to: 18 },
      { t: 'ridge', y: 17, amp: 4, color: '#3a2a4a', seed, step: 2, smooth: true },
      rect(0, 17, 40, 23, grass),
      ...Array.from({ length: 23 }, (_, i): Layer => {
        const half = 1 + Math.round(i * 0.75);
        return rect(20 - half, 17 + i, half * 2, 1, '#3b3b46');
      }),
      ...[19, 22, 27, 33].map((y) => rect(20, y, 1, y > 26 ? 2 : 1, '#f5f0d0')),
      spr(15, 25, { r: car, g: '#9fd3ff', k: '#151515', l: '#ffd84a', d: '#00000055' }, [
        '...rrrr...',
        '..rggggr..',
        '.rrrrrrrr.',
        'rlddddddlr',
        'rrrrrrrrrr',
        '.kk....kk.',
      ]),
    ];
  },
  sport: (r, seed) => {
    const grass = pick(r, ['#3a9a3a', '#2f8a4a', '#4aa83a']);
    return [
      { t: 'sky', colors: ['#1a2a5a', '#2a3a7a'], to: 12 },
      { t: 'stars', color: '#ffffff', n: 8, maxY: 10, seed },
      ...[4, 34].map((x) => rect(x, 2, 2, 8, '#d0d0d0')),
      ...[3, 33].map((x) => rect(x, 1, 4, 2, '#fff8c0')),
      { t: 'city', y: 14, amp: 2, color: '#4a2a3a', lit: '#e0e0e0', seed, minW: 2 },
      rect(0, 14, 40, 26, grass),
      ...Array.from({ length: 5 }, (_, i) => rect(0, 14 + i * 6, 40, 3, '#ffffff12')),
      rect(0, 26, 40, 1, '#ffffff'),
      rect(19, 14, 1, 26, '#ffffff'),
      disc(20, 26, 5, '#ffffff'),
      disc(20, 26, 4, grass),
      disc(12 + Math.floor(r() * 16), 20 + Math.floor(r() * 4), 1, '#ffffff'),
    ];
  },
  castle: (r, seed) => {
    const sky = pick(r, [
      ['#1a1a4a', '#3a2a6a', '#6a3a8a'],
      ['#2a0a12', '#5c1420', '#a0282e'],
      ['#3a6fd8', '#7fb3f2', '#c8e0ff'],
    ]);
    const stone = pick(r, ['#4a4458', '#5a4a48', '#3a3a4a']);
    return [
      { t: 'sky', colors: sky, to: 30 },
      { t: 'stars', color: '#ffffff', n: 14, maxY: 14, seed },
      disc(6 + Math.floor(r() * 8), 8, 3, '#f0e8d0'),
      { t: 'ridge', y: 30, amp: 5, color: '#1a2a1a', seed, step: 2, smooth: true },
      spr(17, 8, { s: stone, y: '#ffd84a', k: '#1a1418' }, [
        's.s.......s.s',
        'sss.......sss',
        'sss..s.s..sss',
        'sss..sss..sss',
        'sys..sss..sys',
        'sss..sys..sss',
        'sssssssssssss',
        'sssssssssssss',
        'ssysssssssyss',
        'sssssssssssss',
        'sssssskssssss',
        'ssssskkksssss',
        'ssssskkksssss',
        'sssssssssssss',
      ]),
      rect(14, 22, 19, 10, '#1a2a1a'),
    ];
  },
  sea: (r, seed) => {
    const sky = pick(r, [
      ['#4fa3e6', '#8ac8f5', '#c8e8ff'],
      ['#2a3a6a', '#8a5a8a', '#f0a07a'],
    ]);
    return [
      { t: 'sky', colors: sky, to: 24 },
      ...cloud(4 + Math.floor(r() * 20), 7),
      disc(30, 8, 3, '#fff6c8'),
      ...sea(24, pick(r, ['#1a5a8a', '#2a6fa8', '#1a4a6a']), '#8ac8f0', seed),
      spr(3, 17, { g: '#4caf50', s: '#e8d08a', t: '#6b4426' }, ['..gg....', '.gggg...', 'gg.t.gg.', '...t....', '..sssss.', 'sssssssss']),
      spr(18 + Math.floor(r() * 8), 16, { w: '#f4ecd8', b: '#8d5a32', m: '#5c3a1e' }, [
        '...m....',
        '..wm....',
        '.wwm....',
        'wwwm....',
        '...m....',
        'bbbbbbbb',
        '.bbbbbb.',
      ]),
    ];
  },
  street: (r, seed) => {
    const glow = pick(r, ['#ff4dd2', '#4dd2ff', '#ffd84a', '#ff7a3c']);
    return [
      { t: 'sky', colors: ['#06060f', '#141430', '#2a1a4a'], to: 26 },
      { t: 'stars', color: '#ffffff', n: 10, maxY: 10, seed },
      { t: 'city', y: 22, amp: 12, color: '#141428', lit: glow, seed, minW: 4 },
      rect(0, 30, 40, 10, '#2a2a3a'),
      rect(0, 30, 40, 1, glow),
      ...Array.from({ length: 5 }, (_, i) => rect(2 + i * 8, 35, 4, 1, '#8a8aa0')),
      rect(30, 14, 1, 16, '#5a5a6a'),
      rect(27, 14, 4, 1, '#5a5a6a'),
      rect(27, 15, 2, 1, '#fff0a0'),
      spr(6 + Math.floor(r() * 18), 24, { k: '#0a0a14' }, ['.kk.', '.kk.', 'kkkk', 'kkkk', '.kk.', '.kk.']),
    ];
  },
  flight: (r, seed) => {
    const sky = pick(r, [
      ['#3a8ad8', '#7fc0f0', '#c8e8ff'],
      ['#ff7a3a', '#ffb84a', '#ffe0a0'],
    ]);
    const plane = pick(r, ['#8a94a0', '#5a6a5a', '#c0c8d0']);
    return [
      { t: 'sky', colors: sky },
      ...cloud(2 + Math.floor(r() * 6), 10),
      ...cloud(24 + Math.floor(r() * 6), 30),
      ...cloud(14, 36, '#f0f4ff'),
      spr(10, 16, { p: plane, d: '#3a3a4a', g: '#9fd3ff', r: '#e0483e' }, [
        '......p.............',
        '......pp............',
        '......ppp...........',
        'r.....pppp..........',
        'pp..pppppppppppggp..',
        'pppppppppppppppppppp',
        'r.dddddpppppppddddd.',
        '.......pppp.........',
        '......ppp...........',
        '......pp............',
      ]),
      { t: 'stars', color: '#ffffff', n: 4, maxY: 30, seed },
    ];
  },
  war: (r, seed) => {
    const sand = pick(r, ['#c9a35a', '#8a7a5a', '#a08a6a']);
    return [
      { t: 'sky', colors: ['#5a6a7a', '#8a8a8a', '#c0a88a'], to: 28 },
      disc(8 + Math.floor(r() * 24), 9, 3, '#f0e0c0'),
      { t: 'ridge', y: 27, amp: 4, color: '#6a5a4a', seed, step: 2, smooth: true },
      rect(0, 29, 40, 11, sand),
      { t: 'stars', color: '#00000022', n: 20, minY: 30, seed },
      spr(12, 21, { a: '#5a6a4a', b: '#3a4a2a', k: '#1a1a1a' }, [
        '.....aaaa.........',
        '....aaaaaaaaaaaaaa',
        '..aaaaaaaaa.......',
        'bbbbbbbbbbbbbb....',
        'bkbkbkbkbkbkbb....',
        '.bbbbbbbbbbbb.....',
      ]),
      ...[
        [4, 14],
        [33, 18],
      ].map(([x, y]) => disc(x, y, 2, '#8a8a8a88')),
    ];
  },
  horror: (r, seed) => [
    { t: 'sky', colors: ['#0a0a14', '#1a1428', '#2a1a3a'], to: 30 },
    disc(26 + Math.floor(r() * 6), 9, 5, '#e8e0c0'),
    { t: 'stars', color: '#8a8aa0', n: 10, maxY: 16, seed },
    { t: 'ridge', y: 30, amp: 3, color: '#14141e', seed, step: 2, smooth: true },
    rect(0, 31, 40, 9, '#14141e'),
    ...[6, 14, 22, 31].map((x, i) =>
      spr(x, 23 + (i % 2), { s: '#6a6a7a', d: '#4a4a5a' }, ['.ss.', 'ssss', 'sdds', 'ssss', 'ssss', 'ssss', 'ssss'])
    ),
    spr(2, 8, { k: '#0a0a12' }, ['k...k..', '.k.k..k', '..kk.k.', '...kk..', '...k...', '...k...', '..kk...', '..kk...', '..kk...', '.kkk...']),
    spr(16, 12, { k: '#0a0a12' }, ['k...k', 'kk.kk', '.kkk.']),
  ],
  jungle: (r, seed) => [
    { t: 'sky', colors: ['#7fd4ff', '#a8e3ff', '#d8f4ff'], to: 20 },
    disc(30, 6, 3, '#fff6c8'),
    { t: 'ridge', y: 18, amp: 6, color: '#1f6a2a', seed, step: 2 },
    { t: 'ridge', y: 26, amp: 5, color: '#2a8a3a', seed: seed + 3, step: 2 },
    rect(0, 30, 40, 10, '#6b8a2a'),
    rect(0, 30, 40, 1, '#8ab83a'),
    ...[4 + Math.floor(r() * 6), 26 + Math.floor(r() * 6)].map((x) =>
      spr(x, 12, { g: '#3a9a3a', t: '#6b4426' }, ['gg.gg.g', '.ggggg.', 'g.gtg.g', '...t...', '...t...', '...t...', '..t....', '..t....', '..t....', '..t....', '.t.....', '.t.....', '.t.....', '.t.....', '.t.....', '.t.....', '.t.....', '.t.....'])
    ),
  ],
  snow: (r, seed) => [
    { t: 'sky', colors: ['#6a8ab8', '#9ab8d8', '#c8dcf0'], to: 26 },
    { t: 'stars', color: '#ffffff', n: 40, seed },
    { t: 'ridge', y: 24, amp: 10, color: '#e8f0f8', seed: seed + 2, step: 2 },
    { t: 'ridge', y: 30, amp: 4, color: '#ffffff', seed: seed + 5, step: 1, smooth: true },
    pine(4 + Math.floor(r() * 6), 24, '#2a5a4a'),
    pine(28 + Math.floor(r() * 6), 25, '#2a5a4a'),
  ],
  puzzle: (r, seed) => {
    const cols = ['#e0483e', '#ffd84a', '#3a6fd8', '#2ecc71', '#b05cff', '#ff9a3c'];
    const rr = rng(seed);
    const blocks: Layer[] = [];
    for (let x = 0; x < 10; x++) {
      const h = 2 + Math.floor(rr() * 5);
      for (let y = 0; y < h; y++) {
        const c = pick(rr, cols);
        blocks.push(rect(x * 4, 36 - y * 4, 4, 4, '#00000055'), rect(x * 4, 36 - y * 4, 3, 3, c));
      }
    }
    const c = pick(r, cols);
    return [
      { t: 'sky', colors: ['#0a0a1e', '#141432'] },
      ...Array.from({ length: 10 }, (_, i) => rect(i * 4, 0, 1, 40, '#1a1a3a')),
      ...blocks,
      ...[
        [16, 8],
        [20, 8],
        [20, 12],
        [24, 12],
      ].flatMap(([x, y]) => [rect(x, y, 4, 4, '#00000055'), rect(x, y, 3, 3, c)]),
    ];
  },
  grid: (r, seed) => {
    const line = pick(r, ['#ff4dd2', '#4dd2ff', '#ffb84a']);
    return [
      { t: 'sky', colors: ['#0a0420', '#1a0a3a', '#3a0a4a'], to: 24 },
      disc(20, 24, 8, pick(r, ['#ff7a3a', '#ffd84a', '#ff4d8a'])),
      ...Array.from({ length: 3 }, (_, i) => rect(10, 18 + i * 2, 20, 1, '#1a0a3a')),
      { t: 'stars', color: '#ffffff', n: 16, maxY: 16, seed },
      rect(0, 24, 40, 16, '#140428'),
      ...Array.from({ length: 6 }, (_, i) => rect(0, 24 + Math.round(i * i * 0.5) + i, 40, 1, line)),
      ...Array.from({ length: 9 }, (_, i) => {
        const x = 20 + (i - 4) * 2;
        return Array.from({ length: 16 }, (_, j) => rect(Math.round(x + ((x - 20) * j) / 3), 24 + j, 1, 1, line));
      }).flat(),
    ];
  },
  hills: (r, seed) => {
    const sky = pick(r, [
      ['#4fa3e6', '#7cc0f0', '#b3dcf7'],
      ['#2a1a4a', '#8a3a7a', '#f08a5a', '#ffc85a'],
      ['#1a2a5a', '#3a4a8a', '#6a7ab8'],
    ]);
    return [
      { t: 'sky', colors: sky, to: 28 },
      disc(8 + Math.floor(r() * 24), 8 + Math.floor(r() * 6), 3, '#fff6c8'),
      ...cloud(4 + Math.floor(r() * 24), 14),
      { t: 'ridge', y: 24, amp: 8, color: pick(r, ['#5a6a9a', '#6a5a8a', '#4a7a8a']), seed, step: 2, smooth: true },
      { t: 'ridge', y: 30, amp: 5, color: pick(r, ['#3a8a3a', '#4a9a4a', '#2a7a4a']), seed: seed + 9, step: 1, smooth: true },
      { t: 'ridge', y: 35, amp: 3, color: '#2a5a2a', seed: seed + 4, step: 1, smooth: true },
      pine(4 + Math.floor(r() * 28), 26, '#1f4a2a'),
    ];
  },
};

/** Title words that point to a theme, checked in this order. */
const THEME_WORDS: [string, RegExp][] = [
  ['puzzle', /puzzle|tetris|block|brain|quiz|logic|puyo|columns|match|mahjong|chess|solitaire|pinball/],
  ['race', /rac(e|ing)|rally|kart|driv|speed|turbo|road|moto|grand prix|nascar|cars?\b|outrun|wheel|truck|f-?zero/],
  ['sport', /soccer|football|fifa|goal|tennis|golf|baseball|basket|hockey|sport|olympi|\bnba\b|\bnfl\b|\bnhl\b|\bpga\b|league|bowl|volley|boxing|wrestl|skate|cup\b/],
  ['flight', /\bair|\bace\b|aces|\bwings?\b|sky|pilot|jet\b|flight|heli|\bfly|plane|falcon|eagle|hawk|thunder|squadron/],
  ['space', /space|star|gala[xc]|planet|alien|invader|cosmic|astro|orbit|nova|meteor|\bufo|rocket|xeno|\bmars\b|moon|lunar|solar|nebula|asteroid|gradius|r-type/],
  ['war', /\bwars?\b|battle|tank|army|soldier|commando|strike|operation|desert|military|front|platoon|metal|\bguns?\b|shoot|sniper|siege/],
  ['horror', /horror|haunt|ghost|zombie|evil|dead|vampire|fear|nightmare|silent|resident|castlevania|dracula|creep|\bgraves?\b|curse|alone|undead|monster/],
  ['castle', /dragon|knight|castle|quest|legend|sword|\bking|magic|wizard|dungeon|kingdom|fantasy|saga|princess|hero|tale|myth|warrior|rune|\belf|lord/],
  ['sea', /\bsea|ocean|water|fish|pirate|\bships?\b|island|submarine|dive|aqua|wave|beach|surf|shark|dolphin|treasure|tropic/],
  ['street', /city|street|\bcops?\b|police|crime|ninja|fight|mafia|gang|night|brawl|punch|crash|urban|thief|spy|agent|detective|neon/],
  ['jungle', /jungle|\bapes?\b|monkey|safari|wild|dino|jurass|amazon|congo|tarzan|tribe/],
  ['snow', /\bice|snow|winter|\bski|frost|polar|penguin|arctic|freez|cold/],
  ['grid', /music|danc|rhythm|guitar|\bband\b|beat|\bsing|disco|cyber|tron|virtual|digital|pixel|synth/],
];
const FALLBACK = ['hills', 'space', 'grid', 'hills', 'castle', 'sea'];

/** The theme for a title: a matching word, else a stable pick from the fallbacks. */
export function themeFor(title: string, genre = ''): string {
  const text = `${title} ${genre}`.toLowerCase();
  for (const [theme, re] of THEME_WORDS) if (re.test(text)) return theme;
  return FALLBACK[hash(title) % FALLBACK.length];
}

/** A scene for any game: the hand-made one if there is one, else an automatic one. */
export function sceneFor(game: { id: string; title: string; genre?: string }): Scene {
  const own = SCENES[game.id];
  if (own) return own;
  const seed = hash(game.title) || 1;
  return THEMES[themeFor(game.title, game.genre)](rng(seed), seed);
}
