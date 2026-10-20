import { tr } from '../../lib/i18n';

// Gaming legends, myths and famous facts for the Legenden-Ecke (Marco,
// 2026-10-20: "Legenden oder interessante Fakten näher beleuchten"). Every
// story is written for RetroMind, only from well-documented facts, so it may
// be shown and passed on freely. `wiki` is the English Wikipedia article for
// "read more" and for opening the game; `gameId` links a catalog game.

/** true = it really happened, myth = made up, partly = a true core, embellished. */
export type Verdict = 'true' | 'myth' | 'partly';

export interface Legend {
  id: string;
  year: number;
  verdict: Verdict;
  title: string;
  /** The claim as people tell it, guessed before the story is shown. */
  claim: string;
  story: string;
  wiki: string;
  /** Catalog game this legend belongs to. */
  gameId?: string;
  /** Open `wiki` as a game page (it is a game article). */
  game?: { title: string; platform: string };
  icon: string;
}

export const LEGENDS: Legend[] = [
  {
    id: 'et-landfill',
    year: 1983,
    verdict: 'partly',
    icon: '👽',
    title: tr('The E.T. landfill', 'Die E.T.-Müllkippe'),
    claim: tr(
      'Atari buried millions of unsold E.T. cartridges in the New Mexico desert.',
      'Atari hat Millionen unverkaufter E.T.-Module in der Wüste von New Mexico vergraben.'
    ),
    story: tr(
      'E.T. for the Atari 2600 was programmed in about five weeks to make Christmas 1982, and it flopped hard. In 1983 trucks really did dump Atari stock at a landfill in Alamogordo, New Mexico, and for decades nobody knew what was down there. In 2014 a film crew dug it up: they found E.T. cartridges, but also Centipede, Asteroids and lots of other games. Only about 1,300 cartridges were recovered, not millions. The dump was real, the "millions of E.T.s" were the legend.',
      'E.T. für das Atari 2600 wurde in rund fünf Wochen programmiert, damit es zu Weihnachten 1982 im Laden liegt, und floppte gewaltig. 1983 kippten Lastwagen tatsächlich Atari-Ware auf eine Deponie in Alamogordo, New Mexico, und jahrzehntelang wusste niemand, was dort liegt. 2014 grub ein Filmteam nach: Es fand E.T.-Module, aber auch Centipede, Asteroids und viele andere Spiele. Geborgen wurden etwa 1.300 Module, keine Millionen. Die Müllkippe war echt, die „Millionen E.T.s“ sind die Legende.'
    ),
    wiki: 'Atari video game burial',
  },
  {
    id: 'polybius',
    year: 1981,
    verdict: 'myth',
    icon: '🌀',
    title: 'Polybius',
    claim: tr(
      'In 1981 a mysterious arcade machine in Portland gave players nightmares and memory loss, and men in black collected data from it.',
      '1981 stand in Portland ein mysteriöser Automat, der Spielern Albträume und Gedächtnisverlust brachte, und Männer in Schwarz lasen ihn aus.'
    ),
    story: tr(
      'The story of Polybius first showed up on a website in 2000, almost 20 years after the cabinet supposedly stood in Portland. Nobody ever found a machine, a flyer, a circuit board or a company behind it. Researchers think the legend mixed real things from 1981: two players got sick at a Portland arcade, and the FBI did watch arcades there, but because of illegal gambling. Polybius itself is a ghost story, and since then several fan games have been made with that name.',
      'Die Geschichte von Polybius tauchte erst im Jahr 2000 auf einer Website auf, fast 20 Jahre nachdem der Automat in Portland gestanden haben soll. Niemand fand je ein Gerät, einen Flyer, eine Platine oder eine Firma dahinter. Forscher vermuten, dass die Legende echte Dinge von 1981 vermischt: In einer Spielhalle in Portland wurde zwei Spielern schlecht, und das FBI beobachtete dort Spielhallen, allerdings wegen illegalem Glücksspiel. Polybius selbst ist eine Gruselgeschichte, inzwischen gibt es mehrere Fan-Spiele mit dem Namen.'
    ),
    wiki: 'Polybius (urban legend)',
  },
  {
    id: 'invaders-coins',
    year: 1978,
    verdict: 'myth',
    icon: '👾',
    gameId: 'space-invaders',
    title: tr('The 100-yen shortage', 'Der 100-Yen-Engpass'),
    claim: tr(
      'Space Invaders was so popular that Japan ran out of 100-yen coins.',
      'Space Invaders war so beliebt, dass Japan die 100-Yen-Münzen ausgingen.'
    ),
    story: tr(
      'This one is told in countless books and TV shows. Space Invaders really was a craze in 1978, with whole cafés turned into "Invader houses" full of cabinets. But Japanese coin production records show no shortage: more 100-yen coins were minted in those years, not fewer, and the Bank of Japan never reported a problem. The craze was real, the empty coin purses were a myth.',
      'Diese Geschichte steht in unzähligen Büchern und TV-Dokus. Space Invaders war 1978 wirklich ein Rausch, ganze Cafés wurden zu „Invader-Häusern“ voller Automaten. Doch die Prägezahlen zeigen keinen Engpass: In diesen Jahren wurden mehr 100-Yen-Münzen geprägt, nicht weniger, und die japanische Zentralbank meldete nie ein Problem. Der Hype war echt, die leeren Geldbeutel sind ein Mythos.'
    ),
    wiki: 'Space Invaders',
  },
  {
    id: 'pong-tavern',
    year: 1972,
    verdict: 'true',
    icon: '🏓',
    gameId: 'pong',
    title: tr('Pong was “broken”', 'Pong war „kaputt“'),
    claim: tr(
      'The first Pong test machine stopped working after a few days because it was stuffed full of coins.',
      'Der erste Pong-Testautomat fiel nach wenigen Tagen aus, weil er randvoll mit Münzen war.'
    ),
    story: tr(
      'In 1972 Atari put a hand-built Pong cabinet into Andy Capp’s Tavern, a bar in Sunnyvale, California. After about two weeks the owner called: the machine was broken. Engineer Al Alcorn drove over, opened it and found the coin box so overfilled with quarters that the coin mechanism had jammed. That was the moment Atari knew it had a hit.',
      '1972 stellte Atari einen handgebauten Pong-Automaten in Andy Capp’s Tavern, eine Kneipe in Sunnyvale, Kalifornien. Nach etwa zwei Wochen rief der Wirt an: Das Ding sei kaputt. Ingenieur Al Alcorn fuhr hin, öffnete es und fand die Geldkassette so voll mit Vierteldollars, dass der Münzprüfer klemmte. In diesem Moment wusste Atari, dass es einen Hit hatte.'
    ),
    wiki: 'Pong',
  },
  {
    id: 'konami-code',
    year: 1985,
    verdict: 'true',
    icon: '🎮',
    title: tr('The Konami Code', 'Der Konami-Code'),
    claim: tr(
      '↑↑↓↓←→←→BA was a programmer’s shortcut because his own game was too hard for him.',
      '↑↑↓↓←→←→BA war die Abkürzung eines Programmierers, weil ihm sein eigenes Spiel zu schwer war.'
    ),
    story: tr(
      'Kazuhisa Hashimoto was porting the shooter Gradius to the NES in 1985 and found it too hard to test. So he added a secret input that gives the ship every power-up. He forgot to remove it, players found it, and Konami put the code into dozens of later games, most famously Contra with 30 lives. It is now the most famous cheat in the world and hides in many websites. Tip: it works here in the arcade too.',
      'Kazuhisa Hashimoto portierte 1985 den Shooter Gradius auf das NES und fand ihn zum Testen zu schwer. Also baute er eine geheime Eingabe ein, die dem Schiff alle Extras gibt. Er vergaß, sie zu entfernen, Spieler fanden sie, und Konami baute den Code in Dutzende spätere Spiele ein, am bekanntesten Contra mit 30 Leben. Heute ist er der berühmteste Cheat der Welt und steckt in vielen Websites. Tipp: Auch hier in der Spielhalle funktioniert er.'
    ),
    wiki: 'Konami Code',
  },
  {
    id: 'missingno',
    year: 1996,
    verdict: 'true',
    icon: '❓',
    title: 'MissingNo.',
    claim: tr(
      'A glitch Pokémon in Red and Blue could copy the sixth item in your bag.',
      'Ein Fehler-Pokémon in Rot und Blau konnte den sechsten Gegenstand im Beutel vervielfachen.'
    ),
    story: tr(
      'Talk to the old man in Viridian City, fly to Cinnabar Island and surf along the east coast: a garbled block of pixels called MissingNo. could appear. It is a leftover of empty slots in the Pokémon list. Meeting it raised the count of the sixth item in your bag by 128, which made endless Rare Candies possible. Nintendo warned that it could damage saves, and it really could mess up the Hall of Fame. Players loved it anyway.',
      'Mit dem alten Mann in Vertania City reden, zur Zinnoberinsel fliegen und an der Ostküste surfen: Dann konnte ein zerhackter Pixelblock namens MissingNo. auftauchen. Er ist ein Überbleibsel leerer Plätze in der Pokémon-Liste. Ihm zu begegnen erhöhte die Anzahl des sechsten Gegenstands im Beutel um 128, so gab es endlos Sonderbonbons. Nintendo warnte, das könne Spielstände beschädigen, und tatsächlich konnte die Ruhmeshalle durcheinandergeraten. Geliebt wurde er trotzdem.'
    ),
    wiki: 'MissingNo.',
  },
  {
    id: 'mew-truck',
    year: 1996,
    verdict: 'myth',
    icon: '🚚',
    title: tr('Mew under the truck', 'Mew unter dem Lastwagen'),
    claim: tr(
      'Next to the S.S. Anne there is a truck, and if you push it with Strength you find Mew.',
      'Neben der M.S. Anne steht ein Lastwagen, und wer ihn mit Stärke wegschiebt, findet Mew.'
    ),
    story: tr(
      'The lonely truck at the harbor of Vermilion City looked far too deliberate to mean nothing, and schoolyards everywhere swore Mew was under it. It cannot be moved, and nothing is under it. The truth is almost as good: programmer Shigeki Morimoto slipped Mew into the game at the very end, after the debug tools were removed, and players only got it at official events. Later glitches did make Mew catchable, but never through the truck.',
      'Der einsame Lastwagen am Hafen von Orania City sah viel zu gewollt aus, um nichts zu bedeuten, und auf jedem Schulhof schwor jemand, darunter liege Mew. Er lässt sich nicht bewegen, und darunter ist nichts. Die Wahrheit ist fast genauso gut: Programmierer Shigeki Morimoto schmuggelte Mew ganz zum Schluss ins Spiel, nachdem die Debug-Werkzeuge schon entfernt waren, und Spieler bekamen es nur auf offiziellen Events. Später machten Glitches Mew fangbar, aber nie über den Lastwagen.'
    ),
    wiki: 'Mew (Pokémon)',
  },
  {
    id: 'adventure-egg',
    year: 1980,
    verdict: 'true',
    icon: '🥚',
    title: tr('The first Easter egg', 'Das erste Easter Egg'),
    claim: tr(
      'A programmer hid his name in an Atari game because Atari never named its developers.',
      'Ein Programmierer versteckte seinen Namen in einem Atari-Spiel, weil Atari seine Entwickler nie nannte.'
    ),
    story: tr(
      'Atari did not print programmers’ names on its games. Warren Robinett, who made Adventure for the Atari 2600, built a secret room anyway: carry a single grey pixel, the "dot", to the right wall and you enter a room that says "Created by Warren Robinett". A teenager found it and wrote to Atari. Instead of removing it, Atari called such secrets "Easter eggs", the name we still use today.',
      'Atari druckte die Namen der Programmierer nicht auf seine Spiele. Warren Robinett, der Adventure für das Atari 2600 baute, versteckte trotzdem einen geheimen Raum: Wer einen einzelnen grauen Pixel, den „Punkt“, an die richtige Wand trägt, betritt einen Raum mit „Created by Warren Robinett“. Ein Jugendlicher fand ihn und schrieb an Atari. Statt ihn zu entfernen, nannte Atari solche Geheimnisse „Easter Eggs“, so heißen sie bis heute.'
    ),
    wiki: 'Adventure (1980 video game)',
    game: { title: 'Adventure', platform: 'Atari 2600' },
  },
  {
    id: 'puck-man',
    year: 1980,
    verdict: 'true',
    icon: '🟡',
    title: tr('Puck-Man', 'Puck-Man'),
    claim: tr(
      'Pac-Man was originally called Puck-Man and was renamed so nobody could scratch the P into an F.',
      'Pac-Man hieß ursprünglich Puck-Man und wurde umbenannt, damit niemand das P zu einem F kratzt.'
    ),
    story: tr(
      'In Japan the game came out in 1980 as Puck-Man, after "paku paku", the Japanese sound for munching. For the American release Midway feared that vandals would turn the P on the cabinets into an F, making a rude word. So it became Pac-Man. The idea for the shape, a pizza with one slice missing, comes from designer Toru Iwatani himself, who later said it was only half the truth.',
      'In Japan erschien das Spiel 1980 als Puck-Man, nach „paku paku“, dem japanischen Laut fürs Mampfen. Für den Start in den USA fürchtete Midway, dass Vandalen auf den Automaten das P zu einem F umkratzen und so ein Schimpfwort entsteht. Also hieß er Pac-Man. Die Idee zur Form, eine Pizza mit einem fehlenden Stück, stammt von Erfinder Toru Iwatani selbst, der später sagte, das sei nur die halbe Wahrheit.'
    ),
    wiki: 'Pac-Man',
    game: { title: 'Pac-Man', platform: 'Arcade' },
  },
  {
    id: 'pacman-256',
    year: 1980,
    verdict: 'true',
    icon: '🍒',
    title: tr('Level 256', 'Level 256'),
    claim: tr('Pac-Man has no ending, but on level 256 the screen breaks in half.', 'Pac-Man hat kein Ende, aber in Level 256 zerbricht der Bildschirm in zwei Hälften.'),
    story: tr(
      'Pac-Man counts its levels in a single byte, which can only hold 0 to 255. When the fruit for level 256 is drawn, the counter overflows and the game paints garbage over the whole right half of the maze. There are not enough dots left to finish the level, so the game simply cannot go on. Players call it the "kill screen". The first perfect game, every dot, fruit and ghost up to that point, was played in 1999.',
      'Pac-Man zählt seine Level in einem einzigen Byte, das nur 0 bis 255 kennt. Wenn das Obst für Level 256 gezeichnet wird, läuft der Zähler über und das Spiel malt Pixelsalat über die ganze rechte Hälfte des Labyrinths. Es bleiben zu wenig Punkte übrig, um das Level zu schaffen, also geht es einfach nicht weiter. Spieler nennen das den „Kill Screen“. Das erste perfekte Spiel, jeder Punkt, jedes Obst und jeder Geist bis dorthin, gelang 1999.'
    ),
    wiki: 'Pac-Man',
    game: { title: 'Pac-Man', platform: 'Arcade' },
  },
  {
    id: 'tetris-crash',
    year: 2023,
    verdict: 'true',
    icon: '🧱',
    title: tr('Beating NES Tetris', 'NES-Tetris durchgespielt'),
    claim: tr(
      'After 34 years someone made NES Tetris crash on purpose, which counts as beating it.',
      'Nach 34 Jahren hat jemand NES-Tetris absichtlich zum Absturz gebracht, und das zählt als Durchspielen.'
    ),
    story: tr(
      'For decades level 29 was the end of NES Tetris: the blocks fall so fast that nobody could keep up. Then players learned "rolling", tapping the controller from below with their fingers, and got further and further. The game was never meant to go that far, and at some point its code runs out of control. On 21 December 2023 a 13-year-old from Oklahoma was the first human to make it freeze. Since then players race to that crash.',
      'Jahrzehntelang war Level 29 das Ende von NES-Tetris: Die Steine fallen so schnell, dass niemand mithalten konnte. Dann lernten Spieler das „Rolling“, bei dem die Finger den Controller von unten antippen, und kamen immer weiter. So weit war das Spiel nie gedacht, irgendwann gerät sein Code außer Kontrolle. Am 21. Dezember 2023 brachte es ein 13-Jähriger aus Oklahoma als erster Mensch zum Einfrieren. Seitdem wird um die Wette auf diesen Absturz hingespielt.'
    ),
    wiki: 'Tetris (NES video game)',
    game: { title: 'Tetris', platform: 'NES' },
  },
  {
    id: 'nintendo-1889',
    year: 1889,
    verdict: 'true',
    icon: '🎴',
    title: tr('Nintendo started with cards', 'Nintendo fing mit Spielkarten an'),
    claim: tr('Nintendo was founded in 1889, as a maker of playing cards.', 'Nintendo wurde 1889 gegründet, als Hersteller von Spielkarten.'),
    story: tr(
      'Fusajiro Yamauchi opened a small shop in Kyoto in 1889 that made hanafuda, Japanese flower cards. In the 20th century Nintendo tried taxis, a TV channel and instant rice before toys and games took off. The Game & Watch handhelds came in 1980, the Famicom in 1983. Nintendo still sells hanafuda cards today.',
      'Fusajiro Yamauchi eröffnete 1889 in Kyoto einen kleinen Laden, der Hanafuda herstellte, japanische Blumenkarten. Im 20. Jahrhundert probierte Nintendo Taxis, einen Fernsehsender und Instantreis aus, bevor Spielzeug und Spiele zündeten. 1980 kamen die Game-&-Watch-Handhelds, 1983 das Famicom. Hanafuda-Karten verkauft Nintendo bis heute.'
    ),
    wiki: 'Nintendo',
  },
  {
    id: 'minus-world',
    year: 1985,
    verdict: 'true',
    icon: '🍄',
    title: tr('The Minus World', 'Die Minus-Welt'),
    claim: tr('Super Mario Bros. has a secret World -1 that never ends.', 'Super Mario Bros. hat eine geheime Welt -1, die nie endet.'),
    story: tr(
      'In World 1-2, Mario can squeeze through the wall above the exit pipe with a precise jump. If he enters the warp zone before the game has drawn its signs, the pipe sends him to an underwater level whose number shows as " -1". Every pipe at its end leads back to its start, forever. It is not a secret level, just a glitch, but in the 1980s it was the stuff of schoolyard legends.',
      'In Welt 1-2 kann Mario sich mit einem genauen Sprung durch die Wand über dem Ausgangsrohr zwängen. Betritt er die Warp-Zone, bevor das Spiel die Schilder gezeichnet hat, schickt ihn das Rohr in ein Unterwasser-Level, dessen Nummer als „ -1“ erscheint. Das Rohr am Ende führt immer wieder zum Anfang, für immer. Ein geheimes Level ist es nicht, nur ein Fehler, aber in den 80ern war es Schulhof-Legende pur.'
    ),
    wiki: 'Minus World',
    game: { title: 'Super Mario Bros.', platform: 'NES' },
  },
  {
    id: 'sheng-long',
    year: 1992,
    verdict: 'myth',
    icon: '🥋',
    title: 'Sheng Long',
    claim: tr(
      'In Street Fighter II you can fight Sheng Long, Ryu’s secret master.',
      'In Street Fighter II kann man gegen Sheng Long kämpfen, Ryus geheimen Meister.'
    ),
    story: tr(
      'Ryu’s win quote in the English Street Fighter II reads "You must defeat Sheng Long to stand a chance." It was a translation slip: the Japanese line means something like "if you can’t overcome my Shoryuken, you have no chance". The magazine EGM then printed an April Fools’ joke in 1992 with an absurd way to unlock a secret fighter named Sheng Long, and kids all over the world tried it for months. He never existed.',
      'Ryus Siegerspruch im englischen Street Fighter II lautet „You must defeat Sheng Long to stand a chance.“ Das war ein Übersetzungsfehler: Auf Japanisch heißt es ungefähr „Wer meinen Shoryuken nicht übersteht, hat keine Chance“. Die Zeitschrift EGM druckte 1992 dann einen Aprilscherz mit einem absurden Weg, einen geheimen Kämpfer Sheng Long freizuschalten, und Kinder auf der ganzen Welt probierten es monatelang. Es gab ihn nie.'
    ),
    wiki: 'Sheng Long',
  },
  {
    id: 'doom-everywhere',
    year: 1993,
    verdict: 'partly',
    icon: '🔫',
    title: tr('Doom runs on everything', 'Doom läuft auf allem'),
    claim: tr('Doom has been run on a pregnancy test.', 'Doom lief schon auf einem Schwangerschaftstest.'),
    story: tr(
      'id Software released the Doom source code in 1999, and since then people port it to anything with a screen: calculators, printers, cameras, fridges, a tractor. "Does it run Doom?" became a running joke. The pregnancy test from 2020 is half true: the case was real, but the display and the chip inside were swapped for new ones, and the game itself ran on a computer and was only shown there.',
      'id Software gab 1999 den Quellcode von Doom frei, seitdem portieren Leute es auf alles mit einem Bildschirm: Taschenrechner, Drucker, Kameras, Kühlschränke, einen Traktor. „Läuft da Doom drauf?“ wurde zum Running Gag. Der Schwangerschaftstest von 2020 stimmt nur halb: Das Gehäuse war echt, aber Display und Chip darin wurden durch neue ersetzt, und das Spiel lief auf einem Computer und wurde dort nur angezeigt.'
    ),
    wiki: 'Doom (1993 video game)',
    game: { title: 'Doom', platform: 'MS-DOS' },
  },
  {
    id: 'mario-segale',
    year: 1981,
    verdict: 'true',
    icon: '🔨',
    title: tr('Who Mario is named after', 'Nach wem Mario heißt'),
    claim: tr('Mario is named after the landlord of Nintendo’s American warehouse.', 'Mario ist nach dem Vermieter von Nintendos amerikanischem Lagerhaus benannt.'),
    story: tr(
      'In Donkey Kong (1981) the hero was simply "Jumpman". At Nintendo of America, so the story goes, staff were unpacking cabinets in a rented warehouse near Seattle when landlord Mario Segale came in angry about late rent. The team gave the little plumber his name. Segale himself hardly ever spoke about it until he died in 2018.',
      'In Donkey Kong (1981) hieß der Held einfach „Jumpman“. Bei Nintendo of America, so wird es erzählt, packten Mitarbeiter in einem gemieteten Lager bei Seattle Automaten aus, als Vermieter Mario Segale wütend wegen der späten Miete hereinkam. Das Team gab dem kleinen Klempner seinen Namen. Segale selbst sprach bis zu seinem Tod 2018 kaum darüber.'
    ),
    wiki: 'Mario',
  },
  {
    id: 'duck-hunt-dog',
    year: 1984,
    verdict: 'partly',
    icon: '🐶',
    title: tr('Shooting the Duck Hunt dog', 'Den Duck-Hunt-Hund abschießen'),
    claim: tr('You can shoot the laughing dog in Duck Hunt.', 'Man kann den lachenden Hund in Duck Hunt abschießen.'),
    story: tr(
      'Millions of kids tried it at home, because nothing is as annoying as that snicker after a miss. On the NES it does not work, the dog cannot be hit. But in the arcade version Vs. Duck Hunt the dog pops up in the bonus stage and can be shot there. So the legend is true, just not on the home console.',
      'Millionen Kinder probierten es zu Hause, denn nichts nervt so sehr wie das Kichern nach einem Fehlschuss. Auf dem NES klappt es nicht, der Hund ist nicht zu treffen. In der Automatenversion Vs. Duck Hunt taucht er aber in der Bonusrunde auf und kann dort getroffen werden. Die Legende stimmt also, nur nicht auf der Heimkonsole.'
    ),
    wiki: 'Duck Hunt',
    game: { title: 'Duck Hunt', platform: 'NES' },
  },
  {
    id: 'porygon',
    year: 1997,
    verdict: 'true',
    icon: '📺',
    title: tr('The Porygon episode', 'Die Porygon-Folge'),
    claim: tr('One episode of the Pokémon cartoon sent hundreds of children in Japan to hospital.', 'Eine Folge der Pokémon-Serie brachte in Japan Hunderte Kinder ins Krankenhaus.'),
    story: tr(
      'On 16 December 1997 Japanese TV showed the episode "Dennō Senshi Porygon". An explosion scene flashed red and blue for several seconds, and hundreds of viewers, most of them children, had seizures or felt sick, many were taken to hospital. The series paused for four months. Since then TV channels and game makers worldwide follow rules for flashing images, and many games show the warning you know from the start screen.',
      'Am 16. Dezember 1997 lief im japanischen Fernsehen die Folge „Dennō Senshi Porygon“. Eine Explosionsszene blinkte mehrere Sekunden rot und blau, und Hunderte Zuschauer, meist Kinder, bekamen Anfälle oder Übelkeit, viele kamen ins Krankenhaus. Die Serie pausierte vier Monate. Seitdem gelten weltweit Regeln für Blitzbilder im Fernsehen, und viele Spiele zeigen den Warnhinweis, den man vom Startbildschirm kennt.'
    ),
    wiki: 'Dennō Senshi Porygon',
  },
  {
    id: 'lemmings-cliff',
    year: 1991,
    verdict: 'myth',
    icon: '🐹',
    gameId: 'lemmings',
    title: tr('Lemmings jump off cliffs', 'Lemminge springen von Klippen'),
    claim: tr('Real lemmings follow each other off cliffs, and that is where the game got its idea.', 'Echte Lemminge folgen einander in den Abgrund, daher hat das Spiel seine Idee.'),
    story: tr(
      'The game took the idea from a famous belief, but the belief is wrong. Lemmings do migrate in big numbers and some drown crossing water, but they do not go to their deaths on purpose. The picture in people’s heads largely comes from the 1958 Disney film "White Wilderness", where the animals were pushed off a cliff by the film crew. DMA Design, later the makers of GTA, turned the myth into one of the best puzzle games ever.',
      'Das Spiel nahm seine Idee aus einem berühmten Glauben, doch der stimmt nicht. Lemminge wandern zwar in großen Mengen, und manche ertrinken beim Überqueren von Wasser, aber sie stürzen sich nicht absichtlich in den Tod. Das Bild in den Köpfen stammt vor allem aus dem Disney-Film „White Wilderness“ von 1958, in dem das Filmteam die Tiere von einer Klippe schob. DMA Design, später die Macher von GTA, machten aus dem Mythos eines der besten Knobelspiele überhaupt.'
    ),
    wiki: 'Lemming',
  },
  {
    id: 'giana-pulled',
    year: 1987,
    verdict: 'partly',
    icon: '💎',
    gameId: 'giana-sisters',
    title: tr('Giana vs. Mario', 'Giana gegen Mario'),
    claim: tr('Nintendo sued The Great Giana Sisters off the shelves.', 'Nintendo hat The Great Giana Sisters per Klage aus den Läden geholt.'),
    story: tr(
      'The Great Giana Sisters (1987) even advertised itself with "The brothers are history", and its first level looks a lot like Super Mario Bros. Soon after release it vanished from shops, which made the copies that were sold rare collector’s items. No lawsuit was ever made public; it is usually said that pressure from Nintendo was enough. The sisters came back officially in 2009 on the Nintendo DS, of all places.',
      'The Great Giana Sisters (1987) warb sogar mit „The brothers are history“, und das erste Level sieht Super Mario Bros. sehr ähnlich. Kurz nach dem Start verschwand es aus den Läden, die verkauften Exemplare wurden zu Sammlerstücken. Eine Klage wurde nie öffentlich, meist heißt es, Druck von Nintendo habe gereicht. Offiziell kamen die Schwestern 2009 zurück, ausgerechnet auf dem Nintendo DS.'
    ),
    wiki: 'The Great Giana Sisters',
  },
  {
    id: 'asteroids-lurking',
    year: 1979,
    verdict: 'true',
    icon: '☄️',
    gameId: 'asteroids',
    title: tr('Lurking in Asteroids', 'Lauern in Asteroids'),
    claim: tr('Players played Asteroids for hours on one coin by never shooting the last rock.', 'Spieler zockten Asteroids stundenlang mit einer Münze, weil sie den letzten Brocken nie abschossen.'),
    story: tr(
      'Leave one small asteroid alive, park at the edge and wait for the flying saucers, which are worth many more points. This "lurking" let good players stay on one coin for hours, which cost arcade owners money. Atari reacted with a revised version in which the small saucer aims at you and gets more dangerous, so waiting no longer paid off.',
      'Einen kleinen Asteroiden am Leben lassen, am Rand parken und auf die fliegenden Untertassen warten, die viel mehr Punkte bringen. Mit diesem „Lurking“ blieben gute Spieler stundenlang auf einer Münze, und den Hallenbesitzern entging Geld. Atari reagierte mit einer überarbeiteten Version, in der die kleine Untertasse auf dich zielt und gefährlicher wird, damit sich das Warten nicht mehr lohnt.'
    ),
    wiki: 'Asteroids (video game)',
  },
  {
    id: 'keen-mario',
    year: 1990,
    verdict: 'true',
    icon: '🚀',
    gameId: 'commander-keen',
    title: tr('Mario on the PC', 'Mario auf dem PC'),
    claim: tr('The makers of Doom once built Super Mario Bros. 3 for the PC and offered it to Nintendo.', 'Die Macher von Doom bauten einst Super Mario Bros. 3 für den PC nach und boten es Nintendo an.'),
    story: tr(
      'In 1990 John Carmack figured out how to scroll the screen smoothly on ordinary PCs, something people thought only consoles could do. Overnight he and Tom Hall rebuilt the first level of Super Mario Bros. 3 as a demo, jokingly called "Dangerous Dave in Copyright Infringement". Nintendo politely said no to a PC Mario. So the team made its own hero instead: Commander Keen, and soon after founded id Software.',
      '1990 fand John Carmack heraus, wie man auf gewöhnlichen PCs den Bildschirm flüssig scrollt, was man nur Konsolen zutraute. Über Nacht bauten er und Tom Hall das erste Level von Super Mario Bros. 3 als Demo nach, scherzhaft „Dangerous Dave in Copyright Infringement“ genannt. Nintendo lehnte einen PC-Mario höflich ab. Also erfand das Team einen eigenen Helden: Commander Keen, und gründete bald darauf id Software.'
    ),
    wiki: 'Commander Keen',
  },
  {
    id: 'breakout-jobs',
    year: 1976,
    verdict: 'true',
    icon: '🍏',
    gameId: 'breakout-1976',
    title: tr('Breakout and the two Steves', 'Breakout und die zwei Steves'),
    claim: tr('Steve Jobs and Steve Wozniak built Breakout for Atari, and Jobs kept most of the bonus.', 'Steve Jobs und Steve Wozniak bauten Breakout für Atari, und Jobs behielt den Großteil der Prämie.'),
    story: tr(
      'Atari wanted a Pong for one player with as few chips as possible and offered a bonus for every chip saved. Jobs, then working at Atari, took the job and got his friend Wozniak to design the board in four nights. Wozniak got very few chips into it. According to Wozniak, Jobs told him the pay was 700 dollars and gave him half, and only years later did he learn about the bonus of several thousand. A few months later the two founded Apple.',
      'Atari wollte ein Pong für einen Spieler mit möglichst wenigen Chips und zahlte eine Prämie für jeden eingesparten Chip. Jobs, damals bei Atari, nahm den Auftrag an und holte seinen Freund Wozniak, der die Platine in vier Nächten entwarf, mit sehr wenigen Chips. Laut Wozniak nannte Jobs ihm 700 Dollar Lohn und gab ihm die Hälfte, von der Prämie über mehrere Tausend erfuhr er erst Jahre später. Wenige Monate danach gründeten die beiden Apple.'
    ),
    wiki: 'Breakout (video game)',
  },
];

/** The legend shown on the catalog today; changes once a day. */
export function legendOfTheDay(now = new Date()): Legend {
  const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  return LEGENDS[day % LEGENDS.length];
}

/** Legends that belong to a game page (catalog id or the same article). */
export function legendsFor(game: { id: string; wiki: string }): Legend[] {
  return LEGENDS.filter((l) => l.gameId === game.id || (l.game && l.wiki === game.wiki));
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  true: tr('TRUE', 'WAHR'),
  myth: tr('MYTH', 'MYTHOS'),
  partly: tr('HALF TRUE', 'HALB WAHR'),
};
