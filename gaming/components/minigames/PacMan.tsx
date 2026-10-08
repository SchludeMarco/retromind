import React, { useEffect, useRef, useState } from 'react';
import { chip } from '../../lib/chiptune';
import { tr } from '../../../lib/i18n';
import { Done, saveBest, useGameKeys, themeColors } from './shared';

// Pac-Mampf: our own little maze game in the style of the arcade classic.
// Eat all dots, dodge the four ghosts, and after a power pill they turn blue
// and can be eaten. Maze, graphics and ghost behaviour are drawn and written
// here from scratch. Steering: swipe on the maze, the arrow keys / WASD or the
// pad below; a direction pressed early is remembered until the next turn.

const MAZE = [
  '###################',
  '#........#........#',
  '#o##.###.#.###.##o#',
  '#.................#',
  '#.##.#.#####.#.##.#',
  '#....#...#...#....#',
  '####.### # ###.####',
  '___#.#       #.#___',
  '####.# ##-## #.####',
  '    .  #GGG#  .    ',
  '####.# ##### #.####',
  '___#.#       #.#___',
  '####.# ##### #.####',
  '#........#........#',
  '#.##.###.#.###.##.#',
  '#o.#.....P.....#.o#',
  '##.#.#.#####.#.#.##',
  '#....#...#...#....#',
  '#.######.#.######.#',
  '#.................#',
  '###################',
];

const COLS = MAZE[0].length;
const ROWS = MAZE.length;
const TILE = 16;
const W = COLS * TILE;
const H = ROWS * TILE;
const SCALE = 2; // canvas pixels per drawing unit, keeps it sharp on phones
const LIVES = 3;
const DOOR = { x: 9, y: 8 };
const ABOVE_DOOR = { x: 9, y: 7 };
const HOUSE = { x: 9, y: 9 };
const FRUIT = { x: 9, y: 11 };

type Dir = { x: number; y: number };
const NONE: Dir = { x: 0, y: 0 };
const UP: Dir = { x: 0, y: -1 };
const DOWN: Dir = { x: 0, y: 1 };
const LEFT: Dir = { x: -1, y: 0 };
const RIGHT: Dir = { x: 1, y: 0 };
const DIRS = [UP, LEFT, DOWN, RIGHT]; // tie-break order for the ghosts

const same = (a: Dir, b: Dir) => a.x === b.x && a.y === b.y;
const isReverse = (a: Dir, b: Dir) => a.x === -b.x && a.y === -b.y && (a.x || a.y);

function cell(x: number, y: number): string {
  if (y < 0 || y >= ROWS) return '_';
  if (x < 0 || x >= COLS) return MAZE[y][0] === ' ' ? ' ' : '_';
  return MAZE[y][x];
}

/** Whether a tile can be entered; only ghosts going home or out may use the door. */
function open(x: number, y: number, door = false): boolean {
  const c = cell(x, y);
  if (c === '#' || c === '_') return false;
  if (c === '-' || c === 'G') return door;
  return true;
}

type GhostMode = 'house' | 'leave' | 'normal' | 'fright' | 'eaten';

interface Mover {
  x: number;
  y: number;
  tx: number; // tile it is heading to
  ty: number;
  dir: Dir;
}

interface Ghost extends Mover {
  mode: GhostMode;
  release: number; // seconds left in the house
  color: string;
  corner: Dir;
  goingIn: boolean; // eaten eyes passing the door
}

interface Pac extends Mover {
  want: Dir;
  moving: boolean;
}

type Phase = 'ready' | 'play' | 'dying' | 'clear' | 'over';

interface Game {
  dots: Set<number>;
  power: Set<number>;
  total: number;
  pac: Pac;
  ghosts: Ghost[];
  score: number;
  lives: number;
  level: number;
  phase: Phase;
  phaseTime: number;
  fright: number;
  eatChain: number;
  modeClock: number;
  scatter: boolean;
  fruit: number; // seconds the cherry stays, 0 = none
  fruitsShown: number;
  popups: { x: number; y: number; text: string; t: number }[];
  wakka: number;
  paused: boolean;
  won: boolean;
}

