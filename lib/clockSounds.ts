import { isMuted, subscribeMuted } from './mute';
import { unlockSpeech } from './robotVoice';
import { riseFromSilence, whenRunning } from './startupFade';

// Sounds of the welcome screen (components/SplashScreen.tsx): the mantel
// clock's steady "tick … tock" while the screen waits, and the big gong when
// the visitor presses start. Both are synthesized with Web Audio, so they
// need no asset and always match the picture's timing.
//
// Browsers (Chrome first of all) keep a page silent until it has seen a tap,
// click or key. The clock therefore starts ticking at once where that is
// allowed, and otherwise from the first touch anywhere on the screen;
// startTicking reports whether it is still waiting for that touch so the
// screen can say so. On phones only the end of a tap (touchend / pointerup /
// click) counts as that permission, a finger merely touching down does not,
// so the clock listens for those too. iPhones also silence Web Audio with
// the ring/silent switch unless the page asks for "playback" audio. Everything checks lib/mute.ts, so the clock is silent
// when sound is switched off or the app is in the background.

const BEAT_MS = 500;
const TICK_GAIN = 0.75;
const GONG_GAIN = 1.3;
const GONG_SECONDS = 7;

let ctx: AudioContext | null = null;
// Everything of the welcome screen goes through this bus, which rises from
// silence over the first seconds the page really sounds (lib/startupFade).
let bus: GainNode | null = null;

/** The page's sound context, unlocked by the start button's tap (phones only play sound after one). */
export function sharedAudioContext(): AudioContext | null {
  return audioContext();
}

function audioContext(): AudioContext | null {
  if (ctx && ctx.state !== 'closed') return ctx;
  try {
    // Safari 16.4+: play even with the iPhone's silent switch on, like the
    // Spotify music does.
    const session = (navigator as any).audioSession;
    if (session && session.type !== 'playback') session.type = 'playback';
  } catch {
    /* not supported */
  }
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    ctx = AudioCtx ? new AudioCtx() : null;
  } catch {
    ctx = null;
  }
  if (ctx) {
    const c = ctx;
    bus = c.createGain();
    bus.gain.value = 0;
    bus.connect(c.destination);
    whenRunning(c, () => bus && riseFromSilence(bus.gain, c, 1));
  }
  return ctx;
}

