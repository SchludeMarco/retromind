# Changelog

Hier steht jede Änderung an RetroMind (Zeitreise und Gaming-Edition), die
neueste oben. Neue Einträge kommen unter „Unreleased“, bis eine Version
vergeben wird. Jede Änderung, die in die App gelangt, bekommt hier einen
Eintrag in Alltagssprache: was sich für Nutzer:innen ändert, nicht wie.

## Unreleased

- **Laufbänder zum Zurückholen und Weiterblättern** (2026-10-18, PR #237):
  Die Fun Facts in der Gaming-Edition laufen jetzt wie das Laufband der
  Zeitreise ganz unten, direkt über den Knöpfen der Navigation. Beide
  Laufbänder sind langsamer und lassen sich mit dem Finger hin und her
  schieben, mit Schwung auch ein Stück weiter. Neu sind die Pfeile ‹ und ›
  daneben: zurück zur Meldung, die gerade weg ist, oder weiter zur nächsten.
  Die Laufbänder gehen nie aus: Es kommen ständig neue Meldungen nach, in der
  Zeitreise jetzt auch ein Satz zu jedem Jahr mit dem Nummer-1-Hit, in der
  Spielhalle Fun Facts und Erscheinungsjahre zu allen Katalogspielen (ein Tipp
  öffnet das Spiel). Ist alles einmal durchgelaufen, holt die KI frische
  Meldungen dazu. Die zuletzt gezeigten Meldungen merkt sich das Gerät, so
  kannst du auch nach dem Neuladen zurückblättern.
- **Lieblingsbands aus deinem ganzen Leben** (2026-10-18, PR #236): Beim
  Kofferpacken vor der Abfahrt und in den Einstellungen unter „Deine Angaben“
  gibt es jetzt „Ideen gefällig?“. Ein Tipp darauf zeigt für jeden
  Fünf-Jahres-Abschnitt seit deinem Geburtsjahr bis heute die Bands und
  Musiker:innen, die damals groß waren, mit deinem Alter dazu. Ein Tipp auf
  einen Namen setzt ihn auf deine Liste, ein zweiter nimmt ihn wieder weg;
  eigene Namen tippst du wie bisher ein. Alles bleibt freiwillig, die Ideen
  sind zu, bis du sie öffnest. Deine Lieblingsbands fließen jetzt auch in die
  persönlichen Fragen beim Erkunden ein und stehen im Erinnerungsbuch.
- **Hall of Fame zum Blättern, Laufband zum Ziehen** (2026-10-18, PR #235):
  In der Gaming-Edition kannst du in der Hall of Fame (sie startet nach einer
  Minute ohne Eingabe) jetzt mit ◀ und ▶ oder per Wischen zum vorherigen oder
  zum nächsten zufälligen Spiel wechseln. Ein Tipp aufs Spiel öffnet seine
  Seite, ein Tipp daneben bringt dich wie bisher zurück in die Halle. Das
  Laufband mit den Sprüchen auf der Startseite der Zeitreise lässt sich mit
  dem Finger hin und her ziehen und läuft danach von allein weiter.
- **Google-Anmeldung bleibt auf jedem Gerät** (2026-10-17, PR #234): Bisher
  wollte Google nach einer Stunde wieder einen Tipp auf „Anmelden“. Jetzt
  bleibst du auf jedem Gerät angemeldet, bis du dich abmeldest, in der
  Zeitreise wie in der Gaming-Edition. Beim nächsten Anmelden fragt Google
  einmal nach deiner Zustimmung, danach nicht mehr. Abmelden gilt nur für das
  Gerät, auf dem du es tust.
- **Spotify-Anmeldung gilt in beiden Apps** (2026-10-17, PR #233): Bist du
  in der Zeitreise oder in der Gaming-Edition mit Spotify angemeldet, bist du
  es jetzt auch in der anderen App, und meldest du dich ab, gilt auch das für
  beide. Mit Google-Anmeldung gilt die Spotify-Anmeldung außerdem auf all
  deinen Geräten. Die Google-Anmeldung nimmt jeder Wechsel zwischen den Apps
  mit; nach einer Stunde will Google allerdings wieder einen Tipp auf
  „Anmelden“, der dann beim nächsten Wechsel auch für die andere App gilt.
- **Zeitreise und Gaming sind jetzt eine App** (2026-10-17, PR #232): Alles,
  was RetroMind sich merkt, ist in beiden Apps gleich: Sprache, Lautstärke,
  Reise, Profil, Savegame, Coins, Highscore-Kürzel und Einstellungen. Wechselst
  du über einen Link von der Zeitreise in die Spielhalle oder zurück, nimmt der
  Link deinen Stand mit, auch ohne Anmeldung. Mit Google-Anmeldung bleiben
  außerdem alle deine Geräte synchron: Jede Änderung landet nach ein, zwei
  Sekunden in deinem Google Drive, und jede App holt sich beim Öffnen und beim
  Zurückkehren den neuesten Stand. Liegt in der Cloud schon ein anderer Stand
  als auf dem Gerät, fragt RetroMind einmal, welcher gelten soll (empfohlen:
  der aus der Cloud). Anmeldungen und Datenschutz-Entscheidungen bleiben auf
  dem jeweiligen Gerät; die Datenschutzerklärung beschreibt das.
- **Dein eigenes Kürzel wie am Flipper** (2026-10-17, PR #231): In den
  Einstellungen beider Apps gibst du jetzt dein eigenes Kürzel aus drei
  Zeichen ein, wie früher auf den Highscore-Tafeln am Flipper, zum Beispiel
  LIQ oder MAR. Jedes Zeichen stellst du mit ▲ und ▼ ein oder tippst es
  einfach. In der Gaming-Edition steht es schon fertig an jeder
  Highscore-Tafel, die jetzt dieselbe Automaten-Eingabe hat. Das Kürzel
  bleibt auf deinem Gerät; mit Google-Anmeldung liegt es auch in deinem
  Google-Konto und gilt so auf allen Geräten und in beiden Apps. Steht im
  Konto ein anderes Kürzel als auf dem Gerät, fragt RetroMind, ob das aus
  dem Konto übernommen werden soll; sagst du nein, bleibt dein Kürzel und
  die Frage kommt für dieses Kürzel nicht wieder.
- **Zwei neue Spiele für die Retro-Konsole** (2026-10-17, PR #230): In der
  Chill-Ecke der Gaming-Edition stehen jetzt vier freie Spiele. Neu sind
  „µCity“ für den Game Boy Color, in dem du wie in SimCity deine eigene
  Stadt baust, und „Thwaite“ für das NES, in dem du Dörfer gegen anfliegende
  Raketen verteidigst wie bei Missile Command. Beide sind freie Software,
  deren Macher das Weitergeben ausdrücklich erlauben.
- **Die Retro-Konsole: alte Spiele direkt im Browser spielen** (2026-10-17,
  PR #229): In der Chill-Ecke der Gaming-Edition steht jetzt ein Emulator,
  der echte alte Konsolen nachbaut. Zwei freie Spiele, deren Macher das
  Weitergeben erlauben, starten mit einem Tipp: „Tobu Tobu Girl“ für den
  Game Boy und das Memory „Concentration Room“ für das NES. Unter „Dein
  eigenes Modul“ kannst du außerdem eine Spieldatei von deinem Gerät laden,
  für NES, SNES, Game Boy, Game Boy Advance, Mega Drive, Master System,
  Game Gear, Atari 2600 und PC Engine; auf den Spieleseiten dieser Systeme
  heißt der Knopf „Mit eigener Datei spielen“. RetroMind stellt keine
  kommerziellen Spiele bereit, und deine Datei bleibt auf deinem Gerät.
  Gespielt wird mit Tastatur, Gamepad oder auf dem Handy mit Touch-Knöpfen,
  Spielstände bleiben in deinem Browser. Der Lösch-Knopf unter „Meine
  Daten“ entfernt auch sie, und die Datenschutzerklärung erklärt das.
- **Spiele in der Gaming-Edition nach Jahr sortiert** (2026-10-16, PR #228):
  In der Halle stehen die Spiele jetzt nach Erscheinungsjahr geordnet, das
  älteste zuerst. Das gilt für den Katalog mit allen Filtern, für die
  Spiele aus dem Wikipedia-Archiv und für deine Sammlung („Mein Stash“ und
  „Hatte ich damals“). Spiele ohne bekanntes Jahr stehen am Ende. Lädst du mit
  „Gib mir mehr“ weitere Archivspiele nach, sortieren sie sich an der
  passenden Stelle ein. Die Suche zeigt weiterhin die besten Treffer zuerst.
- **Die Spielhalle nebenan ist nicht mehr zu übersehen** (2026-10-16,
  PR #227): In der Stube steht jetzt in der Ecke ein leuchtender
  Spielautomat unter einem Neonschild „GAMING“, mit Invader auf dem
  Bildschirm und blinkenden Münzschlitzen. Ein Tipp darauf, und du stehst in
  RetroMind – Gaming. Direkt unter „Zeitreise starten“ zeigt außerdem eine
  neue Karte „Die Spielhalle nebenan“ mit Foto vom Eingang, was dich in der
  Gaming-Edition erwartet; der Wegweiser „To the gaming zone“ steht jetzt
  dort statt ganz unten auf der Seite. Nebenbei reagieren die Dinge in der
  Stube am Computer zuverlässiger auf Mausklicks.
- **Rote Blinklichter am Gaming-Wegweiser** (2026-10-16, PR #225): Oben auf
  dem Pfosten des Wegweisers „To the gaming zone“ sitzen jetzt zwei rote
  Warnlampen wie am Bahnübergang, die abwechselnd blinken. So übersieht
  niemand mehr, dass es nebenan die Gaming-Edition gibt. Wer in den
  Systemeinstellungen weniger Bewegung gewählt hat, sieht sie ruhig leuchten.
- **Echte Spiele-Cover sind zurück** (2026-10-16, PR #224): In der
  Gaming-Edition zeigen die Spielkarten, die Spieleseite und der
  Modulschacht wieder das echte Cover jedes Spiels. Das geht, weil RetroMind
  jetzt nur noch für Verwandte und enge Bekannte offen ist. Gibt es kein
  Cover oder lädt es noch, siehst du wie bisher das eigene Pixelbild.
- **Einmal anmelden, überall drin** (2026-10-16, PR #223): Die
  Google-Anmeldung an der Gästetür gilt jetzt auch als Google-Anmeldung in
  der Zeitreise und der Gaming-Edition, du musst dich drinnen nicht noch
  einmal anmelden. Wechselst du über den Wegweiser oder „Zurück zu
  RetroMind“ zwischen den beiden Editionen, nimmst du Gästezugang und
  Google-Anmeldung mit und landest nicht noch einmal an der Tür.
- **Spotify Premium auf dem Handy: ganze Songs auch in der Gaming-Halle**
  (2026-10-16, PR #222): Wer mit Spotify Premium angemeldet ist, hört in
  der Gaming-Halle auf dem Handy jetzt ganze Songs statt 30-Sekunden-
  Ausschnitten, wie schon in der Zeitreise. Die Musik läuft in deiner
  eigenen Spotify-App, RetroMind sagt ihr nur, welcher Song kommt. Findet
  RetroMind die App nicht, öffne sie kurz und tippe im Musik-Player auf
  „Nochmal versuchen“. Vor der Tür bleibt es beim gedämpften Ausschnitt des
  Songs, drinnen läuft er dann ganz.
- **RetroMind nur noch für eingeladene Gäste** (2026-10-15, PR #221):
  Zeitreise und Gaming-Edition sind jetzt ein privates Angebot. Wer
  RetroMind öffnet, landet zuerst auf einer Gästeseite und meldet sich
  einmal mit Google an. Hereinkommen nur Adressen, die Marco im Adminbereich
  unter „Gäste“ eingeladen hat; danach bleibt man 30 Tage nach dem letzten
  Besuch angemeldet. Datenschutzerklärung und Impressum bleiben für alle
  erreichbar, die Datenschutzerklärung erklärt das neue Cookie.
- **Mehr Datenschutz: Meine Daten, KI-Hinweise und eigene Figuren**
  (2026-10-15, PR #220): In den Einstellungen beider Apps gibt es jetzt
  „Deine Daten“ bzw. „Meine Daten“: Ein Knopf lädt alles, was RetroMind in
  deinem Browser gespeichert hat, als Datei herunter, ein anderer löscht
  alles davon. Der Nostalgie-Begleiter und der Retro-Guru sagen jetzt
  gleich, dass sie eine KI (Google Gemini) sind, und KI-Videos sind als
  „KI-generiert“ markiert. Die KI-Funktionen gibt es nach Googles Regeln
  erst ab 18; in der Zeitreise bleiben sie aus, wenn das Geburtsdatum unter
  18 ergibt. Der kurze Hit-Ausschnitt bei der Ankunft in einem Jahr spielt
  nur noch, wenn du Musik erlaubt hast. In der Gaming-Halle heißen zwei
  Minispiele jetzt Mauerbrecher und Farbecho, statt des Pac-Man läuft ein
  eigener Mampf-Roboter mit einem Käfer durch die Halle, und auf der
  Highscore-Tafel werden beleidigende Kürzel zu „XXX“. Die
  Datenschutzerklärung ist auf dem neuen Stand (YouTube-Videos in der
  Zeitreise, Kinder und Jugendliche, Daten herunterladen und löschen).
- **Wegweiser mit gelbem Leuchtband** (2026-10-14, PR #219): Um den
  Wegweiser „To the gaming zone“ ist jetzt ein gelbes Leuchtband gewickelt,
  das mal vor und mal hinter dem Brett verläuft. Kleine Lichter laufen
  ständig daran entlang, und das Band glimmt leicht. Der rote Rahmen ist
  nicht mehr knallig, sondern matt und staubig. Wer Bewegung ausgeschaltet
  hat, sieht das Band ruhig leuchten.
- **Rot umrandeter Wegweiser** (2026-10-14, PR #218): Der Wegweiser „To the
  gaming zone“ auf der Startseite der Zeitreise hat jetzt einen kräftigen
  roten Rahmen entlang der zerfetzten Kante, dahinter glüht er sanft rot und
  pulsiert langsam. So fällt er auf jedem Hintergrund sofort ins Auge. Wer
  Bewegung ausgeschaltet hat, sieht das Leuchten ruhig, ohne Pulsieren.
- **Kartenspiele in der Chill-Ecke: Video-Poker, Blackjack und Solitär**
  (2026-10-14, PR #217): In der Gaming-Halle liegen jetzt drei
  Kartenspiele. Beim Video-Poker („Jacks or Better“ wie an den
  Poker-Automaten von früher) setzt du 1 bis 5 Credits, bekommst fünf
  Karten, tippst die an, die du halten willst, und ziehst einmal nach; ab
  einem Paar Buben zahlt die Gewinntabelle, und mit vollem Einsatz bringt
  der Royal Flush 4000. Beim Blackjack spielst du gegen die Bank: Karte,
  halten oder verdoppeln, die Bank bleibt ab 17 stehen, ein Blackjack zahlt
  3 zu 2. Eine Runde dauert 20 Hände (Poker) bzw. 10 Hände (Blackjack) mit
  100 Spiel-Credits, gespielt wird nur um Spielgeld; was am Ende übrig ist,
  kommt auf die Highscore-Tafel. Beim Solitär (wie auf jedem alten
  Windows-PC) legst du jede Farbe vom Ass bis zum König ab: Karte antippen,
  dann das Ziel antippen, oder zweimal tippen, dann geht sie von selbst an
  den besten Platz. „Zurück“ geht immer, und sobald alles aufgedeckt ist,
  fliegen die Karten auf Knopfdruck von allein nach Hause; gezählt wird die
  Bestzeit. Die Karten sind ein eigenes Pixel-Deck mit Rückseite in der
  Farbe deines Designs, klicken beim Austeilen leise und funktionieren mit
  Touch, Maus und Tastatur.

- **Die Zeitreise reagiert auf jede Berührung** (2026-10-14, PR #216):
  Jeder Knopf, jede Karte und jeder Link antwortet jetzt sofort: ein leises
  Holz-„Tock“ wie von einer alten Schreibmaschinentaste, ein kurzes Summen
  auf dem Handy, ein Lichtring, der sich vom Finger aus ausbreitet, und ein
  kleines Nachfedern. Beim Wechsel zu einem anderen Halt blättert hörbar
  eine Seite um, der neue Halt gleitet von der Seite herein, in die die
  Reise geht, und ein Lichtstreif zieht über den Bildschirm. Karten und
  Abschnitte schweben beim Scrollen nacheinander an ihren Platz. Fenster
  öffnen sich mit einem kleinen „Plopp“, und wenn du eine Erinnerung
  speicherst, klingt ein Spieluhr-Glöckchen und Sterne und Herzen sprühen
  dort, wo du getippt hast. Auch wenn du gerade nichts tust, lebt die
  Seite: Staub tanzt im Licht (in Nachtschicht Glühwürmchen), der
  Sekundenzeiger der Reiseuhr tickt weiter, und nach einer Weile ohne
  Tippen atmet der Knopf zum nächsten Halt sanft, damit du weißt, wie es
  weitergeht. Die Klänge sind kurz und leise, kommen ohne Verzögerung (sie
  werden nicht mehr jedes Mal aus dem Netz geladen) und schweigen bei
  ausgeschaltetem Ton. Wer weniger Bewegung eingestellt hat, bekommt nur
  die Klänge und ein ruhiges Aufleuchten.

- **Keine Musik mehr über dem Jahresvideo** (2026-10-14, PR #215): Beim
  Start lief die Spotify-Musik über dem Video aus deinem Jahr weiter, so
  dass man das Video kaum verstand. Jetzt startet das Video erst, wenn die
  Ankunfts-Show vorbei ist, und die Musik bleibt still, solange es läuft.
  Blendest du das Video aus, spielt die Musik weiter.

- **Musik hängt nicht mehr bei „Lädt …“** (2026-10-14, PR #214): Wurde der
  Spotify-Player neu aufgebaut (etwa weil dein Spotify-Login nach dem Start
  dazukam oder die Spotify-App auf dem Handy nicht gefunden wurde), blieb
  die Musik in der Zeitreise und in der Gaming-Halle bei „Playlist wird
  geladen“ stehen. Jetzt startet der neue Player wie gewohnt.

- **Mehr Weihnachtslichter und Weihnachtsklänge** (2026-10-14, PR #213): In
  der Weihnachtszeit blinken jetzt viele kleine bunte Lichter hinter den
  Seiten, und die Lichterkette oben hat fast doppelt so viele Lämpchen, die
  jedes in seinem eigenen Takt blinken. Ab und zu, etwa alle ein bis zwei
  Minuten, klingt leise ein kurzes Glöckchen-Jingle mit Schlittenglocken
  und den ersten Tönen von „Jingle Bells“; jedes dritte Mal sagt der
  Weihnachtsmann dazu „Ho ho ho“. Das erste Jingle kommt erst eine Weile
  nach dem ersten Tippen und schwillt sanft an. Bei ausgeschaltetem Ton
  bleibt alles still. In den Einstellungen lassen sich die Glöckchen mit
  „Weihnachtsglöckchen und Ho ho ho“ einzeln abstellen, und
  „Weihnachtslook: Aus“ schaltet alles Weihnachtliche ab: Lichter, Schnee,
  Klänge, Weihnachtslieder, Adventskalender und Weihnachtsbäckerei.

- **Adventskalender mit 24 Türchen** (2026-10-14, PR #212): In der
  Adventszeit gibt es beim Erkunden eine Kachel „Adventskalender“, ab dem
  1. Dezember. Jeden Tag geht ein Türchen mehr auf, bis zum großen
  Türchen 24. Hinter jedem wartet etwas Besonderes: ein Weihnachtslied, das
  mit einem Tipp im Radio läuft (von „Last Christmas“ bis „White
  Christmas“), ein Rezept aus Omas Weihnachtsbäckerei, eine kleine
  Geschichte von Weihnachten damals oder eine Frage fürs Erinnerungsbuch.
  Wer zu früh klopft, erfährt, in wie vielen Tagen das Türchen aufgeht.
  Geöffnete Türchen bleiben offen; vom 1. bis 6. Januar sind alle offen.
  Mit „Weihnachtslook: an“ in den Einstellungen kann man schon vorher
  hinter alle Türchen schauen.

- **Weihnachtszeit: Omas Weihnachtsbäckerei und Weihnachtslook**
  (2026-10-14, PR #211): Vom 1. November bis zum 6. Januar öffnet in Omas
  Kochbuch die Weihnachtsbäckerei als erstes Lesezeichen: Vanillekipferl,
  Zimtsterne, Spritzgebäck, Kokosmakronen, Bratäpfel und Kinderpunsch.
  Vorher zeigt das Lesezeichen, wie viele Tage es noch dauert. In dieser
  Zeit trägt auch die ganze Zeitreise Weihnachtslook: eine leuchtende
  Lichterkette am oberen Rand, leise fallender Schnee hinter den Seiten
  und Weihnachtsrot als Akzentfarbe, in allen drei Designs. Im Radio
  laufen dann automatisch Weihnachtslieder (Spotifys „Christmas Hits“ statt
  der Musik des Jahrzehnts); der Player zeigt „Weihnachtslieder“. In den
  Einstellungen lässt sich der Weihnachtslook unter „Weihnachtslook“ schon
  vorher einschalten oder ganz ausschalten.

- **Omas Kochbuch: Leckereien von damals zum Nachkochen** (2026-10-14,
  PR #211): Beim Erkunden gibt es eine neue Sparte „Omas Kochbuch“. Sie
  öffnet ein Rezeptbuch mit Lesezeichen für die Jahrzehnte von den 60ern
  bis zu den 2010ern, deine eigene Zeit zuerst. Zu jedem Jahrzehnt gibt es
  zwei Leckereien, vom Toast Hawaii und Kalten Hund über Käseigel und
  Spaghetti-Eis bis zu Zupfkuchen, Muffins und Cake Pops. Jedes Rezept hat
  Omas kleine Geschichte dazu, Zutaten zum Abhaken beim Kochen, die
  Schritte, Omas Tipp und „Erinnern: Wer hat das für dich gemacht?“ fürs
  Erinnerungsbuch.

- **Dein Jahr, deine Erinnerungen, dein Hit und deine Stube** (2026-10-14,
  PR #210): Unter der riesigen Jahreszahl der Ankunfts-Show steht jetzt,
  wofür dein Jahr steht, zum Beispiel „1989 … das Jahr des Mauerfalls“
  (für jedes Jahr von 1945 bis 2024 von Hand ausgesucht); derselbe Satz
  steht auch unter „Willkommen im Jahr …“ über jedem Halt. Beim Einrasten
  klingen ein paar Sekunden des Nummer-1-Hits deines Jahres als Fanfare
  (die Nr. 1 der US-Jahrescharts, mit Titel und Interpret eingeblendet);
  die Spotify-Musik pausiert so lange. Mit den Dingen des Jahrzehnts
  fliegen jetzt auch deine eigenen Erinnerungen aus der Mitte: deine Fotos
  und die Begriffe, die du schon gesammelt hast. Und nach der Landung ist
  die Stube im Stil deines Jahrzehnts eingerichtet: passende Tapete,
  Couch, Kissen und Vorhänge, dazu ein Radio der Zeit auf der Fensterbank
  (Röhrenradio, Kofferradio, Ghettoblaster, CD-Radio, iPod-Dock,
  Bluetooth-Box, smarter Lautsprecher); die Einrichtung zieht mit einer
  kleinen Animation ein, auch in den Stuben-Ecken der Stationen.

- **Ankunft mit Wow: Zeitanzeige, Blitz und dein Jahr** (2026-10-14,
  PR #209): Kommst du durch die Zeitmaschine in der App an, läuft jetzt
  eine kurze Show. Eine Zeitanzeige wie im Kino zeigt grün die Gegenwart
  und rot das Ziel; die roten Ziffern rasen ratternd von heute zurück bis
  zu deinem Geburtstag. Dann rastet sie ein: ein greller Blitz, zwei
  Druckwellen, ein tiefer Schlag mit hellem Akkord, und dein Geburtsjahr
  erscheint riesig und leuchtend mit „Welcome back“ und dem Titel des
  Jahrzehnts, während Dinge dieser Zeit (Discokugel, Kassette, Joystick …)
  aus der Mitte fliegen. In diesem Moment sagt die Roboterstimme „Welcome
  back“. Nach ein paar Sekunden blendet die Show aus; ein Tipp überspringt
  sie. Ohne Animationen (Systemeinstellung „Bewegung reduzieren“) gibt es
  nur die Stimme.

- **Zum Start nur „Welcome back“** (2026-10-14, PR #208): Kommst du durch
  die Zeitmaschine in die App, sagt die Roboterstimme nur noch „Welcome
  back“ (auf Deutsch „Willkommen zurück“). Die alte dunkle Stimme, die nach
  dem Aufwachen der App „Welcome“ sagte, ist weg. „Welcome to the year …“
  sagt die Stimme nur noch, wenn du in den Einstellungen das Jahrzehnt
  wechselst; über jedem Halt steht der Satz weiterhin groß.

- **„Welcome to the year …“: Roboterstimme und Video aus deinem Jahr**
  (2026-10-14, PR #207): Nach jeder Reise mit der Zeitmaschine sagt eine
  Roboterstimme nach einem kurzen Piepen „Welcome to the year 1975“ (auf
  Deutsch „Willkommen im Jahr 1975“). Das Jahr ist dein Geburtsjahr oder
  das Jahrzehnt, das du in den Einstellungen gewählt hast. Über jedem Halt
  steht groß „Welcome to the year …“, damit du weißt, wo du gerade bist.
  Darunter startet nach jeder Reise von selbst ein Jahresrückblick-Video aus
  diesem Jahr von YouTube; es lässt sich ausblenden. YouTube lädt erst, wenn
  du es erlaubst (auch in den Einstellungen unter „Videos“). Solange das
  Video läuft, pausiert die Spotify-Musik. Bei ausgeschaltetem Ton bleibt
  die Stimme still.

- **Musiksteuerung oben links, Feedback ganz unten** (2026-10-14, PR #206):
  Oben links stehen in der Zeitreise jetzt Zurück, Play/Pause und Weiter
  als richtige Knöpfe, daneben gut lesbar der Song, der gerade läuft. Ein
  Tipp auf den Titel öffnet die ganze Musiksteuerung. Die winzige
  „Läuft gerade“-Zeile oben links ist dafür weg. Der rote Feedback-Knopf
  steht jetzt ganz unten links unter den Konten mit „Abmelden“: in „Retro
  Warm“ im Konten-Fenster hinter dem Personen-Knopf, in den anderen
  Designs, sobald du ganz nach unten scrollst. In „Retro Warm“ liegt das
  Konten-Fenster jetzt über der unteren Leiste statt halb dahinter.

- **Spotify Premium auf dem Handy: ganze Songs über deine Spotify-App**
  (2026-10-14, PR #205): Bist du in der Zeitreise mit Spotify Premium
  angemeldet, spielt die Musik auf dem Handy jetzt ganze Songs statt
  30-Sekunden-Ausschnitten. Sie läuft dabei in deiner eigenen Spotify-App
  auf dem Handy; RetroMind sagt ihr nur, welcher Song kommt, und Pause,
  Weiter und Zurück steuern sie. Der Musik-Player zeigt, auf welchem Gerät
  sie läuft. Findet RetroMind die Spotify-App nicht, öffnest du sie kurz und
  tippst im Musik-Player auf „Nochmal versuchen“; bis dahin laufen wie
  bisher Ausschnitte. Wer schon angemeldet war, meldet sich dafür einmal neu
  bei Spotify an (RetroMind braucht eine Erlaubnis mehr). Verlässt du
  RetroMind, hält die Musik in der Spotify-App an.

- **Pause hält die Musik an, Hits aus deinen Jahren** (2026-10-14,
  PR #205): Der Pause-Knopf im Musik-Player hält die Musik jetzt wirklich
  an. Vorher konnte Spotify einen pausierten Song als „zu Ende“ melden, und
  sofort startete ein neuer. Mit Spotify-Login kommen die Songs außerdem
  aus deinen eigenen Jahren: Für jedes Jahr des Jahrzehnts, in dem du 6
  bis 19 warst, sucht RetroMind eine „Hits“-Playlist dieses Jahres und
  mischt die Songs. Der Player zeigt dann zum Beispiel „Hits von
  1983–1989“. Ohne Login läuft wie bisher die Playlist des Jahrzehnts.

- **Roter Faden: eine Zeitreise vom Willkommen bis zum Buch**
  (2026-10-14, PR #205): Die Zeitreise fühlt sich jetzt wie eine Reise an,
  nicht wie lauter einzelne Seiten. Ein Druck auf „Go back...“ lässt dich von
  der Zeitmaschine einsaugen: Schrift und Uhr drehen sich in einer Spirale
  ins Zifferblatt, Lichtringe rasen zur Mitte, alles wird Licht, und das
  Licht öffnet sich wie eine Blende. Dazu rasen die Ticks immer schneller,
  ein Brummen und ein Luftsog schwellen an, und bei der Ankunft schlägt der
  Gong. Name und Geburtstag trägst du danach im selben dunklen Uhrenzimmer
  auf eine Fahrkarte in die Vergangenheit ein, statt in ein helles Formular;
  „Uhr zurückdrehen“ lässt die Zeiger rückwärts rasen und öffnet das Zimmer
  auf die Stube. Über jedem Halt steht in allen Designs dieselbe Reiseleiste
  mit einer kleinen Uhr, deren Zeiger zeigt, wo du bist („Halt 4 von 7“,
  beim Erkunden mit „Erkunden › Musik“), alle Halte zum Antippen und dem
  Weg zurück; beim Lesen bleibt oben eine schmale Leiste mit Pfeilen. Jeder
  Halt endet mit „Nächster Halt: …“, und jeder Halt heißt überall gleich
  (aus „Zeitreise“ und „Eindrücke“ wurde „Deine Zeit“, das Profil heißt
  „Pack deinen Koffer“). Ein gemeinsames Design-System für Abstände, Kanten,
  Schatten, Knöpfe und Überschriften gilt für alle drei Designs. Im Design
  Klassisch ist der Röhren-Schleier etwas schärfer, damit Text besser lesbar
  ist. Die alte Stationswahl, die Fortschrittslinie, die Retro-Warm-Leiste,
  das helle Formular und der weiße Gong-Übergang liegen in
  `_removed_content/`.

- **Entwicklung: Gaming-CHANGELOG aktualisiert sich von selbst**
  (2026-10-14, PR #204): Nach jeder Änderung an der CHANGELOG.md erzeugt
  GitHub die Gaming-CHANGELOG automatisch neu und speichert sie. Dieser
  Schritt löst keinen eigenen Vercel-Build aus. Außerdem hat jetzt jede
  bisherige Änderung ein Datum, auch die ersten Versionen 1.0.0 bis 2.0.1
  vom 2. September 2026 und die beiden Änderungen ohne eigenen Eintrag
  (Aufräumen am 2. September, CLAUDE.md in PR #15).

- **Dokumentation: README und CHANGELOG für beide Apps vervollständigt**
  (2026-10-14, PR #203): Die Gaming-Edition hat jetzt eine eigene
  [README](gaming/README.md) mit allen Funktionen und Ideen und eine eigene
  [CHANGELOG](gaming/CHANGELOG.md), die `npm run changelog:gaming` aus dieser
  Datei erzeugt. Hier fehlten bisher die ersten Änderungen vom September
  (PR #1 bis #52) und PR #182; sie sind nachgetragen, und die Einträge von
  PR #53 bis #73 haben Datum und PR-Nummer bekommen. Die Haupt-README
  beschreibt jetzt die Zeitreise und alles Gemeinsame.

- **Neu laden bleibt auf der Seite** (2026-10-13, PR #202): Wenn du die
  Seite neu lädst, landest du wieder dort, wo du gerade warst, statt auf dem
  Willkommensbildschirm. In der Zeitreise bleibt die offene Etappe, in der
  Gaming-Halle bleiben Halle, Reiter, Filter, Suche und ein offenes Spiel.
  Ein neuer Tab oder ein späterer Besuch beginnt weiter am Start.

- **Konten in den Einstellungen, Zahnrad schon im Startmenü** (2026-10-13,
  PR #201): Die freiwillige Anmeldung mit Google und Spotify findest du
  jetzt in den Einstellungen unter „Konten (freiwillig)“, dort kannst du dich
  auch wieder abmelden. Die beiden Anmelde-Kästen auf der Startseite sind
  dafür weg. Das Zahnrad für die Einstellungen sitzt jetzt schon auf dem
  Willkommensbildschirm mit der tickenden Uhr oben rechts, in allen Designs.

- **Google-Anmeldung auf der Startseite, Einstellungen immer oben rechts**
  (2026-10-13, PR #200): „Mit Google anmelden“ steht jetzt auf der
  Startseite direkt unter dem Startknopf, in allen drei Designs. Bisher kam
  man in „Klassisch“ und „Nachtschicht“ erst ganz unten auf der Seite daran,
  in „Retro Warm“ nur über das Konto-Symbol. Das Zahnrad für die
  Einstellungen sitzt in „Klassisch“ und „Nachtschicht“ jetzt fest oben
  rechts und bleibt beim Scrollen sichtbar, statt erst ganz unten
  aufzutauchen. In allen Designs erreicht man die Einstellungen schon auf dem
  Namensformular, etwa um die Sprache umzustellen.

- **Kein Sprung nach oben beim Liedwechsel** (2026-10-13, PR #199): Wenn
  die Musik zum nächsten Lied wechselt, springen offene Fenster nicht mehr
  an den Anfang zurück. In der Zeitreise passierte das in den
  Einstellungen und in allen anderen Fenstern (Was ist neu, Feedback,
  Grabbelkiste, Infos zu Laufband-Sprüchen), in Gaming in der
  Konsolen-Auswahl.

- **Helden deiner Jugend** (2026-10-13, PR #198): Beim Erkunden gibt es eine
  neue Sparte „Helden deiner Jugend“. Dort hängen die Helden deines
  Jahrzehnts wie Poster an der Kinderzimmerwand, von Michael Knight und
  MacGyver bis Boris Becker und Nena, und jedes andere Jahrzehnt ist einen
  Tipp entfernt. Über ein Suchfeld findest du jeden anderen Helden: Ein Name
  reicht, aber auch eine kurze Beschreibung wie „der Typ mit dem sprechenden
  Auto“. Die Suche läuft beim Tippen von selbst, und die KI findet heraus,
  wen du meinst. Jeder Held bekommt eine eigene Seite mit Steckbrief
  (Wikidata), der ganzen Geschichte aus Wikipedia in Kapiteln (deutscher oder
  englischer Artikel) und, wo es eins unter freier Lizenz gibt, einem Foto
  von Wikimedia Commons mit Urheber und Lizenz. Mit „Meine Erinnerung dazu“
  wandert der Held samt persönlicher Frage ins Erinnerungsbuch.

- **Die Stube in jeder Station** (2026-10-13, PR #197): Die Stube hört nicht
  mehr an der Startseite auf. Über jeder Station der Reise steht jetzt eine
  eigene Ecke davon, in allen Designs: beim Profil ein Sessel an der
  Garderobe, bei den Eindrücken der alte Fernseher, beim Erkunden der
  Plattenspieler auf der Anrichte, beim Tagebuch der Schreibtisch mit
  grüner Lampe, beim Erinnerungsbuch das Bücherregal und zum Abschluss ein
  Kuchen mit Kerze unter einer Wimpelkette. Die Katze ist überall mit dabei
  und schläft in einer Ecke. In jeder Ecke lässt sich etwas antippen, mit
  kleinem Geräusch: Der Fernseher schaltet um, der Plattenspieler legt die
  Nadel auf, die Lampe geht an und aus, ein Buch rutscht aus dem Regal, die
  Kerze wird ausgepustet, der Hut wackelt, und die Katze schnurrt.

- **Die Stube zum Anfassen, in jedem Design** (2026-10-13, PR #196): Die
  gezeichnete Stube steht jetzt oben auf der Startseite in allen Designs,
  auch in Klassisch und Nachtschicht (bisher gab es sie nur in Retro Warm).
  Und man kann alles darin antippen: Der alte Röhrenfernseher mit Testbild
  rechts in der Ecke startet die Zeitreise (oder setzt sie fort), die
  Stehlampe klickt an und aus, der Holzofen lässt sich anzünden und
  ausgehen lassen, die Katze wacht beim Streicheln auf, schnurrt und lässt
  Herzchen steigen, und das Fenster öffnet das echte Wetter. Hast du schon
  eine Reise begonnen, führt das Bild an der Wand zu deinen Jahrzehnten und
  der Bücherstapel zu deinem Erinnerungsbuch. Jede Berührung macht ein
  kleines Geräusch, und auf dem Handy summt es kurz in der Hand. Solange der
  Ofen brennt, hört man ihn leise knistern und knacken (nur mit Ton an).
  Die Topfpflanze ist aufs Fensterbrett umgezogen.

- **Mehr zu jedem Spruch im Laufband** (2026-10-13, PR #196): Ein Tipp auf
  einen Spruch im Laufband öffnet eine Karte mit mehr dazu, zum Beispiel
  woher „Ich hab fertig!“ kommt oder warum 1973 alle auf der Autobahn
  spazieren gingen. Von dort lässt er sich auch gleich in die Grabbelkiste
  legen, und in der Grabbelkiste steht die Erklärung mit dabei.

- **Echtes Wetter im Stubenfenster** (2026-10-13, PR #195): Unter der
  gezeichneten Stube kannst du jetzt „Dein echtes Wetter im Fenster zeigen“
  einschalten. Dann regnet es im Fenster, wenn es bei dir regnet, es schneit
  (mit Schnee auf dem Fensterbrett und weißen Hügeln), bei Gewitter blitzt es,
  bei Nebel wird es trüb und Wolken ziehen vorbei. Dafür nimmst du deinen
  ungefähren Standort oder gibst deinen Ort ein. Der Ort wird auf etwa 10 km
  gerundet, bleibt auf deinem Gerät, und das Wetter holt unser Server beim
  freien Wetterdienst Open-Meteo. Ohne Einschalten bleibt das Fenster wie
  bisher, und „Ausschalten“ löscht den Ort wieder. Die Datenschutzerklärung
  ist ergänzt.

- **Laufband mit Sprüchen von damals und Grabbelkiste** (2026-10-13, PR #195):
  Auf der Startseite läuft jetzt unten ein Laufband wie früher im Fernsehen,
  mit Sprüchen („Null Bock!“, „Alles paletti!“) und Alltagsdingen von damals
  („Die Kassette mit dem Bleistift zurückspulen“). Dein eigenes Jahrzehnt kommt
  öfter vor. Hinter jedem Spruch sitzt eine Diskette: Ein Tipp darauf legt ihn
  in deine Grabbelkiste, ein zweiter nimmt ihn wieder heraus. Die Kiste vorn
  im Laufband zählt mit und zeigt beim Antippen alles, was du gesammelt hast.
  Das Laufband läuft langsam, bleibt stehen, solange dein Finger oder die Maus
  darauf liegt, und hat einen eigenen Pause-Knopf. Im Design Retro Warm steht
  es fest über der unteren Leiste, in Klassisch und Nachtschicht am Ende der
  Startseite. Wer Bewegung abgeschaltet hat, wischt stattdessen selbst durch.

- **Holzofen in der Stube** (2026-10-13, PR #195): In der gezeichneten Stube
  steht jetzt ein gusseiserner Holzofen mit Glastür, Teekessel und
  Brennholz. Abends und nachts brennt darin ein flackerndes Feuer, das die
  Stube in warmes Licht taucht; tagsüber glüht nur die Glut. Die Stehlampe
  ist dafür ein Stück zur Couch gerückt.

- **Gemütliche Stube** (2026-10-13, PR #194): Im Design Retro Warm fühlt sich
  die Zeitreise jetzt an wie ein Abend auf der warmen Couch. Ganz oben auf der
  Startseite sitzt eine gezeichnete Stube: Karamell-Sofa mit Häkeldecke,
  Stehlampe mit Fransen, die sanft leuchtet, eine Tasse Tee, die dampft, und
  eine Katze, die auf dem Teppich schläft und ab und zu mit dem Schwanz zuckt.
  Draußen vor dem Fenster ist die echte Tageszeit: morgens die Sonne, abends
  der Sonnenuntergang, nachts Mond und Sterne, und abends wird es in der Stube
  dämmrig und die Lampe wärmer. Dazu begrüßt dich RetroMind passend zur Uhrzeit
  mit deinem Namen („Guten Abend, Marco – die Lampe brennt und die Couch ist
  warm“). Der Hintergrund ist eine zarte Tapete mit warmem Lampenlicht aus der
  Ecke, die Karten sind aus griffigem Papier, und oben und unten schließt eine
  Holzleiste ab. Auch die Texte sind wärmer geworden, etwa „Komm rein, mach es
  dir gemütlich“ beim Namensformular. Wer Bewegung abgeschaltet hat, sieht die
  Stube still. Die Schrift bleibt groß und gut lesbar.

- **Hallenmusik hört nie mehr auf** (2026-10-13, PR #193): In der
  Gaming-Halle konnte die Musik plötzlich verstummen, etwa wenn Spotify hing,
  ein Werbeblocker Spotify ausbremste, der Browser den nächsten Song nicht
  starten ließ oder das Handy den Ton beim Sperren des Bildschirms schlafen
  legte. Jetzt passt ein Wächter auf: Bleibt Spotify ein paar Sekunden still,
  kommt erst ein anderer Song, und klappt auch das nicht, spielt sofort die
  eigene Hallenmusik weiter. Alle zwei Minuten (oder wenn du im Musik-Player
  auf Weiter tippst) versucht es die Halle wieder mit Spotify. Hängt das
  Metal-Intro, geht es spätestens nach einer Minute weiter, und nach dem
  Entsperren wacht der Ton von selbst wieder auf. Deine eigene Pause, der
  Stummschalter und „Musik aus“ gelten weiterhin.

- **Zurück zur Zeitreise** (2026-10-13, PR #192): Wer über den Wegweiser
  oder die Einstellungen der Zeitreise in die Gaming-Edition kommt, sieht dort
  jetzt oben links einen gut sichtbaren Knopf „Zurück zu RetroMind“, vor der
  Tür und in der Halle. Er bleibt den ganzen Besuch über da, auch nach dem
  Neuladen, und nimmt Ton- und Google-Einstellung mit zurück.

- **Gaming-Edition: Fakten & Geheimnisse zu jedem Spiel** (2026-10-13,
  PR #191): Jede Spieleseite hat einen neuen Reiter „Fakten & Geheimnisse“. Dort stehen ein
  Steckbrief (wer das Spiel entwickelt, gestaltet und vertont hat, wann es
  auf welcher Plattform erschien, Reihe, Vorgänger und Nachfolger,
  Auszeichnungen, Verkaufszahlen, Alterseinstufungen), die Testwertungen von
  damals, der ganze Wikipedia-Artikel in Kapiteln, mit den Geschichten hinter
  dem Spiel (Entwicklung, Musik, Kontroversen, Versionen) ganz oben. Dazu
  kommen direkte Links in die passenden Spieledatenbanken, etwa zu The
  Cutting Room Floor, wo Fans herausgeschnittene Level und versteckte
  Botschaften sammeln. Alles stammt aus frei lizenzierten Quellen (Wikidata
  und Wikipedia) und steht mit Quelle und Lizenz da. Der Reiter „Screenshots“ zeigt jetzt nur noch frei lizenzierte
  Bilder von Wikimedia Commons, keine geschützten Screenshots und Cover mehr.

- **Ramponierter Wegweiser** (2026-10-13, PR #190): Der Wegweiser zur
  Gaming-Zone sieht jetzt aus, als hätte er schon einige Schlachten hinter
  sich: ausgefranste Ränder, Schwerthiebe im Holz, eine verkohlte
  Pfeilspitze mit glimmender Glut und Brandflecken. Die dunkle Umrandung
  der Metallbuchstaben ist an vielen Stellen abgeplatzt.

- **Musik-Schalter, sanfterer Einstieg, „Deine Zeit“ und Buch-Fortschritt**
  (2026-10-13, PR #189): Die Frage nach der Musik von Spotify steht jetzt
  als Schalter direkt auf dem Willkommensbildschirm. Wer ihn nicht anfasst,
  wird erst nach dem Namensformular gefragt statt mittendrin. Über dem
  Namensformular schwebt die Kaminuhr klein ein, so wirkt der Wechsel vom
  dunklen Uhrenraum weniger abrupt. Vor dem Start der Reise zeigt die
  Startseite dein eigenes Jahrzehnt mit Stichworten von damals und drei
  Postkarten zum Öffnen. Und ein Balken zeigt, wie voll dein
  Erinnerungsbuch ist: Jede beantwortete Frage ist eine Seite, das Tagebuch
  eine weitere, zehn Seiten sind das erste Ziel.

- **Wegweiser im God-of-War-Stil** (2026-10-13, PR #188): Auf dem
  Holzwegweiser zur Gaming-Zone steht „To the gaming zone“ jetzt in
  kantigen, griechisch anmutenden Großbuchstaben aus gebürstetem Metall,
  angelehnt an das Logo von God of War. Die Schrift ist frei lizenziert
  (Cinzel) und kommt direkt von RetroMind, nicht von einem fremden Server.

- **Feinschliff nach dem Grok-Test** (2026-10-13, PR #187): Auf schmalen
  Handys passt die Kopfleiste wieder ganz auf den Bildschirm, die Knöpfe
  sind etwas kleiner und der Feedback-Knopf zeigt dort nur das Wort. Die
  Jahrzehnte auf der Startseite stehen als sechs gleich große Knöpfe in
  zwei ordentlichen Reihen, „deine Zeit“ klein darunter. Statt eines
  rätselhaften roten Punkts steht am Zahnrad jetzt „Neu“, wenn es unter
  „Was ist neu“ etwas zu lesen gibt. Orange Knöpfe mit weißer Schrift sind
  etwas dunkler und dadurch besser lesbar. Und wer auf dem
  Willkommensbildschirm tippt, um die Uhr zu hören, sieht einen hüpfenden
  Lautsprecher und „die Uhr läuft“, auch wenn das Handy stumm ist.

- **Gaming-Edition: Eigene Pixelbilder für jedes Spiel** (2026-10-11, PR #186):
  Statt des kleinen Pixel-Monsters zeigt jede Spielkarte jetzt ein ganzes
  Pixelbild. Die 44 Spiele im Katalog haben je eine selbst gezeichnete Szene
  ihrer Spielwelt, etwa ein Luftschiff zwischen schwebenden Inseln oder eine
  Landstraße im Sonnenuntergang. Echte Cover, bekannte Figuren und Logos sind
  bewusst nicht dabei, die gehören den Spielefirmen. Alle anderen Spiele aus
  dem Archiv und der Suche bekommen automatisch ein passendes Bild:
  Rennspiele eine Straße, Weltraumspiele Sterne und Planeten, Drachenspiele
  eine Burg und so weiter, bei jedem Spiel etwas anders. In der Halle zeigt
  die Karte nur das Bild, weil der Titel schon auf dem Etikett steht.

- **Videos passen zum richtigen Spiel** (2026-10-11, PR #185): Im Reiter
  „Videos“ (und bei Musik & TV-Werbung) der Gaming-Edition liefen bei Spielen
  mit Nachfolgern oft Videos zum falschen Teil, bei Fallout (1997) zum
  Beispiel Fallout 4. Die Suche nimmt jetzt das Erscheinungsjahr mit, und
  Videos zu Nachfolgern wie „Fallout 4“ oder „Fallout 76“ werden aussortiert.
  Videos, die den Spielnamen im Titel tragen, stehen vorne.

- **Eigene Pixel-Kacheln statt Spiele-Cover** (2026-10-09, PR #184): Die
  Spielkarten in der Gaming-Edition zeigen keine Cover-Fotos von Wikipedia
  mehr, denn die Bilder gehören den Spielefirmen. Stattdessen malt die App
  für jedes Spiel eine eigene Pixel-Kachel: ein kleines Pixel-Monster in der
  Farbe der Konsole, darunter Titel und Jahr. Jedes Spiel bekommt immer
  dieselbe Figur. Die Kacheln stehen auf den Karten, auf der Spieleseite, auf
  dem Modul beim Einlegen und im Attract Mode. Das Quiz „Erkennst du das
  Spiel?“ zeigt jetzt eine kurze Beschreibung mit Plattform und Jahr (der
  Name ist geschwärzt) statt eines Cover-Ausschnitts.

- **Datenschutzerklärung auf dem neuesten Stand** (2026-10-09, PR #184): Sie
  erklärt jetzt auch die gemeinsame Highscore-Tafel (nur Spiel, drei
  Buchstaben und Punkte werden gespeichert) und dass mit Spotify Premium dein
  Browser Spotifys Abspielprogramm lädt.

- **Postanschrift im Impressum** (2026-10-09, PR #183): Im Impressum von
  Zeitreise und Gaming-Edition steht jetzt eine Postanschrift (c/o Block
  Services in Fellbach), wie es das Gesetz verlangt. Marcos Privatadresse
  bleibt dabei privat.

- **Entwicklung: automatische Prüfung bei jedem Pull Request**
  (2026-10-09, PR #182): Vor jedem Zusammenführen prüft GitHub, ob die App
  fehlerfrei baut.

- **Neues Eingangsbild ohne fremde Logos** (2026-10-09, PR #180, #181): Vor
  der Spielhalle hängt Marcos neues Bild. Statt Nintendo-, SEGA- und
  Atari-Logos und bekannter Spielfiguren wie Pac-Man oder Mario zeigen Tür
  und Säulen jetzt eigene Pixel-Symbole wie Raumschiff, Planet, UFO,
  Joystick und Herzen. Die leuchtenden ARCADE-Buchstaben und der blinkende
  Türrahmen bleiben wie gewohnt.

- **Der Retro-Guru antwortet wieder** (2026-10-08, PR #179): In der
  Gaming-Edition kam vom Guru und den anderen KI-Funktionen nur „Lag!
  Connection lost“, weil Google das bisher genutzte KI-Modell für neue
  Schlüssel abgeschaltet hat. Die App nimmt jetzt immer Googles aktuelles
  Modell und weicht von selbst auf ein anderes aus, wenn eines wegfällt.

- **Leiser reinkommen und Lautstärke-Regler** (2026-10-08, PR #178): Die
  Musik beim Betreten der Spielhalle war viel zu laut. Sie startet jetzt bei
  halber Lautstärke, und der Türknall ist etwas leiser. Im Musik-Player gibt
  es einen Regler für lauter und leiser, in der Gaming-Edition zusätzlich in
  den Einstellungen unter „Musik-Lautstärke“. Er gilt für das Metal-Intro,
  die Chiptune-Stücke und Spotify mit Premium am Computer. Spotifys
  eingebetteten Player (ohne Anmeldung und auf dem Handy) kann keine
  Webseite leiser stellen; dafür nimmst du die Lautstärketasten, und der
  Player sagt dir das auch.

- **Modul einlegen, diesmal richtig** (2026-10-08, PR #177): Das Einlegen
  eines Spiels sah bisher schief aus: das Modul fiel an der Konsole vorbei und
  tauchte darunter wieder auf. Jetzt schwebt das Modul mit Cover heran, richtet
  sich über dem Schacht aus und wird hineingedrückt: Es schabt beim
  Reinschieben, landet mit einem satten, dumpfen Rums und rastet mit einem
  hellen Klick ein. Die Konsole ruckelt kurz, die rote Lampe geht an, der
  Schalter springt um, und der Fernseher schaltet sich mit einem weißen Strich
  ein, aus dem die Spieleseite aufgeht. Antippen überspringt es.

- **Modul einlegen, Highscore-Tafel, neue Automaten-Spiele und die Urzeit**
  (2026-10-08, PR #176): Tippst du eine Spielkarte an, rutscht das Modul in
  einen Konsolenschacht und die Spieleseite „bootet“; dort blätterst du per
  Wischen zum nächsten Spiel. Erfolge kommen wie auf der Konsole als runde
  Pokal-Leiste mit „Plopp“. Die Münze lässt sich von Hand in den Schlitz
  ziehen, hinter dem Katalog blinken die Automaten, und nach einer Minute ohne
  Eingabe läuft der Attract Mode mit Covern und blinkendem INSERT COIN. Neu
  in der Chill-Ecke: Breakout, Snake, eine Weltraum-Invasion und das Quiz
  „Erkennst du das Spiel?“ mit Coins als Belohnung. Nach einer guten Runde
  trägst du dich mit drei Buchstaben in die gemeinsame Highscore-Tafel ein.
  Jeden Tag zeigt die Halle „Heute vor X Jahren“ ein Spiel, das an diesem
  Datum erschienen ist. Neben dem Stash gibt es das Regal „Hatte ich damals“
  für Spiele und Konsolen deiner Kindheit, und die 70er mit Pong, Space
  Invaders und Co. sind als Urzeit dazugekommen.

- **Cover auf den Karten, aufgeräumte Halle, Soundtrack und alte Testwertungen**
  (2026-10-08, PR #175): Jede Spielkarte in der Gaming-Halle zeigt jetzt das
  Cover des Spiels, am Handy liegen zwei Karten nebeneinander. Oben stehen nur
  noch die Suche und „Insert Coin“, darunter eine wischbare Zeile mit den
  Jahrzehnten und der Konsolenwahl, sodass die Spiele sofort zu sehen sind.
  Katalog, Kisten, Stash, Trophäen, Chill-Ecke und Quests liegen in jedem
  Design in der Leiste unten; Musik, Soundeffekte und Farben stellst du in den
  Einstellungen ein. Statt 1UP und HI-SCORE gibt es einen Punktestand, „NUR
  HIER“ an den Coins ist gut lesbar. Beschreibungen stehen in einer gut
  lesbaren Schrift und brechen nicht mehr mitten im Wort ab. Am Handy rüttelt
  es kurz beim Münzeinwurf, an der Tür und bei Erfolgen. Auf der Spieleseite
  gibt es neu den Reiter „Musik & TV-Werbung“ mit Soundtrack und den alten
  Fernsehspots und den Reiter „Zeitschriften & heute“: Wertungen aus Power
  Play, ASM, Amiga Joker und Co., wo du das Spiel heute legal zocken kannst
  und Level-Passwörter, mit Quellen. Dazu Links zu Handbüchern und Kultboy.

- **Pac-Man läuft unter den Knöpfen durch** (2026-10-08, PR #174): Der kleine
  Pac-Man mit Geist, der durch die Gaming-Halle wandert, läuft jetzt hinter
  allen Knöpfen, Karten und Fenstern entlang statt darüber. Dafür ist er auf
  dem freien Hintergrund etwas besser zu sehen.

- **Blinkender Leuchtrahmen um die Tür** (2026-10-08, PR #173): Die
  ENTRANCE-Tür vor der Gaming-Halle hat jetzt einen dicken, warm-gelben
  Neonrahmen, der wie bei einer Spielhallen-Leuchtreklame blinkt und kurz
  flackert. So sieht man sofort, wo es reingeht.

- **Rein geht es jetzt durch die Tür** (2026-10-08, PR #172): Vor der
  Gaming-Halle gibt es keinen ENTER-Knopf mehr. Du tippst einfach auf die
  ENTRANCE-Tür im Bild, sie leuchtet dafür sanft an den Rändern. Das Schild
  „Warning, extreme loud!“ steht jetzt mittig unter dem Bild, der Lautsprecher
  rechts daneben.

- **Neuer Eingang zur Gaming-Halle mit leuchtendem ARCADE-Schild**
  (2026-10-08, PR #171): Vor der Tür steht jetzt Marcos neues Bild, eine
  verranzte Spielhalle mit Sticker-Tür „ENTRANCE“ im Regen. Das Neonschild
  „ARCADE“ geht Buchstabe für Buchstabe an, jede Sekunde einer mehr; eine
  Sekunde nachdem alle sechs leuchten, geht alles aus und es beginnt von
  vorne. „ENTER“ schwingt die neue Tür auf. Am Computer steht das Bild in
  voller Höhe in der Mitte, die Seiten füllt eine unscharfe Kopie. Die alte
  „Arcade Hallen“ mit der wackelnden Glühbirne ist ins Archiv gewandert.

- **Easter-Egg-Meldung bleibt länger stehen** (2026-10-08, PR #170): Findest
  du in der Gaming-Halle ein Easter Egg oder ein Abzeichen, bleibt die Meldung
  jetzt 12 statt knapp 4 Sekunden stehen, damit man sie in Ruhe lesen kann.
  Mit dem „×“ oben rechts lässt sie sich früher schließen.

- **Club wieder verlassen** (2026-10-08, PR #169): In der Gaming-Halle sitzt
  oben in der Kopfleiste jetzt ein Tür-Knopf neben Ton und Einstellungen. Er
  bringt dich zurück vor die Tür, wo die Musik wieder gedämpft durch die Wand
  kommt; mit „ENTER“ geht es wieder hinein.

- **Vor der Gaming-Halle wieder dumpf und bassig, mit dem Song von drinnen**
  (2026-10-08, PR #169): Wer mit Spotify Premium angemeldet ist, hört vor der
  Tür wieder gedämpfte, bassige Musik wie durch die Wand, jetzt aber genau den
  Song, der drinnen läuft. Draußen ist das ein Ausschnitt des Songs, drinnen
  spielt Spotify ihn dann komplett, auch am Handy. Gibt es für einen Song keinen
  Ausschnitt, kommt draußen wie früher der gedämpfte Metal aus der Halle.

- **Spotify-Musik schon vor der Gaming-Halle, auch am Handy** (2026-10-08,
  PR #168): Wer mit Spotify Premium angemeldet ist, hört die Hallenmusik jetzt
  auch am Handy schon vor der Tür, und beim Eintreten läuft derselbe Song
  einfach weiter, ohne Metal-Intro dazwischen. Bisher ging das nur im Browser
  am PC. Am Handy ist die Musik draußen gleich normal laut, weil sich der
  Spotify-Player dort nicht leiser stellen lässt.

- **Versionsnummer in den Einstellungen** (2026-10-08, PR #167): Ganz unten in
  den Einstellungen beider Apps steht jetzt, welche Version läuft, zum Beispiel
  „Version 2.167 (a1b2c3d)“. Die Zahl hinter dem Punkt steigt mit jeder
  Änderung, der Code in Klammern zeigt genau, welcher Stand geladen ist.

- **RetroMind spricht jetzt Englisch** (2026-10-08, PR #166): Beide Apps, die
  Zeitreise und RetroMind – Gaming, sind komplett ins amerikanische Englisch
  übersetzt, und Englisch ist die neue Standardsprache. Wer lieber Deutsch
  möchte, stellt in den Einstellungen unter „Language“ auf „Deutsch“ um; die
  Wahl bleibt im Browser gespeichert. Auch alles, was die KI schreibt (Fragen,
  Fotoanalyse, Chat, Retro-Guru, Spieleguides), kommt in der gewählten Sprache.
  Die Spielmarken heißen jetzt in beiden Sprachen „Coins“. Datenschutzerklärung und
  Impressum gibt es zusätzlich auf Englisch.

- **Anmelden schon am Eingang der Gaming-Halle** (2026-10-08, PR #165): Unter
  dem ENTER-Knopf gibt es jetzt zwei freiwillige Knöpfe: „Mit Google anmelden“
  (sichert Fortschritt und Coins auf allen Geräten) und „Spotify verbinden“
  (Hallenmusik in voller Länge, mit Premium sanft lauter). Man muss nicht mehr
  erst in die Einstellungen. Wer schon angemeldet ist, sieht dort nur einen
  kurzen Haken mit seinem Namen.

- **Easter Eggs in der Gaming-Halle** (2026-10-08, PR #164): In der Halle sind
  jetzt zehn Geheimnisse versteckt, zum Beispiel alte Cheats in der Suche
  (IDDQD, Rosebud, XYZZY), ein Pac-Man zum Fangen, fünfmal aufs Logo klopfen
  oder den Guru nach dem Sinn des Lebens fragen. Jedes gefundene Ei bringt
  einmal Spielmarken, dieselben wie bei den Quests. Unter „Quests“ steht die
  Liste mit Tipps für alles, was noch fehlt. Am Preis-Tresen gibt es neu das
  „Party-Logo“ in Regenbogenfarben. Der Marken-Stand steht wie bisher oben in
  der Kopfleiste. Wer nicht mit Google angemeldet ist, sieht dort „NUR HIER“
  und unter „Quests“ einen deutlichen Hinweis: Die Marken sind dann nur auf
  diesem Gerät gespeichert. Mit Anmeldung kommen Marken und gefundene Eier mit
  ins Google-Backup.

- **Mehr im Adminbereich** (2026-10-08, PR #163): Der Adminbereich hat jetzt
  drei Reiter. Unter „Nutzung“ stehen zusätzlich die Geräte (Handy, Tablet,
  Computer), wie oft die App installiert geöffnet wird und die beliebtesten
  Jahrzehnte, Spiele und Minispiele, für diesen Monat und insgesamt. Unter
  „Feedback“ steht alles Feedback, offene Punkte lassen sich direkt als To Do
  übernehmen oder als erledigt abhaken. Der „Live-Check“ zeigt, ob beide
  Domains wirklich die neueste Version ausliefern, und verlinkt sonst den
  Redeploy in Vercel. Alles bleibt anonym; die Datenschutzerklärung ist
  ergänzt.

- **Versteckter Zugang zum Adminbereich** (2026-10-08, PR #162): Wer in den
  Einstellungen von Zeitreise oder Gaming fünfmal schnell auf die Überschrift
  „Einstellungen“ tippt, landet im Adminbereich. Sichtbar ist davon nichts,
  und Zahlen sieht dort weiterhin nur Marcos Google-Konto. So geht es auch in
  der installierten App ohne Adresszeile.

- **Kein Admin-Link mehr in den Apps** (2026-10-08, PR #161): Der Link zum
  Adminbereich ist aus den Einstellungen von Zeitreise und Gaming verschwunden.
  Der Bereich ist nur noch direkt über `/admin/` erreichbar.

- **Adminbereich mit Nutzungszahlen** (2026-10-08, PR #160): Unter
  `/admin/` gibt es jetzt einen Bereich nur für Marco. Er zeigt, wie viele
  Leute Zeitreise und Gaming geöffnet haben: Besucher heute, Besuche der
  letzten 7, 30 oder 90 Tage und alle App-Starts, als Balken und Tabelle.
  Hinein kommt nur Marcos Google-Konto, das prüft der Server. Der Link steht in
  den Einstellungen beider Apps und ist nur für ihn sichtbar. Gezählt wird
  anonym, ohne Cookies und ohne gespeicherte IP-Adressen; die
  Datenschutzerklärung erklärt das in einem neuen Abschnitt.

- **Metal-Intro auch mit Spotify, Premium schon vor der Tür** (2026-10-07,
  PR #159): Das neue Metal-Intro läuft jetzt beim Eintreten in die
  Gaming-Halle auch dann, wenn Spotify die Hallenmusik ist; danach übernimmt
  Spotify. Wer in Gaming mit Spotify Premium angemeldet ist (Browser am PC),
  hört dieselbe Spotify-Musik schon vor der Tür leise, und sie wird beim
  Eintreten laut. Ohne Premium läuft vor der Tür weiter das gedämpfte Intro.

- **Besser klingende Metal-Musik in Gaming** (2026-10-07, PR #158): Das
  Metal-Intro beim Eintreten und der gedämpfte Bass vor der Tür klingen
  jetzt nach einer echten Band: zwei verzerrte Gitarren links und rechts,
  ein Bass, ein Solo mit Echo, ein volleres Schlagzeug mit klirrenden
  Becken und Hall wie in einer Halle. Die Musik wird nicht mehr live im
  Handy erzeugt, sondern ist vorab aufgenommen. Dadurch ruckelt nichts, und
  vor der Tür läuft genau dieselbe Musik, nur gedämpft durch die Wand.

- **Vor dem Eingang nur noch der Bass aus der Halle** (2026-10-07, PR #157):
  Straßengeräusche, Sirenen und die Menschenmenge vor der Gaming-Halle sind
  weg, weil mehrere Klänge gleichzeitig Probleme machten. Vor der Tür hörst
  du jetzt nur noch gedämpft durch die Wand Bass und Drums der Metal-Musik von
  drinnen, die langsam lauter werden.

- **Bass aus der Halle schon vor dem Eingang** (2026-10-07, PR #156): Vor der
  Gaming-Halle hörst du jetzt gedämpft durch die Wand, wie drinnen Metal
  läuft: Bassdrum, Snare und die Basslinie genau des Riffs, das beim
  Eintreten laut wird. So weißt du schon draußen, dass es drinnen laut wird.
  Es liegt leise unter der Straße und wird mit ihr langsam lauter.

- **Metal-Intro in der Halle am Handy hörbar** (2026-10-07, PR #155): Beim
  Betreten der Gaming-Halle kam am Handy vom Metal-Intro nur ein leises
  Bassbrummen an. Gitarre und Bassdrum liegen jetzt in Tonhöhen, die
  Handy-Lautsprecher wiedergeben: Die Gitarre ist kräftiger, die Bassdrum
  knackiger und weniger tief, und sie drückt den Rest nicht mehr leiser.
  Das Intro wird weiterhin langsam lauter.

- **Warnschild vergräbt sich bei Ton aus** (2026-10-07, PR #154): Schaltest
  du auf der Startseite der Zeitreise oder am Eingang von Gaming den Ton aus,
  wackelt das Schild „Warning, extreme loud!“ kurz und versinkt dann im
  Boden. Nur der kleine Erdhügel bleibt. Schaltest du den Ton wieder ein,
  kommt es wieder heraus.

- **Wegweiser „To the gaming zone“** (2026-10-07, PR #153): Auf der
  Startseite der Zeitreise steht jetzt in allen Designs ein hölzerner
  Wegweiser mit der Aufschrift „To the gaming zone“. Ein Klick darauf führt
  zu RetroMind – Gaming; Ton- und Google-Einstellung werden mitgenommen. Der
  Wegweiser ersetzt den bisherigen dunklen Knopf „Neu: RetroMind – Gaming“.
  In den Einstellungen bleibt der Link zu Gaming wie bisher.

- **Ton beim Öffnen leise, mit Warnschild** (2026-10-07, PR #152): Wer die
  Zeitreise oder Gaming öffnet, wird nicht mehr sofort laut beschallt. Die
  tickende Uhr und der Gong der Zeitreise sowie Straße, Tür und Metal-Intro
  in Gaming starten leise und werden über etwa 10 Sekunden langsam lauter.
  So bleibt Zeit, den Ton auszuschalten. Solange der Ton an ist, steht rechts
  neben dem Startknopf („Go back...“ bzw. „ENTER“) ein eingeschlagenes
  Holzschild: „Warning, extreme loud!“. Mit Spotify Premium am Computer wird
  auch die Musik langsam lauter. Der normale Spotify-Player lässt sich nicht
  leiser starten, er beginnt aber erst nach dem Startknopf.

- **Gaming startet im dunklen Design** (2026-10-07, PR #151): Die
  Gaming-Edition öffnet jetzt standardmäßig im dunklen Arcade-Design statt im
  hellen Modul-Design. Wer Gaming schon benutzt hat, bekommt das dunkle Design
  einmal automatisch. Wer danach in den Einstellungen unter „Bildschirm“ ein
  anderes Design wählt (zum Beispiel wieder Modul), behält es.

- **Stationen direkt unter dem Logo wählen** (2026-10-07, PR #150): In
  den Designs Klassisch und Nachtschicht steht während der Reise unter dem
  kleinen Logo jetzt „Station x von 7“ mit dem Namen der aktuellen Station.
  Sie bleibt zugeklappt, bis du sie antippst. Dann siehst du alle Stationen
  von Start bis Abschluss und springst mit einem Tipp direkt hin, ohne erst
  zur Startseite zurückzumüssen. Im Design Retro Warm gibt es das schon über
  die Stationsleiste.

- **Feedback-Knopf ist jetzt rot und beschriftet** (2026-10-07, PR #149):
  Bisher war Feedback nur ein kleines Briefsymbol, das viele übersehen haben.
  Jetzt ist es ein roter Knopf mit der Aufschrift „Feedback“, in allen
  Designs der Zeitreise und in der Gaming-Edition (dort unter Ton und
  Zahnrad). In den Designs Klassisch und Nachtschicht sitzt er am Handy oben
  links, damit er das Logo nicht verdeckt. Damit in „Retro Warm“ am Handy
  alles in die Kopfleiste passt, fällt dort der Schriftzug „RETROMIND“ auf
  schmalen Bildschirmen weg (das Logo bleibt) und der Ton-Schalter zeigt nur
  noch sein Symbol.

- **Gaming: Pac-Mampf in der Chill-Ecke** (2026-10-07, PR #148): Ein neues
  Minispiel im Stil von Pac-Man, mit eigenem Labyrinth und eigener Grafik.
  Punkte futtern, den vier Geistern ausweichen, und nach einer Kraftpille
  werden sie blau und lassen sich fressen. Dazu ein Tunnel an der Seite, eine
  Kirsche als Bonus, und mit jedem Level wird es etwas flotter. Gelenkt wird
  am Handy durch Wischen über das Labyrinth oder mit dem Steuerkreuz darunter,
  am Computer mit den Pfeiltasten (oder WASD), die Leertaste pausiert. Ein
  geschafftes Level zählt als geschafftes Minispiel für Quests und Erfolge,
  der Rekord wird gespeichert.

- **„Deine Zeit“ passt jetzt zum Geburtsjahr** (2026-10-07, PR #147): Die
  Einstimmung sagte z. B. „Du warst in den 2010ern ungefähr im
  Grundschulalter“, auch wenn man 2010 geboren ist. Das wirkte wie ein
  Widerspruch und stimmte bei sehr jungen oder sehr alten Geburtsjahren auch
  nicht. Jetzt steht dort dein Geburtsjahr und wann du ungefähr in der
  Grundschule warst, z. B. „Du bist 2010 geboren, in der Grundschule warst du
  also etwa von 2016 bis 2020“. Fällt deine Grundschulzeit in ein Jahrzehnt,
  das RetroMind noch nicht hat, sagt die App das und startet beim
  nächstgelegenen.

- **Spotify-Musik auf Android wieder sofort da** (2026-10-07, PR #146): Mit
  Spotify-Premium-Anmeldung blieb es auf Android-Handys still, weil Spotifys
  Browser-Player dort nicht spielt. Auf Handy und Tablet läuft die Musik jetzt
  wie ohne Anmeldung über den eingebetteten Spotify-Player. Suche und Musik
  zum Thema funktionieren dort weiter, Lautstärkeregler und langsames
  Einblenden gibt es nur am Computer.

- **Musik kommt auch, wenn Spotifys Browser-Player streikt** (2026-10-07,
  PR #145): Mit Spotify-Premium-Anmeldung kam teils gar keine Musik. Jetzt
  versucht RetroMind den Start mehrmals, und wenn trotzdem kein Song läuft,
  spielt die Musik wie vor der Anmeldung über den eingebetteten
  Spotify-Player weiter. Suche und Musik zum Thema bleiben dabei nutzbar.

- **Spotify-Player: Suche, Musik zum Thema und mehr** (2026-10-07, PR #144):
  Bist du bei Spotify angemeldet, kann der Musik-Player in der Zeitreise und
  in der Gaming-Halle viel mehr. Du suchst nach Songs, Alben und
  Künstler:innen und spielst sie mit einem Tipp ab. Ein Balken zeigt, wo im
  Song du bist, und du kannst darin springen. Mit Premium gibt es auch einen
  Lautstärkeregler, das Albumcover und Vor/Zurück innerhalb von Alben.
  „Musik zum Thema“ (an, abschaltbar) spielt passende Musik von selbst:
  Öffnest du in der Zeitreise einen Musik-Begriff wie „ABBA-Fieber“ oder
  „NDW“, läuft der passende Hit. Öffnest du in Gaming ein Spiel, läuft sein
  Soundtrack, wenn Spotify einen hat. Beim Schließen geht es mit der normalen
  Musik weiter, und „Zurück zu …“ bringt sie jederzeit zurück. Ohne
  Anmeldung zeigt der Player einen Knopf zum Anmelden.

- **Gaming: Pac-Man wandert frei durch die Halle** (2026-10-07, PR #143):
  Statt nur unten durchs Bild zu laufen, sucht sich der kleine Pac-Man jetzt
  immer wieder einen zufälligen Punkt irgendwo auf dem Bildschirm und läuft
  langsam dorthin, gerade oder schräg. Auf dem Weg frisst er eine Reihe
  Punkte, der Geist folgt seiner Spur. Er ist noch durchsichtiger als vorher,
  lässt sich nicht antippen und ist aus, wenn am Gerät „Bewegung reduzieren“
  eingestellt ist.

- **Gaming: Pac-Man jetzt sichtbar** (2026-10-07, PR #142): Der kleine
  Pac-Man aus PR #141 lief hinter den Karten der Halle und war auf dem Handy
  deshalb gar nicht zu sehen. Jetzt läuft er halb durchsichtig über dem
  Katalog, aber unter der unteren Leiste, den Knöpfen und Fenstern. Antippen
  geht weiter durch ihn hindurch.

- **Spotify Premium: Musik wird langsam lauter** (2026-10-07, PR #140): Wer
  sich mit Spotify Premium anmeldet, hört die Musik in der Zeitreise und in
  der Gaming-Halle über Spotifys eigenen Browser-Player. Sie beginnt leise und
  wird beim Start und beim Fortsetzen über etwa 6 Sekunden lauter, und es
  laufen ganze Songs statt kurzer Vorschauen. In der Gaming-Edition gibt es
  dafür in den Einstellungen unter „Hallenmusik“ den Knopf „Mit Spotify
  anmelden“. Ohne Premium und auf iPhone/iPad bleibt alles wie bisher.

- **Gaming: kleiner Pac-Man im Hintergrund** (2026-10-07, PR #141): In der
  Halle von RetroMind - Gaming läuft jetzt ein kleiner, blasser Pac-Man
  langsam unten durchs Bild, frisst eine Reihe Punkte und hat einen Geist auf
  den Fersen. Er bleibt hinter Katalog und Knöpfen, lässt sich nicht antippen
  und ist aus, wenn am Gerät „Bewegung reduzieren“ eingestellt ist.

- **Gaming: Hallenmusik wird langsam lauter** (2026-10-07, PR #139): Die
  selbst erzeugte Musik in RetroMind - Gaming (Metal-Intro nach dem Eintreten
  und die Chiptune-Stücke) beginnt jetzt leise und wird über etwa 6 Sekunden
  lauter, auch beim Wiedereinschalten. Die Spotify-Musik startet weiter in
  normaler Lautstärke, weil Spotifys eingebetteter Player keine
  Lautstärkeregelung anbietet.

- **Gaming: Filter nach einzelnem Jahr** (2026-10-06, PR #138): Im Katalog
  von RetroMind - Gaming erscheint nach einem Tipp auf ein Jahrzehnt (80er bis
  2020er) eine zweite Reihe mit seinen Jahren, z. B. 1990 bis 1999. Ein Tipp
  auf ein Jahr zeigt nur die Spiele aus diesem Jahr, aus dem kuratierten
  Katalog und dem Wikipedia-Archiv. „Ganzes Jahrzehnt“ hebt die Auswahl
  wieder auf, und der Konsolen-Filter lässt sich weiter dazunehmen.

- **Profil aus Google und Drive vollständiger übernommen** (2026-10-06,
  PR #137): Nach der Google-Anmeldung füllt die Zeitreise leere Angaben wie
  Geburtsdatum, Geschlecht, Interessen und Lieblingsmusik aus deiner
  Drive-Sicherung auf, auch wenn auf dem Gerät schon eine Reise läuft. Das
  Geschlecht kommt, falls freigegeben, auch direkt aus dem Google-Konto. Und
  ein neues Gerät überschreibt die Drive-Sicherung nicht mehr, bevor es sie
  gelesen hat.

- **Reise in Etappen** (2026-10-06, PR #136): Hast du eine Reise begonnen,
  zeigt die Startseite jetzt „Deine Etappen“. Profil, Eindrücke, Erkunden,
  Tagebuch, Erinnerungsbuch und Abschluss stehen als Kacheln da, und du tippst
  einfach die Station an, auf die du gerade Lust hast. Die Kachel, bei der du
  zuletzt warst, ist markiert. Im Design Retro Warm kannst du außerdem oben in
  „Station x von 7“ direkt auf jede Station tippen.

- **Erinnerungsreise in Sparten** (2026-10-06, PR #135): „Erkunden“ zeigt
  jetzt zuerst nur Kacheln: Musik, Technik, Spielzeug, Alltag & Mode,
  Naschen & Essen und das Foto-Labor. Du tippst die Sparte an, auf die du
  gerade Lust hast. Darin stehen ihre Dinge Jahrzehnt für Jahrzehnt, deine
  Zeit zuerst, und „← Alle Sparten“ bringt dich zurück. Jede Kachel zeigt, wie
  viel du daraus schon erinnert hast.

- **Mehr Luft auf der Erinnerungsreise** (2026-10-06, PR #134): Die Station
  „Erkunden“ ist ruhiger. Es steht immer nur ein Jahrzehnt da, zuerst deins,
  und über Knöpfe wechselst du zu den anderen. In „Retro Warm“ sind die Karten
  schlichter (Name, kurzer Text, „+ Erinnern“), die ganze Karte ist antippbar,
  und der doppelte Fortschrittskasten ist weg. Das Memory-Labor wartet hinter
  „📷 Ein altes Foto mitbringen“, statt die halbe Seite zu füllen. In
  „Klassisch“ und „Nachtschicht“ ist das große Logo oben unterwegs nur noch
  ein kleines Zeichen; groß bleibt es auf der Startseite.

- **Zurück zum Willkommensbildschirm** (2026-10-06, PR #133): In den
  Einstellungen gibt es jetzt den Knopf „Zurück zum Willkommensbildschirm“.
  Er zeigt wieder die tickende Uhr mit „Go back...“. Die Musik pausiert so
  lange und spielt nach dem Gong mit demselben Song weiter.

- **Song oben links öffnet die Musiksteuerung** (2026-10-06, PR #132): Wer
  oben links auf den laufenden Song tippt, bekommt dieselbe Musiksteuerung
  wie über das Musik-Symbol unten. Das gilt in der Zeitreise und in der
  Gaming-Halle.

- **Songtitel passen in den Player, „Läuft gerade“ oben links** (2026-10-06,
  PR #131): Lange Songtitel in der Musiksteuerung werden jetzt kleiner
  geschrieben, damit sie in eine Zeile passen. Reicht das nicht, laufen sie
  als Laufschrift durch, statt abgeschnitten zu werden. Außerdem steht
  oben links in kleiner Schrift, welcher Song gerade läuft, bei langen
  Titeln ebenfalls als Laufschrift. Das gilt in der Zeitreise und in der
  Gaming-Halle.

- **Uhr tickt zuverlässig, lauter und schneller** (2026-10-06, PR #130): Auf
  dem Handy blieb das Ticken oft stumm, weil das Antippen des Bildschirms den
  Ton nicht freigeschaltet hat. Jetzt startet die Uhr beim ersten Antippen
  und tickt sofort hörbar. Auf dem iPhone spielt sie auch mit eingeschaltetem
  Stumm-Schalter. Außerdem tickt sie jetzt zweimal pro Sekunde und deutlich
  lauter.

- **Blitz statt Note in der Gaming-Halle** (2026-10-06, PR #129): Die
  Musiksteuerung der Gaming-Edition ist dieselbe wie in der Zeitreise, ihr
  Metall-Symbol zeigt aber einen Blitz statt einer Musiknote, auch im
  geöffneten Feld.

- **Musik-Symbol leuchtet gelb, solange Musik läuft** (2026-10-06, PR #128):
  Das schwarz-blaue Musik-Symbol glüht sanft gelb, sobald Musik spielt, in der
  Zeitreise wie in der Gaming-Halle. Ist die Musik pausiert oder der Ton aus,
  ist es wieder schwarz-blau.

- **Musik-Symbol erscheint erst ganz unten, Tonband-Knopf zurück**
  (2026-10-06, PR #127): In Klassisch und Nachtschicht taucht das
  Musik-Symbol jetzt wie das Einstellungen-Symbol ⚙️ erst auf, wenn man ganz
  nach unten scrollt. Der Ton-Knopf „Tonband“ oben in „Retro Warm“ ist wieder
  da.

- **Spotify-Player oben ist weg, Musik-Symbol neben ⚙️** (2026-10-06, PR #126):
  Der große Spotify-Kasten („Listen to the full track … Get Spotify“), der oben
  im Bild auftauchte, ist wieder unsichtbar. Er war nie zum Anschauen gedacht
  und rutschte durch einen Fehler nach vorn, in der Zeitreise wie in der
  Gaming-Halle. In den Designs Klassisch und Nachtschicht sitzt das
  schwarz-blaue Musik-Symbol jetzt ganz unten direkt links neben dem
  Einstellungen-Knopf ⚙️.

- **Musiksteuerung hinter einem Metall-Symbol** (2026-10-06, PR #125): Die
  offene Spotify-Leiste von heute Morgen ist wieder weg. Stattdessen sitzt
  ganz unten in der Mitte nur noch ein kleines schwarz-blaues Metall-Symbol
  mit Note, in der Zeitreise (alle Designs) und in der Gaming-Halle. Ein Druck
  darauf öffnet die Musiksteuerung über die halbe Seite: Was gerade läuft,
  Zurück, Play/Pause und Weiter als Symbole, dazu Ton an/aus. Der
  Guru-Knopf heißt auf dem Handy wieder „☻ GURU“.

- **Spotify-Player unten in der Mitte** (2026-10-06, PR #124): In der
  Zeitreise (alle Designs) und in der Gaming-Halle sitzt jetzt ganz unten in
  der Mitte ein kleiner Spotify-Player mit Zurück, Play/Pause und Weiter. Er
  zeigt, welcher Song gerade läuft. Weiter spielt einen neuen Zufallssong,
  Zurück den Song davor. In „Retro Warm“ steckt er mitten in der unteren
  Leiste, in den anderen Designs schwebt er über dem Haus-Knopf, in der
  Gaming-Halle steht er zwischen „Nach oben“ und dem Guru. Auf schmalen
  Handys zeigt der Guru-Knopf dafür nur noch sein Gesicht ☻.

- **Name und Geburtstag nur noch einmal eingeben** (2026-10-05, PR #123):
  Auch ohne Google-Login fragt die Zeitreise nicht mehr bei jedem Öffnen
  nach Name und Geburtsdatum. Sind beide einmal auf dem Gerät gespeichert,
  geht es direkt los. Ändern lassen sie sich in den Einstellungen unter
  „Deine Angaben“.

- **Mit Google angemeldet: keine Abfrage von Name und Geburtstag mehr**
  (2026-10-05, PR #122): Wer in der Zeitreise mit Google angemeldet ist,
  landet direkt in der App, sobald Name und Geburtsdatum bekannt sind, aus
  dem Google-Konto, der Drive-Sicherung oder von einem früheren Besuch. Statt
  des Formulars gibt es ein kurzes „Willkommen“. Der Geburtstag kommt jetzt
  auch nach einer wiederhergestellten Anmeldung aus dem Google-Konto. Ändern
  lassen sich beide Angaben in den Einstellungen unter „Deine Angaben“.

- **Kein festes „Back to Back“ mehr zum Auftakt** (2026-10-05, PR #121):
  Nach dem Gong startet in der Zeitreise jetzt sofort die Musik deiner
  Dekade, schon das erste Lied ist zufällig gewählt. Das Pretty-Maids-Stück
  läuft nicht mehr bei jedem Besuch vorweg.

- **Spotify-Musik in zufälliger Reihenfolge** (2026-10-05, PR #120): Bisher
  fing die Musik immer mit demselben Lied an und lief dann der Reihe nach,
  in der Zeitreise wie in der Gaming-Halle. Jetzt kommt jedes Mal ein
  zufälliges Lied aus der Playlist und danach wieder ein zufälliges, ohne dass
  sich ein Lied gleich wiederholt. In der Zeitreise läuft zum Auftakt weiter
  „Back to Back“ von Pretty Maids, danach geht es zufällig weiter.

- **80er-Heavy-Metal von Spotify in der Gaming-Halle** (2026-10-05, PR #119):
  Sobald du die Spielhalle betrittst, läuft echter Heavy Metal der 80er von
  Spotify (Playlist „The 100 Best Metal Songs of 80s“) statt der
  Chiptune-Musik. Beim ersten Besuch fragt die Halle einmal, ob Spotify laden
  darf, denn die Gaming-Adresse merkt sich das getrennt von der Zeitreise.
  In den Einstellungen gibt es dafür „Hallenmusik“: Spotify-Metal oder wie
  bisher die Chiptune-Stücke. Ohne Spotify-Login spielt Spotify nur kurze
  Vorschauen. Der Lautsprecher-Knopf, YouTube-Videos und das Wechseln in
  eine andere App pausieren die Musik.

- **Musik setzt sofort mit der Startseite ein** (2026-10-05, PR #118): Bisher
  kam „Back to Back“ erst einige Sekunden nach dem Gong, manchmal noch später.
  Jetzt startet die Musik genau in dem Moment, in dem die Startseite durch das
  Weiß hindurchscheint. War Spotifys Player da noch nicht ganz geladen,
  startet er, sobald er bereit ist, statt still zu bleiben.

- **„Back to Back“ von Pretty Maids zum Auftakt** (2026-10-05, PR #117):
  Wenn du nach dem Willkommens-Bildschirm auf der Startseite ankommst und die
  Spotify-Musik erlaubt hast, laufen zuerst gut 45 Sekunden von „Back to
  Back“ (Pretty Maids, 1984). Danach übernimmt die Playlist deiner Dekade.
  Ohne Spotify-Anmeldung spielt Spotify nur eine 30-Sekunden-Vorschau, dann
  geht es dort schon nach 30 Sekunden weiter.

- **Start-Knopf heißt „Go back...“, steht schräg und blitzt** (2026-10-05,
  PR #116): Auf dem Willkommens-Bildschirm steht jetzt „Go back...“ statt
  „Let's go!“. Der Knopf ist leicht schräg gestellt, und alle paar Sekunden
  huscht ein Lichtblitz über ihn. Das gilt in allen drei Designs.

- **Ticken und Gong deutlich lauter** (2026-10-05, PR #115): Das Ticken
  der Kaminuhr auf dem Willkommens-Bildschirm ist jetzt etwa zehnmal so
  laut und klingt mehr nach Holzgehäuse. Der Gong war so tief gestimmt, dass
  Handy- und Laptop-Lautsprecher ihn kaum abspielen konnten. Jetzt klingt er
  heller, mit metallischem Nachhall, und ist auch auf dem Handy gut zu hören.

- **Spotify-Musik erst nach dem Willkommens-Bildschirm** (2026-10-05, PR #114):
  Die Musik der Dekade startet nicht mehr schon beim ersten Tippen auf dem
  Willkommens-Bildschirm, sondern erst, wenn Gong und weiße Überblendung
  vorbei sind und du auf der Startseite bist.

- **Willkommens-Bildschirm: Uhr tickt, Gong zum Start** (2026-10-05, PR #113):
  Auf dem ersten Bildschirm mit der alten Kaminuhr tickt jetzt die ganze Zeit
  leise „tick … tack“. Der „Let's go!“-Knopf sieht aus wie das gewählte
  Design: in Retro Warm ein runder Terrakotta-Knopf, in Klassisch ein
  Papier-Ticket mit Tintenrand, in Nachtschicht ein glühender Bernstein-Rahmen.
  Ein Druck darauf schlägt einen großen Gong, der Bildschirm wird weiß und
  geht dann langsam in die Startseite über. Die Funken-Explosion von vorher
  ist entfallen. Hinweis: Chrome und andere Browser lassen Ton erst nach einer
  Berührung zu. Ist das so, steht unter dem Knopf „Tippe irgendwo auf den
  Bildschirm, um die Uhr ticken zu hören“, und ab der ersten Berührung tickt
  sie. Ist der Ton ausgeschaltet oder die App im Hintergrund, bleibt alles
  still.

- **Gaming: Tür knarzt länger, dazu ein Fiepen** (2026-10-05, PR #112): Nach
  „ENTER“ geht die Tür jetzt langsamer auf und knarzt dabei gut eine Sekunde
  lang, erst stockend, dann immer schneller, bis sie gegen die Wand knallt.
  Während du auf den Eingang zugehst, wird ein hohes elektrisches Fiepen der
  alten Automaten immer lauter, bis das Bild weiß wird.

- **Gaming: ENTER-Knopf im Look der Tür, mit Knarzen** (2026-10-05, PR #111):
  Am Eingang steht jetzt „ENTER“ statt „Eintreten“. Der Knopf sieht aus wie
  die EINGANG-Tür selbst: graues Metall mit Rollladen, Nieten, weißer
  Schrift und etwas Graffiti. Der Ton-Knopf daneben passt dazu. Beim Öffnen
  knarzt die Tür jetzt hörbar in den rostigen Angeln, knallt gegen die Wand
  und knarzt beim Zurückschwingen noch einmal nach.

- **„Nach oben“-Knopf unten links** (2026-10-05, PR #110): Wer weit nach
  unten gescrollt hat, sieht unten links einen runden Pfeil-Knopf. Ein Tipp
  darauf bringt dich sanft zurück an den Anfang der Seite. Ganz oben ist der
  Knopf ausgeblendet. Gibt es in der Zeitreise (alle Designs) und in der
  Gaming-Halle; er sitzt knapp über der unteren Leiste und verdeckt keine
  anderen Knöpfe.

- **Gaming: Spielmarken immer oben im Blick** (2026-10-05, PR #109): In der
  Kopfleiste steht jetzt neben dem Punktestand, wie viele Spielmarken du hast.
  Kommen neue dazu, hüpft die Zahl kurz. Ein Tipp darauf führt direkt zu den
  Quests und zum Preis-Tresen.

- **Gaming: Sudoku, Blockstapler und Flipper in der Chill-Ecke** (2026-10-05,
  PR #108): Drei neue Minispiele. **Sudoku** mit immer neuen Rätseln (Feld
  antippen, Zahl wählen, doppelte Zahlen werden rot, die Bestzeit wird
  gespeichert). Der **Blockstapler** im Stil des Game-Boy-Klassikers startet
  gemütlich langsam: Tippen dreht, Wischen schiebt, nach unten Wischen lässt
  fallen, dazu Knöpfe und eine Pause. Am **Flipper** steuern die linke und
  rechte Tischhälfte (oder die Knöpfe darunter) die Flipper, es gibt drei
  Kugeln und Rekordpunkte.

- **Gaming: Quests und Preis-Tresen** (2026-10-05, PR #107): Unter dem neuen
  Reiter „Quests“ warten jeden Tag drei kleine Aufgaben in der Halle, z. B.
  drei neue Games entdecken, zweimal eine Münze einwerfen oder ein Minispiel
  schaffen, dazu eine größere Quest pro Woche. Jede geschaffte Quest bringt
  Spielmarken. Die tauschst du am Preis-Tresen gegen neue Designs
  (Vaporwave, Virtual Boy) und neue Hallen-Musik (Weltraum, Bosskampf) ein.

- **Gaming: Minispiele erscheinen direkt unter dem Chill-Ecke-Knopf**
  (2026-10-05, PR #106): Nach einem Druck auf „Chill-Ecke · Minispiele“
  klappen die drei Spiele gleich darunter auf, statt weiter unten auf der
  Seite. Auch über „Chillen“ unten in der Leiste springt die Seite direkt
  dorthin.

- **Gaming: Vor der Halle hörst du jetzt die Straße** (2026-10-05, PR #105):
  Statt der ruhigen Musik am Eingang murmelt leise eine Menschenmenge, ab und
  zu ruft jemand. Alle halbe Minute fährt in der Ferne ein Polizeiwagen mit
  Tatütata vorbei, und manchmal hört man um die Ecke eine Rauferei mit
  Gerangel, Geschrei und einer umfallenden Mülltonne. Drinnen startet wie
  bisher das Heavy-Metal-Intro; der Ton-Schalter schaltet alles stumm.

- **Gaming: Chill-Ecke oben als eigener Knopf** (2026-10-05, PR #104): Die
  Minispiele waren schwer zu finden. Jetzt steht direkt unter „Insert Coin“
  ein lila Knopf „Chill-Ecke · Minispiele“, in jedem Design. Ein zweiter Druck
  führt zurück zum Katalog.

- **Gaming: Du stehst jetzt wirklich in der Spielhalle** (2026-10-05,
  PR #103): Hinter dem Katalog siehst du Marcos Bild vom Innenraum, einen Gang
  zwischen alten Spielautomaten mit Neonröhren und buntem 90er-Teppich. Etwas
  abgedunkelt, damit alles gut lesbar bleibt, in allen Designs.

- **Gaming: Eingang ist jetzt die verranzte „Arcade Hallen“** (2026-10-05,
  PR #102): Statt der gezeichneten Holztür siehst du zum Start Marcos Bild
  einer heruntergekommenen Spielhalle an einer verregneten Straße, mit
  Graffiti, Plakaten und flackernder „ARCADE“-Leuchtschrift. Unter dem Vordach
  wackelt und flackert die Glühbirne. „Eintreten“ reißt die EINGANG-Tür auf,
  dahinter strahlt Licht, das Logo kommt heraus, das Bild wird weiß und die
  Halle erscheint. Auf dem Handy bleibt die Tür immer in der Bildmitte.

- **Gaming: Chill-Ecke mit drei Minispielen** (2026-10-05, PR #101): Zum
  Entspannen zwischendurch gibt es in der Gaming-Halle einen neuen Bereich
  „Chill-Ecke“ (unten in der Leiste „Chillen“). Darin: **Pixel-Memory**
  (Pärchen mit Retro-Symbolen finden), ein **Schiebepuzzle** (Plättchen 1 bis
  8 sortieren) und **Senso** (Melodie anhören und die Farben nachtippen).
  Alles ohne Zeitdruck, per Fingertipp auf dem Handy spielbar und mit sanften
  Tönen, die dem Stummschalter folgen. Deine besten Ergebnisse merkt sich das
  Gerät, und für das erste geschaffte Spiel gibt es den Erfolg „Chillmodus“.

- **Gaming: Heavy-Metal-Riff beim Betreten der Halle** (2026-10-05, PR #100):
  Sobald du durch die Tür bist, kracht ein 80er-Metal-Intro los: verzerrte
  Gitarre mit galoppierendem Riff, Schlagzeug und ein Solo obendrauf, rund
  25 Sekunden mit großem Schlussakkord. Danach übernimmt die gewählte
  Hintergrundmusik. Musik aus, Stummschalter und Stille im Hintergrund
  gelten auch hier.

- **Gaming: neuer Eingang mit Graffiti-Tür statt Power-Knopf** (2026-10-05,
  PR #99): Zum Start hängt eine wackelnde, flackernde Glühbirne vor einer
  ziemlich kaputten Holztür voller billiger Graffiti, und es läuft leise,
  ruhige Musik. Weil Browser wie Chrome Ton erst nach einer Berührung
  erlauben, startet die Musik mit dem ersten Tippen irgendwo auf den
  Bildschirm (ein Hinweis sagt das). Ein Druck auf „Eintreten“ reißt die Tür
  quietschend auf, das RetroMind-Logo leuchtet aus dem Eingang, das Bild wird
  weiß und dann erscheint direkt der Katalog. Power-Knopf, Diesel-Startgeräusch
  und das „PRESS START“-Titelbild sind dafür weggefallen. Der Stummschalter
  gilt auch hier, und im Hintergrund bleibt alles still.

- **Feedback nur noch direkt auf der Startseite** (2026-10-05, PR #98): Das
  Briefsymbol für Feedback sitzt jetzt in allen Designs oben rechts auf der
  Startseite, auch schon vor der Anmeldung. Der doppelte Eintrag in den
  Einstellungen ist weg, in der Zeitreise wie in der Gaming-Edition.

- **Feedback-Button leichter zu finden, jetzt auch in Gaming** (2026-10-05,
  PR #97): Feedback gibst du jetzt über das Briefsymbol oben in der
  Kopfleiste, ohne erst die Einstellungen öffnen zu müssen (im Design
  „Retro Warm“ sogar schon vor der Anmeldung, in den anderen Designs als
  Brief-Knopf unten rechts neben dem Zahnrad). In den Einstellungen steht
  Feedback jetzt ganz oben statt ganz unten. Die Gaming-Edition hat neu ein
  eigenes Feedback-Formular, ebenfalls über ein Briefsymbol in der
  Kopfleiste und in den Einstellungen.

- **Gaming: Glühbirne pendelt richtig, Power-Knopf saugt dich ein**
  (2026-10-04, PR #96): Die Glühbirne am Start schwingt jetzt deutlich
  weiter hin und her, und ihr Lichtkegel wandert auf der Betonwand mit.
  Nach dem Druck auf den Power-Knopf dreht sich die ganze Wand immer
  schneller und stürzt in den Knopf hinein, bevor die Konsole hochfährt.
  Mit „Bewegung reduzieren“ geht es ohne Wirbel direkt weiter.

- **Gaming: flackernde Spielhallen-Glühbirne beim Start** (2026-10-04,
  PR #95): Gleich beim Öffnen der Gaming-Edition hängt über dem
  Einschaltknopf eine nackte Glühbirne an ihrem Kabel. Sie pendelt leicht,
  flackert wie mit Wackelkontakt und leuchtet eine Betonwand an, der Rest
  liegt im Dunkeln. Wer im System weniger Bewegung eingestellt hat, sieht
  ein ruhiges Licht.

- **Gaming: „Modul“ jetzt auch für alle, die schon da waren** (2026-10-04,
  PR #94): Bisher blieb bei wiederkehrenden Besucher:innen das alte
  Arcade-Design gespeichert. Jetzt wechselt die App einmalig auf „Modul“,
  auch wenn eine ältere Google-Sicherung etwas anderes sagt. Wer danach ein
  anderes Design wählt, behält es.

- **Gaming-Edition: neues Design „Modul“ von Google Stitch** (2026-10-04,
  PR #93): RetroMind – Gaming sieht jetzt standardmäßig aus wie eine helle
  Retro-Konsole: graues Plastik, weiße Spiele-Module mit Griffrillen in der
  Farbe der Konsole, rote Tasten zum Drücken und eine klare, große Schrift
  statt Pixel-Text. Unten gibt es eine Leiste mit Katalog, Kisten, Stash und
  Trophäen, der Einschaltknopf ist ein roter Power-Knopf. „Arcade“,
  „Handheld“ und „Bernstein“ gibt es weiter in den Einstellungen unter
  „Bildschirm“.

- **Neues Design „Retro Warm“ von Google Stitch** (2026-10-04, PR #92):
  RetroMind sieht jetzt standardmäßig so aus, wie Stitch es entworfen hat:
  helles Pergament, Terrakotta, große klare Schrift, runde Karten und kein
  Flimmern mehr. Oben gibt es eine Kopfleiste mit Ton-Schalter, Einstellungen
  und Konten, unten eine Navigation zu Start, Zeitreise, Erkunden und
  Erinnerung. Ein Fortschritt zeigt, an welcher Station der Reise du bist. Die
  Startseite hat einen Jahrzehnt-Überblick und Archiv-Fundstücke, „Erkunden“
  zeigt die Stichworte als Karten pro Jahrzehnt. Walkman und Zauberwürfel
  haben neue Bilder. „Klassisch“ und „Nachtschicht“ kannst du weiter in den
  Einstellungen wählen.

- **Design wählbar, neu: „Nachtschicht“** (2026-10-04, PR #91): In den
  Einstellungen gibt es jetzt den Bereich „Design“. Neben dem gewohnten
  Papier-Look („Klassisch“, bleibt Standard) kannst du „Nachtschicht“ wählen:
  dunkler Hintergrund, helle Schrift und warmes Röhrenglühen, angenehm am
  Abend. Die Wahl gilt sofort und bleibt gespeichert. Das gedruckte
  Erinnerungs-Buch bleibt immer hell.

- **Ton stoppt im Hintergrund** (2026-10-04, PR #90): Wechselst du zu einer
  anderen App oder einem anderen Tab (oder geht der Bildschirm aus), verstummt
  RetroMind sofort: Spotify-Musik, Chiptune-Musik, Videos und Klänge, in der
  Zeitreise wie in der Gaming-Edition. Kommst du zurück, läuft der Ton weiter,
  außer du hattest ihn stummgeschaltet oder die Musik selbst pausiert.

- **Zeitreise: Feedback-Versand eingerichtet** (2026-10-03, PR #89): Die
  Feedback-Mail findet ihren Empfänger jetzt auch über den in Vercel gesetzten
  Namen `FEEDBACK_TO_MAIL`.

- **Impressum mit Namen und Kontakt** (2026-10-03, PR #88): Im Impressum
  stehen jetzt der Name des Betreibers und eine Kontakt-E-Mail statt
  Platzhaltern.

- **Datenschutz (DSGVO) für beide Editionen** (2026-10-03, PR #87): Neue
  Seiten „Datenschutz“ und „Impressum“, verlinkt unten auf jeder Seite und in
  den Einstellungen. Musik von Spotify (Zeitreise) und Videos von YouTube
  (Gaming) laden erst, wenn du zustimmst; ändern kannst du das jederzeit in
  den Einstellungen. Schriften, Bilder, Klänge und Wikipedia-Texte kommen jetzt
  über RetroMind selbst, dein Browser verbindet sich nicht mehr mit Google
  Fonts, Wikipedia oder anderen fremden Servern. Googles Anmelde-Skript lädt
  erst, wenn du zum Anmelde-Knopf greifst.

- **Gaming-Edition: YouTube-Videos zu jedem Spiel** (2026-10-03, PR #86): Auf
  der Seite eines Spiels startet automatisch das beliebteste YouTube-Video
  dazu, im neuen Reiter „Videos“ stehen weitere zur Auswahl. Ist der Ton in
  RetroMind aus, läuft das Video stumm, und der Lautsprecher-Knopf schaltet
  den Ton des Videos mit. Solange ein Video läuft, pausiert die Chiptune-Musik.

- **Gaming-Edition: Gamer-Slang von den 80ern bis heute** (2026-10-03, PR #85):
  Knöpfe, Meldungen und Erfolge sprechen jetzt die Sprache der Zocker aus
  allen Jahrzehnten, von „Kiste an, Alter!“ über „Epic Fail“ bis „no cap“.
  Aus „Meine Sammlung“ wird „Mein Stash“, aus „Erfolge“ werden
  „Achievements“. Auch der Retro-Guru im Chat streut jetzt Slang ein.

- **Zeitreise: Feedback landet in feedback.md** (2026-10-03, PR #84): Feedback
  aus den Einstellungen kommt weiter per Mail und wird zusätzlich in
  feedback.md gespeichert, ohne E-Mail-Adresse. In der Mail steckt ein Link,
  mit dem Marco das Feedback als To Do in die README übernehmen kann.

- **Zeitreise: „Was ist neu?“** (2026-10-03, PR #83): In den Einstellungen zeigt
  „✨ Was ist neu?“ alle Änderungen an RetroMind, die neuesten zuerst, mit
  Datum und Modul. Ein roter Punkt am Zahnrad unten rechts verrät, dass es
  seit dem letzten Blick etwas Neues gibt. Die Liste kommt direkt aus dieser
  CHANGELOG.

- **Dokumentation** (2026-10-03): Die README erklärt jetzt, wofür es
  RetroMind gibt, warum die App entwickelt wurde und was sie kann, und
  sammelt unten Ideen (Muss / Sollte / Könnte). Diese CHANGELOG führt alle
  Änderungen; beides wird bei jeder Änderung mitgepflegt.

- **Zeitreise: Logo und Untertitel im Röhrenbildschirm-Look** (2026-10-03,
  PR #81): Der Kopfbereich liegt jetzt wie der Rest der App unter dem
  CRT-Filter (Scanlines, leichte Unschärfe, Schleier). Die Neonfarben des
  Logos sind etwas wärmer, passend zum Papier-Hintergrund.

- **Zeitreise: neuer Untertitel** (2026-10-03, PR #80): Unter dem Logo steht
  „… willkommen zurück in der Vergangenheit“ statt „Deine Reise zurück in die
  Zeit“.

- **Zeitreise: Logo statt Text-Überschrift** (2026-10-03, PR #79): Die große
  Text-Überschrift „RetroMind“ ist auf allen Bildschirmen durch Marcos
  8-Bit-Logo ersetzt, mit durchsichtigem Hintergrund
  (`public/retromind-logo-header.webp`). Die Willkommens-Karte zeigt das Logo
  nicht mehr doppelt. Die alte Überschrift liegt im neuen Ordner
  `_removed_content/`, der entfernte Teile der App aufbewahrt.

- **Zeitreise: Startseite ohne doppelten Namen** (2026-10-03, PR #78): Erster
  Schritt zum Logo im Kopf: Überschrift auf der Startseite ausgeblendet, Logo
  in der Karte ohne dunklen Kasten (in PR #79 durch das Logo im Kopfbereich
  abgelöst).

- **Gaming-Edition: Musikstück wählbar** (2026-10-03, PR #77): In den
  Einstellungen lässt sich zwischen fünf eigenen Chiptune-Stücken wählen
  (Abenteuer, C64, Turbo, Verlies, Strand). Die Wahl wird mit dem
  Google-Konto abgeglichen wie Farbe und Ton.

- **Google-Anmeldung ohne ungefragte Fenster** (2026-10-03, PR #76): Beim
  Öffnen erscheint kein Google-Fenster mehr von selbst. Eine Anmeldung bleibt
  eine Stunde gültig und wird beim nächsten Öffnen wiederhergestellt; danach
  zeigt das Modul wieder den Anmelde-Knopf.

- **Eine Google-Anmeldung für alle Module** (2026-10-03, PR #75): Wer sich
  bewusst anmeldet, bleibt in Zeitreise und Gaming-Edition angemeldet; wer
  sich in einem Modul abmeldet, ist überall abgemeldet. Ohne Anmeldung
  versucht die App keine stille Anmeldung mehr.

- **Ein Stummschalter für alle Module** (2026-10-03, PR #74): Ein
  Lautsprecher-Knopf oben rechts (und ein Schalter in den Einstellungen)
  schaltet in der Zeitreise alle Töne stumm: Start-Gong, Begrüßung,
  Klick-Geräusche, Spotify und Videos. Die Gaming-Edition und jedes spätere
  Modul nutzen denselben Schalter.

- **Gaming-Edition: Musik lauter, Stummschalter** (2026-10-03, PR #73): Die Musik (Titel und Hub)
  ist etwa dreimal so laut, ein Limiter verhindert Übersteuern. Ein
  Lautsprecher-Knopf schaltet die ganze App stumm: schon auf dem
  Einschalt-Bildschirm, oben rechts neben dem Zahnrad und in den
  Einstellungen. Die Wahl bleibt auf dem Gerät gespeichert.

- **Gaming-Edition: C64-Musik auf dem Titelbildschirm** (2026-10-02, PR #71, #72): Bei „PRESS START“
  läuft jetzt eine eigene Melodie im Stil des Commodore-64-SID-Chips
  (Pulswellen-Lead mit Pulsbreiten-Sweep und Vibrato, quietschender
  Filter-Bass, schnelle Akkord-Arpeggios, Rausch-Drums; `gaming/lib/sid.ts`).
  Sie folgt der Musik-Einstellung und endet mit START.

- **Gaming-Edition: Einstellungen oben rechts mit Anmeldung** (2026-10-02, PR #70): Ein kleines
  Zahnrad oben rechts öffnet die Einstellungen mit Google-Anmeldung, Ton und
  Bildschirmfarbe (ersetzt den „☁ CLOUD“-Knopf). Nach der Anmeldung werden
  Highscore, Sammlung, Erfolge und jetzt auch die Vorlieben (Musik, SFX,
  Bildschirmfarbe) aus dem Konto geladen; oben steht dann der Spielername.

- **Gaming-Edition: echter Dieselmotor beim Einschalten** (2026-10-02, PR #69): Statt des
  synthetischen Motors läuft jetzt eine echte, lizenzfreie Aufnahme
  (Anlasser, Anspringen, Hochdrehen; von Marco ausgesucht), auf die
  Logo-Fahrt zugeschnitten und vor dem „Bling“ ausgeblendet
  (`public/gaming/diesel-start.mp3`, 34 KB).

- **Gaming-Edition: Diesel startet erst, wenn der Ton wirklich läuft, plus
  Ton-Diagnose** (2026-10-02, PR #68): Der Motor wird erst eingeplant, wenn das Audio des Geräts
  bereit ist. Mit `?ton` an der Adresse zeigt der Startbildschirm unten an,
  was Audio, Diesel und Bling auf dem Gerät tatsächlich gemacht haben.

- **Gaming-Edition: Diesel auch am Handy hörbar** (2026-10-02, PR #67): Der Motor lag fast nur im
  Tiefbass, den Handylautsprecher nicht wiedergeben. Jetzt klackert und
  brummt er im hörbaren Bereich und ist deutlich lauter.

- **Gaming-Edition: Dieselmotor beim Einschalten** (2026-10-02, PR #66): Während das Logo nach
  unten fährt, orgelt ein Anlasser, der Diesel springt an und tuckert im
  Leerlauf, bis das „Bling“ ertönt (per Web Audio synthetisiert).

- **Zeitreise: RetroMind-Logo auf der Startseite** (2026-10-02, PR #65): Marcos 8-Bit-Logo steht
  jetzt über der Begrüßung.

- **Gaming-Edition: neues 8-Bit-Logo** (2026-10-02, PR #64): Marcos Logo („RETROMIND /GAMING“ mit
  Glühbirne, Gehirn und Joystick) steht auf dem Titelbildschirm; das Motiv
  ohne Schrift erscheint beim Einschalten, oben in der Kopfzeile sowie als
  App-Icon und Favicon.

- **Gaming-Edition: Power-Knopf zeigt das Symbol überall** (2026-10-02, PR #63): Statt des
  Zeichens ⏻, das viele Handy-Schriften nicht kennen (Kasten mit X), ist das
  Power-Symbol jetzt gezeichnet.

- **Gaming-Edition: optionale Cloud-Sicherung** (2026-10-02, PR #62): Der neue Knopf „☁ Cloud“
  sichert das Profil (Sammlung, Erfolge, Highscore) nach einem Google-Login
  zusätzlich im eigenen Google Drive, nach demselben Prinzip wie die
  Zeitreise. Ohne Login bleibt alles lokal. Auf einem zweiten Gerät werden
  beide Stände zusammengeführt.

- **Zeitreise: Google-Login nicht mehr Pflicht** (2026-10-02, PR #61): Name und Geburtsdatum lassen
  sich zum Start direkt eingeben und bleiben auf dem Gerät. „Mit Google
  anmelden“ ist darunter ein optionales Angebot, um die Reise zusätzlich im
  eigenen Google Drive zu sichern und auf anderen Geräten weiterzumachen.

- **Gaming-Edition: Suchfeld im Konsolen-Regal** (2026-10-02, PR #60): Oben im Regal filtert ein
  Suchfeld die Konsolen schon beim Tippen, auch mit Spitznamen wie „PS2“,
  „N64“, „GBA“ oder „Genesis“. Es bleibt beim Scrollen sichtbar; Enter wählt
  die Konsole, wenn nur noch eine übrig ist.

- **Gaming-Edition: Konsolen-Regal statt Wischleiste** (2026-10-02, PR #59): Ein Knopf „Konsole
  wählen“ öffnet ein Regal mit Fotos aller 36 Systeme (Wikimedia Commons),
  nach Hersteller sortiert: Nintendo, Sega, Sony, Microsoft, Heimcomputer &
  PC sowie Atari, Arcade & Exoten. Antippen filtert, ✕ hebt den Filter auf.

- **Gaming-Edition: Suche zeigt zuerst Spiele mit dem Begriff im Titel**
  (2026-10-02, PR #58): „Metroid“ liefert jetzt die 19 Metroid-Spiele statt Spielen, die Metroid
  nur im Artikel erwähnen. Diese lassen sich danach mit „Verwandte Spiele
  zeigen“ nachladen und sind als solche gekennzeichnet.

- **Gaming-Edition: Suche findet alle Spiele einer Reihe** (2026-10-02, PR #57): Die Suche liefert
  statt 8 gemischter Artikel jetzt alle Wikipedia-Artikel mit Spiele-Infobox
  (z. B. 287 Treffer zu „Metroid“, die Hauptspiele zuerst), 48 pro Seite mit
  „Mehr Treffer laden“, und zeigt Plattform und Jahr auf jedem Modul. Serien-
  und Figurenartikel fallen dadurch heraus.

- **Gaming-Edition: volle Regale statt weniger Spiele pro Filter** (2026-10-02, PR #56): Jeder
  Filter (Jahrzehnt, Plattform oder beides) lädt jetzt zusätzlich zu den
  handverlesenen Spielen alle passenden Spiele aus den Wikipedia-Kategorien,
  48 pro Seite mit „Mehr Spiele laden“ (z. B. Game Boy: über 500, 90er: über
  7.000). Die Plattform-Liste wächst von 16 auf 36 Systeme, von Atari 2600 bis
  Switch; auf dem Handy ist sie eine wischbare Zeile.

- **Eigene Adresse für die Gaming-Edition** (2026-10-02, PR #55): Neues Vercel-Projekt
  `retromind-gaming` aus demselben Repo. Es setzt `RETROMIND_EDITION=gaming`,
  und der neue Build-Schritt `scripts/edition.mjs` legt dann die
  Gaming-Seite als Startseite ab. Das Haupt-Projekt bleibt unverändert.

- **Gaming-Edition als eigenständige App + Link aus RetroMind** (2026-10-02, PR #54): Die
  Startseite der Zeitreise und die Einstellungen verlinken jetzt auf
  „RetroMind – Gaming“. Die Gaming-Edition ist als eigene App installierbar
  (Web-App-Manifest, Icons, Service Worker mit Scope `/gaming/`, Network-first
  mit Offline-Fallback) und bietet im Hub einen „Als App“-Button, wo der
  Browser das unterstützt.

- **Neue Edition „RetroMind – Gaming“ (`/gaming/`)** (2026-10-02, PR #53): Eigene Seite im selben
  Repo, die vergessene und unterschätzte Videospiele von den 1980ern bis heute wiederentdecken lässt.
  Kuratierter Katalog mit 38 Spielen von 1987 bis 2023 als Modul-Regal (Filter nach Jahrzehnt
  und Plattform), „Insert Coin“-Zufallsfund, Suche nach beliebigen Spielen
  über Wikipedia, Detailansicht mit Wikipedia-Text (bevorzugt deutsch),
  Screenshots aus Wikimedia, kuratierten Tipps, einem KI-Guide mit
  Google-Websuche samt Quellen (neue Action `gameGuide` in `api/gemini.js`)
  und Links zu Longplays, GameFAQs, MobyGames, Internet Archive. Dazu ein
  „Retro-Guru“-Chat (Persona `gaming` in der bestehenden `chat`-Action).
  Atmosphäre: Einschaltknopf, CRT-Aufwärmen, Logo-Scroll mit Chime, „Press
  Start“, selbst synthetisierte Chiptune-Musik und 8-Bit-Soundeffekte (Web
  Audio, keine Assets), Scanlines, Sternenhimmel, drei Bildschirm-Paletten
  (Arcade, Handheld-Grün, Bernstein), Score/Hi-Score, Erfolge, Sammlung,
  Konami-Code, Steuerung per Pfeiltasten und Gamepad. Alles lokal im
  Browser gespeichert (`retromind.gaming.v1`).

- **Zeitreise: Überschrift nicht mehr über offenen Fenstern** (2026-09-05,
  PR #52): Der Schriftzug „RetroMind“ schien durch Einstellungen, Feedback
  und andere Fenster hindurch. Jetzt liegen offene Fenster sauber darüber.

- **Zeitreise: Knopf zurück zur Startseite** (2026-09-05, PR #51): Unten in
  der Mitte sitzt ein Haus-Symbol. Es führt auf jeder Seite der Reise zurück
  zum Start, ohne dass der Fortschritt verloren geht.

- **Zeitreise: Feedback geben** (2026-09-05, PR #50): In den Einstellungen
  gibt es einen Knopf „Feedback geben“ für Lob, Kritik, Vorschläge und
  Wünsche. Die Nachricht kommt per E-Mail bei Marco an.

- **Zeitreise: Nostalgie-Radio entfernt** (2026-09-05, PR #49): Die selbst
  erzeugte Hintergrundmusik in den Einstellungen ist weg. Die Wahl des
  Jahrzehnts steuert jetzt nur noch die echten Hits von Spotify.

- **Zeitreise: Ticken auf dem Willkommensbildschirm, wieder entfernt**
  (2026-09-05, PR #46, #47, #48): Ein leises Ticken der Uhr kam dazu, spielte
  aber nicht zuverlässig und störte den Musikstart. Es wurde deshalb wieder
  herausgenommen (später kam es verbessert zurück).

- **Zeitreise: Anmeldung beim Öffnen** (2026-09-05, PR #45): Vor der Reise
  stand eine Abfrage, die Google-Anmeldung verlangte (ohne Google ein
  kleines Formular). Name und Geburtsdatum kamen aus dem Google-Profil.
  Später wurde die Anmeldung wieder freiwillig.

- **Zeitreise: Willkommensbildschirm mit Kaminuhr** (2026-09-05, PR #37 bis
  #44): Vor der App erscheint „Welcome to RetroMind“ mit dem Satz „The ticket
  to your past“. Dahinter steht groß und schräg von oben gesehen eine alte
  hölzerne Kaminuhr, deren Zeiger langsam laufen. Der Bildschirm ist dunkel
  und geheimnisvoll, der Titel steht in verschnörkelter Schrift, glüht und
  schwebt leicht. Ein Druck auf „Let's go!“ lässt Funken sprühen, dann geht
  der Bildschirm langsam in die App über.

- **Spotify-Login (Authorization Code + PKCE)** (2026-09-04, PR #36): „Mit Spotify anmelden“ neben
  dem bestehenden Google-Login – komplett clientseitig, kein eigener
  Auth-Server, kein Client-Secret. Holt nur Name und Premium-/Free-Status ab
  (`GET /v1/me`, Scopes `user-read-private`/`user-read-email`); beeinflusst
  das bestehende Playlist-Embed nicht. Der Access-Token bleibt im Speicher,
  nur der Refresh-Token landet in `localStorage` (nötig, weil Spotify anders
  als Google keine Popup-/Silent-Renewal-API hat, sondern einen vollen
  Seiten-Redirect verlangt). Neue optionale Env-Var
  `VITE_SPOTIFY_CLIENT_ID`; ohne sie bleibt der Button unsichtbar. Neue
  Dateien: `lib/spotifyAuth.ts`, `hooks/useSpotifyAuth.ts`,
  `components/SpotifyAuthControl.tsx`, `components/AccountControls.tsx`
  (gemeinsamer Container für Google- und Spotify-Pille).

- **Geschlecht + Lieblingsmusiker:innen im Onboarding** (2026-09-04, PR #36): Das bisher ungenutzte
  `gender`-Feld im Profil hat jetzt ein echtes (optionales) Auswahlfeld;
  dazu ein neues optionales Freitext-Feld `favoriteArtists` für
  Lieblingsmusiker:innen/-bands. Beide rein selbst angegeben – weder Google
  noch Spotify liefern Alter oder Geschlecht an Drittanbieter-Apps, deshalb
  bleibt das ehrlich als Selbstauskunft gekennzeichnet statt als
  „Verifizierung“ verkauft.

- **Echte Hits pro Dekade (Spotify-Embed), jetzt automatisch** (2026-09-03, PR #33, #35): Sobald die
  Nutzer:in einmal irgendwo klickt/tippt, startet automatisch im Hintergrund
  Spotifys offizielle „All Out …“-Playlist der gewählten Dekade (neuer Hook
  `hooks/useSpotifyBackground.ts`, Wrapper um Spotifys iFrame-API in
  `lib/spotifyEmbed.ts`) – parallel zum Synth-Ambiente, das jetzt ebenfalls
  bei diesem ersten Klick über 10s von 0% auf die eingestellte Lautstärke
  einblendet (`hooks/useAudioPlayer.ts`), statt sofort auf voller Lautstärke
  einzusetzen. Spotifys öffentliche Embed-API bietet keine
  Lautstärke-Schnittstelle – der Spotify-Anteil läuft deshalb immer in
  Spotifys eigener Lautstärke und lässt sich in den Einstellungen nur
  pausieren/fortsetzen, nicht leiser stellen. Neues optionales Feld
  `spotifyPlaylistId` in `constants.ts`/`types.ts`.

- **Zeitreise: Hinweis zum Spotify-Login** (2026-09-03, PR #34): Neben dem
  Spotify-Player steht, dass Spotify eine eigene Anmeldung hat. Ohne sie
  spielt der Player nur 30-Sekunden-Ausschnitte, auch wenn man mit Google
  angemeldet ist.

- **Perspektivwechsel bei Erinnerungs-Fragen** (2026-09-03, PR #32): Nach dem Speichern einer
  Erinnerung im Buzzword-Modal lässt sich zusätzlich eine Frage generieren,
  die denselben Moment aus Sicht einer anderen Person von damals (Freund:in,
  Geschwister, Elternteil) neu erzählen lässt – als eigene Erinnerung
  gespeichert. Neue Server-Aktion `perspectiveQuestion` in `api/gemini.js`.

- **Zeitreise: Einstellungen und Google-Knopf erst ganz unten** (2026-09-03,
  PR #28 bis #31): Das Zahnrad und der Google-Knopf sitzen unten in den
  beiden Ecken und erscheinen erst, wenn man bis ans Seitenende scrollt.

- **Zeitreise: „Weitermachen“ gleich oben** (2026-09-03, PR #27): Wer
  zurückkommt, sieht „Weitermachen“ und „Neu beginnen“ direkt unter der
  Überschrift statt erst weit unten.

- **Zeitreise: Google-Anmeldung klappt am Handy beim ersten Tipp**
  (2026-09-03, PR #25): Googles Anmeldefenster öffnet sich jetzt sofort,
  vorher schluckte das Handy den ersten Tipp.

- **Zeitreise: ruhige Melodie zum Start** (2026-09-03, PR #24): Statt eines
  gleichbleibenden Brummtons spielt eine kurze, ruhige Melodie in Schleife,
  für jedes Jahrzehnt in einer anderen Tonart.

- **Zeitreise: klare Überschrift mit rotem R und M** (2026-09-03, PR #23):
  „RetroMind“ ist nicht mehr verschwommen, R und M sind rot.

- **Zeitreise: Versionsnummer in den Einstellungen** (2026-09-03, PR #22,
  #26): Unten in den Einstellungen steht, welche Version gerade läuft, gut
  lesbar.

- **Zeitreise: Einstellungen mit Zahnrad** (2026-09-03, PR #20, #21): Ein
  Zahnrad öffnet die Einstellungen mit Schriftgröße und Musik (Abspielen,
  Jahrzehnt, Lautstärke). Der eigene Musik-Knopf ist dafür weg.

- **Zeitreise: Musik von Anfang an** (2026-09-03, PR #16, #17, #19): Beim
  Öffnen startet ruhige Hintergrundmusik in Schleife. Blockiert der Browser
  den Ton, steht da „Zum Starten tippen“. Die Musik wird in der App selbst
  erzeugt, statt sie von einer fremden Seite zu laden, die manchmal
  stumm blieb.

- **Zeitreise: Startknopf direkt unter der Überschrift** (2026-09-03, PR #18):
  „Zeitreise starten“ steht gleich oben auf der Startseite.

- **Entwicklung: Regeln für Claude im Repo** (2026-09-03, PR #15): Die
  neue CLAUDE.md legt fest, dass fertige, grüne Pull Requests direkt
  zusammengeführt werden.

- **Zeitreise: Röhrenbildschirm-Look für die ganze App** (2026-09-03,
  PR #14): Über der ganzen App liegen feine Streifen und ein leichter
  Schleier wie auf einem alten Fernseher, der ab und zu flackert.

- **Zeitreise: Radio-Player als kleiner runder Knopf** (2026-09-03, PR #11,
  #13): Der Musik-Player ist zuerst nur ein runder Knopf unten rechts und
  klappt beim Antippen auf und wieder zu.

- **Google-Login + dezentrale Sicherung** (2026-09-03, PR #12): „Mit Google anmelden“ (Google
  Identity Services) sichert die Reise zusätzlich zu `localStorage` im
  privaten `appDataFolder` des eigenen Google Drive der Nutzer:in – keine
  zentrale Datenbank, jede Person behält ihre Erinnerungen in ihrem eigenen
  Konto. Beim Login wird ein vorhandenes Drive-Backup automatisch geladen,
  sofern lokal noch keine Reise begonnen wurde; Änderungen werden danach
  debounced (1,5 s) automatisch nachgeführt. Neue optionale Env-Var
  `VITE_GOOGLE_CLIENT_ID`; ohne sie bleibt die App unverändert rein lokal.
  Neue Dateien: `lib/googleAuth.ts`, `services/googleDriveService.ts`,
  `hooks/useGoogleAuth.ts`, `components/GoogleAuthControl.tsx`.

- **Zeitreise: Fotos wie alte Abzüge** (2026-09-03, PR #8): Alle Bilder
  wirken leicht verblasst und sepiafarben und flackern ab und zu wie auf
  einem alten Bildschirm. Das gedruckte Buch bleibt klar.

- **Zeitreise: Start mit Pixel-Effekt und „Welcome“** (2026-09-03): Beim
  Öffnen löst sich ein schwarzes Raster Kästchen für Kästchen auf, dazu
  erklingt ein tiefer Ton. Danach sagt eine tiefe, langsame Stimme
  „Welcome“.

- **Entwicklung: schnellere App durch eigenen Build** (2026-09-03, PR #4,
  #5): Die Gestaltung wird beim Bauen erzeugt statt im Browser, die Farben
  stehen an einer Stelle, der Code ist in kleinere Teile aufgeteilt.

- **Entwicklung: Code aufgeräumt, Live-Adresse in der README** (2026-09-02):
  Die Anzeige-Bausteine liegen in einer eigenen Datei, und die README nennt
  die Adresse retromind.vercel.app.

- **Zeitreise: jeder Knopf reagiert** (2026-09-02, PR #2): Auch kleine
  Knöpfe wie Schließen oder Später geben beim Drücken sichtbar und hörbar
  Rückmeldung.

## 2.0.1 (2026-09-02)

- **Favicon ergänzt** (2026-09-02, PR #1): Tab-Icon (🕰️) als Inline-SVG-Data-URI statt fehlendem
  Favicon (bisher 404 im Browser, kein Wiedererkennungsmerkmal im Tab).

## 2.0.0 (2026-09-02)

Großer Ausbau: aus dem Prototyp wird ein rundes Produkt. **Breaking:** die App
braucht jetzt die serverseitige Env-Var `GEMINI_API_KEY` (Vercel Functions).

### Architektur
- **Serverless-Proxy:** Alle Gemini-/Veo-Aufrufe laufen über `api/gemini.js` und
  `api/video.js` (Vercel Functions). Der API-Key ist nur noch serverseitig und
  nicht mehr im Client-Bundle. `@google/genai` fliegt aus dem Frontend →
  Bundle 522 kB → 249 kB.
- `vite.config.ts` ohne `define`-Key-Injection; `vercel.json` ergänzt.
- TypeScript auf `strict`; `api/` von der Typprüfung ausgenommen.

### Kernfunktion: Erinnerungen werden erfasst
- Jede Buzzword-Frage hat jetzt ein Antwortfeld. Antworten werden als
  `CapturedMemory` gesammelt und im **Erinnerungs-Buch** dargestellt.
- **Spracheingabe** (Web Speech API) für Antworten, wo der Browser sie kann.
- Foto-Beschreibungen lassen sich per Klick als Foto-Erinnerung ins Buch
  übernehmen (inkl. verkleinertem Bild).

### Erinnerungs-Buch & Persistenz
- Neue Phase `book`: formatierte Zusammenfassung, **PDF via Druckdialog**
  (`@media print`), `.txt`-Export, **`.json`-Sitzung** exportieren/importieren
  (geräteübergreifend).
- Komplette Sitzung (Profil, Erinnerungen, Fortschritt, Schriftgröße) im
  `localStorage`; Intro bietet **„Weitermachen“** an.

### Inhalte
- Neues Jahrzehnt **2010er** (Smartphone, WhatsApp, Streaming, …); Clamp jetzt
  1960–2010.
- Galerie: `picsum`-Zufallsbilder raus. Stattdessen typografische Zeit-Postkarten
  + ein echtes gemeinfreies NASA-Foto (Mondlandung), ehrlich als „symbolisch“
  gekennzeichnet. Radio-Labels ehrlich als „Ambiente-Klang“.
- Buzzwords werden nach den Interessen des Nutzers sortiert und markiert
  (nutzt endlich das `category`-Feld).

### Barrierefreiheit & Robustheit
- Schriftgrößen-Umschalter (A/A+/A++), größere Grundschrift (18 px), Fokus-Ringe.
- Wiederverwendbarer Dialog mit Esc-Schließen, Fokus-Falle, `aria-modal`,
  Backdrop-Klick; ARIA-Labels auf Icon-Buttons.
- `prefers-reduced-motion` respektiert; **Error Boundary** gegen weiße Seiten.
- Datenschutz-Hinweis im Intro; Upload mit Größen-/Typprüfung + Downscaling.
- Veo-Download läuft über den Proxy (kein Key in der URL, echter Datei-Download).

## 1.1.0 (2026-09-02)

Fix-Durchlauf nach Code-Review des AI-Studio-Exports.

- **Chatbot mit Gedächtnis:** Die Gemini-Chat-Session wird einmalig erzeugt und
  wiederverwendet, statt bei jeder Nachricht neu (`chatRef`). Vorher ging der
  Gesprächsverlauf bei jeder Antwort verloren.
- **Dekaden-Begrenzung:** Das aus dem Geburtsjahr abgeleitete Kindheits-Jahrzehnt
  wird auf 1960–2000 geklemmt. Vorher bekamen z. B. nach ~1996 Geborene einen
  leeren Induction-Screen und eine `undefined`-Audioquelle.
- **Modell-ID korrigiert:** `gemini-2.5-flash-lite-latest` →
  `gemini-flash-lite-latest` (gültiger rollender Alias).
- **Statische Erinnerungsfragen als Fallback:** Schlägt die KI-Generierung fehl
  oder fehlt der Key, wird die zum Buzzword hinterlegte Frage aus `constants.ts`
  angezeigt statt eines einzelnen generischen Satzes.
- **Veo-Polling mit Timeout:** Die Statusabfrage bricht nach ~10 Minuten ab,
  statt unbegrenzt in „KI arbeitet…“ zu hängen.
- **Audio-Guard:** Keine Zuweisung einer `undefined`-`src` mehr am Audio-Element.
- **Persistenz:** Profil und Tagebuch werden im `localStorage` gesichert
  (Reload-fest) und lassen sich als `.txt` exportieren. „Eine neue Reise planen“
  löscht den gespeicherten Stand.
- **Key-Erkennung standalone:** Ein per `GEMINI_API_KEY` eingebauter Schlüssel
  wird auch ohne `window.aistudio` erkannt.
- Aufräumen: tote Imports entfernt, `.gitattributes` (LF), `.gitignore` deckt
  jetzt `.env`/`.env.*` ab.

## 1.0.0 (2026-09-02)

Erster Commit: RetroMind als eigenständiges Repo. React 19 + Vite 6,
ursprünglich in Google AI Studio prototypisiert. README/LICENSE/.env.example
ergänzt, redundante esm.sh-Importmap und toter `/index.css`-Verweis entfernt.
