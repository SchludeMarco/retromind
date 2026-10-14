import { useSyncExternalStore } from 'react';

// After the landing, the Stube is furnished in the style of the decade you
// travelled to (Marco, 2026-10-14: "Die Stube wird nach der Landung im Stil
// deines Jahrzehnts eingerichtet (Tapete, Möbel, Radio)"). App.tsx sets the
// decade once the arrival is over; the room (components/CozyRoom) and the
// station corners (components/StationCorner) draw wallpaper, couch, cushions,
// curtains and the radio on the sill from the styles below
// (components/EraDecor). Before the landing the room keeps its own look.

export type WallKind = 'stripes' | 'flowers' | 'circles' | 'memphis' | 'sponge' | 'beige' | 'triangles' | 'leaves';
export type RadioKind = 'tube' | 'transistor' | 'boombox' | 'cdbox' | 'dock' | 'speaker' | 'smart';

export interface EraStyle {
  /** wallpaper: kind and four colours (ground, second ground, pattern, pattern) */
  wall: { kind: WallKind; colors: [string, string, string, string] };
  /** couch: top, bottom, arms, seat, seams */
  couch: [string, string, string, string, string];
  /** cushions: first, its button, second, its stripes */
  cushions: [string, string, string, string];
  /** curtains: cloth, folds */
  curtain: [string, string];
  radio: RadioKind;
}

export const ERA_STYLES: Record<string, EraStyle> = {
  '1950': {
    wall: { kind: 'stripes', colors: ['#f6e6e4', '#eed3d2', '#b9dccb', '#e7b4b0'] },
    couch: ['#7fbfae', '#5fa392', '#5fa392', '#6fb19f', '#4c8b7b'],
    cushions: ['#f2b4b8', '#d98a90', '#f6ecd2', '#e7b4b0'],
    curtain: ['#e7b4b0', '#c98e8a'],
    radio: 'tube',
  },
  '1960': {
    wall: { kind: 'flowers', colors: ['#f6ecd2', '#f1e4c4', '#e8a838', '#d95d39'] },
    couch: ['#9aa04a', '#7c8236', '#7c8236', '#8d933f', '#6d7230'],
    cushions: ['#e8a838', '#c98a20', '#f3e1c4', '#d95d39'],
    curtain: ['#e8a838', '#c98a20'],
    radio: 'tube',
  },
  '1970': {
    wall: { kind: 'circles', colors: ['#e9b45c', '#e3a94e', '#d4662c', '#7a4626'] },
    couch: ['#d9902c', '#b86f1c', '#b86f1c', '#c77f23', '#9a5a14'],
    cushions: ['#7a4626', '#5e3a22', '#f3e1c4', '#d4662c'],
    curtain: ['#d4662c', '#a8461a'],
    radio: 'transistor',
  },
  '1980': {
    wall: { kind: 'memphis', colors: ['#f4eef6', '#efe7f2', '#3cb8b0', '#ef6fa0'] },
    couch: ['#c98aa0', '#a86c84', '#a86c84', '#b97a92', '#8e5670'],
    cushions: ['#3cb8b0', '#2a8f88', '#f2c230', '#ef6fa0'],
    curtain: ['#3cb8b0', '#2a8f88'],
    radio: 'boombox',
  },
  '1990': {
    wall: { kind: 'sponge', colors: ['#e9c9a6', '#e4c09a', '#dcb38a', '#f0d6b8'] },
    couch: ['#4d6d93', '#3a5578', '#3a5578', '#45628a', '#2e4563'],
    cushions: ['#b23a3a', '#8e2c2c', '#f0e3c0', '#4b7b72'],
    curtain: ['#7a2f3a', '#5c2029'],
    radio: 'cdbox',
  },
  '2000': {
    wall: { kind: 'beige', colors: ['#e8dfd0', '#ddd2bf', '#8a6a50', '#d2c6b1'] },
    couch: ['#6e4a36', '#553626', '#553626', '#61402e', '#432a1c'],
    cushions: ['#e8dfd0', '#c8bca8', '#d95d39', '#8a6a50'],
    curtain: ['#d9cdb8', '#b8a98f'],
    radio: 'dock',
  },
  '2010': {
    wall: { kind: 'triangles', colors: ['#f3f3f0', '#eeeeea', '#cfd3d4', '#9fd3c7'] },
    couch: ['#9ca3a8', '#80878c', '#80878c', '#8f969b', '#6e7479'],
    cushions: ['#f2c230', '#d0a420', '#f3f3f0', '#4c5a63'],
    curtain: ['#e6e6e2', '#c4c6c2'],
    radio: 'speaker',
  },
  '2020': {
    wall: { kind: 'leaves', colors: ['#b9c4a6', '#b3be9f', '#a3b08f', '#c7d1b5'] },
    couch: ['#3f8584', '#2f6a69', '#2f6a69', '#387877', '#255756'],
    cushions: ['#e2a07a', '#c5835e', '#f3ede2', '#3f8584'],
    curtain: ['#e9dcc6', '#c9b9a0'],
    radio: 'smart',
  },
};

/** The style for a decade ("1984" and "1980" both give the 80s), or null. */
export function eraStyle(decade: string | null | undefined): EraStyle | null {
  if (!decade) return null;
  const d = Math.floor(Number(decade) / 10) * 10;
  if (!Number.isFinite(d)) return null;
  return ERA_STYLES[String(Math.min(2020, Math.max(1950, d)))] ?? null;
}

/** "80" for the 80s, "2000" for the 2000s: for "the 80s" / "den 80ern". */
export function eraShort(decade: string): string {
  const d = Math.min(2020, Math.max(1950, Math.floor(Number(decade) / 10) * 10));
  return String(d >= 2000 ? d : d % 100);
}

// --- Which decade the room is furnished in --------------------------------

let era: string | null = null;
// When it last changed: a room that sees a fresh change plays the moving-in.
let changedAt = 0;
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export function setRoomEra(next: string | null) {
  if (next === era) return;
  era = next;
  changedAt = next ? Date.now() : 0;
  listeners.forEach((l) => l());
}

export function useRoomEra(): string | null {
  return useSyncExternalStore(subscribe, () => era);
}

/** Whether the room was just furnished (within the last few seconds). */
export function justFurnished(): boolean {
  return changedAt > 0 && Date.now() - changedAt < 4000;
}
