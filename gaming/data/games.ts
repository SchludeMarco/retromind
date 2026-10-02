// Curated catalog of half-forgotten games. Every entry is hand-written and
// deliberately conservative: facts here are the well-documented ones. Live
// details (summary, screenshots) are pulled from Wikipedia at runtime via
// `wiki` (the English article title), and deeper guides come from the AI.

export type Platform =
  | 'NES'
  | 'SNES'
  | 'Game Boy'
  | 'Master System'
  | 'Mega Drive'
  | 'C64'
  | 'Amiga'
  | 'MS-DOS'
  | 'PlayStation'
  | 'Nintendo 64'
  | 'Dreamcast';

export interface Game {
  id: string;
  title: string;
  year: number;
  platform: Platform | string;
  developer: string;
  genre: string;
  /** English Wikipedia article title — the anchor for live content. */
  wiki: string;
  /** Short German teaser. Missing for games found via search. */
  blurb?: string;
  tips?: string[];
  funFact?: string;
  /** true for games the user found via search rather than the catalog. */
  custom?: boolean;
}

/** Cartridge label colours per platform, so the grid reads like a shelf. */
export const PLATFORM_COLORS: Record<string, string> = {
  NES: '#c0392b',
  SNES: '#7d5fff',
  'Game Boy': '#8bac0f',
  'Master System': '#e74c3c',
  'Mega Drive': '#2d6cdf',
  C64: '#8e7cc3',
  Amiga: '#e67e22',
  'MS-DOS': '#95a5a6',
  PlayStation: '#00a8a8',
  'Nintendo 64': '#27ae60',
  Dreamcast: '#f39c12',
};

