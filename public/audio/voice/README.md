# Recorded voice clips

The "Welcome back" at the start of the Zeitreise (lib/robotVoice.ts,
`announceWelcomeBack`). Made on 2026-11-25 with free, openly licensed
speech models, run offline; no paid service, no running costs.

| File | Text | Model | Voice | License |
| --- | --- | --- | --- | --- |
| welcome-back-en.mp3 | "Welcome back!" | Kokoro-82M v1.0 (kokoro-onnx) | af_heart | Apache-2.0 |
| welcome-back-de.mp3 | "Willkommen zurück!" | Piper, Thorsten (low) | Thorsten-Voice dataset | CC0 |

Post-processing with ffmpeg: silence trimmed, loudness normalized to
about -14 LUFS (peak -1.5 dB), mono, 24 kHz, 64 kbit/s MP3.
