// Turns the music down for a moment while a voice speaks (Marco, 2026-11-25:
// "Welcome back" in the Stube was drowned out by the background music).
// The voice calls duckMusic(); every music source listens with onMusicDuck:
// Spotify's Premium player glides quieter and back, the embedded player
// (which has no volume at all) pauses for the moment and carries on, and
// the arrival show's hit fanfare dips under the voice.

type Listener = (ducked: boolean) => void;

const listeners = new Set<Listener>();
let ducked = false;
let timer: number | null = null;

/** Music quieter for `ms` milliseconds (a new call extends it). */
export function duckMusic(ms: number) {
  if (timer !== null) window.clearTimeout(timer);
  if (!ducked) {
    ducked = true;
    listeners.forEach((l) => l(true));
  }
  timer = window.setTimeout(() => {
    timer = null;
    ducked = false;
    listeners.forEach((l) => l(false));
  }, ms);
}

export function isMusicDucked(): boolean {
  return ducked;
}

/** Calls `listener` when the music should go quiet (true) and come back (false); returns the unsubscribe. */
export function onMusicDuck(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
