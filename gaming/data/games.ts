import { PLATFORMS } from './platforms';
import { tr } from '../../lib/i18n';

// Curated catalog of half-forgotten games, from the 1980s to today. Every entry is hand-written and
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
  | 'Dreamcast'
  | 'PlayStation 2'
  | 'Game Boy Advance'
  | 'PS Vita'
  | 'Xbox One'
  | 'Multiplattform';

export interface Game {
  id: string;
  title: string;
  year: number;
  platform: Platform | string;
  developer: string;
  genre: string;
  /** English Wikipedia article title — the anchor for live content. */
  wiki: string;
  /** Short teaser, localized (English/German via tr()). Missing for games found via search. */
  blurb?: string;
  tips?: string[];
  funFact?: string;
  /** true for games the user found via search rather than the catalog. */
  custom?: boolean;
}

/** Cartridge label colours per platform, so the grid reads like a shelf. */
export const PLATFORM_COLORS: Record<string, string> = {
  ...Object.fromEntries(PLATFORMS.map((p) => [p.id, p.color])),
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
  'PlayStation 2': '#2c3e8f',
  'Game Boy Advance': '#5b4bd1',
  'PS Vita': '#1f6fb2',
  'Xbox One': '#107c10',
  Multiplattform: '#b03a6f',
};

