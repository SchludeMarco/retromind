// The hub's background tunes, picked in the settings. All are original
// compositions played live by the sound chip (chiptune.ts); nothing is
// sampled or copyrighted. Step patterns are 8th notes, 8 bars of 8 steps:
// a note name starts a note, '=' holds it, '-' is a rest.

import { tr } from '../../lib/i18n';

export type TrackId = 'quest' | 'c64' | 'turbo' | 'dungeon' | 'beach' | 'space' | 'boss';

export interface StepTrack {
  bpm: number;
  lead: string[];
  bass: string[];
  /** One chord per bar, played as a fast arpeggio. */
  chords: string[][];
  leadWave: OscillatorType;
  leadGain: number;
  bassWave: OscillatorType;
  bassGain: number;
  /** Which 8th steps get a hi-hat: every one, the off-beats, or only the last of each bar. */
  hats: 'all' | 'offbeat' | 'sparse';
}

export interface Track {
  id: TrackId;
  label: string;
  text: string;
  /** Step data, or null for the C64 player (sid.ts). */
  steps: StepTrack | null;
}

export const DEFAULT_TRACK: TrackId = 'quest';

// prettier-ignore
const QUEST: StepTrack = {
  bpm: 132,
  lead: [
    'A4','-','C5','E5','-','D5','C5','-',  'B4','-','G4','-','B4','C5','D5','-',
    'C5','-','E5','A5','-','G5','E5','-',  'F5','E5','D5','-','E5','-','-','-',
    'A4','-','C5','E5','-','D5','C5','-',  'B4','-','G4','-','B4','D5','G5','-',
    'F5','-','E5','D5','-','C5','B4','-',  'C5','B4','A4','-','A4','-','-','-',
  ],
  bass: [
    'A2','A2','A3','A2','A2','A2','A3','A2',  'G2','G2','G3','G2','G2','G2','G3','G2',
    'F2','F2','F3','F2','F2','F2','F3','F2',  'E2','E2','E3','E2','E2','E2','E3','E2',
    'A2','A2','A3','A2','A2','A2','A3','A2',  'G2','G2','G3','G2','G2','G2','G3','G2',
    'D2','D2','D3','D2','F2','F2','F3','F2',  'E2','E2','E3','E2','A2','A2','A3','A2',
  ],
  chords: [
    ['A4','C5','E5'], ['G4','B4','D5'], ['F4','A4','C5'], ['E4','G#4','B4'],
    ['A4','C5','E5'], ['G4','B4','D5'], ['D4','F4','A4'], ['E4','G#4','B4'],
  ],
  leadWave: 'square', leadGain: 0.07,
  bassWave: 'triangle', bassGain: 0.2,
  hats: 'offbeat',
};

/** Root, octave, root, octave … : the driving bass of racing games. */
const pump = (root: string, up: string) => [root, up, root, up, root, up, root, up];

// prettier-ignore
const TURBO: StepTrack = {
  bpm: 168,
  lead: [
    'E5','-','B4','E5','G5','-','F#5','E5',  'G5','-','E5','C5','E5','G5','C6','-',
    'A5','-','F#5','D5','A5','-','F#5','A5', 'B5','-','A5','G5','F#5','-','D#5','-',
    'E5','E5','G5','B5','-','A5','G5','E5',  'C6','-','B5','A5','G5','-','E5','G5',
    'A5','-','C6','A5','E5','-','A5','C6',   'B5','-','D#6','-','F#6','-','B5','-',
  ],
  bass: [
    ...pump('E2','E3'), ...pump('C2','C3'), ...pump('D2','D3'), ...pump('B1','B2'),
    ...pump('E2','E3'), ...pump('C2','C3'), ...pump('A1','A2'), ...pump('B1','B2'),
  ],
  chords: [
    ['E4','G4','B4'], ['C4','E4','G4'], ['D4','F#4','A4'], ['B3','D#4','F#4'],
    ['E4','G4','B4'], ['C4','E4','G4'], ['A3','C4','E4'], ['B3','D#4','F#4'],
  ],
  leadWave: 'sawtooth', leadGain: 0.045,
  bassWave: 'triangle', bassGain: 0.22,
  hats: 'all',
};