const key = (x: number, y: number) => y * COLS + x;

function findChar(ch: string): Dir {
  for (let y = 0; y < ROWS; y++) {
    const x = MAZE[y].indexOf(ch);
    if (x >= 0) return { x, y };
  }
  return { x: 1, y: 1 };
}
const PAC_START = findChar('P');

const GHOST_LOOK = [
  { color: '#ff4b4b', corner: { x: COLS - 2, y: -3 } },
  { color: '#ffa3d7', corner: { x: 1, y: -3 } },
  { color: '#29d4ff', corner: { x: COLS - 1, y: ROWS + 1 } },
  { color: '#ffb347', corner: { x: 0, y: ROWS + 1 } },
];

function placeActors(s: Game) {
  s.pac = { x: PAC_START.x, y: PAC_START.y, tx: PAC_START.x, ty: PAC_START.y, dir: NONE, want: LEFT, moving: false };
  const starts = [ABOVE_DOOR, { x: 9, y: 9 }, { x: 8, y: 9 }, { x: 10, y: 9 }];
  const wait = [0, 1.5, 5, 9].map((t) => t / (1 + (s.level - 1) * 0.35));
  s.ghosts = GHOST_LOOK.map((look, i) => ({
    x: starts[i].x,
    y: starts[i].y,
    tx: starts[i].x,
    ty: starts[i].y,
    dir: i === 0 ? LEFT : NONE,
    mode: i === 0 ? 'normal' : 'house',
    release: wait[i],
    color: look.color,
    corner: look.corner,
    goingIn: false,
  }));
  s.fright = 0;
  s.modeClock = 0;
  s.scatter = true;
}

function fillDots(s: Game) {
  s.dots = new Set();
  s.power = new Set();
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      if (MAZE[y][x] === '.') s.dots.add(key(x, y));
      if (MAZE[y][x] === 'o') s.power.add(key(x, y));
    }
  s.total = s.dots.size + s.power.size;
  s.fruitsShown = 0;
  s.fruit = 0;
}

function newGame(): Game {
  const s = {
    score: 0,
    lives: LIVES,
    level: 1,
    phase: 'ready',
    phaseTime: 0,
    eatChain: 0,
    popups: [],
    wakka: 0,
    paused: false,
    won: false,
  } as unknown as Game;
  fillDots(s);
  placeActors(s);
  return s;
}

// Speeds in tiles per second; gentle at first, a bit quicker every level.
const pacSpeed = (lvl: number) => Math.min(5.6 + (lvl - 1) * 0.35, 7.6);
const ghostSpeed = (lvl: number) => Math.min(4.8 + (lvl - 1) * 0.4, 7.4);
const frightTime = (lvl: number) => Math.max(2.5, 8 - (lvl - 1));
// Scatter / chase rhythm: the ghosts wander to their corners now and then.
const WAVES = [7, 20, 7, 20, 5, 20, 5];

/**
 * Moves a figure `dist` tiles along its way. At every tile centre `turn`
 * picks the next direction (NONE = stop there). Handles the side tunnel.
 */
function advance(m: Mover, dist: number, turn: (m: Mover) => Dir) {
  let guard = 0;
  while (dist > 1e-6 && guard++ < 8) {
    const dx = m.tx - m.x;
    const dy = m.ty - m.y;
    const left = Math.abs(dx) + Math.abs(dy);
    if (left > dist) {
      m.x += Math.sign(dx) * dist;
      m.y += Math.sign(dy) * dist;
      return;
    }
    m.x = m.tx;
    m.y = m.ty;
    dist -= left;
    // Through the tunnel: reappear on the other side.
    if (m.x < 0) m.x = m.tx = COLS;
    else if (m.x >= COLS) m.x = m.tx = -1;
    const d = turn(m);
    m.dir = d;
    if (same(d, NONE)) return;
    m.tx = m.x + d.x;
    m.ty = m.y + d.y;
  }
}

