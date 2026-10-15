# RetroMind – Gaming

**Live: https://retromind-gaming.vercel.app** · auch unter
https://retromind.vercel.app/gaming/

RetroMind – Gaming ist die Spiele-Edition von [RetroMind](../README.md). Statt
durch die eigene Kindheit führt sie durch eine verranzte Spielhalle voller
vergessener Videospiele von den 1970ern bis heute: mit eigenen Pixelbildern,
Hintergründen, Tipps, alten Testwertungen, Videos, Minispielen, Quests und
Musik wie damals.

Alle Änderungen an dieser Edition stehen in der
[CHANGELOG.md](CHANGELOG.md) (automatisch erzeugt aus der gemeinsamen
[CHANGELOG.md](../CHANGELOG.md) beider Apps).

## Wofür es RetroMind – Gaming gibt

- **Wiederentdecken:** Spiele finden, die man als Kind gespielt und längst
  vergessen hat, oder die damals untergegangen sind, obwohl sie gut waren.
- **Nachlesen und nachspielen:** Zu jedem Spiel gibt es Geschichte, Fakten,
  Testwertungen von damals, Tipps und legale Wege, es heute zu spielen.
- **Spielhallen-Gefühl:** Neonschild, Metal aus der Halle, blinkende
  Automaten, Münzeinwurf und Highscore-Tafel holen die Stimmung einer alten
  Arcade zurück.

## Warum es die Gaming-Edition gibt

Marco wollte am 2. Oktober 2026 eine eigene Edition „RetroMind – Gaming“, um
alte und vergessene Spiele wiederzuentdecken, mit Screenshots, Guides, Tipps,
Inhalten aus dem Netz und einem echten Retro-Gefühl für Augen und Ohren. Sie
lebt im selben Repo wie die Zeitreise, teilt sich deren Server-Funktionen
(`api/`), Stummschalter, Google-Anmeldung und Sprache, hat aber ein eigenes
Vercel-Projekt und eine eigene Adresse. Wie bei der Zeitreise gilt: Die Daten
gehören den Spieler:innen. Alles bleibt zuerst auf dem Gerät, die Sicherung im
eigenen Google Drive ist freiwillig, und gezeigt wird nur Material, das wir
zeigen dürfen.

## Was die Gaming-Edition kann

### Vor der Tür

- **Eingang einer verranzten Spielhalle** – Marcos Bild einer Spielhalle im
  Regen mit Sticker-Tür (`public/gaming/arcade-entrance.webp`, nur eigene,
  allgemeine Pixel-Symbole statt fremder Logos). Das Neonschild „ARCADE“ geht
  Buchstabe für Buchstabe an, bis alle sechs leuchten, dann beginnt es von
  vorn (`public/gaming/arcade-sign-0…5.webp`).
- **Musik durch die Wand** – vor der Tür hört man leise und gedämpft Bass und
  Drums der Metal-Musik aus der Halle (`gaming/lib/street.ts`). Mit Spotify
  Premium läuft draußen schon der Song von drinnen, als 30-Sekunden-Ausschnitt
  durch einen Tiefpass, dumpf wie durch die Wand (`api/spotify-preview.js`,
  sonst Deezer, sonst die gedämpfte Hallen-Aufnahme).
- **Rein durch die Tür** – ein Tipp auf die Tür mit blinkendem Neonrahmen
  öffnet sie mit langem Knarzen, ein Fiepen der Automaten wird lauter, das
  Logo leuchtet aus dem Eingang und das Bild wird weiß
  ([`components/Entrance.tsx`](components/Entrance.tsx)). Darunter steht
  mittig das Warnschild „Warning, extreme loud!“; bei Ton aus vergräbt es sich
  im Boden. Die ersten Klänge steigen über etwa 10 Sekunden aus der Stille an.
- **Anmelden am Eingang (freiwillig)** – mit Google (Savegame und Coins im
  eigenen Google Drive) und mit Spotify (Hallenmusik); beides geht auch später
  in den Einstellungen.
