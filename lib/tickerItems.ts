import { getLang } from './i18n';

// What runs past in the ticker on the start page (components/RetroTicker.tsx,
// Marco, 2026-10-13): sayings and everyday things from back then. German and
// American English each get their own, because "Null Bock" has no English
// twin and "Gag me with a spoon" no German one. Ids are stable: the
// Grabbelkiste (lib/grabbelkiste.ts) stores them, so never reuse or renumber.

export type TickerKind = 'saying' | 'thing';

export interface TickerItem {
  id: string;
  decade: string;
  kind: TickerKind;
  text: string;
}

type Raw = [id: string, decade: string, kind: TickerKind, text: string];

const DE: Raw[] = [
  ['de-60-1', '1960', 'saying', '„Dufte!“'],
  ['de-60-2', '1960', 'saying', '„Ich glaub, mein Schwein pfeift!“'],
  ['de-60-3', '1960', 'thing', 'Samstags wird gebadet, alle nacheinander im selben Wasser'],
  ['de-60-4', '1960', 'thing', 'Der Fernseher steht im Wohnzimmer wie ein Möbelstück, mit Türchen davor'],
  ['de-60-5', '1960', 'saying', '„Halbstarker!“'],
  ['de-70-1', '1970', 'saying', '„Das ist ja knorke!“'],
  ['de-70-2', '1970', 'saying', '„Alles paletti!“'],
  ['de-70-3', '1970', 'thing', 'Nach Sendeschluss kommt das Testbild'],
  ['de-70-4', '1970', 'thing', 'Sonntags ist Autofrei, und alle gehen auf der Autobahn spazieren'],
  ['de-70-5', '1970', 'saying', '„Mach mal ’ne Fliege!“'],
  ['de-70-6', '1970', 'thing', 'Das Telefon hat eine Wählscheibe und eine Schnur'],
  ['de-80-1', '1980', 'saying', '„Null Bock!“'],
  ['de-80-2', '1980', 'saying', '„Voll ätzend!“'],
  ['de-80-3', '1980', 'saying', '„Geil, ey!“'],
  ['de-80-4', '1980', 'thing', 'Die Kassette mit dem Bleistift zurückspulen'],
  ['de-80-5', '1980', 'thing', 'Samstagabend: die ganze Familie vor „Wetten, dass..?“'],
  ['de-80-6', '1980', 'thing', 'Telefonieren erst nach 18 Uhr, wegen des Mondscheintarifs'],
  ['de-80-7', '1980', 'saying', '„Wer’s glaubt, wird selig.“'],
  ['de-90-1', '1990', 'saying', '„Voll krass!“'],
  ['de-90-2', '1990', 'saying', '„Bis die Tage!“'],
  ['de-90-3', '1990', 'thing', 'Das Tamagotchi muss auch in der Schule gefüttert werden'],
  ['de-90-4', '1990', 'thing', 'Ins Internet nur, wenn keiner telefonieren will'],
  ['de-90-5', '1990', 'saying', '„Ich hab fertig!“'],
  ['de-90-6', '1990', 'thing', 'Die Lieblingslieder vom Radio aufnehmen, ohne dass der Moderator reinredet'],
  ['de-00-1', '2000', 'saying', '„Ich bin doch nicht blöd!“'],
  ['de-00-2', '2000', 'thing', 'SMS mit 160 Zeichen, jedes Wort gut überlegt'],
  ['de-00-3', '2000', 'thing', 'Snake auf dem Nokia, bis der Akku leer ist'],
  ['de-00-4', '2000', 'saying', '„Hdl!“'],
  ['de-00-5', '2000', 'thing', 'Die Mark wird zum Euro, und alle rechnen noch jahrelang um'],
  ['de-10-1', '2010', 'saying', '„YOLO!“'],
  ['de-10-2', '2010', 'thing', 'Das erste Selfie mit ausgestrecktem Arm'],
  ['de-10-3', '2010', 'saying', '„Läuft bei dir!“'],
];

