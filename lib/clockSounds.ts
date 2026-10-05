import { isMuted, subscribeMuted } from './mute';

// Sounds of the welcome screen (components/SplashScreen.tsx): the mantel
// clock's steady "tick … tock" while the screen waits, and the big gong when
// the visitor presses start. Both are synthesized with Web Audio, so they
// need no asset and always match the picture's timing.
//
// Browsers (Chrome first of all) keep a page silent until it has seen a tap,
// click or key. The clock therefore starts ticking at once where that is
// allowed, and otherwise from the first touch anywhere on the screen;
// startTicking reports whether it is still waiting for that touch so the
// screen can say so. Everything checks lib/mute.ts, so the clock is silent
// when sound is switched off or the app is in the background.

const BEAT_MS = 1000;
const TICK_GAIN = 0.22;
const GONG_GAIN = 0.32;
const GONG_SECONDS = 7;

let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (ctx && ctx.state !== 'closed') return ctx;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    ctx = AudioCtx ? new AudioCtx() : null;
  } catch {
    ctx = null;
  }
  return ctx;
}

function noiseBuffer(c: AudioContext, seconds: number): AudioBuffer {
  const length = Math.max(1, Math.floor(c.sampleRate * seconds));
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

// One beat of the escapement: a short wooden click through a band-pass,
// plus a faint ring of the metal. "Tick" sits a little higher than "tock".
function playBeat(c: AudioContext, high: boolean) {
  const now = c.currentTime;
  const out = c.createGain();
  out.gain.setValueAtTime(TICK_GAIN, now);
  out.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
  out.connect(c.destination);

  const click = c.createBufferSource();
  click.buffer = noiseBuffer(c, 0.03);
  const band = c.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = high ? 3400 : 2300;
  band.Q.value = 6;
  click.connect(band).connect(out);
  click.start(now);

  const ring = c.createOscillator();
  ring.type = 'sine';
  ring.frequency.value = high ? 1650 : 1180;
  const ringGain = c.createGain();
  ringGain.gain.setValueAtTime(0.25, now);
  ringGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
  ring.connect(ringGain).connect(out);
  ring.start(now);
  ring.stop(now + 0.06);
}

/**
 * Starts the clock's tick-tock. onWaiting(true) means the browser still
 * holds sound back until the first touch; onWaiting(false) once it plays.
 * Returns the function that stops the clock.
 */
export function startTicking(onWaiting: (waiting: boolean) => void): () => void {
  const c = audioContext();
  if (!c) return () => {};

  let high = true;
  const timer = window.setInterval(() => {
    if (isMuted() || c.state !== 'running') return;
    playBeat(c, high);
    high = !high;
  }, BEAT_MS);

  const report = () => onWaiting(c.state !== 'running');
  c.addEventListener('statechange', report);
  c.resume().catch(() => {}).finally(report);
  report();

  const unlock = () => {
    c.resume().catch(() => {});
  };
  const events = ['pointerdown', 'touchstart', 'keydown'] as const;
  events.forEach((e) => window.addEventListener(e, unlock, { capture: true }));

  return () => {
    window.clearInterval(timer);
    c.removeEventListener('statechange', report);
    events.forEach((e) => window.removeEventListener(e, unlock, { capture: true }));
  };
}

/**
 * The big gong for the start button: a soft mallet thud, a deep body and
 * inharmonic partials that bloom and ring out over several seconds. It keeps
 * ringing into the app and fades out at once if sound is switched off or the
 * app goes to the background.
 */
export function playGong() {
  if (isMuted()) return;
  const c = audioContext();
  if (!c) return;
  c.resume().catch(() => {});
  const now = c.currentTime;

  const master = c.createGain();
  master.gain.setValueAtTime(GONG_GAIN, now);
  // Keeps the summed partials from clipping at the strike.
  const limiter = c.createDynamicsCompressor();
  limiter.threshold.value = -10;
  limiter.ratio.value = 8;
  master.connect(limiter).connect(c.destination);

  // Deep body and its partials; the upper ones swell a moment after the
  // strike, which is what makes a big tam-tam "bloom".
  const base = 82;
  const partials = [
    { ratio: 1, amp: 0.5, decay: GONG_SECONDS, bloom: 0 },
    { ratio: 1.48, amp: 0.32, decay: 5.5, bloom: 0 },
    { ratio: 2.02, amp: 0.26, decay: 4.8, bloom: 0.15 },
    { ratio: 2.74, amp: 0.2, decay: 4, bloom: 0.35 },
    { ratio: 3.37, amp: 0.15, decay: 3.4, bloom: 0.5 },
    { ratio: 4.21, amp: 0.11, decay: 2.8, bloom: 0.7 },
    { ratio: 5.43, amp: 0.08, decay: 2.2, bloom: 0.9 },
    { ratio: 6.79, amp: 0.05, decay: 1.6, bloom: 1.1 },
  ];
  partials.forEach((p) => {
    // Two slightly detuned voices per partial give the slow shimmer.
    [1, 1.004].forEach((detune, voice) => {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = base * p.ratio * detune;
      const g = c.createGain();
      const peak = p.amp * (voice ? 0.6 : 1);
      g.gain.setValueAtTime(0.0001, now);
      if (p.bloom) {
        g.gain.linearRampToValueAtTime(peak * 0.35, now + 0.02);
        g.gain.linearRampToValueAtTime(peak, now + p.bloom);
      } else {
        g.gain.linearRampToValueAtTime(peak, now + 0.015);
      }
      g.gain.exponentialRampToValueAtTime(0.0001, now + p.bloom + p.decay);
      osc.connect(g).connect(master);
      osc.start(now);
      osc.stop(now + p.bloom + p.decay + 0.05);
    });
  });

  // The mallet: a low thump and a short, dark burst of noise.
  const thump = c.createOscillator();
  thump.type = 'sine';
  thump.frequency.setValueAtTime(90, now);
  thump.frequency.exponentialRampToValueAtTime(40, now + 0.3);
  const thumpGain = c.createGain();
  thumpGain.gain.setValueAtTime(0.6, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
  thump.connect(thumpGain).connect(master);
  thump.start(now);
  thump.stop(now + 0.45);

  const strike = c.createBufferSource();
  strike.buffer = noiseBuffer(c, 0.3);
  const strikeFilter = c.createBiquadFilter();
  strikeFilter.type = 'lowpass';
  strikeFilter.frequency.value = 900;
  const strikeGain = c.createGain();
  strikeGain.gain.setValueAtTime(0.35, now);
  strikeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
  strike.connect(strikeFilter).connect(strikeGain).connect(master);
  strike.start(now);

  const unsubscribe = subscribeMuted(() => {
    if (!isMuted()) return;
    const t = c.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(0, t + 0.15);
  });
  window.setTimeout(() => {
    unsubscribe();
    limiter.disconnect();
  }, (GONG_SECONDS + 1.5) * 1000);
}
