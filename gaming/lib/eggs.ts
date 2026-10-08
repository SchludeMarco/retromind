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
    title: 'Der Code',
    hint: 'Hoch, hoch, runter, runter … mit Tastatur oder Controller.',
    text: 'Den Konami-Code eingegeben. Oldschool-Legende!',
    reward: 25,
  },
  {
    id: 'logo',
    title: 'Wackelkontakt',
    hint: 'Klopf mal kräftig auf das Logo oben links.',
    text: 'Fünfmal aufs Logo gehauen. Hat früher beim Fernseher auch geholfen.',
    reward: 15,
  },
  {
    id: 'pacman',
    title: 'Waka Waka',
    hint: 'Irgendwer futtert hier Punkte. Schnapp ihn dir!',
    text: 'Pac-Man erwischt. Der Geist ist neidisch.',
    reward: 20,
  },
  {
    id: 'iddqd',
    title: 'Gott-Modus',
    hint: 'Such nach dem Cheat, der in Doom unverwundbar macht.',
    text: 'IDDQD: unverwundbar wie 1993.',
    reward: 20,
  },
  {
    id: 'rosebud',
    title: 'Simoleons',
    hint: 'Such nach dem Geld-Cheat aus Die Sims.',
    text: 'Rosebud! Statt 1.000 Simoleons gibt es hier Spielmarken.',
    reward: 20,
  },
  {
    id: 'xyzzy',
    title: 'Nichts passiert',
    hint: 'Such nach dem Zauberwort aus dem ältesten Textadventure.',
    text: 'XYZZY. Nichts passiert. Außer, dass du Marken bekommst.',
    reward: 15,
  },
  {
    id: 'coins',
    title: 'Münzschlucker',
    hint: 'Wirf bei einem Besuch richtig viele Münzen ein.',
    text: '10 Münzen am Stück eingeworfen. Der Automat liebt dich.',
    reward: 15,
  },
  {
    id: 'colors',
    title: 'Farbenrausch',
    hint: 'Wechsel die Bildschirmfarbe, bis dir schwindelig wird.',
    text: '8-mal die Farbe gewechselt. Alles dreht sich!',
    reward: 10,
  },
  {
    id: 'guru42',
    title: 'Die Antwort',
    hint: 'Frag den Guru nach dem Sinn des Lebens.',
    text: '42. Der Guru wusste es die ganze Zeit.',
    reward: 20,
  },
  {
    id: 'night',
    title: 'Nachteule',
    hint: 'Komm vorbei, wenn alle anderen schlafen.',
    text: 'Nach Mitternacht in der Halle. Wie früher, wenn die Eltern dachten, du schläfst.',
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
