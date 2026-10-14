import { isGerman } from './i18n';

// What a year stands for, and its No. 1 hit, for the arrival show
// (components/ArrivalShow) and the "Welcome to the year …" heading
// (components/YearWelcome). Marco, 2026-10-14: the arrival should read
// "1989 … the year of …" and play a short bit of a No. 1 hit of that year as
// a fanfare at the lock-in.
//
// The lines are hand-picked, one per year, something people of that year
// remember (German readers get a German moment where one is better known
// there). The hits are the No. 1 of the US year-end chart (Billboard), the
// same list in both languages; the clip itself comes from the preview
// service the gaming hall already uses (api/spotify-preview, via Deezer).

const YEAR_OF: Record<number, [en: string, de: string]> = {
  1945: ['the year of peace in Europe', 'das Jahr des Kriegsendes'],
  1946: ['the year of the first bikini', 'das Jahr des ersten Bikinis'],
  1947: ['the year the sound barrier was broken', 'das Jahr, in dem die Schallmauer durchbrochen wurde'],
  1948: ['the year of the Berlin Airlift', 'das Jahr der D-Mark und der Luftbrücke'],
  1949: ['the year West Germany was founded', 'das Jahr, in dem die Bundesrepublik gegründet wurde'],
  1950: ['the year of the first credit card', 'das Jahr der ersten Kreditkarte'],
  1951: ['the year of the first colour TV broadcast', 'das Jahr der ersten Farbfernsehsendung'],
  1952: ['the year of the first "Tagesschau"', 'das Jahr der ersten „Tagesschau“'],
  1953: ['the year Mount Everest was first climbed', 'das Jahr der Erstbesteigung des Mount Everest'],
  1954: ['the year of the "Miracle of Bern"', 'das Jahr des Wunders von Bern'],
  1955: ['the year Disneyland opened', 'das Jahr, in dem Disneyland eröffnete'],
  1956: ['the year of "Heartbreak Hotel"', 'das Jahr von Elvis’ „Heartbreak Hotel“'],
  1957: ['the year of Sputnik', 'das Jahr des Sputnik'],
  1958: ['the year of the hula hoop', 'das Jahr des Hula-Hoop-Reifens'],
  1959: ['the year of the first Barbie', 'das Jahr der ersten Barbie'],
  1960: ['the year the Beatles first played Hamburg', 'das Jahr, in dem die Beatles zum ersten Mal in Hamburg spielten'],
  1961: ['the year of the first man in space', 'das Jahr des ersten Menschen im All'],
  1962: ['the year of the first James Bond film', 'das Jahr des ersten James-Bond-Films'],
  1963: ['the year of "I have a dream"', 'das Jahr von „Ich bin ein Berliner“'],
  1964: ['the year of Beatlemania', 'das Jahr der Beatlemania'],
  1965: ['the year of the first spacewalk', 'das Jahr des ersten Weltraumspaziergangs'],
  1966: ['the year of the Wembley goal', 'das Jahr des Wembley-Tors'],
  1967: ['the year of the Summer of Love', 'das Jahr, in dem das Farbfernsehen kam'],
  1968: ['the year of "Earthrise"', 'das Jahr der 68er'],
  1969: ['the year of the moon landing', 'das Jahr der Mondlandung'],
  1970: ['the year the Beatles split up', 'das Jahr, in dem sich die Beatles trennten'],
  1971: ['the year of the first email', 'das Jahr der ersten E-Mail'],
  1972: ['the year of Pong', 'das Jahr der Olympischen Spiele in München'],
  1973: ['the year of the first mobile phone call', 'das Jahr der autofreien Sonntage'],
  1974: ['the year of the Rubik’s Cube', 'das Jahr des WM-Titels in München'],
  1975: ['the year of "Bohemian Rhapsody"', 'das Jahr von „Bohemian Rhapsody“'],
  1976: ['the year Apple was founded', 'das Jahr, in dem Apple gegründet wurde'],
  1977: ['the year of "Star Wars"', 'das Jahr von „Krieg der Sterne“'],
  1978: ['the year of Space Invaders', 'das Jahr von Space Invaders'],
  1979: ['the year of the Walkman', 'das Jahr des Walkman'],
  1980: ['the year of Pac-Man', 'das Jahr von Pac-Man'],
  1981: ['the year MTV went on air', 'das Jahr, in dem MTV auf Sendung ging'],
  1982: ['the year of "E.T."', 'das Jahr von „Ein bisschen Frieden“'],
  1983: ['the year of the first mobile phone for sale', 'das Jahr von „99 Luftballons“'],
  1984: ['the year of the Macintosh', 'das Jahr, in dem das Privatfernsehen startete'],
  1985: ['the year of Live Aid', 'das Jahr, in dem Boris Becker Wimbledon gewann'],
  1986: ['the year of Halley’s Comet', 'das Jahr des Halleyschen Kometen'],
  1987: ['the year of "Dirty Dancing"', 'das Jahr von „Dirty Dancing“'],
  1988: ['the year of Steffi Graf’s Golden Slam', 'das Jahr von Steffi Grafs Golden Slam'],
  1989: ['the year of the fall of the Berlin Wall', 'das Jahr des Mauerfalls'],
  1990: ['the year of German reunification', 'das Jahr der Wiedervereinigung'],
  1991: ['the year the World Wide Web went online', 'das Jahr, in dem das World Wide Web online ging'],
  1992: ['the year of the first text message', 'das Jahr der ersten SMS'],
  1993: ['the year of "Jurassic Park"', 'das Jahr von „Jurassic Park“'],
  1994: ['the year of the PlayStation', 'das Jahr der PlayStation'],
  1995: ['the year of "Toy Story"', 'das Jahr von „Toy Story“'],
  1996: ['the year of the Tamagotchi', 'das Jahr des Tamagotchi'],
  1997: ['the year of the first Harry Potter book', 'das Jahr des ersten Harry-Potter-Buchs'],
  1998: ['the year Google was founded', 'das Jahr, in dem Google gegründet wurde'],
  1999: ['the year of the Y2K countdown', 'das Jahr des Millennium-Countdowns'],
  2000: ['the year of the new millennium', 'das Jahr des neuen Jahrtausends'],
  2001: ['the year of the iPod', 'das Jahr des iPod'],
  2002: ['the year the euro came', 'das Jahr, in dem der Euro kam'],
  2003: ['the year of Skype', 'das Jahr von „Good Bye, Lenin!“'],
  2004: ['the year Facebook started', 'das Jahr, in dem Facebook startete'],
  2005: ['the year of YouTube', 'das Jahr von YouTube'],
  2006: ['the year of the World Cup "summer fairy tale"', 'das Jahr des Sommermärchens'],
  2007: ['the year of the iPhone', 'das Jahr des iPhone'],
  2008: ['the year of "Yes we can"', 'das Jahr von „Yes we can“'],
  2009: ['the year of "Avatar"', 'das Jahr von „Avatar“'],
  2010: ['the year of the iPad and Instagram', 'das Jahr von Lenas „Satellite“'],
  2011: ['the year of Minecraft', 'das Jahr von Minecraft'],
  2012: ['the year of "Gangnam Style"', 'das Jahr von „Gangnam Style“'],
  2013: ['the year of the selfie', 'das Jahr des Selfies'],
  2014: ['the year of the Ice Bucket Challenge', 'das Jahr des WM-Titels in Rio'],
  2015: ['the year of "Uptown Funk"', 'das Jahr von „Uptown Funk“'],
  2016: ['the year of Pokémon Go', 'das Jahr von Pokémon Go'],
  2017: ['the year of the fidget spinner', 'das Jahr der Fidget Spinner'],
  2018: ['the year of Fortnite', 'das Jahr von Fortnite'],
  2019: ['the year of the first photo of a black hole', 'das Jahr des ersten Fotos eines Schwarzen Lochs'],
  2020: ['the year of the lockdowns', 'das Jahr des Lockdowns'],
  2021: ['the year of the vaccines', 'das Jahr der Impfungen'],
  2022: ['the year of ChatGPT', 'das Jahr von ChatGPT'],
  2023: ['the year of "Barbenheimer"', 'das Jahr von „Barbenheimer“'],
  2024: ['the year of the Eras Tour', 'das Jahr der Heim-EM'],
};

