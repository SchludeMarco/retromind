import { tr } from './i18n';
import { IdeaGroup, Suggestion, ageSuffix, dedupeGroups, localize } from './picks';
import type { TreasureKind, UserProfile } from '../types';

// The treasure chest ("Schatzkiste"): more things from your youth beyond the
// favourite bands, from Marco's list of 2026-10-18: favourite film and game
// characters (Metal Gear's Miller), special games (Super Meat Boy), books
// (Die Kinder von Schewenborn, Sanctum), special places (the Realschule
// library with video tapes) and events, smells (cinnamon, your own room, the
// apple scent at Rossmann), the shops you loved (Rossmann, Media Markt),
// card games (Yu-Gi-Oh!, Pokémon, Digimon) and lines from old games and
// films. Everything is optional; it goes into the AI's questions and the
// memory book like the bands do.
//
// Suggestions: one name, `de:`/`en:` for one language only, or
// [English, German]. Groups with `from` are decades and only show from the
// decade before your birth on; groups without it always show.

interface Group {
  from?: number;
  items: Suggestion[];
}

interface Kind {
  id: TreasureKind;
  icon: string;
  /** Short name for the chest's tab row. */
  tab: [string, string];
  title: [string, string];
  placeholder: [string, string];
  /** Heading of the group without a decade, when there are decade groups too. */
  timeless?: [string, string];
  groups: Group[];
}

