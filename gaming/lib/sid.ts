// A small Commodore 64 "SID" style player for the title screen: three voices
// like the real chip plus noise drums, with the sounds that make the C64
// recognisable: a pulse lead whose width slowly sweeps (PWM) with vibrato, a
// squelchy resonant sawtooth bass and super-fast arpeggios that fake chords.
// The tune is an original composition, nothing copyrighted is played.

import { noteFreq } from './chiptune';

const BPM = 128;
const STEP = 60 / BPM / 4; // 16th notes
const ARP = STEP / 3; // arpeggio speed, close to the C64's 50 Hz frame tricks

// One chord per bar: Am F C G Am F G E.
// prettier-ignore
const CHORDS: [string, string, string][] = [
  ['A4', 'C5', 'E5'], ['F4', 'A4', 'C5'], ['C4', 'E4', 'G4'], ['G4', 'B4', 'D5'],
  ['A4', 'C5', 'E5'], ['F4', 'A4', 'C5'], ['G4', 'B4', 'D5'], ['E4', 'G#4', 'B4'],
];
const BASS_ROOTS = ['A2', 'F2', 'C2', 'G2', 'A2', 'F2', 'G2', 'E2'];
// Semitones above the root per 16th: the octave-pumping C64 bass.
const BASS_STEPS = [0, 0, 12, 0, 0, 12, 0, 12, 0, 0, 12, 0, 0, 12, 7, 12];

// Lead: a note name starts a note, '=' holds it, '-' releases it.
// prettier-ignore
const LEAD = [
  'A4','=','C5','=','E5','=','=','=', 'D5','=','C5','=','D5','=','E5','=',
  'F5','=','=','=','E5','=','C5','=', 'A4','=','=','=','C5','=','D5','=',
  'E5','=','=','=','G5','=','=','=', 'E5','=','D5','=','C5','=','D5','=',
  'D5','=','=','=','=','=','=','=', 'B4','=','C5','=','D5','=','G5','=',
  'A5','=','=','=','G5','=','E5','=', '=','=','A5','=','C6','=','B5','=',
  'A5','=','=','=','F5','=','=','=', 'C5','=','F5','=','A5','=','G5','=',
  'G5','=','=','=','D5','=','G5','=', 'B5','=','=','=','A5','=','G5','=',
  'G#5','=','=','=','=','=','=','=', 'E5','=','F5','=','G#5','=','B5','-',
];
// Drums per 16th: k = kick, s = snare, h = hi-hat.
const DRUMS = 'k.h.s.h.k.hks.hh';

export class SidPlayer {
  private out: GainNode;
  private nodes: AudioNode[] = [];
  private oscs: OscillatorNode[] = [];
  private timer: number | null = null;
  private next = 0;
  private step = 0;

  // Lead voice (pulse with PWM + vibrato).
  private leadSaw!: OscillatorNode;
  private leadDelay!: DelayNode;
  private pwmDepth!: GainNode;
  private leadEnv!: GainNode;
  // Bass voice (sawtooth through a resonant low-pass).
  private bass!: OscillatorNode;
  private bassFilter!: BiquadFilterNode;
  private bassEnv!: GainNode;
  // Arpeggio voice.
  private arp!: OscillatorNode;
  private arpEnv!: GainNode;

  constructor(
    private ctx: AudioContext,
    destination: AudioNode,
    private noise: AudioBuffer
  ) {
    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.out.connect(destination);
    this.buildLead();
    this.buildBass();
    this.buildArp();
  }

  private osc(type: OscillatorType) {
    const o = this.ctx.createOscillator();
    o.type = type;
    this.oscs.push(o);
    return o;
  }

  private gain(value: number) {
    const g = this.ctx.createGain();
    g.gain.value = value;
    this.nodes.push(g);
    return g;
  }

  /** Pulse = sawtooth minus a delayed copy of itself; the delay sets the pulse width. */
  private buildLead() {
    const ctx = this.ctx;
    this.leadSaw = this.osc('sawtooth');
    this.leadDelay = ctx.createDelay(0.05);
    const invert = this.gain(-1);
    const sum = this.gain(1);
    this.leadSaw.connect(sum);
    this.leadSaw.connect(this.leadDelay).connect(invert).connect(sum);
    // Slow pulse-width sweep, the signature C64 lead sound.
    const pwm = this.osc('triangle');
    pwm.frequency.value = 0.6;
    this.pwmDepth = this.gain(0);
    pwm.connect(this.pwmDepth).connect(this.leadDelay.delayTime);
    // Vibrato.
    const vib = this.osc('sine');
    vib.frequency.value = 5.5;
    const vibDepth = this.gain(18);
    vib.connect(vibDepth).connect(this.leadSaw.detune);
    // The saw difference carries a little DC; keep it out of the speakers.
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 60;
    this.leadEnv = this.gain(0);
    sum.connect(hp).connect(this.leadEnv).connect(this.out);
    this.nodes.push(this.leadDelay, hp);
  }