/** A root held for half a bar, twice: slow and heavy. */
const halves = (a: string, b: string) => [a, '=', '=', '=', b, '=', '=', '='];

// prettier-ignore
const DUNGEON: StepTrack = {
  bpm: 92,
  lead: [
    'D5','=','=','F5','A5','=','=','-',  'A#4','=','=','D5','F5','=','=','-',
    'E5','=','G5','=','C5','=','=','-',  'C#5','=','=','=','E5','=','A4','-',
    'D5','=','F5','=','A5','=','D6','=', 'A#5','=','A5','=','G5','=','D5','-',
    'E5','=','=','C#5','E5','=','G5','=', 'F5','=','E5','=','D5','=','=','-',
  ],
  bass: [
    ...halves('D2','A1'), ...halves('A#1','F2'), ...halves('C2','G1'), ...halves('A1','E2'),
    ...halves('D2','A1'), ...halves('G1','D2'), ...halves('A1','C#2'), ...halves('D2','D2'),
  ],
  chords: [
    ['D4','F4','A4'], ['A#3','D4','F4'], ['C4','E4','G4'], ['A3','C#4','E4'],
    ['D4','F4','A4'], ['G3','A#3','D4'], ['A3','C#4','E4'], ['D4','F4','A4'],
  ],
  leadWave: 'triangle', leadGain: 0.2,
  bassWave: 'triangle', bassGain: 0.24,
  hats: 'sparse',
};

/** Root and fifth bouncing, the sunny 16-bit platformer bass. */
const bounce = (root: string, fifth: string) => [root, '-', fifth, '-', root, root, fifth, '-'];

// prettier-ignore
const BEACH: StepTrack = {
  bpm: 116,
  lead: [
    'E5','-','G5','-','C6','-','G5','E5',  'A5','-','G5','E5','C5','-','E5','-',
    'F5','-','A5','-','C6','-','A5','F5',  'G5','=','=','-','D5','E5','F5','G5',
    'E5','G5','C6','-','B5','-','G5','-',  'B5','-','G5','E5','B4','-','E5','G5',
    'A5','-','F5','A5','C6','-','D6','C6', 'B5','=','D6','=','C6','=','=','-',
  ],
  bass: [
    ...bounce('C3','G2'), ...bounce('A2','E2'), ...bounce('F2','C3'), ...bounce('G2','D3'),
    ...bounce('C3','G2'), ...bounce('E2','B2'), ...bounce('F2','C3'), ...bounce('G2','D3'),
  ],
  chords: [
    ['C5','E5','G5'], ['A4','C5','E5'], ['F4','A4','C5'], ['G4','B4','D5'],
    ['C5','E5','G5'], ['E4','G4','B4'], ['F4','A4','C5'], ['G4','B4','D5'],
  ],
  leadWave: 'square', leadGain: 0.07,
  bassWave: 'triangle', bassGain: 0.2,
  hats: 'offbeat',
};

/** Octave-jumping 8ths, the pulse of a space shooter. */
const jump = (root: string, up: string) => [root, root, up, root, root, up, root, up];