function noiseBuffer(c: BaseAudioContext, seconds: number): AudioBuffer {
  const length = Math.max(1, Math.floor(c.sampleRate * seconds));
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

// The click's noise is made once (from a fixed seed) and reused, so every
// tick has the same, measured peak and the louder tick never clips.
const clickBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();
function clickBuffer(c: BaseAudioContext): AudioBuffer {
  let buffer = clickBuffers.get(c);
  if (buffer) return buffer;
  const length = Math.max(1, Math.floor(c.sampleRate * 0.04));
  buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  let seed = 12345;
  for (let i = 0; i < length; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    data[i] = (seed / 0x3fffffff) - 1;
  }
  clickBuffers.set(c, buffer);
  return buffer;
}

let softClip: Float32Array | null = null;
function softClipCurve(): Float32Array {
  if (softClip) return softClip;
  const n = 1024;
  softClip = new Float32Array(n);
  for (let i = 0; i < n; i++) softClip[i] = Math.tanh(((i / (n - 1)) * 2 - 1) * 2) / Math.tanh(2) * 0.95;
  return softClip;
}

// One beat of the escapement: a sharp click through a band-pass, then the
// short knock of the wooden case and a ring of the metal. "Tick" sits a
// little higher than "tock". Kept in the mids (roughly 700 Hz to 3 kHz),
// because phone and laptop speakers hardly play anything lower.
export function playBeat(c: BaseAudioContext, high: boolean, dest: AudioNode = c.destination, at = c.currentTime) {
  const now = at;
  const out = c.createGain();
  out.gain.value = TICK_GAIN;
  // Gentle tape-style saturation: makes the tick louder without ever
  // going past full scale (no hard clipping).
  const shaper = c.createWaveShaper();
  shaper.curve = softClipCurve();
  out.connect(shaper).connect(dest);

  const click = c.createBufferSource();
  click.buffer = clickBuffer(c);
  const band = c.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = high ? 2600 : 1900;
  band.Q.value = 1.5;
  const clickGain = c.createGain();
  clickGain.gain.setValueAtTime(0.7, now);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
  click.connect(band).connect(clickGain).connect(out);
  click.start(now);

  const tones = [
    { type: 'triangle' as OscillatorType, freq: high ? 1100 : 820, amp: 0.9, decay: 0.1 },
    { type: 'sine' as OscillatorType, freq: high ? 2350 : 1750, amp: 0.45, decay: 0.07 },
  ];
  tones.forEach((t) => {
    const osc = c.createOscillator();
    osc.type = t.type;
    osc.frequency.value = t.freq;
    const g = c.createGain();
    g.gain.setValueAtTime(t.amp, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + t.decay);
    osc.connect(g).connect(out);
    osc.start(now);
    osc.stop(now + t.decay + 0.02);
  });
}

/**
 * Starts the clock's tick-tock. onWaiting(true) means the browser still
 * holds sound back until the first touch; onWaiting(false) once it plays.
 * onBeat fires with every audible tick, so the screen can show it too.
 * Returns the function that stops the clock.
 */
export function startTicking(onWaiting: (waiting: boolean) => void, onBeat?: () => void): () => void {
  const c = audioContext();
  if (!c) return () => {};

  let high = true;
  const beat = () => {
    if (isMuted() || c.state !== 'running') return;
    playBeat(c, high, bus ?? c.destination);
    high = !high;
    onBeat?.();
  };
  const timer = window.setInterval(beat, BEAT_MS);

  let wasRunning = c.state === 'running';
  const report = () => {
    const running = c.state === 'running';
    // Unlocked just now by a tap: tick at once so the tap gets an answer.
    if (running && !wasRunning) beat();
    wasRunning = running;
    onWaiting(!running);
  };
  c.addEventListener('statechange', report);
  c.resume().catch(() => {}).finally(report);
  report();

  const unlock = () => {
    c.resume().catch(() => {});
  };
  const events = ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'click', 'keydown'] as const;
  events.forEach((e) => window.addEventListener(e, unlock, { capture: true }));

  return () => {
    window.clearInterval(timer);
    c.removeEventListener('statechange', report);
    events.forEach((e) => window.removeEventListener(e, unlock, { capture: true }));
  };
}

/**
 * The big gong for the start button: a mallet strike, a body of inharmonic
 * partials that bloom and ring out over several seconds, and a bright
 * metallic shimmer on top. Pitched so that most of it sits between 200 Hz
 * and 3 kHz, where phone and laptop speakers are loud (a "real" deep gong
 * around 80 Hz is simply inaudible on them). It keeps ringing into the app
 * and fades out at once if sound is switched off or the app goes to the
 * background.
 */
export function playGong() {
  if (isMuted()) return;
  const c = audioContext();
  if (!c) return;
  c.resume().catch(() => {});
  const master = buildGong(c, bus ?? c.destination);

  const unsubscribe = subscribeMuted(() => {
    if (!isMuted()) return;
    const t = c.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.15);
  });
  window.setTimeout(() => {
    unsubscribe();
    master.disconnect();
  }, (GONG_SECONDS + 1.5) * 1000);
}