  private buildBass() {
    this.bass = this.osc('sawtooth');
    this.bassFilter = this.ctx.createBiquadFilter();
    this.bassFilter.type = 'lowpass';
    this.bassFilter.Q.value = 9;
    this.bassEnv = this.gain(0);
    this.bass.connect(this.bassFilter).connect(this.bassEnv).connect(this.out);
    this.nodes.push(this.bassFilter);
  }

  private buildArp() {
    this.arp = this.osc('square');
    this.arpEnv = this.gain(0);
    this.arp.connect(this.arpEnv).connect(this.out);
  }

  start() {
    const t = this.ctx.currentTime + 0.1;
    this.oscs.forEach((o) => o.start(t));
    this.out.gain.setValueAtTime(0, t);
    this.out.gain.linearRampToValueAtTime(1, t + 0.4);
    this.next = t;
    this.step = 0;
    this.timer = window.setInterval(() => this.schedule(), 50);
    this.schedule();
  }

  stop(fade = 0.3) {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    const now = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(now);
    this.out.gain.setValueAtTime(this.out.gain.value, now);
    this.out.gain.linearRampToValueAtTime(0, now + fade);
    this.oscs.forEach((o) => {
      try {
        o.stop(now + fade + 0.05);
      } catch {
        /* never started */
      }
    });
    setTimeout(() => this.out.disconnect(), (fade + 0.2) * 1000);
  }

  private schedule() {
    while (this.next < this.ctx.currentTime + 0.2) {
      this.playStep(this.step, this.next);
      this.next += STEP;
      this.step = (this.step + 1) % LEAD.length;
    }
  }

  private playStep(i: number, t: number) {
    const bar = Math.floor(i / 16);
    const s = i % 16;

    // Lead.
    const token = LEAD[i];
    if (token === '-') {
      this.leadEnv.gain.setTargetAtTime(0, t, 0.03);
    } else if (token !== '=') {
      const f = noteFreq(token);
      this.leadSaw.frequency.setValueAtTime(f, t);
      // Pulse width 50 % ± 35 %, scaled to this note's period.
      this.leadDelay.delayTime.setValueAtTime(0.5 / f, t);
      this.pwmDepth.gain.setValueAtTime(0.35 / f, t);
      const g = this.leadEnv.gain;
      g.setValueAtTime(0, t);
      g.linearRampToValueAtTime(0.11, t + 0.006);
      g.setTargetAtTime(0.07, t + 0.006, 0.12);
    }

    // Bass with a squelchy filter sweep on every note.
    const bf = noteFreq(BASS_ROOTS[bar]) * Math.pow(2, BASS_STEPS[s] / 12);
    this.bass.frequency.setValueAtTime(bf, t);
    this.bassFilter.frequency.setValueAtTime(2600, t);
    this.bassFilter.frequency.exponentialRampToValueAtTime(260, t + STEP * 0.9);
    this.bassEnv.gain.setValueAtTime(0.16, t);
    this.bassEnv.gain.setTargetAtTime(0.02, t + 0.02, STEP * 0.4);

    // Arpeggio: the bar's chord, one note every ARP seconds.
    const chord = CHORDS[bar];
    for (let k = 0; k < 3; k++) {
      this.arp.frequency.setValueAtTime(noteFreq(chord[(s * 3 + k) % 3]), t + k * ARP);
    }
    this.arpEnv.gain.setValueAtTime(s % 4 === 0 ? 0.045 : 0.03, t);

    // Drums from noise, as on the C64's third voice.
    const d = DRUMS[s];
    if (d === 'k') this.kick(t);
    else if (d === 's') this.snare(t);
    else if (d === 'h') this.hat(t);
  }

  private burst(t: number, type: BiquadFilterType, freq: number, level: number, len: number) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(level, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + len);
    src.connect(f).connect(env).connect(this.out);
    src.start(t, Math.random() * 0.1);
    src.stop(t + len + 0.01);
  }

  private kick(t: number) {
    const o = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    env.gain.setValueAtTime(0.5, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(env).connect(this.out);
    o.start(t);
    o.stop(t + 0.16);
    this.burst(t, 'lowpass', 900, 0.15, 0.02);
  }

  private snare(t: number) {
    this.burst(t, 'bandpass', 1800, 0.35, 0.14);
    const o = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(240, t);
    o.frequency.exponentialRampToValueAtTime(140, t + 0.06);
    env.gain.setValueAtTime(0.2, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    o.connect(env).connect(this.out);
    o.start(t);
    o.stop(t + 0.08);
  }

  private hat(t: number) {
    this.burst(t, 'highpass', 7000, 0.08, 0.03);
  }
}