- **Zurück zu RetroMind** – wer aus der Zeitreise kommt (Wegweiser oder
  Einstellungen, `?from=zeitreise`), sieht vor der Tür und oben in der Halle
  den Knopf „Zurück zu RetroMind“, für den ganzen Besuch im Tab
  ([`lib/cameFrom.ts`](lib/cameFrom.ts),
  [`components/BackToZeitreise.tsx`](components/BackToZeitreise.tsx)).

### In der Halle

- **80er-Heavy-Metal-Intro** – beim Betreten zwei verzerrte Gitarren links
  und rechts, Bass, Solo, Schlagzeug und Hall, vorab im eigenen kleinen
  „Studio“ aufgenommen ([`lib/metalBand.ts`](lib/metalBand.ts),
  `node scripts/render-metal.mjs`, Dateien in `public/gaming/audio/`).
- **Hallenmusik** – mit Spotify-Erlaubnis echter 80er-Metal von Spotify
  (Playlist „The 100 Best Metal Songs of 80s“) in zufälliger Reihenfolge, mit
  Premium über Spotifys Browser-Player und langsamem Einblenden
  ([`lib/useHallSpotify.ts`](lib/useHallSpotify.ts)); sonst eigene
  Chiptune-Stücke ([`lib/chiptune.ts`](lib/chiptune.ts)). Beim ersten Besuch
  fragt die Halle einmal („Metal erlauben“ oder „Lieber Chiptune“), in den
  Einstellungen unter „Hallenmusik“ lässt es sich jederzeit wechseln.
- **Die Musik hört nie auf** – ein Wächter merkt, wenn Spotify ein paar
  Sekunden stillsteht, probiert einen anderen Song und lässt sonst die eigene
  Chiptune-Musik weiterlaufen, bis Spotify wieder spielt (neuer Versuch alle
  zwei Minuten oder mit Weiter). Ein hängendes Intro gibt nach spätestens
  einer Minute ab, der Ton wacht nach dem Entsperren des Handys wieder auf.
- **Musiksteuerung** – unten in der Mitte öffnet ein schwarz-blaues
  Metall-Symbol mit Blitz die Steuerung (Song, Zurück, Play/Pause, Weiter,
  Ton an/aus, Lautstärke-Regler; mit Spotify-Login auch Suche und „Musik zum
  Thema“, also der Soundtrack des offenen Spiels). Läuft Musik, leuchtet es
  gelb; oben links steht klein, welcher Song spielt. Die Musik pausiert bei
  YouTube-Videos und wenn die App im Hintergrund liegt.
- **Atmosphäre** – Marcos Bild vom Innenraum der Spielhalle hinter dem
  Katalog (`public/gaming/arcade-innen.webp`), blinkende Automatenlichter,
  CRT-Effekte, ein kleiner halb durchsichtiger Mampf-Roboter mit einem Käfer
  hinterher, der unter den Knöpfen kreuz und quer läuft und Punkte frisst
  ([`components/MuncherWander.tsx`](components/MuncherWander.tsx), eigene
  Figuren statt Pac-Man, aus bei
  „Bewegung reduzieren“). Nach einer Minute ohne Eingabe startet der Attract
  Mode wie bei alten Automaten
  ([`components/AttractMode.tsx`](components/AttractMode.tsx)).
- **Club verlassen** – ein Tür-Knopf oben in der Kopfleiste führt zurück auf
  die Straße; die Musik ist dann wieder nur dumpf durch die Wand zu hören.
- **Kopfleiste** – Coins (ein Tipp öffnet die Quests), Punktestand (SCORE),
  entdeckte Perlen, Ton, Zahnrad und der rote Feedback-Knopf.

### Spiele finden

- **Kuratierter Katalog** – 44 handverlesene Spiele mit eigenen Tipps
  ([`data/games.ts`](data/games.ts)), dazu die „Urzeit“ der 70er (Pong,
  Breakout, Combat, Space Invaders, Asteroids, Galaxian) als eigenes Jahrzehnt.
