import { isMuted } from './mute';

// Christmas sounds (Marco, 2026-10-14: "Während der Weihnachtszeit sollten
// viele kleine blinkende Lichter leuchten und ein entsprechender Ton
// abgespielt werden. Vereinzelt auch manchmal 'Ho Ho Ho'"). Now and then a
// short, quiet jingle: sleigh bells shaking under the first notes of
// "Jingle Bells" on a glockenspiel, and every few jingles Santa's deep
// "Ho ho ho". Synthesized with Web Audio and the browser's speech, silent
// while the sound is off (lib/mute.ts). components/ChristmasDeco.tsx
// decides when.

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (isMuted()) return null;
  try {
    if (!ctx || ctx.state === 'closed') {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      ctx = AC ? new AC() : null;
    }
    if (ctx?.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
  return ctx;
}

/** One glockenspiel note: a bright sine with a quick ring-out. */
function bell(c: AudioContext, out: AudioNode, freq: number, at: number) {
  [1, 2.76, 5.4].forEach((ratio, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.value = freq * ratio;
    const peak = [0.5, 0.18, 0.06][i];
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(peak, at + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 1.1 / (i + 1));
    o.connect(g).connect(out);
    o.start(at);
    o.stop(at + 1.2);
  });
}

/** A shake of sleigh bells: a tiny burst of high, ringing noise. */
function shake(c: AudioContext, out: AudioNode, at: number, loud = 1) {
  const len = Math.floor(c.sampleRate * 0.12);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const band = c.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 6500;
  band.Q.value = 6;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(0.9 * loud, at + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.11);
  src.connect(band).connect(g).connect(out);
  src.start(at);
  src.stop(at + 0.12);
}

// E E E · E E E · E G C D E (in the high register of a glockenspiel)
const E = 1318.5, G = 1568, C = 1046.5, D = 1174.7;
const TUNE: [number, number][] = [
  [E, 0], [E, 0.22], [E, 0.44],
  [E, 0.88], [E, 1.1], [E, 1.32],
  [E, 1.76], [G, 1.98], [C, 2.2], [D, 2.42], [E, 2.64],
];

/** About three seconds of sleigh bells and "Jingle Bells", quietly. */
export function playJingle() {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + 0.05;
  const out = c.createGain();
  // Never sudden: the jingle swells in over its first second.
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(0.09, t + 1);
  out.gain.setValueAtTime(0.09, t + 3);
  out.gain.exponentialRampToValueAtTime(0.0001, t + 4);
  out.connect(c.destination);
  for (let i = 0; i < 16; i++) shake(c, out, t + i * 0.22 + (i % 2) * 0.03, i % 4 === 0 ? 1 : 0.55);
  TUNE.forEach(([f, at]) => bell(c, out, f, t + at));
}

/** Santa's deep "Ho ho ho" in the browser's own voice. */
export function playHoHoHo() {
  if (isMuted()) return;
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  // Never over the time machine's announcer.
  if (!synth || synth.speaking) return;
  try {
    const u = new SpeechSynthesisUtterance('Ho, ho, ho!');
    u.lang = 'en-US';
    u.pitch = 0.1;
    u.rate = 0.75;
    u.volume = 0.8;
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith('en'));
    if (voice) u.voice = voice;
    synth.speak(u);
  } catch {
    /* no speech here */
  }
}
