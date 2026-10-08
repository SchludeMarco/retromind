import { ContentDatabase } from './types';
import { tr } from './lib/i18n';

// Audio: `spotifyPlaylistId` verweist auf Spotifys eigene, offizielle "All
// Out <Dekade>"-Playlist; die echten Hits werden nie von uns gehostet,
// sondern nur per offiziellem Spotify-Embed eingebunden (streamt direkt von
// Spotify) und starten automatisch im Hintergrund nach demselben ersten
// Klick — Spotify hat aber keine Lautstärke-Schnittstelle, läuft also immer
// in Spotifys eigener, von uns nicht regelbarer Lautstärke (siehe
// hooks/useSpotifyBackground.ts, components/SettingsModal.tsx).
// Galerie: überwiegend typografische "Postkarten". Wo ein Bild hinterlegt ist,
// ist es gemeinfrei (Quelle in `credit`); schlägt das Laden fehl, greift
// automatisch die Postkarten-Darstellung.

const DE_DB: ContentDatabase = {
  '1960': {
    title: 'Die 60er: Aufbruch & Flower Power',
    spotifyPlaylistId: '37i9dQZF1DXaKIA8E7WcJj', // Spotify-Editorial „All Out 60s“
    galleryItems: [
      { keyword: '1960s television', title: 'Der Fernseher im Wohnzimmer', description: 'Das Fernsehen wurde zum Mittelpunkt des Wohnzimmers. Ganze Familien versammelten sich vor den klobigen Kästen, um die wenigen Programme in Schwarz-Weiß zu sehen.' },
      { keyword: 'vinyl record player 1960', title: 'Der Plattenspieler', description: 'Musik war ein haptisches Erlebnis. Das Auflegen der Nadel und das leichte Knistern vor dem ersten Takt gehörten zum Ritual jedes Musikliebhabers.' },
      { keyword: 'vintage volkswagen beetle', title: 'Der VW Käfer', description: 'Der VW Käfer war das Symbol des Wirtschaftswunders – ein treuer Begleiter auf dem Weg in den ersten Italien-Urlaub.' },
      { keyword: 'apollo 11 moon landing', title: 'Die Mondlandung', description: 'Ein Moment, der die Welt anhielt: Der erste Schritt auf dem Mond markierte den ultimativen Aufbruch in eine neue Ära der Technik.', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Aldrin_Apollo_11_original.jpg?width=1000', credit: 'Foto: NASA / Neil Armstrong · gemeinfrei' }
    ],
    buzzwords: [
      { id: '60-1', category: 'tech', term: 'Wählscheibentelefon', knowledge: 'Bevor man tippte, musste man mit dem Finger mühsam jede Ziffer wählen. Ein Anruf dauerte ewig!', question: 'Kannst du dich noch an das mechanische Geräusch erinnern, wenn die Scheibe zurückschnellte?' },
      { id: '60-2', category: 'lifestyle', term: 'Pril-Blumen', knowledge: 'Bunte Aufkleber, die fast jede Küche in Deutschland schmückten. Sie waren Kult!', question: 'Wo in deinem Elternhaus klebten diese bunten Blumen?' },
      { id: '60-3', category: 'toy', term: 'Steckenpferd', knowledge: 'Ein Klassiker im Kinderzimmer, bevor Plastikspielzeug die Welt übernahm.', question: 'Bist du als Kind auch auf einem hölzernen Ross durch den Garten geritten?' },
      { id: '60-4', category: 'music', song: 'The Beatles Twist and Shout', term: 'Schallplattenspieler', knowledge: 'Das Knistern der Nadel war der Soundtrack einer ganzen Generation.', question: 'Welche war die allererste Platte, die du jemals besessen hast?' },
      { id: '60-5', category: 'lifestyle', term: 'Schlaghosen', knowledge: 'Die Hosenbeine konnten nicht weit genug sein – ein Symbol für Freiheit.', question: 'Warst du eher der Typ für dezente Weite oder volle Flower-Power?' },
      { id: '60-6', category: 'food', term: 'Toast Hawaii', knowledge: 'Ananas, Schinken, Käse – der Gipfel der Exotik in den deutschen Wohnzimmern.', question: 'War der Toast Hawaii bei euch ein Festessen oder ein schneller Snack?' },
      { id: '60-7', category: 'tech', term: 'Schwarz-Weiß-TV', knowledge: 'Damals gab es nur drei Programme und Sendeschluss mit Testbild.', question: 'Welche Sendung durftest du als Kind als einzige schauen?' },
      { id: '60-8', category: 'toy', term: 'Bonanza-Rad', knowledge: 'Der Traum jedes Jungen: Ein Fahrrad mit Bananensattel und Schaltung am Rahmen.', question: 'Hattest du ein eigenes oder warst du neidisch auf den Nachbarsjungen?' }
    ]
  },
  '1970': {
    title: 'Die 70er: Disco, Pril & Protest',
    spotifyPlaylistId: '37i9dQZF1DWTJ7xPn4vNaz', // Spotify-Editorial „All Out 70s“
    galleryItems: [
      { keyword: '1970s disco interior', title: 'Wohnen in Orange und Braun', description: 'Bunte Farben, wilde Muster und viel Kunststoff. Das Interieur der 70er war mutig, laut und ein Statement gegen die Biederkeit.' },
      { keyword: 'cassette deck 1970', title: 'Das Kassettendeck', description: 'Die Kompaktkassette demokratisierte die Musik. Endlich konnte man seine eigenen Mix-Tapes direkt aus dem Radio aufnehmen.' },
      { keyword: 'vintage polaroid camera', title: 'Die Sofortbildkamera', description: 'Sofortbildkameras brachten die Magie der Fotografie in den Alltag. Das Wedeln des Bildes beim Entwickeln war Pflicht.' },
      { keyword: 'lava lamp 70s', title: 'Die Lavalampe', description: 'Ein meditatives Lichtspiel, das in keinem Jugendzimmer fehlen durfte. Die auf- und absteigenden Wachsblasen faszinierten stundenlang.' }
    ],
    buzzwords: [
      { id: '70-1', category: 'tech', term: 'Kassettenrekorder', knowledge: 'Salat gab es nicht nur zum Essen, sondern oft auch im Tapedeck.', question: 'Hast du auch mit dem Bleistift das Band deiner Lieblingskassette wieder aufgewickelt?' },
      { id: '70-2', category: 'toy', term: 'Flutschfinger', knowledge: 'Das Eis, das glitschig war und nach Erdbeere, Limette und Orange schmeckte.', question: 'Warst du Team Flutschfinger oder eher Team Brauner Bär?' },
      { id: '70-3', category: 'lifestyle', term: 'Lavalampen', knowledge: 'Hypnotisierende Wachskugeln, die stundenlanges Starren garantierten.', question: 'In welcher Farbe leuchtete das "magische Licht" in deinem Zimmer?' },
      { id: '70-4', category: 'toy', term: 'Carrera-Bahn', knowledge: 'Stundenlanges Slot-Car-Racing auf dem Teppichboden.', question: 'Bist du in den Kurven auch immer rausgeflogen, weil du zu viel Gas gegeben hast?' },
      { id: '70-5', category: 'music', song: 'ABBA Dancing Queen', term: 'ABBA-Fieber', knowledge: 'Waterloo und Dancing Queen – niemand kam an den Schweden vorbei.', question: 'Kannst du heute noch mitsingen, wenn "Mamma Mia" im Radio läuft?' },
      { id: '70-6', category: 'tech', term: 'Polaroid-Kamera', knowledge: 'Magie pur: Das Foto kam sofort aus der Kamera und entwickelte sich vor deinen Augen.', question: 'Was war das Motiv deines allerersten Sofortbildes?' },
      { id: '70-7', category: 'lifestyle', term: 'Rollschuhe', knowledge: 'Echte Rollen zum Anschnallen an die Straßenschuhe, kein Inline-Quatsch.', question: 'Auf welchem Asphalt hast du dir die ersten Schürfwunden geholt?' },
      { id: '70-8', category: 'food', term: 'Prickel-Pit', knowledge: 'Die Brausetabletten, die so herrlich auf der Zunge prickelten.', question: 'Hast du sie gelutscht oder heimlich im Wasserglas aufgelöst?' }
    ]
  },
  '1980': {
    title: 'Die 80er: Neon, Synthies & Pixel',
    spotifyPlaylistId: '37i9dQZF1DX4UtSsGT1Sbe', // Spotify-Editorial „All Out 80s“
    galleryItems: [
      { keyword: '1980s neon arcade', title: 'Die Spielhalle', description: 'Spielhallen waren die Kathedralen der Technik. Der Sound von Pac-Man und das Blinken der Monitore prägten eine ganze Gamer-Generation.' },
      { keyword: 'walkman sony vintage', title: 'Der Walkman', description: 'Der Sony Walkman machte Musik privat und mobil. Die Welt um einen herum wurde plötzlich zum eigenen Musikvideo.', image: '/stitch-walkman.webp', credit: 'Bild: KI-generierte Zeit-Impression (Google Stitch)' },
      { keyword: 'commodore 64 computer', title: 'Der Commodore 64', description: 'Der C64 war für viele der erste Schritt in die digitale Welt. "Load ,8 ,1" war das magische Passwort zum Spielglück.' },
      { keyword: 'rubiks cube', title: 'Der Zauberwürfel', description: 'Ein einfacher Würfel wurde zum globalen Phänomen. Der Zauberwürfel forderte die Logik und Geduld von Millionen heraus.', image: '/stitch-zauberwuerfel.webp', credit: 'Bild: KI-generierte Zeit-Impression (Google Stitch)' }
    ],
    buzzwords: [
      { id: '80-1', category: 'tech', term: 'Walkman', knowledge: 'Plötzlich war Musik mobil. Kopfhörer mit orangem Schaumstoff waren Pflicht.', question: 'Welches Album lief in deiner "Dauerschleife" auf dem Weg zur Schule?' },
      { id: '80-2', category: 'toy', term: 'Zauberwürfel', knowledge: 'Er hat Millionen in den Wahnsinn getrieben – der Rubik\'s Cube.', question: 'Hast du ihn jemals ehrlich gelöst oder die Aufkleber abgepult?' },
      { id: '80-3', category: 'lifestyle', term: 'Vokuhila', knowledge: 'Vorne kurz, hinten lang. Damals der Inbegriff von Coolness.', question: 'Hand aufs Herz: Gibt es ein Foto von dir mit dieser legendären Frisur?' },
      { id: '80-4', category: 'tech', term: 'C64 "Brotkasten"', knowledge: 'Der Einstieg in die Welt der Heimcomputer mit 64 Kilobyte RAM.', question: 'Weißt du noch, wie lange das Laden eines Spiels von der "Datasette" dauerte?' },
      { id: '80-5', category: 'toy', term: 'He-Man / She-Ra', knowledge: 'Die Master of the Universe kämpften in jedem Kinderzimmer gegen Skeletor.', question: 'Hattest du die "Power of Grayskull" in deiner Spielzeugkiste?' },
      { id: '80-6', category: 'music', song: 'Nena 99 Luftballons', term: 'NDW', knowledge: 'Die Neue Deutsche Welle brachte 99 Luftballons und den Sternenhimmel.', question: 'Welcher deutsche Song war dein absoluter Party-Hit?' },
      { id: '80-7', category: 'lifestyle', term: 'Stulpen', knowledge: 'Nicht nur für Aerobic-Fans ein Muss, sondern auch im Alltag getragen.', question: 'Hattest du sie in Neonfarben oder eher dezent gestrickt?' },
      { id: '80-8', category: 'food', term: 'Magic Gum', knowledge: 'Das Kaugummi, das im Mund knallte und explodierte.', question: 'Hat es dich beim ersten Mal auch so erschreckt?' }
    ]
  },
  '1990': {
    title: 'Die 90er: Eurodance & Game Boys',
    spotifyPlaylistId: '37i9dQZF1DXbTxeAdrVG2l', // Spotify-Editorial „All Out 90s“
    galleryItems: [
      { keyword: '1990s tech room', title: 'Der beige PC', description: 'Das Jahrzehnt des digitalen Aufbruchs. PC-Gehäuse in Beige und Röhrenmonitore waren der Standard in jedem Arbeitszimmer.' },
      { keyword: 'game boy classic', title: 'Der Game Boy', description: 'Nintendos Game Boy war das Gadget der 90er. Ob im Auto oder unter der Bettdecke – Tetris ging immer.' },
      { keyword: 'tamagotchi toy', title: 'Das Tamagotchi', description: 'Das erste digitale Haustier. Es lehrte uns Verantwortung und trieb Lehrer weltweit in den Wahnsinn.' },
      { keyword: '90s grunge fashion', title: 'Grunge & Holzfällerhemd', description: 'Holzfällerhemden und zerrissene Jeans – der Grunge-Look war eine Rebellion gegen den Hochglanz der 80er Jahre.' }
    ],
    buzzwords: [
      { id: '90-1', category: 'toy', term: 'Tamagotchi', knowledge: 'Ein digitales Haustier, das ständig Aufmerksamkeit und Futter brauchte.', question: 'Ist dein Tamagotchi auch gestorben, weil du es in der Schule vergessen hast?' },
      { id: '90-2', category: 'tech', term: 'Game Boy', knowledge: 'Tetris-Melodien verfolgten uns bis in den Schlaf.', question: 'Wie viele Batterien hast du für dein mobiles Spiele-Glück verbraucht?' },
      { id: '90-3', category: 'lifestyle', term: 'Plateauschuhe', knowledge: 'Die Spice Girls machten die "Buffaloes" zum globalen Phänomen.', question: 'Bist du in den hohen Sohlen jemals umgeknickt?' },
      { id: '90-4', category: 'music', song: 'Backstreet Boys Everybody', term: 'Boybands', knowledge: 'Backstreet Boys oder Take That? Die Welt war gespalten.', question: 'Wessen Poster hing über deinem Bett?' },
      { id: '90-5', category: 'tech', term: 'Modem-Geräusch', knowledge: 'Das schrille Piepsen, wenn man ins "World Wide Web" ging.', question: 'Musstest du auch das Internet ausmachen, wenn jemand telefonieren wollte?' },
      { id: '90-6', category: 'toy', term: 'Diddl-Mäuse', knowledge: 'Blöcke, Stifte, Plüschtiere – die Maus mit den Riesenfüßen war überall.', question: 'Hast du die Blätter auch getauscht und in Folien gesammelt?' },
      { id: '90-7', category: 'lifestyle', term: 'Schnullerketten', knowledge: 'Plastikschnuller um den Hals – ein seltsames Mode-Accessoire der Techno-Zeit.', question: 'Hattest du eine ganze Sammlung in verschiedenen Farben?' },
      { id: '90-8', category: 'food', term: 'Center Shock', knowledge: 'Das extrem saure Kaugummi, das einem das Gesicht verzog.', question: 'Wer in deiner Clique konnte die sauerste Miene am längsten halten?' }
    ]
  },
  '2000': {
    title: 'Die 2000er: Millennium & Web 2.0',
    spotifyPlaylistId: '37i9dQZF1DX4o1oenSJRJd', // Spotify-Editorial „All Out 2000s“
    galleryItems: [
      { keyword: '2000s tech gadget', title: 'Alles wird kleiner', description: 'Die Miniaturisierung schritt voran. Handys wurden kleiner, MP3-Player zum Standard und das Internet wurde mobil.' },
      { keyword: 'nokia 3310 phone', title: 'Das Nokia 3310', description: 'Der unzerstörbare Klassiker. Das Nokia 3310 war bekannt für seinen Akku, der Wochen hielt, und das süchtig machende Spiel Snake.' },
      { keyword: 'ipod original', title: 'Der iPod', description: 'Apples iPod revolutionierte die Musikindustrie. "1000 Songs in deiner Tasche" war das Versprechen einer neuen digitalen Freiheit.' },
      { keyword: 'ps2 console', title: 'Die PlayStation 2', description: 'Die PlayStation 2 wurde zur meistverkauften Konsole aller Zeiten und brachte kinoreife Grafiken in die Kinderzimmer.' }
    ],
    buzzwords: [
      { id: '00-1', category: 'tech', term: 'Nokia 3310', knowledge: 'Unzerstörbar und der King dank des Spiels "Snake".', question: 'Was war dein Highscore bei Snake?' },
      { id: '00-2', category: 'lifestyle', term: 'MSN Messenger', knowledge: 'Das "Nudge"-Geräusch, wenn man ignoriert wurde, war legendär.', question: 'Wie sah dein erster peinlicher Status-Spruch aus?' },
      { id: '00-3', category: 'music', song: 'Jet Are You Gonna Be My Girl', term: 'iPod Classic', knowledge: '1000 Songs in deiner Tasche – das Ende des Discman-Zeitalters.', question: 'Weißt du noch, wie stolz du auf dein erstes Click-Wheel warst?' },
      { id: '00-4', category: 'toy', term: 'Beyblade', knowledge: 'Moderne Kreisel, die in Arenen gegeneinander kämpften.', question: 'Hattest du einen speziellen Kampf-Namen für deinen Beyblade?' },
      { id: '00-5', category: 'tech', term: 'USB-Sticks', knowledge: 'Endlich keine Disketten mehr, die beim ersten Kratzer kaputtgingen.', question: 'Was war die gigantische Kapazität deines ersten Sticks? 128 MB?' },
      { id: '00-6', category: 'lifestyle', term: 'Low-Rise Jeans', knowledge: 'Die Hosen konnten nicht tief genug sitzen – danke Britney Spears.', question: 'Hast du den Trend mitgemacht oder fandest du ihn damals schon schrecklich?' },
      { id: '00-7', category: 'music', song: 'Crazy Frog Axel F', term: 'Jamba-Sparabo', knowledge: 'Der Crazy Frog verfolgte uns als Klingelton im Fernsehen.', question: 'Bist du auch in die Klingelton-Falle getappt?' },
      { id: '00-8', category: 'food', term: 'Bubble Tea', knowledge: 'Die bunten Perlen eroberten plötzlich jede deutsche Innenstadt.', question: 'Erste Reaktion: Lecker oder "was glibbert da in meinem Mund"?' }
    ]
  },
  '2010': {
    title: 'Die 2010er: Smartphones & Streaming',
    spotifyPlaylistId: '37i9dQZF1DX5Ejj0EkURtP', // Spotify-Editorial „All Out 2010s“
    galleryItems: [
      { keyword: '2010s smartphone', title: 'Das Smartphone in jeder Hand', description: 'Der Touchscreen verdrängte die Tasten. Das Smartphone wurde Kamera, Musiksammlung, Stadtplan und Fernseher in einem – und wich kaum noch aus der Hand.' },
      { keyword: '2010s messaging', title: 'WhatsApp & der blaue Haken', description: 'Die SMS starb leise. Stattdessen: Gruppenchats, Sprachnachrichten und die kleine Angst, wenn zwei blaue Haken erschienen, aber keine Antwort kam.' },
      { keyword: '2010s streaming', title: 'Netflix-Abende', description: 'Ganze Serienstaffeln an einem Wochenende. "Nur noch eine Folge" wurde zum meistgebrochenen Versprechen des Jahrzehnts.' },
      { keyword: '2010s fidget spinner', title: 'Der Fidget Spinner', description: 'Ein kleines Lager aus Metall, das sich drehte – und für ein paar Monate 2017 auf jedem Schulhof surrte, bevor es wieder verschwand.' }
    ],
    buzzwords: [
      { id: '10-1', category: 'tech', term: 'Smartphone', knowledge: 'Wischen statt tippen. Plötzlich hatte jeder das ganze Internet in der Hosentasche.', question: 'Weißt du noch, welches dein erstes Smartphone war – und wie du es gehütet hast?' },
      { id: '10-2', category: 'tech', term: 'WhatsApp', knowledge: 'Kostenlose Nachrichten über WLAN – das Ende der teuren SMS.', question: 'In welchem Familien- oder Klassen-Gruppenchat warst du gefangen, aus dem du nie wieder rauskamst?' },
      { id: '10-3', category: 'lifestyle', term: 'Instagram-Filter', knowledge: 'Jedes Foto bekam einen Vintage-Look – ironischerweise, um moderner zu wirken.', question: 'Welches Motiv hast du früher am liebsten gepostet – und würdest du es heute noch zeigen?' },
      { id: '10-4', category: 'music', song: 'Avicii Wake Me Up', term: 'Spotify-Playlists', knowledge: 'Millionen Songs auf Abruf. Die selbst zusammengestellte Playlist ersetzte das Mixtape.', question: 'Gab es eine Playlist, die für dich zu einem bestimmten Sommer oder Menschen gehört?' },
      { id: '10-5', category: 'toy', term: 'Minecraft', knowledge: 'Eine Welt aus Klötzchen, in der man alles bauen konnte. Kinder und Eltern verstanden die Faszination oft sehr unterschiedlich.', question: 'Hast du selbst gebaut – oder jemandem beim stundenlangen Bauen zugesehen?' },
      { id: '10-6', category: 'toy', term: 'Fidget Spinner', knowledge: 'Der Hype, der aus dem Nichts kam und genauso schnell wieder ging.', question: 'Hattest du auch einen – und wie lange hat die Begeisterung bei dir gehalten?' },
      { id: '10-7', category: 'lifestyle', term: 'Serien-Bingen', knowledge: 'Ganze Staffeln am Stück. "Weiterschauen in 5 Sekunden" traf eine schwache Stelle in uns allen.', question: 'Welche Serie hat dir mal eine ganze Nacht gestohlen?' },
      { id: '10-8', category: 'food', term: 'Avocado-Toast', knowledge: 'Das Frühstück, über das eine ganze Generationsdebatte geführt wurde.', question: 'Warst du beim Café-Frühstück-Trend dabei – oder hast du nur den Kopf geschüttelt?' }
    ]
  }
};

// American English edition of the content. Same ids, keywords, images and
// songs as the German one; German pop-culture items that are the actual
// content stay, with the text around them in English.
const EN_DB: ContentDatabase = {
  '1960': {
    title: 'The ’60s: New Horizons & Flower Power',
    spotifyPlaylistId: DE_DB['1960'].spotifyPlaylistId,
    galleryItems: [
      { keyword: '1960s television', title: 'The TV in the Living Room', description: 'Television became the heart of the living room. Whole families gathered around the bulky boxes to watch the handful of black-and-white channels.' },
      { keyword: 'vinyl record player 1960', title: 'The Record Player', description: 'Music was something you could touch. Dropping the needle and hearing that soft crackle before the first beat was every music lover’s ritual.' },
      { keyword: 'vintage volkswagen beetle', title: 'The VW Beetle', description: 'The VW Beetle was the symbol of the postwar boom – a trusty companion on the first big family road trip.' },
      { keyword: 'apollo 11 moon landing', title: 'The Moon Landing', description: 'A moment that made the world stand still: the first step on the moon marked the ultimate leap into a new age of technology.', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Aldrin_Apollo_11_original.jpg?width=1000', credit: 'Photo: NASA / Neil Armstrong · public domain' }
    ],
    buzzwords: [
      { id: '60-1', category: 'tech', term: 'Rotary Phone', knowledge: 'Before there were buttons, you had to dial every single digit with your finger. A phone call took forever!', question: 'Do you still remember that mechanical whir when the dial spun back?' },
      { id: '60-2', category: 'lifestyle', term: 'Flower Stickers', knowledge: 'Bright flower decals (in Germany the famous “Pril flowers”) brightened up kitchens everywhere. They were cult!', question: 'Where in the house you grew up did those bright flowers stick?' },
      { id: '60-3', category: 'toy', term: 'Hobby Horse', knowledge: 'A nursery classic, before plastic toys took over the world.', question: 'Did you gallop around the yard on a wooden horse as a kid, too?' },
      { id: '60-4', category: 'music', song: 'The Beatles Twist and Shout', term: 'Record Player', knowledge: 'The crackle of the needle was the soundtrack of a whole generation.', question: 'What was the very first record you ever owned?' },
      { id: '60-5', category: 'lifestyle', term: 'Bell-Bottoms', knowledge: 'Pant legs could never be too wide – a symbol of freedom.', question: 'Were you more the subtle-flare type or full-on flower power?' },
      { id: '60-6', category: 'food', term: 'Hawaiian Toast', knowledge: 'Pineapple, ham, cheese – the height of exotic cooking in ’60s living rooms.', question: 'Was pineapple-and-ham toast a special treat at your house or a quick snack?' },
      { id: '60-7', category: 'tech', term: 'Black-and-White TV', knowledge: 'Back then there were only a few channels, and the day ended with sign-off and a test pattern.', question: 'Which show was the one you were allowed to watch as a kid?' },
      { id: '60-8', category: 'toy', term: 'Banana-Seat Bike', knowledge: 'Every kid’s dream: a bike with a banana seat and a gear shifter on the frame.', question: 'Did you have your own, or were you jealous of the kid next door?' }
    ]
  },
  '1970': {
    title: 'The ’70s: Disco, Flower Stickers & Protest',
    spotifyPlaylistId: DE_DB['1970'].spotifyPlaylistId,
    galleryItems: [
      { keyword: '1970s disco interior', title: 'Living in Orange and Brown', description: 'Bold colors, wild patterns and lots of plastic. ’70s interiors were daring, loud and a statement against everything stuffy.' },
      { keyword: 'cassette deck 1970', title: 'The Cassette Deck', description: 'The compact cassette put music in everyone’s hands. At last you could record your own mixtapes straight off the radio.' },
      { keyword: 'vintage polaroid camera', title: 'The Instant Camera', description: 'Instant cameras brought the magic of photography into everyday life. Shaking the picture while it developed was a must.' },
      { keyword: 'lava lamp 70s', title: 'The Lava Lamp', description: 'A meditative light show no teenager’s room could do without. The rising and sinking wax blobs were mesmerizing for hours.' }
    ],
    buzzwords: [
      { id: '70-1', category: 'tech', term: 'Cassette Recorder', knowledge: 'Tape spaghetti wasn’t just for dinner – it often ended up in the tape deck, too.', question: 'Did you also rewind your favorite tape with a pencil?' },
      { id: '70-2', category: 'toy', term: 'Popsicles', knowledge: 'Sticky, drippy ice pops in strawberry, lime and orange – the taste of summer.', question: 'What was your go-to ice pop from the ice cream truck?' },
      { id: '70-3', category: 'lifestyle', term: 'Lava Lamps', knowledge: 'Hypnotic wax blobs that guaranteed hours of staring.', question: 'What color did the “magic light” in your room glow?' },
      { id: '70-4', category: 'toy', term: 'Slot Car Racing', knowledge: 'Hours of slot car racing on the living room carpet.', question: 'Did you always fly off the track in the curves because you gave it too much gas?' },
      { id: '70-5', category: 'music', song: 'ABBA Dancing Queen', term: 'ABBA Fever', knowledge: 'Waterloo and Dancing Queen – nobody could escape the Swedes.', question: 'Can you still sing along when “Mamma Mia” comes on the radio?' },
      { id: '70-6', category: 'tech', term: 'Polaroid Camera', knowledge: 'Pure magic: the photo slid right out of the camera and developed before your eyes.', question: 'What was in your very first instant photo?' },
      { id: '70-7', category: 'lifestyle', term: 'Roller Skates', knowledge: 'Real metal skates you strapped onto your street shoes – none of that inline nonsense.', question: 'On which stretch of pavement did you get your first scraped knees?' },
      { id: '70-8', category: 'food', term: 'Fizzy Candy Tablets', knowledge: 'Sherbet tablets (in Germany: “Prickel-Pit”) that fizzed so wonderfully on your tongue.', question: 'Did you suck on them or secretly dissolve them in a glass of water?' }
    ]
  },
  '1980': {
    title: 'The ’80s: Neon, Synths & Pixels',
    spotifyPlaylistId: DE_DB['1980'].spotifyPlaylistId,
    galleryItems: [
      { keyword: '1980s neon arcade', title: 'The Arcade', description: 'Arcades were the cathedrals of technology. The sound of Pac-Man and the flickering screens shaped a whole generation of gamers.' },
      { keyword: 'walkman sony vintage', title: 'The Walkman', description: 'The Sony Walkman made music private and portable. Suddenly the world around you turned into your own music video.', image: '/stitch-walkman.webp', credit: 'Image: AI-generated impression of the era (Google Stitch)' },
      { keyword: 'commodore 64 computer', title: 'The Commodore 64', description: 'For many, the C64 was the first step into the digital world. “LOAD \"*\",8,1” was the magic password to gaming bliss.' },
      { keyword: 'rubiks cube', title: 'The Rubik’s Cube', description: 'A simple cube became a global phenomenon. The Rubik’s Cube tested the logic and patience of millions.', image: '/stitch-zauberwuerfel.webp', credit: 'Image: AI-generated impression of the era (Google Stitch)' }
    ],
    buzzwords: [
      { id: '80-1', category: 'tech', term: 'Walkman', knowledge: 'Suddenly music was portable. Headphones with orange foam pads were a must.', question: 'Which album was on endless repeat on your way to school?' },
      { id: '80-2', category: 'toy', term: 'Rubik’s Cube', knowledge: 'It drove millions up the wall – the Rubik’s Cube.', question: 'Did you ever solve it for real, or did you peel off the stickers?' },
      { id: '80-3', category: 'lifestyle', term: 'The Mullet', knowledge: 'Business in the front, party in the back. Back then, the very definition of cool.', question: 'Be honest: is there a photo of you with this legendary hairdo?' },
      { id: '80-4', category: 'tech', term: 'C64 “Breadbin”', knowledge: 'The gateway to home computing, with 64 kilobytes of RAM.', question: 'Do you remember how long it took to load a game from the tape drive?' },
      { id: '80-5', category: 'toy', term: 'He-Man / She-Ra', knowledge: 'The Masters of the Universe battled Skeletor in every kid’s bedroom.', question: 'Did you have “the Power of Grayskull” in your toy box?' },
      { id: '80-6', category: 'music', song: 'Nena 99 Luftballons', term: 'German New Wave', knowledge: 'The “Neue Deutsche Welle” gave the world 99 Luftballons – 99 red balloons.', question: 'Which song was your absolute party hit?' },
      { id: '80-7', category: 'lifestyle', term: 'Leg Warmers', knowledge: 'Not just a must for aerobics fans – people wore them every day.', question: 'Were yours neon-bright or more subtle and knitted?' },
      { id: '80-8', category: 'food', term: 'Pop Rocks', knowledge: 'The candy that crackled and popped in your mouth.', question: 'Did it startle you the first time, too?' }
    ]
  },
  '1990': {
    title: 'The ’90s: Eurodance & Game Boys',
    spotifyPlaylistId: DE_DB['1990'].spotifyPlaylistId,
    galleryItems: [
      { keyword: '1990s tech room', title: 'The Beige PC', description: 'The decade of the digital breakthrough. Beige PC towers and bulky CRT monitors were standard in every home office.' },
      { keyword: 'game boy classic', title: 'The Game Boy', description: 'Nintendo’s Game Boy was the gadget of the ’90s. In the car or under the covers – there was always time for Tetris.' },
      { keyword: 'tamagotchi toy', title: 'The Tamagotchi', description: 'The first digital pet. It taught us responsibility and drove teachers around the world crazy.' },
      { keyword: '90s grunge fashion', title: 'Grunge & Flannel', description: 'Flannel shirts and ripped jeans – the grunge look was a rebellion against the glossy ’80s.' }
    ],
    buzzwords: [
      { id: '90-1', category: 'toy', term: 'Tamagotchi', knowledge: 'A digital pet that constantly needed attention and food.', question: 'Did your Tamagotchi die too, because you forgot it at school?' },
      { id: '90-2', category: 'tech', term: 'Game Boy', knowledge: 'The Tetris music followed us all the way into our dreams.', question: 'How many batteries did you burn through for your portable gaming fix?' },
      { id: '90-3', category: 'lifestyle', term: 'Platform Shoes', knowledge: 'The Spice Girls turned chunky platform sneakers into a global phenomenon.', question: 'Did you ever twist your ankle in those towering soles?' },
      { id: '90-4', category: 'music', song: 'Backstreet Boys Everybody', term: 'Boy Bands', knowledge: 'Backstreet Boys or *NSYNC? The world was divided.', question: 'Whose poster hung over your bed?' },
      { id: '90-5', category: 'tech', term: 'Dial-Up Sound', knowledge: 'That screeching beep when you logged on to the “World Wide Web”.', question: 'Did you have to get off the internet whenever someone needed the phone?' },
      { id: '90-6', category: 'toy', term: 'Trading Stationery', knowledge: 'Notepads, pens, plush toys – collectible stationery (in Germany: Diddl, the mouse with giant feet) was everywhere.', question: 'Did you trade sheets too and collect them in plastic sleeves?' },
      { id: '90-7', category: 'lifestyle', term: 'Pacifier Necklaces', knowledge: 'Plastic pacifiers around your neck – a strange fashion accessory of the rave era.', question: 'Did you have a whole collection in different colors?' },
      { id: '90-8', category: 'food', term: 'Warheads', knowledge: 'Super-sour candy that made your whole face scrunch up.', question: 'Who in your crew could keep the sourest face the longest?' }
    ]
  },
  '2000': {
    title: 'The 2000s: Millennium & Web 2.0',
    spotifyPlaylistId: DE_DB['2000'].spotifyPlaylistId,
    galleryItems: [
      { keyword: '2000s tech gadget', title: 'Everything Gets Smaller', description: 'Gadgets kept shrinking. Cell phones got smaller, MP3 players became standard and the internet went mobile.' },
      { keyword: 'nokia 3310 phone', title: 'The Nokia 3310', description: 'The indestructible classic. The Nokia 3310 was famous for a battery that lasted for weeks and the addictive game Snake.' },
      { keyword: 'ipod original', title: 'The iPod', description: 'Apple’s iPod revolutionized the music industry. “1,000 songs in your pocket” was the promise of a new digital freedom.' },
      { keyword: 'ps2 console', title: 'The PlayStation 2', description: 'The PlayStation 2 became the best-selling console of all time and brought movie-quality graphics into kids’ bedrooms.' }
    ],
    buzzwords: [
      { id: '00-1', category: 'tech', term: 'Nokia 3310', knowledge: 'Indestructible, and the king thanks to the game “Snake”.', question: 'What was your high score in Snake?' },
      { id: '00-2', category: 'lifestyle', term: 'MSN Messenger', knowledge: 'The “nudge” sound when someone was ignoring you was legendary.', question: 'What was your first embarrassing status message?' },
      { id: '00-3', category: 'music', song: 'Jet Are You Gonna Be My Girl', term: 'iPod Classic', knowledge: '1,000 songs in your pocket – the end of the Discman era.', question: 'Do you remember how proud you were of your first click wheel?' },
      { id: '00-4', category: 'toy', term: 'Beyblade', knowledge: 'Modern spinning tops that battled each other in arenas.', question: 'Did you have a special battle name for your Beyblade?' },
      { id: '00-5', category: 'tech', term: 'USB Flash Drives', knowledge: 'Finally, no more floppy disks that died at the first scratch.', question: 'What was the gigantic capacity of your first flash drive? 128 MB?' },
      { id: '00-6', category: 'lifestyle', term: 'Low-Rise Jeans', knowledge: 'Pants could never sit low enough – thanks, Britney Spears.', question: 'Did you go along with the trend, or did you already hate it back then?' },
      { id: '00-7', category: 'music', song: 'Crazy Frog Axel F', term: 'Ringtone Subscriptions', knowledge: 'Crazy Frog chased us across every TV channel as a ringtone ad.', question: 'Did you fall into the ringtone trap, too?' },
      { id: '00-8', category: 'food', term: 'Bubble Tea', knowledge: 'Those colorful pearls suddenly popped up in every downtown.', question: 'First reaction: yummy, or “what’s that squishy thing in my mouth”?' }
    ]
  },
  '2010': {
    title: 'The 2010s: Smartphones & Streaming',
    spotifyPlaylistId: DE_DB['2010'].spotifyPlaylistId,
    galleryItems: [
      { keyword: '2010s smartphone', title: 'A Smartphone in Every Hand', description: 'Touchscreens pushed out keypads. The smartphone became camera, music collection, map and TV all in one – and hardly ever left our hands.' },
      { keyword: '2010s messaging', title: 'WhatsApp & the Blue Check Marks', description: 'Text messages quietly faded away. Instead: group chats, voice messages and that little panic when two blue check marks appeared but no reply came.' },
      { keyword: '2010s streaming', title: 'Netflix Nights', description: 'Whole seasons in a single weekend. “Just one more episode” became the most broken promise of the decade.' },
      { keyword: '2010s fidget spinner', title: 'The Fidget Spinner', description: 'A little metal bearing that spun – and for a few months in 2017 it whirred on every playground before vanishing again.' }
    ],
    buzzwords: [
      { id: '10-1', category: 'tech', term: 'Smartphone', knowledge: 'Swipe instead of type. Suddenly everyone had the whole internet in their pocket.', question: 'Do you remember your first smartphone – and how carefully you guarded it?' },
      { id: '10-2', category: 'tech', term: 'WhatsApp', knowledge: 'Free messages over Wi-Fi – the end of pricey text messages.', question: 'Which family or class group chat were you stuck in and could never escape?' },
      { id: '10-3', category: 'lifestyle', term: 'Instagram Filters', knowledge: 'Every photo got a vintage look – ironically, to seem more modern.', question: 'What did you love posting most back then – and would you still show it today?' },
      { id: '10-4', category: 'music', song: 'Avicii Wake Me Up', term: 'Spotify Playlists', knowledge: 'Millions of songs on demand. The homemade playlist replaced the mixtape.', question: 'Is there a playlist that belongs to a certain summer or person for you?' },
      { id: '10-5', category: 'toy', term: 'Minecraft', knowledge: 'A world made of blocks where you could build anything. Kids and parents often saw the appeal very differently.', question: 'Did you build things yourself – or watch someone else build for hours?' },
      { id: '10-6', category: 'toy', term: 'Fidget Spinner', knowledge: 'The craze that came out of nowhere and disappeared just as fast.', question: 'Did you have one too – and how long did the excitement last?' },
      { id: '10-7', category: 'lifestyle', term: 'Binge-Watching', knowledge: 'Whole seasons in one go. “Next episode in 5 seconds” hit a weak spot in all of us.', question: 'Which show once stole an entire night from you?' },
      { id: '10-8', category: 'food', term: 'Avocado Toast', knowledge: 'The breakfast that sparked a whole generational debate.', question: 'Were you on board with the café brunch trend – or did you just shake your head?' }
    ]
  }
};

export const DECADES_DB: ContentDatabase = tr(EN_DB, DE_DB);

// Interests and gender are stored with their German names (ids, see
// lib/session.ts INTEREST_TO_CATEGORY and lib/googleAuth.ts); these are the
// display labels.
export const INTEREST_LABELS: Record<string, string> = {
  Musik: tr('Music', 'Musik'),
  Technik: tr('Tech', 'Technik'),
  Spielzeug: tr('Toys', 'Spielzeug'),
  Alltag: tr('Everyday life', 'Alltag'),
  Mode: tr('Fashion', 'Mode'),
  Essen: tr('Food', 'Essen'),
};

export const GENDER_LABELS: Record<string, string> = {
  weiblich: tr('female', 'weiblich'),
  männlich: tr('male', 'männlich'),
  divers: tr('non-binary', 'divers'),
};
