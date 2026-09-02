# RetroMind: Deine Zeitreise (V1.1.0)

Eine interaktive Reise durch die eigene Biografie. RetroMind reaktiviert
Kindheitserinnerungen über ein personalisiertes Onboarding, visuelle
Jahrzehnt-Galerien, eine interaktive Buzzword-Wand (1960–2000), ein
„Nostalgie-Radio“ und mehrere KI-Funktionen auf Basis von Google Gemini.

Entstanden als eigenständiges Portfolio-Projekt (ursprünglich in Google AI
Studio prototypisiert) im Umfeld der Sm@rt-App-Familie.

## Features

- **Geführte 6-Phasen-Reise** – `intro → onboarding → induction → exploration → diary → finish`
  mit Fortschrittsanzeige.
- **Personalisiertes Onboarding** – Name, Geburtsdatum und Interessen; das
  Kindheits-Jahrzehnt wird aus dem Geburtsjahr berechnet.
- **Jahrzehnt-Datenbank 1960–2000** – handkuratierte Inhalte je Dekade
  ([`constants.ts`](constants.ts)): Galerie-Motive, Buzzwords mit Wissenstext
  und Erinnerungsfragen, passender Radio-Stream.
- **Nostalgie-Radio** – dekadenabhängige Hintergrundmusik mit Lautstärke- und
  Ära-Auswahl, dazu UI-Soundeffekte.
- **KI-Erinnerungsfragen** (Gemini Flash-Lite) – zu jedem Buzzword eine
  individuell auf Name, Interessen und Jahrzehnt zugeschnittene Frage.
- **Memory-Labor** – altes Foto hochladen und
  - per **Gemini** analysieren lassen (nostalgische Bildbeschreibung), oder
  - per **Veo** zu einem kurzen Video „zum Leben erwecken“ (Premium-Feature,
    benötigt API-Key mit Billing).
- **Nostalgie-Begleiter** – Chat-Widget auf Basis von Gemini.
- **Erinnerungs-Tagebuch** – freies Textfeld; Eintrag und Profil werden im
  Browser (`localStorage`) gesichert und überstehen einen Reload, plus
  `.txt`-Export.

## Tech-Stack

- **React 19** + **TypeScript**, Build über **Vite 6**
- **Tailwind CSS** (Play-CDN) + eigenes Retro-Theme in [`index.html`](index.html)
- **@google/genai** – Gemini (Text, Vision, Chat) und Veo (Video)
- Externe Assets: Google Fonts, picsum.photos (Galeriebilder),
  soundhelix.com (Radio), mixkit (SFX), transparenttextures.com (Textur)

## Lokal ausführen

**Voraussetzungen:** Node.js ≥ 18

```bash
npm install
cp .env.example .env.local   # und GEMINI_API_KEY eintragen
npm run dev
```

| Skript            | Zweck                          |
| ----------------- | ------------------------------ |
| `npm run dev`     | Dev-Server (Port 3000)         |
| `npm run build`   | Produktions-Build nach `dist/` |
| `npm run preview` | Build lokal testen             |

## Konfiguration

| Variable         | Beschreibung                                                    |
| ---------------- | -------------------------------------------------------------- |
| `GEMINI_API_KEY` | Google-Gemini-API-Schlüssel. Wird in `.env.local` gesetzt.    |

Der Schlüssel wird zur Build-Zeit über [`vite.config.ts`](vite.config.ts)
(`define: process.env.API_KEY / process.env.GEMINI_API_KEY`) eingebettet.

## Bekannte Einschränkungen

- **API-Key im Client-Bundle.** Da die App rein clientseitig läuft, ist der
  Gemini-Schlüssel im ausgelieferten JavaScript sichtbar. Für ein
  öffentliches Deployment sollte ein per Referrer eingeschränkter,
  ausschließlich für die Gemini-API freigegebener Schlüssel verwendet werden –
  oder ein serverseitiger Proxy vorgeschaltet werden.
- Die **Veo-Video-Funktion** hängt den Schlüssel als Query-Parameter an die
  Download-URL an ([`services/geminiService.ts`](services/geminiService.ts))
  und benötigt ein Google-Cloud-Projekt mit aktivem Billing.
- Die **Key-Auswahl über `window.aistudio`** funktioniert nur innerhalb von
  Google AI Studio. Standalone wird ein per `GEMINI_API_KEY` eingebauter
  Schlüssel erkannt; fehlt er ganz, liefern die KI-Funktionen vordefinierte
  Fallback-Texte (Erinnerungsfragen kommen dann aus [`constants.ts`](constants.ts)).
- Es werden **Vorschau-Modelle** genutzt (`gemini-3-pro-preview`,
  `veo-3.1-fast-generate-preview`) – deren IDs können sich ändern.
- **Kein Backend:** Profil und Tagebuch werden nur im `localStorage` des
  Browsers gehalten (plus manueller `.txt`-Export). Kein Sync über Geräte.
- Die **Tailwind-Play-CDN** ([`index.html`](index.html)) ist bequem, aber nicht
  für Produktion optimiert (JIT im Browser, kein Purge).

## Lizenz

[MIT](LICENSE) © 2026 Marco Schlude
