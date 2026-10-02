// A tiny 8-bit sound chip on top of Web Audio: square/triangle/noise voices
// for UI blips and a looping original chiptune. Everything is synthesized, so
// there are no assets to load and nothing copyrighted is played.

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

class ChipSound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private musicTimer: number | null = null;
  private nextStepTime = 0;
  private step = 0;
  musicEnabled = true;
  sfxEnabled = true;

  /** Must be called from a user gesture at least once (browser autoplay rules). */
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.32;
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
    if (!this.sfxEnabled || !this.ctx || !this.sfxBus) return;
    const t = this.ctx.currentTime + 0.02;
    this.tone(this.sfxBus, noteFreq('B5'), t, 0.12, 'square', 0.12);
    this.tone(this.sfxBus, noteFreq('E6'), t + 0.12, 0.9, 'triangle', 0.3);
  }

  /**
   * A diesel engine starting: the starter cranks a few slow, weak strokes,
   * the engine catches with a bang and settles into a rough idle chug that
   * fades out after `duration` seconds. Returns a function that cuts it off.
   */
  diesel(duration: number): () => void {
    if (!this.sfxEnabled || !this.ctx || !this.sfxBus || !this.noise) return () => {};
    const ctx = this.ctx;
    const t0 = ctx.currentTime + 0.05;
    const end = t0 + duration;
    const out = ctx.createGain();
    out.gain.setValueAtTime(1, t0);
    out.gain.setValueAtTime(1, end - 0.5);
    out.gain.linearRampToValueAtTime(0, end);
    out.connect(this.sfxBus);

    // One combustion stroke: a low thump plus a dark burst of noise.
    const stroke = (t: number, gain: number, pitch: number) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(pitch, t);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.6, t + 0.08);
      env.gain.setValueAtTime(gain, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 420;
      osc.connect(lp).connect(env).connect(out);
      osc.start(t);
      osc.stop(t + 0.1);
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      const nf = ctx.createBiquadFilter();
      nf.type = 'lowpass';
      nf.frequency.value = 700;
      const nenv = ctx.createGain();
      nenv.gain.setValueAtTime(gain * 0.9, t);
      nenv.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      src.connect(nf).connect(nenv).connect(out);
      src.start(t, Math.random() * 0.2);
      src.stop(t + 0.07);
    };

    // Starter motor: a whining, wobbling saw under the first strokes.
    const crankEnd = t0 + Math.min(0.9, duration * 0.35);
    const starter = ctx.createOscillator();
    const wobble = ctx.createOscillator();
    const wobbleDepth = ctx.createGain();
    const starterEnv = ctx.createGain();
    const starterLp = ctx.createBiquadFilter();
    starter.type = 'sawtooth';
    starter.frequency.setValueAtTime(70, t0);
    starter.frequency.linearRampToValueAtTime(110, crankEnd);
    wobble.frequency.value = 5;
    wobbleDepth.gain.value = 18;
    wobble.connect(wobbleDepth).connect(starter.frequency);
    starterLp.type = 'lowpass';
    starterLp.frequency.value = 900;
    starterEnv.gain.setValueAtTime(0, t0);
    starterEnv.gain.linearRampToValueAtTime(0.08, t0 + 0.05);
    starterEnv.gain.setValueAtTime(0.08, crankEnd - 0.1);
    starterEnv.gain.linearRampToValueAtTime(0, crankEnd + 0.05);
    starter.connect(starterLp).connect(starterEnv).connect(out);
    starter.start(t0);
    wobble.start(t0);
    starter.stop(crankEnd + 0.1);
    wobble.stop(crankEnd + 0.1);

    // Cranking: slow, uneven, weak strokes.
    let t = t0 + 0.05;
    while (t < crankEnd) {
      stroke(t, 0.18, 60);
      t += 0.19 + Math.random() * 0.03;
    }
    // It catches: one big bang, then the revs flare and settle to idle.
    stroke(crankEnd, 0.6, 75);
    t = crankEnd + 0.07;
    while (t < end) {
      const since = t - crankEnd;
      const rate = since < 0.5 ? 9 + since * 18 : 12 - Math.min(1, (since - 0.5) / 0.6) * 2.5;
      const odd = Math.random() < 0.5 ? 1 : 0.75; // diesel knock is never quite even
      stroke(t, (since < 0.5 ? 0.45 : 0.32) * odd, 50 + Math.random() * 8);
      t += (1 / rate) * (0.93 + Math.random() * 0.14);
    }

    return () => {
      const now = ctx.currentTime;
      out.gain.cancelScheduledValues(now);
      out.gain.setValueAtTime(out.gain.value, now);
      out.gain.linearRampToValueAtTime(0, now + 0.05);
      setTimeout(() => out.disconnect(), 100);
    };
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
