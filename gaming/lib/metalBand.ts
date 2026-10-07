// The hall's 80s heavy metal: a galloping palm-muted riff on two
// double-tracked distorted guitars (left and right), a bass guitar, a
// screaming lead on top and a full drum kit, about 25 seconds, ending on a
// big E chord. An original composition, nothing copyrighted is played.
//
// This file is not part of the app: it is the "studio" that renders the
// music offline (OfflineAudioContext) with a proper amp, speaker cabinet,
// room reverb and a mix compressor, far too much for a phone to compute
// live (Marco, 2026-10-07: the live-synthesized version sounded cheap).
// `node scripts/render-metal.mjs` records it into public/gaming/audio/,
// and the app just plays those files (metal.ts, street.ts).

import { noteFreq } from './chiptune';

const BPM = 160;
const STEP = 60 / BPM / 4; // 16th notes
const BAR = STEP * 16;

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
const LOOP_BARS = 8; // what is heard through the wall: the riff without the lead
const ENDING = 3.2; // the final chord ringing out

type Offline = OfflineAudioContext;

/** Renders the band offline; `loop` = the first bars only, seamlessly loopable. */
async function render(sampleRate: number, loop: boolean): Promise<AudioBuffer> {
  const bars = loop ? LOOP_BARS : BARS;
  const music = bars * BAR;
  const tail = 2; // reverb and ring-out
  const length = Math.ceil((music + (loop ? tail : ENDING)) * sampleRate);
  const ctx = new OfflineAudioContext(2, length, sampleRate);
  const band = new Band(ctx);
  for (let bar = 0; bar < bars; bar++) {
    for (let i = 0; i < 16; i++) {
      const t = 0.02 + (bar * 16 + i) * STEP;
      band.rhythm(RIFF[bar % 4], i, t);
      if (bar >= 8) band.lead(LEAD[bar % 4], i, t);
      const pattern = bar % 8 === 7 ? FILL : BEAT;
      const d = i === 0 && bar % 4 === 0 ? 'c' : pattern[i];
      band.drum(d, t);
      if (d === 'c') band.drum('k', t);
    }
  }
  if (!loop) {
    const t = 0.02 + music;
    band.chord('E2', t, ENDING - 0.4, false);
    band.drum('c', t);
    band.drum('k', t);
  }
  const out = await ctx.startRendering();
  if (loop) return foldTail(ctx, out, Math.round(music * sampleRate));
  return normalize(out);
}

/** Folds the reverb tail past the loop point back onto its start, so the loop has no seam. */
function foldTail(ctx: Offline, buf: AudioBuffer, loopLength: number): AudioBuffer {
  const looped = ctx.createBuffer(buf.numberOfChannels, loopLength, buf.sampleRate);
  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const src = buf.getChannelData(ch);
    const dst = looped.getChannelData(ch);
    dst.set(src.subarray(0, loopLength));
    for (let i = loopLength; i < src.length; i++) dst[i - loopLength] += src[i];
  }
  return normalize(looped);
}

function normalize(buf: AudioBuffer): AudioBuffer {
  let peak = 0;
  for (let ch = 0; ch < buf.numberOfChannels; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
  }
  if (peak > 0) {
    const k = 0.95 / peak;
    for (let ch = 0; ch < buf.numberOfChannels; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < d.length; i++) d[i] *= k;
    }
  }
  return buf;
}

/** The instruments and the mixing desk inside an offline render. */
class Band {
  private mix: GainNode;
  private reverb: GainNode;
  private amps: { input: GainNode; detune: number; delay: number }[];
  private bassIn: GainNode;
  private leadIn: GainNode;
  private drums: GainNode;
  private noise: AudioBuffer;

