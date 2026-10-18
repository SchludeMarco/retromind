import { tr } from './i18n';
import { IdeaGroup, ageSuffix, dedupeGroups, localize, norm } from './picks';

// Favourite bands for your whole life so far (Marco, 2026-10-18: "Lieblings-
// bands vorschlagen/eintragen für gesamte Zeit seit Geburtstag. So könnte
// sich die Liste rasch füllen. Aber der User soll sich nicht genötigt
// fühlen."). For every five years from the birth year until today the
// suggestion box shows the acts that were big back then; one tap puts one on
// the list. Nothing is required: the box starts closed and the list may stay
// empty. Names marked `de:` are German acts and only show in the German UI.
//
// Marco, 2026-10-18: the ideas should follow what is already on the list, and
// may reach further back in time ("Michael Jackson", "Elvis"). So the box
// opens with acts that sound like your favourites (GENRES, old legends of the
// same style included), then the all-time legends for every age, then the
// five-year spans.

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

/** All-time greats, offered whatever the birth year. */
const LEGENDS = [
  'Elvis Presley', 'The Beatles', 'Michael Jackson', 'Queen', 'ABBA', 'The Rolling Stones', 'Madonna', 'David Bowie',
  'Frank Sinatra', 'Johnny Cash', 'Aretha Franklin', 'Bob Dylan', 'Elton John', 'Pink Floyd', 'Bee Gees',
  'Whitney Houston', 'Prince', 'Tina Turner', 'Stevie Wonder', 'de:Udo Jürgens', 'de:Udo Lindenberg', 'de:Nena',
];