/** Turns a figure around on the spot, also halfway between two tiles. */
function reverse(m: Mover) {
  if (same(m.dir, NONE)) return;
  if (m.x !== m.tx || m.y !== m.ty) {
    m.tx -= m.dir.x;
    m.ty -= m.dir.y;
  }
  m.dir = { x: -m.dir.x, y: -m.dir.y };
}

const dist2 = (ax: number, ay: number, bx: number, by: number) => (ax - bx) ** 2 + (ay - by) ** 2;

function ghostTarget(s: Game, g: Ghost, i: number): Dir {
  if (g.mode === 'eaten') return g.goingIn ? HOUSE : ABOVE_DOOR;
  if (g.mode === 'leave') return ABOVE_DOOR;
  if (s.scatter) return g.corner;
  const p = s.pac;
  const px = Math.round(p.tx);
  const py = Math.round(p.ty);
  const face = same(p.dir, NONE) ? p.want : p.dir;
  switch (i) {
    case 0:
      return { x: px, y: py };
    case 1:
      return { x: px + face.x * 4, y: py + face.y * 4 };
    case 2: {
      const r = s.ghosts[0];
      const ax = px + face.x * 2;
      const ay = py + face.y * 2;
      return { x: 2 * ax - Math.round(r.x), y: 2 * ay - Math.round(r.y) };
    }
    default:
      return dist2(g.x, g.y, p.x, p.y) > 64 ? { x: px, y: py } : g.corner;
  }
}

function ghostTurn(s: Game, g: Ghost, i: number): Dir {
  const door = g.mode === 'leave' || g.mode === 'eaten';
  if (g.mode === 'eaten' && !g.goingIn && g.x === ABOVE_DOOR.x && g.y === ABOVE_DOOR.y) g.goingIn = true;
  if (g.mode === 'eaten' && g.goingIn && g.x === HOUSE.x && g.y === HOUSE.y) {
    g.mode = 'leave';
    g.goingIn = false;
    g.dir = NONE;
  }
  if (g.mode === 'leave' && g.x === ABOVE_DOOR.x && g.y === ABOVE_DOOR.y) g.mode = 'normal';
  let options = DIRS.filter((d) => !isReverse(d, g.dir) && open(g.x + d.x, g.y + d.y, door || g.mode === 'leave'));
  // Normal ghosts never go back down through the door.
  if (g.mode === 'normal' || g.mode === 'fright') options = options.filter((d) => cell(g.x + d.x, g.y + d.y) !== '-');
  if (!options.length) {
    const back = { x: -g.dir.x, y: -g.dir.y };
    return open(g.x + back.x, g.y + back.y, door) ? back : NONE;
  }
  if (g.mode === 'fright') return options[Math.floor(Math.random() * options.length)];
  const t = ghostTarget(s, g, i);
  let best = options[0];
  let bestD = Infinity;
  for (const d of options) {
    const dd = dist2(g.x + d.x, g.y + d.y, t.x, t.y);
    if (dd < bestD) {
      bestD = dd;
      best = d;
    }
  }
  return best;
}

function pacTurn(p: Pac): Dir {
  if (!same(p.want, NONE) && open(p.x + p.want.x, p.y + p.want.y)) return p.want;
  if (!same(p.dir, NONE) && open(p.x + p.dir.x, p.y + p.dir.y)) return p.dir;
  return NONE;
}

const WAKKA = ['E4', 'A3'];

