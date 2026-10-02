# Changelog

## Unreleased

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