  constructor(private ctx: Offline) {
    // Mix bus: a little low cut (phone speakers play nothing down there and
    // it would only push the limiter), then a compressor that glues the band.
    this.mix = ctx.createGain();
    const lowCut = ctx.createBiquadFilter();
    lowCut.type = 'highpass';
    lowCut.frequency.value = 75;
    const glue = ctx.createDynamicsCompressor();
    glue.threshold.value = -16;
    glue.knee.value = 8;
    glue.ratio.value = 4;
    glue.attack.value = 0.008;
    glue.release.value = 0.18;
    this.mix.connect(lowCut).connect(glue).connect(ctx.destination);

    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const n = this.noise.getChannelData(0);
    for (let i = 0; i < n.length; i++) n[i] = Math.random() * 2 - 1;

    // Room reverb from a decaying stereo noise impulse.
    this.reverb = ctx.createGain();
    const conv = ctx.createConvolver();
    conv.buffer = this.impulse(1.7);
    const revLevel = ctx.createGain();
    revLevel.gain.value = 0.32;
    this.reverb.connect(conv).connect(revLevel).connect(this.mix);

    // Two guitar amps, hard left and right: the same riff played twice with
    // tiny differences in tuning and timing, the classic thick metal sound.
    this.amps = [
      { pan: -0.85, detune: -5, delay: 0 },
      { pan: 0.85, detune: 6, delay: 0.007 },
    ].map(({ pan, detune, delay }) => ({ input: this.amp(pan, 34, 0.45), detune, delay }));
    this.leadIn = this.amp(0.15, 60, 0.4, true);
    this.bassIn = this.bassAmp();
    this.drums = ctx.createGain();
    this.drums.gain.value = 0.9;
    this.drums.connect(this.mix);
  }

  /** Overdrive into a high-gain amp and a 4x12 cabinet, panned into the mix. */
  private amp(pan: number, drive: number, level: number, lead = false): GainNode {
    const ctx = this.ctx;
    const input = ctx.createGain();
    // Tighten the lows and push the mids before the distortion (like an
    // overdrive pedal in front of the amp), so it chugs instead of farting.
    const tight = ctx.createBiquadFilter();
    tight.type = 'highpass';
    tight.frequency.value = lead ? 300 : 110;
    const push = ctx.createBiquadFilter();
    push.type = 'peaking';
    push.frequency.value = lead ? 1200 : 800;
    push.Q.value = 0.8;
    push.gain.value = 8;
    const gain = ctx.createGain();
    gain.gain.value = drive;
    const shaper = ctx.createWaveShaper();
    shaper.curve = tubeCurve();
    shaper.oversample = '4x';
    // Cabinet: a body bump, the typical scoop in the low mids, a presence
    // peak and the steep roll-off of a guitar speaker, which takes away the
    // fizz of raw digital distortion.
    const body = peaking(ctx, 120, 1, 3);
    const scoop = peaking(ctx, 450, 1.2, -6);
    const presence = peaking(ctx, 2400, 1, 4);
    const cab1 = ctx.createBiquadFilter();
    cab1.type = 'lowpass';
    cab1.frequency.value = lead ? 6000 : 4800;
    cab1.Q.value = 0.9;
    const cab2 = ctx.createBiquadFilter();
    cab2.type = 'lowpass';
    cab2.frequency.value = lead ? 7500 : 6000;
    const out = ctx.createGain();
    out.gain.value = level;
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    input
      .connect(tight)
      .connect(push)
      .connect(gain)
      .connect(shaper)
      .connect(body)
      .connect(scoop)
      .connect(presence)
      .connect(cab1)
      .connect(cab2)
      .connect(out)
      .connect(panner)
      .connect(this.mix);
    const send = ctx.createGain();
    send.gain.value = lead ? 0.5 : 0.12;
    out.connect(send).connect(this.reverb);
    if (lead) {
      // A slap-back echo behind the solo.
      const echo = ctx.createDelay(1);
      echo.delayTime.value = STEP * 3;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.3;
      const echoLevel = ctx.createGain();
      echoLevel.gain.value = 0.35;
      out.connect(echo).connect(feedback).connect(echo);
      echo.connect(echoLevel).connect(panner);
    }
    return input;
  }

  /** Bass guitar, slightly overdriven so its growl also comes through small speakers. */
  private bassAmp(): GainNode {
    const ctx = this.ctx;
    const input = ctx.createGain();
    const drive = ctx.createGain();
    drive.gain.value = 3;
    const shaper = ctx.createWaveShaper();
    shaper.curve = tubeCurve();
    shaper.oversample = '2x';
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 1400;
    const growl = peaking(ctx, 700, 1, 5);
    const out = ctx.createGain();
    out.gain.value = 0.14;
    input.connect(drive).connect(shaper).connect(growl).connect(tone).connect(out).connect(this.mix);
    return input;
  }

