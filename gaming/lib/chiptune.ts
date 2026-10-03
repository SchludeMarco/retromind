// A tiny 8-bit sound chip on top of Web Audio: square/triangle/noise voices
// for UI blips, a looping original chiptune and a C64-style title tune (sid.ts).
// Music and blips are synthesized; only the boot engine is a recorded sample.

import { SidPlayer } from './sid';

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

// --- The background tune: 8th-note steps, four voices, two 4-bar patterns. ---
const BPM = 132;
const STEP = 60 / BPM / 2;
// prettier-ignore
const LEAD = [
  'A4','-','C5','E5','-','D5','C5','-',  'B4','-','G4','-','B4','C5','D5','-',
  'C5','-','E5','A5','-','G5','E5','-',  'F5','E5','D5','-','E5','-','-','-',
  'A4','-','C5','E5','-','D5','C5','-',  'B4','-','G4','-','B4','D5','G5','-',
  'F5','-','E5','D5','-','C5','B4','-',  'C5','B4','A4','-','A4','-','-','-',
];
// prettier-ignore
const BASS = [
  'A2','A2','A3','A2','A2','A2','A3','A2',  'G2','G2','G3','G2','G2','G2','G3','G2',
  'F2','F2','F3','F2','F2','F2','F3','F2',  'E2','E2','E3','E2','E2','E2','E3','E2',
  'A2','A2','A3','A2','A2','A2','A3','A2',  'G2','G2','G3','G2','G2','G2','G3','G2',
  'D2','D2','D3','D2','F2','F2','F3','F2',  'E2','E2','E3','E2','A2','A2','A3','A2',
];
// Arpeggio chord roots per bar (A minor, G, F, E …).
// prettier-ignore
const ARP_CHORDS = [
  ['A4','C5','E5'], ['G4','B4','D5'], ['F4','A4','C5'], ['E4','G#4','B4'],
  ['A4','C5','E5'], ['G4','B4','D5'], ['D4','F4','A4'], ['E4','G#4','B4'],
];

// Boot sound: the first seconds of a royalty-free diesel start recording
// (starter, catch, revs), trimmed and faded in public/gaming/.
// Music bus level; at 0.32 phones barely played the tunes audibly.
const MUSIC_LEVEL = 1.4;

const DIESEL_URL = '/gaming/diesel-start.mp3';

