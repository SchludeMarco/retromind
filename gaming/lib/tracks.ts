// The hub's background tunes, picked in the settings. All are original
// compositions played live by the sound chip (chiptune.ts); nothing is
// sampled or copyrighted. Step patterns are 8th notes, 8 bars of 8 steps:
// a note name starts a note, '=' holds it, '-' is a rest.

export type TrackId = 'quest' | 'c64' | 'turbo' | 'dungeon' | 'beach';

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

export const TRACKS: Track[] = [
  { id: 'quest', label: 'ABENTEUER', text: 'Die klassische Hub-Melodie in a-Moll.', steps: QUEST },
  { id: 'c64', label: 'C64', text: 'Der Titelsong im Stil des Commodore-64-Soundchips.', steps: null },
  { id: 'turbo', label: 'TURBO', text: 'Schnell und treibend wie ein Rennspiel.', steps: TURBO },
  { id: 'dungeon', label: 'VERLIES', text: 'Langsam und düster, für Rollenspiel-Abende.', steps: DUNGEON },
  { id: 'beach', label: 'STRAND', text: 'Sonnig und gut gelaunt wie ein Jump ’n’ Run.', steps: BEACH },
];

export const isTrackId = (v: unknown): v is TrackId => TRACKS.some((t) => t.id === v);

export const trackById = (id: TrackId) => TRACKS.find((t) => t.id === id) ?? TRACKS[0];
