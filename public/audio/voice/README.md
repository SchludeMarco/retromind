# Recorded voice clips

The "Welcome back" at the start of the Zeitreise (lib/robotVoice.ts,
`announceWelcomeBack`). Made on 2026-11-25 with free, openly licensed
speech models, run offline; no paid service, no running costs.

| File | Text | Model | Voice | License |
| --- | --- | --- | --- | --- |
| welcome-back-en.mp3 | "Welcome back." | Kokoro-82M v1.0 (kokoro-onnx) | am_fenrir (male), speed 0.85 | Apache-2.0 |
| welcome-back-de.mp3 | "Willkommen zurück." | Piper, Thorsten (low), length-scale 1.2 | Thorsten-Voice dataset (male) | CC0 |

Since 2026-11-25 (Marco: "beide Stimmen männlich und ein bisschen
dämonenhaft") both are made demonic with ffmpeg: silence trimmed, voice
pitched down (rubberband pitch 0.78), a second copy an octave lower
(pitch 0.5, low-passed at 1.2 kHz, volume 0.55) mixed under it, soft tanh
clipping, a short cave echo (aecho 70/140 ms), then loudness normalized
to about -14 LUFS (peak -1.5 dB), mono, 24 kHz, 64 kbit/s MP3.
