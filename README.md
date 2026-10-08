# RetroMind

**Zeitreise: https://retromind.vercel.app** · **Gaming-Edition: https://retromind-gaming.vercel.app**

RetroMind ist eine interaktive, KI-gestützte Reise durch die eigene
Vergangenheit. Die App führt Jahrzehnt für Jahrzehnt (1960–2010) zurück,
stellt persönliche Erinnerungsfragen, **sammelt die Antworten** und fasst sie
zu einem exportierbaren **Erinnerungs-Buch** zusammen. Die Gaming-Edition
macht dasselbe für Videospiele von den 1980ern bis heute.

Alle Änderungen an der App stehen in der [CHANGELOG.md](CHANGELOG.md).

## Wofür es RetroMind gibt

- **Erinnerungen wecken:** Bilder, Stichworte, Musik und Fragen aus der
  eigenen Kindheit und Jugend holen Dinge zurück, an die man lange nicht
  gedacht hat.
- **Erinnerungen festhalten:** Was dabei hochkommt, wird nicht nur erzählt,
  sondern aufgeschrieben und landet in einem Buch, das man ausdrucken,
  verschenken oder weitergeben kann.
- **Wiederentdecken:** Die Gaming-Edition hilft, vergessene Spiele von
  damals wiederzufinden, mit Bildern, Hintergründen, Tipps und Links zum
  Weiterspielen oder Anschauen.

## Warum RetroMind entwickelt wurde

RetroMind ist ein eigenständiges Projekt von Marco Schlude, ursprünglich in
Google AI Studio als Prototyp entstanden und im Umfeld der Sm@rt-App-Familie
zu einer vollständigen App ausgebaut. Die Idee: Erinnerungen gehen verloren,
wenn niemand nachfragt. Eine App, die gezielt und persönlich nachfragt, den
Ton und die Musik der jeweiligen Zeit trifft und das Ergebnis als Buch
festhält, macht aus Nostalgie etwas Bleibendes. Dabei gilt: Die Daten gehören
den Nutzer:innen. Alles bleibt zuerst auf dem eigenen Gerät, eine Sicherung im
eigenen Google Drive ist freiwillig, und es gibt keinen zentralen Speicher.

## Was RetroMind kann

### Zeitreise

- **Geführte Reise in 7 Phasen** – `intro → onboarding → induction → exploration → diary → book → finish`
  mit Fortschrittsanzeige und freier Navigation zwischen den Phasen.
- **Wegweiser zur Gaming-Zone** – auf der Startseite steht in allen Designs
  ein Holzwegweiser „To the gaming zone“, ein Klick führt zu RetroMind –
  Gaming und nimmt Ton- und Google-Einstellung mit
  ([`components/GamingSignpost.tsx`](components/GamingSignpost.tsx)).
- **Etappen frei wählen** – sobald eine Reise begonnen ist, zeigt die Startseite
  „Deine Etappen“: Profil, Eindrücke, Erkunden, Tagebuch, Erinnerungsbuch und
  Abschluss als Kacheln, jede jederzeit antippbar, die zuletzt besuchte markiert
  ([`components/JourneyStages.tsx`](components/JourneyStages.tsx)). Im Design
  Retro Warm sind auch die Stationen in „Station x von 7“ antippbar.
- **Stationen-Auswahl unter dem Logo** – in den Designs Klassisch und
  Nachtschicht steht während der Reise unter dem kleinen Logo eine schmale
  Leiste „Station x von 7: …“. Erst ein Tipp darauf klappt alle sieben
  Stationen auf, ein weiterer Tipp springt direkt dorthin
  ([`components/StationPicker.tsx`](components/StationPicker.tsx)).
- **Personalisiertes Onboarding** – Name, Geburtsdatum, optional Geschlecht,
  Interessen und Lieblingsmusiker:innen (freie Eingabe). Das Kindheits-
  Jahrzehnt wird berechnet (das Jahrzehnt, in dem du etwa 8 warst) und auf
  1960–2010 begrenzt. Die Einstimmung nennt dazu dein Geburtsjahr und deine
  ungefähren Grundschuljahre und sagt ehrlich, wenn dein Jahrzehnt noch
  fehlt und RetroMind deshalb beim nächstgelegenen startet. Alles selbst
  angegeben – RetroMind "verifiziert" kein Alter/Geschlecht über Dritte,
  weil keiner der Logins (Google, Spotify) das überhaupt hergibt.
- **Jahrzehnt-Impressionen** – kuratierte Zeit-„Postkarten“ je Dekade
  ([`constants.ts`](constants.ts)); wo ein echtes gemeinfreies Bild hinterlegt ist
  (z. B. NASA-Mondlandung), wird es gezeigt, sonst greift eine typografische Karte.
  Ehrlich als *symbolische Impressionen* gekennzeichnet.
- **Erinnerungs-Wand** – Stichworte aus fünf Jahrzehnten, sortiert nach deinen
  Interessen. Pro Stichwort eine **KI-generierte persönliche Frage** und ein
  Antwortfeld – **mit Spracheingabe** (Web Speech API) wo verfügbar. Antworten
  landen automatisch im Buch. Aufgeteilt in **Sparten** (Musik, Technik,
  Spielzeug, Alltag & Mode, Naschen & Essen, Foto-Labor): Die Übersicht zeigt
  nur Kacheln, eine Sparte öffnet sich erst beim Antippen, mit ihren Dingen
  Jahrzehnt für Jahrzehnt, deins zuerst. Unterwegs ist das Logo oben nur noch
  klein.