const KINDS: Kind[] = [
  {
    id: 'figures',
    icon: '🦸',
    tab: ['Characters', 'Figuren'],
    title: ['Favorite film and game characters', 'Lieblingsfiguren aus Film und Spiel'],
    placeholder: ['e.g. Solid Snake, Marty McFly …', 'z. B. Solid Snake, Marty McFly …'],
    groups: [
      { from: 1960, items: ['Captain Kirk', 'Mr. Spock', 'James Bond', ['Pippi Longstocking', 'Pippi Langstrumpf'], 'de:Winnetou', 'Kermit', 'de:Biene Maja', 'Lucky Luke'] },
      { from: 1970, items: ['Luke Skywalker', 'Darth Vader', ['Princess Leia', 'Prinzessin Leia'], 'Han Solo', 'Miss Piggy', 'Pac-Man', 'Rocky Balboa', 'de:Pumuckl', 'de:Wickie'] },
      { from: 1980, items: ['Super Mario', 'Link', 'Mega Man', 'Samus Aran', 'Solid Snake', 'Marty McFly', 'Doc Brown', 'Indiana Jones', 'E.T.', 'Alf', 'He-Man', 'Skeletor', 'MacGyver', 'K.I.T.T.', 'Optimus Prime', ['Papa Smurf', 'Papa Schlumpf'], 'de:Benjamin Blümchen', 'de:Bibi Blocksberg', 'Ghostbusters'] },
      { from: 1990, items: ['Sonic', 'Lara Croft', 'Kazuhira Miller', 'Otacon', 'Big Boss', 'Cloud Strife', 'Pikachu', 'Ash Ketchum', 'Crash Bandicoot', 'Guybrush Threepwood', 'Duke Nukem', 'Homer Simpson', 'Bart Simpson', 'Son Goku', 'Sailor Moon', 'Fox Mulder', 'Dana Scully', 'Neo', 'Forrest Gump', 'Simba', 'Buzz Lightyear', 'Woody'] },
      { from: 2000, items: ['Harry Potter', 'Hermione Granger', 'Gandalf', 'Frodo', 'Jack Sparrow', 'Master Chief', 'Kratos', 'Shrek', 'SpongeBob', 'Geralt of Rivia', 'Ezio Auditore', 'Iron Man'] },
      { from: 2010, items: ['Super Meat Boy', 'Steve (Minecraft)', 'Jon Snow', 'Daenerys Targaryen', 'Elsa', 'Joel', 'Ellie', 'Groot', 'Eleven'] },
    ],
  },
  {
    id: 'games',
    icon: '🎮',
    tab: ['Games', 'Spiele'],
    title: ['Special games', 'Besondere Spiele'],
    placeholder: ['e.g. Super Meat Boy, Tetris …', 'z. B. Super Meat Boy, Tetris …'],
    groups: [
      { from: 1970, items: ['Pong', 'Space Invaders', 'Asteroids'] },
      { from: 1980, items: ['Pac-Man', 'Donkey Kong', 'Tetris', 'Super Mario Bros.', 'The Legend of Zelda', 'Metroid', 'Metal Gear', 'The Great Giana Sisters', 'Maniac Mansion', 'Bubble Bobble', 'Prince of Persia', 'Duck Hunt', 'Turrican'] },
      { from: 1990, items: ['The Secret of Monkey Island', 'Street Fighter II', 'Super Mario World', 'Sonic the Hedgehog', 'Doom', ['The Settlers', 'Die Siedler'], 'Command & Conquer', 'Tomb Raider', 'Super Mario 64', ['Pokémon Red & Blue', 'Pokémon Rot & Blau'], 'GoldenEye 007', 'Final Fantasy VII', 'Metal Gear Solid', 'Zelda: Ocarina of Time', 'Diablo', 'Half-Life', 'Age of Empires II', 'de:Anno 1602', 'de:Moorhuhn', 'Crash Bandicoot', 'StarCraft', 'Gran Turismo'] },
      { from: 2000, items: ['The Sims', 'Counter-Strike', 'World of Warcraft', 'GTA: San Andreas', 'Halo', 'de:Gothic', 'Half-Life 2', 'Wii Sports', 'Portal', 'Guitar Hero', 'Super Mario Galaxy', 'SingStar'] },
      { from: 2010, items: ['Super Meat Boy', 'Minecraft', 'Skyrim', 'Dark Souls', 'Journey', 'The Last of Us', 'The Witcher 3', 'Undertale', 'Stardew Valley', 'Zelda: Breath of the Wild', 'Celeste', 'Hollow Knight', 'Among Us', 'Fortnite'] },
      { from: 2020, items: ['Animal Crossing: New Horizons', 'Hades', 'Elden Ring', 'Baldur’s Gate 3'] },
    ],
  },
  {
    id: 'books',
    icon: '📚',
    tab: ['Books', 'Bücher'],
    title: ['Books and comics', 'Bücher und Comics'],
    placeholder: ['e.g. The Neverending Story …', 'z. B. Die Kinder von Schewenborn, Sanctum …'],
    timeless: ['Classics', 'Klassiker'],
    groups: [
      { items: [['The Lord of the Rings', 'Der Herr der Ringe'], ['The Hobbit', 'Der Hobbit'], ['The Little Prince', 'Der kleine Prinz'], ['Pippi Longstocking', 'Pippi Langstrumpf'], ['The Famous Five', 'Fünf Freunde'], 'Asterix', ['Tintin', 'Tim und Struppi'], 'de:Lustiges Taschenbuch', 'de:Winnetou', 'de:Jim Knopf', 'de:Räuber Hotzenplotz'] },
      { from: 1970, items: ['Momo', 'de:Krabat', 'de:Das Sams', ['The Neverending Story', 'Die unendliche Geschichte'], 'de:Die drei ???', 'de:Hanni und Nanni'] },
      { from: 1980, items: ['de:Die Kinder von Schewenborn', 'de:Die Wolke', ['The Wave', 'Die Welle'], ['Ronia, the Robber’s Daughter', 'Ronja Räubertochter'], 'de:TKKG', ['Perfume', 'Das Parfum'], ['It', 'Es'], 'Calvin and Hobbes', 'Choose Your Own Adventure'] },
      { from: 1990, items: ['Harry Potter', ['Goosebumps', 'Gänsehaut'], 'Jurassic Park', ['Sophie’s World', 'Sofies Welt'], 'Sanctum', 'Dragon Ball', 'de:Bravo'] },
      { from: 2000, items: [['The Da Vinci Code', 'Sakrileg'], 'Twilight', ['The Hunger Games', 'Die Tribute von Panem'], 'de:Der Schwarm', 'Eragon', 'One Piece', 'Naruto'] },
      { from: 2010, items: [['A Song of Ice and Fire', 'Das Lied von Eis und Feuer'], ['The Fault in Our Stars', 'Das Schicksal ist ein mieser Verräter'], 'Ready Player One'] },
    ],
  },
  {
    id: 'places',
    icon: '📍',
    tab: ['Places', 'Orte'],
    title: ['Special places', 'Besondere Orte'],
    placeholder: ['e.g. the school library …', 'z. B. die Schulbibliothek …'],
    groups: [
      {
        items: [
          ['The school library (with video tapes)', 'Die Schulbibliothek (mit Filmkassetten)'],
          ['The video rental store', 'Die Videothek'],
          ['The outdoor pool', 'Das Freibad'],
          ['The funfair', 'Die Kirmes'],
          ['The arcade', 'Die Spielhalle'],
          ['The neighborhood ballpark', 'Der Bolzplatz'],
          ['The youth club', 'Das Jugendhaus'],
          ['The little cinema in town', 'Das kleine Kino im Ort'],
          ['The village disco', 'Die Dorfdisco'],
          ['Grandma’s kitchen', 'Omas Küche'],
          ['The treehouse', 'Das Baumhaus'],
          ['The corner kiosk', 'Der Kiosk an der Ecke'],
          ['The summer camp', 'Das Schullandheim'],
          ['The campsite on vacation', 'Der Campingplatz im Urlaub'],
          ['The LAN party in the basement', 'Die LAN-Party im Keller'],
          ['Your first own apartment', 'Die erste eigene Wohnung'],
        ],
      },
    ],
  },
  {
    id: 'events',
    icon: '✨',
    tab: ['Events', 'Ereignisse'],
    title: ['Special events', 'Besondere Ereignisse'],
    placeholder: ['e.g. my first concert …', 'z. B. mein erstes Konzert …'],
    timeless: ['Milestones', 'Meilensteine'],
    groups: [
      {
        items: [
          ['First day of school', 'Einschulung mit Schultüte'],
          ['The school trip', 'Die Klassenfahrt'],
          ['My first concert', 'Mein erstes Konzert'],
          ['My first game console', 'Meine erste Spielkonsole'],
          ['My first cell phone', 'Mein erstes Handy'],
          ['My driver’s license', 'Der Führerschein'],
          ['Prom', 'Der Abschlussball'],
          ['My first kiss', 'Der erste Kuss'],
          ['Moving out', 'Der Auszug von zu Hause'],
          ['New Year’s Eve 1999', 'Silvester 1999'],
        ],
      },
      { from: 1960, items: [['The moon landing (1969)', 'Die Mondlandung (1969)']] },
      { from: 1980, items: [['The fall of the Berlin Wall (1989)', 'Der Mauerfall (1989)'], ['The 1990 World Cup', 'Die WM 1990']] },
      { from: 1990, items: [['The solar eclipse (1999)', 'Die Sonnenfinsternis (1999)']] },
      { from: 2000, items: [['The 2006 World Cup', 'Das Sommermärchen 2006']] },
    ],
  },
  {
    id: 'smells',
    icon: '👃',
    tab: ['Smells', 'Gerüche'],
    title: ['Smells you remember', 'Gerüche, an die du dich erinnerst'],
    placeholder: ['e.g. cinnamon …', 'z. B. Zimt …'],
    groups: [
      {
        items: [
          ['Cinnamon', 'Zimt'],
          ['Your own room', 'Das eigene Zimmer'],
          ['Apple scent at the drugstore', 'Apfelduft bei Rossmann'],
          ['Grandma’s kitchen', 'Omas Küche'],
          ['Freshly cut grass', 'Frisch gemähtes Gras'],
          ['Chlorine at the indoor pool', 'Chlor im Hallenbad'],
          ['Sunscreen', 'Sonnencreme'],
          ['Christmas cookies baking', 'Plätzchenbacken'],
          ['New school books', 'Neue Schulbücher'],
          ['Markers and glue', 'Edding und Uhu'],
          ['Sparklers', 'Wunderkerzen'],
          ['Cinema popcorn', 'Popcorn im Kino'],
          ['Campfire', 'Lagerfeuer'],
          ['Rain on warm asphalt', 'Regen auf warmem Asphalt'],
          ['Grandpa’s pipe tobacco', 'Opas Pfeifentabak'],
          ['Nivea cream', 'Nivea-Creme'],
          ['A new console straight out of the box', 'Eine neue Konsole frisch aus der Packung'],
          ['Bubble gum', 'Kaugummi (Hubba Bubba)'],
        ],
      },
    ],
  },
  {
    id: 'shops',
    icon: '🛍️',
    tab: ['Shops', 'Läden'],
    title: ['Old shops you loved', 'Alte Läden, die du gern besucht hast'],
    placeholder: ['e.g. Rossmann, Media Markt …', 'z. B. Rossmann, Media Markt …'],
    groups: [
      {
        items: [
          'Woolworth', 'Toys "R" Us', ['The record store', 'Der Plattenladen'], ['The video rental store', 'Die Videothek'], ['The toy store', 'Der Spielzeugladen'], ['The corner shop', 'Der Tante-Emma-Laden'],
          'de:Rossmann', 'de:Media Markt', 'de:Saturn', 'de:Schlecker', 'de:Karstadt', 'de:Kaufhof', 'de:Hertie', 'de:Quelle', 'de:Neckermann', 'de:Horten', 'de:ProMarkt', 'de:Videoworld',
          'en:Blockbuster', 'en:RadioShack', 'en:Tower Records', 'en:Kmart', 'en:Sears', 'en:Circuit City', 'en:KB Toys', 'en:Babbage’s', 'GameStop',
        ],
      },
    ],
  },
  {
    id: 'cards',
    icon: '🃏',
    tab: ['Cards', 'Karten'],
    title: ['Card games and collectibles', 'Kartenspiele und Sammelkarten'],
    placeholder: ['e.g. Yu-Gi-Oh!, Pokémon …', 'z. B. Yu-Gi-Oh!, Pokémon …'],
    timeless: ['Always around', 'Immer dabei'],
    groups: [
      { items: ['Uno', ['Old Maid', 'Schwarzer Peter'], 'de:Mau-Mau', 'de:Skat', 'de:Quartett', 'en:Top Trumps', ['Panini stickers', 'Panini-Sticker'], 'Phase 10'] },
      { from: 1980, items: ['en:Garbage Pail Kids', 'en:Baseball cards', 'de:Autoquartett'] },
      { from: 1990, items: ['Magic: The Gathering', ['Pokémon cards', 'Pokémon-Karten'], 'Yu-Gi-Oh!', ['Digimon cards', 'Digimon-Karten'], 'Dragon Ball', ['Pogs', 'Pogs / Milchdeckel']] },
      { from: 2000, items: ['Duel Masters', 'Hearthstone', 'Gwent'] },
    ],
  },
  {
    id: 'quotes',
    icon: '💬',
    tab: ['Quotes', 'Sprüche'],
    title: ['Lines from old games and films', 'Sprüche aus Spielen und Filmen'],
    placeholder: ['e.g. “I’ll be back.”', 'z. B. „I’ll be back.“'],
    timeless: ['Classics', 'Klassiker'],
    groups: [
      {
        items: [
          ['“Here’s looking at you, kid.” (Casablanca)', '„Schau mir in die Augen, Kleines.“ (Casablanca)'],
          ['“Beam me up, Scotty.” (Star Trek)', '„Beam mich hoch, Scotty.“ (Raumschiff Enterprise)'],
          ['“Bond. James Bond.”', '„Mein Name ist Bond. James Bond.“'],
        ],
      },
      {
        from: 1970,
        items: [
          ['“I’m gonna make him an offer he can’t refuse.” (The Godfather)', '„Ich mache ihm ein Angebot, das er nicht ablehnen kann.“ (Der Pate)'],
          ['“May the Force be with you.” (Star Wars)', '„Möge die Macht mit dir sein.“ (Star Wars)'],
        ],
      },
      {
        from: 1980,
        items: [
          ['“I am your father.” (Star Wars)', '„Ich bin dein Vater.“ (Star Wars)'],
          ['“E.T. phone home.”', '„E.T. nach Hause telefonieren.“'],
          '“I’ll be back.” (Terminator)',
          ['“Roads? Where we’re going, we don’t need roads.” (Back to the Future)', '„Straßen? Wo wir hinfahren, brauchen wir keine Straßen.“ (Zurück in die Zukunft)'],
          ['“There can be only one.” (Highlander)', '„Es kann nur einen geben.“ (Highlander)'],
          '“Here’s Johnny!” (The Shining)',
          ['“Thank you Mario! But our princess is in another castle!”', '„Thank you Mario! But our princess is in another castle!“'],
          ['“It’s dangerous to go alone! Take this.” (Zelda)', '„It’s dangerous to go alone! Take this.“ (Zelda)'],
        ],
      },
      {
        from: 1990,
        items: [
          ['“I’m Guybrush Threepwood, mighty pirate!” (Monkey Island)', '„Ich bin Guybrush Threepwood, ein mächtiger Pirat!“ (Monkey Island)'],
          ['“You fight like a dairy farmer.” (Monkey Island)', '„Du kämpfst wie ein dummer Bauer.“ (Monkey Island)'],
          '“Hasta la vista, baby.” (Terminator 2)',
          '“Hadouken!” (Street Fighter II)',
          '“Finish him!” (Mortal Kombat)',
          '“All your base are belong to us.” (Zero Wing)',
          ['“Life is like a box of chocolates.” (Forrest Gump)', '„Das Leben ist wie eine Schachtel Pralinen.“ (Forrest Gump)'],
          ['“Houston, we have a problem.” (Apollo 13)', '„Houston, wir haben ein Problem.“ (Apollo 13)'],
          ['“To infinity and beyond!” (Toy Story)', '„Bis zur Unendlichkeit und noch viel weiter!“ (Toy Story)'],
          '“Hakuna Matata” (The Lion King)',
          ['“I see dead people.” (The Sixth Sense)', '„Ich sehe tote Menschen.“ (The Sixth Sense)'],
          '“Snake? Snake?! SNAAAKE!” (Metal Gear Solid)',
          '“Do a barrel roll!” (Star Fox 64)',
          '“It’s-a me, Mario!”',
          '“Hey! Listen!” (Zelda: Ocarina of Time)',
          '“War. War never changes.” (Fallout)',
          ['“Gotta catch ’em all!” (Pokémon)', '„Schnapp sie dir alle!“ (Pokémon)'],
          '“Wololo” (Age of Empires)',
          ['“Not the mama!” (Dinosaurs)', '„Nicht die Mama!“ (Die Dinos)'],
        ],
      },
      {
        from: 2000,
        items: [
          '“Kept you waiting, huh?” (Metal Gear Solid)',
          '“The cake is a lie.” (Portal)',
          '“Would you kindly …” (BioShock)',
          ['“I used to be an adventurer like you, then I took an arrow in the knee.” (Skyrim)', '„Früher war ich ein Abenteurer wie du, dann habe ich einen Pfeil ins Knie bekommen.“ (Skyrim)'],
          ['“Winter is coming.” (Game of Thrones)', '„Der Winter naht.“ (Game of Thrones)'],
          ['“I am Groot.”', '„Ich bin Groot.“'],
        ],
      },
    ],
  },
];

