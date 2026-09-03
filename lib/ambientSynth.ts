// A calm, generative ambient pad — synthesized client-side with the Web
// Audio API instead of streamed from a third-party host. This removes any
// dependency on an external server actually being up/reachable, and lets us
// give each decade its own gentle chord so a "time travel" is audible.

export interface AmbientVoice {
  /** Fades the pad out and stops its oscillators. Safe to call once. */
  stop: (fadeSeconds?: number) => void;
}

// Each decade gets a different, still-calm chord (root + third + fifth, in Hz)
// so switching eras is audible without ever feeling upbeat or busy.
const DECADE_CHORDS: Record<string, [number, number, number]> = {
  '1960': [220.0, 277.18, 329.63], // A3 major
  '1970': [196.0, 246.94, 293.66], // G3 major
  '1980': [174.61, 220.0, 261.63], // F3 major
  '1990': [196.0, 233.08, 293.66], // G3 minor — slightly wistful
  '2000': [220.0, 261.63, 329.63], // A3 major
  '2010': [246.94, 293.66, 369.99], // B3 major
};
const DEFAULT_CHORD = DECADE_CHORDS['1980'];

// Fades a currently-playing pad out and starts a new one for `decade`,
// crossfading between them so a decade change never clicks or jumps.
export function startAmbientPad(ctx: AudioContext, output: AudioNode, decade: string): AmbientVoice {
  const [root, third, fifth] = DECADE_CHORDS[decade] ?? DEFAULT_CHORD;
  const now = ctx.currentTime;

  const padGain = ctx.createGain();
  padGain.gain.setValueAtTime(0, now);
  padGain.gain.linearRampToValueAtTime(1, now + 2.5); // slow fade-in
  padGain.connect(output);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  filter.Q.value = 0.3;
  filter.connect(padGain);

  // A slow "breathing" swell on the whole pad — the calm, meditative feel.
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06; // ~16s cycle
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.12;
  lfo.connect(lfoGain);
  lfoGain.connect(padGain.gain);
  lfo.start(now);

  const oscillators: OscillatorNode[] = [lfo];
  const addVoice = (freq: number, type: OscillatorType, level: number, detune = 0) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    const voiceGain = ctx.createGain();
    voiceGain.gain.value = level;
    osc.connect(voiceGain);
    voiceGain.connect(filter);
    osc.start(now);
    oscillators.push(osc);
  };

  // Three chord tones (gently detuned against each other for warmth) plus a
  // soft sub-octave layer underneath.
  addVoice(root, 'sine', 0.16, -3);
  addVoice(third, 'triangle', 0.12, 0);
  addVoice(fifth, 'triangle', 0.12, 3);
  addVoice(root / 2, 'sine', 0.1);

  let stopped = false;
  return {
    stop(fadeSeconds = 1.5) {
      if (stopped) return;
      stopped = true;
      const t = ctx.currentTime;
      padGain.gain.cancelScheduledValues(t);
      padGain.gain.setValueAtTime(padGain.gain.value, t);
      padGain.gain.linearRampToValueAtTime(0, t + fadeSeconds);
      oscillators.forEach((o) => o.stop(t + fadeSeconds + 0.1));
    },
  };
}
