# RetroMind: Deine Zeitreise (V2.0.0)

**Live: https://retromind.vercel.app**

Eine interaktive, KI-gestützte Reise durch die eigene Biografie. RetroMind führt
Jahrzehnt für Jahrzehnt (1960–2010) zurück, stellt persönliche Erinnerungsfragen,
**sammelt die Antworten** und fasst sie zu einem exportierbaren **Erinnerungs-Buch**
zusammen.

Entstanden als eigenständiges Portfolio-Projekt (ursprünglich in Google AI Studio
prototypisiert) im Umfeld der Sm@rt-App-Familie.

## Features

- **Geführte Reise in 7 Phasen** – `intro → onboarding → induction → exploration → diary → book → finish`
  mit Fortschrittsanzeige und freier Navigation zwischen den Phasen.
- **Personalisiertes Onboarding** – Name, Geburtsdatum, optional Geschlecht,
  Interessen und Lieblingsmusiker:innen (freie Eingabe). Das Kindheits-
  Jahrzehnt wird berechnet und auf 1960–2010 begrenzt. Alles selbst
  angegeben – RetroMind "verifiziert" kein Alter/Geschlecht über Dritte,
  weil keiner der Logins (Google, Spotify) das überhaupt hergibt.
- **Jahrzehnt-Impressionen** – kuratierte Zeit-„Postkarten“ je Dekade
  ([`constants.ts`](constants.ts)); wo ein echtes gemeinfreies Bild hinterlegt ist
  (z. B. NASA-Mondlandung), wird es gezeigt, sonst greift eine typografische Karte.
  Ehrlich als *symbolische Impressionen* gekennzeichnet.
- **Erinnerungs-Wand** – Stichworte aus fünf Jahrzehnten, sortiert nach deinen
  Interessen. Pro Stichwort eine **KI-generierte persönliche Frage** und ein
  Antwortfeld – **mit Spracheingabe** (Web Speech API) wo verfügbar. Antworten
  landen automatisch im Buch.
- **Memory-Labor** – altes Foto hochladen (client-seitig verkleinert), von
  **Gemini** beschreiben lassen und die Beschreibung als Erinnerung übernehmen;
  optional per **Veo** zu einem kurzen Video animieren (benötigt Google-Billing).
- **Nostalgie-Radio** – dekadenabhängiges Instrumental-Ambiente (ehrlich
  gelabelt, kein Ära-Sound), Lautstärke- und Ära-Wahl, UI-Sounds. Sobald man
  einmal irgendwo klickt/tippt (Browser verlangen diese Interaktion, bevor
  Ton laufen darf), starten automatisch **zwei** Dinge gleichzeitig: unser
  Synth blendet über 10s von 0% auf die eingestellte Lautstärke ein, und im
  Hintergrund läuft zusätzlich Spotifys offizielle „All Out …“-Playlist der
  gewählten Dekade als Embed – streamt direkt von Spotify (wird nie von uns
  gehostet) und in Spotifys eigener, von uns nicht regelbarer Lautstärke, da
  die Embed-API dafür keine Schnittstelle bietet. In den Einstellungen lässt
  sich der Spotify-Anteil separat pausieren.
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
  kann so auf einem anderen Gerät weitermachen. Ohne konfigurierte Google-Client-ID
  bleibt die App unverändert rein lokal nutzbar.
- **Spotify-Login (optional)** – „Mit Spotify anmelden“ (Authorization Code +
  PKCE, komplett clientseitig, kein eigener Auth-Server) holt Name und
  Premium-/Free-Status ab. Läuft unabhängig vom bestehenden
  Playlist-Embed (siehe Nostalgie-Radio) und beeinflusst dessen Wiedergabe
  nicht. Ohne konfigurierte Spotify-Client-ID bleibt der Button unsichtbar.
- **Barrierefreiheit** – Schriftgrößen-Umschalter (A / A+ / A++), größere Grund-
  schrift, Fokus-Ringe, Tastatur-/Esc-Bedienung und Fokus-Falle in Dialogen,
  `prefers-reduced-motion`, ARIA-Labels.
- **Feedback-Button** – in den Einstellungen kann jede Nutzer:in Lob, Tadel,
  Vorschläge oder Wünsche zur App hinterlassen; die Nachricht kommt per E-Mail
  an die Betreiber:in an (optional: eigene E-Mail-Adresse für eine Antwort).
  Ohne konfigurierten Versand (siehe unten) meldet der Button, dass Feedback
  hier nicht zugestellt werden kann.
- **Datenschutz-Hinweis** im Intro; **Error Boundary** gegen weiße Seiten.

## Architektur

```
Browser (React/Vite SPA)  ──fetch──▶  /api/gemini   (Vercel Function)  ──▶  Google Gemini / Veo
                          ──fetch──▶  /api/video    (Vercel Function)  ──▶  Veo-Download (streamt)
                          ──fetch──▶  /api/feedback (Vercel Function)  ──▶  Resend (E-Mail-Versand)
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
- **Tailwind CSS** (Play-CDN) + eigenes Retro-Theme in [`index.html`](index.html)
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
| `VITE_GOOGLE_CLIENT_ID`  | Vercel-Env  | Optional: OAuth-Client-ID für „Mit Google anmelden” (Login + Drive-Sicherung); ohne sie bleibt der Button ausgeblendet |
| `RESEND_API_KEY`         | Vercel-Env  | Optional: API-Schlüssel von [resend.com](https://resend.com) für den Feedback-Versand (nur serverseitig) |
| `FEEDBACK_TO_EMAIL`      | Vercel-Env  | Optional: Ziel-E-Mail-Adresse für eingereichtes Feedback; ohne `RESEND_API_KEY` + diese Variable meldet der Feedback-Button „nicht verfügbar” |
| `FEEDBACK_FROM_EMAIL`    | Vercel-Env  | Optional: Absenderadresse der Feedback-Mail (Standard: Resend-Sandbox-Adresse) |

## Bekannte Einschränkungen

- **Veo-Video** braucht ein Google-Cloud-Projekt mit aktivem Billing; ohne das
  meldet das Labor einen Fehler statt eines Videos.
- **Vorschau-Modell** für Video (`veo-3.1-fast-generate-preview`) – ID kann sich
  ändern. Text/Vision/Chat nutzen GA-Modelle.
- **Bilder & Musik** sind bewusst symbolisch (Lizenzgründe) und als solche
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
- **Tailwind Play-CDN** ist nicht für Hochlast-Produktion optimiert.

## Lizenz

[MIT](LICENSE) © 2026 Marco Schlude