- **Live-Archiv** – jeder Filter wird zusätzlich über die
  Wikipedia-Kategorien („Game Boy games“, „1991 video games“ …) mit Hunderten
  Spielen gefüllt, 48 pro Seite mit „Mehr Spiele laden“
  ([`lib/archive.ts`](lib/archive.ts)).
- **Filter** – eine wischbare Zeile mit den Jahrzehnten (70er bis 2020er),
  nach Wahl eines Jahrzehnts eine zweite Zeile mit den einzelnen Jahren.
- **Konsolen-Regal** – 36 Systeme von Atari 2600 bis Switch mit Fotos von
  Wikimedia Commons, nach Hersteller sortiert, mit Suchfeld, das auch
  Spitznamen wie „PS2“, „N64“ oder „Genesis“ versteht
  ([`components/ConsolePicker.tsx`](components/ConsolePicker.tsx),
  [`data/platforms.ts`](data/platforms.ts)).
- **Suche** – findet jedes Spiel mit Wikipedia-Artikel, Spiele mit dem Begriff
  im Titel zuerst, verwandte auf Wunsch. Alte Cheats in der Suche lösen
  Easter Eggs aus.
- **Insert Coin** – ein Zufallsfund; die Münze lässt sich auch von Hand in den
  Schlitz ziehen ([`components/CoinDrop.tsx`](components/CoinDrop.tsx)).
- **Heute vor X Jahren** – unter der Suche jeden Tag ein bekanntes Spiel, das
  an diesem Datum erschienen ist, aus Wikidata
  ([`lib/onThisDay.ts`](lib/onThisDay.ts)).
- **Eigene Pixelbilder statt Cover** – Cover gehören den Spielefirmen. Die 44
  Katalogspiele haben je eine selbst gezeichnete Szene ihrer Spielwelt, ohne
  bekannte Figuren oder Logos; alle anderen bekommen eine automatisch gebaute
  Szene (Weltraum, Rennstrecke, Burg, Fußballplatz …), deren Thema aus dem
  Titel geraten wird ([`lib/coverArt.ts`](lib/coverArt.ts),
  [`components/PixelCover.tsx`](components/PixelCover.tsx)). Am Handy liegen
  zwei Karten nebeneinander.

### Die Spieleseite

- **Modul einlegen** – tippst du eine Karte an, schwebt das Modul heran, wird
  mit Rums und Klick in den Schacht gedrückt, die Lampe geht an, der Fernseher
  schaltet sich ein und die Seite „bootet“
  ([`components/CartInsert.tsx`](components/CartInsert.tsx)). Per Wischen
  oder ◄ ► geht es zum nächsten Spiel der Liste.
- **Überblick** – Wikipedia-Text, kuratierte Tipps und Links zu Longplays,
  GameFAQs, MobyGames, Kultboy und Handbüchern im Internet Archive.
- **KI-Guide** – ein Guide mit Google-Websuche und Quellenangaben
  (`gameGuide` in `api/gemini.js`).
- **Videos** – das beliebteste YouTube-Video zum Spiel startet automatisch
  (stumm bei Ton aus), weitere im Reiter „Videos“; gesucht wird mit Titel und
  Jahr, Videos zu Nachfolgern fliegen raus (`api/youtube.js`,
  [`lib/youtube.ts`](lib/youtube.ts)).
- **Musik & TV-Werbung** – Soundtrack und alte Fernsehspots von YouTube.
- **Zeitschriften & heute** – sucht auf Knopfdruck die Testwertungen von
  damals (Power Play, ASM, Amiga Joker, Video Games, Mega Fun, Man!ac, EGM …),
  legale Wege, das Spiel heute zu spielen, und Level-Passwörter, mit Quellen
  (`gamePress` in `api/gemini.js`).
- **Fakten & Geheimnisse** – Steckbrief aus Wikidata (CC0: Entwickler,
  Designer, Komponist, Erscheinungsdaten, Reihe, Auszeichnungen,
  Verkaufszahlen, Altersfreigaben) mit Testwertungen, der ganze
  Wikipedia-Artikel in Kapiteln (CC BY-SA 4.0, deutsch oder englisch,
  Entwicklung, Musik und Kontroversen mit ★ oben) und Links in
  Spieledatenbanken wie The Cutting Room Floor, MobyGames, Lemon64 oder VGMdb
  ([`components/GameFacts.tsx`](components/GameFacts.tsx),
  [`lib/facts.ts`](lib/facts.ts)).
