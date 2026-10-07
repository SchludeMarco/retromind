// An 80s heavy metal intro for the moment you walk into the hall: a
// distorted power-chord guitar with a galloping palm-muted riff, a screaming
// lead on top and a full drum kit, about 25 seconds, ending on a big E chord.
// An original composition, nothing copyrighted is played.

import { noteFreq } from './chiptune';

const BPM = 160;
const STEP = 60 / BPM / 4; // 16th notes

// Rhythm guitar per 16th: 'm' = palm-muted low E, a note = open power chord
// on that root, '=' holds it, '-' rests.
// prettier-ignore
const GALLOP = ['m','-','m','m','m','-','m','m','m','-','m','m','m','-','m','m'];
// prettier-ignore
const RIFF: string[][] = [
  GALLOP,
  ['m','-','m','m','m','-','m','m','G2','=','=','-','A2','=','=','-'],
  GALLOP,
  ['C3','=','=','-','B2','=','=','-','A2','=','G2','=','A2','=','=','-'],
];
// Lead guitar over the second pass ('-' rests, '=' holds).
// prettier-ignore
const LEAD: string[][] = [
  ['E4','=','G4','=','A4','=','B4','=','D5','=','=','=','B4','=','A4','='],
  ['B4','=','=','=','=','=','=','-','G4','=','A4','=','B4','=','=','-'],
  ['E5','=','D5','=','B4','=','D5','=','E5','=','G5','=','E5','=','D5','='],
  ['E5','=','=','=','=','=','=','=','=','=','=','=','=','=','=','-'],
];
// Drums per 16th: k = kick, s = snare, h = hi-hat, c = crash.
const BEAT = 'k.hkskh.k.hkskhh';
const FILL = 'k.hksk.hssssssss';
const BARS = 16; // 8 bars riff, 8 bars riff with the lead; then the final chord

export class MetalPlayer {
  private out: GainNode;
  private guitarIn: GainNode;
  private timer: number | null = null;
  private next = 0;
  private step = 0;
  private sources: AudioScheduledSourceNode[] = [];
  private finished = false;

  constructor(
    private ctx: AudioContext,
    bus: AudioNode,
    private noise: AudioBuffer,
    private onEnd: () => void
  ) {
    this.out = ctx.createGain();
    this.out.gain.value = 0.55;
    this.out.connect(bus);
    // Amp: boost, hard clip, then a speaker-cabinet curve. Kept in the mids
    // so phone speakers still bite.
    this.guitarIn = ctx.createGain();
    this.guitarIn.gain.value = 6;
    const shaper = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh((i / 512 - 1) * 4);
    shaper.curve = curve;
    shaper.oversample = '4x';
    const lowCut = ctx.createBiquadFilter();
    lowCut.type = 'highpass';
    // Phone speakers play almost nothing below ~200 Hz: what sits there only
    // came across as a quiet bass rumble (Marco, 2026-10-07), so the guitar
    // lives above it.
    lowCut.frequency.value = 180;
    const lowCut2 = ctx.createBiquadFilter();
    lowCut2.type = 'highpass';
    lowCut2.frequency.value = 180;
    const cab = ctx.createBiquadFilter();
    cab.type = 'lowpass';
    cab.frequency.value = 3600;
    const crunch = ctx.createBiquadFilter();
    crunch.type = 'peaking';
    crunch.frequency.value = 900;
    crunch.gain.value = 5;
    const level = ctx.createGain();
    level.gain.value = 0.22;
    this.guitarIn.connect(shaper).connect(lowCut).connect(lowCut2).connect(crunch).connect(cab).connect(level).connect(this.out);
  }

  start() {
    this.next = this.ctx.currentTime + 0.1;
    this.timer = window.setInterval(() => this.schedule(), 50);
  }

  stop() {
    this.finished = true;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    const now = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(now);
    this.out.gain.setValueAtTime(this.out.gain.value, now);
    this.out.gain.linearRampToValueAtTime(0, now + 0.15);
    const sources = this.sources;
    this.sources = [];
    setTimeout(() => {
      sources.forEach((s) => {
        try {
          s.stop();
        } catch {
          /* already stopped */
        }
      });
      this.out.disconnect();
    }, 200);
  }

  private schedule() {
    while (this.next < this.ctx.currentTime + 0.2) {
      const bar = Math.floor(this.step / 16);
      const i = this.step % 16;
      const t = this.next;
      if (bar >= BARS) {
        this.ending(t);
        return;
      }
      const riff = RIFF[bar % 4];
      this.rhythm(riff, i, t);
      if (bar >= 8) this.lead(LEAD[bar % 4], i, t);
      const pattern = bar % 8 === 7 ? FILL : BEAT;
      const d = bar === 0 && i === 0 ? 'c' : i === 0 && bar % 4 === 0 ? 'c' : pattern[i];
      this.drum(d, t);
      if (d === 'c') this.drum('k', t);
      this.next += STEP;
      this.step++;
    }
  }