- **Memory-Labor** – eigene Sparte „📷 Foto-Labor“; altes Foto hochladen (client-seitig verkleinert), von
  **Gemini** beschreiben lassen und die Beschreibung als Erinnerung übernehmen;
  optional per **Veo** zu einem kurzen Video animieren (benötigt Google-Billing).
- **Echte Hits dieser Dekade** – Ära-Wahl und Spotifys offizielle „All Out …“-
  Playlist der gewählten Dekade als Embed, plus UI-Sounds. Sobald man einmal
  irgendwo klickt/tippt (Browser verlangen diese Interaktion, bevor Ton laufen
  darf) und die Startseite nach dem Gong erscheint, spielt sofort die Playlist
  automatisch im Hintergrund, Lied für Lied in zufälliger Reihenfolge (der
  Spotify-Player kann kein Shuffle, deshalb liest
  [`api/spotify-tracks.js`](api/spotify-tracks.js) die Titelliste der
  Playlist, ohne sie fängt sie wie früher oben an) – streamt direkt von
  Spotify (wird nie von uns gehostet) und in Spotifys eigener, von uns nicht
  regelbarer Lautstärke, da die Embed-API dafür keine Schnittstelle bietet.
  Ganz unten in der Mitte sitzt ein kleines schwarz-blaues **Metall-Symbol**
  ([`components/MusicDock.tsx`](components/MusicDock.tsx)): in „Retro Warm“
  mitten in der unteren Leiste, in den anderen Designs ganz unten links neben
  dem Einstellungen-Knopf ⚙️ (wie dieser erst, wenn man ganz nach unten
  scrollt). Solange Musik läuft, leuchtet es gelb. Ein Druck darauf öffnet die **Musiksteuerung** über die halbe
  Seite: welche Musik und welcher Song gerade läuft, Zurück, Play/Pause und
  Weiter als Symbole und ein Knopf für Ton an/aus. Weiter spielt den nächsten
  Zufallssong, Zurück den Song davor. Ton an/aus gibt es auch in den
  Einstellungen. Lange Songtitel werden kleiner geschrieben und laufen, wenn
  das nicht reicht, als Laufschrift durch. Solange Musik läuft, steht oben
  links in kleiner Schrift, welcher Song gerade spielt (auch in der
  Gaming-Halle). Ein Tipp darauf öffnet ebenfalls die Musiksteuerung.
- **Nostalgie-Begleiter** – Chat auf Gemini-Basis, mit echtem Gesprächsverlauf.
- **Erinnerungs-Buch** – formatierte Zusammenfassung aller Erinnerungen + freier
  Notiz. Export als **PDF (Druckdialog)**, **Textdatei** oder **`.json`-Sitzung**;
  `.json` lässt sich auf einem anderen Gerät wieder laden.
- **Fortsetzen** – die komplette Sitzung liegt im `localStorage`; ein Reload bietet
  „Weitermachen“ an.
- **Google-Login (optional)** – „Mit Google anmelden“ sichert die Reise zusätzlich
  im **eigenen Google Drive** der Nutzer:in (privater `appDataFolder`, nur für
  RetroMind, für niemand sonst sichtbar). Kein zentraler Server-Speicher: jede
  Person hat ihre eigenen Erinnerungen in ihrem eigenen Konto (**dezentral**) und
  kann so auf einem anderen Gerät weitermachen. Mit Google angemeldet entfällt
  die Start-Abfrage von Name und Geburtsdatum, sobald beides bekannt ist (Name
  aus dem Google-Profil, Geburtstag und Geschlecht über die People API, falls
  freigegeben, sonst aus der Drive-Sicherung);
  ändern lässt es sich in den Einstellungen unter „Deine Angaben“. Ohne Google
  fragt die App beim ersten Mal; danach bleiben die Angaben auf dem Gerät und
  die Abfrage entfällt bei jedem weiteren Besuch.
- **Spotify-Login (optional)** – „Mit Spotify anmelden“ (Authorization Code +
  PKCE, komplett clientseitig, kein eigener Auth-Server) holt Name und
  Premium-/Free-Status ab. Mit **Spotify Premium** läuft die Musik
  (Zeitreise und Gaming-Halle) über Spotifys eigenen Browser-Player
  ([`lib/spotifyPremium.ts`](lib/spotifyPremium.ts), Web Playback SDK): ganze
  Songs, und die Musik wird beim Start und beim Fortsetzen über etwa
  6 Sekunden langsam lauter. Ohne Premium, ohne Anmeldung, auf Handy und Tablet (iPhone, iPad, Android)
  oder wenn Spotifys Player nicht startet, bleibt es beim eingebetteten
  Player. Kommt über Spotifys Player nach dem Start kein Song (Spotify lehnt
  das Abspielen ab oder es bleibt still), übernimmt nach spätestens etwa
  10 Sekunden von selbst der eingebettete Player. In der Gaming-Edition liegt die Anmeldung in den Einstellungen unter
  „Hallenmusik“. Ohne konfigurierte Spotify-Client-ID bleibt der Button
  unsichtbar.