- **Screenshots** – nur frei lizenzierte Bilder von Wikimedia Commons, keine
  geschützten Screenshots oder Packungsbilder.
- **„Hatte ich damals“** – ein Knopf legt Spiel oder Konsole ins eigene Regal
  neben dem Stash; es kommt mit ins Google-Backup.

### Spielen und sammeln

- **Retro-Guru** – ein Chat, der in Gamer-Slang von den 80ern bis heute
  antwortet („Welches Game, Digga?“, „GG“, „no cap“)
  ([`components/GuruChat.tsx`](components/GuruChat.tsx)).
- **Chill-Ecke** – Minispiele per Touch und Tastatur: Pixel-Memory,
  Schiebepuzzle, Farbecho, Sudoku (immer neue Rätsel mit genau einer Lösung),
  Blockstapler, Flipper, Pac-Mampf, Mauerbrecher, Snake, Weltraum-Invasion und das
  Quiz „Erkennst du das Spiel?“ (bis zu fünf Coins am Tag)
  ([`components/MiniGames.tsx`](components/MiniGames.tsx),
  [`components/minigames/`](components/minigames/)).
- **Kartenspiele** – Video-Poker („Jacks or Better“, 20 Hände), Blackjack
  (10 Hände, Bank bleibt ab 17 stehen) und Solitär (Klondike, eine Karte
  ziehen, unbegrenztes Zurück, automatisches Ablegen am Ende). Gespielt wird
  nur um Spielgeld; Poker und Blackjack kommen auf die Highscore-Tafel,
  Solitär zählt die Bestzeit. Ein gemeinsames HTML-Kartendeck ohne Bilder
  ([`components/minigames/cards.tsx`](components/minigames/cards.tsx)).
- **Highscore-Tafel** – nach einer guten Runde trägst du wie am Automaten drei
  Buchstaben ein; die Top 10 gelten für alle Spieler (`api/highscores.js`,
  Upstash Redis; ohne Datenbank bleibt die Tafel auf dem Gerät).
- **Quests und Preis-Tresen** – jeden Tag drei kleine Aufgaben und eine
  größere pro Woche. Sie bringen Coins für Designs (Vaporwave, Virtual Boy),
  Hallen-Musik (Weltraum, Bosskampf) und das Party-Logo
  ([`lib/quests.ts`](lib/quests.ts),
  [`components/QuestBoard.tsx`](components/QuestBoard.tsx)).
- **Easter Eggs** – zehn Geheimnisse (IDDQD, Rosebud oder XYZZY in der Suche,
  Konami-Code, den Mampf-Roboter fangen, aufs Logo klopfen, den Guru nach dem Sinn des
  Lebens fragen, nachts vorbeischauen …), jedes bringt einmal Coins; die Liste
  mit Tipps steht unter „Quests“ ([`lib/eggs.ts`](lib/eggs.ts)).
- **Erfolge, Sammlung und Stash** – Erfolge erscheinen als runde Pokal-Leiste
  mit weichem „Plopp“; Bereiche Katalog, Kisten, Stash, Trophäen, Chillen und
  Quests liegen in der Leiste unten.
- **Am Handy spürbar** – kurzes Rütteln beim Münzeinwurf, beim Öffnen der Tür,
  bei Erfolgen und Käufen (Android, schaltet sich mit den Soundeffekten ab).

### Einstellungen und Konto

- **Design wählbar** unter „Bildschirm“: „Arcade“ (Standard, dunkler
  Pixel-Look mit Neonfarben), „Modul“ (mit Google Stitch entworfen: helles
  Konsolen-Plastik, weiße Modul-Karten, Vorlage in
  [`docs/stitch/gaming/DESIGN.md`](../docs/stitch/gaming/DESIGN.md)), dazu
  „Handheld“ und „Bernstein“ und die am Tresen gekauften Designs.
