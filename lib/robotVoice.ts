import { isMuted } from './mute';
import { tr, isGerman } from './i18n';
import { sharedAudioContext } from './clockSounds';
import { duckMusic } from './musicDuck';

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
  // The recorded "Welcome back" is fetched now, so it is ready on landing.
  loadWelcomeClip();
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
 * At the start of the app, out of the time machine, a voice says only
 * "Welcome back" (Marco, 2026-10-14: "Die Roboterstimme am Anfang der App
 * soll sagen welcome back und mehr nicht").
 * Since 2026-11-25 (Marco: "Die Roboterstimme ist ein bisschen schlecht …
 * man hört sie wegen der Hintergrundmusik gar nicht") it is a recorded,
 * human-sounding voice instead of the robot, and the music steps back
 * while it speaks (lib/musicDuck). The clips are made with free, openly
 * licensed speech models (public/audio/voice/README.md). Without the clip
 * (offline, very old browser) the best voice the device has speaks it, in
 * a normal pitch.
 */
export function announceWelcomeBack(onDone?: () => void) {
  // Called once when the greeting is over (or can't play), so the music
  // can start after it (App.tsx).
  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    onDone?.();
  };
  if (isMuted()) return done();
  const text = tr('Welcome back', 'Willkommen zurück');
  loadWelcomeClip().then((buf) => {
    if (isMuted()) return done();
    const c = sharedAudioContext();
    if (!buf || !c) {
      speakHuman(text, done);
      return;
    }
    c.resume()
      .catch(() => {})
      .then(() => {
        if (c.state !== 'running' || isMuted()) {
          if (c.state !== 'running') speakHuman(text, done);
          else done();
          return;
        }
        // The music goes down first, then the voice; it comes back after.
        duckMusic(DUCK_LEAD_MS + buf.duration * 1000 + 500);
        try {
          const t = c.currentTime + DUCK_LEAD_MS / 1000;
          const g = c.createGain();
          g.gain.value = 1;
          g.connect(c.destination);
          const src = c.createBufferSource();
          src.buffer = buf;
          src.connect(g);
          src.onended = done;
          src.start(t);
          // Safety net, should onended never fire.
          window.setTimeout(done, DUCK_LEAD_MS + buf.duration * 1000 + 1000);
        } catch {
          speakHuman(text, done);
        }
      });
  });
}

// How long the music has to get quieter before the voice starts.
const DUCK_LEAD_MS = 450;

const CLIP_URL = { en: '/audio/voice/welcome-back-en.mp3', de: '/audio/voice/welcome-back-de.mp3' };
let clip: Promise<AudioBuffer | null> | null = null;

function loadWelcomeClip(): Promise<AudioBuffer | null> {
  if (clip) return clip;
  const c = typeof window !== 'undefined' ? sharedAudioContext() : null;
  if (!c) return Promise.resolve(null);
  clip = fetch(isGerman ? CLIP_URL.de : CLIP_URL.en)
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('no clip'))))
    // Older Safari only knows the callback form.
    .then((data) => new Promise<AudioBuffer>((resolve, reject) => c.decodeAudioData(data, resolve, reject)))
    .catch(() => {
      clip = null;
      return null;
    });
  return clip;
}

// Names of the voices that sound most like a person (Edge/Windows "Natural",
// Apple "Premium"/"Enhanced", Chrome's Google voices).
const HUMAN_VOICE = /natural|neural|online|premium|enhanced|siri|google/i;

/** The device's most human voice, normal pitch: the fallback without the clip. */
function speakHuman(text: string, onDone: () => void = () => {}) {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  if (!synth || isMuted()) return onDone();
  const lang = isGerman ? 'de' : 'en';
  const speak = () => {
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'de' ? 'de-DE' : 'en-US';
      u.rate = 0.95;
      u.volume = 1;
      const voices = synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith(lang));
      const voice =
        voices.find((v) => HUMAN_VOICE.test(v.name) && v.lang.toLowerCase().includes(lang === 'de' ? 'de' : 'us')) ??
        voices.find((v) => HUMAN_VOICE.test(v.name)) ??
        voices.find((v) => v.default) ??
        voices[0];
      if (voice) u.voice = voice;
      u.onend = onDone;
      u.onerror = onDone;
      duckMusic(DUCK_LEAD_MS + 1800);
      window.setTimeout(() => synth.speak(u), DUCK_LEAD_MS);
      window.setTimeout(onDone, DUCK_LEAD_MS + 4000);
    } catch {
      /* speech unsupported: the big text still says it */
      onDone();
    }
  };
  if (synth.getVoices().length) speak();
  else {
    let done = false;
    const once = () => {
      if (done) return;
      done = true;
      speak();
    };
    synth.addEventListener('voiceschanged', once, { once: true });
    window.setTimeout(once, 600);
  }
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