- **Mehr Musik mit Spotify-Login** – Angemeldet bietet der Musik-Player
  (Zeitreise und Gaming) eine Suche nach Songs, Alben und Künstler:innen,
  einen Fortschrittsbalken zum Springen und mit Premium Lautstärkeregler,
  Albumcover und Vor/Zurück innerhalb von Alben
  ([`lib/spotifyApi.ts`](lib/spotifyApi.ts), [`components/MusicDock.tsx`](components/MusicDock.tsx)).
  „Musik zum Thema“ spielt von selbst Passendes: Musik-Begriffe der Zeitreise
  ihren Hit (Feld `song` in `constants.ts`), Spiele in Gaming ihren
  Soundtrack. Beim Schließen läuft wieder die normale Musik.
- **Barrierefreiheit** – Schriftgrößen-Umschalter (A / A+ / A++), größere Grund-
  schrift, Fokus-Ringe, Tastatur-/Esc-Bedienung und Fokus-Falle in Dialogen,
  `prefers-reduced-motion`, ARIA-Labels.
- **Feedback-Button** – ein roter Knopf mit Briefsymbol und der Aufschrift
  „Feedback“ direkt auf der Startseite oben (im Design „Retro Warm“ in der
  Kopfleiste, in den anderen Designs oben rechts neben dem Lautsprecher, am
  Handy oben links, jeweils schon vor der Anmeldung)
  kann jede Nutzer:in Lob, Tadel, Vorschläge oder Wünsche zur App hinterlassen; die Nachricht kommt per E-Mail
  an die Betreiber:in an (optional: eigene E-Mail-Adresse für eine Antwort).
  Zusätzlich wird jedes Feedback (ohne E-Mail-Adresse) in
  [feedback.md](feedback.md) gespeichert. Ein Link in der Mail übernimmt es
  nach Zustimmung als To Do unten in diese README.
  Ohne konfigurierten Versand (siehe unten) meldet der Button, dass Feedback
  hier nicht zugestellt werden kann.
- **Datenschutz-Hinweis** im Intro; **Error Boundary** gegen weiße Seiten.

- **„Was ist neu?“** – in den Einstellungen; zeigt die Einträge der
  [CHANGELOG.md](CHANGELOG.md) direkt in der App ([`lib/whatsNew.ts`](lib/whatsNew.ts)),
  ein roter Punkt am Zahnrad meldet Neues seit dem letzten Blick.
- **Willkommens-Bildschirm** – „Welcome to RetroMind“ vor einer alten
  Kaminuhr, die laut und zweimal pro Sekunde tickt. Der „Go back...“-Knopf trägt den Look des
  gewählten Designs, steht leicht schräg und blitzt ab und zu auf; ein Druck darauf schlägt einen großen Gong, der
  Bildschirm wird weiß und geht langsam in die App über. Alles synthetisiert
  ([`lib/clockSounds.ts`](lib/clockSounds.ts)) und still, wenn der Ton aus
  ist. Lässt der Browser noch keinen Ton zu, tickt die Uhr ab dem ersten
  Antippen (auch auf dem Handy, auch mit dem Stumm-Schalter des iPhones). In
  den Einstellungen führt „Zurück zum Willkommensbildschirm“ jederzeit wieder
  dorthin; die Musik pausiert so lange und spielt danach weiter.
- **Kopfbereich mit Logo** – Marcos 8-Bit-Logo mit durchsichtigem Hintergrund
  und dem Untertitel „… willkommen zurück in der Vergangenheit“, im selben
  Röhrenbildschirm-Look (Scanlines, Schleier) wie die ganze App.
- **Design wählbar** – in den Einstellungen unter „Design & Atmosphäre“:
  - **Retro Warm** (Standard, entworfen mit Google Stitch, Vorlage in
    [`docs/stitch/DESIGN.md`](docs/stitch/DESIGN.md)): Pergament und
    Terrakotta, Schriften Epilogue und Plus Jakarta Sans, runde Karten und
    Knöpfe, kein Flimmern. Eigener App-Aufbau: Kopfleiste mit Logo,
    Tonband-Schalter, Feedback, Einstellungen und Konten, untere Navigation (Start,
    Zeitreise, Musik-Symbol, Erkunden, Erinnerung), Reise-Fortschritt „Station x von 7“,
    Startseite mit Jahrzehnt-Überblick und Archiv-Fundstücken, „Erkunden“ als
    Karten pro Jahrzehnt ([`components/WarmChrome.tsx`](components/WarmChrome.tsx)).
  - **Klassisch**: vergilbtes Papier mit Röhrenbildschirm-Look.
  - **Nachtschicht**: dunkel mit warmem Röhrenglühen.

  Die Wahl gilt sofort und bleibt im Browser gespeichert
  ([`lib/theme.ts`](lib/theme.ts)); Farben stehen in [`index.css`](index.css).
  Das gedruckte Erinnerungs-Buch bleibt immer im klassischen Papier-Look.

### Edition „RetroMind – Gaming“ (`/gaming/`)

