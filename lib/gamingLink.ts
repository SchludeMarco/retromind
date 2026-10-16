import { withMuteParam } from './mute';
import { withGoogleParam } from './googleLogin';

// The way from the Zeitreise into RetroMind – Gaming, shared by every door
// on the start page (signpost, arcade machine in the Stube, gaming card).
// ?from=zeitreise lets Gaming show a way back (gaming/lib/cameFrom.ts).
// The gaming edition lives on its own origin, so the mute and Google choice
// travel along as URL parameters; call gamingHref() at click time so a
// toggle made after the page rendered still counts.
export const GAMING_URL = 'https://retromind-gaming.vercel.app/?from=zeitreise';

export function gamingHref(): string {
  return withGoogleParam(withMuteParam(GAMING_URL));
}
