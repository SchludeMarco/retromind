import { ContentDatabase } from './types';

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

export const DECADES_DB: ContentDatabase = {
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
      { id: '60-4', category: 'music', term: 'Schallplattenspieler', knowledge: 'Das Knistern der Nadel war der Soundtrack einer ganzen Generation.', question: 'Welche war die allererste Platte, die du jemals besessen hast?' },
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
      { id: '70-5', category: 'music', term: 'ABBA-Fieber', knowledge: 'Waterloo und Dancing Queen – niemand kam an den Schweden vorbei.', question: 'Kannst du heute noch mitsingen, wenn "Mamma Mia" im Radio läuft?' },
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
      { keyword: 'walkman sony vintage', title: 'Der Walkman', description: 'Der Sony Walkman machte Musik privat und mobil. Die Welt um einen herum wurde plötzlich zum eigenen Musikvideo.' },
      { keyword: 'commodore 64 computer', title: 'Der Commodore 64', description: 'Der C64 war für viele der erste Schritt in die digitale Welt. "Load ,8 ,1" war das magische Passwort zum Spielglück.' },
      { keyword: 'rubiks cube', title: 'Der Zauberwürfel', description: 'Ein einfacher Würfel wurde zum globalen Phänomen. Der Zauberwürfel forderte die Logik und Geduld von Millionen heraus.' }
    ],
    buzzwords: [
      { id: '80-1', category: 'tech', term: 'Walkman', knowledge: 'Plötzlich war Musik mobil. Kopfhörer mit orangem Schaumstoff waren Pflicht.', question: 'Welches Album lief in deiner "Dauerschleife" auf dem Weg zur Schule?' },
      { id: '80-2', category: 'toy', term: 'Zauberwürfel', knowledge: 'Er hat Millionen in den Wahnsinn getrieben – der Rubik\'s Cube.', question: 'Hast du ihn jemals ehrlich gelöst oder die Aufkleber abgepult?' },
      { id: '80-3', category: 'lifestyle', term: 'Vokuhila', knowledge: 'Vorne kurz, hinten lang. Damals der Inbegriff von Coolness.', question: 'Hand aufs Herz: Gibt es ein Foto von dir mit dieser legendären Frisur?' },
      { id: '80-4', category: 'tech', term: 'C64 "Brotkasten"', knowledge: 'Der Einstieg in die Welt der Heimcomputer mit 64 Kilobyte RAM.', question: 'Weißt du noch, wie lange das Laden eines Spiels von der "Datasette" dauerte?' },
      { id: '80-5', category: 'toy', term: 'He-Man / She-Ra', knowledge: 'Die Master of the Universe kämpften in jedem Kinderzimmer gegen Skeletor.', question: 'Hattest du die "Power of Grayskull" in deiner Spielzeugkiste?' },
      { id: '80-6', category: 'music', term: 'NDW', knowledge: 'Die Neue Deutsche Welle brachte 99 Luftballons und den Sternenhimmel.', question: 'Welcher deutsche Song war dein absoluter Party-Hit?' },
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
      { id: '90-4', category: 'music', term: 'Boybands', knowledge: 'Backstreet Boys oder Take That? Die Welt war gespalten.', question: 'Wessen Poster hing über deinem Bett?' },
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
      { id: '00-3', category: 'music', term: 'iPod Classic', knowledge: '1000 Songs in deiner Tasche – das Ende des Discman-Zeitalters.', question: 'Weißt du noch, wie stolz du auf dein erstes Click-Wheel warst?' },
      { id: '00-4', category: 'toy', term: 'Beyblade', knowledge: 'Moderne Kreisel, die in Arenen gegeneinander kämpften.', question: 'Hattest du einen speziellen Kampf-Namen für deinen Beyblade?' },
      { id: '00-5', category: 'tech', term: 'USB-Sticks', knowledge: 'Endlich keine Disketten mehr, die beim ersten Kratzer kaputtgingen.', question: 'Was war die gigantische Kapazität deines ersten Sticks? 128 MB?' },
      { id: '00-6', category: 'lifestyle', term: 'Low-Rise Jeans', knowledge: 'Die Hosen konnten nicht tief genug sitzen – danke Britney Spears.', question: 'Hast du den Trend mitgemacht oder fandest du ihn damals schon schrecklich?' },
      { id: '00-7', category: 'music', term: 'Jamba-Sparabo', knowledge: 'Der Crazy Frog verfolgte uns als Klingelton im Fernsehen.', question: 'Bist du auch in die Klingelton-Falle getappt?' },
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
      { id: '10-4', category: 'music', term: 'Spotify-Playlists', knowledge: 'Millionen Songs auf Abruf. Die selbst zusammengestellte Playlist ersetzte das Mixtape.', question: 'Gab es eine Playlist, die für dich zu einem bestimmten Sommer oder Menschen gehört?' },
      { id: '10-5', category: 'toy', term: 'Minecraft', knowledge: 'Eine Welt aus Klötzchen, in der man alles bauen konnte. Kinder und Eltern verstanden die Faszination oft sehr unterschiedlich.', question: 'Hast du selbst gebaut – oder jemandem beim stundenlangen Bauen zugesehen?' },
      { id: '10-6', category: 'toy', term: 'Fidget Spinner', knowledge: 'Der Hype, der aus dem Nichts kam und genauso schnell wieder ging.', question: 'Hattest du auch einen – und wie lange hat die Begeisterung bei dir gehalten?' },
      { id: '10-7', category: 'lifestyle', term: 'Serien-Bingen', knowledge: 'Ganze Staffeln am Stück. "Weiterschauen in 5 Sekunden" traf eine schwache Stelle in uns allen.', question: 'Welche Serie hat dir mal eine ganze Nacht gestohlen?' },
      { id: '10-8', category: 'food', term: 'Avocado-Toast', knowledge: 'Das Frühstück, über das eine ganze Generationsdebatte geführt wurde.', question: 'Warst du beim Café-Frühstück-Trend dabei – oder hast du nur den Kopf geschüttelt?' }
    ]
  }
};