Eigene Seite im selben Projekt: vergessene Videospiele von den 1980ern bis heute wiederentdecken.
Im Katalog filterst du nach Jahrzehnt (80er bis 2020er) und darin nach einem
einzelnen Jahr, dazu nach Konsole.
Kuratierter Katalog ([`gaming/data/games.ts`](gaming/data/games.ts)) plus ein
Live-Archiv ([`gaming/lib/archive.ts`](gaming/lib/archive.ts)), das jeden Filter
über die Wikipedia-Kategorien („Game Boy games“, „1991 video games“ …) mit
Hunderten Spielen füllt; die Plattformen (mit Hersteller-Regal und Foto für
die Konsolenauswahl in `gaming/components/ConsolePicker.tsx`) stehen in
[`gaming/data/platforms.ts`](gaming/data/platforms.ts). Dazu Suche
nach beliebigen Spielen, Wikipedia-Texte und -Screenshots live (über `api/proxy.js`),
kuratierte Tipps, ein KI-Guide mit Google-Websuche und Quellenangaben
(`gameGuide` in `api/gemini.js`), der „Retro-Guru“-Chat und Links zu
Longplays, GameFAQs, MobyGames und Internet Archive. Auf jeder Spieleseite
startet automatisch das beliebteste YouTube-Video zum Spiel (stumm, wenn der
Ton aus ist), weitere stehen im Reiter „Videos“ (`api/youtube.js`, optional
mit `YOUTUBE_API_KEY`). Zum Start ein Eingang: die verranzte „Arcade Hallen“
(Marcos Bild, `public/gaming/arcade-hallen.webp`) mit flackernder
Leuchtschrift und einer wackelnden Glühbirne unter dem Vordach. Dazu hörst
du leise, gedämpft durch die Wand, den Bass und die Drums der Metal-Musik aus
der Halle
(`gaming/lib/street.ts`, `gaming/components/Entrance.tsx`; der Browser spielt
den Ton ab der ersten Berührung). „ENTER“ (ein Knopf im Look der Metalltür) öffnet die Tür mit langem Knarzen, beim
Zugehen wird ein Fiepen der Automaten immer lauter, das Logo leuchtet aus dem Eingang,
das Bild wird weiß und der Katalog erscheint, begleitet von einem
80er-Heavy-Metal-Intro mit zwei verzerrten Gitarren links und rechts, Bass,
Solo, Schlagzeug und Hall. Es wird vorab in einem kleinen „Studio“
(`gaming/lib/metalBand.ts`, aufgenommen mit `node scripts/render-metal.mjs`)
als Datei aufgenommen (`public/gaming/audio/`), damit es auch am Handy
sauber klingt (`gaming/lib/metal.ts`). Hast du
Spotify erlaubt, läuft in der Halle nach dem Intro echter Heavy Metal der
80er von Spotify (Playlist „The 100 Best Metal Songs of 80s“, über denselben
Spotify-Player wie die Zeitreise, [`gaming/lib/useHallSpotify.ts`](gaming/lib/useHallSpotify.ts)), Lied für Lied in zufälliger Reihenfolge.
Bist du in Gaming mit Spotify Premium angemeldet (Browser am PC), läuft
dieselbe Spotify-Musik schon vor der Tür leise und wird beim Eintreten laut;
das Intro entfällt dann. Dumpf machen lässt sich Spotify nicht, nur leiser.
Unten in der Mitte, zwischen „Nach oben“ und dem Guru, öffnet dasselbe
schwarz-blaue Metall-Symbol wie in der Zeitreise die Musiksteuerung (Song,
Zurück, Play/Pause, Weiter, Ton an/aus), nur mit einem Blitz statt einer Note.
Läuft Musik, leuchtet es gelb.
Beim ersten Besuch fragt die Halle einmal nach („Metal erlauben“ oder „Lieber
Chiptune“); in den Einstellungen unter „Hallenmusik“ lässt sich jederzeit
zwischen Spotify-Metal und den Chiptune-Stücken wechseln. Die Musik folgt dem
gemeinsamen Stummschalter, pausiert bei YouTube-Videos und im Hintergrund. Drinnen liegt
hinter dem Katalog Marcos Bild vom Innenraum der Spielhalle
(`public/gaming/arcade-innen.webp`). Über dem Katalog wandert ganz klein,
durchsichtig und langsam ein Pac-Man mit Geist kreuz und quer zu zufälligen
Punkten und frisst die Punktereihe auf dem Weg
(`gaming/components/PacmanWander.tsx`; nicht antippbar, abgeschaltet bei
„Bewegung reduzieren“). Dazu
CRT-Effekte, synthetisierte Chiptune-Musik (abschaltbar per Lautsprecher-Knopf;
sie und das Metal-Intro beginnen leise und werden über etwa 6 Sekunden lauter),
Erfolge, Sammlung, Konami-Code
und Gamepad-Steuerung. Alle Texte und der Retro-Guru sprechen Gamer-Slang von
den 80ern bis heute („Welches Game, Digga?“, „Epic Fail“, „GG“, „no cap“). Lässt sich als eigenständige App installieren
(Manifest, Icons und Service Worker in `public/gaming/`); die Zeitreise
verlinkt auf der Startseite (Wegweiser „To the gaming zone“) und in den Einstellungen dorthin.
Das Profil (Sammlung, Erfolge, Highscore, Vorlieben) liegt im `localStorage`;
über das Zahnrad oben rechts (Einstellungen) sichert es ein optionaler
Google-Login zusätzlich als `retromind-gaming.json` im privaten
Drive-`appDataFolder`, führt die Stände mehrerer Geräte zusammen und übernimmt
beim Anmelden die Vorlieben des Kontos ([`gaming/lib/useCloudSync.ts`](gaming/lib/useCloudSync.ts)).
Eigene Adresse: das Vercel-Projekt `retromind-gaming` baut dasselbe Repo mit
`RETROMIND_EDITION=gaming`, wodurch `scripts/edition.mjs` die Gaming-Seite
unter `/` ausliefert (braucht dort ebenfalls `GEMINI_API_KEY`, für die
Cloud-Sicherung außerdem `VITE_GOOGLE_CLIENT_ID` und die Domain als erlaubten
JavaScript-Ursprung im Google-OAuth-Client).

