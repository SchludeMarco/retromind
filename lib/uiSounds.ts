import { isMuted } from './mute';
import { sharedAudioContext } from './clockSounds';

// The little sounds of the Zeitreise's buttons and pages (Marco, 2026-10-14:
// "Es passiert wirklich nichts … Wo sind die Animationen und die Sounds?").
// They used to be three mp3 files from the web, fetched anew on every tap,
// so the click often came late or not at all. Now they are synthesized with
// Web Audio: they sound the instant a finger lifts, need no download and
// share the page's sound context with the clock (lib/clockSounds).
//
// All of them are short and quiet (Marco finds loud sound unpleasant), sit
// in the mids where phone speakers carry them, vary a little each time so a
// row of taps doesn't sound like a machine gun, and stay silent while sound
// is switched off or the app is in the background (lib/mute.ts).

const TAP_GAIN = 0.16;
const TURN_GAIN = 0.16;
const CHIME_GAIN = 0.09;
const POP_GAIN = 0.1;

// A tap sound already played by the global tap layer (lib/microFx) makes the
// button's own playSFX('click') right after it unnecessary.
const DEDUPE_MS = 500;
let lastTap = 0;

function audio(): AudioContext | null {
  if (isMuted()) return null;
  const c = sharedAudioContext();
  if (!c) return null;
  if (c.state === 'suspended') void c.resume().catch(() => {});
  return c;
}

function noise(c: BaseAudioContext, seconds: number): AudioBufferSourceNode {
  const length = Math.max(1, Math.floor(c.sampleRate * seconds));
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  return src;
}

const vary = (amount: number) => 1 + (Math.random() * 2 - 1) * amount;

/** A soft wooden "tock", like a key of an old typewriter or a radio button. */
export function buildTap(c: BaseAudioContext, dest: AudioNode, at = c.currentTime, level = 1) {
  const pitch = 1250 * vary(0.08);
  const osc = c.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(pitch, at);
  osc.frequency.exponentialRampToValueAtTime(pitch * 0.55, at + 0.05);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(TAP_GAIN * level, at + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.07);
  osc.connect(g).connect(dest);
  osc.start(at);
  osc.stop(at + 0.08);
  // The little click of the key on top.
  const click = noise(c, 0.02);
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 3200 * vary(0.1);
  f.Q.value = 1.2;
  const cg = c.createGain();
  cg.gain.setValueAtTime(TAP_GAIN * 0.7 * level, at);
  cg.gain.exponentialRampToValueAtTime(0.0001, at + 0.018);
  click.connect(f).connect(cg).connect(dest);
  click.start(at);
  click.stop(at + 0.02);
}

/** A page of a photo album turning: a soft paper swish that rises and falls. */
export function buildPageTurn(c: BaseAudioContext, dest: AudioNode, at = c.currentTime) {
  const len = 0.42;
  const src = noise(c, len);
  const f = c.createBiquadFilter();
  f.type = 'bandpass';
  f.Q.value = 0.9;
  f.frequency.setValueAtTime(700, at);
  f.frequency.exponentialRampToValueAtTime(3400 * vary(0.1), at + len * 0.7);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(TURN_GAIN, at + len * 0.45);
  g.gain.exponentialRampToValueAtTime(0.0001, at + len);
  src.connect(f).connect(g).connect(dest);
  src.start(at);
  src.stop(at + len);
  // The page settling: a soft low "flap" at the end.
  const flap = c.createOscillator();
  flap.type = 'sine';
  flap.frequency.setValueAtTime(320, at + len * 0.75);
  flap.frequency.exponentialRampToValueAtTime(180, at + len + 0.06);
  const fg = c.createGain();
  fg.gain.setValueAtTime(0.0001, at + len * 0.75);
  fg.gain.exponentialRampToValueAtTime(TURN_GAIN * 0.8, at + len * 0.8);
  fg.gain.exponentialRampToValueAtTime(0.0001, at + len + 0.08);
  flap.connect(fg).connect(dest);
  flap.start(at + len * 0.75);
  flap.stop(at + len + 0.1);
}

/** Something worked (a memory saved): two bright notes, like a little music box. */
export function buildChime(c: BaseAudioContext, dest: AudioNode, at = c.currentTime) {
  [
    [880, 0],
    [1318.5, 0.11],
    [1760, 0.22],
  ].forEach(([freq, delay]) => {
    const t = at + delay;
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    // A quiet overtone makes it a music-box tine instead of a test tone.
    const over = c.createOscillator();
    over.type = 'sine';
    over.frequency.value = freq * 3;
    const og = c.createGain();
    og.gain.value = 0.12;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(CHIME_GAIN, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    osc.connect(g);
    over.connect(og).connect(g);
    g.connect(dest);
    [osc, over].forEach((o) => {
      o.start(t);
      o.stop(t + 0.95);
    });
  });
}

/** A window or card opening: a small rising "blop". */
export function buildPop(c: BaseAudioContext, dest: AudioNode, at = c.currentTime) {
  const osc = c.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(420 * vary(0.06), at);
  osc.frequency.exponentialRampToValueAtTime(980, at + 0.09);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(POP_GAIN, at + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.14);
  osc.connect(g).connect(dest);
  osc.start(at);
  osc.stop(at + 0.15);
}

/** The tap of a button. Skipped when the tap layer has just played one for the same touch. */
export function playTap(fromTapLayer = false) {
  const now = performance.now();
  if (!fromTapLayer && now - lastTap < DEDUPE_MS) return;
  if (fromTapLayer) lastTap = now;
  const c = audio();
  if (!c) return;
  buildTap(c, c.destination);
}

export function playPageTurn() {
  const c = audio();
  if (c) buildPageTurn(c, c.destination);
}

export function playChime() {
  const c = audio();
  if (c) buildChime(c, c.destination);
}

export function playPop() {
  const c = audio();
  if (c) buildPop(c, c.destination);
}

export type UiSound = 'click' | 'transition' | 'success' | 'pop';

/** One entry point for the app's UI sounds (hooks/useAudioPlayer). */
export function playUiSound(type: UiSound) {
  if (type === 'click') playTap();
  else if (type === 'transition') playPageTurn();
  else if (type === 'success') playChime();
  else playPop();
}
