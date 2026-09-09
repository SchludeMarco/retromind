// Synthesized retro UI sound effects, built with the Web Audio API instead of
// audio files so every "click" actually sounds like the time machine the app
// is themed around — a spark of a lever engaging, or the machine winding up
// and clunking into place for a screen change. Waveforms stick to the app's
// 8-bit identity: square for melodic/lead tones, triangle for bass, noise
// for crackle/percussion — the classic chiptune channel roles.
export type SfxType = 'click' | 'transition' | 'success';

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  const AudioCtx = typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext);
  if (!AudioCtx) return null;
  if (!sharedCtx) sharedCtx = new AudioCtx();
  if (sharedCtx.state === 'suspended') sharedCtx.resume().catch(() => {});
  return sharedCtx;
}

function createNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * durationSec)), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

// A quick electric spark — the lever of the time machine engaging. Used for
// every ordinary button press, so it has to stay short and snappy.
function playClick(ctx: AudioContext, peakGain: number) {
  const now = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(peakGain, now + 0.015);
  master.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  master.connect(ctx.destination);

  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(760, now + 0.05);
  osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 900;
  filter.Q.value = 6;

  osc.connect(filter);
  filter.connect(master);
  osc.start(now);
  osc.stop(now + 0.16);

  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, 0.05);
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(peakGain * 0.5, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.value = 3000;
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.05);
}

// The machine winding up and clunking into place — played whenever a
// different screen is shown, in sync with the pixelated screen transition.
function playTransition(ctx: AudioContext, peakGain: number) {
  const now = ctx.currentTime;

  const whirGain = ctx.createGain();
  whirGain.gain.setValueAtTime(0, now);
  whirGain.gain.linearRampToValueAtTime(peakGain, now + 0.2);
  whirGain.gain.linearRampToValueAtTime(peakGain * 0.7, now + 0.5);
  whirGain.gain.linearRampToValueAtTime(0, now + 0.6);
  whirGain.connect(ctx.destination);

  const whir = ctx.createOscillator();
  whir.type = 'square';
  whir.frequency.setValueAtTime(70, now);
  whir.frequency.exponentialRampToValueAtTime(260, now + 0.55);

  const wobble = ctx.createOscillator();
  wobble.type = 'sine';
  wobble.frequency.value = 7;
  const wobbleGain = ctx.createGain();
  wobbleGain.gain.value = 18;
  wobble.connect(wobbleGain);
  wobbleGain.connect(whir.frequency);

  const whirFilter = ctx.createBiquadFilter();
  whirFilter.type = 'lowpass';
  whirFilter.frequency.setValueAtTime(400, now);
  whirFilter.frequency.linearRampToValueAtTime(1400, now + 0.55);

  whir.connect(whirFilter);
  whirFilter.connect(whirGain);
  whir.start(now);
  wobble.start(now);
  whir.stop(now + 0.7);
  wobble.stop(now + 0.7);

  // The lever locking into place.
  const clunkTime = now + 0.6;
  const clunkGain = ctx.createGain();
  clunkGain.gain.setValueAtTime(0, clunkTime);
  clunkGain.gain.linearRampToValueAtTime(peakGain * 1.1, clunkTime + 0.01);
  clunkGain.gain.exponentialRampToValueAtTime(0.001, clunkTime + 0.25);
  clunkGain.connect(ctx.destination);

  const clunk = ctx.createOscillator();
  clunk.type = 'triangle';
  clunk.frequency.setValueAtTime(120, clunkTime);
  clunk.frequency.exponentialRampToValueAtTime(45, clunkTime + 0.22);
  clunk.connect(clunkGain);
  clunk.start(clunkTime);
  clunk.stop(clunkTime + 0.25);

  // A short metallic ring right after, like a temporal lock engaging.
  const ringTime = clunkTime + 0.03;
  const ringGain = ctx.createGain();
  ringGain.gain.setValueAtTime(peakGain * 0.35, ringTime);
  ringGain.gain.exponentialRampToValueAtTime(0.001, ringTime + 0.3);
  ringGain.connect(ctx.destination);

  const ring = ctx.createOscillator();
  ring.type = 'square';
  ring.frequency.value = 1200;
  ring.connect(ringGain);
  ring.start(ringTime);
  ring.stop(ringTime + 0.3);
}

// A bright two-note confirmation chime for saves and submits.
function playSuccess(ctx: AudioContext, peakGain: number) {
  const now = ctx.currentTime;
  [520, 780].forEach((freq, i) => {
    const start = now + i * 0.09;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peakGain * 0.7, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
    gain.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3200;

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = freq;
    osc.connect(filter);
    filter.connect(gain);
    osc.start(start);
    osc.stop(start + 0.22);
  });
}

export function playSfx(type: SfxType, volume: number) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const peakGain = Math.min(volume * 5, 0.4);
  if (type === 'click') playClick(ctx, peakGain);
  else if (type === 'transition') playTransition(ctx, peakGain);
  else playSuccess(ctx, peakGain);
}
