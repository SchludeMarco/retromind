import { tr } from '../../lib/i18n';

// The browser emulator (EmulatorJS, served from our own domain, see
// scripts/emulator.mjs and public/emulator/play.html). Legal line
// (2026-10-17): the app hosts and links no commercial game files. It plays the
// freely licensed homebrew games below, and a game file the player picks on
// their own device, which never leaves it.

export interface EmuSystem {
  /** Platform ids from data/platforms.ts this system plays. */
  platforms: string[];
  /** EmulatorJS core. */
  core: string;
  /** File endings the file picker offers. */
  accept: string[];
}

/** Keep the cores in step with CORES in scripts/emulator.mjs. */
export const EMU_SYSTEMS: EmuSystem[] = [
  { platforms: ['NES'], core: 'fceumm', accept: ['.nes', '.fds', '.unf', '.unif'] },
  { platforms: ['SNES'], core: 'snes9x', accept: ['.sfc', '.smc', '.fig', '.swc'] },
  { platforms: ['Game Boy', 'Game Boy Color'], core: 'gambatte', accept: ['.gb', '.gbc', '.dmg'] },
  { platforms: ['Game Boy Advance'], core: 'mgba', accept: ['.gba'] },
  { platforms: ['Mega Drive', 'Master System', 'Game Gear'], core: 'genesis_plus_gx', accept: ['.md', '.gen', '.smd', '.bin', '.sms', '.gg'] },
  { platforms: ['Atari 2600'], core: 'stella2014', accept: ['.a26', '.bin'] },
  { platforms: ['PC Engine'], core: 'mednafen_pce', accept: ['.pce'] },
];

/** Packed game files are unpacked by the emulator itself. */
const ARCHIVES = ['.zip', '.7z'];

export const emuFor = (platform: string) => EMU_SYSTEMS.find((s) => s.platforms.includes(platform));

export const acceptFor = (s: EmuSystem) => [...s.accept, ...ARCHIVES].join(',');

export interface FreeGame {
  id: string;
  title: string;
  year: number;
  platform: string;
  core: string;
  /** File in public/emulator/roms. */
  rom: string;
  by: string;
  licence: string;
  source: string;
  text: string;
}

/** Homebrew games whose makers allow passing them on (details in public/emulator/roms/LICENSES.txt). */
export const FREE_GAMES: FreeGame[] = [
  {
    id: 'tobutobugirl',
    title: 'Tobu Tobu Girl',
    year: 2017,
    platform: 'Game Boy',
    core: 'gambatte',
    rom: 'tobutobugirl.gb',
    by: 'Tangram Games',
    licence: 'MIT / CC BY 4.0',
    source: 'https://github.com/SimonLarsen/tobutobugirl',
    text: tr(
      'Bounce higher and higher up into the sky. A new arcade platformer, made for the original Game Boy.',
      'Immer höher in den Himmel hüpfen. Ein neues Arcade-Hüpfspiel, gebaut für den echten Game Boy.'
    ),
  },
  {
    id: 'croom',
    title: 'Concentration Room',
    year: 2010,
    platform: 'NES',
    core: 'fceumm',
    rom: 'croom.nes',
    by: 'Damian Yerrick',
    licence: 'GPL 3.0',
    source: 'https://github.com/pinobatch/croom-nes',
    text: tr(
      'Memory on the NES: flip two cards, find the pairs, alone or against a friend or the computer.',
      'Memory auf dem NES: zwei Karten umdrehen, Pärchen finden, allein oder gegen Freund oder Computer.'
    ),
  },
];

/** What to play: one of the free games, or a file from the player's device. */
export type EmuLaunch = { title: string; core: string; rom: string } | { title: string; core: string; file: File };
