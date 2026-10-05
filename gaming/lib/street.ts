// The street in front of the arcade, all synthesized: a crowd murmuring and
// now and then shouting, police sirens somewhere in the distance and every so
// often a scuffle round the corner. Everything sits behind a "distance"
// filter so it stays quiet and in the background.

// Vowel formants (F1, F2 in Hz) the crowd voices wander through.
const VOWELS: [number, number][] = [
  [730, 1090], // a
  [530, 1840], // e
  [390, 1990], // i
  [570, 840], // o
  [440, 1020], // u
  [660, 1700], // ä
];
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
const rand = (a: number, b: number) => a + Math.random() * (b - a);

const CROWD_VOICES = 7;

type Voice = {
  osc: OscillatorNode;
  f1: BiquadFilterNode;
  f2: BiquadFilterNode;
  env: GainNode;
  f0: number;
  next: number;
};

export class StreetAmbience {
  private out: GainNode;
  private far: BiquadFilterNode;
  private voices: Voice[] = [];
  private sources: AudioScheduledSourceNode[] = [];
  private timer: number;
  private nextShout: number;
  private nextSiren: number;
  private nextScuffle: number;

  constructor(
    private ctx: AudioContext,
    bus: AudioNode,
    private noise: AudioBuffer,
    level: number
  ) {
    const now = ctx.currentTime;
    this.out = ctx.createGain();
    this.out.gain.setValueAtTime(0, now);
    this.out.gain.linearRampToValueAtTime(level, now + 3);
    this.out.connect(bus);
    // Heard through the night air: no sharp highs.
    this.far = ctx.createBiquadFilter();
    this.far.type = 'lowpass';
    this.far.frequency.value = 2600;
    this.far.connect(this.out);

    for (let i = 0; i < CROWD_VOICES; i++) this.voices.push(this.makeVoice(now));
    this.nextShout = now + rand(2, 5);
    this.nextSiren = now + rand(6, 10);
    this.nextScuffle = now + rand(14, 20);
    this.schedule();
    this.timer = window.setInterval(() => this.schedule(), 250);
  }