  private impulse(seconds: number): AudioBuffer {
    const ctx = this.ctx;
    const len = Math.floor(seconds * ctx.sampleRate);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    const pre = Math.floor(0.012 * ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = pre; i < len; i++) {
        const p = (i - pre) / (len - pre);
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - p, 3.2) * (1 - 0.6 * p);
      }
    }
    return buf;
  }

  rhythm(pattern: string[], i: number, t: number) {
    const n = pattern[i];
    if (n === '-' || n === '=') return;
    if (n === 'm') return this.chord('E2', t, STEP * 0.85, true);
    let len = 1;
    while (pattern[i + len] === '=') len++;
    this.chord(n, t, STEP * len - 0.012, false);
  }

  /** A power chord (root, fifth, octave) on both guitars, plus the bass note. */
  chord(root: string, t: number, dur: number, muted: boolean) {
    const ctx = this.ctx;
    const f = noteFreq(root);
    for (const amp of this.amps) {
      const at = t + amp.delay;
      // Picking: muted notes are dark and short, open chords bright and ringing.
      const pick = ctx.createBiquadFilter();
      pick.type = 'lowpass';
      pick.frequency.setValueAtTime(muted ? 1100 : 4000, at);
      pick.frequency.exponentialRampToValueAtTime(muted ? 500 : 1800, at + (muted ? 0.08 : 0.6));
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, at);
      env.gain.linearRampToValueAtTime(1, at + 0.003);
      env.gain.setTargetAtTime(muted ? 0.35 : 0.8, at + 0.01, muted ? 0.025 : 0.4);
      env.gain.setValueAtTime(muted ? 0.35 : 0.8, at + dur);
      env.gain.linearRampToValueAtTime(0, at + dur + 0.03);
      pick.connect(env).connect(amp.input);
      for (const [mult, gain] of [
        [1, 1],
        [1.4983, 0.8],
        [2, muted ? 0.3 : 0.55],
      ]) {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = f * mult;
        osc.detune.value = amp.detune + (Math.random() - 0.5) * 4;
        const g = ctx.createGain();
        g.gain.value = gain;
        osc.connect(g).connect(pick);
        osc.start(at);
        osc.stop(at + dur + 0.05);
      }
    }
    // The bass doubles the root an octave down.
    const bass = ctx.createOscillator();
    bass.type = 'sawtooth';
    bass.frequency.value = f / 2;
    const sub = ctx.createOscillator();
    sub.type = 'triangle';
    sub.frequency.value = f / 2;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(1, t + 0.004);
    env.gain.setTargetAtTime(0.6, t + 0.01, muted ? 0.05 : 0.3);
    env.gain.setValueAtTime(0.6, t + dur);
    env.gain.linearRampToValueAtTime(0, t + dur + 0.03);
    bass.connect(env);
    sub.connect(env);
    env.connect(this.bassIn);
    for (const o of [bass, sub]) {
      o.start(t);
      o.stop(t + dur + 0.05);
    }
  }

  lead(pattern: string[], i: number, t: number) {
    const n = pattern[i];
    if (n === '-' || n === '=') return;
    let len = 1;
    while (pattern[i + len] === '=') len++;
    const dur = STEP * len - 0.01;
    const f = noteFreq(n);
    const ctx = this.ctx;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.7, t + 0.006);
    env.gain.setTargetAtTime(0.5, t + 0.02, 0.2);
    env.gain.setValueAtTime(0.5, t + dur);
    env.gain.linearRampToValueAtTime(0, t + dur + 0.06);
    env.connect(this.leadIn);
    // Pick slide into the note, then a wide vibrato on long ones.
    for (const [type, detune] of [
      ['sawtooth', -4],
      ['square', 5],
    ] as [OscillatorType, number][]) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.detune.value = detune;
      osc.frequency.setValueAtTime(f * 0.94, t);
      osc.frequency.exponentialRampToValueAtTime(f, t + 0.05);
      if (len >= 6) {
        const lfo = ctx.createOscillator();
        const depth = ctx.createGain();
        lfo.frequency.value = 5.5;
        depth.gain.setValueAtTime(0, t);
        depth.gain.linearRampToValueAtTime(f * 0.022, t + 0.35);
        lfo.connect(depth).connect(osc.frequency);
        lfo.start(t);
        lfo.stop(t + dur + 0.07);
      }
      osc.connect(env);
      osc.start(t);
      osc.stop(t + dur + 0.07);
    }
  }

  drum(d: string, t: number) {
    const ctx = this.ctx;
    if (d === 'k') {
      // Kick: a pitch-dropping body plus the beater click that phones can play.
      const osc = ctx.createOscillator();
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(52, t + 0.1);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.55, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.connect(env).connect(this.drums);
      osc.start(t);
      osc.stop(t + 0.34);
      this.noiseHit(t, 'bandpass', 3200, 0.5, 0.015, 0);
      return;
    }
    if (d === 's') {
      // Snare: the drum's tone, the rattle of the wires and the room.
      const body = ctx.createOscillator();
      body.type = 'triangle';
      body.frequency.setValueAtTime(230, t);
      body.frequency.exponentialRampToValueAtTime(170, t + 0.06);
      const env = ctx.createGain();
      env.gain.setValueAtTime(0.7, t);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      body.connect(env).connect(this.drums);
      body.start(t);
      body.stop(t + 0.16);
      this.noiseHit(t, 'highpass', 1500, 0.8, 0.22, 0.6);
      this.noiseHit(t, 'bandpass', 4500, 0.4, 0.08, 0.2);
      return;
    }
    if (d === 'h') return this.metallic(t, 0.18, 0.05, 0.3);
    if (d === 'c') {
      this.metallic(t, 0.35, 1.8, -0.3);
      this.noiseHit(t, 'highpass', 5000, 0.4, 1.4, 0.5);
    }
  }

  /** Cymbals: six detuned square waves at odd ratios ring like metal. */
  private metallic(t: number, gain: number, decay: number, pan: number) {
    const ctx = this.ctx;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 9500;
    band.Q.value = 0.7;
    const high = ctx.createBiquadFilter();
    high.type = 'highpass';
    high.frequency.value = 6500;
    const env = ctx.createGain();
    env.gain.setValueAtTime(gain, t);
    env.gain.exponentialRampToValueAtTime(0.001, t + decay);
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    band.connect(high).connect(env).connect(panner).connect(this.drums);
    for (const r of [2, 3, 4.16, 5.43, 6.79, 8.21]) {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 40 * r * 1.7;
      osc.connect(band);
      osc.start(t);
      osc.stop(t + decay + 0.02);
    }
  }

  private noiseHit(t: number, type: BiquadFilterType, freq: number, gain: number, decay: number, room: number) {
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
    src.connect(filter).connect(env).connect(this.drums);
    if (room > 0) {
      const send = ctx.createGain();
      send.gain.value = room;
      env.connect(send).connect(this.reverb);
    }
    src.start(t, Math.random() * 0.5);
    src.stop(t + decay + 0.02);
  }
}