- **Musik und Ton** – Hallenmusik (Spotify-Metal oder Chiptune-Stück),
  Musik-Lautstärke (Start bei der Hälfte), Soundeffekte, gemeinsamer
  Stummschalter.
- **Sprache** – amerikanisches Englisch als Standard, Deutsch wählbar; auch
  Guru und KI-Guide antworten in der gewählten Sprache.
- **Meine Daten** – unter „Datenschutz“ lädt „Meine Daten“ alles, was die
  App im Browser gespeichert hat, als Datei herunter, „Alles löschen“ entfernt
  es von diesem Gerät ([`lib/myData.ts`](../lib/myData.ts)).
- **Profil und Cloud-Sicherung** – Sammlung, Erfolge, Highscore, Coins und
  Vorlieben liegen im `localStorage`. Mit Google-Login sichert die App sie
  zusätzlich als `retromind-gaming.json` im privaten Drive-`appDataFolder` und
  führt die Stände mehrerer Geräte zusammen
  ([`lib/useCloudSync.ts`](lib/useCloudSync.ts)). Ohne Anmeldung steht
  deutlich da, dass die Coins nur auf diesem Gerät liegen.
- **Feedback** – roter Knopf mit Briefsymbol; läuft über dieselbe
  `/api/feedback` wie die Zeitreise und ist in Mail und `feedback.md` mit
  „(Gaming)“ markiert.
- **Version** – unten in den Einstellungen „Version 2.<PR-Nummer> (<Commit>)“.
- **Neu laden bleibt auf der Seite** – Halle oder Eingang, Reiter, Filter,
  Suche und ein offenes Spiel bleiben beim Neuladen erhalten
  ([`lib/pageMemory.ts`](../lib/pageMemory.ts)).
- **Als App installierbar** – Manifest, Icons und Service Worker in
  `public/gaming/`; im Hub gibt es dafür einen „Als App“-Knopf, wo der Browser
  das kann. Steuerung auch per Pfeiltasten und Gamepad.

### Datenschutz

Kein Tracking, eingebaute Schriften. Der Retro-Guru sagt, dass er eine KI
ist (Google Gemini, nach Googles Regeln ab 18), und die Highscore-Tafel macht
aus beleidigenden Kürzeln „XXX“. Wikipedia, Wikidata, Commons und andere
Quellen holt [`api/proxy.js`](../api/proxy.js), der Browser spricht nie direkt
mit ihnen. Spotify und YouTube laden erst nach Zustimmung (widerrufbar in den
Einstellungen). Datenschutzerklärung und Impressum liegen auch auf dieser
Domain unter `/datenschutz.html` und `/impressum.html` (englisch
`privacy.html`, `imprint.html`). Der Adminbereich `/admin/` zählt anonym und
ist auch hier über fünf Tipps auf die Überschrift „Einstellungen“ erreichbar.

## Aufbau

- `gaming/index.html` ist eine zweite Vite-Seite im Repo, ausgeliefert unter
  `/gaming/`. Einstieg [`main.tsx`](main.tsx), App
  [`GamingApp.tsx`](GamingApp.tsx), Styles [`gaming.css`](gaming.css).
- `components/` (Eingang, Spieleseite, Guru, Minispiele …), `lib/` (Musik,
  Archiv, Fakten, Quests, Eggs …), `data/` (Katalog und Plattformen).
- Gemeinsam mit der Zeitreise: `api/` (Gemini, Proxy, YouTube, Spotify,
  Highscores, Statistik, Feedback), [`lib/i18n.ts`](../lib/i18n.ts),
  [`lib/mute.ts`](../lib/mute.ts), [`lib/googleLogin.ts`](../lib/googleLogin.ts),
  [`lib/musicVolume.ts`](../lib/musicVolume.ts), der Musik-Player
  ([`components/MusicDock.tsx`](../components/MusicDock.tsx)).

## Lokal ausführen

```bash
npm install
npm run dev        # dann http://localhost:3000/gaming/
npm run dev:full   # mit den /api-Funktionen (vercel dev)
```

