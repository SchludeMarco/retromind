import { LANG, tr } from './i18n';

// Favourite bands for your whole life so far (Marco, 2026-10-18: "Lieblings-
// bands vorschlagen/eintragen für gesamte Zeit seit Geburtstag. So könnte
// sich die Liste rasch füllen. Aber der User soll sich nicht genötigt
// fühlen."). For every five years from the birth year until today the
// suggestion box shows the acts that were big back then; one tap puts one on
// the list. Nothing is required: the box starts closed and the list may stay
// empty. Names marked `de:` are German acts and only show in the German UI.

interface Span {
  from: number;
  artists: string[];
}

const SPANS: Span[] = [
  { from: 1950, artists: ['Elvis Presley', 'Frank Sinatra', 'Chuck Berry', 'Bill Haley', 'Little Richard', 'Buddy Holly', 'Johnny Cash', 'Ella Fitzgerald', 'de:Freddy Quinn', 'de:Caterina Valente', 'de:Peter Kraus', 'de:Conny Froboess'] },
  { from: 1960, artists: ['The Beatles', 'The Rolling Stones', 'The Beach Boys', 'Ray Charles', 'Cliff Richard', 'The Shadows', 'Ricky Nelson', 'Brenda Lee', 'de:Heintje', 'de:Peter Alexander', 'Connie Francis', 'de:Roy Black'] },
  { from: 1965, artists: ['The Beatles', 'The Who', 'The Doors', 'Jimi Hendrix', 'Simon & Garfunkel', 'Aretha Franklin', 'The Supremes', 'Bob Dylan', 'The Kinks', 'de:Udo Jürgens', 'de:Drafi Deutscher', 'de:Rex Gildo'] },
  { from: 1970, artists: ['Led Zeppelin', 'Deep Purple', 'The Jackson 5', 'Elton John', 'David Bowie', 'Pink Floyd', 'T. Rex', 'Carpenters', 'Sweet', 'de:Karel Gott', 'de:Katja Ebstein', 'de:Ton Steine Scherben'] },
  { from: 1975, artists: ['ABBA', 'Queen', 'Bee Gees', 'Fleetwood Mac', 'Boney M.', 'Smokie', 'Eagles', 'Donna Summer', 'Kiss', 'de:Udo Lindenberg', 'de:Kraftwerk', 'de:Marianne Rosenberg'] },
  { from: 1980, artists: ['Michael Jackson', 'Madonna', 'Duran Duran', 'AC/DC', 'The Police', 'Depeche Mode', 'Dire Straits', 'Culture Club', 'Iron Maiden', 'de:Nena', 'de:Spider Murphy Gang', 'de:Herbert Grönemeyer', 'de:Trio', 'de:Ideal'] },
  { from: 1985, artists: ['a-ha', 'Bon Jovi', 'Whitney Houston', 'Guns N’ Roses', 'U2', 'Modern Talking', 'Europe', 'Metallica', 'Roxette', 'Pet Shop Boys', 'de:Die Ärzte', 'de:Die Toten Hosen', 'de:Falco', 'de:Münchener Freiheit'] },
  { from: 1990, artists: ['Nirvana', 'Roxette', 'Snap!', 'Dr. Alban', 'Take That', 'R.E.M.', 'Red Hot Chili Peppers', 'Mariah Carey', 'Ace of Base', 'de:Die Fantastischen Vier', 'de:Scooter', 'de:Pur', 'de:Matthias Reim'] },
  { from: 1995, artists: ['Backstreet Boys', 'Spice Girls', 'Oasis', 'Blur', 'No Doubt', 'Green Day', 'Britney Spears', 'Eminem', 'de:Kelly Family', 'de:Die Prinzen', 'de:Rammstein', 'de:Echt', 'de:Tic Tac Toe'] },
  { from: 2000, artists: ['Linkin Park', 'Eminem', 'Coldplay', 'Destiny’s Child', 'Robbie Williams', 'Shakira', 'The White Stripes', 'Outkast', 'Christina Aguilera', 'de:No Angels', 'de:Wir sind Helden', 'de:Juli', 'de:Xavier Naidoo'] },
  { from: 2005, artists: ['Amy Winehouse', 'Rihanna', 'Beyoncé', 'Arctic Monkeys', 'The Killers', 'Lady Gaga', 'Black Eyed Peas', 'Muse', 'Kings of Leon', 'de:Silbermond', 'de:Tokio Hotel', 'de:Rosenstolz', 'de:Peter Fox'] },
  { from: 2010, artists: ['Adele', 'Bruno Mars', 'Katy Perry', 'Mumford & Sons', 'Imagine Dragons', 'One Direction', 'Taylor Swift', 'Avicii', 'Ed Sheeran', 'de:Cro', 'de:Helene Fischer', 'de:Revolverheld', 'de:Andreas Bourani'] },
  { from: 2015, artists: ['Ed Sheeran', 'Dua Lipa', 'The Weeknd', 'Billie Eilish', 'Twenty One Pilots', 'Lewis Capaldi', 'Post Malone', 'Sia', 'de:Mark Forster', 'de:AnnenMayKantereit', 'de:Clueso', 'de:Max Giesinger'] },
  { from: 2020, artists: ['Harry Styles', 'Olivia Rodrigo', 'Måneskin', 'Doja Cat', 'Miley Cyrus', 'Coldplay', 'Sabrina Carpenter', 'Taylor Swift', 'de:Nina Chuba', 'de:Ayliva', 'de:Badmómzjay', 'de:Apache 207'] },
];

const FIRST = SPANS[0].from;

export interface BandSpan {
  from: number;
  to: number;
  /** "1985–1989 · aged 3–7" */
  label: string;
  artists: string[];
}

/** The five-year spans from the birth year (or the 1950s) until today, oldest first. */
export function bandSpans(birthYear: number | null): BandSpan[] {
  const now = new Date().getFullYear();
  const start = Math.max(birthYear ?? FIRST, FIRST);
  const out: BandSpan[] = [];
  SPANS.forEach((span, i) => {
    const to = Math.min((SPANS[i + 1]?.from ?? span.from + 10) - 1, now);
    if (to < start || span.from > now) return;
    const artists = span.artists
      .filter((a) => LANG === 'de' || !a.startsWith('de:'))
      .map((a) => a.replace(/^de:/, ''));
    const years = `${span.from}–${to}`;
    let label = years;
    if (birthYear) {
      const a = Math.max(0, span.from - birthYear);
      const b = to - birthYear;
      label += a === b ? tr(` · aged ${a}`, ` · mit ${a}`) : tr(` · aged ${a}–${b}`, ` · mit ${a}–${b}`);
    }
    out.push({ from: span.from, to, label, artists });
  });
  return out;
}
