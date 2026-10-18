import { getLang, tr } from './i18n';
import { hitOf, yearOf } from './yearFacts';
import { keptItem } from './grabbelkiste';

// What runs past in the ticker on the start page (components/RetroTicker.tsx,
// Marco, 2026-10-13): sayings and everyday things from back then, one line
// per year (since 2026-10-18), and more from the AI once all of those ran. German and
// American English each get their own, because "Null Bock" has no English
// twin and "Gag me with a spoon" no German one. Ids are stable: the
// Grabbelkiste (lib/grabbelkiste.ts) stores them, so never reuse or renumber.

export type TickerKind = 'saying' | 'thing' | 'year' | 'game';

export interface TickerItem {
  id: string;
  decade: string;
  kind: TickerKind;
  text: string;
  /** A few sentences more, shown when the entry is tapped. */
  info: string;
}

type Raw = [id: string, decade: string, kind: TickerKind, text: string, info: string];

const DE: Raw[] = [
  ['de-60-1', '1960', 'saying', '„Dufte!“', 'Berlinerisch für „prima, toll“. In den 50ern und 60ern sagten das vor allem junge Leute, wenn ihnen etwas richtig gut gefiel.'],
  ['de-60-2', '1960', 'saying', '„Ich glaub, mein Schwein pfeift!“', 'Ausruf größten Erstaunens: so unglaublich, als würde ein Schwein pfeifen. Die Redensart kennt man bis heute.'],
  ['de-60-3', '1960', 'thing', 'Samstags wird gebadet, alle nacheinander im selben Wasser', 'Viele Wohnungen hatten noch kein Bad mit warmem Wasser aus der Leitung. Der Badeofen wurde einmal in der Woche angeheizt, und die Familie badete nacheinander, meist die Kinder zuerst.'],
  ['de-60-4', '1960', 'thing', 'Der Fernseher steht im Wohnzimmer wie ein Möbelstück, mit Türchen davor', 'Ein Fernseher war teuer und galt als gutes Möbel. In Schränken oder Truhen mit Türen verschwand er, sobald nicht geschaut wurde.'],
  ['de-60-5', '1960', 'saying', '„Halbstarker!“', 'So nannten Erwachsene die jungen Männer mit Lederjacke, Moped und Rock ’n’ Roll, die sich nichts mehr sagen lassen wollten.'],
  ['de-70-1', '1970', 'saying', '„Das ist ja knorke!“', 'Ein Berliner Wort für „klasse“, schon in den 1920ern beliebt und noch lange danach in aller Munde.'],
  ['de-70-2', '1970', 'saying', '„Alles paletti!“', 'Heißt „alles in Ordnung“. Woher es kommt, ist nicht ganz geklärt, aber in den 70ern und 80ern sagte es jeder.'],
  ['de-70-3', '1970', 'thing', 'Nach Sendeschluss kommt das Testbild', 'Das Fernsehen lief nicht rund um die Uhr. Nach dem letzten Film zur Nacht kam das Testbild mit seinem Pfeifton, bis am nächsten Tag das Programm begann.'],
  ['de-70-4', '1970', 'thing', 'Sonntags ist autofrei, und alle gehen auf der Autobahn spazieren', 'Wegen der Ölkrise durfte im November und Dezember 1973 an vier Sonntagen kaum jemand Auto fahren. Viele gingen auf den leeren Straßen und Autobahnen spazieren oder fuhren Rad.'],
  ['de-70-5', '1970', 'saying', '„Mach mal ’ne Fliege!“', 'Salopp für „verschwinde!“, so schnell wie eine Fliege, die davonsurrt.'],
  ['de-70-6', '1970', 'thing', 'Das Telefon hat eine Wählscheibe und eine Schnur', 'Jede Ziffer schnurrte nach dem Wählen zurück, bei einer 0 dauerte das am längsten. Das Telefon gehörte oft der Post und wurde gemietet.'],
  ['de-80-1', '1980', 'saying', '„Null Bock!“', 'Jugendsprache für „keine Lust“. Die Zeitungen sprachen sogar von der „Null-Bock-Generation“.'],
  ['de-80-2', '1980', 'saying', '„Voll ätzend!“', 'Heißt „furchtbar, total blöd“, ganz typisch für die Jugendsprache der 80er.'],
  ['de-80-3', '1980', 'saying', '„Geil, ey!“', 'In den 80ern wurde „geil“ zum Allzweckwort für „super“, sehr zum Ärger vieler Eltern.'],
  ['de-80-4', '1980', 'thing', 'Die Kassette mit dem Bleistift zurückspulen', 'Hatte sich das Band verheddert oder sollten die Batterien vom Walkman geschont werden: Bleistift in das Loch der Spule stecken und drehen.'],
  ['de-80-5', '1980', 'thing', 'Samstagabend: die ganze Familie vor „Wetten, dass..?“', 'Ab 1981 im ZDF, erst mit Frank Elstner, ab 1987 mit Thomas Gottschalk. Oft schauten über 20 Millionen Menschen zu.'],
  ['de-80-6', '1980', 'thing', 'Telefonieren erst nach 18 Uhr, wegen des Mondscheintarifs', 'Bei der Bundespost war Telefonieren abends und nachts günstiger. Wer lange mit Freunden reden wollte, wartete darauf.'],
  ['de-80-7', '1980', 'saying', '„Wer’s glaubt, wird selig.“', 'Spöttische Antwort auf eine Geschichte, die keiner glauben mag. Die Redensart spielt auf ein Bibelwort an.'],
  ['de-90-1', '1990', 'saying', '„Voll krass!“', '„Krass“ sagte man in den 90ern zu allem, was einen umhaute, egal ob gut oder schlecht.'],
  ['de-90-2', '1990', 'saying', '„Bis die Tage!“', 'Ein lockeres „bis bald“, das aus dem Ruhrgebiet in ganz Deutschland bekannt wurde.'],
  ['de-90-3', '1990', 'thing', 'Das Tamagotchi muss auch in der Schule gefüttert werden', 'Das Küken im Ei aus Japan kam 1997 nach Deutschland. Wer es nicht fütterte, musste zusehen, wie es starb, deshalb verboten es viele Schulen.'],
  ['de-90-4', '1990', 'thing', 'Ins Internet nur, wenn keiner telefonieren will', 'Das Modem wählte sich über die Telefonleitung ein und piepte und rauschte dabei. Solange man surfte, war das Telefon besetzt, und jede Minute kostete Geld.'],
  ['de-90-5', '1990', 'saying', '„Ich hab fertig!“', 'Aus der berühmten Wutrede von Giovanni Trapattoni, dem Trainer des FC Bayern, im März 1998. Dazu gehört auch „Was erlauben Strunz?“'],
  ['de-90-6', '1990', 'thing', 'Die Lieblingslieder vom Radio aufnehmen, ohne dass der Moderator reinredet', 'Mit dem Finger auf der Aufnahmetaste vor dem Radio warten, zum Beispiel bei der Hitparade. Redete der Moderator ins Lied, war die Aufnahme verdorben.'],
  ['de-00-1', '2000', 'saying', '„Ich bin doch nicht blöd!“', 'Der Werbespruch der Elektronikkette Media Markt war bald überall zu hören und wurde zum geflügelten Wort.'],
  ['de-00-2', '2000', 'thing', 'SMS mit 160 Zeichen, jedes Wort gut überlegt', 'Eine SMS durfte nur 160 Zeichen lang sein und kostete jedes Mal Geld. Abkürzungen wie „gn8“ für „gute Nacht“ sparten Platz.'],
  ['de-00-3', '2000', 'thing', 'Snake auf dem Nokia, bis der Akku leer ist', 'Das Spiel kam 1997 auf die Nokia-Handys. Die Schlange wird mit jedem Happen länger, und wer sich selbst in den Schwanz beißt, hat verloren.'],
  ['de-00-4', '2000', 'saying', '„Hdl!“', '„Hab dich lieb“, die Abkürzung passte in jede SMS. Noch inniger war „hdgdl“: hab dich ganz doll lieb.'],
  ['de-00-5', '2000', 'thing', 'Die Mark wird zum Euro, und alle rechnen noch jahrelang um', 'Seit dem 1. Januar 2002 zahlt man mit Euro-Scheinen und -Münzen. Ein Euro waren 1,95583 Mark, und viele rechnen bis heute heimlich um.'],
  ['de-10-1', '2010', 'saying', '„YOLO!“', '„You only live once“, man lebt nur einmal. 2012 wurde es zum Jugendwort des Jahres gewählt.'],
  ['de-10-2', '2010', 'thing', 'Das erste Selfie mit ausgestrecktem Arm', 'Mit der Kamera vorn am Smartphone wurden Selfies alltäglich. 2013 wählte das Oxford-Wörterbuch „Selfie“ zum Wort des Jahres.'],
  ['de-10-3', '2010', 'saying', '„Läuft bei dir!“', 'Jugendwort des Jahres 2014. Es heißt „bei dir klappt alles“ und wurde gern auch ironisch gesagt.'],
];

