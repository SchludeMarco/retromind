// Opening RetroMind (Zeitreise or Gaming) must not blast sound at anyone
// (Marco, 2026-10-07: "Wenn man die Apps öffnet, wird man direkt
// angeschrien … lieber langsam lauter, damit man genug Zeit hat, den Ton
// bei Bedarf auszumachen"). The first sound of a visit therefore rises from
// silence over STARTUP_FADE_SECONDS: the clock and gong of the welcome
// screen (lib/clockSounds), the gaming street, door and intro music
// (gaming/lib/chiptune). Spotify's Premium player fades in on its own
// (lib/spotifyPremium); the embedded Spotify player has no volume control.

export const STARTUP_FADE_SECONDS = 10;

/** Lets `param` rise from silence to `target`, on a curve that sounds even to the ear. */
export function riseFromSilence(param: AudioParam, ctx: BaseAudioContext, target: number, seconds = STARTUP_FADE_SECONDS) {
  const now = ctx.currentTime;
  param.cancelScheduledValues(now);
  const steps = 64;
  const curve = new Float32Array(steps);
  for (let i = 0; i < steps; i++) curve[i] = target * (i / (steps - 1)) ** 2;
  try {
    param.setValueCurveAtTime(curve, now, seconds);
  } catch {
    param.setValueAtTime(0, now);
    param.linearRampToValueAtTime(target, now + seconds);
  }
}

/**
 * Calls `start` once, as soon as `ctx` really plays (browsers hold audio
 * back until the first tap), so the fade isn't used up while still silent.
 */
export function whenRunning(ctx: AudioContext, start: () => void) {
  if (ctx.state === 'running') return start();
  const check = () => {
    if (ctx.state !== 'running') return;
    ctx.removeEventListener('statechange', check);
    start();
  };
  ctx.addEventListener('statechange', check);
}
