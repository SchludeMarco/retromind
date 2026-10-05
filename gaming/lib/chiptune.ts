// A tiny 8-bit sound chip on top of Web Audio: square/triangle/noise voices
// for UI blips and the hub's selectable tunes (tracks.ts, plus the C64-style
// one in sid.ts).
// Everything is synthesized, including the quiet piece at the entrance door.

import { MetalPlayer } from './metal';
import { SidPlayer } from './sid';
import { DEFAULT_TRACK, StepTrack, TrackId, trackById } from './tracks';

export type SfxName = 'blip' | 'select' | 'back' | 'coin' | 'powerup' | 'error' | 'start' | 'achievement';

type Wave = OscillatorType;

const NOTE_INDEX: Record<string, number> = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

/** "A4" → 440 Hz. A "-" (rest) yields 0. */
export function noteFreq(note: string): number {
  if (!note || note === '-') return 0;
  const m = /^([A-G]#?)(\d)$/.exec(note);
  if (!m) return 0;
  const semitone = NOTE_INDEX[m[1]] + (Number(m[2]) + 1) * 12;
  return 440 * Math.pow(2, (semitone - 69) / 12);
}

// Music bus level; at 0.32 phones barely played the tunes audibly.
const MUSIC_LEVEL = 1.4;

// The quiet piece at the door: Am9, Fmaj7, Cmaj7, G6, eight seconds each.
const AMBIENT_LEVEL = 0.5;
const AMBIENT_BAR = 8;
const AMBIENT_CHORDS = [
  ['A3', 'C4', 'E4', 'B4'],
  ['F3', 'A3', 'C4', 'E4'],
  ['C4', 'E4', 'G4', 'B4'],
  ['G3', 'B3', 'D4', 'E4'],
];
const AMBIENT_BELLS = ['E5', 'G5', 'A5', 'C6', 'D6', 'E6'];

class ChipSound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private musicTimer: number | null = null;
  private nextStepTime = 0;
  private step = 0;
  private hubSid: SidPlayer | null = null;
  private metal: MetalPlayer | null = null;
  private metalPending = false;
  musicEnabled = true;
  /** Which hub tune plays (settings); applies from the next startMusic. */
  track: TrackId = DEFAULT_TRACK;
  sfxEnabled = true;
  private isMuted = false;

  /** Silences everything at once (the speaker button), without losing the music/SFX choices. */
  get muted() {
    return this.isMuted;
  }
  set muted(on: boolean) {
    this.isMuted = on;
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(on ? 0 : 0.9, now, 0.03);
  }

  /** Must be called from a user gesture at least once (browser autoplay rules). */
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.9;
      // A limiter at the end lets the music sit loud on phone speakers
      // without the peaks clipping.
      const limiter = this.ctx.createDynamicsCompressor();
      limiter.threshold.value = -8;
      limiter.knee.value = 4;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.15;
      this.master.connect(limiter).connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = MUSIC_LEVEL;
      this.musicBus.connect(this.master);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.55;
      this.sfxBus.connect(this.master);
      this.noise = this.makeNoise();
    }
    this.ctx.resume().catch(() => {});
  }

  get ready() {
    return !!this.ctx && this.ctx.state === 'running';
  }

  private makeNoise(): AudioBuffer {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  private tone(bus: GainNode, freq: number, start: number, dur: number, wave: Wave, gain: number, slideTo?: number) {
    if (!this.ctx || !freq) return;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(gain, start + 0.005);
    env.gain.setValueAtTime(gain, start + dur * 0.7);
    env.gain.linearRampToValueAtTime(0, start + dur);
    osc.connect(env).connect(bus);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  private hat(start: number, gain: number) {
    if (!this.ctx || !this.noise || !this.musicBus) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6000;
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(gain, start);
    env.gain.exponentialRampToValueAtTime(0.001, start + 0.05);
    src.connect(filter).connect(env).connect(this.musicBus);
    src.start(start);
    src.stop(start + 0.06);
  }

  play(name: SfxName) {
    if (!this.sfxEnabled || !this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime + 0.01;
    const bus = this.sfxBus;
    const seq = (notes: string[], len: number, wave: Wave = 'square', gain = 0.18) =>
      notes.forEach((n, i) => this.tone(bus, noteFreq(n), t + i * len, len, wave, gain));
    switch (name) {
      case 'blip':
        this.tone(bus, 1320, t, 0.04, 'square', 0.12);
        break;
      case 'select':
        seq(['E6', 'B6'], 0.06);
        break;
      case 'back':
        seq(['B5', 'E5'], 0.06);
        break;
      case 'coin':
        seq(['C6', 'G6', 'C7'], 0.07);
        break;
      case 'powerup':
        seq(['C5', 'E5', 'G5', 'C6', 'E6', 'G6', 'C7'], 0.05);
        break;
      case 'error':
        this.tone(bus, 220, t, 0.25, 'sawtooth', 0.14, 110);
        break;
      case 'start':
        seq(['G5', 'C6', 'E6', 'G6'], 0.08, 'square', 0.16);
        this.tone(bus, noteFreq('C7'), t + 0.32, 0.4, 'triangle', 0.22);
        break;
      case 'achievement':
        seq(['C6', 'E6', 'G6', 'E6', 'G6', 'C7'], 0.08, 'square', 0.15);
        break;
    }
  }

  /** One soft, round note for the mini games (Senso pads, memory flips). */
  softNote(note: string, dur = 0.35) {
    if (!this.sfxEnabled || !this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime + 0.01;
    this.tone(this.sfxBus, noteFreq(note), t, dur, 'triangle', 0.28);
  }

  /** The chime as the logo appears in the doorway: two clean triangle notes. */
  chime() {
    if (!this.sfxEnabled || !this.ctx || !this.sfxBus) return void this.note('chime', 'aus');
    this.note('chime', `gespielt (Audio: ${this.ctx.state})`);
    const t = this.ctx.currentTime + 0.02;
    this.tone(this.sfxBus, noteFreq('B5'), t, 0.12, 'square', 0.12);
    this.tone(this.sfxBus, noteFreq('E6'), t + 0.12, 0.9, 'triangle', 0.3);
  }

  /**
   * The quiet piece in front of the door: slow, soft chords with a few
   * music-box notes on top, kept in the mids so phone speakers carry it.
   * It may be scheduled while the browser still holds audio back (no tap
   * yet); it then simply starts with the first touch. Returns a stop function.
   */
  ambient(): () => void {
    if (!this.ctx || !this.master) return this.note('ambient', 'aus (kein Web Audio)');
    const ctx = this.ctx;
    const out = ctx.createGain();
    const warm = ctx.createBiquadFilter();
    warm.type = 'lowpass';
    warm.frequency.value = 1500;
    warm.connect(out).connect(this.master);
    out.gain.setValueAtTime(0, ctx.currentTime);
    out.gain.linearRampToValueAtTime(AMBIENT_LEVEL, ctx.currentTime + 3);

    const pad = (note: string, t: number, len: number) => {
      const f = noteFreq(note);
      for (const [wave, detune, g] of [['triangle', 1, 0.05], ['sine', 1.004, 0.04]] as const) {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        osc.type = wave;
        osc.frequency.value = f * detune;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(g, t + 2.5);
        env.gain.setValueAtTime(g, t + len);
        env.gain.linearRampToValueAtTime(0, t + len + 2.5);
        osc.connect(env).connect(warm);
        osc.start(t);
        osc.stop(t + len + 2.6);
      }
    };
    const bell = (note: string, t: number) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = noteFreq(note);
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.05, t + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0005, t + 2.4);
      osc.connect(env).connect(out);
      osc.start(t);
      osc.stop(t + 2.5);
    };

    let next = ctx.currentTime + 0.1;
    let bar = 0;
    const queue = () => {
      // Only ever a bar ahead; while audio is held back the clock stands still.
      while (next < ctx.currentTime + 1) {
        const chord = AMBIENT_CHORDS[bar % AMBIENT_CHORDS.length];
        chord.forEach((n) => pad(n, next, AMBIENT_BAR));
        for (let k = 0; k < 3; k++) {
          if (Math.random() < 0.6) bell(AMBIENT_BELLS[Math.floor(Math.random() * AMBIENT_BELLS.length)], next + 1 + k * 2.2);
        }
        next += AMBIENT_BAR;
        bar++;
      }
    };
    queue();
    const timer = window.setInterval(queue, 400);
    this.note('ambient', `läuft (Audio: ${ctx.state})`);
    return () => {
      window.clearInterval(timer);
      const now = ctx.currentTime;
      out.gain.cancelScheduledValues(now);
      out.gain.setValueAtTime(out.gain.value, now);
      out.gain.linearRampToValueAtTime(0, now + 0.3);
      setTimeout(() => out.disconnect(), 400);
    };
  }

  /** An old wooden door thrown open: a short creak, then it bangs against the wall. */
  door() {
    if (!this.sfxEnabled || !this.ctx || !this.sfxBus || !this.noise) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + 0.01;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 9;
    band.frequency.setValueAtTime(700, t);
    band.frequency.exponentialRampToValueAtTime(1800, t + 0.38);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.9, t + 0.05);
    env.gain.setValueAtTime(0.9, t + 0.3);
    env.gain.linearRampToValueAtTime(0, t + 0.42);
    src.connect(band).connect(env).connect(this.sfxBus);
    src.start(t);
    src.stop(t + 0.45);
    // The creak itself: a hinge squeak that bends upward.
    this.tone(this.sfxBus, 260, t + 0.02, 0.36, 'sawtooth', 0.05, 520);
    // Bang against the wall.
    this.tone(this.sfxBus, 140, t + 0.44, 0.22, 'sine', 0.6, 45);
  }

  /** What the intro sounds did last time, for the ?ton diagnostics line. */
  readonly debug: Record<string, string> = {};
  private note(key: string, value: string) {
    this.debug[key] = value;
    return () => {};
  }
  get debugState() {
    return this.ctx ? `${this.ctx.state}, ${this.ctx.sampleRate} Hz, t=${this.ctx.currentTime.toFixed(1)}` : 'nicht gestartet';
  }

  /** The next startMusic opens with the heavy metal intro (metal.ts), then the hub tune. */
  queueMetalIntro() {
    this.metalPending = true;
  }

  startMusic() {
    if (!this.musicEnabled || !this.ctx || !this.musicBus || this.musicTimer !== null || this.hubSid || this.metal) return;
    if (this.metalPending && this.noise) {
      this.metalPending = false;
      this.metal = new MetalPlayer(this.ctx, this.musicBus, this.noise, () => {
        this.metal = null;
        this.startMusic();
      });
      this.metal.start();
      return;
    }
    if (!trackById(this.track).steps) {
      if (!this.noise) return;
      this.hubSid = new SidPlayer(this.ctx, this.musicBus, this.noise);
      this.hubSid.start();
      return;
    }
    this.nextStepTime = this.ctx.currentTime + 0.1;
    this.step = 0;
    // Look-ahead scheduler: every 50 ms queue all steps due in the next 200 ms.
    this.musicTimer = window.setInterval(() => this.schedule(), 50);
  }

  stopMusic() {
    if (this.musicTimer !== null) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
    this.hubSid?.stop();
    this.hubSid = null;
    this.metal?.stop();
    this.metal = null;
  }

  setMusic(on: boolean) {
    this.musicEnabled = on;
    if (on) this.startMusic();
    else this.stopMusic();
  }

  private schedule() {
    const tune = trackById(this.track).steps;
    if (!this.ctx || !this.musicBus || !tune) return;
    const step = 60 / tune.bpm / 2;
    while (this.nextStepTime < this.ctx.currentTime + 0.2) {
      const i = this.step % tune.lead.length;
      const t = this.nextStepTime;
      this.voice(tune.lead, i, t, step, tune.leadWave, tune.leadGain);
      this.voice(tune.bass, i, t, step, tune.bassWave, tune.bassGain);
      const chord = tune.chords[Math.floor(i / 8)];
      // 32nd-note arpeggio, the classic way to fake chords on one channel.
      for (let k = 0; k < 2; k++) {
        this.tone(this.musicBus, noteFreq(chord[(i * 2 + k) % 3]) * 2, t + (k * step) / 2, step / 2, 'square', 0.025);
      }
      if (hatOn(tune.hats, i)) this.hat(t, 0.08);
      this.nextStepTime += step;
      this.step++;
    }
  }

  /** Plays the note starting at step i, held for as many steps as '=' follow it. */
  private voice(pattern: string[], i: number, t: number, step: number, wave: Wave, gain: number) {
    const note = pattern[i];
    if (note === '-' || note === '=') return;
    let len = 1;
    while (pattern[i + len] === '=') len++;
    this.tone(this.musicBus!, noteFreq(note), t, step * (len - 0.1), wave, gain);
  }
}

function hatOn(hats: StepTrack['hats'], i: number) {
  if (hats === 'all') return true;
  if (hats === 'offbeat') return i % 2 === 1;
  return i % 8 === 7;
}

export const chip = new ChipSound();