const EN: Raw[] = [
  ['en-60-1', '1960', 'saying', '“Groovy!”', 'Jazz slang from the 1930s (“in the groove”) that the ’60s kids made their word for anything cool.'],
  ['en-60-2', '1960', 'saying', '“Far out, man!”', 'Hippie talk for something amazing, so far from ordinary it blows your mind.'],
  ['en-60-3', '1960', 'thing', 'The whole family gathers around the TV for the moon landing', 'On July 20, 1969, about 600 million people worldwide watched Neil Armstrong step onto the Moon in grainy black and white.'],
  ['en-60-4', '1960', 'thing', 'The milkman leaves glass bottles on the porch', 'Milk came to the door in glass bottles. The empties went back on the porch, sometimes with a note asking for extra cream or eggs.'],
  ['en-60-5', '1960', 'saying', '“Sock it to me!”', 'A catchphrase from “Rowan & Martin’s Laugh-In” (1968). Even Richard Nixon said it on the show.'],
  ['en-70-1', '1970', 'saying', '“Keep on truckin’!”', 'From Robert Crumb’s comic of strutting men. In the ’70s it was on T-shirts and posters everywhere and meant “keep going.”'],
  ['en-70-2', '1970', 'saying', '“Dy-no-mite!”', 'J.J.’s catchphrase on the sitcom “Good Times” (1974 to 1979), shouted whenever something was great.'],
  ['en-70-3', '1970', 'thing', 'After the late show, the station signs off with the anthem and a test pattern', 'Stations didn’t broadcast all night. They played the national anthem, then showed the test pattern with a steady tone until morning.'],
  ['en-70-4', '1970', 'thing', 'Waiting in line for gas on odd and even days', 'During the oil crises of 1973 and 1979, many states rationed gas: cars with an odd last plate number filled up on odd days, even ones on even days.'],
  ['en-70-5', '1970', 'saying', '“Catch you on the flip side!”', 'CB radio and DJ slang for “see you later,” like the other side of a record.'],
  ['en-70-6', '1970', 'thing', 'The phone hangs on the kitchen wall with a long curly cord', 'One phone for the whole house. A long cord meant you could stretch into the pantry for a private call.'],
  ['en-80-1', '1980', 'saying', '“Gag me with a spoon!”', 'Valley Girl talk, made famous by the 1982 song “Valley Girl” by Frank Zappa and his daughter Moon Unit.'],
  ['en-80-2', '1980', 'saying', '“Totally tubular!”', 'Surfer slang for “awesome,” after the perfect curling tube of a wave.'],
  ['en-80-3', '1980', 'saying', '“Where’s the beef?”', 'From a 1984 Wendy’s commercial with Clara Peller. Walter Mondale even used it in a presidential primary debate.'],
  ['en-80-4', '1980', 'thing', 'Rewinding the cassette with a pencil', 'When the tape got tangled, or to save the Walkman’s batteries: stick a pencil in the reel and wind.'],
  ['en-80-5', '1980', 'thing', 'Saturday morning cartoons in your pajamas', 'The networks filled Saturday mornings with cartoons like the Smurfs, and kids ate cereal in front of the TV in their pajamas.'],
  ['en-80-6', '1980', 'thing', 'Be kind, please rewind (the video store tape)', 'Video rental stores charged a fee if you brought a VHS tape back without rewinding it.'],
  ['en-80-7', '1980', 'saying', '“Gnarly!”', 'Surfer word that could mean awesome or gross, depending on how you said it.'],
  ['en-90-1', '1990', 'saying', '“Talk to the hand!”', 'Said with a hand held up in someone’s face: “talk to the hand, ’cause the face ain’t listening.”'],
  ['en-90-2', '1990', 'saying', '“Don’t have a cow, man!”', 'Bart Simpson’s catchphrase on “The Simpsons.” It means “calm down.”'],
  ['en-90-3', '1990', 'thing', 'Feeding the Tamagotchi under the school desk', 'The little egg-shaped pet from Japan arrived in 1997. If you didn’t feed it, it died, so many schools banned it.'],
  ['en-90-4', '1990', 'thing', 'Get off the phone, I need to go online!', 'The modem dialed in over the phone line, screeching as it connected. While you were online, nobody could call or be called.'],
  ['en-90-5', '1990', 'saying', '“As if!”', 'Cher’s catchphrase in the movie “Clueless” (1995): no way, not in a million years.'],
  ['en-90-6', '1990', 'thing', 'Taping songs off the radio before the DJ talks over them', 'Finger on the record button, waiting by the radio for the countdown. If the DJ talked into the song, the recording was ruined.'],
  ['en-00-1', '2000', 'saying', '“That’s hot.”', 'Paris Hilton’s trademark line on the reality show “The Simple Life” (2003).'],
  ['en-00-2', '2000', 'thing', 'Texting on T9, pressing 7 four times for an S', 'Each key had three or four letters, so you tapped until the right one came up. T9 then guessed the word from one tap per letter.'],
  ['en-00-3', '2000', 'thing', 'Playing Snake on the Nokia until the battery dies', 'The game came to Nokia phones in 1997. The snake grows with every bite, and if it bites its own tail, the game is over.'],
  ['en-00-4', '2000', 'saying', '“Can you hear me now?”', 'From the Verizon Wireless ads (2002 to 2011), where a test man walked everywhere checking the signal.'],
  ['en-00-5', '2000', 'thing', 'Burning the perfect mix CD for someone special', 'A blank CD with hand-picked songs and a handwritten track list. Getting the order just right took all evening.'],
  ['en-10-1', '2010', 'saying', '“YOLO!”', '“You only live once.” Drake’s 2011 song “The Motto” made it everywhere.'],
  ['en-10-2', '2010', 'thing', 'The first selfie with your arm stretched out', 'Front cameras on smartphones made selfies part of everyday life. Oxford Dictionaries named “selfie” its Word of the Year in 2013.'],
  ['en-10-3', '2010', 'saying', '“On fleek!”', 'From a 2014 Vine video about perfect eyebrows. It means “just perfect.”'],
];