export const PacMan: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const g = useRef<Game>(newGame());
  const [hud, setHud] = useState({ score: 0, lives: LIVES, level: 1, phase: 'ready' as Phase, paused: false });
  const [result, setResult] = useState<{ score: number; level: number; record: boolean } | null>(null);
  const onWinRef = useRef(onWin);
  onWinRef.current = onWin;

  const start = () => {
    const s = g.current;
    if (s.phase === 'ready') {
      s.phase = 'play';
      s.phaseTime = 0;
      chip.play('start');
    } else if (s.phase === 'play') {
      s.paused = !s.paused;
      chip.play('blip');
    }
  };

  const steer = (d: Dir) => {
    const s = g.current;
    s.pac.want = d;
    // Turning around works at once, also between two tiles.
    if (s.phase === 'play' && isReverse(d, s.pac.dir)) reverse(s.pac);
    if (s.phase === 'ready') start();
    else if (s.paused) s.paused = false;
  };

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const loseLife = (s: Game) => {
      s.phase = 'dying';
      s.phaseTime = 0;
      chip.play('error');
    };

    const step = (s: Game, dt: number) => {
      s.phaseTime += dt;
      s.popups = s.popups.filter((p) => (p.t -= dt) > 0);
      if (s.phase === 'dying') {
        if (s.phaseTime > 1.6) {
          s.lives -= 1;
          if (s.lives <= 0) {
            s.phase = 'over';
            setResult({ score: s.score, level: s.level, record: s.score > 0 && saveBest('pacman', s.score, true) });
            if (s.score >= 3000 && !s.won) onWinRef.current();
          } else {
            placeActors(s);
            s.phase = 'ready';
          }
        }
        return;
      }
      if (s.phase === 'clear') {
        if (s.phaseTime > 2) {
          s.level += 1;
          fillDots(s);
          placeActors(s);
          s.phase = 'ready';
        }
        return;
      }
      if (s.phase !== 'play' || s.paused) return;

      // Scatter / chase waves (paused while the ghosts are blue).
      if (s.fright > 0) {
        s.fright = Math.max(0, s.fright - dt);
        if (s.fright === 0) s.ghosts.forEach((gh) => gh.mode === 'fright' && (gh.mode = 'normal'));
      } else {
        s.modeClock += dt;
        let t = 0;
        let scatter = true;
        for (const w of WAVES) {
          t += w;
          if (s.modeClock < t) break;
          scatter = !scatter;
        }
        if (s.modeClock >= WAVES.reduce((a, b) => a + b, 0)) scatter = false;
        if (scatter !== s.scatter) {
          s.scatter = scatter;
          // Like on the arcade machine, a mode change turns the ghosts around.
          s.ghosts.forEach((gh) => gh.mode === 'normal' && reverse(gh));
        }
      }

      // Pac-Mampf
      const p = s.pac;
      const before = { x: p.x, y: p.y };
      advance(p, pacSpeed(s.level) * dt, () => pacTurn(p));
      p.moving = p.x !== before.x || p.y !== before.y;
      if (p.moving) s.wakka += dt;
      const cx = Math.round(p.x);
      const cy = Math.round(p.y);
      const k = key(cx, cy);
      if (cx >= 0 && cx < COLS && Math.abs(p.x - cx) + Math.abs(p.y - cy) < 0.45) {
        if (s.dots.delete(k)) {
          s.score += 10;
          chip.softNote(WAKKA[s.dots.size % 2], 0.07);
        } else if (s.power.delete(k)) {
          s.score += 50;
          s.fright = frightTime(s.level);
          s.eatChain = 0;
          chip.play('powerup');
          s.ghosts.forEach((gh) => {
            if (gh.mode !== 'normal') return;
            gh.mode = 'fright';
            reverse(gh);
          });
        }
      }

      // The cherry under the ghost house, twice per level.
      const eaten = s.total - s.dots.size - s.power.size;
      if (s.fruitsShown < 2 && eaten >= (s.fruitsShown ? 140 : 60)) {
        s.fruitsShown += 1;
        s.fruit = 9;
      }
      if (s.fruit > 0) {
        s.fruit = Math.max(0, s.fruit - dt);
        if (Math.abs(p.x - FRUIT.x) + Math.abs(p.y - FRUIT.y) < 0.6) {
          const pts = 100 * s.level;
          s.score += pts;
          s.fruit = 0;
          s.popups.push({ x: FRUIT.x, y: FRUIT.y, text: String(pts), t: 1.2 });
          chip.play('coin');
        }
      }

      // Ghosts
      const gs = ghostSpeed(s.level);
      s.ghosts.forEach((gh, i) => {
        if (gh.mode === 'house') {
          gh.release -= dt;
          if (gh.release <= 0) gh.mode = 'leave';
          return;
        }
        const inTunnel = gh.y === 9 && (gh.x < 4 || gh.x > COLS - 5);
        const speed =
          gh.mode === 'eaten' ? 12 : gh.mode === 'fright' ? gs * 0.55 : gh.mode === 'leave' ? gs * 0.6 : inTunnel ? gs * 0.55 : gs;
        if (same(gh.dir, NONE)) {
          gh.tx = gh.x;
          gh.ty = gh.y;
        }
        advance(gh, speed * dt, () => ghostTurn(s, gh, i));
      });

      // Touching a ghost
      for (const gh of s.ghosts) {
        if (gh.mode === 'house' || gh.mode === 'eaten') continue;
        if (Math.abs(gh.x - p.x) + Math.abs(gh.y - p.y) > 0.7) continue;
        if (gh.mode === 'fright') {
          gh.mode = 'eaten';
          gh.goingIn = false;
          const pts = 200 * 2 ** Math.min(s.eatChain, 3);
          s.eatChain += 1;
          s.score += pts;
          s.popups.push({ x: gh.x, y: gh.y, text: String(pts), t: 1 });
          chip.play('coin');
        } else {
          loseLife(s);
          return;
        }
      }

      if (s.dots.size + s.power.size === 0) {
        s.phase = 'clear';
        s.phaseTime = 0;
        chip.play('achievement');
        if (!s.won) {
          s.won = true;
          onWinRef.current();
        }
      }
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      const s = g.current;
      step(s, dt);
      setHud((old) =>
        old.score === s.score && old.lives === s.lives && old.level === s.level && old.phase === s.phase && old.paused === s.paused
          ? old
          : { score: s.score, lives: s.lives, level: s.level, phase: s.phase, paused: s.paused }
      );
      draw(s);
      if (s.phase !== 'over') raf = requestAnimationFrame(loop);
    };

    const draw = (s: Game) => {
      const cv = canvas.current;
      const ctx = cv?.getContext('2d');
      if (!cv || !ctx) return;
      const t = themeColors(cv);
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      ctx.fillStyle = t.bg;
      ctx.fillRect(0, 0, W, H);

      // Walls: outlined like neon tubes; they flash when a level is cleared.
      const flashing = s.phase === 'clear' && Math.floor(s.phaseTime * 4) % 2 === 1;
      ctx.strokeStyle = flashing ? t.fg : t.a2;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      const walk = (c: string) => c !== '#' && c !== '_';
      for (let y = 0; y < ROWS; y++)
        for (let x = 0; x < COLS; x++) {
          if (MAZE[y][x] !== '#') continue;
          const X = x * TILE;
          const Y = y * TILE;
          const i = 3;
          if (walk(cell(x, y - 1))) {
            ctx.moveTo(X, Y + i);
            ctx.lineTo(X + TILE, Y + i);
          }
          if (walk(cell(x, y + 1))) {
            ctx.moveTo(X, Y + TILE - i);
            ctx.lineTo(X + TILE, Y + TILE - i);
          }
          if (walk(cell(x - 1, y))) {
            ctx.moveTo(X + i, Y);
            ctx.lineTo(X + i, Y + TILE);
          }
          if (walk(cell(x + 1, y))) {
            ctx.moveTo(X + TILE - i, Y);
            ctx.lineTo(X + TILE - i, Y + TILE);
          }
        }
      ctx.stroke();
      // Door of the ghost house
      ctx.strokeStyle = t.a1;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(DOOR.x * TILE, DOOR.y * TILE + TILE / 2);
      ctx.lineTo(DOOR.x * TILE + TILE, DOOR.y * TILE + TILE / 2);
      ctx.stroke();

      // Dots and power pills
      ctx.fillStyle = t.fg;
      s.dots.forEach((k) => {
        const x = k % COLS;
        const y = Math.floor(k / COLS);
        ctx.fillRect(x * TILE + TILE / 2 - 1.5, y * TILE + TILE / 2 - 1.5, 3, 3);
      });
      if (s.phase !== 'play' || Math.floor(performance.now() / 250) % 2 === 0) {
        ctx.fillStyle = t.a3;
        s.power.forEach((k) => {
          const x = k % COLS;
          const y = Math.floor(k / COLS);
          ctx.beginPath();
          ctx.arc(x * TILE + TILE / 2, y * TILE + TILE / 2, 5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (s.fruit > 0) drawCherry(ctx, FRUIT.x * TILE + TILE / 2, FRUIT.y * TILE + TILE / 2);

      // Ghosts
      if (s.phase !== 'dying' || s.phaseTime < 0.5) {
        for (const gh of s.ghosts) {
          let body: string | null = gh.color;
          if (gh.mode === 'eaten') body = null;
          else if (gh.mode === 'fright') body = s.fright < 2 && Math.floor(s.fright * 5) % 2 === 0 ? '#f4f4ff' : '#3448ff';
          const bob = gh.mode === 'house' ? Math.sin(performance.now() / 180 + gh.x) * 2 : 0;
          drawGhost(ctx, gh.x * TILE + TILE / 2, gh.y * TILE + TILE / 2 + bob, body, gh.dir, gh.mode === 'fright');
        }
      }

      // Pac-Mampf
      const p = s.pac;
      const px = p.x * TILE + TILE / 2;
      const py = p.y * TILE + TILE / 2;
      const face = same(p.dir, NONE) ? p.want : p.dir;
      const angle = Math.atan2(face.y, face.x);
      let mouth = p.moving ? Math.abs(Math.sin(s.wakka * 14)) * 0.8 : 0.35;
      if (s.phase === 'dying') mouth = Math.min(Math.PI, 0.3 + Math.max(0, s.phaseTime - 0.4) * 2.6);
      if (s.phase === 'ready' && s.lives > 0) mouth = 0.5;
      if (mouth < Math.PI) {
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.arc(px, py, TILE / 2 + 1, angle + mouth / 2, angle + Math.PI * 2 - mouth / 2);
        ctx.closePath();
        ctx.fill();
      }

      // Points popping up
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = t.a2;
      for (const pop of s.popups) ctx.fillText(pop.text, pop.x * TILE + TILE / 2, pop.y * TILE + TILE / 2 - (1 - pop.t) * 6);

      // Messages below the house
      const msg =
        s.phase === 'ready'
          ? tr('READY?', 'BEREIT?')
          : s.paused
            ? 'PAUSE'
            : s.phase === 'clear'
              ? tr(`LEVEL ${s.level} CLEAR`, `LEVEL ${s.level} GESCHAFFT`)
              : '';
      if (msg) {
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = t.a3;
        ctx.fillText(msg, W / 2, FRUIT.y * TILE + TILE / 2);
      }
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [result]);

  useGameKeys((e, down) => {
    const k = e.key.toLowerCase();
    const map: Record<string, Dir> = {
      arrowup: UP,
      w: UP,
      arrowdown: DOWN,
      s: DOWN,
      arrowleft: LEFT,
      a: LEFT,
      arrowright: RIGHT,
      d: RIGHT,
    };
    if (map[k]) {
      if (down) steer(map[k]);
      return true;
    }
    if (k === ' ' || k === 'p') {
      if (down) start();
      return true;
    }
    if (k === 'enter' && g.current.phase === 'ready') {
      if (down) start();
      return true;
    }
    return false;
  });

  // Swipe: a short stroke on the maze sets the direction; a tap starts or pauses.
  const touch = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    touch.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    const t0 = touch.current;
    if (!t0 || t0.id !== e.pointerId) return;
    const dx = e.clientX - t0.x;
    const dy = e.clientY - t0.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? RIGHT : LEFT) : dy > 0 ? DOWN : UP);
    // Keep following the finger, so one long stroke can make several turns.
    touch.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: true };
  };
  const onUp = (e: React.PointerEvent) => {
    const t0 = touch.current;
    touch.current = null;
    if (t0 && t0.id === e.pointerId && !t0.moved) start();
  };

  const pad = (d: Dir) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      steer(d);
    },
  });

  const again = () => {
    chip.play('select');
    g.current = newGame();
    setHud({ score: 0, lives: LIVES, level: 1, phase: 'ready', paused: false });
    setResult(null);
  };

  const spare = Math.max(0, hud.lives - (hud.phase === 'over' ? 0 : 1));
  return (
    <>
      <p className="mini-score">
        {tr('Score', 'Punkte')}: {hud.score} · Level {hud.level} · {tr('Lives', 'Leben')}: {'●'.repeat(spare) || '–'}
      </p>
      <canvas
        ref={canvas}
        className="pacman-maze"
        width={W * SCALE}
        height={H * SCALE}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => (touch.current = null)}
        onContextMenu={(e) => e.preventDefault()}
        aria-label={tr('Maze: swipe to steer, tap to start or pause', 'Labyrinth: wischen zum Lenken, tippen zum Starten oder Pausieren')}
      />
      {!result && (
        <div className="game-pad pacman-pad">
          <button className="px-btn pad-up" {...pad(UP)} aria-label={tr('Up', 'Nach oben')}>
            ▲
          </button>
          <button className="px-btn pad-left" {...pad(LEFT)} aria-label={tr('Left', 'Nach links')}>
            ◄
          </button>
          <button className="px-btn pad-mid" onClick={start} data-nav>
            {hud.phase === 'ready' ? 'START' : hud.paused ? '▶' : 'II'}
          </button>
          <button className="px-btn pad-right" {...pad(RIGHT)} aria-label={tr('Right', 'Nach rechts')}>
            ►
          </button>
          <button className="px-btn pad-down" {...pad(DOWN)} aria-label={tr('Down', 'Nach unten')}>
            ▼
          </button>
        </div>
      )}
      {result && (
        <Done
          title={tr("GAME OVER", "SPIEL VORBEI")}
          text={tr(`${result.score} points, made it to level ${result.level}.`, `${result.score} Punkte, bis Level ${result.level} gekommen.`)}
          record={result.record}
          onAgain={again}
        />
      )}
    </>
  );
};