export const GAMES: Game[] = [
  {
    id: 'little-nemo',
    title: 'Little Nemo: The Dream Master',
    year: 1990,
    platform: 'NES',
    developer: 'Capcom',
    genre: tr('Platformer', "Jump 'n' Run"),
    wiki: 'Little Nemo: The Dream Master',
    blurb:
      tr('Nemo wanders through the dreamland of Slumberland, feeding animals candy until they let him ride them – and he gets their abilities.', 'Nemo wandert durch das Traumland Slumberland und füttert Tiere mit Bonbons, bis sie ihn auf sich reiten lassen – und er ihre Fähigkeiten bekommt.'),
    tips: tr(
      [
        'Pelt animals with candy until they fall asleep – then hop on and take over their abilities.',
        'The door at the end of the level only opens once you’ve found all the keys.',
        'Each animal reaches different spots: the bee flies, the mole digs through dirt.',
      ],
      [
        'Bewirf Tiere mit Bonbons, bis sie einschlafen – dann springst du auf und übernimmst ihre Fähigkeiten.',
        'Die Tür am Levelende öffnet sich erst, wenn du alle Schlüssel gefunden hast.',
        'Jedes Tier erreicht andere Stellen: Die Biene fliegt, der Maulwurf gräbt sich durch Erde.',
      ]
    ),
    funFact: tr('Based on Winsor McCay’s 1905 comic strip “Little Nemo in Slumberland.”', 'Basiert auf Winsor McCays Comic „Little Nemo in Slumberland“ von 1905.'),
  },
  {
    id: 'gargoyles-quest',
    title: "Gargoyle's Quest",
    year: 1990,
    platform: 'Game Boy',
    developer: 'Capcom',
    genre: tr('Action-adventure', 'Action-Adventure'),
    wiki: "Gargoyle's Quest",
    blurb:
      tr('A Ghosts ’n Goblins spin-off where, for once, the monster is the hero: the fire demon Firebrand.', 'Ein Ableger von Ghosts ’n Goblins, in dem ausnahmsweise das Monster der Held ist: der Feuerdämon Firebrand.'),
    tips: tr(
      [
        'Firebrand can cling to walls and hover for a moment – almost every obstacle is built around that.',
        'The game doesn’t save: write down the passwords.',
      ],
      [
        'Firebrand kann sich an Wände klammern und kurz schweben – fast jedes Hindernis ist darauf ausgelegt.',
        'Das Spiel speichert nicht: Schreib dir die Passwörter auf.',
      ]
    ),
    funFact: tr('In Ghosts ’n Goblins, Firebrand was still the dreaded “Red Arremer” enemy.', 'In Ghosts ’n Goblins war Firebrand noch der gefürchtete „Red Arremer“-Gegner.'),
  },
  {
    id: 'rocket-knight',
    title: 'Rocket Knight Adventures',
    year: 1993,
    platform: 'Mega Drive',
    developer: 'Konami',
    genre: tr('Platformer', "Jump 'n' Run"),
    wiki: 'Rocket Knight Adventures',
    blurb: tr('Sparkster, an opossum knight with a rocket pack, saves the kingdom of Zebulos from an army of pigs.', 'Sparkster, ein Opossum-Ritter mit Raketenrucksack, rettet das Königreich Zebulos vor einer Schweine-Armee.'),
    tips: tr(
      [
        'Holding the attack button charges the rocket boost – let go and Sparkster blasts off in the chosen direction.',
        'He hangs from branches and ropes by his tail.',
      ],
      [
        'Angriffsknopf gedrückt halten lädt den Raketenschub – beim Loslassen schießt Sparkster in die gewählte Richtung.',
        'Mit dem Schwanz hängt er sich an Äste und Seile.',
      ]
    ),
    funFact: tr('Got the sequel “Sparkster” in 1994 and a remake in 2010.', 'Bekam 1994 die Fortsetzung „Sparkster“ und 2010 ein Remake.'),
  },
  {
    id: 'toejam-earl',
    title: 'ToeJam & Earl',
    year: 1991,
    platform: 'Mega Drive',
    developer: 'Johnson Voorsanger Productions',
    genre: tr('Roguelike / Action', 'Roguelike / Action'),
    wiki: 'ToeJam & Earl',
    blurb: tr('Two funky aliens have crash-landed on Earth and search randomly generated island worlds for the pieces of their spaceship.', 'Zwei Funk-Aliens sind auf der Erde abgestürzt und suchen in zufälligen Inselwelten die Teile ihres Raumschiffs.'),
    tips: tr(
      [
        'Unknown presents are a gamble: some help, some hurt.',
        'In two-player mode, the screen splits automatically as soon as you go separate ways.',
      ],
      [
        'Unbekannte Geschenke sind ein Glücksspiel: manche helfen, manche schaden.',
        'Zu zweit teilt sich der Bildschirm automatisch, sobald ihr euch trennt.',
      ]
    ),
    funFact: tr('Considered one of the first console roguelikes with randomly generated levels.', 'Gilt als eines der ersten Konsolen-Roguelikes mit zufällig erzeugten Levels.'),
  },
  {
    id: 'zak-mckracken',
    title: 'Zak McKracken and the Alien Mindbenders',
    year: 1988,
    platform: 'C64',
    developer: 'Lucasfilm Games',
    genre: tr('Point-and-click adventure', 'Point & Click Adventure'),
    wiki: 'Zak McKracken and the Alien Mindbenders',
    blurb:
      tr('Tabloid reporter Zak discovers that aliens are trying to dumb down humanity with a hum on the phone lines – and a trip around the world begins.', 'Klatschreporter Zak entdeckt, dass Außerirdische die Menschheit per Telefon-Brummton verdummen wollen – eine Weltreise beginnt.'),
    tips: tr(
      [
        'You control four characters: switch often, since many puzzles need teamwork across continents.',
        'The verb menu (“Use X with Y”) is your toolbox – try unusual combinations.',
      ],
      [
        'Du steuerst vier Figuren: Wechsle oft, viele Rätsel brauchen Teamwork über Kontinente hinweg.',
        'Der Satzbaukasten („Benutze X mit Y“) ist dein Werkzeug – probier ungewöhnliche Kombinationen.',
      ]
    ),
    funFact: tr('Decades later, German fans built their own sequels, like “Between Time and Space” (2008).', 'Deutsche Fans bauten Jahrzehnte später eigene Fortsetzungen, etwa „Between Time and Space“ (2008).'),
  },
  {
    id: 'lemmings',
    title: 'Lemmings',
    year: 1991,
    platform: 'Amiga',
    developer: 'DMA Design',
    genre: tr('Puzzle', 'Puzzle'),
    wiki: 'Lemmings (video game)',
    blurb: tr('Green-haired critters march stubbornly straight to their doom – you hand out jobs so they make it to the exit in one piece.', 'Grünhaarige Wesen laufen stur geradeaus ins Verderben – du verteilst Berufe, damit sie heil ins Ziel kommen.'),
    tips: tr(
      [
        'Place a Blocker first to stop the herd, then plan at your leisure.',
        'Use pause to hand out skills with pinpoint precision.',
        'Botched it all? The mushroom cloud blows up every lemming and ends the level.',
      ],
      [
        'Setz zuerst einen Blocker, um die Herde zu stoppen, und plane dann in Ruhe.',
        'Mit der Pause verteilst du Fähigkeiten ganz präzise.',
        'Alles verbockt? Der Atompilz sprengt alle Lemminge und beendet das Level.',
      ]
    ),
    funFact: tr('DMA Design later became Rockstar North – the studio behind GTA.', 'Aus DMA Design wurde später Rockstar North – das Studio hinter GTA.'),
  },
  {
    id: 'lost-vikings',
    title: 'The Lost Vikings',
    year: 1993,
    platform: 'SNES',
    developer: 'Silicon & Synapse',
    genre: tr('Puzzle platformer', 'Puzzle-Plattformer'),
    wiki: 'The Lost Vikings',
    blurb: tr('Three Vikings are abducted by aliens and have to travel back home through time – and only together.', 'Drei Wikinger werden von Aliens entführt und müssen durch die Zeit zurück nach Hause – nur gemeinsam.'),
    tips: tr(
      [
        'Erik runs and jumps, Baleog fights with sword and bow, Olaf blocks with his shield and glides with it.',
        'Olaf’s shield doubles as a platform for the others.',
        'Write down the level passwords.',
      ],
      [
        'Erik rennt und springt, Baleog kämpft mit Schwert und Bogen, Olaf blockt mit dem Schild und gleitet damit.',
        'Olafs Schild ist auch eine Plattform für die anderen.',
        'Notiere die Level-Passwörter.',
      ]
    ),
    funFact: tr('Shortly afterward, Silicon & Synapse became Blizzard Entertainment.', 'Silicon & Synapse hieß kurz darauf Blizzard Entertainment.'),
  },
  {
    id: 'another-world',
    title: 'Another World',
    year: 1991,
    platform: 'Amiga',
    developer: 'Éric Chahi / Delphine Software',
    genre: tr('Cinematic platformer', 'Cinematic Platformer'),
    wiki: 'Another World (video game)',
    blurb: tr('After an experiment, a physicist lands on an alien planet. Almost no words, almost nothing but images.', 'Ein Physiker landet nach einem Experiment auf einem fremden Planeten. Fast ohne Worte, fast nur Bilder.'),
    tips: tr(
      [
        'Dying is part of it: you restart at the last checkpoint and learn something every time.',
        'Holding fire charges a shield or a stronger shot.',
      ],
      [
        'Sterben gehört dazu: Du startest am letzten Checkpoint und lernst jedes Mal etwas.',
        'Feuer gedrückt halten lädt einen Schild oder einen stärkeren Schuss.',
      ]
    ),
    funFact: tr('Éric Chahi developed the game almost single-handedly in about two years.', 'Éric Chahi entwickelte das Spiel fast im Alleingang in rund zwei Jahren.'),
  },
  {
    id: 'flashback',
    title: 'Flashback',
    year: 1992,
    platform: 'Amiga',
    developer: 'Delphine Software',
    genre: tr('Cinematic platformer', 'Cinematic Platformer'),
    wiki: 'Flashback (1992 video game)',
    blurb: tr('Conrad B. Hart wakes up with no memory in the jungle of an alien moon and stumbles onto a conspiracy.', 'Conrad B. Hart erwacht ohne Gedächtnis im Dschungel eines fremden Mondes und stößt auf eine Verschwörung.'),
    tips: tr(
      [
        'Listen to the holocube right at the start – it explains who you are.',
        'Save stations are rare: use every single one.',
      ],
      [
        'Hör dir den Holocube gleich am Anfang an – er erklärt, wer du bist.',
        'Speicherstationen sind selten: Nutze jede einzelne.',
      ]
    ),
    funFact: tr('The fluid animation was rotoscoped from real film footage.', 'Die flüssigen Bewegungen entstanden per Rotoskopie nach echten Filmaufnahmen.'),
  },
  {
    id: 'turrican-2',
    title: 'Turrican II: The Final Fight',
    year: 1991,
    platform: 'Amiga',
    developer: 'Factor 5',
    genre: tr('Run and gun', 'Run & Gun'),
    wiki: 'Turrican II: The Final Fight',
    blurb: tr('Huge, freely explorable levels, a weapon for every situation and a legendary soundtrack – Made in Germany.', 'Riesige, frei erkundbare Level, eine Waffe für jede Lage und ein legendärer Soundtrack – Made in Germany.'),
    tips: tr(
      [
        'The energy beam can be swung in a circle and hits enemies around corners.',
        'As a gyroscope wheel, you roll through narrow passages and lay mines.',
      ],
      [
        'Der Energiestrahl lässt sich im Kreis schwenken und erreicht Gegner hinter Ecken.',
        'Als Gyroskop-Rad rollst du durch enge Gänge und legst Minen.',
      ]
    ),
    funFact: tr('Chris Hülsbeck’s music is still performed live by orchestras today.', 'Die Musik von Chris Hülsbeck wird bis heute von Orchestern live gespielt.'),
  },
  {
    id: 'giana-sisters',
    title: 'The Great Giana Sisters',
    year: 1987,
    platform: 'C64',
    developer: 'Time Warp Software / Rainbow Arts',
    genre: tr('Platformer', "Jump 'n' Run"),
    wiki: 'The Great Giana Sisters',
    blurb: tr('Giana dreams her way into a world full of brick blocks and owls – and vanished from stores shortly after release.', 'Giana träumt sich in eine Welt voller Ziegelblöcke und Eulen – und verschwand kurz nach Erscheinen aus den Läden.'),
    tips: tr(
      [
        'With the power-up, Giana gets a punk hairdo and can smash blocks.',
        'Lots of blocks hide diamonds – bonk anything that looks suspicious.',
      ],
      [
        'Mit dem Power-up bekommt Giana eine Punk-Frisur und kann Blöcke zerschlagen.',
        'Viele Blöcke verstecken Diamanten – klopf gegen alles, was verdächtig aussieht.',
      ]
    ),
    funFact: tr('It was pulled from the market after a short time – because it looked a lot like Super Mario Bros.', 'Wurde nach kurzer Zeit vom Markt genommen – wegen der großen Ähnlichkeit zu Super Mario Bros.'),
  },
  {
    id: 'mischief-makers',
    title: 'Mischief Makers',
    year: 1997,
    platform: 'Nintendo 64',
    developer: 'Treasure',
    genre: tr('Action platformer', 'Action-Plattformer'),
    wiki: 'Mischief Makers',
    blurb: tr('Robot maid Marina grabs, shakes and throws everything she can get her hands on.', 'Roboter-Dienstmädchen Marina packt, schüttelt und wirft alles, was ihr in die Finger kommt.'),
    tips: tr(['Shaking is everything: grab enemies and objects and shake them – something useful often falls out.'], ['Schütteln ist alles: Packe Gegner und Gegenstände und rüttle – oft fällt etwas Nützliches heraus.']),
    funFact: tr('Treasure games often had small print runs and are sought-after collector’s items today.', 'Treasure-Spiele erschienen oft in kleiner Auflage und sind heute gesuchte Sammlerstücke.'),
  },
  {
    id: 'beetle-adventure-racing',
    title: 'Beetle Adventure Racing!',
    year: 1999,
    platform: 'Nintendo 64',
    developer: 'Paradigm Entertainment / EA',
    genre: tr('Racing', 'Rennspiel'),
    wiki: 'Beetle Adventure Racing!',
    blurb: tr('A racing game with nothing but the VW New Beetle – and tracks full of shortcuts, caves and dinosaurs.', 'Ein Rennspiel nur mit dem VW New Beetle – und Strecken voller Abkürzungen, Höhlen und Dinosaurier.'),
    tips: tr(['Every track hides shortcuts and bonus boxes: go off the racing line on purpose.'], ['Jede Strecke versteckt Abkürzungen und Bonuskisten: Fahr bewusst abseits der Ideallinie.']),
    funFact: tr('Today a hidden gem among N64 fans; back then it was overshadowed by big racing franchises.', 'Heute ein Geheimtipp unter N64-Fans, damals im Schatten großer Rennspiel-Serien.'),
  },
  {
    id: 'jet-force-gemini',
    title: 'Jet Force Gemini',
    year: 1999,
    platform: 'Nintendo 64',
    developer: 'Rare',
    genre: tr('Third-person shooter', 'Third-Person-Shooter'),
    wiki: 'Jet Force Gemini',
    blurb: tr('Siblings Juno and Vela and their dog Lupus fight an army of insects.', 'Die Geschwister Juno und Vela und ihr Hund Lupus kämpfen gegen eine Insekten-Armee.'),
    tips: tr(['Rescue every Tribal in each level – otherwise the true ending stays locked.'], ['Rette in jedem Level alle Tribals – sonst bleibt das wahre Ende verschlossen.']),
    funFact: tr('Lupus the dog is fully playable and can hover with his jetpack.', 'Der Hund Lupus ist voll spielbar und kann mit seinem Jetpack schweben.'),
  },
  {
    id: 'ape-escape',
    title: 'Ape Escape',
    year: 1999,
    platform: 'PlayStation',
    developer: 'Sony Computer Entertainment Japan',
    genre: tr('Platformer', "Jump 'n' Run"),
    wiki: 'Ape Escape (video game)',
    blurb: tr('Monkeys in flashing helmets have escaped through time. You catch them again with your net.', 'Affen mit Blinkhelmen sind durch die Zeit geflohen. Du fängst sie mit dem Netz wieder ein.'),
    tips: tr(['Left stick runs, right stick swings the gadget – that’s how every monkey ends up in the net.'], ['Linker Stick läuft, rechter Stick schwingt das Gadget – so landet jeder Affe im Netz.']),
    funFact: tr('The first game that absolutely required a controller with two analog sticks.', 'Das erste Spiel, das zwingend einen Controller mit zwei Analogsticks verlangte.'),
  },
  {
    id: 'vagrant-story',
    title: 'Vagrant Story',
    year: 2000,
    platform: 'PlayStation',
    developer: 'Square',
    genre: tr('Action RPG', 'Action-RPG'),
    wiki: 'Vagrant Story',
    blurb: tr('A dark medieval RPG set in the abandoned city of Leá Monde – a late gem of the PS1 era.', 'Ein düsteres Mittelalter-Rollenspiel in der verlassenen Stadt Leá Monde – ein Spätwerk der PS1-Ära.'),
    tips: tr(['Chain attacks: press again at the right moment for combos, but your Risk meter goes up.'], ['Ketten-Angriffe: Drück im richtigen Moment erneut für Combos, aber dein Risiko-Wert steigt dabei.']),
    funFact: tr('Received a perfect 40 out of 40 from Japan’s Famitsu.', 'Bekam von der japanischen Famitsu die Höchstwertung 40 von 40 Punkten.'),
  },
  {
    id: 'skies-of-arcadia',
    title: 'Skies of Arcadia',
    year: 2000,
    platform: 'Dreamcast',
    developer: 'Overworks',
    genre: tr('RPG', 'Rollenspiel'),
    wiki: 'Skies of Arcadia',
    blurb: tr('Sky pirates, floating islands and ship battles above the clouds.', 'Luftpiraten, fliegende Inseln und Schiffsschlachten über den Wolken.'),
    tips: tr(['Keep an eye out for “Discoveries” on the world map – they bring gold and fame.'], ['Halte nach „Entdeckungen“ auf der Weltkarte Ausschau – sie bringen Gold und Ruhm.']),
    funFact: tr('In 2002, the expanded “Legends” version came out for the GameCube.', '2002 erschien die erweiterte Fassung „Legends“ für den GameCube.'),
  },
  {
    id: 'jet-set-radio',
    title: 'Jet Set Radio',
    year: 2000,
    platform: 'Dreamcast',
    developer: 'Smilebit',
    genre: tr('Action / Skating', 'Action / Skating'),
    wiki: 'Jet Set Radio',
    blurb: tr('Skate through Tokyo-to on inline skates, spray graffiti and run from the cops – to an unforgettable soundtrack.', 'Auf Inline-Skates durch Tokio-to, Graffiti sprühen und vor der Polizei flüchten – zu einem unvergesslichen Soundtrack.'),
    tips: tr(['For big graffiti pieces, you trace the given motions with the analog stick.'], ['Für große Graffiti fährst du die vorgegebenen Bewegungen mit dem Analogstick nach.']),
    funFact: tr('Considered a pioneer of the cel-shaded look.', 'Gilt als Wegbereiter des Cel-Shading-Looks.'),
  },
  {
    id: 'star-control-2',
    title: 'Star Control II',
    year: 1992,
    platform: 'MS-DOS',
    developer: 'Toys for Bob',
    genre: tr('Space adventure', 'Weltraum-Abenteuer'),
    wiki: 'Star Control II',
    blurb: tr('An open galaxy full of quirky alien races, diplomacy and space battles.', 'Eine offene Galaxie voller schräger Alien-Völker, Diplomatie und Raumschlachten.'),
    tips: tr(
      [
        'Talk to every race: knowledge is the most important resource here.',
        'Today you can play it legally and for free as the open-source version “The Ur-Quan Masters.”',
      ],
      [
        'Sprich mit jedem Volk: Wissen ist hier die wichtigste Ressource.',
        'Heute legal und kostenlos spielbar als quelloffene Fassung „The Ur-Quan Masters“.',
      ]
    ),
    funFact: tr('The developers released the source code in 2002 – which became “The Ur-Quan Masters.”', 'Die Entwickler gaben den Quellcode 2002 frei – daraus entstand „The Ur-Quan Masters“.'),
  },
  {
    id: 'commander-keen',
    title: 'Commander Keen',
    year: 1990,
    platform: 'MS-DOS',
    developer: 'id Software',
    genre: tr('Platformer', "Jump 'n' Run"),
    wiki: 'Commander Keen in Invasion of the Vorticons',
    blurb: tr('An eight-year-old genius with a football helmet and a pogo stick saves the world – as shareware on a floppy disk.', 'Ein achtjähriges Genie mit Football-Helm und Pogo-Stab rettet die Welt – als Shareware auf Diskette.'),
    tips: tr(['The pogo stick lets you jump much higher and reach hidden platforms.'], ['Mit dem Pogo-Stab springst du deutlich höher und erreichst versteckte Plattformen.']),
    funFact: tr('id Software went on to make Wolfenstein 3D and Doom.', 'id Software entwickelte danach Wolfenstein 3D und Doom.'),
  },
  {
    id: 'terranigma',
    title: 'Terranigma',
    year: 1995,
    platform: 'SNES',
    developer: 'Quintet',
    genre: tr('Action RPG', 'Action-RPG'),
    wiki: 'Terranigma',
    blurb: tr('Ark brings a frozen world back to life – continents, plants, animals, people. Never released in North America.', 'Ark erweckt eine erstarrte Welt zum Leben – Kontinente, Pflanzen, Tiere, Menschen. In Nordamerika nie erschienen.'),
    tips: tr(['Collect Magirocks: they can be forged into magic rings.'], ['Sammle Magirocks: Daraus lassen sich Zauberringe schmieden.']),
    funFact: tr('Forms an unofficial trilogy with Soul Blazer and Illusion of Gaia (Illusion of Time in Europe).', 'Bildet mit Soul Blazer und Illusion of Time eine inoffizielle Trilogie.'),
  },
  {
    id: 'wonder-boy-3',
    title: "Wonder Boy III: The Dragon's Trap",
    year: 1989,
    platform: 'Master System',
    developer: 'Westone',
    genre: tr('Action-adventure', 'Action-Adventure'),
    wiki: "Wonder Boy III: The Dragon's Trap",
    blurb: tr('A curse turns the hero into a lizard, mouse, piranha, lion and hawk – each form opens new paths.', 'Ein Fluch verwandelt den Helden in Echse, Maus, Piranha, Löwe und Falke – jede Form öffnet neue Wege.'),
    tips: tr(['Each animal form reaches different areas: as a mouse, you climb checkerboard blocks.'], ['Jede Tierform erreicht andere Gebiete: Als Maus kletterst du an Schachbrett-Blöcken.']),
    funFact: tr('A 2017 remake lets you switch between the old and new graphics at the press of a button.', '2017 erschien ein Remake, in dem man per Knopfdruck zwischen alter und neuer Grafik wechselt.'),
  },
  {
    id: 'kid-chameleon',
    title: 'Kid Chameleon',
    year: 1992,
    platform: 'Mega Drive',
    developer: 'Sega Technical Institute',
    genre: tr('Platformer', "Jump 'n' Run"),
    wiki: 'Kid Chameleon',
    blurb: tr('Kid is trapped in a virtual reality game. Every helmet he puts on turns him into a different hero.', 'Kid ist in einem Virtual-Reality-Spiel gefangen. Jeder Helm, den er aufsetzt, verwandelt ihn in einen anderen Helden.'),
    tips: tr(
      [
        'Every helmet is a new ability – try it out on walls and blocks.',
        'Teleporters often lead to secret shortcuts to later worlds.',
      ],
      [
        'Jeder Helm ist eine neue Fähigkeit – probier sie an Wänden und Blöcken aus.',
        'Teleporter führen oft zu geheimen Abkürzungen in spätere Welten.',
      ]
    ),
    funFact: tr('Over 100 levels – and no way to save at all.', 'Über 100 Levels – und das ganz ohne Speicherfunktion.'),
  },
  {
    id: 'shadow-of-the-beast',
    title: 'Shadow of the Beast',
    year: 1989,
    platform: 'Amiga',
    developer: 'Reflections / Psygnosis',
    genre: tr('Action', 'Action'),
    wiki: 'Shadow of the Beast (video game)',
    blurb: tr('A transformed warrior seeks revenge. Back then, it was the game you used to show your friends what the Amiga could do.', 'Ein verwandelter Krieger sucht Rache. Damals das Spiel, mit dem man Freunden zeigte, was der Amiga kann.'),
    tips: tr(['Very hard, with little health: memorize the enemy patterns.'], ['Sehr schwer und mit wenig Leben: Lerne die Gegnermuster auswendig.']),
    funFact: tr('Up to twelve parallax layers created a sense of depth that was unbelievable at the time.', 'Bis zu zwölf Parallax-Ebenen sorgten für eine damals unglaubliche Tiefe.'),
  },
  {
    id: 'ico',
    title: 'Ico',
    year: 2001,
    platform: 'PlayStation 2',
    developer: 'Team Ico',
    genre: tr('Action-adventure', 'Action-Adventure'),
    wiki: 'Ico',
    blurb: tr('A horned boy leads a girl named Yorda by the hand out of a huge, abandoned castle.', 'Ein gehörnter Junge führt das Mädchen Yorda an der Hand aus einer riesigen, verlassenen Burg.'),
    tips: tr(['Never leave Yorda alone for too long – or the shadows will take her.'], ['Lass Yorda nie zu lange allein – sonst holen die Schatten sie.']),
    funFact: tr('Told with almost no on-screen HUD – an inspiration for many later indie games.', 'Fast ohne Bildschirmanzeigen erzählt – ein Vorbild für viele spätere Indie-Spiele.'),
  },
  {
    id: 'advance-wars',
    title: 'Advance Wars',
    year: 2001,
    platform: 'Game Boy Advance',
    developer: 'Intelligent Systems',
    genre: tr('Turn-based strategy', 'Rundenstrategie'),
    wiki: 'Advance Wars (video game)',
    blurb: tr('Pocket-sized tactics: tanks, infantry and planes on grid-based battlefields.', 'Taktik im Taschenformat: Panzer, Infanterie und Flugzeuge auf karierten Schlachtfeldern.'),
    tips: tr(
      [
        'Infantry captures cities – more cities means more money for new units.',
        'In the fog of war, forests hide your units.',
      ],
      [
        'Infanterie erobert Städte – mehr Städte heißt mehr Geld für neue Einheiten.',
        'Im Nebel des Krieges verstecken Wälder deine Einheiten.',
      ]
    ),
    funFact: tr('The Japanese launch was delayed by years after the September 11, 2001 attacks.', 'Der Japan-Start wurde nach den Anschlägen vom 11. September 2001 um Jahre verschoben.'),
  },
  {
    id: 'beyond-good-evil',
    title: 'Beyond Good & Evil',
    year: 2003,
    platform: 'Multiplattform',
    developer: 'Ubisoft Montpellier',
    genre: tr('Action-adventure', 'Action-Adventure'),
    wiki: 'Beyond Good & Evil (video game)',
    blurb: tr('Photojournalist Jade uncovers a conspiracy on the planet Hillys – armed with a camera and a fighting staff.', 'Fotojournalistin Jade deckt auf dem Planeten Hillys eine Verschwörung auf – mit Kamera und Kampfstab.'),
    tips: tr(['Photograph every animal species for the archive – it earns you money and pearls.'], ['Fotografiere jede Tierart für das Archiv – das bringt Geld und Perlen.']),
    funFact: tr('Created by Michel Ancel, the creator of Rayman.', 'Erdacht von Michel Ancel, dem Schöpfer von Rayman.'),
  },
  {
    id: 'psychonauts',
    title: 'Psychonauts',
    year: 2005,
    platform: 'Multiplattform',
    developer: 'Double Fine Productions',
    genre: tr('Platformer', "Jump 'n' Run"),
    wiki: 'Psychonauts',
    blurb: tr('Raz sneaks into a summer camp for psychically gifted kids and literally jumps into other people’s heads.', 'Raz schleicht sich in ein Sommercamp für Psi-Begabte und springt buchstäblich in die Köpfe anderer.'),
    tips: tr(['Collect figments in the mind worlds – that’s how you rank up and learn new psi powers.'], ['Sammle Figmente in den Gedankenwelten – so steigst du im Rang auf und lernst neue Psi-Kräfte.']),
    funFact: tr('Flopped at first, became a cult classic and finally got Psychonauts 2 in 2021.', 'Floppte zunächst, wurde Kult und bekam 2021 endlich Psychonauts 2.'),
  },
  {
    id: 'okami',
    title: 'Ōkami',
    year: 2006,
    platform: 'PlayStation 2',
    developer: 'Clover Studio',
    genre: tr('Action-adventure', 'Action-Adventure'),
    wiki: 'Ōkami',
    blurb: tr('As the sun goddess in wolf form, you paint miracles into an ink-wash world with a Celestial Brush.', 'Als Sonnengöttin in Wolfsgestalt malst du mit einem Himmelspinsel Wunder in eine Welt aus Tuschebildern.'),
    tips: tr(['With the Celestial Brush you paint symbols: a circle makes the sun rise, a slash cuts through obstacles.'], ['Mit dem Himmelspinsel malst du Zeichen: Ein Kreis lässt die Sonne aufgehen, ein Strich zerschneidet Hindernisse.']),
    funFact: tr('Clover Studio was shut down shortly after release.', 'Clover Studio wurde kurz nach dem Erscheinen aufgelöst.'),
  },
  {
    id: 'mirrors-edge',
    title: "Mirror's Edge",
    year: 2008,
    platform: 'Multiplattform',
    developer: 'DICE',
    genre: tr('Parkour / Action', 'Parkour / Action'),
    wiki: "Mirror's Edge",
    blurb: tr('As Faith, a runner, you sprint and leap across the rooftops of a sterile city under surveillance.', 'Als Läuferin Faith rennst und springst du über die Dächer einer sterilen, überwachten Stadt.'),
    tips: tr(['Objects colored red show you the way – follow the “Runner Vision.”'], ['Rot eingefärbte Objekte zeigen dir den Weg – folge der „Runner Vision“.']),
    funFact: tr('One of the first big first-person titles to focus almost entirely on movement instead of shooting.', 'Einer der ersten großen Ego-Titel, der fast ganz auf Bewegung statt Schießen setzte.'),
  },
  {
    id: 'alpha-protocol',
    title: 'Alpha Protocol',
    year: 2010,
    platform: 'Multiplattform',
    developer: 'Obsidian Entertainment',
    genre: tr('Espionage RPG', 'Agenten-Rollenspiel'),
    wiki: 'Alpha Protocol',
    blurb: tr('A spy RPG where almost every dialogue choice changes the story.', 'Ein Spionage-Rollenspiel, in dem fast jede Gesprächsentscheidung die Geschichte verändert.'),
    tips: tr(['Dialogue runs on a timer – go with your gut, every choice has consequences.'], ['Dialoge laufen gegen die Zeit – entscheide aus dem Bauch, jede Wahl hat Folgen.']),
    funFact: tr('Disappeared from digital stores in 2019 because music licenses expired.', 'Verschwand 2019 aus den digitalen Stores, weil Musiklizenzen ausliefen.'),
  },
  {
    id: 'gravity-rush',
    title: 'Gravity Rush',
    year: 2012,
    platform: 'PS Vita',
    developer: 'Japan Studio',
    genre: tr('Action-adventure', 'Action-Adventure'),
    wiki: 'Gravity Rush',
    blurb: tr('Kat can shift gravity and “falls” up building walls and across a floating city.', 'Kat kann die Schwerkraft verschieben und „fällt“ an Hauswänden hoch und quer durch eine schwebende Stadt.'),
    tips: tr(['The midair Gravity Kick is your strongest attack.'], ['Der Gravitationstritt aus der Luft ist dein stärkster Angriff.']),
    funFact: tr('Later came out as a remaster for the PS4, along with a sequel.', 'Erschien später als Remaster für die PS4, samt Fortsetzung.'),
  },
  {
    id: 'sunset-overdrive',
    title: 'Sunset Overdrive',
    year: 2014,
    platform: 'Xbox One',
    developer: 'Insomniac Games',
    genre: tr('Action', 'Action'),
    wiki: 'Sunset Overdrive',
    blurb: tr('A wildly colorful apocalypse where you grind on power lines and shoot mutants with vinyl records.', 'Eine knallbunte Apokalypse, in der du auf Stromleitungen grindest und Mutanten mit Schallplatten beschießt.'),
    tips: tr(['Keep moving: grinding and jumping keep you alive; on the ground you’re easy prey.'], ['Bleib in Bewegung: Grinden und Springen hält dich am Leben, am Boden bist du leichte Beute.']),
    funFact: tr('Long an Xbox exclusive; a PC version arrived in 2018.', 'Lange Xbox-exklusiv, 2018 kam eine PC-Fassung.'),
  },
  {
    id: 'titanfall-2',
    title: 'Titanfall 2',
    year: 2016,
    platform: 'Multiplattform',
    developer: 'Respawn Entertainment',
    genre: tr('First-person shooter', 'Ego-Shooter'),
    wiki: 'Titanfall 2',
    blurb: tr('Pilot Jack Cooper and his combat robot BT-7274: a campaign many consider one of the best in the genre.', 'Pilot Jack Cooper und sein Kampfroboter BT-7274: eine Kampagne, die viele für eine der besten ihres Genres halten.'),
    tips: tr(['In the “Effect and Cause” level, you jump between two points in time at the press of a button – use it in combat, too.'], ['Im Level „Effect and Cause“ springst du per Knopfdruck zwischen zwei Zeitebenen – nutze das auch im Kampf.']),
    funFact: tr('Launched between two big rival shooters and flopped commercially in fall 2016.', 'Erschien zwischen zwei großen Shooter-Konkurrenten und ging im Herbst 2016 kommerziell unter.'),
  },
  {
    id: 'sable',
    title: 'Sable',
    year: 2021,
    platform: 'Multiplattform',
    developer: 'Shedworks',
    genre: tr('Exploration', 'Erkundung'),
    wiki: 'Sable (video game)',
    blurb: tr('A girl sets out across a desert on her hoverbike to figure out who she wants to be.', 'Ein Mädchen bricht auf ihrem Hover-Bike durch eine Wüste auf, um herauszufinden, wer sie sein will.'),
    tips: tr(['No combat, no time pressure: climbing and gliding take you almost anywhere.'], ['Kein Kampf, kein Zeitdruck: Klettern und Gleiten führen dich fast überall hin.']),
    funFact: tr('The art style is reminiscent of the French comic artist Moebius.', 'Der Zeichenstil erinnert an den französischen Comickünstler Moebius.'),
  },
  {
    id: 'chicory',
    title: 'Chicory: A Colorful Tale',
    year: 2021,
    platform: 'Multiplattform',
    developer: 'Greg Lobanov',
    genre: tr('Adventure', 'Abenteuer'),
    wiki: 'Chicory: A Colorful Tale',
    blurb: tr('The world has lost its colors – you repaint it with a magic brush.', 'Die Welt hat ihre Farben verloren – mit einem magischen Pinsel malst du sie neu.'),
    tips: tr(['Paint is a tool: painted plants and objects open new paths.'], ['Farbe ist Werkzeug: Bemalte Pflanzen und Objekte öffnen neue Wege.']),
    funFact: tr('The music is by Lena Raine, who also worked on Celeste.', 'Die Musik stammt von Lena Raine, die auch an Celeste mitgearbeitet hat.'),
  },
  {
    id: 'tunic',
    title: 'Tunic',
    year: 2022,
    platform: 'Multiplattform',
    developer: 'Andrew Shouldice',
    genre: tr('Action-adventure', 'Action-Adventure'),
    wiki: 'Tunic (video game)',
    blurb: tr('A little fox in a world full of secrets – explained only through the pages of an old game manual.', 'Ein kleiner Fuchs in einer Welt voller Geheimnisse – erklärt nur durch Seiten eines alten Spielhandbuchs.'),
    tips: tr(['Collect the manual pages: bit by bit, they reveal every secret.'], ['Sammle die Handbuchseiten: Sie verraten nach und nach alle Geheimnisse.']),
    funFact: tr('A love letter to the illustrated game manuals of the ’80s and ’90s.', 'Eine Liebeserklärung an die bebilderten Spielanleitungen der 80er und 90er.'),
  },
  {
    id: 'hi-fi-rush',
    title: 'Hi-Fi Rush',
    year: 2023,
    platform: 'Multiplattform',
    developer: 'Tango Gameworks',
    genre: tr('Rhythm action', 'Rhythmus-Action'),
    wiki: 'Hi-Fi Rush',
    blurb: tr('A wannabe rock star fights a robotics corporation to the beat of the music.', 'Ein Möchtegern-Rockstar kämpft im Takt der Musik gegen einen Robotik-Konzern.'),
    tips: tr(['Everything moves to the beat: attacks on the rhythm deal more damage.'], ['Alles bewegt sich im Takt: Angriffe im Rhythmus richten mehr Schaden an.']),
    funFact: tr('The studio was shut down in 2024 and rescued by Krafton that same year.', 'Das Studio wurde 2024 geschlossen und noch im selben Jahr von Krafton gerettet.'),
  },
];