const EN: Raw[] = [
  ['en-60-1', '1960', 'saying', '“Groovy!”'],
  ['en-60-2', '1960', 'saying', '“Far out, man!”'],
  ['en-60-3', '1960', 'thing', 'The whole family gathers around the TV for the moon landing'],
  ['en-60-4', '1960', 'thing', 'The milkman leaves glass bottles on the porch'],
  ['en-60-5', '1960', 'saying', '“Sock it to me!”'],
  ['en-70-1', '1970', 'saying', '“Keep on truckin’!”'],
  ['en-70-2', '1970', 'saying', '“Dy-no-mite!”'],
  ['en-70-3', '1970', 'thing', 'After the late show, the station signs off with the anthem and a test pattern'],
  ['en-70-4', '1970', 'thing', 'Waiting in line for gas on odd and even days'],
  ['en-70-5', '1970', 'saying', '“Catch you on the flip side!”'],
  ['en-70-6', '1970', 'thing', 'The phone hangs on the kitchen wall with a long curly cord'],
  ['en-80-1', '1980', 'saying', '“Gag me with a spoon!”'],
  ['en-80-2', '1980', 'saying', '“Totally tubular!”'],
  ['en-80-3', '1980', 'saying', '“Where’s the beef?”'],
  ['en-80-4', '1980', 'thing', 'Rewinding the cassette with a pencil'],
  ['en-80-5', '1980', 'thing', 'Saturday morning cartoons in your pajamas'],
  ['en-80-6', '1980', 'thing', 'Be kind, please rewind (the video store tape)'],
  ['en-80-7', '1980', 'saying', '“Gnarly!”'],
  ['en-90-1', '1990', 'saying', '“Talk to the hand!”'],
  ['en-90-2', '1990', 'saying', '“Don’t have a cow, man!”'],
  ['en-90-3', '1990', 'thing', 'Feeding the Tamagotchi under the school desk'],
  ['en-90-4', '1990', 'thing', 'Get off the phone, I need to go online!'],
  ['en-90-5', '1990', 'saying', '“As if!”'],
  ['en-90-6', '1990', 'thing', 'Taping songs off the radio before the DJ talks over them'],
  ['en-00-1', '2000', 'saying', '“That’s hot.”'],
  ['en-00-2', '2000', 'thing', 'Texting on T9, pressing 7 four times for an S'],
  ['en-00-3', '2000', 'thing', 'Playing Snake on the Nokia until the battery dies'],
  ['en-00-4', '2000', 'saying', '“Can you hear me now?”'],
  ['en-00-5', '2000', 'thing', 'Burning the perfect mix CD for someone special'],
  ['en-10-1', '2010', 'saying', '“YOLO!”'],
  ['en-10-2', '2010', 'thing', 'The first selfie with your arm stretched out'],
  ['en-10-3', '2010', 'saying', '“On fleek!”'],
];

const toItem = ([id, decade, kind, text]: Raw): TickerItem => ({ id, decade, kind, text });
const ALL = [...DE, ...EN].map(toItem);

/** Every ticker item in the current language. */
export function tickerItems(): TickerItem[] {
  return (getLang() === 'de' ? DE : EN).map(toItem);
}

/** Looks an item up by id, whatever language it was saved in. */
export function tickerItem(id: string): TickerItem | undefined {
  return ALL.find((i) => i.id === id);
}

/**
 * A shuffled run for the ticker: the person's own decade comes first and a
 * bit more often, the rest mixed in, so every visit reads a little different.
 */
export function tickerRun(focusDecade: string, count = 14): TickerItem[] {
  const items = tickerItems();
  const shuffle = <T,>(a: T[]) => {
    const b = [...a];
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  };
  const own = shuffle(items.filter((i) => i.decade === focusDecade));
  const rest = shuffle(items.filter((i) => i.decade !== focusDecade));
  const run: TickerItem[] = [];
  while (run.length < count && (own.length || rest.length)) {
    if (own.length && (run.length % 3 === 0 || !rest.length)) run.push(own.shift()!);
    else if (rest.length) run.push(rest.shift()!);
  }
  return run;
}