const toItem = ([id, decade, kind, text, info]: Raw): TickerItem => ({ id, decade, kind, text, info });
const ALL = [...DE, ...EN].map(toItem);

// One entry per year with a hand-picked line from lib/yearFacts.ts (the
// arrival show), plus that year's No. 1 hit: "1989: the year the Berlin Wall
// fell". Built in the current language; the id is the same in both.
function yearItem(year: number): TickerItem | null {
  const line = yearOf(year);
  if (!line) return null;
  const hit = hitOf(year);
  return {
    id: `year-${year}`,
    decade: String(Math.floor(year / 10) * 10),
    kind: 'year',
    text: `${year}: ${line}`,
    info: hit
      ? tr(
        `The No. 1 hit of ${year} in the US charts: “${hit.title}” by ${hit.artist}.`,
        `Der Nummer-1-Hit von ${year} in den US-Charts: „${hit.title}“ von ${hit.artist}.`
      )
      : tr(`Something many people remember about ${year}.`, `Daran erinnern sich viele, wenn sie an ${year} denken.`),
  };
}

function yearItems(): TickerItem[] {
  const out: TickerItem[] = [];
  for (let y = 1945; y <= new Date().getFullYear(); y++) {
    const item = yearItem(y);
    if (item) out.push(item);
  }
  return out;
}