export interface TreasureSection {
  id: TreasureKind;
  icon: string;
  tab: string;
  title: string;
  placeholder: string;
  groups: IdeaGroup[];
}

/** The chest's sections for this birth year, with the decade groups that fit. */
export function treasureSections(birthYear: number | null): TreasureSection[] {
  const now = new Date().getFullYear();
  return KINDS.map((kind) => {
    const groups = kind.groups
      .filter((g) => g.from === undefined || !birthYear || g.from + 9 >= birthYear - 10)
      .map((g) => ({
        key: String(g.from ?? 'all'),
        label:
          g.from === undefined
            ? kind.timeless && tr(...kind.timeless)
            : tr(`${g.from}s`, `${g.from}er`) + ageSuffix(g.from, Math.min(g.from + 9, now), birthYear, tr),
        items: g.items.map(localize).filter((n): n is string => !!n),
      }));
    return {
      id: kind.id,
      icon: kind.icon,
      tab: tr(...kind.tab),
      title: tr(...kind.title),
      placeholder: tr(...kind.placeholder),
      groups: dedupeGroups(groups),
    };
  });
}

/** One line per filled section ("Favorite characters: …"), for the AI and the memory book. */
export function treasureLines(user: UserProfile, max = 12): string[] {
  const t = user.treasures ?? {};
  return KINDS.filter((k) => t[k.id]?.length).map((k) => `${tr(...k.title)}: ${t[k.id]!.slice(0, max).join('; ')}`);
}