## Deployment

Das Vercel-Projekt `retromind-gaming` baut dasselbe Repo mit der Variable
`RETROMIND_EDITION=gaming`; [`scripts/edition.mjs`](../scripts/edition.mjs)
legt dann die Gaming-Seite unter `/` ab. Das Projekt braucht eigene Variablen:

| Variable | Zweck |
| --- | --- |
| `RETROMIND_EDITION=gaming` | Gaming-Seite als Startseite |
| `GEMINI_API_KEY` | Retro-Guru, KI-Guide, Zeitschriften-Suche |
| `VITE_GOOGLE_CLIENT_ID` | Optional: Google-Login und Cloud-Sicherung (Domain als erlaubter JavaScript-Ursprung im OAuth-Client) |
| `VITE_SPOTIFY_CLIENT_ID` | Optional: Spotify-Login (Redirect-URI `https://retromind-gaming.vercel.app/`) |
| `YOUTUBE_API_KEY` | Optional: Videosuche nach Likes sortiert |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Optional: Upstash Redis für Highscores und Statistik (dieselbe Datenbank wie `retromind`) |

Alle Variablen erklärt die [Haupt-README](../README.md#deployment-vercel).

## Bekannte Einschränkungen

- **Spotifys eingebetteter Player** lässt sich nicht leiser stellen und nicht
  einblenden; das geht nur mit Premium am Computer.
- **Bilder** sind eigene Pixelszenen oder frei lizenziert; echte Cover und
  Screenshots zeigen wir aus Lizenzgründen nicht.
- **The Cutting Room Floor** lässt unseren Abruf nicht durch, deshalb gibt es
  dort nur einen Link.

## Ideen und offene Punkte

Feedback-To-Dos stehen in der [Haupt-README](../README.md#to-do).

### Muss

- Zurzeit nichts.

### Sollte

- **Weitere Gaming-Stitch-Screens umsetzen:** Trophäen-Schrank mit
  Fortschrittsbalken und Seltenheit, Spieleseite mit großem Screenshot oben und
  „Frag den Game-Guru“-Leiste (Entwurf in `docs/stitch/gaming/`).
- **Mehr Spiele im kuratierten Katalog** mit eigenen Tipps.
- **Eigene Domain** (kostet Geld, erst nach Rücksprache).

### Könnte

- **Ganze Songs in der Halle auf dem Handy:** Wie die Zeitreise könnte die
  Halle mit Spotify Premium auf dem Handy über die eigene Spotify-App
  spielen (`lib/spotifyConnect.ts`); dafür bräuchte die Tür-Musik mit ihrem
  gedämpften Klang einen anderen Weg, denn die App lässt sich nicht dämpfen.
- **Versteckte Inhalte von The Cutting Room Floor direkt zeigen:** Die Texte
  dort stehen unter CC BY 3.0 und passen zu „Fakten & Geheimnisse“
  (unbenutzte Level, Debug-Menüs, Botschaften der Entwickler). Der Server von
  tcrf.net lässt unseren Abruf aber nicht durch; dafür bräuchte es eine
  Freigabe der Betreiber.
- **Mehr eigene Szenen für das Archiv:** Oft angeschaute Archivspiele könnten
  wie die Katalogspiele ein von Hand gezeichnetes Pixelbild bekommen.
- **Mehr Easter Eggs**, z. B. in Spieleseiten oder Minispielen.
- **Mehr Preise am Tresen:** geheime Minispiele, Deko für die Halle (Poster,
  Neonschilder, ein Flipper im Hintergrund) und ein „Cheat“, der ein
  vergessenes Spiel als Geheimtipp aufdeckt.
- **Mehr Minispiele in der Chill-Ecke**, Sudoku in mehreren
  Schwierigkeitsstufen und die Bestwerte mit in die Cloud-Sicherung nehmen.
- **Mehr Kartenspiele:** Mau-Mau oder Texas Hold’em gegen Computer-Gegner,
  Teilen beim Blackjack, Solitär mit drei Karten ziehen oder Spider.