**Design wählbar** – in den Gaming-Einstellungen unter „Bildschirm“ (oder per
Knopf in der Werkzeugleiste): „Arcade“ (Standard, dunkler Pixel-Look mit
Neonfarben), „Modul“ (mit Google Stitch entworfen: helles Konsolen-Plastik,
weiße Modul-Karten mit Griffrillen in der Konsolenfarbe, rote Tasten, gut
lesbare Schrift und eine Navigation unten mit Katalog, Kisten, Stash, Trophäen
und Chillen), dazu die Pixel-Looks „Handheld“ und „Bernstein“. Das Design-System liegt in
[`docs/stitch/gaming/DESIGN.md`](docs/stitch/gaming/DESIGN.md), die Regeln in
`gaming/gaming.css` (Abschnitt „Design Modul“).
**Feedback** – roter Knopf mit Briefsymbol und Aufschrift „Feedback“ in der Kopfleiste, unter Ton und Zahnrad. Läuft über dieselbe `/api/feedback` der
Zeitreise (von `retromind-gaming.vercel.app` aus per CORS an
`retromind.vercel.app`) und ist in Mail und `feedback.md` mit „(Gaming)“
markiert.
**Chill-Ecke** – über den lila Knopf oben unter „Insert Coin“: die
Minispiele klappen direkt darunter auf, zum Entspannen und per Touch spielbar: Pixel-Memory, Schiebepuzzle, Senso, Sudoku (immer neue Rätsel mit genau einer Lösung), Blockstapler im Tetris-Stil, Flipper und Pac-Mampf (eigenes Labyrinthspiel im Stil von Pac-Man, per Wischen oder Pfeiltasten)
([`gaming/components/MiniGames.tsx`](gaming/components/MiniGames.tsx), die größeren Spiele in
[`gaming/components/minigames/`](gaming/components/minigames/)). Töne
kommen vom Chiptune-Chip und folgen dem gemeinsamen Stummschalter, die
Bestwerte liegen im `localStorage`, das erste geschaffte Spiel bringt den
Erfolg „Chillmodus“.
**Quests und Preis-Tresen** – Reiter „Quests“ (im Modul-Design unten in der
Leiste): jeden Tag drei kleine Aufgaben in der Halle (z. B. Games entdecken,
Münze einwerfen, ein Minispiel schaffen, den Guru fragen) und eine größere
pro Woche. Jede geschaffte Quest bringt Spielmarken, die man am Preis-Tresen
gegen zusätzliche Designs (Vaporwave, Virtual Boy) und Hallen-Musik
(Weltraum, Bosskampf) eintauscht ([`gaming/lib/quests.ts`](gaming/lib/quests.ts),
[`gaming/components/QuestBoard.tsx`](gaming/components/QuestBoard.tsx)).
Der Marken-Stand steht immer oben in der Kopfleiste (ein Tipp darauf öffnet die
Quests). Marken und Gekauftes liegen im Profil und kommen mit dem Google-Backup mit.
Lokal: `npm run dev`, dann `http://localhost:3000/gaming/`.

### Für alle Module

- **Ein Stummschalter** ([`lib/mute.ts`](lib/mute.ts)) – ein Lautsprecher-Knopf
  schaltet jedes Modul stumm, auch über verschiedene Adressen hinweg
  (`?mute=1/0`). Neue Module nutzen denselben Schalter. Liegt die App im
  Hintergrund (andere App oder anderer Tab vorne), gilt sie automatisch als
  stumm und spielt beim Zurückkehren weiter.
- **Leiser Start mit Warnschild** ([`lib/startupFade.ts`](lib/startupFade.ts),
  [`components/LoudSign.tsx`](components/LoudSign.tsx)) – die ersten Klänge
  beim Öffnen (Uhr und Gong der Zeitreise, Bass vor der Tür, Tür und Intro in Gaming)
  steigen über etwa 10 Sekunden aus der Stille an, damit niemand angeschrien
  wird und Zeit bleibt, den Ton auszuschalten. Solange der Ton an ist, steht
  rechts neben dem Startknopf ein eingeschlagenes Holzschild „Warning, extreme
  loud!“. Bei Ton aus vergräbt es sich im Boden, bei Ton an kommt es wieder
  heraus.
- **„Nach oben“-Knopf** ([`hooks/useScrolledDown.ts`](hooks/useScrolledDown.ts)) –
  unten links, erscheint erst nach etwas Scrollen und bringt sanft zurück an den
  Seitenanfang. In der Zeitreise (alle Designs) und in der Gaming-Halle; er
  sitzt knapp über der unteren Leiste und verdeckt keine anderen Knöpfe.
- **Eine Google-Anmeldung** ([`lib/googleLogin.ts`](lib/googleLogin.ts)) –
  freiwillig, gilt für alle Module, öffnet nie ungefragt ein Fenster.