/** Style families: a favourite from one brings up the others, old and new. */
const GENRES: string[][] = [
  // rock 'n' roll and early pop
  ['Elvis Presley', 'Chuck Berry', 'Little Richard', 'Buddy Holly', 'Bill Haley', 'Jerry Lee Lewis', 'Johnny Cash', 'The Everly Brothers', 'de:Peter Kraus', 'The Beatles'],
  ['The Beach Boys', 'The Beatles', 'Simon & Garfunkel', 'The Mamas & the Papas', 'The Monkees', 'The Byrds', 'Cliff Richard', 'The Shadows', 'Ricky Nelson', 'Connie Francis', 'Brenda Lee', 'The Everly Brothers'],
  // rock
  ['The Beatles', 'The Rolling Stones', 'The Who', 'The Doors', 'Jimi Hendrix', 'Led Zeppelin', 'Deep Purple', 'Pink Floyd', 'Queen', 'The Kinks', 'Eagles', 'Fleetwood Mac', 'Dire Straits', 'U2', 'R.E.M.', 'Bruce Springsteen', 'Creedence Clearwater Revival', 'Status Quo', 'Bryan Adams', 'Måneskin'],
  ['AC/DC', 'Iron Maiden', 'Metallica', 'Kiss', 'Guns N’ Roses', 'Deep Purple', 'Led Zeppelin', 'Black Sabbath', 'Judas Priest', 'Motörhead', 'Scorpions', 'Europe', 'Bon Jovi', 'Def Leppard', 'Van Halen', 'Megadeth', 'de:Accept', 'Helloween', 'Rammstein', 'Måneskin'],
  ['David Bowie', 'T. Rex', 'Sweet', 'Queen', 'Elton John', 'Suzi Quatro', 'Slade', 'Smokie', 'Kiss'],
  ['Ramones', 'Sex Pistols', 'The Clash', 'Die Toten Hosen', 'Die Ärzte', 'Green Day', 'The Offspring', 'Blink-182', 'Bad Religion', 'Rise Against'],
  ['Nirvana', 'Pearl Jam', 'Soundgarden', 'Alice in Chains', 'Red Hot Chili Peppers', 'R.E.M.', 'Foo Fighters', 'The Smashing Pumpkins', 'Radiohead', 'Green Day', 'The White Stripes', 'Muse', 'Neil Young', 'The Who'],
  ['Linkin Park', 'Evanescence', 'My Chemical Romance', 'Fall Out Boy', 'Paramore', 'de:Tokio Hotel', 'Green Day', 'Blink-182', 'Twenty One Pilots', 'Imagine Dragons', 'Nirvana', 'Metallica'],
  ['Oasis', 'Blur', 'Pulp', 'The Verve', 'Coldplay', 'Arctic Monkeys', 'The Killers', 'Franz Ferdinand', 'Kings of Leon', 'The Smiths', 'The Cure', 'Muse', 'Radiohead', 'Travis', 'Kaiser Chiefs', 'Mumford & Sons', 'The Beatles', 'The Kinks', 'de:Wir sind Helden', 'de:Juli', 'de:AnnenMayKantereit'],
  // pop
  ['Michael Jackson', 'Madonna', 'Prince', 'Whitney Houston', 'Cyndi Lauper', 'George Michael', 'Wham!', 'Duran Duran', 'Culture Club', 'a-ha', 'Tears for Fears', 'Phil Collins', 'Tina Turner', 'Lionel Richie', 'Pet Shop Boys', 'Roxette', 'Modern Talking', 'Spandau Ballet', 'Simple Minds', 'Europe'],
  ['The Jackson 5', 'Michael Jackson', 'Stevie Wonder', 'Marvin Gaye', 'Aretha Franklin', 'The Supremes', 'Diana Ross', 'Ray Charles', 'James Brown', 'Otis Redding', 'Earth, Wind & Fire', 'Whitney Houston', 'Prince', 'Amy Winehouse', 'Bruno Mars', 'Beyoncé'],
  ['ABBA', 'Bee Gees', 'Boney M.', 'Donna Summer', 'Gloria Gaynor', 'Village People', 'Chic', 'Earth, Wind & Fire', 'Baccara', 'de:Dschinghis Khan', 'Michael Jackson', 'Madonna', 'Kylie Minogue', 'Dua Lipa'],
  ['Depeche Mode', 'Kraftwerk', 'Pet Shop Boys', 'The Human League', 'Eurythmics', 'Tears for Fears', 'Duran Duran', 'New Order', 'Erasure', 'a-ha', 'Ultravox', 'Alphaville', 'Yazoo', 'de:Trio', 'de:Ideal', 'de:Nena'],
  ['Snap!', 'Dr. Alban', 'Ace of Base', 'Haddaway', '2 Unlimited', 'Culture Beat', 'Captain Hollywood Project', 'Masterboy', 'La Bouche', 'Real McCoy', 'Scooter', 'Mr. President', 'DJ BoBo', 'Modern Talking', 'Boney M.'],
  ['Take That', 'Backstreet Boys', '*NSYNC', 'Spice Girls', 'Westlife', 'Boyzone', 'East 17', 'New Kids on the Block', 'Bros', 'One Direction', 'Robbie Williams', 'The Jackson 5', 'The Monkees', 'de:Kelly Family', 'de:Caught in the Act', 'de:Tic Tac Toe', 'de:No Angels', 'de:Echt'],
  ['Britney Spears', 'Christina Aguilera', 'Destiny’s Child', 'Beyoncé', 'Rihanna', 'Lady Gaga', 'Katy Perry', 'Shakira', 'Kylie Minogue', 'Justin Timberlake', 'Mariah Carey', 'Whitney Houston', 'Madonna', 'Taylor Swift', 'Ariana Grande', 'Dua Lipa', 'Olivia Rodrigo', 'Sabrina Carpenter', 'Miley Cyrus', 'Harry Styles'],
  ['Adele', 'Ed Sheeran', 'Lewis Capaldi', 'Billie Eilish', 'Sia', 'The Weeknd', 'Bruno Mars', 'Doja Cat', 'Harry Styles', 'Amy Winehouse', 'Elton John', 'Billy Joel', 'Phil Collins'],
  // songwriters
  ['Bob Dylan', 'Simon & Garfunkel', 'Cat Stevens', 'Joni Mitchell', 'Leonard Cohen', 'Neil Young', 'Elton John', 'Billy Joel', 'Tracy Chapman', 'Ed Sheeran', 'Mumford & Sons', 'de:Reinhard Mey', 'de:Hannes Wader', 'de:Konstantin Wecker', 'de:Udo Jürgens'],
  ['Johnny Cash', 'Dolly Parton', 'Kenny Rogers', 'Willie Nelson', 'Shania Twain', 'Garth Brooks', 'Taylor Swift', 'Elvis Presley', 'de:Truck Stop'],
  ['Frank Sinatra', 'Ella Fitzgerald', 'Louis Armstrong', 'Dean Martin', 'Nat King Cole', 'Bing Crosby', 'Tony Bennett', 'Michael Bublé', 'Norah Jones', 'Amy Winehouse'],
  // hip-hop and electronic
  ['Eminem', 'Outkast', 'Run-D.M.C.', 'Beastie Boys', 'Public Enemy', '2Pac', 'The Notorious B.I.G.', 'Dr. Dre', 'Snoop Dogg', 'Wu-Tang Clan', 'Black Eyed Peas', 'Kanye West', 'Jay-Z', 'MC Hammer', 'Post Malone', 'de:Die Fantastischen Vier', 'de:Fettes Brot', 'de:Absolute Beginner', 'de:Deichkind', 'de:Cro', 'de:Sido', 'de:Apache 207', 'de:Rödelheim Hartreim Projekt'],
  ['Kraftwerk', 'Jean-Michel Jarre', 'Daft Punk', 'The Prodigy', 'The Chemical Brothers', 'Moby', 'Faithless', 'Avicii', 'David Guetta', 'Calvin Harris', 'Depeche Mode', 'de:Scooter', 'de:Paul Kalkbrenner', 'de:Westbam', 'de:Robin Schulz'],
  // German only
  ['de:Nena', 'de:Trio', 'de:Ideal', 'de:Spider Murphy Gang', 'de:Markus', 'de:Extrabreit', 'de:Hubert Kah', 'de:Peter Schilling', 'de:Geier Sturzflug', 'de:Falco', 'de:Joachim Witt', 'de:Fehlfarben', 'de:Kraftwerk'],
  ['de:Udo Lindenberg', 'de:Herbert Grönemeyer', 'de:Peter Maffay', 'de:Westernhagen', 'de:BAP', 'de:Die Toten Hosen', 'de:Die Ärzte', 'de:Pur', 'de:Puhdys', 'de:Karat', 'de:City', 'de:Rio Reiser', 'de:Ton Steine Scherben', 'de:Silbermond', 'de:Revolverheld', 'de:Juli', 'de:Rosenstolz', 'de:Wir sind Helden', 'de:Münchener Freiheit'],
  ['de:Freddy Quinn', 'de:Caterina Valente', 'de:Conny Froboess', 'de:Heintje', 'de:Peter Alexander', 'de:Roy Black', 'de:Rex Gildo', 'de:Udo Jürgens', 'de:Karel Gott', 'de:Katja Ebstein', 'de:Marianne Rosenberg', 'de:Roland Kaiser', 'de:Howard Carpendale', 'de:Vicky Leandros', 'de:Nicole', 'de:Wolfgang Petry', 'de:Matthias Reim', 'de:Andrea Berg', 'de:Helene Fischer', 'de:Drafi Deutscher'],
  ['de:Mark Forster', 'de:Max Giesinger', 'de:Andreas Bourani', 'de:Clueso', 'de:Tim Bendzko', 'de:Philipp Poisel', 'de:Xavier Naidoo', 'de:Herbert Grönemeyer', 'de:Silbermond', 'de:Revolverheld'],
];

