import { isMuted } from './mute';
import { tr, isGerman } from './i18n';

// The time machine's announcer (Marco, 2026-10-14: "Wenn zu irgendeiner Zeit
// gereist wird, sollte eine Roboterstimme sagen: Welcome to the year x").
// The browser's own speech synthesis, pitched down and slowed so it sounds
// like a machine, after a short rising beep-beep (Web Audio). Nothing plays
// while the sound is off (lib/mute). Phones only let a page speak after a
// tap, so the start buttons call unlockSpeech() inside their press.

let ctx: AudioContext | null = null;

/** Called inside a tap (start button, "Set the clock"): lets later speech through on phones. */
export function unlockSpeech() {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  if (!synth) return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    synth.speak(u);
  } catch {
    /* no speech here */
  }
}

/** Two quick computer beeps, rising, before the voice. */
function beep() {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    ctx = ctx ?? new AC();
    const c = ctx;
    c.resume().catch(() => {});
    const t = c.currentTime + 0.02;
    [660, 990].forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'square';
      o.frequency.value = f;
      const at = t + i * 0.16;
      // Every sound starts quietly (docs/DESIGN-SYSTEM.md).
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.07, at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);
      o.connect(g).connect(c.destination);
      o.start(at);
      o.stop(at + 0.14);
    });
  } catch {
    /* no Web Audio */
  }
}

export function yearPhrase(year: number): string {
  return tr(`Welcome to the year ${year}`, `Willkommen im Jahr ${year}`);
}

/** "Welcome to the year 1975" in a robot voice (silent when muted). */
export function announceYear(year: number) {
  announce(yearPhrase(year));
}

/**
 * At the start of the app, out of the time machine, the voice only says
 * "Welcome back" (Marco, 2026-10-14: "Die Roboterstimme am Anfang der App
 * soll sagen welcome back und mehr nicht").
 */
export function announceWelcomeBack() {
  announce(tr('Welcome back', 'Willkommen zurück'));
}

function announce(text: string) {
  if (isMuted()) return;
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  beep();
  if (!synth) return;
  const lang = isGerman ? 'de' : 'en';
  let done = false;
  const speak = () => {
    if (done || isMuted()) return;
    done = true;
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'de' ? 'de-DE' : 'en-US';
      u.pitch = 0.1;
      u.rate = 0.82;
      u.volume = 0.9;
      const voices = synth.getVoices();
      const voice = voices.find((v) => v.lang.toLowerCase().startsWith(lang));
      if (voice) u.voice = voice;
      synth.speak(u);
    } catch {
      /* speech unsupported: the big text still says it */
    }
  };
  // After the beeps; voices may still be loading on the first call.
  window.setTimeout(() => {
    if (synth.getVoices().length) speak();
    else {
      synth.addEventListener('voiceschanged', speak, { once: true });
      window.setTimeout(speak, 600);
    }
  }, 380);
}
