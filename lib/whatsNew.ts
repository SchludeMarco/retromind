// "Was ist neu?" is fed straight from CHANGELOG.md, so every change that is
// logged there (see CLAUDE.md) shows up in the app without extra work. The
// file is bundled as raw text and parsed here into plain entries.
import changelog from '../CHANGELOG.md?raw';
import { isGerman } from './i18n';

export interface WhatsNewEntry {
  id: string;
  /** "Zeitreise", "Gaming-Edition" … when the title starts with a module name. */
  module?: string;
  title: string;
  date?: string;
  text: string;
  /** true when the English UI shows this entry in German (no translation yet). */
  germanOnly?: boolean;
}

export interface WhatsNewSection {
  /** "Unreleased" or a version number such as "2.0.1". */
  version: string;
  entries: WhatsNewEntry[];
}

const SEEN_KEY = 'retromind.whatsnew.seen';
const MODULES = ['Zeitreise', 'Gaming-Edition'];

// Entries that only concern the repository, not the app people use.
const HIDDEN_TITLES = /^Dokumentation\b/;

// English versions of the newest entries, keyed by the German bold title
// exactly as it stands in CHANGELOG.md. CHANGELOG.md stays German; entries
// without a translation here appear in German in the English UI, marked
// "German only".
const EN: Record<string, { title: string; text: string }> = {
  'Versionsnummer in den Einstellungen': {
    title: 'Version number in the settings',
    text: 'At the very bottom of the settings in both apps you can now see which version is running, for example “Version 2.167 (a1b2c3d)”. The number after the dot goes up with every change, and the code in parentheses shows exactly which build is loaded.',
  },
  'RetroMind spricht jetzt Englisch': {
    title: 'RetroMind now speaks English',
    text: 'Both apps, Time Travel and RetroMind – Gaming, have been fully translated into American English, and English is the new default language. If you prefer German, switch to “Deutsch” under “Language” in the settings; your choice is saved in your browser. Everything the AI writes (questions, photo analysis, chat, Retro Guru, game guides) also comes in the language you picked. The game tokens are now called “Coins”. The privacy policy and legal notice are now also available in English.',
  },
  'Anmelden schon am Eingang der Gaming-Halle': {
    title: 'Sign in right at the gaming hall entrance',
    text: 'Below the ENTER button there are now two optional buttons: “Sign in with Google” (saves your progress and coins on all your devices) and “Connect Spotify” (hall music in full length, gently louder with Premium). No more detour through the settings. If you’re already signed in, you just see a small check mark with your name.',
  },
  'Easter Eggs in der Gaming-Halle': {
    title: 'Easter eggs in the gaming hall',
    text: 'Ten secrets are now hidden in the hall, for example old cheats in the search (IDDQD, Rosebud, XYZZY), a Pac-Man to catch, tapping the logo five times, or asking the Guru about the meaning of life. Every egg you find pays out coins once, the same ones you get for quests. Under “Quests” you’ll find a list with hints for everything you’re still missing. The prize counter now has a rainbow-colored “Party Logo”. Your coin balance sits in the header as before. If you’re not signed in with Google, it says “ONLY HERE” and “Quests” shows a clear note: your coins are then only saved on this device. Once you sign in, coins and found eggs go into your Google backup too.',
  },
  'Mehr im Adminbereich': {
    title: 'More in the admin area',
    text: 'The admin area now has three tabs. “Usage” also shows devices (phone, tablet, computer), how often the app is opened as an installed app, and the most popular decades, games and mini-games, for this month and overall. “Feedback” lists all feedback; open items can be turned into a to-do or checked off as done right there. The “Live Check” shows whether both domains really serve the newest version and otherwise links to the redeploy in Vercel. Everything stays anonymous; the privacy policy has been updated.',
  },
  'Versteckter Zugang zum Adminbereich': {
    title: 'Hidden way into the admin area',
    text: 'Quickly tapping the “Settings” heading five times in the settings of Time Travel or Gaming takes you to the admin area. Nothing about it is visible, and only Marco’s Google account can see any numbers there. This also works in the installed app, which has no address bar.',
  },
  'Kein Admin-Link mehr in den Apps': {
    title: 'No more admin link in the apps',
    text: 'The link to the admin area is gone from the settings of Time Travel and Gaming. The area can now only be reached directly at /admin/.',
  },
  'Adminbereich mit Nutzungszahlen': {
    title: 'Admin area with usage numbers',
    text: 'At /admin/ there’s now an area just for Marco. It shows how many people opened Time Travel and Gaming: visitors today, visits over the last 7, 30 or 90 days, and all app launches, as bars and a table. Only Marco’s Google account gets in, and the server checks that. The link sits in the settings of both apps and is only visible to him. Counting is anonymous, without cookies and without storing IP addresses; a new section of the privacy policy explains this.',
  },
  'Metal-Intro auch mit Spotify, Premium schon vor der Tür': {
    title: 'Metal intro with Spotify too, Premium already outside the door',
    text: 'The new metal intro now also plays when you enter the gaming hall if Spotify is the hall music; Spotify takes over afterwards. If you’re signed in to Gaming with Spotify Premium (browser on a computer), you already hear the same Spotify music quietly outside the door, and it gets loud as you walk in. Without Premium, the muffled intro keeps playing outside the door.',
  },
  'Besser klingende Metal-Musik in Gaming': {
    title: 'Better-sounding metal music in Gaming',
    text: 'The metal intro when you walk in and the muffled bass outside the door now sound like a real band: two distorted guitars left and right, a bass, a solo with echo, fuller drums with crashing cymbals, and reverb like in a big hall. The music is no longer generated live on your phone but pre-recorded. That means nothing stutters, and outside the door you hear exactly the same music, just muffled by the wall.',
  },
  'Vor dem Eingang nur noch der Bass aus der Halle': {
    title: 'Only the bass from the hall outside the entrance',
    text: 'Street noise, sirens and the crowd outside the gaming hall are gone, because several sounds at once caused problems. Outside the door you now only hear the bass and drums of the metal music inside, muffled by the wall and slowly getting louder.',
  },
  'Bass aus der Halle schon vor dem Eingang': {
    title: 'Bass from the hall already outside the entrance',
    text: 'Outside the gaming hall you now hear metal playing inside, muffled by the wall: kick drum, snare and the bass line of exactly the riff that gets loud when you walk in. That way you know outside already that it’s going to be loud in there. It sits quietly under the street sounds and slowly gets louder along with them.',
  },
  'Metal-Intro in der Halle am Handy hörbar': {
    title: 'Metal intro in the hall now audible on phones',
    text: 'On phones, all you heard of the metal intro when entering the gaming hall was a faint bass hum. Guitar and kick drum now sit at pitches phone speakers can play: the guitar is punchier, the kick drum snappier and less deep, and it no longer pushes everything else down. The intro still fades in slowly.',
  },
  'Warnschild vergräbt sich bei Ton aus': {
    title: 'Warning sign buries itself when the sound is off',
    text: 'If you turn the sound off on the Time Travel start page or at the Gaming entrance, the “Warning, extreme loud!” sign wobbles briefly and then sinks into the ground. Only the little mound of dirt is left. Turn the sound back on and it pops right back up.',
  },
  'Wegweiser „To the gaming zone“': {
    title: 'Signpost “To the gaming zone”',
    text: 'The Time Travel start page now has a wooden signpost reading “To the gaming zone” in every design. Clicking it takes you to RetroMind – Gaming; your sound and Google settings come along. The signpost replaces the old dark button “New: RetroMind – Gaming”. The link to Gaming in the settings stays as before.',
  },
  'Ton beim Öffnen leise, mit Warnschild': {
    title: 'Quiet sound on opening, with a warning sign',
    text: 'Opening Time Travel or Gaming no longer blasts you with sound right away. The ticking clock and the gong in Time Travel, as well as the street, door and metal intro in Gaming, start quietly and slowly get louder over about 10 seconds. That leaves time to turn the sound off. While the sound is on, a wooden sign is hammered into the ground to the right of the start button (“Go back...” or “ENTER”): “Warning, extreme loud!”. With Spotify Premium on a computer, the music fades in slowly too. The regular Spotify player can’t start more quietly, but it only begins after the start button.',
  },
  'Gaming startet im dunklen Design': {
    title: 'Gaming starts in the dark design',
    text: 'The Gaming edition now opens in the dark arcade design by default instead of the light module design. If you’ve used Gaming before, you get the dark design once automatically. If you then pick another design under “Screen” in the settings (for example module again), it sticks.',
  },
  'Stationen direkt unter dem Logo wählen': {
    title: 'Pick stops right below the logo',
    text: 'In the Classic and Night Shift designs, the journey now shows “Stop x of 7” with the name of the current stop under the small logo. It stays folded up until you tap it. Then you see all stops from Start to Wrap-Up and jump straight to one with a tap, without going back to the start page first. The Retro Warm design already has this in its stepper.',
  },
  'Feedback-Knopf ist jetzt rot und beschriftet': {
    title: 'The feedback button is now red and labeled',
    text: 'Feedback used to be just a small envelope icon that many people missed. Now it’s a red button labeled “Feedback”, in every Time Travel design and in the Gaming edition (there below the sound and gear buttons). In the Classic and Night Shift designs it sits in the top left on phones so it doesn’t cover the logo. So that everything fits in the Retro Warm header on phones, the “RETROMIND” lettering is dropped on narrow screens (the logo stays) and the sound switch only shows its icon.',
  },
  'Gaming: Pac-Mampf in der Chill-Ecke': {
    title: 'Gaming: Pac-Munch in the chill corner',
    text: 'A new mini-game in the style of Pac-Man, with its own maze and its own graphics. Gobble up dots, dodge the four ghosts, and after a power pellet they turn blue and can be eaten. Plus a tunnel at the side, a cherry as a bonus, and every level gets a little faster. On phones you steer by swiping across the maze or with the D-pad below it, on computers with the arrow keys (or WASD); the space bar pauses. A cleared level counts as a completed mini-game for quests and achievements, and your high score is saved.',
  },
  '„Deine Zeit“ passt jetzt zum Geburtsjahr': {
    title: '“Your time” now matches your birth year',
    text: 'The intro used to say things like “In the 2010s you were about elementary school age”, even if you were born in 2010. That sounded contradictory and was also wrong for very young or very old birth years. Now it shows your birth year and roughly when you were in elementary school, e.g. “You were born in 2010, so you were in elementary school from about 2016 to 2020”. If your elementary school years fall in a decade RetroMind doesn’t have yet, the app says so and starts with the closest one.',
  },
  'Spotify-Musik auf Android wieder sofort da': {
    title: 'Spotify music on Android plays right away again',
    text: 'When signed in with Spotify Premium, Android phones stayed silent because Spotify’s browser player doesn’t play there. On phones and tablets the music now plays through the embedded Spotify player, just like without signing in. Search and theme music still work there; the volume slider and the slow fade-in are only available on computers.',
  },
  'Musik kommt auch, wenn Spotifys Browser-Player streikt': {
    title: 'Music plays even when Spotify’s browser player acts up',
    text: 'When signed in with Spotify Premium, sometimes no music played at all. RetroMind now tries to start several times, and if still no song plays, the music continues through the embedded Spotify player like before you signed in. Search and theme music stay usable.',
  },
  'Spotify-Player: Suche, Musik zum Thema und mehr': {
    title: 'Spotify player: search, theme music and more',
    text: 'When you’re signed in to Spotify, the music player in Time Travel and the gaming hall can do a lot more. Search for songs, albums and artists and play them with a tap. A bar shows where you are in the song, and you can jump around in it. With Premium you also get a volume slider, the album cover, and previous/next within albums. “Theme music” (on, can be switched off) plays fitting music on its own: open a music topic in Time Travel like “ABBA fever” or “NDW” and the matching hit plays. Open a game in Gaming and its soundtrack plays, if Spotify has one. When you close it, the regular music continues, and “Back to …” brings it back anytime. Without signing in, the player shows a button to sign in.',
  },
  'Gaming: Pac-Man wandert frei durch die Halle': {
    title: 'Gaming: Pac-Man roams freely through the hall',
    text: 'Instead of just running along the bottom of the screen, the little Pac-Man now keeps picking a random spot anywhere on the screen and slowly heads there, straight or diagonally. Along the way he eats a row of dots, and the ghost follows his trail. He’s even more see-through than before, can’t be tapped, and is off when “Reduce motion” is turned on on your device.',
  },
  'Gaming: Pac-Man jetzt sichtbar': {
    title: 'Gaming: Pac-Man now visible',
    text: 'The little Pac-Man from PR #141 ran behind the cards in the hall, so on phones you couldn’t see him at all. Now he runs semi-transparent across the catalog, but below the bottom bar, the buttons and windows. Taps still go right through him.',
  },
  'Spotify Premium: Musik wird langsam lauter': {
    title: 'Spotify Premium: music fades in slowly',
    text: 'If you sign in with Spotify Premium, you hear the music in Time Travel and the gaming hall through Spotify’s own browser player. It starts quietly and gets louder over about 6 seconds when it starts and resumes, and full songs play instead of short previews. In the Gaming edition there’s a “Sign in with Spotify” button for this under “Hall music” in the settings. Without Premium and on iPhone/iPad everything stays as before.',
  },
  'Gaming: kleiner Pac-Man im Hintergrund': {
    title: 'Gaming: little Pac-Man in the background',
    text: 'In the RetroMind - Gaming hall, a small, faded Pac-Man now slowly runs along the bottom of the screen, eats a row of dots and has a ghost on his heels. He stays behind the catalog and buttons, can’t be tapped, and is off when “Reduce motion” is turned on on your device.',
  },
  'Gaming: Hallenmusik wird langsam lauter': {
    title: 'Gaming: hall music fades in slowly',
    text: 'The self-generated music in RetroMind - Gaming (the metal intro after walking in and the chiptune tracks) now starts quietly and gets louder over about 6 seconds, also when you switch it back on. The Spotify music still starts at normal volume, because Spotify’s embedded player offers no volume control.',
  },
};