// Sayings and things the AI came up with when everything above had run past
// (lib/tickerFeed.ts, api/gemini.js "tickerMore"). Kept on this device so they
// join the run next time; one put in the Grabbelkiste is stored with it
// (lib/grabbelkiste.ts), so it travels to the other devices too.
const AI_KEY = 'retromind.ticker.zeitreise.ai';
const AI_MAX = 240;

function loadAi(): TickerItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(AI_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((i) => i && typeof i.id === 'string' && typeof i.text === 'string') : [];
  } catch {
    return [];
  }
}

let aiItems: TickerItem[] = loadAi();

const hash = (text: string) => {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};

/** Adds AI entries (text, info, decade, kind) and returns them as ticker items. */
export function addAiTickerItems(raw: { decade?: string; kind?: string; text?: string; info?: string }[]): TickerItem[] {
  const lang = getLang();
  const known = new Set([...tickerItems(), ...aiItems].map((i) => i.text.toLowerCase()));
  const fresh: TickerItem[] = [];
  for (const r of raw) {
    const text = String(r.text || '').trim().slice(0, 140);
    const info = String(r.info || '').trim().slice(0, 500);
    if (!text || !info || known.has(text.toLowerCase())) continue;
    known.add(text.toLowerCase());
    const decade = /^(19|20)\d0$/.test(String(r.decade)) ? String(r.decade) : '1980';
    fresh.push({ id: `ai-${lang}-${hash(text)}`, decade, kind: r.kind === 'thing' ? 'thing' : 'saying', text, info });
  }
  if (fresh.length) {
    aiItems = [...aiItems, ...fresh].slice(-AI_MAX);
    try {
      localStorage.setItem(AI_KEY, JSON.stringify(aiItems));
    } catch {
      /* storage full: they still run this visit */
    }
  }
  return fresh;
}

