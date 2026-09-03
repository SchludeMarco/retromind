// A calm, generative ambient melody — synthesized client-side with the Web
// Audio API instead of streamed from a third-party host. This removes any
// dependency on an external server actually being up/reachable, and lets us
// give each decade its own gentle key so a "time travel" is audible.

export interface AmbientVoice {
  /** Fades the melody out and stops it. Safe to call once. */
  stop: (fadeSeconds?: number) => void;
}

// Each decade gets a different root note (still calm, never upbeat) so
// switching eras is audible without ever feeling busy.
const DECADE_ROOTS: Record<string, number> = {
  '1960': 220.0, // A3
  '1970': 196.0, // G3
  '1980': 174.61, // F3
  '1990': 196.0, // G3
  '2000': 220.0, // A3
  '2010': 246.94, // B3
};
const DEFAULT_ROOT = DECADE_ROOTS['1980'];

// Major pentatonic intervals (semitones above the root). Every pair of notes
// drawn from this set is consonant, so the melody can wander freely and
// still always sound calm and "in key".
const PENTATONIC_SEMITONES = [0, 2, 4, 7, 9, 12];

function scaleFor(root: number): number[] {
  return PENTATONIC_SEMITONES.map((semitones) => root * 2 ** (semitones / 12));
}

// A short, hand-written lullaby-like phrase — degree indexes into the scale
// above, note length and the silence after it, both in seconds. It loops
// forever, rising gently and always settling back on the root.
const MELODY_PHRASE: { degree: number; length: number; gap: number }[] = [
  { degree: 0, length: 1.4, gap: 0.5 },
  { degree: 2, length: 1.0, gap: 0.3 },
  { degree: 3, length: 1.6, gap: 0.6 },
  { degree: 2, length: 1.0, gap: 0.3 },
  { degree: 4, length: 1.8, gap: 0.7 },
  { degree: 3, length: 1.2, gap: 0.4 },
  { degree: 1, length: 1.6, gap: 0.5 },
  { degree: 0, length: 2.4, gap: 1.6 },
];

// Fades a currently-playing melody out and starts a new one for `decade`,
// crossfading between them so a decade change never clicks or jumps.
export function startAmbientPad(ctx: AudioContext, output: AudioNode, decade: string): AmbientVoice {
  const root = DECADE_ROOTS[decade] ?? DEFAULT_ROOT;
  const scale = scaleFor(root);
  const now = ctx.currentTime;

  const voiceGain = ctx.createGain();
  voiceGain.gain.setValueAtTime(0, now);
  voiceGain.gain.linearRampToValueAtTime(1, now + 2); // slow fade-in
  voiceGain.connect(output);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1400;
  filter.Q.value = 0.4;
  filter.connect(voiceGain);

  // A very quiet, sustained root note underneath gives the melody a bed to
  // rest on without ever becoming a single droning tone itself.
  const padOsc = ctx.createOscillator();
  padOsc.type = 'sine';
  padOsc.frequency.value = root / 2;
  const padGain = ctx.createGain();
  padGain.gain.value = 0.05;
  padOsc.connect(padGain);
  padGain.connect(filter);
  padOsc.start(now);

  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const playNote = (freq: number, length: number) => {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0, t);
    noteGain.gain.linearRampToValueAtTime(0.22, t + Math.min(0.4, length * 0.3));
    noteGain.gain.linearRampToValueAtTime(0, t + length);
    osc.connect(noteGain);
    noteGain.connect(filter);
    osc.start(t);
    osc.stop(t + length + 0.05);
  };

  let step = 0;
  const scheduleNext = () => {
    if (stopped) return;
    const note = MELODY_PHRASE[step % MELODY_PHRASE.length];
    playNote(scale[note.degree], note.length);
    step += 1;
    timer = setTimeout(scheduleNext, (note.length + note.gap) * 1000);
  };
  scheduleNext();

  return {
    stop(fadeSeconds = 1.5) {
      if (stopped) return;
      stopped = true;
      if (timer) clearTimeout(timer);
      const t = ctx.currentTime;
      voiceGain.gain.cancelScheduledValues(t);
      voiceGain.gain.setValueAtTime(voiceGain.gain.value, t);
      voiceGain.gain.linearRampToValueAtTime(0, t + fadeSeconds);
      padOsc.stop(t + fadeSeconds + 0.1);
    },
  };
}