  stop() {
    window.clearInterval(this.timer);
    const now = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(now);
    this.out.gain.setValueAtTime(this.out.gain.value, now);
    this.out.gain.linearRampToValueAtTime(0, now + 0.3);
    const sources = [...this.sources, ...this.voices.map((v) => v.osc)];
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
    }, 400);
  }

  /** One murmuring person: a buzzy voice through two moving formants. */
  private makeVoice(now: number): Voice {
    const ctx = this.ctx;
    const f0 = rand(95, 230);
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = f0;
    const breath = ctx.createBufferSource();
    breath.buffer = this.noise;
    breath.loop = true;
    const breathGain = ctx.createGain();
    breathGain.gain.value = 0.25;
    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.Q.value = 7;
    const f2 = ctx.createBiquadFilter();
    f2.type = 'bandpass';
    f2.Q.value = 9;
    const env = ctx.createGain();
    env.gain.value = 0;
    const mix = ctx.createGain();
    mix.gain.value = 0.5;
    osc.connect(mix);
    breath.connect(breathGain).connect(mix);
    mix.connect(f1).connect(env);
    mix.connect(f2).connect(env);
    env.connect(this.far);
    osc.start(now);
    breath.start(now, Math.random() * 0.25);
    this.sources.push(breath);
    return { osc, f1, f2, env, f0, next: now + rand(0, 1) };
  }

  private schedule() {
    const now = this.ctx.currentTime;
    const ahead = now + 0.6;
    // Murmur: each voice talks in syllables, with pauses between phrases.
    for (const v of this.voices) {
      while (v.next < ahead) {
        const t = v.next;
        const pause = Math.random() < 0.12;
        const len = pause ? rand(0.6, 2) : rand(0.09, 0.26);
        const [a, b] = pick(VOWELS);
        v.f1.frequency.setTargetAtTime(a * rand(0.9, 1.1), t, 0.02);
        v.f2.frequency.setTargetAtTime(b * rand(0.9, 1.1), t, 0.02);
        v.osc.frequency.setTargetAtTime(v.f0 * rand(0.92, 1.12), t, 0.05);
        v.env.gain.setTargetAtTime(pause ? 0 : rand(0.08, 0.2), t, 0.025);
        v.next = t + len;
      }
    }
    if (this.nextShout < ahead) {
      this.shout(this.nextShout, rand(0.5, 1));
      this.nextShout += rand(3, 9);
    }
    if (this.nextSiren < ahead) {
      this.siren(this.nextSiren);
      this.nextSiren += rand(25, 45);
    }
    if (this.nextScuffle < ahead) {
      this.scuffle(this.nextScuffle);
      this.nextScuffle += rand(30, 55);
    }
  }

  /** Someone in the crowd calling out ("Hey!", "Ey, Alter!"). */
  private shout(t: number, loud: number, angry = false) {
    const ctx = this.ctx;
    const dur = rand(0.25, angry ? 0.5 : 0.7);
    const f0 = angry ? rand(260, 380) : rand(180, 300);
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f0 * 0.9, t);
    osc.frequency.linearRampToValueAtTime(f0 * 1.15, t + dur * 0.3);
    osc.frequency.linearRampToValueAtTime(f0 * 0.8, t + dur);
    const [a, b] = angry ? [730, 1090] : pick(VOWELS);
    const env = ctx.createGain();
    const g = (angry ? 0.2 : 0.14) * loud;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(g, t + 0.04);
    env.gain.setValueAtTime(g, t + dur * 0.7);
    env.gain.linearRampToValueAtTime(0, t + dur);
    for (const [f, q] of [[a, 6], [b, 8]]) {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = f;
      bp.Q.value = q;
      osc.connect(bp).connect(env);
    }
    env.connect(this.far);
    osc.start(t);
    osc.stop(t + dur + 0.05);
    this.track(osc);
  }

  /** A German police siren ("tatü-tata") passing a few streets away. */
  private siren(t: number) {
    const ctx = this.ctx;
    const dur = rand(7, 11);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.09, t + dur * 0.45);
    env.gain.linearRampToValueAtTime(0, t + dur);
    const muffle = ctx.createBiquadFilter();
    muffle.type = 'lowpass';
    muffle.frequency.value = 1400;
    // A short echo off the buildings.
    const echo = ctx.createDelay(1);
    echo.delayTime.value = 0.23;
    const echoGain = ctx.createGain();
    echoGain.gain.value = 0.35;
    env.connect(muffle);
    muffle.connect(this.far);
    muffle.connect(echo).connect(echoGain).connect(this.far);
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    // Driving past: the pitch sinks a little (Doppler).
    const step = 0.68;
    for (let k = 0, s = t; s < t + dur; k++, s += step) {
      const doppler = 1.03 - (0.06 * (s - t)) / dur;
      osc.frequency.setValueAtTime((k % 2 ? 580 : 435) * doppler, s);
    }
    osc.connect(env);
    osc.start(t);
    osc.stop(t + dur + 0.1);
    this.track(osc);
  }

  /** A scuffle round the corner: thuds, angry shouts, a bin going over. */
  private scuffle(t: number) {
    const dur = rand(2, 3.5);
    for (let s = t; s < t + dur; s += rand(0.15, 0.45)) {
      if (Math.random() < 0.6) this.thud(s);
      if (Math.random() < 0.4) this.shout(s + rand(0, 0.1), 1, true);
    }
    this.clatter(t + dur * rand(0.4, 0.8));
  }

  private thud(t: number) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.12);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.3, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(env).connect(this.far);
    osc.start(t);
    osc.stop(t + 0.2);
    this.track(osc);
    this.noiseBurst(t, 'lowpass', 500, 0.25, 0.08);
  }

  private clatter(t: number) {
    for (let k = 0; k < 6; k++) this.noiseBurst(t + k * rand(0.04, 0.09), 'bandpass', rand(1500, 3500), 0.2, 0.06);
    this.noiseBurst(t, 'lowpass', 900, 0.35, 0.3);
  }

  private noiseBurst(t: number, type: BiquadFilterType, freq: number, gain: number, decay: number) {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    const env = ctx.createGain();
    env.gain.setValueAtTime(gain, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + decay);
    src.connect(filter).connect(env).connect(this.far);
    src.start(t, Math.random() * 0.2);
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
