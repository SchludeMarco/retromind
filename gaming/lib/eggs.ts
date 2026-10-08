import { tr } from '../../lib/i18n';

// Easter eggs: secrets hidden all over the hall. Each one pays Spielmarken
// once (the same tokens the quests pay, spent at the prize counter). The
// quest board lists them with a small hint until they are found.

export interface Egg {
  id: string;
  title: string;
  /** Shown before the egg is found: a nudge, not the solution. */
  hint: string;
  /** Shown once it is found. */
  text: string;
  reward: number;
}

export const EGGS: Egg[] = [
  {
    id: 'konami',
    title: tr('The Code', 'Der Code'),
    hint: tr('Up, up, down, down … with keyboard or controller.', 'Hoch, hoch, runter, runter … mit Tastatur oder Controller.'),
    text: tr('You entered the Konami Code. Old-school legend!', 'Den Konami-Code eingegeben. Oldschool-Legende!'),
    reward: 25,
  },
  {
    id: 'logo',
    title: tr('Loose Connection', 'Wackelkontakt'),
    hint: tr('Give the logo in the top left a good whack.', 'Klopf mal kräftig auf das Logo oben links.'),
    text: tr('Smacked the logo five times. Used to work on the old TV too.', 'Fünfmal aufs Logo gehauen. Hat früher beim Fernseher auch geholfen.'),
    reward: 15,
  },
  {
    id: 'pacman',
    title: 'Waka Waka',
    hint: tr('Somebody around here is gobbling up dots. Catch him!', 'Irgendwer futtert hier Punkte. Schnapp ihn dir!'),
    text: tr('Caught Pac-Man. The ghost is jealous.', 'Pac-Man erwischt. Der Geist ist neidisch.'),
    reward: 20,
  },
  {
    id: 'iddqd',
    title: tr('God Mode', 'Gott-Modus'),
    hint: tr('Search for the cheat that makes you invincible in Doom.', 'Such nach dem Cheat, der in Doom unverwundbar macht.'),
    text: tr('IDDQD: invincible like it’s 1993.', 'IDDQD: unverwundbar wie 1993.'),
    reward: 20,
  },
  {
    id: 'rosebud',
    title: 'Simoleons',
    hint: tr('Search for the money cheat from The Sims.', 'Such nach dem Geld-Cheat aus Die Sims.'),
    text: tr('Rosebud! Instead of 1,000 Simoleons, you get Coins here.', 'Rosebud! Statt 1.000 Simoleons gibt es hier Coins.'),
    reward: 20,
  },
  {
    id: 'xyzzy',
    title: tr('Nothing Happens', 'Nichts passiert'),
    hint: tr('Search for the magic word from the oldest text adventure.', 'Such nach dem Zauberwort aus dem ältesten Textadventure.'),
    text: tr('XYZZY. Nothing happens. Except you get Coins.', 'XYZZY. Nichts passiert. Außer, dass du Coins bekommst.'),
    reward: 15,
  },
  {
    id: 'coins',
    title: tr('Coin Muncher', 'Münzschlucker'),
    hint: tr('Drop a whole lot of quarters into the slot in one visit.', 'Wirf bei einem Besuch richtig viele Münzen ein.'),
    text: tr('Dropped 10 quarters in a row. The machine loves you.', '10 Münzen am Stück eingeworfen. Der Automat liebt dich.'),
    reward: 15,
  },
  {
    id: 'colors',
    title: tr('Color Frenzy', 'Farbenrausch'),
    hint: tr('Switch the screen color until you get dizzy.', 'Wechsel die Bildschirmfarbe, bis dir schwindelig wird.'),
    text: tr('Switched colors 8 times. Everything’s spinning!', '8-mal die Farbe gewechselt. Alles dreht sich!'),
    reward: 10,
  },
  {
    id: 'guru42',
    title: tr('The Answer', 'Die Antwort'),
    hint: tr('Ask the Guru about the meaning of life.', 'Frag den Guru nach dem Sinn des Lebens.'),
    text: tr('42. The Guru knew all along.', '42. Der Guru wusste es die ganze Zeit.'),
    reward: 20,
  },
  {
    id: 'night',
    title: tr('Night Owl', 'Nachteule'),
    hint: tr('Stop by when everyone else is asleep.', 'Komm vorbei, wenn alle anderen schlafen.'),
    text: tr('In the hall after midnight. Just like back when your parents thought you were asleep.', 'Nach Mitternacht in der Halle. Wie früher, wenn die Eltern dachten, du schläfst.'),
    reward: 15,
  },
];

/** Search words that are really cheats: they find an egg instead of games. */
export const SEARCH_CHEATS: Record<string, string> = {
  iddqd: 'iddqd',
  rosebud: 'rosebud',
  motherlode: 'rosebud',
  xyzzy: 'xyzzy',
};

export const cheatFor = (query: string) => SEARCH_CHEATS[query.trim().toLowerCase().replace(/\s+/g, '')];

/** A Guru question about the meaning of life (or simply "42"). */
export const asksMeaningOfLife = (text: string) =>
  /sinn des lebens|meaning of life|\b42\b|leben,? (dem )?universum/i.test(text);
