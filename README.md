# RetroMind

**Zeitreise: https://retromind.vercel.app** · **Gaming-Edition: https://retromind-gaming.vercel.app**

RetroMind ist eine interaktive, KI-gestützte Reise durch die eigene
Vergangenheit. Die App führt Jahrzehnt für Jahrzehnt (1960–2010) zurück,
stellt persönliche Erinnerungsfragen, **sammelt die Antworten** und fasst sie
zu einem exportierbaren **Erinnerungs-Buch** zusammen. Die Gaming-Edition
macht dasselbe für Videospiele ab 1970 – nach oben offen, aktuell mit
Einträgen bis 2026, und es kommt laufend neues Material dazu.

Alle Änderungen an beiden Apps stehen in der [CHANGELOG.md](CHANGELOG.md).
Die Gaming-Edition hat zusätzlich eine eigene [README](gaming/README.md) und
[CHANGELOG](gaming/CHANGELOG.md).

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

- **Antwortet auf jede Berührung** – jeder Knopf, jede Karte und jeder Link
  gibt sofort ein leises Holz-„Tock“, ein kurzes Summen auf dem Handy, einen
  Lichtring vom Finger aus und ein kleines Nachfedern. Zwischen den Halten
  blättert hörbar eine Seite um, der neue Halt gleitet von der Seite herein,
  in die die Reise geht, und ein Lichtstreif zieht vorbei. Inhalte schweben
  beim Scrollen nacheinander herein, Fenster öffnen sich mit einem „Plopp“,
  gespeicherte Erinnerungen werden mit Spieluhr-Glöckchen und Sternen und
  Herzen gefeiert. Im Hintergrund tanzt Staub im Licht (Glühwürmchen in
  Nachtschicht), der Sekundenzeiger der Reiseuhr tickt, und nach einer Weile
  ohne Tippen atmet der Knopf zum nächsten Halt. Alle Klänge sind selbst
  erzeugt, kurz und leise; bei weniger Bewegung bleibt nur ein ruhiges
  Aufleuchten ([`lib/microFx.ts`](lib/microFx.ts),
  [`lib/uiSounds.ts`](lib/uiSounds.ts),
  [`components/AmbientLife.tsx`](components/AmbientLife.tsx)).
- **Jeden Tag etwas Neues** – unter der Stube: die **Frage des Tages**
  ([`lib/dailyQuestion.ts`](lib/dailyQuestion.ts),
  [`components/DailyQuestion.tsx`](components/DailyQuestion.tsx)), jeden Tag
  eine andere und für alle dieselbe; die Antwort wird eine Seite im
  Erinnerungsbuch. **Heute in deiner Jugend**
  ([`components/YouthToday.tsx`](components/YouthToday.tsx)): was an diesem
  Datum geschah, als man 6 bis 20 war (Wikipedia „Was geschah am …“ über den
  eigenen Proxy), mit der Nr. 1 des Jahres. Ein **Brief „Seit deinem letzten
  Besuch“** ([`components/WelcomeBackLetter.tsx`](components/WelcomeBackLetter.tsx),
  [`lib/visits.ts`](lib/visits.ts)) begrüßt alle, die nach zwei Tagen oder
  mehr wiederkommen, mit Neuigkeiten aus „Was ist neu?“ und dem Familienbuch.
- **Familienbuch** ([`components/FamilyBook.tsx`](components/FamilyBook.tsx),
  [`api/_family.js`](api/_family.js)) – jeden Montag eine Frage für alle
  eingeladenen Gäste, alle lesen alle Antworten, frühere Wochen zum
  Zurückblättern. Antworten gehen erst nach einer einmaligen Einwilligung an
  den Server (Upstash), zugeordnet einem Hash der Gast-E-Mail aus dem
  Gast-Cookie; ändern, löschen und „Alle meine Daten löschen“ entfernen sie.
- **Als App aufs Handy und Kalender-Erinnerung**
  ([`lib/install.ts`](lib/install.ts), [`components/StayInTouch.tsx`](components/StayInTouch.tsx),
  [`lib/calendarReminder.ts`](lib/calendarReminder.ts)) – Manifest, Symbole und
  Service Worker ([`public/manifest.webmanifest`](public/manifest.webmanifest),
  [`public/sw.js`](public/sw.js)). „Auf den Startbildschirm“ auf der Startseite
  und in den Einstellungen installiert mit einem Tipp, wo Chrome das anbietet,
  sonst zeigt es die Schritte für Android, iPhone oder Computer. Manifest und
  Symbole liegen vor der Gästetür, weil Android sie ohne Cookie abruft.
  „In meinen Kalender“ lädt eine `.ics`-Datei mit einer Erinnerung jeden
  Sonntag um 10 Uhr, „Google Kalender“ öffnet dieselbe als Vorlage.
- **Gemütliche Stube zum Anfassen** – oben auf der Startseite, in allen
  Designs, eine gezeichnete Stube (Couch mit Häkeldecke, Stehlampe,
  dampfender Tee, Holzofen, schlafende Katze, Röhrenfernseher und in der
  Ecke ein leuchtender Spielautomat unter einem Neonschild „GAMING“), deren
  Fenster die echte Tageszeit zeigt, dazu eine Begrüßung mit Namen passend
  zur Uhrzeit. Alles darin lässt sich antippen, mit kleinen Geräuschen und
  kurzem Summen auf dem Handy: Der Fernseher startet oder setzt die Reise
  fort, Lampe und Ofen gehen an und aus (der brennende Ofen knistert hörbar),
  die Katze schnurrt, das Fenster schaltet das echte Wetter ein, Bild und
  Bücher führen zu Erkunden und Erinnerungsbuch, und der Spielautomat
  (Invader auf dem Bildschirm, blinkende Münzschlitze) fährt hoch und führt
  in RetroMind – Gaming. Retro Warm hat dazu
  Tapeten-Hintergrund, Papierkarten und Holzleisten. Auf Wunsch zeigt das
  Fenster das echte Wetter (Regen, Schnee, Gewitter, Nebel, Wolken) über
  Open-Meteo, mit Standort oder eingegebenem Ort, nur nach Einschalten
  ([`components/LivingRoom.tsx`](components/LivingRoom.tsx),
  [`components/CozyRoom.tsx`](components/CozyRoom.tsx),
  [`lib/roomSounds.ts`](lib/roomSounds.ts), [`lib/weather.ts`](lib/weather.ts)).
  Nach der Landung ist die Stube **im Stil deines Jahrzehnts eingerichtet**
  (Tapete, Couch, Kissen, Vorhänge und ein Radio der Zeit auf der
  Fensterbank, je nach Jahrzehnt), auch in den Stuben-Ecken
  ([`lib/roomEra.ts`](lib/roomEra.ts), [`components/EraDecor.tsx`](components/EraDecor.tsx)).
- **Stuben-Ecke in jeder Station** – über jeder Station der Reise steht eine
  eigene Ecke der Stube (Sessel, Fernseher, Plattenspieler, Schreibtisch,
  Bücherregal, Kuchen), mit der schlafenden Katze und je einem Ding zum
  Antippen ([`components/StationCorner.tsx`](components/StationCorner.tsx)).
