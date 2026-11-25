# Recorded voice clips

The "Welcome back" at the start of the Zeitreise (lib/robotVoice.ts,
`announceWelcomeBack`). Made on 2026-11-25 with free, openly licensed
speech models, run offline; no paid service, no running costs.

| File | Text | Model | Voice | License |
| --- | --- | --- | --- | --- |
| welcome-back-en.mp3 | "Welcome back." | Kokoro-82M v1.0 (kokoro-onnx) | am_michael (male), speed 0.85 | Apache-2.0 |
| welcome-back-de.mp3 | "Willkommen zurück." | Piper, Thorsten (low), length-scale 1.05 | Thorsten-Voice dataset (male) | CC0 |

Since 2026-11-25 (Marco wanted it more spectacular) the clip is a small
"time machine" sound design, mixed in Python/numpy: a 1.3 s synth riser
with rising noise, a sub boom, then the voice pitched down slightly
(0.9) with 55 Hz ring modulation and a flanger, an octave-down copy
underneath, and a large multi-tap hall. Loudness normalized to about
-14 LUFS (peak -1.5 dB), mono, 24 kHz, 80 kbit/s MP3. All sounds are
synthesized; nothing from third parties besides the voice models above.
