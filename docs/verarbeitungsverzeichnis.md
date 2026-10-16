# Verzeichnis der Verarbeitungstätigkeiten (Art. 30 DSGVO)

Verantwortlicher: Marco Schlude, Anschrift und Kontakt siehe
[Impressum](../public/impressum.html). Kein Datenschutzbeauftragter
(nicht erforderlich). Stand: 15. Oktober 2026 (Gästeliste ergänzt).

Gilt für RetroMind – Zeitreise (retromind.vercel.app) und RetroMind – Gaming
(retromind-gaming.vercel.app). Bei jeder neuen Datenverarbeitung hier eine
Zeile ergänzen und die [Datenschutzerklärung](../public/datenschutz.html)
(de und en) anpassen.

Allgemeine technische und organisatorische Maßnahmen (Art. 32): Übertragung
nur per HTTPS; API-Schlüssel nur als geheime Umgebungsvariablen in Vercel,
nie im Browser; Nutzerdaten liegen im Browser der Nutzer, nicht auf unserem
Server; fremde Inhalte über den eigenen Proxy (`api/proxy.js`) ohne
Weitergabe der IP-Adresse; Adminbereich nur nach Google-Anmeldung mit
Marcos Konto; Zugriff auf Vercel, GitHub, Upstash, Resend und Google Cloud
nur durch Marco.

| Nr. | Tätigkeit | Zweck | Betroffene und Daten | Rechtsgrundlage | Empfänger / Auftragsverarbeiter (Drittland) | Speicherdauer |
|---|---|---|---|---|---|---|
| 1 | Auslieferung der Seiten | Website bereitstellen und schützen | Alle Besucher: IP-Adresse, Zeit, Adresse, User-Agent | Art. 6 (1) f | Vercel Inc. (USA, DPF + SCC) | kurze Server-Logs bei Vercel |
| 2 | Speicherung im Browser | Reise, Profil, Savegame, Einstellungen | Nutzer: Name, Geburtsdatum, Geschlecht, Interessen, Erinnerungen, Fotos, Tagebuch, Spielstände | Art. 6 (1) b, § 25 (2) TDDDG | keine (nur auf dem Gerät) | bis der Nutzer löscht („Meine Daten“) |
| 3 | KI-Funktionen | Fragen, Chat, Fotoanalyse, Videos, Heldensuche, Guru, Spiele-Guides | Nutzer ab 18: eingegebene Texte, hochgeladene Fotos, Jahrzehnt, Spieltitel | Art. 6 (1) b | Google Ireland / Google LLC, Gemini-API bezahlte Stufe (USA, DPF) | keine Speicherung bei uns; bei Google nach deren Bedingungen |
| 4 | Google-Anmeldung und Drive-Sicherung | Sicherung im eigenen Drive, Profil vorausfüllen | Name, E-Mail, Bild, Geburtstag, Geschlecht, Spielstand | Art. 6 (1) a, § 25 (1) TDDDG | Google (USA, DPF) | Token 1 h im Browser; Sicherung im Drive des Nutzers |
| 5 | Spotify (Player, Anmeldung, Web Playback) | Musik | IP, Geräteinfos, Spotify-Konto, gehörte Songs | Art. 6 (1) a, § 25 (1) TDDDG | Spotify AB (Schweden) | Token im Browser; bei Spotify nach deren Bedingungen |
| 6 | YouTube-Player | Videos (Jahresrückblick, Spielvideos) | IP, Geräteinfos | Art. 6 (1) a, § 25 (1) TDDDG | Google Ireland (youtube-nocookie.com) | bei Google nach deren Bedingungen |
| 7 | Suchen über unseren Server (YouTube-Suche, Wikipedia, Wikidata, Commons, Deezer-Ausschnitte, Open-Meteo) | Inhalte anzeigen | nur Suchbegriff, Songtitel oder gerundete Koordinaten, keine Daten über die Person | Art. 6 (1) b bzw. a (Wetter) | die jeweilige Quelle | Antworten im Vercel-CDN (ohne Personenbezug) |
| 8 | Nutzungsstatistik | Wissen, wie stark RetroMind genutzt wird | Tagesbezogener Einweg-Hash aus IP und User-Agent (nicht gespeichert), Geräteart, geöffnetes Jahrzehnt/Spiel | Art. 6 (1) f | Upstash Inc. (Server in der EU, SCC) | Zufallswert max. 2 Tage; danach nur Zahlen ohne Personenbezug |
| 9 | Highscore-Tafel | Bestenliste | Drei frei gewählte Zeichen, Punktzahl, Spiel | Art. 6 (1) a | Upstash Inc. (EU) | beste 50 pro Spiel; Löschung auf Wunsch |
| 10 | Feedback | Rückmeldungen beantworten | Nachricht, Kategorie, freiwillig E-Mail | Art. 6 (1) a | Resend Inc. (USA, SCC), Gmail (Google), GitHub Inc. (USA, öffentlich, ohne E-Mail) | Mail bis erledigt; `feedback.md` bis Löschwunsch |
| 12 | Zugang nur für Gäste (`middleware.js`, `/gate.html`) | RetroMind privat halten | Eingeladene: E-Mail-Adresse (Gästeliste), Cookie `rm_guest` mit E-Mail, Zeitpunkt, Signatur | Art. 6 (1) f und b, § 25 (2) Nr. 2 TDDDG | Google (Anmeldung, USA, DPF), Upstash Inc. (EU) | Cookie 30 Tage ab letzter Prüfung; Gästeliste bis Austragung; Einmal-Code für den Wechsel zwischen den Domains höchstens 2 Minuten. Die Anmeldung an der Tür gilt zugleich als Google-Anmeldung der Apps (Zeile zur Google-Anmeldung) |
| 11 | Adminbereich | Zahlen und Feedback ansehen | Marcos Google-Konto (Prüfung des Tokens) | Art. 6 (1) f | Google (Token-Prüfung) | keine Speicherung |

Löschkonzept: Nutzerdaten liegen im Browser und werden über „Alle meine Daten
löschen“ oder „Neu beginnen“ entfernt. Serverseitig gibt es nur
Highscore-Einträge und Feedback; beides wird auf formlose Anfrage gelöscht.
Anfragen nach Art. 15 bis 21 beantwortet Marco innerhalb eines Monats.

Datenschutz-Folgenabschätzung (Art. 35): nicht erforderlich. Es gibt kein
Profiling, keine Werbung, keine umfangreiche Verarbeitung besonderer
Kategorien und keine systematische Überwachung; Gesundheits- oder ähnliche
Daten werden nicht abgefragt.