const cleanText = (s: string) =>
  s
    // a parenthesis holding only a file path is meaningless in the app
    .replace(/\s*\(`[^`]*`(?:,\s*[^)]*)?\)/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

const parseEntry = (raw: string, index: number): WhatsNewEntry | null => {
  const body = raw.replace(/^-\s*/, '').replace(/\n\s*/g, ' ').trim();
  const bold = body.match(/^\*\*(.+?)\*\*\s*(.*)$/);
  let title = bold ? bold[1].trim() : '';
  const english = bold ? EN[title] : undefined;
  let rest = bold ? bold[2] : body;

  if (HIDDEN_TITLES.test(title)) return null;

  // "(2026-10-03, PR #81): …" right after the title
  let date: string | undefined;
  const meta = rest.match(/^\(([^)]*)\)\s*:?\s*/);
  if (meta) {
    date = meta[1].match(/\d{4}-\d{2}-\d{2}/)?.[0];
    rest = rest.slice(meta[0].length);
  }
  rest = rest.replace(/^:\s*/, '');
  title = title.replace(/:$/, '').trim();

  let module: string | undefined;
  const prefix = MODULES.find((m) => title.startsWith(`${m}:`));
  if (prefix) {
    module = prefix;
    title = title.slice(prefix.length + 1).trim();
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  const text = cleanText(rest);
  if (!title && !text) return null;
  const id = `${index}:${title || text.slice(0, 40)}`;
  if (isGerman) return { id, module, title: cleanText(title), date, text };
  if (english) return { id, module, title: english.title, date, text: english.text };
  return { id, module, title: cleanText(title), date, text, germanOnly: true };
};

export const parseChangelog = (md: string): WhatsNewSection[] => {
  const sections: WhatsNewSection[] = [];
  let current: WhatsNewSection | null = null;
  let entry: string[] | null = null;
  let index = 0;

  const flush = () => {
    if (current && entry) {
      const parsed = parseEntry(entry.join('\n'), index++);
      if (parsed) current.entries.push(parsed);
    }
    entry = null;
  };

  for (const line of md.split('\n')) {
    const heading = line.match(/^## (.+)$/);
    if (heading) {
      flush();
      current = { version: heading[1].trim(), entries: [] };
      sections.push(current);
      continue;
    }
    if (!current) continue;
    if (line.startsWith('- ')) {
      flush();
      entry = [line];
    } else if (entry && /^\s+\S/.test(line)) {
      entry.push(line);
    } else {
      // blank line, sub-heading or free paragraph ends the entry
      flush();
    }
  }
  flush();
  return sections.filter((s) => s.entries.length);
};

export const WHATS_NEW: WhatsNewSection[] = parseChangelog(changelog);

const newestId = () => WHATS_NEW[0]?.entries[0]?.id ?? '';

/** True while the newest entry hasn't been seen on this device yet. */
export const hasUnseenNews = (): boolean => {
  try {
    const seen = localStorage.getItem(SEEN_KEY);
    return !!newestId() && seen !== newestId();
  } catch {
    return false;
  }
};

export const markNewsSeen = () => {
  try {
    localStorage.setItem(SEEN_KEY, newestId());
  } catch {
    /* storage unavailable: the dot just shows again next time */
  }
};