- **Helden deiner Jugend** – eine Sparte beim Erkunden: die Helden jedes
  Jahrzehnts als Poster an der Wand (deutsche und amerikanische Auswahl),
  dazu ein Omni-Suchfeld, das beim Tippen von selbst sucht und neben Namen
  auch Beschreibungen versteht („der Typ mit dem sprechenden Auto“; Gemini
  findet die passenden Wikipedia-Artikel, jeder wird gegen Wikipedia
  geprüft). Jeder Held hat eine eigene Seite mit Steckbrief aus Wikidata
  (CC0), dem ganzen Wikipedia-Artikel in Kapiteln (CC BY-SA, deutsch oder
  englisch) und einem Foto nur von Wikimedia Commons unter freier Lizenz,
  immer mit Quelle, Urheber und Lizenz; alles über `/api/proxy`. „Meine
  Erinnerung dazu“ öffnet eine persönliche Frage fürs Erinnerungsbuch
  ([`phases/HeroesSection.tsx`](phases/HeroesSection.tsx),
  [`lib/heroes.ts`](lib/heroes.ts)).
- **Omas Kochbuch** – eine Sparte beim Erkunden: Leckereien von damals als
  Rezepte, zwei pro Jahrzehnt (60er bis 2010er, die eigene Zeit zuerst),
  in einem Rezeptbuch mit Lesezeichen und Karteikarten. Jedes Rezept hat
  Omas Geschichte, Zutaten zum Abhaken, Schritte, Omas Tipp und eine Frage
  fürs Erinnerungsbuch. Alle Texte sind selbst geschrieben, auf Englisch
  (US-Maße) und Deutsch
  ([`phases/CookbookSection.tsx`](phases/CookbookSection.tsx),
  [`lib/recipes.ts`](lib/recipes.ts)).
- **Weihnachtszeit** – vom 1. November bis 6. Januar öffnet in Omas
  Kochbuch die Weihnachtsbäckerei (Plätzchen, Bratäpfel, Kinderpunsch), und
  die Zeitreise trägt Weihnachtslook: Lichterkette oben, viele kleine
  blinkende Lichter und Schnee hinter den Seiten, Weihnachtsrot als Akzent,
  und im Radio laufen Weihnachtslieder (Spotify „Christmas Hits“). Alle ein
  bis zwei Minuten klingt leise ein Schlittenglocken-Jingle, jedes dritte
  Mal mit „Ho ho ho“ (stumm bei ausgeschaltetem Ton, einzeln abschaltbar,
  [`lib/xmasSounds.ts`](lib/xmasSounds.ts)). In den Einstellungen „Weihnachtslook“:
  Automatisch, jetzt an oder aus
  ([`lib/season.ts`](lib/season.ts),
  [`components/ChristmasDeco.tsx`](components/ChristmasDeco.tsx)).
- **Adventskalender** – ab dem 1. Dezember eine Kachel beim Erkunden:
  24 verstreute Türchen auf grünem Grund, jeden Tag geht eins mehr auf
  (bis 6. Januar bleiben alle offen, danach verschwindet die Kachel). Dahinter ein
  Weihnachtslied fürs Radio, ein Rezept aus Omas Weihnachtsbäckerei, eine
  Geschichte von Weihnachten damals oder eine Frage fürs Erinnerungsbuch.
  Geöffnete Türchen merkt sich das Gerät; mit „Weihnachtslook: an“ gibt es
  vor Dezember eine Vorschau mit allen Türchen
  ([`phases/AdventSection.tsx`](phases/AdventSection.tsx),
  [`lib/advent.ts`](lib/advent.ts)).
- **Laufband mit Sprüchen von damals** – unten auf der Startseite laufen
  Sprüche und Alltagsdinge aus den Jahrzehnten vorbei (deutsch und
  amerikanisch, das eigene Jahrzehnt öfter). Ein Tipp auf die Diskette
  dahinter legt sie in die **Grabbelkiste**, die vorn im Laufband zählt und
  alles Gesammelte zeigt (dieselbe Kiste wie im Gaming-Ticker). Ein Tipp auf den Spruch selbst erklärt, woher er
  kommt. Dazu kommt ein Satz zu jedem Jahr mit seinem Nummer-1-Hit. Langsam,
  mit Pause-Knopf, hält bei Berührung an, lässt sich mit dem Finger oder der
  Maus hin und her schieben (mit Schwung) und mit ‹ › eine Meldung vor oder
  zurück blättern. Es geht nie aus: Neue Meldungen kommen laufend nach, ist
  alles einmal durch, holt die KI frische dazu, und die zuletzt gezeigten
  merkt sich das Gerät zum Zurückblättern
  ([`components/RetroTicker.tsx`](components/RetroTicker.tsx),
  [`components/TickerTrack.tsx`](components/TickerTrack.tsx),
  [`lib/tickerFeed.ts`](lib/tickerFeed.ts),
  [`lib/tickerItems.ts`](lib/tickerItems.ts)).
- **Geführte Reise in 7 Halten** – `intro → onboarding → induction → exploration → diary → book → finish`
  (Zuhause, Dein Profil, Deine Zeit, Erkunden, Tagebuch, Erinnerungsbuch,
  Ankunft). Jeder Halt heißt überall gleich
  ([`lib/stations.ts`](lib/stations.ts)) und endet mit einem großen Knopf
  „Nächster Halt: …“ und einem leisen Weg zurück
  ([`components/PhaseNav.tsx`](components/PhaseNav.tsx)).
- **Roter Faden: die Uhr führt durch die Reise** – vom Willkommensbildschirm
  bis zum Erinnerungsbuch ist die Kaminuhr das Leitbild, Stube, Fernseher
  und Buch begleiten sie nur. Über jedem Halt steht in allen Designs die
  Reiseleiste: eine kleine Uhr, deren Zeiger auf den aktuellen Halt zeigt,
  „Halt 4 von 7“ mit Namen, beim Erkunden mit Brotkrumen („Erkunden ›
  Musik“), die sieben Halte zum Antippen und der Weg zurück
  ([`components/JourneyBar.tsx`](components/JourneyBar.tsx)). Beim Lesen
  springt man über den Griff am rechten Rand zu jedem Halt.
  Ein gemeinsames Design-System (Abstände, Kanten, Schatten, Knöpfe,
  Überschriften) beschreibt [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md).
- **Die Zeitmaschine saugt dich ein** – ein Druck auf „Go back...“ zieht
  Schrift, Knopf und Uhr in einer Spirale ins Zifferblatt, Lichtringe rasen
  zur Mitte, ein heller Kern wächst, bis alles Licht ist, und dann öffnet
  sich das Licht von der Mitte her wie eine Blende. Dazu rasen die Ticks der
  Uhr immer schneller zu einem Surren, ein Brummen steigt auf und eiert immer
  schneller, ein Luftsog schwillt an, und bei der Ankunft schlägt der Gong.
  Alles beginnt leise und wird lauter, nie ein Knall, und bleibt still, wenn
  der Ton aus ist ([`lib/clockSounds.ts`](lib/clockSounds.ts) `playWarp`).