/** "the year of the fall of the Berlin Wall", or null for a year without a line. */
export function yearOf(year: number): string | null {
  const line = YEAR_OF[year];
  return line ? line[isGerman ? 1 : 0] : null;
}

// The No. 1 of the US year-end chart, [title, artist].
const HITS: Record<number, [string, string]> = {
  1950: ['Goodnight Irene', 'The Weavers'],
  1951: ['Too Young', 'Nat King Cole'],
  1952: ['Blue Tango', 'Leroy Anderson'],
  1953: ['Song from Moulin Rouge', 'Percy Faith'],
  1954: ['Little Things Mean a Lot', 'Kitty Kallen'],
  1955: ['Cherry Pink and Apple Blossom White', 'Perez Prado'],
  1956: ['Heartbreak Hotel', 'Elvis Presley'],
  1957: ['All Shook Up', 'Elvis Presley'],
  1958: ['Volare', 'Domenico Modugno'],
  1959: ['The Battle of New Orleans', 'Johnny Horton'],
  1960: ['Theme from A Summer Place', 'Percy Faith'],
  1961: ['Tossin’ and Turnin’', 'Bobby Lewis'],
  1962: ['Stranger on the Shore', 'Acker Bilk'],
  1963: ['Sugar Shack', 'Jimmy Gilmer and the Fireballs'],
  1964: ['I Want to Hold Your Hand', 'The Beatles'],
  1965: ['Wooly Bully', 'Sam the Sham and the Pharaohs'],
  1966: ['The Ballad of the Green Berets', 'Barry Sadler'],
  1967: ['To Sir with Love', 'Lulu'],
  1968: ['Hey Jude', 'The Beatles'],
  1969: ['Sugar, Sugar', 'The Archies'],
  1970: ['Bridge over Troubled Water', 'Simon & Garfunkel'],
  1971: ['Joy to the World', 'Three Dog Night'],
  1972: ['The First Time Ever I Saw Your Face', 'Roberta Flack'],
  1973: ['Tie a Yellow Ribbon Round the Ole Oak Tree', 'Tony Orlando and Dawn'],
  1974: ['The Way We Were', 'Barbra Streisand'],
  1975: ['Love Will Keep Us Together', 'Captain & Tennille'],
  1976: ['Silly Love Songs', 'Wings'],
  1977: ['Tonight’s the Night', 'Rod Stewart'],
  1978: ['Shadow Dancing', 'Andy Gibb'],
  1979: ['My Sharona', 'The Knack'],
  1980: ['Call Me', 'Blondie'],
  1981: ['Bette Davis Eyes', 'Kim Carnes'],
  1982: ['Physical', 'Olivia Newton-John'],
  1983: ['Every Breath You Take', 'The Police'],
  1984: ['When Doves Cry', 'Prince'],
  1985: ['Careless Whisper', 'Wham!'],
  1986: ['That’s What Friends Are For', 'Dionne Warwick'],
  1987: ['Walk Like an Egyptian', 'The Bangles'],
  1988: ['Faith', 'George Michael'],
  1989: ['Look Away', 'Chicago'],
  1990: ['Hold On', 'Wilson Phillips'],
  1991: ['(Everything I Do) I Do It for You', 'Bryan Adams'],
  1992: ['End of the Road', 'Boyz II Men'],
  1993: ['I Will Always Love You', 'Whitney Houston'],
  1994: ['The Sign', 'Ace of Base'],
  1995: ['Gangsta’s Paradise', 'Coolio'],
  1996: ['Macarena', 'Los del Rio'],
  1997: ['Candle in the Wind 1997', 'Elton John'],
  1998: ['Too Close', 'Next'],
  1999: ['Believe', 'Cher'],
  2000: ['Breathe', 'Faith Hill'],
  2001: ['Hanging by a Moment', 'Lifehouse'],
  2002: ['How You Remind Me', 'Nickelback'],
  2003: ['In da Club', '50 Cent'],
  2004: ['Yeah!', 'Usher'],
  2005: ['We Belong Together', 'Mariah Carey'],
  2006: ['Bad Day', 'Daniel Powter'],
  2007: ['Irreplaceable', 'Beyoncé'],
  2008: ['Low', 'Flo Rida'],
  2009: ['Boom Boom Pow', 'The Black Eyed Peas'],
  2010: ['Tik Tok', 'Kesha'],
  2011: ['Rolling in the Deep', 'Adele'],
  2012: ['Somebody That I Used to Know', 'Gotye'],
  2013: ['Thrift Shop', 'Macklemore & Ryan Lewis'],
  2014: ['Happy', 'Pharrell Williams'],
  2015: ['Uptown Funk', 'Mark Ronson'],
  2016: ['Love Yourself', 'Justin Bieber'],
  2017: ['Shape of You', 'Ed Sheeran'],
  2018: ['God’s Plan', 'Drake'],
  2019: ['Old Town Road', 'Lil Nas X'],
  2020: ['Blinding Lights', 'The Weeknd'],
  2021: ['Levitating', 'Dua Lipa'],
  2022: ['Heat Waves', 'Glass Animals'],
  2023: ['Last Night', 'Morgan Wallen'],
  2024: ['Lose Control', 'Teddy Swims'],
};

export interface YearHit {
  title: string;
  artist: string;
}

export function hitOf(year: number): YearHit | null {
  const h = HITS[year];
  return h ? { title: h[0], artist: h[1] } : null;
}

/** The hit's preview clip, fetched through our own server (no third party sees the visitor). */
export function hitClipUrl(hit: YearHit): string {
  return `/api/spotify-preview?q=${encodeURIComponent(`${hit.title} · ${hit.artist}`.replace(/’/g, "'"))}`;
}