- **Lokal zuerst** – alle Daten liegen auf dem Gerät; die Cloud-Sicherung im
  eigenen Google Drive ist ein Angebot, keine Pflicht.
- **Datenschutz (DSGVO)** ([`lib/privacy.ts`](lib/privacy.ts)) – kein Tracking.
  Schriften sind eingebaut (`@fontsource`, keine Google Fonts). Wikipedia-Texte,
  Bilder, Vorschaubilder und Klänge von fremden Servern holt
  [`api/proxy.js`](api/proxy.js) (nur erlaubte Adressen, Vercel-CDN-Cache), der
  Browser spricht nie direkt mit ihnen. Spotify (Zeitreise und Gaming-Halle) und YouTube (Gaming)
  laden erst nach Zustimmung, widerrufbar in den Einstellungen; Googles
  Anmelde-Skript lädt erst, wenn jemand zum Anmelde-Knopf greift.
  [Datenschutzerklärung](public/datenschutz.html) und
  [Impressum](public/impressum.html) liegen als statische Seiten unter
  `/datenschutz.html` und `/impressum.html` auf beiden Domains und sind in der
  Fußzeile und in den Einstellungen verlinkt.

- **Adminbereich mit Nutzungszahlen** ([`admin/`](admin/AdminApp.tsx),
  [`api/stats.js`](api/stats.js), [`lib/usage.ts`](lib/usage.ts)) – unter
  `/admin/` auf beiden Domains, bewusst nirgends in den Apps verlinkt (nur
  direkt über die Adresse erreichbar). Zeigt für
  beide Editionen Besucher pro Tag, Besuche über 7/30/90 Tage und App-Starts
  insgesamt, als Balken und als Tabelle. Den Zugang prüft der Server: Das
  Google-Token muss zur App gehören und zu `ADMIN_EMAIL` (Standard
  marco.schlude@gmail.com). Gezählt wird anonym ohne Cookies: ein Einweg-Hash
  aus IP, Browser und einem Tageswert, der nach zwei Tagen gelöscht wird, landet
  in einem HyperLogLog-Zähler in Upstash Redis (kostenlos über den Vercel
  Marketplace). Ohne verbundene Datenbank zählt nichts, die App läuft normal.

## Architektur

```
Browser (React/Vite SPA)  ──fetch──▶  /api/gemini   (Vercel Function)  ──▶  Google Gemini / Veo
                          ──fetch──▶  /api/video    (Vercel Function)  ──▶  Veo-Download (streamt)
                          ──fetch──▶  /api/feedback (Vercel Function)  ──▶  Resend (E-Mail) + GitHub (feedback.md)
                          ──OAuth──▶  Google Identity Services          ──▶  Login + Drive-Access-Token
                          ──fetch──▶  Google Drive API (appDataFolder)  ──▶  Sitzung im eigenen Drive der Nutzer:in
                          ──OAuth──▶  Spotify Accounts (PKCE, Redirect)  ──▶  Login + Premium-/Free-Status
```

Der **Gemini-Schlüssel liegt ausschließlich serverseitig** (Vercel-Env-Var
`GEMINI_API_KEY`) und ist nie im Client-Bundle. `@google/genai` wird nur von den
Functions genutzt.

Der **Google-Login läuft komplett clientseitig** über Google Identity Services
(kein eigener Auth-Server, keine Sessions/Cookies auf unserer Seite). Der dabei
ausgestellte Access-Token wird nur im Speicher gehalten (nie persistiert) und
ausschließlich genutzt, um die Sitzungsdatei im `appDataFolder` der Nutzer:in zu
lesen/schreiben – ein versteckter, App-eigener Bereich ihres Google Drive, den
weder andere Apps noch wir einsehen können.

Der **Spotify-Login läuft ebenfalls komplett clientseitig**, über Authorization
Code + PKCE (kein Client-Secret nötig, dafür ein voller Seiten-Redirect zu
`accounts.spotify.com` und zurück, da Spotify anders als Google keine
Popup-/Silent-Renewal-API anbietet). Der Access-Token bleibt im Speicher; nur
der Refresh-Token landet in `localStorage`, sonst könnte man nach einem Reload
nicht ohne erneuten Consent-Screen angemeldet bleiben. Abgefragt werden nur
Name, E-Mail und Premium-/Free-Status (`GET /v1/me`) – keine Höraktivität,
keine Playlists.

## Tech-Stack

- **React 19** + **TypeScript** (strict), Build über **Vite 6**
- **Tailwind CSS 4** (über `@tailwindcss/vite` im Build) + eigenes Retro-Theme in [`index.css`](index.css)
- **Vercel Functions** (`api/*.js`) als KI-Proxy · **@google/genai** (Gemini + Veo)
- Web Speech API (Diktat), `window.print()` (PDF), `localStorage` (Sitzung)
- **Google Identity Services** (Login + OAuth-Token) · **Google Drive API**
  (`appDataFolder`) für die optionale, dezentrale Sitzungs-Sicherung

## Lokal ausführen

**Voraussetzungen:** Node.js ≥ 18

```bash
npm install
cp .env.example .env.local        # GEMINI_API_KEY eintragen

# Nur Frontend (KI-Funktionen zeigen den Demo-Hinweis):
npm run dev

# Mit /api-Funktionen (empfohlen):
npm i -g vercel && npm run dev:full   # = vercel dev
```