- **Fahrkarte in die Vergangenheit** – Name und Geburtstag trägt man nicht in
  ein helles Formular ein, sondern im selben dunklen Uhrenzimmer wie der
  Willkommensbildschirm („In der Zeitmaschine – Wohin geht die Reise?“) auf
  eine Papier-Fahrkarte mit Abriss. „Uhr zurückdrehen“ lässt die Zeiger
  rückwärts rasen, die Ticks werden langsamer bis zu einem kleinen Glöckchen,
  und das Uhrenzimmer öffnet sich wie eine Blende auf die Stube
  ([`components/VerifyGate.tsx`](components/VerifyGate.tsx)). Das Profil
  danach heißt „Pack deinen Koffer“.
- **Gaming-Karte „Die Spielhalle nebenan“** – direkt unter „Zeitreise
  starten“ (bei begonnener Reise unter den Etappen) zeigt eine dunkle
  Neon-Karte in allen Designs das Foto vom Eingang der Spielhalle, ein paar
  Zeilen dazu, was RetroMind – Gaming alles bietet, und darin den Wegweiser
  zur Gaming-Zone ([`components/GamingTeaser.tsx`](components/GamingTeaser.tsx)).
  Der Wegweiser ist ein ramponierter Holzwegweiser „To the gaming zone“
  (Schnitte, Brandspuren, abgeplatzte Kontur, staubiger roter Rahmen,
  umwickelt von einem gelben Leuchtband mit Lauflichtern, oben auf dem
  Pfosten zwei rote Warnlampen wie am Bahnübergang, die abwechselnd blinken)
  in Metall-Großbuchstaben im Stil von God of War (freie Schrift Cinzel).
  Karte, Wegweiser und Spielautomat führen zu RetroMind – Gaming und nehmen
  Ton- und Google-Einstellung mit
  ([`components/GamingSignpost.tsx`](components/GamingSignpost.tsx),
  [`lib/gamingLink.ts`](lib/gamingLink.ts)).
- **Etappen frei wählen** – sobald eine Reise begonnen ist, zeigt die Startseite
  „Deine Etappen“: Profil, Eindrücke, Erkunden, Tagebuch, Erinnerungsbuch und
  Abschluss als Kacheln, jede jederzeit antippbar, die zuletzt besuchte markiert
  ([`components/JourneyStages.tsx`](components/JourneyStages.tsx)). Auch in
  der Reiseleiste ist jeder Halt antippbar.
- **Personalisiertes Onboarding** – Name, Geburtsdatum, optional Geschlecht,
  Interessen und Lieblingsbands (freiwillig, eigene Eingabe oder per Tipp aus
  „Ideen gefällig?“: die großen Namen jedes Fünf-Jahres-Abschnitts seit dem
  Geburtsjahr, [`lib/favoriteBands.ts`](lib/favoriteBands.ts); auch in den
  Einstellungen änderbar, fließt in die persönlichen Fragen ein). Das Kindheits-
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
  Mit Spotify-Login kommen die Songs aus den eigenen Jahren: Für die Jahre
  des Jahrzehnts, in denen man 6 bis 19 war, sucht die App je eine
  „Hits <Jahr>“-Playlist und mischt ihre Songs; der Player zeigt dann
  „Hits von 1983–1989“ ([`lib/youthMusic.ts`](lib/youthMusic.ts)). Ohne
  Login bleibt es bei der Dekaden-Playlist. Ganze Songs statt
  30-Sekunden-Ausschnitten gibt es mit Spotify Premium: am Computer über
  Spotifys Browser-Player, auf dem Handy über die eigene Spotify-App
  (Spotify Connect, [`lib/spotifyConnect.ts`](lib/spotifyConnect.ts); siehe
  Spotify-Login unten). Sonst spielt der eingebettete Player Ausschnitte,
  außer man ist im selben Browser bei Spotify angemeldet.
  Kommt man durch die Zeitmaschine in die App, läuft eine kurze
  **Ankunfts-Show** ([`components/ArrivalShow.tsx`](components/ArrivalShow.tsx)):
  eine Zeitanzeige (Gegenwart grün, Ziel rot) rattert von heute zurück bis
  zum Geburtstag, rastet mit Blitz, Druckwellen und Schlag ein, dann steht
  das Geburtsjahr riesig da mit dem, wofür das Jahr steht („1989 … das Jahr
  des Mauerfalls“, [`lib/yearFacts.ts`](lib/yearFacts.ts)), Dinge des
  Jahrzehnts und die eigenen Fotos und Begriffe fliegen heraus, und ein paar
  Sekunden des Nummer-1-Hits des Jahres (US-Jahrescharts, Ausschnitt über
  `/api/spotify-preview`) klingen als Fanfare; ein Tipp überspringt sie. Beim Einrasten sagt eine **Roboterstimme** nur „Welcome
  back“ bzw. „Willkommen zurück“; beim Wechsel des Jahrzehnts
  sagt sie „Welcome to the year 1980“ ([`lib/robotVoice.ts`](lib/robotVoice.ts),
  Sprachausgabe des Browsers, tief und langsam, still bei ausgeschaltetem
  Ton). Über jedem
  Halt steht der Satz groß, darunter startet ein **Jahresrückblick-Video**
  aus diesem Jahr von YouTube ([`components/YearWelcome.tsx`](components/YearWelcome.tsx),
  über `/api/youtube`; erst nach Zustimmung, abwählbar in den Einstellungen
  unter „Videos“; die Spotify-Musik pausiert solange).
  Die Musik steuert man im Fenster hinter dem Griff am rechten Rand: Zurück,
  Play/Pause und Weiter als richtige Knöpfe und daneben gut lesbar, was
  läuft ([`components/MusicMini.tsx`](components/MusicMini.tsx)). „Mehr
  Musik“ öffnet die ganze **Musiksteuerung**
  ([`components/MusicDock.tsx`](components/MusicDock.tsx)) über die halbe
  Seite: welche Musik und welcher Song gerade läuft, Lautstärke, Suche und
  ein Knopf für Ton an/aus. Weiter spielt den nächsten Zufallssong, Zurück
  den Song davor. Lange Songtitel werden kleiner geschrieben und laufen, wenn
  das nicht reicht, als Laufschrift durch. In der Gaming-Halle steht oben
  links in kleiner Schrift, welcher Song gerade spielt; ein Tipp darauf
  öffnet ebenfalls die Musiksteuerung.
- **Nostalgie-Begleiter** – Chat auf Gemini-Basis, mit echtem Gesprächsverlauf.
- **Perspektivwechsel** – nach einer gespeicherten Erinnerung lässt sich eine
  Frage erzeugen, die denselben Moment aus Sicht einer anderen Person von
  damals erzählen lässt (Freund:in, Geschwister, Elternteil); die Antwort
  landet als eigene Erinnerung im Buch (`perspectiveQuestion` in
  [`api/gemini.js`](api/gemini.js)).
- **Erinnerungs-Buch** – formatierte Zusammenfassung aller Erinnerungen + freier
  Notiz. Export als **PDF (Druckdialog)**, **Textdatei** oder **`.json`-Sitzung**;
  `.json` lässt sich auf einem anderen Gerät wieder laden.
- **Fortsetzen** – die komplette Sitzung liegt im `localStorage`; ein Reload bietet
  „Weitermachen“ an.