const isAi = (id: string) => id.startsWith('ai-');

/** Every hand-written ticker item in the current language. */
export function tickerItems(): TickerItem[] {
  return (getLang() === 'de' ? DE : EN).map(toItem);
}

/** Everything that can run in the ticker now: hand-written, years, and loaded ones. */
export function tickerPool(): TickerItem[] {
  const lang = getLang();
  return [...tickerItems(), ...yearItems(), ...aiItems.filter((i) => i.id.startsWith(`ai-${lang}-`))];
}

/** Looks an item up by id, whatever language it was saved in. */
export function tickerItem(id: string): TickerItem | undefined {
  if (id.startsWith('year-')) return yearItem(Number(id.slice(5))) ?? undefined;
  if (isAi(id)) return aiItems.find((i) => i.id === id) ?? keptItem(id);
  // Fun facts from the gaming hall live in the box with their words.
  return ALL.find((i) => i.id === id) ?? keptItem(id);
}

/**
 * The order a full round of the ticker is dealt in: shuffled, with the
 * person's own decade first and a bit more often, so every visit reads a
 * little different.
 */
export function tickerOrder(items: TickerItem[], focusDecade: string): TickerItem[] {
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
  while (own.length || rest.length) {
    if (own.length && (run.length % 3 === 0 || !rest.length)) run.push(own.shift()!);
    else run.push(rest.shift()!);
  }
  return run;
}
