// In front of the arcade: the hall's metal thumping muffled through the wall
// (Marco, 2026-10-07: a bass from inside, so you are ready for loud music).
// It is the very riff that gets loud once you walk in, recorded as heard
// through the wall (only the low end gets out, see metalBand.ts) and looped.
// Nothing else plays out here: the street with its crowd, sirens and
// scuffles was taken out the same day at Marco's request, see
// _removed_content/.

import { loadRecording, METAL_WALL_URL } from './metal';

export class StreetAmbience {
  private out: GainNode;
  private source: AudioBufferSourceNode | null = null;
  private stopped = false;

  constructor(
    private ctx: AudioContext,
    bus: AudioNode,
    private level: number
  ) {
    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.out.connect(bus);
    loadRecording(ctx, METAL_WALL_URL).then((buf) => this.play(buf));
  }

  private play(buf: AudioBuffer | null) {
    if (this.stopped || !buf) return;
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(this.out);
    src.start(now + 0.05);
    this.source = src;
    this.out.gain.setValueAtTime(0, now);
    this.out.gain.linearRampToValueAtTime(this.level, now + 3);
  }

  stop() {
    this.stopped = true;
    const now = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(now);
    this.out.gain.setValueAtTime(this.out.gain.value, now);
    this.out.gain.linearRampToValueAtTime(0, now + 0.3);
    const src = this.source;
    setTimeout(() => {
      try {
        src?.stop();
      } catch {
        /* already stopped */
      }
      this.out.disconnect();
    }, 400);
  }
}