- **Google-Login (optional)** – „Mit Google anmelden“ hält die Reise zusätzlich
  im **eigenen Google Drive** der Nutzer:in synchron (privater `appDataFolder`,
  nur für RetroMind, für niemand sonst sichtbar; siehe „Eine App, immer
  synchron“). Kein zentraler Server-Speicher: jede Person hat ihre eigenen
  Erinnerungen in ihrem eigenen Konto (**dezentral**) und macht auf jedem Gerät
  dort weiter, wo sie war. Mit Google angemeldet entfällt
  die Start-Abfrage von Name und Geburtsdatum, sobald beides bekannt ist (Name
  aus dem Google-Profil, Geburtstag und Geschlecht über die People API, falls
  freigegeben, sonst aus der Drive-Sicherung);
  ändern lässt es sich in den Einstellungen unter „Deine Angaben“. Ohne Google
  fragt die App beim ersten Mal; danach bleiben die Angaben auf dem Gerät und
  die Abfrage entfällt bei jedem weiteren Besuch. „Mit Google anmelden“ und
  „Mit Spotify anmelden“ stehen in den Einstellungen unter „Konten
  (freiwillig)“, samt Abmelden; Googles Skript lädt erst, wenn man nach dem
  Knopf greift.
- **Die ganze Steuerung hinter einem Griff** – am rechten Rand, auf halber
  Höhe, sitzt in allen Designs ein kleiner Griff mit drei Reglern, schon auf
  dem Willkommensbildschirm ([`components/ControlHandle.tsx`](components/ControlHandle.tsx)).
  Ein Tipp schiebt von rechts ein Fenster mit allem herein: oben die sieben
  Halte der Zeitreise (der aktuelle markiert), die Musik, Ton an/aus, der
  Begleiter und Feedback, darunter alle Einstellungen. Sonst liegen keine
  Knöpfe mehr über der Seite (nur „Nach oben“ beim Scrollen). Ein roter
  Punkt am Griff meldet Neues unter „Was ist neu?“.
