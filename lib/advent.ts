// The advent calendar (Marco, 2026-10-14: "In der Weihnachtszeit sollte ein
// Weihnachtskalender kommen und jeden Tag sollte etwas Spezielles extra
// rausspringen"). 24 doors; from December 1 one more opens each day, and
// behind each is a song for the radio, a recipe from Grandma's Christmas
// bakery, a little story from Christmas back then, or a question for the
// memory book. Opened doors are remembered in this browser.

import { getXmasMode } from './season';

type Text = { en: string; de: string };

export type AdventDoor = {
  day: number;
  icon: string;
  title: Text;
  text: Text;
} & (
  | { kind: 'song'; track: string; song: string; artist: string }
  | { kind: 'recipe'; recipe: string }
  | { kind: 'story' }
  | { kind: 'question'; question: Text }
);

export const ADVENT_DOORS: AdventDoor[] = [
  {
    day: 1, kind: 'song', icon: '🎵', track: '2FRnf9qhLbvw8fu4IBXx78', song: 'Last Christmas', artist: 'Wham!',
    title: { en: 'The first door: a song', de: 'Das erste Türchen: ein Lied' },
    text: { en: 'Released in 1984 and back on the radio every December since. Let the season begin!', de: '1984 erschienen und seitdem jeden Dezember wieder im Radio. Die Weihnachtszeit kann beginnen!' },
  },
  {
    day: 2, kind: 'recipe', icon: '🌙', recipe: 'vanillekipferl',
    title: { en: 'Bake with Grandma: vanilla crescents', de: 'Backen mit Oma: Vanillekipferl' },
    text: { en: 'The first cookies of the season, tender and dusted with vanilla sugar.', de: 'Die ersten Plätzchen der Saison, zart und voller Vanillezucker.' },
  },
  {
    day: 3, kind: 'story', icon: '🍫',
    title: { en: 'Chocolate behind the doors', de: 'Schokolade hinter den Türchen' },
    text: { en: 'The first advent calendars only had little pictures behind their doors. Calendars with a piece of chocolate for every day became common in the 1950s and ’60s, and since then every child has known the question: open them all at once, or wait?', de: 'Hinter den Türchen der ersten Adventskalender steckten nur kleine Bilder. Kalender mit einem Stück Schokolade für jeden Tag wurden in den 1950er- und 60er-Jahren üblich, und seitdem kennt jedes Kind die Frage: alle auf einmal öffnen oder warten?' },
  },
  {
    day: 4, kind: 'question', icon: '📝',
    title: { en: 'Your wish list', de: 'Dein Wunschzettel' },
    text: { en: 'Written in your best handwriting, decorated with stars and left on the windowsill.', de: 'In Schönschrift geschrieben, mit Sternen verziert und aufs Fensterbrett gelegt.' },
    question: { en: 'What was at the very top of your wish list as a child, and did you get it?', de: 'Was stand als Kind ganz oben auf deinem Wunschzettel, und hast du es bekommen?' },
  },
  {
    day: 5, kind: 'recipe', icon: '⭐', recipe: 'zimtsterne',
    title: { en: 'Bake with Grandma: cinnamon stars', de: 'Backen mit Oma: Zimtsterne' },
    text: { en: 'Chewy almond stars with a snow-white glaze.', de: 'Saftige Mandelsterne mit schneeweißem Guss.' },
  },
  {
    day: 6, kind: 'question', icon: '👢',
    title: { en: 'St. Nicholas Day', de: 'Nikolaustag' },
    text: { en: 'In Germany, children polish their boots on the evening of December 5 and put them outside the door. By morning St. Nicholas has filled them with nuts, oranges and chocolate.', de: 'Am Abend des 5. Dezember putzen Kinder ihre Stiefel und stellen sie vor die Tür. Am Morgen hat der Nikolaus sie mit Nüssen, Mandarinen und Schokolade gefüllt.' },
    question: { en: 'What did you find in your boot (or your stocking) as a child?', de: 'Was hast du als Kind in deinem Stiefel gefunden?' },
  },
  {
    day: 7, kind: 'song', icon: '🎵', track: '2EjXfH91m7f8HiJN1yQg97', song: 'Rockin’ Around The Christmas Tree', artist: 'Brenda Lee',
    title: { en: 'A song from 1958', de: 'Ein Lied von 1958' },
    text: { en: 'Brenda Lee was only 13 when she recorded it. Turn it up!', de: 'Brenda Lee war erst 13, als sie es aufnahm. Lauter drehen!' },
  },
  {
    day: 8, kind: 'story', icon: '✨',
    title: { en: 'Tinsel', de: 'Lametta' },
    text: { en: 'For a long time tinsel was made of lead foil. It hung heavy and straight, and after the holidays it was carefully taken off, smoothed and kept for next year. Today it is plastic, and much lighter.', de: 'Lametta war lange aus Bleifolie. Es hing schwer und gerade, und nach den Feiertagen wurde es sorgfältig abgenommen, glatt gestrichen und fürs nächste Jahr aufgehoben. Heute ist es aus Kunststoff und viel leichter.' },
  },
  {
    day: 9, kind: 'recipe', icon: '🍪', recipe: 'spritzgebaeck',
    title: { en: 'Bake with Grandma: spritz cookies', de: 'Backen mit Oma: Spritzgebäck' },
    text: { en: 'Through the old meat grinder with the star disc, and the ends dipped in chocolate.', de: 'Durch den alten Fleischwolf mit der Sternscheibe, und die Enden in Schokolade.' },
  },
  {
    day: 10, kind: 'question', icon: '🕯️',
    title: { en: 'The Advent wreath', de: 'Der Adventskranz' },
    text: { en: 'One candle more every Sunday, and the whole family around the table.', de: 'Jeden Sonntag eine Kerze mehr, und die ganze Familie am Tisch.' },
    question: { en: 'How did your family spend the Advent Sundays?', de: 'Wie hat deine Familie die Adventssonntage verbracht?' },
  },
  {
    day: 11, kind: 'story', icon: '📖',
    title: { en: 'The big catalog', de: 'Der dicke Katalog' },
    text: { en: 'Before the internet, the mail-order catalog was the wish list. Children leafed through the toy pages for weeks, circled what they wanted and folded the corners.', de: 'Vor dem Internet war der Versandhauskatalog der Wunschzettel. Kinder blätterten wochenlang durch die Spielzeugseiten, kreisten ein, was sie wollten, und knickten die Ecken um.' },
  },
  {
    day: 12, kind: 'song', icon: '🎵', track: '4Yg2w0P29BBBMixyeNjDtj', song: 'Do They Know It’s Christmas?', artist: 'Band Aid',
    title: { en: 'A song from 1984', de: 'Ein Lied von 1984' },
    text: { en: 'Dozens of stars in one studio, for a good cause. Who can name all the voices?', de: 'Dutzende Stars in einem Studio, für einen guten Zweck. Wer erkennt alle Stimmen?' },
  },
  {
    day: 13, kind: 'recipe', icon: '🥥', recipe: 'kokosmakronen',
    title: { en: 'Bake with Grandma: coconut macaroons', de: 'Backen mit Oma: Kokosmakronen' },
    text: { en: 'The perfect use for leftover egg whites.', de: 'Die beste Verwendung für übriges Eiweiß.' },
  },
  {
    day: 14, kind: 'story', icon: '📺',
    title: { en: 'Christmas on TV', de: 'Weihnachten im Fernsehen' },
    text: { en: 'Some films belong to Christmas like the tree: “A Charlie Brown Christmas” (1965), the Czech-German fairy tale “Three Wishes for Cinderella” (1973), which German TV shows every year, and “Home Alone” (1990).', de: 'Manche Filme gehören zu Weihnachten wie der Baum: „Die Peanuts – Fröhliche Weihnachten“ (1965), „Drei Haselnüsse für Aschenbrödel“ (1973), das jedes Jahr wieder läuft, und „Kevin – Allein zu Haus“ (1990).' },
  },
  {
    day: 15, kind: 'question', icon: '🛋️',
    title: { en: 'In front of the TV', de: 'Vor dem Fernseher' },
    text: { en: 'Blanket, cookies, and the whole family on the couch.', de: 'Decke, Plätzchen und die ganze Familie auf dem Sofa.' },
    question: { en: 'Which Christmas film or show did you watch every year?', de: 'Welchen Weihnachtsfilm hast du jedes Jahr geschaut?' },
  },
  {
    day: 16, kind: 'recipe', icon: '🍎', recipe: 'bratapfel',
    title: { en: 'Bake with Grandma: baked apples', de: 'Backen mit Oma: Bratäpfel' },
    text: { en: 'Sizzling in the oven, with warm vanilla sauce.', de: 'Brutzelnd aus dem Ofen, mit warmer Vanillesoße.' },
  },
  {
    day: 17, kind: 'story', icon: '🎁',
    title: { en: 'The gift everyone wanted', de: 'Das Geschenk, das alle wollten' },
    text: { en: 'Every decade had its must-have gift: Cabbage Patch Kids sold out in 1983, the Game Boy arrived in 1989, the Tamagotchi in 1997 and the Furby in 1998. Parents queued in front of toy stores for them.', de: 'Jedes Jahrzehnt hatte sein Geschenk, das alle wollten: Cabbage-Patch-Puppen waren 1983 ausverkauft, der Game Boy kam 1989, das Tamagotchi 1997 und der Furby 1998. Eltern standen dafür vor den Spielzeugläden Schlange.' },
  },
  {
    day: 18, kind: 'song', icon: '🎵', track: '0bYg9bo50gSsH3LtXe2SQn', song: 'All I Want for Christmas Is You', artist: 'Mariah Carey',
    title: { en: 'A song from 1994', de: 'Ein Lied von 1994' },
    text: { en: 'It took a while, but now no December goes by without it.', de: 'Es hat gedauert, aber heute vergeht kein Dezember ohne dieses Lied.' },
  },
  {
    day: 19, kind: 'recipe', icon: '☕', recipe: 'kinderpunsch',
    title: { en: 'With Grandma: kids’ Christmas punch', de: 'Mit Oma: Kinderpunsch' },
    text: { en: 'Something warm to drink after the Christmas market.', de: 'Etwas Warmes nach dem Weihnachtsmarkt.' },
  },
  {
    day: 20, kind: 'story', icon: '🎄',
    title: { en: 'Real candles on the tree', de: 'Echte Kerzen am Baum' },
    text: { en: 'Many families still lit real wax candles on the tree, with a bucket of water standing ready next to it. Over the years electric fairy lights took their place.', de: 'In vielen Familien brannten noch echte Wachskerzen am Baum, und ein Eimer Wasser stand bereit. Mit den Jahren haben elektrische Lichterketten ihren Platz eingenommen.' },
  },
  {
    day: 21, kind: 'question', icon: '🎀',
    title: { en: 'The best gift', de: 'Das schönste Geschenk' },
    text: { en: 'Some gifts you remember your whole life.', de: 'Manche Geschenke vergisst man ein Leben lang nicht.' },
    question: { en: 'What was the best Christmas gift you ever got, and who gave it to you?', de: 'Was war das schönste Weihnachtsgeschenk, das du je bekommen hast, und von wem?' },
  },
  {
    day: 22, kind: 'song', icon: '🎵', track: '3Z3QhZAZpqwZa1phsbQ3JZ', song: 'Driving Home for Christmas', artist: 'Chris Rea',
    title: { en: 'A song from 1986', de: 'Ein Lied von 1986' },
    text: { en: 'For everyone who is on the road to their family right now.', de: 'Für alle, die gerade auf dem Weg zu ihrer Familie sind.' },
  },
  {
    day: 23, kind: 'question', icon: '🏠',
    title: { en: 'Coming home', de: 'Nach Hause kommen' },
    text: { en: 'Grandparents, aunts, cousins: at Christmas the house was full.', de: 'Großeltern, Tanten, Cousins: An Weihnachten war das Haus voll.' },
    question: { en: 'Who came to visit at Christmas, and who was the first at the door?', de: 'Wer kam an Weihnachten zu Besuch, und wer stand als Erstes vor der Tür?' },
  },
  {
    day: 24, kind: 'song', icon: '🌟', track: '4so0Wek9Ig1p6CRCHuINwW', song: 'White Christmas', artist: 'Bing Crosby',
    title: { en: 'Merry Christmas!', de: 'Frohe Weihnachten!' },
    text: { en: 'The last door: a song older than all of us, and the warmest wishes from Grandma’s living room. Merry Christmas!', de: 'Das letzte Türchen: ein Lied, älter als wir alle, und die herzlichsten Grüße aus Omas Stube. Frohe Weihnachten!' },
  },
];

