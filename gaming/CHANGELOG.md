# Changelog: RetroMind – Gaming

Alle Änderungen an der Gaming-Edition (https://retromind-gaming.vercel.app),
die neueste oben. Diese Datei entsteht automatisch aus der
[CHANGELOG.md](../CHANGELOG.md) im Hauptordner, die alle Änderungen an
beiden Apps enthält: Nach jeder Änderung dort baut GitHub sie neu. Bitte
nicht von Hand bearbeiten.

## Unreleased

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

- **Musik hängt nicht mehr bei „Lädt …“** (2026-10-14, PR #214): Wurde der
  Spotify-Player neu aufgebaut (etwa weil dein Spotify-Login nach dem Start
  dazukam oder die Spotify-App auf dem Handy nicht gefunden wurde), blieb
  die Musik in der Zeitreise und in der Gaming-Halle bei „Playlist wird
  geladen“ stehen. Jetzt startet der neue Player wie gewohnt.

- **Neu laden bleibt auf der Seite** (2026-10-13, PR #202): Wenn du die
  Seite neu lädst, landest du wieder dort, wo du gerade warst, statt auf dem
  Willkommensbildschirm. In der Zeitreise bleibt die offene Etappe, in der
  Gaming-Halle bleiben Halle, Reiter, Filter, Suche und ein offenes Spiel.
  Ein neuer Tab oder ein späterer Besuch beginnt weiter am Start.

- **Kein Sprung nach oben beim Liedwechsel** (2026-10-13, PR #199): Wenn
  die Musik zum nächsten Lied wechselt, springen offene Fenster nicht mehr
  an den Anfang zurück. In der Zeitreise passierte das in den
  Einstellungen und in allen anderen Fenstern (Was ist neu, Feedback,
  Grabbelkiste, Infos zu Laufband-Sprüchen), in Gaming in der
  Konsolen-Auswahl.

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

- **Blitz statt Note in der Gaming-Halle** (2026-10-06, PR #129): Die
  Musiksteuerung der Gaming-Edition ist dieselbe wie in der Zeitreise, ihr
  Metall-Symbol zeigt aber einen Blitz statt einer Musiknote, auch im
  geöffneten Feld.

- **Musik-Symbol leuchtet gelb, solange Musik läuft** (2026-10-06, PR #128):
  Das schwarz-blaue Musik-Symbol glüht sanft gelb, sobald Musik spielt, in der
  Zeitreise wie in der Gaming-Halle. Ist die Musik pausiert oder der Ton aus,
  ist es wieder schwarz-blau.

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

- **Ton stoppt im Hintergrund** (2026-10-04, PR #90): Wechselst du zu einer
  anderen App oder einem anderen Tab (oder geht der Bildschirm aus), verstummt
  RetroMind sofort: Spotify-Musik, Chiptune-Musik, Videos und Klänge, in der
  Zeitreise wie in der Gaming-Edition. Kommst du zurück, läuft der Ton weiter,
  außer du hattest ihn stummgeschaltet oder die Musik selbst pausiert.

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

- **Gaming-Edition: Musikstück wählbar** (2026-10-03, PR #77): In den
  Einstellungen lässt sich zwischen fünf eigenen Chiptune-Stücken wählen
  (Abenteuer, C64, Turbo, Verlies, Strand). Die Wahl wird mit dem
  Google-Konto abgeglichen wie Farbe und Ton.

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
