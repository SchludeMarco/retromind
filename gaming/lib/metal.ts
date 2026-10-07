// The hall's 80s heavy metal, played from recordings: the intro when you
// walk in, and its riff muffled through the wall in front of the door
// (street.ts). Both are rendered in advance by metalBand.ts
// (`node scripts/render-metal.mjs`), so the phone only plays a file instead
// of synthesizing a whole band live (Marco, 2026-10-07: it sounded cheap).

export const METAL_INTRO_URL = '/gaming/audio/hall-metal-intro.mp3';
export const METAL_WALL_URL = '/gaming/audio/hall-metal-wall.wav';

const loads: Record<string, Promise<AudioBuffer | null>> = {};
/** Fetches and decodes a recording once; null when that fails (then it simply stays quiet). */
export function loadRecording(ctx: BaseAudioContext, url: string): Promise<AudioBuffer | null> {
  if (!loads[url]) {
    loads[url] = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.arrayBuffer();
      })
      .then(
        (data) =>
          new Promise<AudioBuffer>((resolve, reject) => {
            // Callback form, for older Safari.
            ctx.decodeAudioData(data, resolve, reject);
          })
      )
      .catch((e) => {
        console.warn('[RetroMind] Musik konnte nicht geladen werden', url, e);
        delete loads[url];
        return null;
      });
  }
  return loads[url];
}

/** Plays the intro once, then hands over (the hub tune follows). */
export class MetalPlayer {
  private out: GainNode;
  private source: AudioBufferSourceNode | null = null;
  private finished = false;

  constructor(
    private ctx: AudioContext,
    bus: AudioNode,
    private onEnd: () => void
  ) {
    this.out = ctx.createGain();
    this.out.gain.value = 0.5;
    this.out.connect(bus);
  }

  start() {
    loadRecording(this.ctx, METAL_INTRO_URL).then((buf) => {
      if (this.finished) return;
      if (!buf) return this.end();
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.out);
      src.onended = () => this.end();
      src.start(this.ctx.currentTime + 0.05);
      this.source = src;
    });
  }

  stop() {
    if (this.finished) return;
    this.finished = true;
    const now = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(now);
    this.out.gain.setValueAtTime(this.out.gain.value, now);
    this.out.gain.linearRampToValueAtTime(0, now + 0.15);
    const src = this.source;
    setTimeout(() => {
      try {
        src?.stop();
      } catch {
        /* already stopped */
      }
      this.out.disconnect();
    }, 200);
  }

  private end() {
    if (this.finished) return;
    this.finished = true;
    this.out.disconnect();
    this.onEnd();
  }
}
