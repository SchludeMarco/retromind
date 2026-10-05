# Entfernte Inhalte

Hier liegen Teile der App, die aus der Oberfläche genommen wurden, damit sie
bei Bedarf wieder eingesetzt werden können. Nichts in diesem Ordner wird
gebaut oder ausgeliefert.

- `Header.tsx`: der frühere Kopfbereich mit der großen Text-Überschrift
  „RetroMind“ (entfernt am 2026-10-03, ersetzt durch das Logo-Bild
  `public/retromind-logo-header.webp`).
- `retromind-logo-clear.webp`: das kleine freigestellte Logo, das kurz in
  der Willkommens-Karte stand (entfernt am 2026-10-03, das Logo steht jetzt
  im Kopfbereich).
- `SettingsFeedback.tsx.txt`: der Feedback-Abschnitt aus den Einstellungen der
  Zeitreise und der Gaming-Edition (entfernt am 2026-10-05, Feedback öffnet
  jetzt über das Briefsymbol direkt auf der Startseite bzw. in der Kopfleiste).
- `PowerOn.tsx.txt`, `power-on-intro.css.txt`, `diesel-start.mp3`: das frühere
  Einschalt-Intro der Gaming-Edition mit Power-Knopf vor der Betonwand,
  Einsaug-Wirbel, Boot-Logo mit Diesel-Startgeräusch und „PRESS START“-
  Titelbild mit C64-Melodie (entfernt am 2026-10-05, ersetzt durch den
  Eingang mit Graffiti-Tür in `gaming/components/Entrance.tsx`). Der
  Abspiel-Code für Diesel und Titelmelodie steht in `gaming/lib/chiptune.ts`
  vor PR #99 in der Git-Historie.
- `Entrance-graffiti-tuer.tsx.txt`, `entrance-graffiti-tuer.css.txt`: der
  Gaming-Eingang mit gezeichneter, kaputter Graffiti-Holztür vor der
  Betonwand (entfernt am 2026-10-05, ersetzt durch Marcos Bild der
  „Arcade Hallen“).
- `ambient-pad.ts.txt`: die leise Akkord-Musik mit Spieluhr-Tönen vor dem
  Gaming-Eingang (entfernt am 2026-10-05, ersetzt durch die Straßengeräusche
  mit Menschenmenge, Sirenen und Rauferei).
- `SplashScreen-funken-explosion.tsx.txt`, `splash-explosion.css.txt`: der
  frühere „Let's go!“-Knopf des Willkommens-Bildschirms mit Funken-Explosion,
  Druckwelle und Knall (entfernt am 2026-10-05, ersetzt durch Gong und weiße
  Überblendung).
