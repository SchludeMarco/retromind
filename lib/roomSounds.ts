import { isMuted } from './mute';

// Little sounds of the living room (components/LivingRoom.tsx): the cat
// purrs, the stove crackles, the lamp clicks and the old TV hisses as it
// warms up. All synthesized with Web Audio, kept in the mids so phone
// speakers carry them (a real purr at 25 Hz would be inaudible there), and
// silent while sound is switched off (lib/mute.ts). Phones that can buzz
// give a short tap on the hand with every touch of the room.

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (isMuted()) return null;
  try {
    if (!ctx || ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      ctx = AudioCtx ? new AudioCtx() : null;
    }
    if (ctx?.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
  return ctx;
}

function noise(c: AudioContext, seconds: number): AudioBufferSourceNode {
  const length = Math.max(1, Math.floor(c.sampleRate * seconds));
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  return src;
}

/** A short buzz in the hand, where the phone can do that. */
export function tapFeel(ms = 12) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* not supported */
  }
}

/** The cat purrs: a band of noise, pulsing 24 times a second. */
export function playPurr() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const src = noise(c, 2);
  const band = c.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 420;
  band.Q.value = 1.4;
  const pulse = c.createGain();
  pulse.gain.value = 0;
  const lfo = c.createOscillator();
  lfo.frequency.value = 24;
  const lfoDepth = c.createGain();
  lfoDepth.gain.value = 0.5;
  lfo.connect(lfoDepth).connect(pulse.gain);
  const out = c.createGain();
  out.gain.setValueAtTime(0, t);
  out.gain.linearRampToValueAtTime(0.9, t + 0.25);
  out.gain.setValueAtTime(0.9, t + 1.4);
  out.gain.linearRampToValueAtTime(0, t + 1.9);
  src.connect(band).connect(pulse).connect(out).connect(c.destination);
  const bias = c.createConstantSource();
  bias.offset.value = 0.5;
  bias.connect(pulse.gain);
  [src, lfo, bias].forEach((n) => {
    n.start(t);
    n.stop(t + 2);
  });
}

/** Logs crackling in the stove: short bright clicks over a soft hiss. */
export function playCrackle() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const hiss = noise(c, 2.2);
  const hissFilter = c.createBiquadFilter();
  hissFilter.type = 'highpass';
  hissFilter.frequency.value = 1500;
  const hissGain = c.createGain();
  hissGain.gain.setValueAtTime(0, t);
  hissGain.gain.linearRampToValueAtTime(0.06, t + 0.3);
  hissGain.gain.linearRampToValueAtTime(0, t + 2.2);
  hiss.connect(hissFilter).connect(hissGain).connect(c.destination);
  hiss.start(t);
  hiss.stop(t + 2.2);
  for (let i = 0; i < 16; i++) {
    const at = t + Math.random() * 2;
    const pop = noise(c, 0.03);
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 1800 + Math.random() * 3000;
    const g = c.createGain();
    const level = 0.3 + Math.random() * 0.6;
    g.gain.setValueAtTime(level, at);
    g.gain.exponentialRampToValueAtTime(0.001, at + 0.03);
    pop.connect(f).connect(g).connect(c.destination);
    pop.start(at);
    pop.stop(at + 0.04);
  }
}

/** The lamp's pull-chain switch. */
export function playClick() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const src = noise(c, 0.05);
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 2600;
  const g = c.createGain();
  g.gain.setValueAtTime(0.8, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  src.connect(f).connect(g).connect(c.destination);
  src.start(t);
  src.stop(t + 0.06);
}

