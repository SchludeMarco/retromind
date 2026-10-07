// In front of the arcade: the hall's metal thumping muffled through the wall,
// kick, snare and the bass line of the very riff that gets loud once you
// walk in (Marco, 2026-10-07: a bass from inside, so you are ready for loud
// music). Nothing else plays out here: the street with its crowd, sirens and
// scuffles was taken out the same day at Marco's request (several sounds at
// once didn't work well on his phone), see _removed_content/.

import { BEAT, RIFF, STEP } from './metal';

const BASS_HZ: Record<string, number> = { E2: 82.41, G2: 98, A2: 110, B2: 123.47, C3: 130.81 };

export class StreetAmbience {
  private out: GainNode;
  private wall: BiquadFilterNode;
  private sources: AudioScheduledSourceNode[] = [];
  private timer: number;
  private nextStep: number;
  private step = 0;

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
    // Through the wall only the low end gets out; kept up to ~400 Hz, where
    // phone speakers still play something, so it is heard as a muffled beat.
    this.wall = ctx.createBiquadFilter();
    this.wall.type = 'lowpass';
    this.wall.frequency.value = 420;
    this.wall.Q.value = 0.9;
    this.wall.connect(this.out);
    this.nextStep = now + 0.2;
    this.schedule();
    this.timer = window.setInterval(() => this.schedule(), 250);
  }

  stop() {
    window.clearInterval(this.timer);
    const now = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(now);
    this.out.gain.setValueAtTime(this.out.gain.value, now);
    this.out.gain.linearRampToValueAtTime(0, now + 0.3);
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
    }, 400);
  }

  private schedule() {
    const ahead = this.ctx.currentTime + 0.6;
    while (this.nextStep < ahead) {
      this.hall(this.nextStep, this.step);
      this.nextStep += STEP;
      this.step++;
    }
  }

  /** One 16th of the music inside the hall, as heard through the wall. */
  private hall(t: number, step: number) {
    const i = step % 16;
    const bar = RIFF[Math.floor(step / 16) % RIFF.length];
    const d = BEAT[i];
    if (d === 'k') this.thump(t, 0.9);
    else if (d === 's') this.snare(t);
    const n = bar[i];
    if (n === '-' || n === '=') return;
    let len = 1;
    while (bar[i + len] === '=') len++;
    const f = BASS_HZ[n === 'm' ? 'E2' : n] ?? BASS_HZ.E2;
    this.bass(t, f, n === 'm' ? STEP * 0.8 : STEP * len - 0.01);
  }

  private thump(t: number, gain: number) {
    const osc = this.ctx.createOscillator();
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.09);
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(gain, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(env).connect(this.wall);
    osc.start(t);
    osc.stop(t + 0.18);
    this.track(osc);
  }

  /** The bass guitar: a sawtooth whose overtones (165-400 Hz) get through the wall. */
  private bass(t: number, f: number, dur: number) {
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = f;
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.32, t + 0.008);
    env.gain.setTargetAtTime(0.18, t + 0.02, 0.05);
    env.gain.setValueAtTime(0.18, t + dur);
    env.gain.linearRampToValueAtTime(0, t + dur + 0.03);
    osc.connect(env).connect(this.wall);
    osc.start(t);
    osc.stop(t + dur + 0.05);
    this.track(osc);
  }

  private snare(t: number) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.5, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    src.connect(filter).connect(env).connect(this.wall);
    src.start(t, Math.random() * 0.2);
    src.stop(t + 0.11);
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