class ChipSound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private dieselBytes: Promise<ArrayBuffer | null> | null = null;
  private dieselBuf: Promise<AudioBuffer | null> | null = null;
  private musicTimer: number | null = null;
  private nextStepTime = 0;
  private step = 0;
  musicEnabled = true;
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

  /** The console "power on" chime: two clean triangle notes. */
  chime() {
    if (!this.sfxEnabled || !this.ctx || !this.sfxBus) return void this.note('chime', 'aus');
    this.note('chime', `gespielt (Audio: ${this.ctx.state})`);
    const t = this.ctx.currentTime + 0.02;
    this.tone(this.sfxBus, noteFreq('B5'), t, 0.12, 'square', 0.12);
    this.tone(this.sfxBus, noteFreq('E6'), t + 0.12, 0.9, 'triangle', 0.3);
  }

  /** Starts downloading the boot engine sample before the power tap. */
  prefetchDiesel() {
    this.dieselBytes ??= fetch(DIESEL_URL)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null);
  }

  private dieselBuffer(ctx: AudioContext): Promise<AudioBuffer | null> {
    if (!this.dieselBuf) {
      this.prefetchDiesel();
      this.dieselBuf = this.dieselBytes!.then((b) => (b ? ctx.decodeAudioData(b) : null)).catch(() => null);
    }
    return this.dieselBuf;
  }

  /**
   * A real diesel engine starting (starter, catch, revs), cut to `duration`
   * seconds and faded out so it hands over to the chime. Returns a function
   * that cuts it off.
   */
  diesel(duration: number): () => void {
    if (!this.sfxEnabled) return this.note('diesel', 'aus (Effekte abgeschaltet)');
    if (!this.ctx || !this.sfxBus) return this.note('diesel', 'aus (kein Web Audio)');
    // The power tap creates the AudioContext; on phones it may still be
    // starting up here. Play only once it really runs and the sample is
    // decoded, so nothing gets queued against a clock that is not moving yet.
    const ctx = this.ctx;
    const bus = this.sfxBus;
    const began = performance.now();
    let cancelled = false;
    let stop: (() => void) | null = null;
    this.note('diesel', `wartet (Audio: ${ctx.state})`);
    Promise.all([ctx.state === 'running' ? null : ctx.resume(), this.dieselBuffer(ctx)]).then(
      ([, buf]) => {
        if (cancelled) return;
        if (!buf) return this.note('diesel', 'Sample nicht geladen');
        const left = Math.min(duration - (performance.now() - began) / 1000, buf.duration);
        if (left < 0.8) return this.note('diesel', `zu spät (erst nach ${(duration - left).toFixed(1)} s bereit)`);
        const src = ctx.createBufferSource();
        const env = ctx.createGain();
        const t0 = ctx.currentTime + 0.02;
        src.buffer = buf;
        env.gain.setValueAtTime(1, t0);
        env.gain.setValueAtTime(1, t0 + Math.max(0, left - 0.4));
        env.gain.linearRampToValueAtTime(0, t0 + left);
        src.connect(env).connect(bus);
        src.start(t0);
        src.stop(t0 + left + 0.05);
        stop = () => {
          const now = ctx.currentTime;
          env.gain.cancelScheduledValues(now);
          env.gain.setValueAtTime(env.gain.value, now);
          env.gain.linearRampToValueAtTime(0, now + 0.05);
          setTimeout(() => env.disconnect(), 100);
        };
        this.note('diesel', `läuft ${left.toFixed(1)} s`);
      },
      (e) => this.note('diesel', `Audio-Start fehlgeschlagen: ${e}`)
    );
    return () => {
      cancelled = true;
      stop?.();
    };
  }

  /** What the boot sounds did last time, for the ?ton diagnostics line. */
  readonly debug: Record<string, string> = {};
  private note(key: string, value: string) {
    this.debug[key] = value;
    return () => {};
  }
  get debugState() {
    return this.ctx ? `${this.ctx.state}, ${this.ctx.sampleRate} Hz, t=${this.ctx.currentTime.toFixed(1)}` : 'nicht gestartet';
  }

  private title: SidPlayer | null = null;

  /** The C64-style title-screen tune (see sid.ts); the hub has its own. */
  startTitleMusic() {
    if (this.title) return;
    if (!this.musicEnabled) return void this.note('title', 'aus (Musik ausgeschaltet)');
    if (!this.ctx || !this.musicBus || !this.noise) return void this.note('title', 'Audio nicht gestartet');
    if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
    this.title = new SidPlayer(this.ctx, this.musicBus, this.noise);
    this.title.start();
    this.note('title', `läuft (Audio ${this.ctx.state})`);
  }

  stopTitleMusic() {
    this.title?.stop();
    this.title = null;
  }

  startMusic() {
    if (!this.musicEnabled || !this.ctx || this.musicTimer !== null) return;
    this.nextStepTime = this.ctx.currentTime + 0.1;
    this.step = 0;
    // Look-ahead scheduler: every 50 ms queue all steps due in the next 200 ms.
    this.musicTimer = window.setInterval(() => this.schedule(), 50);
  }

  stopMusic() {
    if (this.musicTimer !== null) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  setMusic(on: boolean) {
    this.musicEnabled = on;
    if (on) this.startMusic();
    else this.stopMusic();
  }

  private schedule() {
    if (!this.ctx || !this.musicBus) return;
    while (this.nextStepTime < this.ctx.currentTime + 0.2) {
      const i = this.step % LEAD.length;
      const t = this.nextStepTime;
      this.tone(this.musicBus, noteFreq(LEAD[i]), t, STEP * 0.9, 'square', 0.07);
      this.tone(this.musicBus, noteFreq(BASS[i]), t, STEP * 0.85, 'triangle', 0.2);
      const chord = ARP_CHORDS[Math.floor(i / 8)];
      // 32nd-note arpeggio, the classic way to fake chords on one channel.
      for (let k = 0; k < 2; k++) {
        this.tone(this.musicBus, noteFreq(chord[(i * 2 + k) % 3]) * 2, t + (k * STEP) / 2, STEP / 2, 'square', 0.025);
      }
      if (i % 2 === 1) this.hat(t, 0.08);
      this.nextStepTime += STEP;
      this.step++;
    }
  }
}

export const chip = new ChipSound();