/** Acts that sound like the ones on the list, the best matches first (most shared styles). */
function relatedBands(artists: string[]): string[] {
  const mine = new Set(artists.map(norm));
  const score = new Map<string, { name: string; hits: number; first: number }>();
  let order = 0;
  for (const genre of GENRES) {
    const names = genre.map(localize).filter((n): n is string => !!n);
    // German-only acts still count as favourites in the English UI, they just aren't offered.
    if (!genre.some((n) => mine.has(norm(n.replace(/^(de|en):/, ''))))) continue;
    for (const name of names) {
      const k = norm(name);
      if (mine.has(k)) continue;
      const s = score.get(k) ?? { name, hits: 0, first: order++ };
      s.hits += 1;
      score.set(k, s);
    }
  }
  return [...score.values()].sort((a, b) => b.hits - a.hits || a.first - b.first).slice(0, 18).map((s) => s.name);
}

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
    const artists = span.artists.map(localize).filter((a): a is string => !!a);
    out.push({ from: span.from, to, label: `${span.from}–${to}` + ageSuffix(span.from, to, birthYear, tr), artists });
  });
  return out;
}

/**
 * Everything the idea box offers, in order: acts like your favourites (only
 * once the list has some), the all-time legends, then your years. Each name
 * shows once, in the first group it fits.
 */
export function bandIdeas(birthYear: number | null, artists: string[]): IdeaGroup[] {
  const related = relatedBands(artists);
  return dedupeGroups([
    { key: 'match', label: tr('🎯 Like your favorites', '🎯 Passend zu deinen Favoriten'), items: related },
    {
      key: 'legends',
      label: tr('👑 Legends of all time', '👑 Legenden aller Zeiten'),
      items: LEGENDS.map(localize).filter((a): a is string => !!a),
    },
    ...bandSpans(birthYear).map((s) => ({ key: String(s.from), label: s.label, items: s.artists })),
  ]);
}
