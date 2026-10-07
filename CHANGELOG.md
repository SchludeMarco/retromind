# Changelog

Hier steht jede Änderung an RetroMind (Zeitreise und Gaming-Edition), die
neueste oben. Neue Einträge kommen unter „Unreleased“, bis eine Version
vergeben wird. Jede Änderung, die in die App gelangt, bekommt hier einen
Eintrag in Alltagssprache: was sich für Nutzer:innen ändert, nicht wie.

## Unreleased

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

- **Gaming-Edition: Musik lauter, Stummschalter:** Die Musik (Titel und Hub)
  ist etwa dreimal so laut, ein Limiter verhindert Übersteuern. Ein
  Lautsprecher-Knopf schaltet die ganze App stumm: schon auf dem
  Einschalt-Bildschirm, oben rechts neben dem Zahnrad und in den
  Einstellungen. Die Wahl bleibt auf dem Gerät gespeichert.

- **Gaming-Edition: C64-Musik auf dem Titelbildschirm:** Bei „PRESS START“
  läuft jetzt eine eigene Melodie im Stil des Commodore-64-SID-Chips
  (Pulswellen-Lead mit Pulsbreiten-Sweep und Vibrato, quietschender
  Filter-Bass, schnelle Akkord-Arpeggios, Rausch-Drums; `gaming/lib/sid.ts`).
  Sie folgt der Musik-Einstellung und endet mit START.

- **Gaming-Edition: Einstellungen oben rechts mit Anmeldung:** Ein kleines
  Zahnrad oben rechts öffnet die Einstellungen mit Google-Anmeldung, Ton und
  Bildschirmfarbe (ersetzt den „☁ CLOUD“-Knopf). Nach der Anmeldung werden
  Highscore, Sammlung, Erfolge und jetzt auch die Vorlieben (Musik, SFX,
  Bildschirmfarbe) aus dem Konto geladen; oben steht dann der Spielername.

- **Gaming-Edition: echter Dieselmotor beim Einschalten:** Statt des
  synthetischen Motors läuft jetzt eine echte, lizenzfreie Aufnahme
  (Anlasser, Anspringen, Hochdrehen; von Marco ausgesucht), auf die
  Logo-Fahrt zugeschnitten und vor dem „Bling“ ausgeblendet
  (`public/gaming/diesel-start.mp3`, 34 KB).

- **Gaming-Edition: Diesel startet erst, wenn der Ton wirklich läuft, plus
  Ton-Diagnose:** Der Motor wird erst eingeplant, wenn das Audio des Geräts
  bereit ist. Mit `?ton` an der Adresse zeigt der Startbildschirm unten an,
  was Audio, Diesel und Bling auf dem Gerät tatsächlich gemacht haben.

- **Gaming-Edition: Diesel auch am Handy hörbar:** Der Motor lag fast nur im
  Tiefbass, den Handylautsprecher nicht wiedergeben. Jetzt klackert und
  brummt er im hörbaren Bereich und ist deutlich lauter.

- **Gaming-Edition: Dieselmotor beim Einschalten:** Während das Logo nach
  unten fährt, orgelt ein Anlasser, der Diesel springt an und tuckert im
  Leerlauf, bis das „Bling“ ertönt (per Web Audio synthetisiert).

- **Zeitreise: RetroMind-Logo auf der Startseite:** Marcos 8-Bit-Logo steht
  jetzt über der Begrüßung.

- **Gaming-Edition: neues 8-Bit-Logo:** Marcos Logo („RETROMIND /GAMING“ mit
  Glühbirne, Gehirn und Joystick) steht auf dem Titelbildschirm; das Motiv
  ohne Schrift erscheint beim Einschalten, oben in der Kopfzeile sowie als
  App-Icon und Favicon.

- **Gaming-Edition: Power-Knopf zeigt das Symbol überall:** Statt des
  Zeichens ⏻, das viele Handy-Schriften nicht kennen (Kasten mit X), ist das
  Power-Symbol jetzt gezeichnet.

- **Gaming-Edition: optionale Cloud-Sicherung:** Der neue Knopf „☁ Cloud“
  sichert das Profil (Sammlung, Erfolge, Highscore) nach einem Google-Login
  zusätzlich im eigenen Google Drive, nach demselben Prinzip wie die
  Zeitreise. Ohne Login bleibt alles lokal. Auf einem zweiten Gerät werden
  beide Stände zusammengeführt.

- **Zeitreise: Google-Login nicht mehr Pflicht:** Name und Geburtsdatum lassen
  sich zum Start direkt eingeben und bleiben auf dem Gerät. „Mit Google
  anmelden“ ist darunter ein optionales Angebot, um die Reise zusätzlich im
  eigenen Google Drive zu sichern und auf anderen Geräten weiterzumachen.

- **Gaming-Edition: Suchfeld im Konsolen-Regal:** Oben im Regal filtert ein
  Suchfeld die Konsolen schon beim Tippen, auch mit Spitznamen wie „PS2“,
  „N64“, „GBA“ oder „Genesis“. Es bleibt beim Scrollen sichtbar; Enter wählt
  die Konsole, wenn nur noch eine übrig ist.