export const DECADES = [
  { id: '80s', label: tr("’80s", "80er"), from: 1980, to: 1989 },
  { id: '90s', label: tr("’90s", "90er"), from: 1990, to: 1999 },
  { id: '00s', label: tr("2000s", "2000er"), from: 2000, to: 2009 },
  { id: '10s', label: tr("2010s", "2010er"), from: 2010, to: 2019 },
  { id: '20s', label: tr("2020s", "2020er"), from: 2020, to: 2099 },
];

/** Loading lines shown while content streams in — pure nostalgia filler. */
export const LOADING_LINES = tr(
  [
    'Blowing into the cartridge …',
    'Please insert disk 2 …',
    'Rewinding the tape …',
    'Adjusting the tracking …',
    'Please don’t turn off the console …',
    'Reading memory card …',
    'Loading level 1 …',
  ],
  [
    'Modul wird reingepustet …',
    'Bitte Diskette 2 einlegen …',
    'Kassette spult zurück …',
    'Tracking wird justiert …',
    'Bitte Konsole nicht ausschalten …',
    'Memory Card wird gelesen …',
    'Lade Level 1 …',
  ]
);

/** "Wusstest du?" ticker on the hub. */
export const TICKER_FACTS = tr(
  [
    'Loading a C64 game from tape often took several minutes.',
    'Many ’80s console games couldn’t save – passwords got scribbled on scraps of paper.',
    'Blowing into the cartridge didn’t really help – but everybody did it.',
    'Shareware: the first episode was free, and the rest came by mail.',
    'Game magazines printed cheats, maps and code listings to type in yourself.',
    'Digital games can vanish too: when licenses expire, they get pulled from the stores.',
    'Many of today’s indie hits deliberately pay homage to the games of the ’80s and ’90s.',
  ],
  [
    'Auf Kassette dauerte das Laden eines C64-Spiels oft mehrere Minuten.',
    'Viele Konsolenspiele der 80er hatten keinen Speicher – Passwörter wurden auf Zettel geschrieben.',
    'Ins Modul pusten half nicht wirklich – aber jeder hat es gemacht.',
    'Shareware: Die erste Episode gratis, den Rest gab es per Post.',
    'Spielezeitschriften druckten Cheats, Karten und Listings zum Abtippen.',
    'Auch digitale Spiele können verschwinden: Laufen Lizenzen aus, fliegen sie aus den Stores.',
    'Viele heutige Indie-Hits zitieren bewusst die Spiele der 80er und 90er.',
  ]
);
