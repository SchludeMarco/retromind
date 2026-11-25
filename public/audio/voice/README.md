# Recorded voice clips

The "Welcome back" at the start of the Zeitreise (lib/robotVoice.ts,
`announceWelcomeBack`). Made on 2026-11-25 with free, openly licensed
speech models, run offline; no paid service, no running costs.

| File | Text | Model | Voice | License |
| --- | --- | --- | --- | --- |
| welcome-back-en.mp3 | "Welcome back." | Kokoro-82M v1.0 (kokoro-onnx) | am_michael (male), speed 0.85 | Apache-2.0 |
| welcome-back-de.mp3 | "Willkommen zurück." | Piper, Thorsten (low), length-scale 1.05 | Thorsten-Voice dataset (male) | CC0 |

Since 2026-11-25 (Marco: "lieber eine leichte roboterhaftige Stimme in
deutsch und englisch") both get a light robot touch with ffmpeg: silence
trimmed, a short metallic flanger (delay 1.5 ms, regen 55), a 12 ms comb
echo and a 120 Hz high-pass, then loudness normalized to about -14 LUFS
(peak -1.5 dB), mono, 24 kHz, 64 kbit/s MP3. Pitch stays natural.
