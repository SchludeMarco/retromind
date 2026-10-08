// In front of the arcade: the hall's metal thumping muffled through the wall
// (Marco, 2026-10-07: a bass from inside, so you are ready for loud music).
// It is the very riff that gets loud once you walk in, recorded as heard
// through the wall (only the low end gets out, see metalBand.ts) and looped.
// Nothing else plays out here: the street with its crowd, sirens and
// scuffles was taken out the same day at Marco's request, see
// _removed_content/.
// Signed in with Spotify Premium, the wall lets through the very song that
// plays inside instead (Marco, 2026-10-08): its 30-second preview clip
// (api/spotify-preview) runs through a low-pass with boosted bass, so it
// sounds as muffled as the recording. If the clip can't be loaded, the
// recording plays.

import { loadRecording, METAL_WALL_URL } from './metal';

/** A song from the hall's playlist: Spotify id and "Title · Artist". */
export interface DoorSong {
  id: string;
  name: string | null;
}

export function previewUrl(song: DoorSong): string {
  const q = song.name ? `&q=${encodeURIComponent(song.name)}` : '';
  return `/api/spotify-preview?track=${song.id}${q}`;
}

export class StreetAmbience {
  private out: GainNode;
  private source: AudioBufferSourceNode | null = null;
  private stopped = false;
  /** true once the song's clip (not the recording) plays. */
  songPlaying = false;

  constructor(
    private ctx: AudioContext,
    bus: AudioNode,
    private level: number,
    song: DoorSong | null = null,
    private songLevel = level
  ) {
    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.out.connect(bus);
    const wall = () => loadRecording(ctx, METAL_WALL_URL).then((buf) => this.play(buf, false));
    if (!song) {
      wall();
      return;
    }
    loadRecording(ctx, previewUrl(song)).then((buf) => (buf ? this.play(buf, true) : wall()));
  }

  /** The clip as heard through the wall: only the low end, bass pushed up. */
  private wall(): AudioNode {
    const low = this.ctx.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 420;
    low.Q.value = 0.7;
    const bass = this.ctx.createBiquadFilter();
    bass.type = 'lowshelf';
    bass.frequency.value = 160;
    bass.gain.value = 8;
    low.connect(bass);
    bass.connect(this.out);
    return low;
  }

  private play(buf: AudioBuffer | null, song: boolean) {
    if (this.stopped || !buf) return;
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(song ? this.wall() : this.out);
    this.songPlaying = song;
    if (song) this.level = this.songLevel;
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