function drawGhost(ctx: CanvasRenderingContext2D, x: number, y: number, body: string | null, dir: Dir, scared: boolean) {
  const r = TILE / 2 + 0.5;
  if (body) {
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(x, y - 1, r, Math.PI, 0);
    ctx.lineTo(x + r, y + r);
    // Wavy hem that wiggles while the ghost moves.
    const shift = Math.floor(performance.now() / 140) % 2 ? 1.5 : 0;
    for (let i = 0; i < 4; i++) {
      ctx.lineTo(x + r - (i + 0.5) * (r / 2) - shift, y + r - 3);
      ctx.lineTo(x + r - (i + 1) * (r / 2), y + r);
    }
    ctx.closePath();
    ctx.fill();
  }
  if (scared && body) {
    // A worried little face instead of eyes.
    ctx.fillStyle = body === '#3448ff' ? '#ffd0a0' : '#ff3030';
    ctx.fillRect(x - 4, y - 3, 2, 2);
    ctx.fillRect(x + 2, y - 3, 2, 2);
    ctx.fillRect(x - 5, y + 3, 2, 1);
    ctx.fillRect(x - 2, y + 2, 2, 1);
    ctx.fillRect(x + 1, y + 3, 2, 1);
    ctx.fillRect(x + 4, y + 2, 2, 1);
    return;
  }
  for (const side of [-1, 1]) {
    const ex = x + side * 3.5;
    const ey = y - 2;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(ex, ey, 2.6, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1b2bd6';
    ctx.beginPath();
    ctx.arc(ex + dir.x * 1.3, ey + dir.y * 1.5, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCherry(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = '#3dff7a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 3, y + 1);
  ctx.quadraticCurveTo(x, y - 6, x + 4, y - 7);
  ctx.moveTo(x + 3, y + 2);
  ctx.quadraticCurveTo(x + 3, y - 3, x + 4, y - 7);
  ctx.stroke();
  ctx.fillStyle = '#ff3b3b';
  for (const [cx, cy] of [
    [x - 3, y + 3],
    [x + 3, y + 4],
  ]) {
    ctx.beginPath();
    ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

export const pacmanBest = (n: number) => tr(`High score: ${n} points`, `Rekord: ${n} Punkte`);