/** Wires one gong stroke into `dest`; returns its master gain. */
export function buildGong(c: BaseAudioContext, dest: AudioNode): GainNode {
  const now = c.currentTime;

  // master -> limiter -> makeup gain: loud, but the summed partials never clip.
  const master = c.createGain();
  master.gain.value = 1;
  const limiter = c.createDynamicsCompressor();
  limiter.threshold.value = -20;
  limiter.knee.value = 6;
  limiter.ratio.value = 12;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.4;
  const makeup = c.createGain();
  makeup.gain.value = GONG_GAIN;
  master.connect(limiter).connect(makeup).connect(dest);

  const base = 175;
  const partials = [
    { ratio: 1, amp: 0.5, decay: GONG_SECONDS, bloom: 0 },
    { ratio: 1.48, amp: 0.4, decay: 6, bloom: 0 },
    { ratio: 2.02, amp: 0.36, decay: 5.5, bloom: 0.12 },
    { ratio: 2.74, amp: 0.32, decay: 5, bloom: 0.3 },
    { ratio: 3.37, amp: 0.28, decay: 4.5, bloom: 0.45 },
    { ratio: 4.21, amp: 0.24, decay: 4, bloom: 0.6 },
    { ratio: 5.43, amp: 0.2, decay: 3.4, bloom: 0.8 },
    { ratio: 6.79, amp: 0.15, decay: 2.8, bloom: 1 },
    { ratio: 8.6, amp: 0.1, decay: 2.2, bloom: 1.2 },
    { ratio: 11.3, amp: 0.07, decay: 1.6, bloom: 1.4 },
  ];
  partials.forEach((p) => {
    // Two slightly detuned voices per partial give the slow shimmer.
    [1, 1.005].forEach((detune, voice) => {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = base * p.ratio * detune;
      const g = c.createGain();
      const peak = p.amp * (voice ? 0.7 : 1);
      g.gain.setValueAtTime(0.0001, now);
      if (p.bloom) {
        g.gain.linearRampToValueAtTime(peak * 0.4, now + 0.01);
        g.gain.linearRampToValueAtTime(peak, now + p.bloom);
      } else {
        g.gain.linearRampToValueAtTime(peak, now + 0.008);
      }
      g.gain.exponentialRampToValueAtTime(0.0001, now + p.bloom + p.decay);
      osc.connect(g).connect(master);
      osc.start(now);
      osc.stop(now + p.bloom + p.decay + 0.05);
    });
  });

  // The mallet hitting metal: a short burst of noise in the mids.
  const strike = c.createBufferSource();
  strike.buffer = noiseBuffer(c, 0.35);
  const strikeFilter = c.createBiquadFilter();
  strikeFilter.type = 'bandpass';
  strikeFilter.frequency.value = 700;
  strikeFilter.Q.value = 0.8;
  const strikeGain = c.createGain();
  strikeGain.gain.setValueAtTime(1.4, now);
  strikeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
  strike.connect(strikeFilter).connect(strikeGain).connect(master);
  strike.start(now);

  // The metallic wash that swells after the hit, like a tam-tam.
  const wash = c.createBufferSource();
  wash.buffer = noiseBuffer(c, 4);
  const washFilter = c.createBiquadFilter();
  washFilter.type = 'bandpass';
  washFilter.frequency.value = 2800;
  washFilter.Q.value = 1.2;
  const washGain = c.createGain();
  washGain.gain.setValueAtTime(0.0001, now);
  washGain.gain.linearRampToValueAtTime(0.18, now + 0.6);
  washGain.gain.exponentialRampToValueAtTime(0.0001, now + 4);
  wash.connect(washFilter).connect(washGain).connect(master);
  wash.start(now);

  return master;
}

// --- The time machine (Marco, 2026-10-14: "wenn man den Start-Schalter
// drückt, soll man das Gefühl haben, dass einen eine Zeitmaschine einsaugt") ---
//
// The press winds the clock up: its ticks race faster and faster into a
// whirr, a rising, wobbling hum and a swelling rush of air pull you in, and
// at the very end the gong strikes as you come out on the other side. It
// all starts quietly and grows (a crescendo, never a blast) and stays in the
// mids for phone speakers, like the clock and the gong.

/** How long the pull lasts before the arrival (the gong, the white light). */
export const WARP_SECONDS = 2.3;