function peaking(ctx: BaseAudioContext, freq: number, q: number, gain: number) {
  const f = ctx.createBiquadFilter();
  f.type = 'peaking';
  f.frequency.value = freq;
  f.Q.value = q;
  f.gain.value = gain;
  return f;
}

let tube: Float32Array | null = null;
/** A soft, slightly lopsided clipping curve, like a tube amp driven hard. */
function tubeCurve(): Float32Array {
  if (tube) return tube;
  tube = new Float32Array(4096);
  for (let i = 0; i < tube.length; i++) {
    const x = (i / (tube.length - 1)) * 2 - 1;
    tube[i] = x >= 0 ? Math.tanh(x * 1.2) : Math.tanh(x * 1.6) * 0.85;
  }
  return tube;
}

/**
 * Renders the music: `loop` = the riff as heard through the wall in front of
 * the door (8 bars, muffled, loops seamlessly), otherwise the whole intro.
 */
export async function renderMetal(sampleRate: number, loop: boolean): Promise<AudioBuffer> {
  const buf = await render(sampleRate, loop);
  return loop ? throughTheWall(buf) : buf;
}

/** Only the low end gets through the wall; rendered over two passes so the loop stays seamless. */
async function throughTheWall(loop: AudioBuffer): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, loop.length * 2, loop.sampleRate);
  const src = ctx.createBufferSource();
  src.buffer = loop;
  src.loop = true;
  // Kept up to ~450 Hz, where phone speakers still play something, so it is
  // heard as a muffled band.
  const wall = ctx.createBiquadFilter();
  wall.type = 'lowpass';
  wall.frequency.value = 450;
  wall.Q.value = 0.8;
  const wall2 = ctx.createBiquadFilter();
  wall2.type = 'lowpass';
  wall2.frequency.value = 650;
  src.connect(wall).connect(wall2).connect(ctx.destination);
  src.start();
  const out = await ctx.startRendering();
  const second = ctx.createBuffer(1, loop.length, loop.sampleRate);
  second.getChannelData(0).set(out.getChannelData(0).subarray(loop.length));
  return normalize(second);
}