- **Gaming-Edition: Konsolen-Regal statt Wischleiste:** Ein Knopf „Konsole
  wählen“ öffnet ein Regal mit Fotos aller 36 Systeme (Wikimedia Commons),
  nach Hersteller sortiert: Nintendo, Sega, Sony, Microsoft, Heimcomputer &
  PC sowie Atari, Arcade & Exoten. Antippen filtert, ✕ hebt den Filter auf.

- **Gaming-Edition: Suche zeigt zuerst Spiele mit dem Begriff im Titel:**
  „Metroid“ liefert jetzt die 19 Metroid-Spiele statt Spielen, die Metroid
  nur im Artikel erwähnen. Diese lassen sich danach mit „Verwandte Spiele
  zeigen“ nachladen und sind als solche gekennzeichnet.

- **Gaming-Edition: Suche findet alle Spiele einer Reihe:** Die Suche liefert
  statt 8 gemischter Artikel jetzt alle Wikipedia-Artikel mit Spiele-Infobox
  (z. B. 287 Treffer zu „Metroid“, die Hauptspiele zuerst), 48 pro Seite mit
  „Mehr Treffer laden“, und zeigt Plattform und Jahr auf jedem Modul. Serien-
  und Figurenartikel fallen dadurch heraus.

- **Gaming-Edition: volle Regale statt weniger Spiele pro Filter:** Jeder
  Filter (Jahrzehnt, Plattform oder beides) lädt jetzt zusätzlich zu den
  handverlesenen Spielen alle passenden Spiele aus den Wikipedia-Kategorien,
  48 pro Seite mit „Mehr Spiele laden“ (z. B. Game Boy: über 500, 90er: über
  7.000). Die Plattform-Liste wächst von 16 auf 36 Systeme, von Atari 2600 bis
  Switch; auf dem Handy ist sie eine wischbare Zeile.

- **Eigene Adresse für die Gaming-Edition:** Neues Vercel-Projekt
  `retromind-gaming` aus demselben Repo. Es setzt `RETROMIND_EDITION=gaming`,
  und der neue Build-Schritt `scripts/edition.mjs` legt dann die
  Gaming-Seite als Startseite ab. Das Haupt-Projekt bleibt unverändert.

- **Gaming-Edition als eigenständige App + Link aus RetroMind:** Die
  Startseite der Zeitreise und die Einstellungen verlinken jetzt auf
  „RetroMind – Gaming“. Die Gaming-Edition ist als eigene App installierbar
  (Web-App-Manifest, Icons, Service Worker mit Scope `/gaming/`, Network-first
  mit Offline-Fallback) und bietet im Hub einen „Als App“-Button, wo der
  Browser das unterstützt.

- **Neue Edition „RetroMind – Gaming“ (`/gaming/`):** Eigene Seite im selben
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

- **Spotify-Login (Authorization Code + PKCE):** „Mit Spotify anmelden“ neben
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
- **Geschlecht + Lieblingsmusiker:innen im Onboarding:** Das bisher ungenutzte
  `gender`-Feld im Profil hat jetzt ein echtes (optionales) Auswahlfeld;
  dazu ein neues optionales Freitext-Feld `favoriteArtists` für
  Lieblingsmusiker:innen/-bands. Beide rein selbst angegeben – weder Google
  noch Spotify liefern Alter oder Geschlecht an Drittanbieter-Apps, deshalb
  bleibt das ehrlich als Selbstauskunft gekennzeichnet statt als
  „Verifizierung“ verkauft.
- **Echte Hits pro Dekade (Spotify-Embed), jetzt automatisch:** Sobald die
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
- **Perspektivwechsel bei Erinnerungs-Fragen:** Nach dem Speichern einer
  Erinnerung im Buzzword-Modal lässt sich zusätzlich eine Frage generieren,
  die denselben Moment aus Sicht einer anderen Person von damals (Freund:in,
  Geschwister, Elternteil) neu erzählen lässt – als eigene Erinnerung
  gespeichert. Neue Server-Aktion `perspectiveQuestion` in `api/gemini.js`.
- **Google-Login + dezentrale Sicherung:** „Mit Google anmelden“ (Google
  Identity Services) sichert die Reise zusätzlich zu `localStorage` im
  privaten `appDataFolder` des eigenen Google Drive der Nutzer:in – keine
  zentrale Datenbank, jede Person behält ihre Erinnerungen in ihrem eigenen
  Konto. Beim Login wird ein vorhandenes Drive-Backup automatisch geladen,
  sofern lokal noch keine Reise begonnen wurde; Änderungen werden danach
  debounced (1,5 s) automatisch nachgeführt. Neue optionale Env-Var
  `VITE_GOOGLE_CLIENT_ID`; ohne sie bleibt die App unverändert rein lokal.
  Neue Dateien: `lib/googleAuth.ts`, `services/googleDriveService.ts`,
  `hooks/useGoogleAuth.ts`, `components/GoogleAuthControl.tsx`.

## 2.0.1

- **Favicon ergänzt:** Tab-Icon (🕰️) als Inline-SVG-Data-URI statt fehlendem
  Favicon (bisher 404 im Browser, kein Wiedererkennungsmerkmal im Tab).

## 2.0.0

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

## 1.1.0

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

## 1.0.0

Erster Commit: RetroMind als eigenständiges Repo. React 19 + Vite 6,
ursprünglich in Google AI Studio prototypisiert. README/LICENSE/.env.example
ergänzt, redundante esm.sh-Importmap und toter `/index.css`-Verweis entfernt.