// prettier-ignore
const SPACE: StepTrack = {
  bpm: 150,
  lead: [
    'D5','-','A5','-','F5','-','E5','D5',  'C5','-','D5','-','E5','=','=','-',
    'A#4','-','F5','-','D5','-','C5','A#4', 'A4','-','C#5','-','E5','=','=','-',
    'D5','F5','A5','-','D6','-','C6','A5',  'G5','-','A5','-','A#5','=','A5','-',
    'F5','-','G5','-','A5','-','E5','-',    'D5','=','=','-','-','-','A4','-',
  ],
  bass: [
    ...jump('D2','D3'), ...jump('C2','C3'), ...jump('A#1','A#2'), ...jump('A1','A2'),
    ...jump('D2','D3'), ...jump('G1','G2'), ...jump('A1','A2'), ...jump('D2','D3'),
  ],
  chords: [
    ['D4','F4','A4'], ['C4','E4','G4'], ['A#3','D4','F4'], ['A3','C#4','E4'],
    ['D4','F4','A4'], ['G3','A#3','D4'], ['A3','C#4','E4'], ['D4','F4','A4'],
  ],
  leadWave: 'square', leadGain: 0.065,
  bassWave: 'triangle', bassGain: 0.22,
  hats: 'all',
};

/** Hammering root with a chromatic push into the next bar. */
const hammer = (root: string, push: string) => [root, root, root, root, root, root, push, push];

// prettier-ignore
const BOSS: StepTrack = {
  bpm: 176,
  lead: [
    'C5','-','D#5','-','G5','-','F#5','G5',  'G#5','-','G5','-','F5','-','D#5','D5',
    'C5','-','D#5','-','G5','-','C6','B5',   'C6','=','=','-','G5','=','=','-',
    'G#5','-','G5','F5','D#5','-','D5','C5', 'D5','-','D#5','F5','G5','-','B4','-',
    'C5','D#5','G5','C6','G5','D#5','C5','B4', 'C5','=','=','-','B4','=','D5','-',
  ],
  bass: [
    ...hammer('C2','C#2'), ...hammer('D2','D#2'), ...hammer('C2','C#2'), ...hammer('D#2','D2'),
    ...hammer('G#1','A1'), ...hammer('G1','G#1'), ...hammer('C2','B1'), ...hammer('G1','B1'),
  ],
  chords: [
    ['C4','D#4','G4'], ['G#3','C4','D#4'], ['C4','D#4','G4'], ['C4','D#4','G4'],
    ['G#3','C4','D#4'], ['G3','B3','D4'], ['C4','D#4','G4'], ['G3','B3','D4'],
  ],
  leadWave: 'sawtooth', leadGain: 0.045,
  bassWave: 'square', bassGain: 0.09,
  hats: 'all',
};

export const TRACKS: Track[] = [
  { id: 'quest', label: tr('ADVENTURE', 'ABENTEUER'), text: tr('The classic hub melody in A minor.', 'Die klassische Hub-Melodie in a-Moll.'), steps: QUEST },
  { id: 'c64', label: 'C64', text: tr('The theme song in the style of the Commodore 64 sound chip.', 'Der Titelsong im Stil des Commodore-64-Soundchips.'), steps: null },
  { id: 'turbo', label: 'TURBO', text: tr('Fast and driving like a racing game.', 'Schnell und treibend wie ein Rennspiel.'), steps: TURBO },
  { id: 'dungeon', label: tr('DUNGEON', 'VERLIES'), text: tr('Slow and gloomy, for RPG nights.', 'Langsam und düster, für Rollenspiel-Abende.'), steps: DUNGEON },
  { id: 'beach', label: tr('BEACH', 'STRAND'), text: tr('Sunny and upbeat like a platformer.', 'Sonnig und gut gelaunt wie ein Jump ’n’ Run.'), steps: BEACH },
  // From the prize counter (quests.ts); only listed once bought.
  { id: 'space', label: tr('OUTER SPACE', 'WELTRAUM'), text: tr('Like a shoot ’em up in space.', 'Wie ein Shoot ’em up im All.'), steps: SPACE },
  { id: 'boss', label: tr('BOSS FIGHT', 'BOSSKAMPF'), text: tr('Frantic and dramatic, for the final boss.', 'Hektisch und dramatisch, für den Endgegner.'), steps: BOSS },
];

export const isTrackId = (v: unknown): v is TrackId => TRACKS.some((t) => t.id === v);

export const trackById = (id: TrackId) => TRACKS.find((t) => t.id === id) ?? TRACKS[0];