- **Spotify-Login (optional)** – „Mit Spotify anmelden“ (Authorization Code +
  PKCE, komplett clientseitig, kein eigener Auth-Server) holt Name und
  Premium-/Free-Status ab. Mit **Spotify Premium** läuft die Musik
  (Zeitreise und Gaming-Halle) über Spotifys eigenen Browser-Player
  ([`lib/spotifyPremium.ts`](lib/spotifyPremium.ts), Web Playback SDK): ganze
  Songs, und die Musik wird beim Start und beim Fortsetzen über etwa
  6 Sekunden langsam lauter. Auf Handy und Tablet (iPhone, iPad, Android),
  wo Spotify seinen Browser-Player nicht unterstützt, spielen Zeitreise und
  Gaming-Halle mit Premium über die **eigene Spotify-App** (Spotify Connect,
  [`lib/spotifyConnect.ts`](lib/spotifyConnect.ts)): ganze Songs, die App
  spielt sie, RetroMind steuert Song, Pause, Weiter und Zurück und fragt alle
  2 Sekunden ab, was läuft. Findet sie keine Spotify-App (sie muss offen
  oder kurz vorher offen gewesen sein), zeigt der Musik-Player „Öffne kurz
  die Spotify-App … Nochmal versuchen“; Logins von vor dieser Funktion
  bitten einmal um eine neue Anmeldung (Erlaubnis
  `user-read-playback-state`). Beim Verlassen der Seite hält die App an.
  Ohne Premium, ohne Anmeldung oder wenn Spotifys Player nicht startet,
  bleibt es beim eingebetteten Player. Kommt über Spotifys Player nach dem Start kein Song (Spotify lehnt
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
- **Lautstärke-Regler** – Im Musik-Player und in den Gaming-Einstellungen
  („Musik-Lautstärke“) stellst du die Musik lauter oder leiser; sie startet
  bei der Hälfte. Der Regler gilt für das Metal-Intro, die Chiptune-Stücke
  und Spotifys Premium-Player im Browser
  ([`lib/musicVolume.ts`](lib/musicVolume.ts)). Spotifys eingebetteter Player
  lässt sich von keiner Webseite leiser stellen; dort sagt der Player, dass
  die Lautstärketasten des Geräts helfen.
- **Barrierefreiheit** – Schriftgrößen-Umschalter (A / A+ / A++), größere Grund-
  schrift, Fokus-Ringe, Tastatur-/Esc-Bedienung und Fokus-Falle in Dialogen,
  `prefers-reduced-motion`, ARIA-Labels.
- **Feedback-Button** – ein roter Knopf „✉️ Feedback“ im Fenster hinter
  dem Griff am rechten Rand, unter „Schnellzugriff“. Darüber
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
  ein kleiner roter Punkt am Griff am rechten Rand meldet Neues seit dem
  letzten Blick.
- **Willkommens-Bildschirm** – „Welcome to RetroMind“ vor einer alten
  Kaminuhr, die laut und zweimal pro Sekunde tickt. Der „Go back...“-Knopf trägt den Look des
  gewählten Designs, steht leicht schräg und blitzt ab und zu auf; ein Druck darauf startet die
  Zeitmaschine (siehe oben), bei der Ankunft schlägt ein großer Gong. Alles synthetisiert
  ([`lib/clockSounds.ts`](lib/clockSounds.ts)) und still, wenn der Ton aus
  ist. Lässt der Browser noch keinen Ton zu, tickt die Uhr ab dem ersten
  Antippen (auch auf dem Handy, auch mit dem Stumm-Schalter des iPhones);
  danach zeigt ein kurz hüpfender Lautsprecher „die Uhr läuft“, damit man
  auch ohne Ton sieht, dass der Tipp angekommen ist. In
  den Einstellungen führt „Zurück zum Willkommensbildschirm“ jederzeit wieder
  dorthin; die Musik pausiert so lange und spielt danach weiter.
  Unter dem Knopf sitzt ein Schalter „Echte Hits deines Jahrzehnts“: Hier
  wird die Musik von Spotify erlaubt, mit kurzem Datenschutz-Hinweis. Wer ihn
  nicht anfasst, wird erst nach dem Namensformular gefragt, nicht mittendrin.
- **„Deine Zeit“ auf der Startseite** – solange die Reise noch nicht
  begonnen hat, zeigt die Startseite das eigene Jahrzehnt: Titel, sechs
  Stichworte von damals und drei Postkarten zum Öffnen
  ([`components/EraSpotlight.tsx`](components/EraSpotlight.tsx)).
- **Fortschritt des Erinnerungsbuchs** – jede beantwortete Frage ist eine
  Seite, das Tagebuch eine weitere; ein Balken zeigt „x von 10 Seiten“ auf der
  Startseite, in der Etappe „Erinnerungsbuch“ und über dem Buch selbst
  ([`components/BookProgress.tsx`](components/BookProgress.tsx)).
- **Aufwachen wie aus einer Zeitkapsel** – beim Öffnen löst sich ein
  schwarzes Pixelraster Kästchen für Kästchen auf, dazu ein tiefer Ton und
  eine tiefe, langsame Stimme, die „Welcome“ sagt
  ([`components/BootOverlay.tsx`](components/BootOverlay.tsx)). Über der
  ganzen App liegt (außer in Retro Warm) ein Röhrenbildschirm-Look mit
  Streifen und gelegentlichem Flackern, Fotos wirken wie verblasste Abzüge.
- **Kopfbereich mit Logo** – Marcos 8-Bit-Logo mit durchsichtigem Hintergrund
  und dem Untertitel „… willkommen zurück in der Vergangenheit“, im selben
  Röhrenbildschirm-Look (Scanlines, Schleier) wie die ganze App.
- **Design wählbar** – in den Einstellungen unter „Design & Atmosphäre“:
  - **Retro Warm** (Standard, entworfen mit Google Stitch, Vorlage in
    [`docs/stitch/DESIGN.md`](docs/stitch/DESIGN.md)): Pergament und
    Terrakotta, Schriften Epilogue und Plus Jakarta Sans, runde Karten und
    Knöpfe, kein Flimmern. Eigener App-Aufbau: schlanke Kopfleiste mit Logo
    und dem aktuellen Halt (die Bedienung liegt wie überall hinter dem Griff),
    Startseite mit Jahrzehnt-Überblick (sechs gleich große Knöpfe in zwei
    Reihen, auf dem Handy drei pro Reihe) und Archiv-Fundstücken, „Erkunden“ als
    Karten pro Jahrzehnt ([`components/WarmChrome.tsx`](components/WarmChrome.tsx)).
  - **Klassisch**: vergilbtes Papier mit Röhrenbildschirm-Look.
  - **Nachtschicht**: dunkel mit warmem Röhrenglühen.

  Weiße Schrift auf Orange/Terrakotta ist in allen Designs gut lesbar
  (Kontrast mindestens 4,5 : 1), und die Kopfleiste passt auch auf schmale
  Handys (320 px).

  Die Wahl gilt sofort und bleibt im Browser gespeichert
  ([`lib/theme.ts`](lib/theme.ts)); Farben stehen in [`index.css`](index.css).
  Das gedruckte Erinnerungs-Buch bleibt immer im klassischen Papier-Look.

### Edition „RetroMind – Gaming“ (`/gaming/`)

Die Gaming-Edition (https://retromind-gaming.vercel.app) hat eine eigene
**[README](gaming/README.md)** mit allen Funktionen und offenen Ideen und eine
eigene **[CHANGELOG](gaming/CHANGELOG.md)**. Kurz: eine verranzte Spielhalle im
Regen mit Neonschild und Metal durch die Wand, drinnen ein Katalog vergessener
Spiele von den 1970ern bis heute (44 handverlesene plus Hunderte aus dem
Wikipedia-Archiv, 36 Konsolen), echte Cover (nur im privaten Gästekreis, sonst eigene Pixelbilder), Spieleseiten
mit KI-Guide, Videos, alten Testwertungen und „Fakten & Geheimnisse“, ein
Retro-Guru im Gamer-Slang, Chill-Ecke mit Minispielen und Highscore-Tafel,
Quests, Coins, Preis-Tresen und Easter Eggs. Lokal: `npm run dev`, dann
`http://localhost:3000/gaming/`.

### Für alle Module

- **Dein Kürzel** ([`lib/initials.ts`](lib/initials.ts),
  [`components/InitialsPicker.tsx`](components/InitialsPicker.tsx)) – in den
  Einstellungen beider Apps gibt man ein eigenes Kürzel aus drei Zeichen
  (A–Z, 0–9) ein, wie auf den Highscore-Tafeln alter Flipper: je Zeichen mit
  ▲/▼ oder getippt. Gaming trägt es an jeder Highscore-Tafel schon ein. Es
  gleicht sich wie alle Daten ab (siehe „Eine App, immer synchron“) und gilt
  so in beiden Apps und mit Google-Anmeldung auf allen Geräten. Die frühere
  eigene Datei `retromind-initials.json` wird beim ersten Abgleich übernommen
  und gelöscht.
- **Neu laden bleibt auf der Seite** ([`lib/pageMemory.ts`](lib/pageMemory.ts))
  – beide Apps merken sich pro Browser-Tab die offene Seite (Zeitreise: Etappe
  und ob der Willkommensbildschirm schon vorbei ist; Gaming: Halle oder Eingang,
  Reiter, Filter, Suche, offenes Spiel). Ein Neuladen landet dort wieder; ein
  neuer Tab oder späterer Besuch beginnt am Start.
- **Fenster bleiben, wo man ist** ([`components/Modal.tsx`](components/Modal.tsx))
  – offene Fenster (Einstellungen, Was ist neu, Feedback und andere) behalten
  ihre Scroll-Position, auch wenn im Hintergrund die Musik zum nächsten Lied
  wechselt. Der Fokus springt nur beim Öffnen auf den ersten Knopf.
- **Versionsnummer** ([`vite.config.ts`](vite.config.ts)) – unten in den
  Einstellungen beider Apps steht „Version 2.<PR-Nummer> (<Commit>)“, damit man
  sieht, welcher Stand gerade läuft.
- **Englisch als Standardsprache, Deutsch wählbar** ([`lib/i18n.ts`](lib/i18n.ts))
  – beide Apps sind komplett in amerikanischem Englisch. In den Einstellungen
  lässt sich unter „Language“ auf Deutsch umschalten; die Wahl wird im Browser
  gespeichert. Auch die KI (Fragen, Fotoanalyse, Chat, Retro-Guru, Spieleguides)
  antwortet in der gewählten Sprache. Die rechtlichen Seiten gibt es auf
  Englisch (`privacy.html`, `imprint.html`) und Deutsch.
- **Ein Stummschalter** ([`lib/mute.ts`](lib/mute.ts)) – „Ton an/aus“ im
  Fenster hinter dem Griff schaltet jedes Modul stumm, auch über verschiedene Adressen hinweg
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
- **Lokal zuerst** – alle Daten liegen auf dem Gerät; die Cloud im eigenen
  Google Drive ist ein Angebot, keine Pflicht.
- **Eine App, immer synchron** ([`lib/sync.ts`](lib/sync.ts),
  [`lib/handoff.ts`](lib/handoff.ts)) – Zeitreise und Gaming-Edition halten
  alle `retromind…`-Daten im `localStorage` gleich, obwohl sie auf zwei
  Adressen laufen. Links zwischen den Apps tragen die Daten im `#`-Teil der
  Adresse mit (geht nie an einen Server). Mit Google-Anmeldung liegt alles in
  einer Datei `retromind-sync.json` im privaten Drive-`appDataFolder`, die
  beide Apps teilen: gelesen vor dem Start der App, geschrieben kurz nach
  jeder Änderung, neu geprüft jede Minute und beim Zurückkehren in den Tab
  (dann lädt die Seite neu und bleibt, wo sie war). Jeder Schlüssel trägt die
  Zeit seiner letzten Änderung, der neuere gewinnt. Trifft ein Gerät zum
  ersten Mal auf einen anderen Cloud-Stand, fragt es einmal (Cloud empfohlen).
  Auch die Anmeldungen gelten in beiden Apps: die Spotify-Anmeldung
  (Refresh-Token) gleicht sich wie jeder Schlüssel ab, die Google-Anmeldung
  reist mit jedem Link zwischen den Apps (sie kann nicht aus der Cloud kommen,
  weil man für die Cloud angemeldet sein muss) und bleibt pro Gerät erhalten
  (siehe „Google bleibt angemeldet“). Nicht abgeglichen werden der
  Google-Token selbst, die Spotify/YouTube-Zustimmung und Zwischenspeicher. Die alten Sicherungen `retromind-session.json` und
  `retromind-gaming.json` werden beim ersten Abgleich übernommen.
- **Google bleibt angemeldet** ([`api/_googleKeep.js`](api/_googleKeep.js)) –
  Google gibt dem Browser nur Schlüssel für eine Stunde, und eine Erneuerung im
  Browser öffnet immer ein Fenster. Deshalb läuft der Anmelde-Tipp über Googles
  Code-Ablauf: Der Server tauscht den Code gegen einen Refresh-Token, legt ihn
  verschlüsselt im HttpOnly-Cookie `rm_gkeep` ab (nur `/api/admin` sieht es)
  und holt daraus ohne Fenster neue Stunden-Schlüssel, beim App-Start vor dem
  Cloud-Abgleich und immer, wenn einer abläuft. Links zwischen den Apps nehmen
  das Cookie über den Gäste-Einmal-Code mit. Abmelden löscht es nur auf diesem
  Gerät (bei Google zu widerrufen würde alle Geräte abmelden). Braucht
  `GOOGLE_CLIENT_SECRET` in beiden Vercel-Projekten; ohne bleibt es bei der
  Stunden-Anmeldung.
- **Datenschutz (DSGVO)** ([`lib/privacy.ts`](lib/privacy.ts)) – kein Tracking.
  Schriften sind eingebaut (`@fontsource`, keine Google Fonts). Wikipedia-Texte,
  Bilder, Vorschaubilder und Klänge von fremden Servern holt
  [`api/proxy.js`](api/proxy.js) (nur erlaubte Adressen, Vercel-CDN-Cache), der
  Browser spricht nie direkt mit ihnen. Spotify (Zeitreise und Gaming-Halle) und YouTube (beide)
  laden erst nach Zustimmung, widerrufbar in den Einstellungen; Googles
  Anmelde-Skript lädt erst, wenn jemand zum Anmelde-Knopf greift.
  In den Einstellungen beider Apps lädt „Meine Daten herunterladen“ alles,
  was RetroMind im Browser gespeichert hat, als Datei herunter, und „Alle
  meine Daten löschen“ entfernt es ([`lib/myData.ts`](lib/myData.ts)).
  Chat-Begleiter, Retro-Guru und KI-Videos sind als KI gekennzeichnet (AI
  Act); weil Google die Gemini-API erst ab 18 erlaubt, bleibt die KI in der
  Zeitreise aus, wenn das Geburtsdatum unter 18 ergibt. Der Hit-Ausschnitt
  bei der Ankunft spielt nur nach „Musik erlauben“. Welche Daten wohin
  gehen, steht im [Verzeichnis der Verarbeitungstätigkeiten](docs/verarbeitungsverzeichnis.md).
  [Datenschutzerklärung](public/datenschutz.html) und
  [Impressum](public/impressum.html) liegen als statische Seiten unter
  `/datenschutz.html` und `/impressum.html` auf beiden Domains und sind in der
  Fußzeile und in den Einstellungen verlinkt.

- **Nur für eingeladene Gäste** ([`middleware.js`](middleware.js),
  [`public/gate.html`](public/gate.html), [`api/_guests.js`](api/_guests.js))
  – beide Domains sind ein privates Angebot (Marco, 2026-10-15: kostenlos und
  ohne öffentliches Impressum). Ohne das signierte Cookie `rm_guest` leitet
  die Vercel-Middleware Seiten auf die Gästeseite um und beantwortet API-Aufrufe
  mit 401. Auf der Gästeseite meldet man sich mit Google an; `api/admin.js`
  prüft die Adresse gegen die Gästeliste (Upstash-Set `rm:guests`, Marco ist
  immer drin) und setzt das Cookie (30 Tage, höchstens täglich neu geprüft).
  Marco pflegt die Liste im Adminbereich unter „Gäste“. Offen bleiben die
  Rechtsseiten, `/api/admin` und der Freigabe-Link aus der Feedback-Mail;
  Vorschau-Deployments sind ausgenommen. Ohne Upstash-Datenbank bleibt die
  App offen. Die Anmeldung an der Tür fragt nach denselben Google-Rechten wie
  die App und legt die Sitzung dort ab, wo [`lib/googleLogin.ts`](lib/googleLogin.ts)
  sie sucht, also ist man drinnen gleich mit Google angemeldet. Links zwischen
  den Domains (`withGoogleParam`) laufen über `/api/admin?view=handoff`: ein
  Einmal-Code (2 Minuten, Upstash) bringt den Gästezugang mit, die
  Google-Sitzung reist im `#`-Teil der Adresse.

- **Adminbereich mit Nutzungszahlen** ([`admin/`](admin/AdminApp.tsx),
  [`api/stats.js`](api/stats.js), [`lib/usage.ts`](lib/usage.ts)) – unter
  `/admin/` auf beiden Domains, bewusst nirgends in den Apps verlinkt. Marco
  kommt über die Adresse hinein oder mit einem versteckten Zugang: fünfmal
  schnell auf die Überschrift „Einstellungen“ tippen (Zeitreise und Gaming).
  Zeigt für
  beide Editionen Besucher pro Tag, Besuche über 7/30/90 Tage und App-Starts
  insgesamt, als Balken und als Tabelle, dazu „Wiederkommen“: wie lange der
  letzte Besuch des Geräts beim Start her war (erster Besuch, gestern, bis
  eine Woche, bis ein Monat, länger; seit 18.10.2026). Den Zugang prüft der Server: Das
  Google-Token muss zur App gehören und zu `ADMIN_EMAIL` (Standard
  marco.schlude@gmail.com). Gezählt wird anonym ohne Cookies: ein Einweg-Hash
  aus IP, Browser und einem Tageswert, der nach zwei Tagen gelöscht wird, landet
  in einem HyperLogLog-Zähler in Upstash Redis (kostenlos über den Vercel
  Marketplace). Ohne verbundene Datenbank zählt nichts, die App läuft normal.
  Vier Reiter: **Nutzung** (dazu Geräte Handy/Tablet/Computer, Anteil der als
  App installierten Starts und die beliebtesten Jahrzehnte, Spiele und
  Minispiele, diesen Monat und insgesamt), **Gäste** (wer RetroMind öffnen
  darf: einladen und entfernen), **Feedback** (alle Einträge aus
  `feedback.md`, mit „Als To Do übernehmen“ und „Erledigt“, siehe
  [`api/admin.js`](api/admin.js)) und **Live-Check** (welchen Commit
  beide Domains ausliefern, verglichen mit `master`, mit Link zum Redeploy in
  Vercel, wenn eine Domain veraltet ist).

## Architektur

```
Browser (React/Vite SPA)  ──fetch──▶  /api/gemini   (Vercel Function)  ──▶  Google Gemini / Veo
                          ──fetch──▶  /api/video    (Vercel Function)  ──▶  Veo-Download (streamt)
                          ──fetch──▶  /api/feedback (Vercel Function)  ──▶  Resend (E-Mail) + GitHub (feedback.md)
                          ──fetch──▶  /api/proxy    (Vercel Function)  ──▶  Wikipedia, Wikidata, Commons, Open-Meteo …
                          ──fetch──▶  /api/spotify-tracks, /api/spotify-preview ──▶  Spotify (Titellisten, Ausschnitte; Deezer als Ersatz)
                          ──fetch──▶  /api/youtube  (Vercel Function)  ──▶  YouTube-Suche (Gaming)
                          ──fetch──▶  /api/highscores, /api/stats, /api/admin ──▶  Upstash Redis (Highscores, anonyme Zählung)
                          ──OAuth──▶  Google Identity Services          ──▶  Login + Drive-Access-Token
                          ──fetch──▶  Google Drive API (appDataFolder)  ──▶  retromind-sync.json im eigenen Drive der Nutzer:in
                          ──OAuth──▶  Spotify Accounts (PKCE, Redirect)  ──▶  Login + Premium-/Free-Status
```

Der **Gemini-Schlüssel liegt ausschließlich serverseitig** (Vercel-Env-Var
`GEMINI_API_KEY`) und ist nie im Client-Bundle. `@google/genai` wird nur von den
Functions genutzt.

Der **Google-Login läuft komplett clientseitig** über Google Identity Services
(kein eigener Auth-Server, keine Sessions/Cookies auf unserer Seite). Der dabei
ausgestellte Access-Token wird nur im Speicher gehalten (nie persistiert) und
ausschließlich genutzt, um die Sync-Datei im `appDataFolder` der Nutzer:in zu
lesen/schreiben – ein versteckter, App-eigener Bereich ihres Google Drive, den
weder andere Apps noch wir einsehen können.

Der **Spotify-Login läuft ebenfalls komplett clientseitig**, über Authorization
Code + PKCE (kein Client-Secret nötig, dafür ein voller Seiten-Redirect zu
`accounts.spotify.com` und zurück, da Spotify anders als Google keine
Popup-/Silent-Renewal-API anbietet). Der Access-Token bleibt im Speicher; nur
der Refresh-Token landet in `localStorage` (und gleicht sich zwischen den Apps
und über das eigene Drive ab, siehe „Eine App, immer synchron“), sonst könnte man nach einem Reload
nicht ohne erneuten Consent-Screen angemeldet bleiben. Abgefragt werden nur
Name, E-Mail und Premium-/Free-Status (`GET /v1/me`), keine Playlists. Nur
mit Premium auf dem Handy fragt die Zeitreise zusätzlich ab, welche
Spotify-Geräte es gibt und was gerade läuft (`user-read-playback-state`), um
die Musik über die Spotify-App zu spielen; gespeichert wird davon nichts.

## Tech-Stack

- **React 19** + **TypeScript** (strict), Build über **Vite 6**
- **Tailwind CSS 4** (über `@tailwindcss/vite` im Build) + eigenes Retro-Theme in [`index.css`](index.css)
- **Vercel Functions** (`api/*.js`) als KI-Proxy · **@google/genai** (Gemini + Veo)
- Web Speech API (Diktat), `window.print()` (PDF), `localStorage` (Sitzung)
- **Google Identity Services** (Login + OAuth-Token) · **Google Drive API**
  (`appDataFolder`) für die optionale, dezentrale Sitzungs-Sicherung
- **Spotify** (iFrame-Embed, Web API, Web Playback SDK) · **YouTube** (Gaming)
- **Wikipedia, Wikidata, Wikimedia Commons** über den eigenen Proxy ·
  **Open-Meteo** (Wetter im Stubenfenster)
- **Upstash Redis** (Vercel Marketplace) für Highscores und anonyme Zählung ·
  **Resend** für Feedback-Mails
- Web Audio (selbst erzeugte Klänge, Chiptune, Metal-Aufnahmen) · PWA
  (Gaming installierbar)

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
| `npm run changelog:gaming` | erzeugt `gaming/CHANGELOG.md` aus der `CHANGELOG.md` |

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
- **Geräteübergreifender Sync braucht Google** – ohne Anmeldung gleichen sich
  nur Zeitreise und Gaming auf demselben Gerät ab (über die Links), sonst hilft
  der `.json`-Export/Import. Mit Anmeldung gewinnt pro Schlüssel der neuere
  Stand; ändert man auf zwei Geräten gleichzeitig dieselbe Sache (z. B. die
  Reise), gewinnt die spätere Änderung, es wird nichts zusammengeführt. Eine
  geöffnete Seite zeigt Änderungen von anderswo erst beim Zurückkehren in den
  Tab. Sehr große Reisen mit vielen Fotos reisen nicht im Link mit, nur über
  die Cloud.
- **Google fragt einmal pro Gerät nach Zustimmung:** Damit die Anmeldung
  bleibt, zeigt Google beim Anmelde-Tipp jedes Mal den Zustimmungs-Bildschirm,
  das passiert aber nur einmal pro Gerät. Ohne `GOOGLE_CLIENT_SECRET` in Vercel
  oder solange die App in der Google Cloud Console im Status „Testen“ steht
  (dann laufen Refresh-Tokens nach 7 Tagen ab), will Google nach einer Stunde
  bzw. einer Woche wieder einen Tipp.
- **Spotify-Einblenden nur mit Premium:** Der eingebettete Spotify-Player
  bietet keine Lautstärke an. Langsam lauter wird die Spotify-Musik nur mit
  Premium-Anmeldung am Computer: auf Handy und Tablet (iPhone, iPad, Android)
  unterstützt Spotify seinen Browser-Player nicht. Dort spielt die Zeitreise
  ganze Songs über die Spotify-App, deren Lautstärke aber die des Handys ist.
  Die Gaming-Halle nutzt die Spotify-App noch nicht.

## Pflege dieses Repos

- **[CHANGELOG.md](CHANGELOG.md):** Jede Änderung an der App bekommt dort einen
  Eintrag (neueste oben, unter „Unreleased“).
- **README.md:** Neue Funktionen kommen unter „Was RetroMind kann“, neue Ideen
  unten unter „Ideen und offene Punkte“; Umgesetztes wird dort gestrichen.
- **[gaming/README.md](gaming/README.md):** dasselbe für die Gaming-Edition
  (Funktionen und Ideen der Gaming-Edition stehen dort, nicht hier).
- **[gaming/CHANGELOG.md](gaming/CHANGELOG.md):** wird automatisch aus der
  CHANGELOG.md erzeugt: Nach jeder Änderung auf `master` baut GitHub sie neu
  und speichert sie ([`.github/workflows/gaming-changelog.yml`](.github/workflows/gaming-changelog.yml),
  [`scripts/gaming-changelog.mjs`](scripts/gaming-changelog.mjs)); dieser
  Schritt kostet keinen Vercel-Build. Von Hand geht es mit
  `npm run changelog:gaming`. Nicht von Hand bearbeiten.
- **[feedback.md](feedback.md):** Feedback aus der App landet hier
  automatisch. Unter „To Do“ in dieser README erscheint es erst, wenn Marco
  über den Link in der Feedback-Mail zustimmt. Erledigte To Dos werden
  gestrichen und im CHANGELOG vermerkt.
- **[`_removed_content/`](_removed_content/):** Entfernte Teile der App werden
  hier aufbewahrt statt gelöscht (wird nicht gebaut oder ausgeliefert).
- **Automatische Prüfung:** Bei jedem Pull Request prüft GitHub
  ([`.github/workflows/check.yml`](.github/workflows/check.yml)) mit
  `npm run typecheck` und dem Vercel-Build, ob alles fehlerfrei baut.

## Lizenz

[MIT](LICENSE) © 2026 Marco Schlude

## Ideen und offene Punkte

### To Do

Feedback aus der App, dem Marco zugestimmt hat (über den Link in der
Feedback-Mail). Alles Eingegangene steht in [feedback.md](feedback.md).

### Muss

- **Gemini-Tarif prüfen, für beide Schlüssel:** Google erlaubt Apps mit
  Nutzern in der EU nur die bezahlte Gemini-API, und im kostenlosen Tarif
  trainiert Google mit den Eingaben (auch Fotos). Zeitreise und Gaming haben
  in Vercel verschiedene `GEMINI_API_KEY`; in AI Studio prüfen, dass beide zu
  einem Projekt mit Abrechnung gehören.
- **YouTube-API-Schlüssel eintragen:** Ohne `YOUTUBE_API_KEY` liest
  `api/youtube.js` die YouTube-Suchseite aus, was YouTubes Bedingungen
  verbieten. Schlüssel für die YouTube Data API v3 anlegen und in beiden
  Vercel-Projekten eintragen; danach den Notweg entfernen.
- **Musik-Ausschnitte über den eigenen Server klären:** `api/spotify-preview.js`
  holt 30-Sekunden-Clips bei Spotify/Deezer und spielt sie über unseren
  Server aus (Tür der Gaming-Halle, Ankunft in der Zeitreise). Das ist
  urheberrechtlich das größte offene Risiko; sicherer wäre, Ausschnitte nur
  über den offiziellen Spotify-Player zu spielen.
- **Feedback-Token erneuern bis 2026-11-02:** Der GitHub-Token
  `FEEDBACK_GITHUB_TOKEN` in Vercel läuft dann ab. Ohne ihn landet Feedback
  nicht mehr in `feedback.md`, und der „Als To Do übernehmen“-Link geht nicht.

### Sollte

- **Design-System auf die übrigen Bildschirme übertragen:** Die Halte der
  Reise, die Reiseleiste und die Fahrkarte nutzen es schon
  ([`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md)); Einstellungen, die
  Fenster (Erinnerungsfrage, Postkarten, Feedback), die Startseite und die
  Helden-Seiten haben noch eigene Knopf- und Kartenstile.
- **Weitere Stitch-Screens umsetzen:** Fragen-Seite mit Tipp, Diktat und
  passendem Song, Einstellungen als eigene Seite mit Lautstärke-Regler und
  Toneffekte-Schalter (Stitch-Entwurf in `docs/stitch/`).
- **Eigene Domain** für Zeitreise und Gaming-Edition (kostet Geld, erst nach
  Rücksprache).

### Könnte

Ideen nur für die Gaming-Edition stehen in deren
[README](gaming/README.md#ideen-und-offene-punkte).

- **Gleichzeitige Änderungen zusammenführen:** Der Abgleich nimmt pro
  Schlüssel den neueren Stand. Wer auf zwei Geräten gleichzeitig reist oder
  sammelt, verliert die ältere Änderung; Erinnerungen und Sammlungen ließen
  sich stattdessen zusammenlegen (wie es die Gaming-Edition früher tat).
- **Änderungen sofort zeigen statt beim Zurückkehren:** Eine offene Seite
  übernimmt Änderungen von anderswo erst beim nächsten Wechsel in den Tab.

- **Griff wahlweise links:** Für Linkshänder:innen könnte der Griff in den
  Einstellungen an den linken Rand wandern.
- **Echte Roboterstimme und ausgesuchte Jahresvideos:** Statt der
  Sprachausgabe des Browsers (klingt je nach Gerät anders) eine einmal
  aufgenommene Roboterstimme für jedes Jahr, und statt des ersten
  Suchtreffers von YouTube ein von Hand ausgesuchtes Video pro Jahr.

- **Deutsche Nummer-1-Hits:** Die Fanfare der Ankunfts-Show nimmt die Nr. 1
  der US-Jahrescharts; für die deutsche Sprache könnte es die Nr. 1 der
  deutschen Jahrescharts sein (z. B. 1989 „Looking for Freedom“), sobald die
  Liste geprüft ist.

- **Mehr Leben in den Fenstern:** Postkarten, die sich beim Öffnen umdrehen,
  und Erinnerungsfragen, deren Text wie auf einer Schreibmaschine erscheint.

- **Helden-Seite mit mehr Material:** Zu einem Helden könnten passende
  Musik (Spotify), freie Videos von Wikimedia Commons und verwandte Helden
  („Wer gehörte noch dazu?“) angezeigt werden.

- **Weihnachten in der Stube:** In der Weihnachtszeit könnte die Stube
  einen Christbaum, einen Adventskranz und Schnee vor dem Fenster bekommen.
- **Mehr Rezepte in Omas Kochbuch:** Eigene Rezepte der Familie
  hinzufügen (mit Foto aus dem Memory-Labor) und ins Erinnerungsbuch
  übernehmen; das Kochbuch könnte auch als Ecke in der Stube auftauchen.
- **Adventskalender jedes Jahr neu:** Für jedes Jahr eine andere Füllung
  der 24 Türchen, damit es im nächsten Dezember wieder Überraschungen gibt.

- **Grabbelkiste im Erinnerungsbuch:** Die gesammelten Sprüche könnten als
  eigene Seite ins Erinnerungsbuch und mit ins Google-Drive-Backup.

- **Jahrzehnt 2020er (und 1950er) in der Zeitreise:** Wer nach etwa 2012
  geboren ist, hatte seine Grundschulzeit in den 2020ern, wer vor etwa 1952
  geboren ist, in den 1950ern. Beide starten bisher beim nächstgelegenen
  Jahrzehnt; eigene Inhalte dafür würden passen.

- **Weitere Editionen** nach dem Vorbild der Gaming-Edition, z. B. Musik,
  Film & Fernsehen oder Spielzeug, mit gemeinsamem Stummschalter und
  gemeinsamer Anmeldung.
- **Erinnerungs-Buch als gestaltetes PDF** mit Fotos aus dem Memory-Labor,
  statt über den Druckdialog.
- **Erinnerungen teilen:** Ein Buch oder einzelne Erinnerungen mit Familie
  und Freund:innen teilen, die eigene Erinnerungen ergänzen (das Familienbuch
  mit der Wochenfrage ist ein erster Schritt).
- **Erinnerung per Push oder Mail:** Eine Nachricht, wenn die Frage der Woche
  da ist oder jemand im Familienbuch geantwortet hat. Braucht eine
  ausdrückliche Einwilligung und gespeicherte Daten pro Person (Push-Schlüssel
  oder E-Mail-Adresse mit Double-Opt-in); Push klappt auf dem iPhone nur bei
  installierter App, Mails über Resend sind im kleinen Rahmen kostenlos.
- **Video im Memory-Labor ohne Google-Billing**, z. B. durch eine animierte
  Diashow statt Veo.