/** The old tube TV warming up: a thump, a high whine and a little static. */
export function playTvOn() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime;
  const thump = c.createOscillator();
  thump.frequency.setValueAtTime(220, t);
  thump.frequency.exponentialRampToValueAtTime(110, t + 0.15);
  const tg = c.createGain();
  tg.gain.setValueAtTime(0.5, t);
  tg.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
  thump.connect(tg).connect(c.destination);
  thump.start(t);
  thump.stop(t + 0.22);
  const whine = c.createOscillator();
  whine.frequency.value = 7800;
  const wg = c.createGain();
  wg.gain.setValueAtTime(0, t);
  wg.gain.linearRampToValueAtTime(0.02, t + 0.1);
  wg.gain.linearRampToValueAtTime(0, t + 0.9);
  whine.connect(wg).connect(c.destination);
  whine.start(t);
  whine.stop(t + 0.9);
  const hiss = noise(c, 0.7);
  const hg = c.createGain();
  hg.gain.setValueAtTime(0.12, t + 0.05);
  hg.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
  hiss.connect(hg).connect(c.destination);
  hiss.start(t + 0.05);
  hiss.stop(t + 0.75);
}

// The burning stove keeps crackling quietly for as long as it burns (Marco,
// 2026-10-13: "Wenn der Ofen an ist soll man das auch hören"): a soft hiss
// with a crackle now and then and a louder snap every few seconds, scheduled
// a little ahead. Browsers only allow sound after a first tap or key press,
// so until then the fire burns silently and joins in with that first touch.
let fireTimer: number | null = null;
let fireHiss: { src: AudioBufferSourceNode; gain: GainNode } | null = null;
let fireNext = 0;
let unlockListening = false;

function firePop(c: AudioContext, at: number, loud: boolean) {
  const pop = noise(c, 0.04);
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = (loud ? 1200 : 2200) + Math.random() * 2600;
  const g = c.createGain();
  const level = loud ? 0.18 + Math.random() * 0.14 : 0.04 + Math.random() * 0.06;
  g.gain.setValueAtTime(level, at);
  g.gain.exponentialRampToValueAtTime(0.001, at + (loud ? 0.04 : 0.02));
  pop.connect(f).connect(g).connect(c.destination);
  pop.start(at);
  pop.stop(at + 0.05);
}

function fireTick() {
  const c = audio();
  if (!c || c.state !== 'running') return;
  if (!fireHiss) {
    const src = noise(c, 3);
    src.loop = true;
    const lp = c.createBiquadFilter();
    lp.type = 'bandpass';
    lp.frequency.value = 900;
    lp.Q.value = 0.4;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.025, c.currentTime + 1.5);
    src.connect(lp).connect(gain).connect(c.destination);
    src.start();
    fireHiss = { src, gain };
    fireNext = c.currentTime;
  }
  // Schedule the next half second of crackles.
  const until = c.currentTime + 0.6;
  if (fireNext < c.currentTime) fireNext = c.currentTime;
  while (fireNext < until) {
    const loud = Math.random() < 0.08;
    firePop(c, fireNext, loud);
    // Little crackles come in clusters, with quiet gaps between.
    fireNext += Math.random() < 0.3 ? 0.03 + Math.random() * 0.08 : 0.2 + Math.random() * 0.9;
  }
}

function unlock() {
  const c = audio();
  if (c?.state === 'suspended') void c.resume();
}

/** Starts or stops the stove's crackling; stays silent while sound is off. */
export function setFireSound(on: boolean) {
  if (on && !isMuted()) {
    if (!unlockListening) {
      unlockListening = true;
      window.addEventListener('pointerdown', unlock, { capture: true });
      window.addEventListener('keydown', unlock, { capture: true });
    }
    if (fireTimer === null) {
      fireTimer = window.setInterval(fireTick, 400);
      fireTick();
    }
    return;
  }
  if (fireTimer !== null) {
    window.clearInterval(fireTimer);
    fireTimer = null;
  }
  if (fireHiss && ctx) {
    const { src, gain } = fireHiss;
    const t = ctx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(gain.gain.value, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.4);
    src.stop(t + 0.45);
  }
  fireHiss = null;
  if (unlockListening) {
    unlockListening = false;
    window.removeEventListener('pointerdown', unlock, { capture: true });
    window.removeEventListener('keydown', unlock, { capture: true });
  }
}