export const GAMES: Game[] = [
  {
    id: 'little-nemo',
    title: 'Little Nemo: The Dream Master',
    year: 1990,
    platform: 'NES',
    developer: 'Capcom',
    genre: "Jump 'n' Run",
    wiki: 'Little Nemo: The Dream Master',
    blurb:
      'Nemo wandert durch das Traumland Slumberland und füttert Tiere mit Bonbons, bis sie ihn auf sich reiten lassen – und er ihre Fähigkeiten bekommt.',
    tips: [
      'Bewirf Tiere mit Bonbons, bis sie einschlafen – dann springst du auf und übernimmst ihre Fähigkeiten.',
      'Die Tür am Levelende öffnet sich erst, wenn du alle Schlüssel gefunden hast.',
      'Jedes Tier erreicht andere Stellen: Die Biene fliegt, der Maulwurf gräbt sich durch Erde.',
    ],
    funFact: 'Basiert auf Winsor McCays Comic „Little Nemo in Slumberland“ von 1905.',
  },
  {
    id: 'gargoyles-quest',
    title: "Gargoyle's Quest",
    year: 1990,
    platform: 'Game Boy',
    developer: 'Capcom',
    genre: 'Action-Adventure',
    wiki: "Gargoyle's Quest",
    blurb:
      'Ein Ableger von Ghosts ’n Goblins, in dem ausnahmsweise das Monster der Held ist: der Feuerdämon Firebrand.',
    tips: [
      'Firebrand kann sich an Wände klammern und kurz schweben – fast jedes Hindernis ist darauf ausgelegt.',
      'Das Spiel speichert nicht: Schreib dir die Passwörter auf.',
    ],
    funFact: 'In Ghosts ’n Goblins war Firebrand noch der gefürchtete „Red Arremer“-Gegner.',
  },
  {
    id: 'rocket-knight',
    title: 'Rocket Knight Adventures',
    year: 1993,
    platform: 'Mega Drive',
    developer: 'Konami',
    genre: "Jump 'n' Run",
    wiki: 'Rocket Knight Adventures',
    blurb: 'Sparkster, ein Opossum-Ritter mit Raketenrucksack, rettet das Königreich Zebulos vor einer Schweine-Armee.',
    tips: [
      'Angriffsknopf gedrückt halten lädt den Raketenschub – beim Loslassen schießt Sparkster in die gewählte Richtung.',
      'Mit dem Schwanz hängt er sich an Äste und Seile.',
    ],
    funFact: 'Bekam 1994 die Fortsetzung „Sparkster“ und 2010 ein Remake.',
  },
  {
    id: 'toejam-earl',
    title: 'ToeJam & Earl',
    year: 1991,
    platform: 'Mega Drive',
    developer: 'Johnson Voorsanger Productions',
    genre: 'Roguelike / Action',
    wiki: 'ToeJam & Earl',
    blurb: 'Zwei Funk-Aliens sind auf der Erde abgestürzt und suchen in zufälligen Inselwelten die Teile ihres Raumschiffs.',
    tips: [
      'Unbekannte Geschenke sind ein Glücksspiel: manche helfen, manche schaden.',
      'Zu zweit teilt sich der Bildschirm automatisch, sobald ihr euch trennt.',
    ],
    funFact: 'Gilt als eines der ersten Konsolen-Roguelikes mit zufällig erzeugten Levels.',
  },
  {
    id: 'zak-mckracken',
    title: 'Zak McKracken and the Alien Mindbenders',
    year: 1988,
    platform: 'C64',
    developer: 'Lucasfilm Games',
    genre: 'Point & Click Adventure',
    wiki: 'Zak McKracken and the Alien Mindbenders',
    blurb:
      'Klatschreporter Zak entdeckt, dass Außerirdische die Menschheit per Telefon-Brummton verdummen wollen – eine Weltreise beginnt.',
    tips: [
      'Du steuerst vier Figuren: Wechsle oft, viele Rätsel brauchen Teamwork über Kontinente hinweg.',
      'Der Satzbaukasten („Benutze X mit Y“) ist dein Werkzeug – probier ungewöhnliche Kombinationen.',
    ],
    funFact: 'Deutsche Fans bauten Jahrzehnte später eigene Fortsetzungen, etwa „Between Time and Space“ (2008).',
  },
  {
    id: 'lemmings',
    title: 'Lemmings',
    year: 1991,
    platform: 'Amiga',
    developer: 'DMA Design',
    genre: 'Puzzle',
    wiki: 'Lemmings (video game)',
    blurb: 'Grünhaarige Wesen laufen stur geradeaus ins Verderben – du verteilst Berufe, damit sie heil ins Ziel kommen.',
    tips: [
      'Setz zuerst einen Blocker, um die Herde zu stoppen, und plane dann in Ruhe.',
      'Mit der Pause verteilst du Fähigkeiten ganz präzise.',
      'Alles verbockt? Der Atompilz sprengt alle Lemminge und beendet das Level.',
    ],
    funFact: 'Aus DMA Design wurde später Rockstar North – das Studio hinter GTA.',
  },
  {
    id: 'lost-vikings',
    title: 'The Lost Vikings',
    year: 1993,
    platform: 'SNES',
    developer: 'Silicon & Synapse',
    genre: 'Puzzle-Plattformer',
    wiki: 'The Lost Vikings',
    blurb: 'Drei Wikinger werden von Aliens entführt und müssen durch die Zeit zurück nach Hause – nur gemeinsam.',
    tips: [
      'Erik rennt und springt, Baleog kämpft mit Schwert und Bogen, Olaf blockt mit dem Schild und gleitet damit.',
      'Olafs Schild ist auch eine Plattform für die anderen.',
      'Notiere die Level-Passwörter.',
    ],
    funFact: 'Silicon & Synapse hieß kurz darauf Blizzard Entertainment.',
  },
  {
    id: 'another-world',
    title: 'Another World',
    year: 1991,
    platform: 'Amiga',
    developer: 'Éric Chahi / Delphine Software',
    genre: 'Cinematic Platformer',
    wiki: 'Another World (video game)',
    blurb: 'Ein Physiker landet nach einem Experiment auf einem fremden Planeten. Fast ohne Worte, fast nur Bilder.',
    tips: [
      'Sterben gehört dazu: Du startest am letzten Checkpoint und lernst jedes Mal etwas.',
      'Feuer gedrückt halten lädt einen Schild oder einen stärkeren Schuss.',
    ],
    funFact: 'Éric Chahi entwickelte das Spiel fast im Alleingang in rund zwei Jahren.',
  },
  {
    id: 'flashback',
    title: 'Flashback',
    year: 1992,
    platform: 'Amiga',
    developer: 'Delphine Software',
    genre: 'Cinematic Platformer',
    wiki: 'Flashback (1992 video game)',
    blurb: 'Conrad B. Hart erwacht ohne Gedächtnis im Dschungel eines fremden Mondes und stößt auf eine Verschwörung.',
    tips: [
      'Hör dir den Holocube gleich am Anfang an – er erklärt, wer du bist.',
      'Speicherstationen sind selten: Nutze jede einzelne.',
    ],
    funFact: 'Die flüssigen Bewegungen entstanden per Rotoskopie nach echten Filmaufnahmen.',
  },
  {
    id: 'turrican-2',
    title: 'Turrican II: The Final Fight',
    year: 1991,
    platform: 'Amiga',
    developer: 'Factor 5',
    genre: 'Run & Gun',
    wiki: 'Turrican II: The Final Fight',
    blurb: 'Riesige, frei erkundbare Level, eine Waffe für jede Lage und ein legendärer Soundtrack – Made in Germany.',
    tips: [
      'Der Energiestrahl lässt sich im Kreis schwenken und erreicht Gegner hinter Ecken.',
      'Als Gyroskop-Rad rollst du durch enge Gänge und legst Minen.',
    ],
    funFact: 'Die Musik von Chris Hülsbeck wird bis heute von Orchestern live gespielt.',
  },
  {
    id: 'giana-sisters',
    title: 'The Great Giana Sisters',
    year: 1987,
    platform: 'C64',
    developer: 'Time Warp Software / Rainbow Arts',
    genre: "Jump 'n' Run",
    wiki: 'The Great Giana Sisters',
    blurb: 'Giana träumt sich in eine Welt voller Ziegelblöcke und Eulen – und verschwand kurz nach Erscheinen aus den Läden.',
    tips: [
      'Mit dem Power-up bekommt Giana eine Punk-Frisur und kann Blöcke zerschlagen.',
      'Viele Blöcke verstecken Diamanten – klopf gegen alles, was verdächtig aussieht.',
    ],
    funFact: 'Wurde nach kurzer Zeit vom Markt genommen – wegen der großen Ähnlichkeit zu Super Mario Bros.',
  },
  {
    id: 'mischief-makers',
    title: 'Mischief Makers',
    year: 1997,
    platform: 'Nintendo 64',
    developer: 'Treasure',
    genre: 'Action-Plattformer',
    wiki: 'Mischief Makers',
    blurb: 'Roboter-Dienstmädchen Marina packt, schüttelt und wirft alles, was ihr in die Finger kommt.',
    tips: ['Schütteln ist alles: Packe Gegner und Gegenstände und rüttle – oft fällt etwas Nützliches heraus.'],
    funFact: 'Treasure-Spiele erschienen oft in kleiner Auflage und sind heute gesuchte Sammlerstücke.',
  },
  {
    id: 'beetle-adventure-racing',
    title: 'Beetle Adventure Racing!',
    year: 1999,
    platform: 'Nintendo 64',
    developer: 'Paradigm Entertainment / EA',
    genre: 'Rennspiel',
    wiki: 'Beetle Adventure Racing!',
    blurb: 'Ein Rennspiel nur mit dem VW New Beetle – und Strecken voller Abkürzungen, Höhlen und Dinosaurier.',
    tips: ['Jede Strecke versteckt Abkürzungen und Bonuskisten: Fahr bewusst abseits der Ideallinie.'],
    funFact: 'Heute ein Geheimtipp unter N64-Fans, damals im Schatten großer Rennspiel-Serien.',
  },
  {
    id: 'jet-force-gemini',
    title: 'Jet Force Gemini',
    year: 1999,
    platform: 'Nintendo 64',
    developer: 'Rare',
    genre: 'Third-Person-Shooter',
    wiki: 'Jet Force Gemini',
    blurb: 'Die Geschwister Juno und Vela und ihr Hund Lupus kämpfen gegen eine Insekten-Armee.',
    tips: ['Rette in jedem Level alle Tribals – sonst bleibt das wahre Ende verschlossen.'],
    funFact: 'Der Hund Lupus ist voll spielbar und kann mit seinem Jetpack schweben.',
  },
  {
    id: 'ape-escape',
    title: 'Ape Escape',
    year: 1999,
    platform: 'PlayStation',
    developer: 'Sony Computer Entertainment Japan',
    genre: "Jump 'n' Run",
    wiki: 'Ape Escape (video game)',
    blurb: 'Affen mit Blinkhelmen sind durch die Zeit geflohen. Du fängst sie mit dem Netz wieder ein.',
    tips: ['Linker Stick läuft, rechter Stick schwingt das Gadget – so landet jeder Affe im Netz.'],
    funFact: 'Das erste Spiel, das zwingend einen Controller mit zwei Analogsticks verlangte.',
  },
  {
    id: 'vagrant-story',
    title: 'Vagrant Story',
    year: 2000,
    platform: 'PlayStation',
    developer: 'Square',
    genre: 'Action-RPG',
    wiki: 'Vagrant Story',
    blurb: 'Ein düsteres Mittelalter-Rollenspiel in der verlassenen Stadt Leá Monde – ein Spätwerk der PS1-Ära.',
    tips: ['Ketten-Angriffe: Drück im richtigen Moment erneut für Combos, aber dein Risiko-Wert steigt dabei.'],
    funFact: 'Bekam von der japanischen Famitsu die Höchstwertung 40 von 40 Punkten.',
  },
  {
    id: 'skies-of-arcadia',
    title: 'Skies of Arcadia',
    year: 2000,
    platform: 'Dreamcast',
    developer: 'Overworks',
    genre: 'Rollenspiel',
    wiki: 'Skies of Arcadia',
    blurb: 'Luftpiraten, fliegende Inseln und Schiffsschlachten über den Wolken.',
    tips: ['Halte nach „Entdeckungen“ auf der Weltkarte Ausschau – sie bringen Gold und Ruhm.'],
    funFact: '2002 erschien die erweiterte Fassung „Legends“ für den GameCube.',
  },
  {
    id: 'jet-set-radio',
    title: 'Jet Set Radio',
    year: 2000,
    platform: 'Dreamcast',
    developer: 'Smilebit',
    genre: 'Action / Skating',
    wiki: 'Jet Set Radio',
    blurb: 'Auf Inline-Skates durch Tokio-to, Graffiti sprühen und vor der Polizei flüchten – zu einem unvergesslichen Soundtrack.',
    tips: ['Für große Graffiti fährst du die vorgegebenen Bewegungen mit dem Analogstick nach.'],
    funFact: 'Gilt als Wegbereiter des Cel-Shading-Looks.',
  },
  {
    id: 'star-control-2',
    title: 'Star Control II',
    year: 1992,
    platform: 'MS-DOS',
    developer: 'Toys for Bob',
    genre: 'Weltraum-Abenteuer',
    wiki: 'Star Control II',
    blurb: 'Eine offene Galaxie voller schräger Alien-Völker, Diplomatie und Raumschlachten.',
    tips: [
      'Sprich mit jedem Volk: Wissen ist hier die wichtigste Ressource.',
      'Heute legal und kostenlos spielbar als quelloffene Fassung „The Ur-Quan Masters“.',
    ],
    funFact: 'Die Entwickler gaben den Quellcode 2002 frei – daraus entstand „The Ur-Quan Masters“.',
  },
  {
    id: 'commander-keen',
    title: 'Commander Keen',
    year: 1990,
    platform: 'MS-DOS',
    developer: 'id Software',
    genre: "Jump 'n' Run",
    wiki: 'Commander Keen in Invasion of the Vorticons',
    blurb: 'Ein achtjähriges Genie mit Football-Helm und Pogo-Stab rettet die Welt – als Shareware auf Diskette.',
    tips: ['Mit dem Pogo-Stab springst du deutlich höher und erreichst versteckte Plattformen.'],
    funFact: 'id Software entwickelte danach Wolfenstein 3D und Doom.',
  },
  {
    id: 'terranigma',
    title: 'Terranigma',
    year: 1995,
    platform: 'SNES',
    developer: 'Quintet',
    genre: 'Action-RPG',
    wiki: 'Terranigma',
    blurb: 'Ark erweckt eine erstarrte Welt zum Leben – Kontinente, Pflanzen, Tiere, Menschen. In Nordamerika nie erschienen.',
    tips: ['Sammle Magirocks: Daraus lassen sich Zauberringe schmieden.'],
    funFact: 'Bildet mit Soul Blazer und Illusion of Time eine inoffizielle Trilogie.',
  },
  {
    id: 'wonder-boy-3',
    title: "Wonder Boy III: The Dragon's Trap",
    year: 1989,
    platform: 'Master System',
    developer: 'Westone',
    genre: 'Action-Adventure',
    wiki: "Wonder Boy III: The Dragon's Trap",
    blurb: 'Ein Fluch verwandelt den Helden in Echse, Maus, Piranha, Löwe und Falke – jede Form öffnet neue Wege.',
    tips: ['Jede Tierform erreicht andere Gebiete: Als Maus kletterst du an Schachbrett-Blöcken.'],
    funFact: '2017 erschien ein Remake, in dem man per Knopfdruck zwischen alter und neuer Grafik wechselt.',
  },
  {
    id: 'kid-chameleon',
    title: 'Kid Chameleon',
    year: 1992,
    platform: 'Mega Drive',
    developer: 'Sega Technical Institute',
    genre: "Jump 'n' Run",
    wiki: 'Kid Chameleon',
    blurb: 'Kid ist in einem Virtual-Reality-Spiel gefangen. Jeder Helm, den er aufsetzt, verwandelt ihn in einen anderen Helden.',
    tips: [
      'Jeder Helm ist eine neue Fähigkeit – probier sie an Wänden und Blöcken aus.',
      'Teleporter führen oft zu geheimen Abkürzungen in spätere Welten.',
    ],
    funFact: 'Über 100 Levels – und das ganz ohne Speicherfunktion.',
  },
  {
    id: 'shadow-of-the-beast',
    title: 'Shadow of the Beast',
    year: 1989,
    platform: 'Amiga',
    developer: 'Reflections / Psygnosis',
    genre: 'Action',
    wiki: 'Shadow of the Beast (video game)',
    blurb: 'Ein verwandelter Krieger sucht Rache. Damals das Spiel, mit dem man Freunden zeigte, was der Amiga kann.',
    tips: ['Sehr schwer und mit wenig Leben: Lerne die Gegnermuster auswendig.'],
    funFact: 'Bis zu zwölf Parallax-Ebenen sorgten für eine damals unglaubliche Tiefe.',
  },
];

export const DECADES = [
  { id: '80s', label: "80er", from: 1980, to: 1989 },
  { id: '90s', label: "90er", from: 1990, to: 1999 },
  { id: '00s', label: "2000er", from: 2000, to: 2009 },
];

/** Loading lines shown while content streams in — pure nostalgia filler. */
export const LOADING_LINES = [
  'Modul wird reingepustet …',
  'Bitte Diskette 2 einlegen …',
  'Kassette spult zurück …',
  'Tracking wird justiert …',
  'Bitte Konsole nicht ausschalten …',
  'Memory Card wird gelesen …',
  'Lade Level 1 …',
];

/** "Wusstest du?" ticker on the hub. */
export const TICKER_FACTS = [
  'Auf Kassette dauerte das Laden eines C64-Spiels oft mehrere Minuten.',
  'Viele Konsolenspiele der 80er hatten keinen Speicher – Passwörter wurden auf Zettel geschrieben.',
  'Ins Modul pusten half nicht wirklich – aber jeder hat es gemacht.',
  'Shareware: Die erste Episode gratis, den Rest gab es per Post.',
  'Spielezeitschriften druckten Cheats, Karten und Listings zum Abtippen.',
];