/** Wires one time-machine pull into `dest`, starting now; returns its master gain. */
export function buildWarp(c: BaseAudioContext, dest: AudioNode): GainNode {
  const now = c.currentTime;
  const end = now + WARP_SECONDS;

  const master = c.createGain();
  master.gain.value = 1;
  const limiter = c.createDynamicsCompressor();
  limiter.threshold.value = -9;
  limiter.knee.value = 6;
  limiter.ratio.value = 12;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.25;
  const trim = c.createGain();
  trim.gain.value = 0.85;
  master.connect(limiter).connect(trim).connect(dest);

  // The clock races: every tick comes a little sooner than the last.
  const ticks = c.createGain();
  ticks.gain.setValueAtTime(0.3, now);
  ticks.gain.linearRampToValueAtTime(0.7, end - 0.4);
  ticks.connect(master);
  let t = now;
  let gap = 0.24;
  let high = true;
  while (t < end - 0.35) {
    playBeat(c, high, ticks, t);
    high = !high;
    t += gap;
    gap = Math.max(0.028, gap * 0.84);
  }

  // A rush of air, its colour rising from a low hush to a bright hiss.
  const air = c.createBufferSource();
  air.buffer = noiseBuffer(c, WARP_SECONDS + 0.4);
  const airBand = c.createBiquadFilter();
  airBand.type = 'bandpass';
  airBand.Q.value = 1.3;
  airBand.frequency.setValueAtTime(260, now);
  airBand.frequency.exponentialRampToValueAtTime(2600, end);
  const airGain = c.createGain();
  airGain.gain.setValueAtTime(0.0001, now);
  airGain.gain.exponentialRampToValueAtTime(1.8, end - 0.08);
  airGain.gain.exponentialRampToValueAtTime(0.0001, end + 0.25);
  air.connect(airBand).connect(airGain).connect(master);
  air.start(now);
  air.stop(end + 0.35);

  // The machine's hum: two voices sliding up two octaves, wobbling faster
  // and faster like something spinning up.
  const hum = c.createGain();
  hum.gain.setValueAtTime(0.0001, now);
  hum.gain.exponentialRampToValueAtTime(0.45, end - 0.1);
  hum.gain.exponentialRampToValueAtTime(0.0001, end + 0.2);
  const wobble = c.createGain();
  wobble.gain.value = 0.6;
  const lfo = c.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(3, now);
  lfo.frequency.exponentialRampToValueAtTime(22, end);
  const lfoDepth = c.createGain();
  lfoDepth.gain.value = 0.4;
  lfo.connect(lfoDepth).connect(wobble.gain);
  hum.connect(wobble).connect(master);
  [
    { type: 'triangle' as OscillatorType, from: 196, to: 784, amp: 1 },
    { type: 'triangle' as OscillatorType, from: 199, to: 796, amp: 0.8 },
    { type: 'sine' as OscillatorType, from: 392, to: 1568, amp: 0.35 },
  ].forEach((v) => {
    const osc = c.createOscillator();
    osc.type = v.type;
    osc.frequency.setValueAtTime(v.from, now);
    osc.frequency.exponentialRampToValueAtTime(v.to, end);
    const g = c.createGain();
    g.gain.value = v.amp;
    osc.connect(g).connect(hum);
    osc.start(now);
    osc.stop(end + 0.3);
  });
  lfo.start(now);
  lfo.stop(end + 0.3);

  return master;
}

/**
 * The start button's sound: the time machine pulls you in, and the gong
 * strikes as you arrive (after WARP_SECONDS). The welcome screen's bus may
 * still be rising from silence (lib/startupFade) when someone presses start
 * early; the pull lifts it to at least a gentle level, since this sound is
 * one the visitor asked for, and it still swells up from quiet.
 */
export function playWarp() {
  // The robot voice announces the year after the journey (lib/robotVoice);
  // phones only let it speak if speech was started inside this press.
  unlockSpeech();
  if (isMuted()) return;
  const c = audioContext();
  if (!c) return;
  c.resume().catch(() => {});
  if (bus) {
    const now = c.currentTime;
    const level = bus.gain.value;
    if (level < 0.7) {
      bus.gain.cancelScheduledValues(now);
      bus.gain.setValueAtTime(level, now);
      bus.gain.linearRampToValueAtTime(0.7, now + 1.2);
      bus.gain.linearRampToValueAtTime(1, now + 6);
    }
  }
  const master = buildWarp(c, bus ?? c.destination);
  const unsubscribe = subscribeMuted(() => {
    if (!isMuted()) return;
    const t = c.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.15);
  });
  window.setTimeout(() => {
    unsubscribe();
    master.disconnect();
  }, (WARP_SECONDS + 1) * 1000);
  window.setTimeout(playGong, WARP_SECONDS * 1000);
}

/**
 * Thunder for the lightning on the welcome screen (Marco, 2026-10-18: "Die
 * Blitze soll man auch hören"): a sharp crack, then a rolling rumble that
 * swells and dies away over a few seconds. `distance` 0 is the bolt that
 * strikes the clock (loud, the crack at once), 1 a far one (quieter, the
 * crack later and duller). Synthesized from noise, kept mostly above 120 Hz
 * so phone and laptop speakers still carry it, and played through the
 * welcome screen's bus, so it also rises from silence with the page.
 */
