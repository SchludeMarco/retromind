# Changelog

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
