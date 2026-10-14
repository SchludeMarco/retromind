import { AppPhase } from '../types';
import { tr } from './i18n';

// One name for every stop of the time travel, used everywhere: the journey
// bar (components/JourneyBar), the Retro Warm bottom navigation, the start
// page's "Etappen", the "Next stop" buttons. Before 2026-10-14 the same stop
// was called "Time Travel", "Impressions" and "Zeitreise" in different
// places (Marco: "es fehlt ein roter Faden").
export const STATION_NAME: Record<AppPhase, string> = {
  intro: tr('Home', 'Zuhause'),
  onboarding: tr('Your profile', 'Dein Profil'),
  induction: tr('Your era', 'Deine Zeit'),
  exploration: tr('Explore', 'Erkunden'),
  diary: tr('Diary', 'Tagebuch'),
  book: tr('Memory book', 'Erinnerungsbuch'),
  finish: tr('Journey’s end', 'Ankunft'),
};

/** Short forms for tight spots (the stops on the journey bar). */
export const STATION_SHORT: Record<AppPhase, string> = {
  intro: tr('Home', 'Zuhause'),
  onboarding: tr('Profile', 'Profil'),
  induction: tr('Era', 'Zeit'),
  exploration: tr('Explore', 'Erkunden'),
  diary: tr('Diary', 'Tagebuch'),
  book: tr('Book', 'Buch'),
  finish: tr('End', 'Ankunft'),
};