export function playThunder(distance = 0) {
  if (isMuted()) return;
  const c = audioContext();
  if (!c || c.state !== 'running') return;
  const dest = bus ?? c.destination;
  const t = c.currentTime + 0.05 + distance * 0.45;
  const level = 0.85 - distance * 0.45;

  const master = c.createGain();
  master.gain.value = level;
  const shaper = c.createWaveShaper();
  shaper.curve = softClipCurve();
  master.connect(shaper).connect(dest);

  // The crack: bright noise, gone in a flash.
  const crack = c.createBufferSource();
  crack.buffer = noiseBuffer(c, 0.4);
  const crackFilter = c.createBiquadFilter();
  crackFilter.type = 'highpass';
  crackFilter.frequency.value = 900 - distance * 600;
  const crackGain = c.createGain();
  crackGain.gain.setValueAtTime(0.0001, t);
  crackGain.gain.exponentialRampToValueAtTime(0.9 - distance * 0.5, t + 0.008);
  crackGain.gain.exponentialRampToValueAtTime(0.25, t + 0.06);
  crackGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
  crack.connect(crackFilter).connect(crackGain).connect(master);
  crack.start(t);
  crack.stop(t + 0.4);

  // The rumble: dark noise that rolls in a few uneven swells.
  const seconds = 3.2 + distance * 1.2;
  const rumble = c.createBufferSource();
  rumble.buffer = noiseBuffer(c, seconds);
  const low = c.createBiquadFilter();
  low.type = 'lowpass';
  low.frequency.setValueAtTime(900 - distance * 400, t);
  low.frequency.exponentialRampToValueAtTime(260, t + seconds);
  const high = c.createBiquadFilter();
  high.type = 'highpass';
  high.frequency.value = 110;
  const rumbleGain = c.createGain();
  rumbleGain.gain.setValueAtTime(0.0001, t);
  rumbleGain.gain.exponentialRampToValueAtTime(0.9, t + 0.12 + distance * 0.2);
  let at = t + 0.35;
  for (let i = 0; i < 4 && at < t + seconds - 0.6; i++) {
    rumbleGain.gain.exponentialRampToValueAtTime(0.35 + Math.random() * 0.2, at);
    at += 0.25 + Math.random() * 0.35;
    rumbleGain.gain.exponentialRampToValueAtTime(0.7 + Math.random() * 0.3 - i * 0.12, at);
    at += 0.2 + Math.random() * 0.3;
  }
  rumbleGain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  rumble.connect(low).connect(high).connect(rumbleGain).connect(master);
  rumble.start(t);
  rumble.stop(t + seconds);

  const unsubscribe = subscribeMuted(() => {
    if (!isMuted()) return;
    const now = c.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 0.15);
  });
  window.setTimeout(() => {
    unsubscribe();
    master.disconnect();
  }, (seconds + 1.5) * 1000);
}

/** How long the clock takes to turn back on the name form. */
export const REWIND_SECONDS = 1.4;

/**
 * "Set the clock" on the name form: the hands run backwards, the ticks
 * rattle down from a whirr to a stop, and a soft chime marks the arrival.
 */
export function buildRewind(c: BaseAudioContext, dest: AudioNode): GainNode {
  const now = c.currentTime;
  const end = now + REWIND_SECONDS;
  const master = c.createGain();
  master.gain.value = 0.8;
  master.connect(dest);
  let t = now;
  let gap = 0.03;
  let high = false;
  while (t < end - 0.2) {
    playBeat(c, high, master, t);
    high = !high;
    t += gap;
    gap = Math.min(0.2, gap * 1.13);
  }
  // A small bell at the arrival, high and short.
  [1046, 1568, 2093].forEach((f, i) => {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = f;
    const g = c.createGain();
    const at = end - 0.05;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime([0.35, 0.18, 0.08][i], at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 1.6);
    osc.connect(g).connect(master);
    osc.start(now);
    osc.stop(at + 1.7);
  });
  return master;
}

export function playRewind() {
  unlockSpeech();
  if (isMuted()) return;
  const c = audioContext();
  if (!c) return;
  c.resume().catch(() => {});
  const master = buildRewind(c, bus ?? c.destination);
  window.setTimeout(() => master.disconnect(), (REWIND_SECONDS + 2) * 1000);
}