/** The order the doors hang in, scattered like on a real calendar. */
export const DOOR_ORDER = [13, 7, 22, 2, 18, 10, 5, 24, 15, 1, 20, 8, 11, 3, 17, 23, 6, 14, 19, 9, 4, 21, 12, 16];

/** Showing every door early: the Christmas look switched on outside Advent. */
/** December 1 to January 6: the calendar is out (Marco: "startet dann erst ab dem 01.12"). */
export function isAdventTime(d = new Date()): boolean {
  return d.getMonth() === 11 || (d.getMonth() === 0 && d.getDate() <= 6);
}

/** Whether the calendar tile shows: in advent time, or as a preview with the Christmas look switched on. */
export function showAdvent(d = new Date()): boolean {
  return isAdventTime(d) || isPreview(d);
}

export function isPreview(d = new Date()): boolean {
  return getXmasMode() === 'on' && !(d.getMonth() === 11 || (d.getMonth() === 0 && d.getDate() <= 6));
}

/** Whether a door may open today. */
export function canOpen(day: number, d = new Date()): boolean {
  if (isPreview(d)) return true;
  if (d.getMonth() === 11) return d.getDate() >= day;
  return d.getMonth() === 0 && d.getDate() <= 6;
}

/** Days until a door opens (0 when it can). */
export function daysUntilDoor(day: number, d = new Date()): number {
  if (canOpen(day, d)) return 0;
  const target = new Date(d.getFullYear(), 11, day);
  const today = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.max(1, Math.round((target.getTime() - today.getTime()) / 86400000));
}

const key = (d = new Date()) => `retromind.advent.${d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear()}`;

export function readOpened(): number[] {
  try {
    const v = JSON.parse(localStorage.getItem(key()) || '[]');
    return Array.isArray(v) ? v.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

export function saveOpened(days: number[]) {
  try {
    localStorage.setItem(key(), JSON.stringify(days));
  } catch {
    /* not remembered, still open for this visit */
  }
}