  /** Final E power chord with a crash, ringing out, then hand over. */
  private ending(t: number) {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.chord('E2', t, 2.4, false);
    this.drum('c', t);
    this.drum('k', t);
    setTimeout(() => {
      if (this.finished) return;
      this.finished = true;
      this.out.disconnect();
      this.onEnd();
    }, (t - this.ctx.currentTime + 2.6) * 1000);
  }

  private rhythm(pattern: string[], i: number, t: number) {
    const n = pattern[i];
    if (n === '-' || n === '=') return;
    if (n === 'm') return this.chord('E2', t, STEP * 0.9, true);
    let len = 1;
    while (pattern[i + len] === '=') len++;
    this.chord(n, t, STEP * len - 0.01, false);
  }

  /** A power chord (root, fifth, octave) through the amp. */
  private chord(root: string, t: number, dur: number, muted: boolean) {
    const f = noteFreq(root);
    const env = this.ctx.createGain();
    const tone = this.ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = muted ? 1300 : 5000;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(1, t + 0.004);
    env.gain.setTargetAtTime(muted ? 0.3 : 0.75, t + 0.02, muted ? 0.03 : 0.3);
    env.gain.setValueAtTime(muted ? 0.3 : 0.75, t + dur);
    env.gain.linearRampToValueAtTime(0, t + dur + 0.04);
    tone.connect(env).connect(this.guitarIn);
    for (const [mult, detune] of [[1, -6], [1.5, 5], [2, 3]]) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = f * mult;
      osc.detune.value = detune;
      osc.connect(tone);
      osc.start(t);
      osc.stop(t + dur + 0.06);
      this.track(osc);
    }
  }

  private lead(pattern: string[], i: number, t: number) {
    const n = pattern[i];
    if (n === '-' || n === '=') return;
    let len = 1;
    while (pattern[i + len] === '=') len++;
    const dur = STEP * len - 0.01;
    const f = noteFreq(n);
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    // Pick slide into the note, then wide vibrato on long ones.
    osc.frequency.setValueAtTime(f * 0.94, t);
    osc.frequency.exponentialRampToValueAtTime(f, t + 0.05);
    if (len >= 6) {
      const lfo = this.ctx.createOscillator();
      const depth = this.ctx.createGain();
      lfo.frequency.value = 6;
      depth.gain.setValueAtTime(0, t);
      depth.gain.linearRampToValueAtTime(f * 0.025, t + 0.4);
      lfo.connect(depth).connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + dur + 0.05);
      this.track(lfo);
    }
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.5, t + 0.01);
    env.gain.setValueAtTime(0.5, t + dur);
    env.gain.linearRampToValueAtTime(0, t + dur + 0.05);
    osc.connect(env).connect(this.guitarIn);
    osc.start(t);
    osc.stop(t + dur + 0.06);
    this.track(osc);
  }

  private drum(d: string, t: number) {
    const ctx = this.ctx;
    if (d === 'k') {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      // Punchy rather than deep, plus a beater click a phone can play; a deep
      // loud kick also made the limiter duck everything else.
      osc.frequency.setValueAtTime(210, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.08);
      env.gain.setValueAtTime(0.4, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(env).connect(this.out);
      osc.start(t);
      osc.stop(t + 0.22);
      this.track(osc);
      this.noiseHit(t, 'bandpass', 2500, 0.35, 0.025);
      return;
    }
    if (d === 's') {
      this.noiseHit(t, 'bandpass', 1800, 0.9, 0.16);
      const body = ctx.createOscillator();
      const env = ctx.createGain();
      body.type = 'triangle';
      body.frequency.value = 190;
      env.gain.setValueAtTime(0.5, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      body.connect(env).connect(this.out);
      body.start(t);
      body.stop(t + 0.12);
      this.track(body);
      return;
    }
    if (d === 'h') return this.noiseHit(t, 'highpass', 7000, 0.25, 0.04);
    if (d === 'c') this.noiseHit(t, 'highpass', 4500, 0.5, 1.6);
  }

  private noiseHit(t: number, type: BiquadFilterType, freq: number, gain: number, decay: number) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(gain, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + decay);
    src.connect(filter).connect(env).connect(this.out);
    src.start(t);
    src.stop(t + decay + 0.02);
    this.track(src);
  }

  private track(node: AudioScheduledSourceNode) {
    this.sources.push(node);
    node.onended = () => {
      const k = this.sources.indexOf(node);
      if (k >= 0) this.sources.splice(k, 1);
    };
  }
}