| Skript              | Zweck                                   |
| ------------------- | --------------------------------------- |
| `npm run dev`       | Vite-Dev-Server (Port 3000)             |
| `npm run dev:full`  | `vercel dev` – Frontend **und** `/api`  |
| `npm run build`     | Produktions-Build nach `dist/`          |
| `npm run typecheck` | `tsc --noEmit`                          |

## Deployment (Vercel)

1. Repo in Vercel importieren (Framework-Preset **Vite** wird erkannt, siehe
   [`vercel.json`](vercel.json)).
2. **Environment Variable** setzen: `GEMINI_API_KEY` = dein Gemini-Schlüssel
   (Settings → Environment Variables). Ohne diese Variable läuft die App im
   Fallback-Modus (Fragen aus der Sammlung, keine Bild-/Video-/Chat-KI).
3. Redeploy. Fertig.

| Variable                 | Ort         | Beschreibung                                              |
| ------------------------ | ----------- | ---------------------------------------------------------- |
| `GEMINI_API_KEY`         | Vercel-Env  | Google-Gemini-API-Schlüssel (nur serverseitig)              |
| `VITE_SPOTIFY_CLIENT_ID` | Vercel-Env  | Optional: Client-ID einer Spotify-App ([developer.spotify.com](https://developer.spotify.com/dashboard), APIs „Web API“ + „Web Playback SDK“, Redirect-URIs `https://retromind.vercel.app/` und `https://retromind-gaming.vercel.app/`) für „Mit Spotify anmelden“; in beiden Vercel-Projekten setzen |
| `VITE_GOOGLE_CLIENT_ID`  | Vercel-Env  | Optional: OAuth-Client-ID für „Mit Google anmelden” (Login + Drive-Sicherung); ohne sie bleibt der Button ausgeblendet |
| `RESEND_API_KEY`         | Vercel-Env  | Optional: API-Schlüssel von [resend.com](https://resend.com) für den Feedback-Versand (nur serverseitig) |
| `FEEDBACK_TO_EMAIL`      | Vercel-Env  | Optional: Ziel-E-Mail-Adresse für eingereichtes Feedback; ohne `RESEND_API_KEY` + diese Variable meldet der Feedback-Button „nicht verfügbar” |
| `FEEDBACK_FROM_EMAIL`    | Vercel-Env  | Optional: Absenderadresse der Feedback-Mail (Standard: Resend-Sandbox-Adresse) |
| `YOUTUBE_API_KEY`        | Vercel-Env  | Optional (Gaming): Schlüssel für die YouTube Data API v3. Damit sortiert die Videosuche nach Likes; ohne ihn liest `api/youtube.js` die öffentliche YouTube-Suche (nur Aufrufe) |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Vercel-Env | Werden automatisch gesetzt, wenn eine Upstash-Redis-Datenbank (Vercel → Storage, Free-Plan, Region Frankfurt) mit dem Projekt verbunden ist. Dieselbe Datenbank mit `retromind` **und** `retromind-gaming` verbinden, dann zeigt der Adminbereich beide Editionen |
| `ADMIN_EMAIL`            | Vercel-Env  | Optional: Google-Konto mit Zugang zum Adminbereich (Standard marco.schlude@gmail.com) |
| `FEEDBACK_GITHUB_TOKEN`  | Vercel-Env  | Optional: GitHub-Token (fein granuliert, nur dieses Repo, „Contents: Read and write“). Speichert Feedback in `feedback.md` und ermöglicht den „Als To Do übernehmen“-Link in der Mail |

## Bekannte Einschränkungen

- **Veo-Video** braucht ein Google-Cloud-Projekt mit aktivem Billing; ohne das
  meldet das Labor einen Fehler statt eines Videos.
- **Vorschau-Modell** für Video (`veo-3.1-fast-generate-preview`) – ID kann sich
  ändern. Text/Vision/Chat nutzen GA-Modelle.
- **Bilder** sind bewusst symbolisch (Lizenzgründe) und als solche
  gekennzeichnet – kein echtes Ära-Material außer dem einen NASA-Foto.
- **Geräteübergreifender Sync ist optional** – ohne Google-Anmeldung weiterhin
  nur über `localStorage` + manuellen `.json`-Export/Import. Mit Anmeldung wird
  beim Login das lokal vorhandene Drive-Backup automatisch geladen, sofern
  lokal noch keine Reise begonnen wurde; läuft bereits eine Reise, wird sie ab
  dann zusätzlich gesichert – es gibt (noch) keine Zusammenführung zweier
  gleichzeitig unterschiedlicher Stände auf zwei Geräten.
- **Google-Zugriffstoken sind kurzlebig** (~1 Stunde) und werden nicht
  gespeichert; nach längerer Inaktivität kann eine erneute stille (oder bei
  widerrufener Zustimmung erneute) Anmeldung nötig sein, bevor wieder
  gesichert wird.
- **Spotify-Einblenden nur mit Premium:** Der eingebettete Spotify-Player
  bietet keine Lautstärke an. Langsam lauter wird die Spotify-Musik nur mit
  Premium-Anmeldung am Computer: auf Handy und Tablet (iPhone, iPad, Android)
  unterstützt Spotify seinen Browser-Player nicht.

## Pflege dieses Repos

- **[CHANGELOG.md](CHANGELOG.md):** Jede Änderung an der App bekommt dort einen
  Eintrag (neueste oben, unter „Unreleased“).
- **README.md:** Neue Funktionen kommen unter „Was RetroMind kann“, neue Ideen
  unten unter „Ideen und offene Punkte“; Umgesetztes wird dort gestrichen.
- **[feedback.md](feedback.md):** Feedback aus der App landet hier
  automatisch. Unter „To Do“ in dieser README erscheint es erst, wenn Marco
  über den Link in der Feedback-Mail zustimmt. Erledigte To Dos werden
  gestrichen und im CHANGELOG vermerkt.
- **[`_removed_content/`](_removed_content/):** Entfernte Teile der App werden
  hier aufbewahrt statt gelöscht (wird nicht gebaut oder ausgeliefert).

## Lizenz

[MIT](LICENSE) © 2026 Marco Schlude

## Ideen und offene Punkte

### To Do

Feedback aus der App, dem Marco zugestimmt hat (über den Link in der
Feedback-Mail). Alles Eingegangene steht in [feedback.md](feedback.md).

### Muss

- **Ladungsfähige Anschrift im Impressum:** Name und E-Mail stehen drin, die
  Postanschrift fehlt noch (Marco möchte seine Privatadresse nicht
  veröffentlichen). Lösung z. B. eine c/o- bzw. Impressum-Service-Adresse
  (kostet ein paar Euro im Monat) und dann in `public/impressum.html`
  eintragen.
- **Gemini-Tarif prüfen:** Im kostenlosen Tarif der Gemini-API darf Google
  Eingaben zur Verbesserung seiner Produkte nutzen. Für persönliche
  Erinnerungen und Fotos ist ein Projekt mit aktivem Billing (bezahlter Tarif)
  datenschutzfreundlicher; danach die Datenschutzerklärung prüfen.
- **Auftragsverarbeitung abschließen:** Die Data Processing Addenda von Vercel,
  Google (Gemini) und Resend gelten über deren Nutzungsbedingungen; einmal
  prüfen, ob sie für die genutzten Konten akzeptiert sind.
- **Automatisches Deployment absichern:** Mehrfach kamen gemergte Änderungen
  erst nach einem manuellen „Redeploy“ in Vercel live. Ursache klären, damit
  jeder Merge zuverlässig ausgeliefert wird.
- **Automatische Prüfung bei jedem Pull Request:** Bisher prüft nur der
  Vercel-Build. Ein GitHub-Workflow mit `npm run typecheck` und
  `npm run build` würde Fehler vor dem Merge finden.

### Sollte

- **Weitere Stitch-Screens umsetzen:** Fragen-Seite mit Tipp, Diktat und
  passendem Song, Einstellungen als eigene Seite mit Lautstärke-Regler und
  Toneffekte-Schalter (Stitch-Entwurf in `docs/stitch/`).
- **Weitere Gaming-Stitch-Screens umsetzen:** Spiele-Karten mit Cover-Bild,
  Trophäen-Schrank mit Fortschrittsbalken und Seltenheit, Spieleseite mit
  großem Screenshot oben und „Frag den Game-Guru“-Leiste (Entwurf in
  `docs/stitch/gaming/`).
- **Reise auf zwei Geräten zusammenführen:** Die Zeitreise sichert im Google
  Drive, führt aber zwei unterschiedliche Stände nicht zusammen (die
  Gaming-Edition kann das schon).
- **Mehr Spiele im kuratierten Gaming-Katalog** mit eigenen Tipps.
- **Eigene Domain** für Zeitreise und Gaming-Edition (kostet Geld, erst nach
  Rücksprache).

### Könnte

- **Mehr im Adminbereich:** zum Beispiel welche Jahrzehnte, Spiele oder
  Minispiele am häufigsten geöffnet werden, ebenfalls nur als anonyme Zähler.

- **Jahrzehnt 2020er (und 1950er) in der Zeitreise:** Wer nach etwa 2012
  geboren ist, hatte seine Grundschulzeit in den 2020ern, wer vor etwa 1952
  geboren ist, in den 1950ern. Beide starten bisher beim nächstgelegenen
  Jahrzehnt; eigene Inhalte dafür würden passen.

- **Mehr Preise am Tresen:** geheime Minispiele, Deko für die Halle
  (Poster, Neonschilder, ein Flipper im Hintergrund) und ein „Cheat“, der ein
  vergessenes Spiel als Geheimtipp aufdeckt.

- **Mehr Minispiele in der Chill-Ecke** (z. B. ein gemütliches Snake oder
  Solitär), Sudoku in mehreren Schwierigkeitsstufen und die Bestwerte mit in
  die Cloud-Sicherung nehmen.
- **Weitere Editionen** nach dem Vorbild der Gaming-Edition, z. B. Musik,
  Film & Fernsehen oder Spielzeug, mit gemeinsamem Stummschalter und
  gemeinsamer Anmeldung.
- **Erinnerungs-Buch als gestaltetes PDF** mit Fotos aus dem Memory-Labor,
  statt über den Druckdialog.
- **Erinnerungen teilen:** Ein Buch oder einzelne Erinnerungen mit Familie
  und Freund:innen teilen, die eigene Erinnerungen ergänzen.
- **Englische Sprachversion.**
- **Video im Memory-Labor ohne Google-Billing**, z. B. durch eine animierte
  Diashow statt Veo.
