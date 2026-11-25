# Recorded voice clips

The "Welcome back" at the start of the Zeitreise (English in both app
languages since 2026-11-25; the German clip is in _removed_content/) (lib/robotVoice.ts,
`announceWelcomeBack`). Made on 2026-11-25 with free, openly licensed
speech models, run offline; no paid service, no running costs.

| File | Text | Model | Voice | License |
| --- | --- | --- | --- | --- |
| welcome-back-en.mp3 | "Welcome back." | Kokoro-82M v1.0 (kokoro-onnx) | am_michael (male), speed 0.85 | Apache-2.0 |

Since 2026-11-25 (Marco: the robot voice was too unclear, "eher
menschlich aber doch ein bisschen roboterhaft") the clip keeps the short
time machine intro (1.0 s synth riser, soft sub boom) but the voice is
mostly the dry natural voice: 85 % dry, a parallel robot layer (70 Hz
ring modulation through a flanger) at 22 %, an octave-down copy at 12 %,
a little presence lift and only a short room echo. Mixed in Python/numpy
(the script is kept in the project files), loudness normalized to about
-14 LUFS (peak -1.5 dB), mono, 24 kHz, 80 kbit/s MP3.
