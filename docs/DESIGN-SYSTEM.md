# RetroMind design system (Zeitreise)

Marco, 2026-10-14: „Die App soll sich anfühlen, als würde man wirklich eine
Zeitreise machen – klar geführt, atmosphärisch und mit einem durchgängigen
roten Faden.“ This page is that thread: one metaphor, one journey, one set
of tokens. All three designs (Retro Warm, Klassisch, Nachtschicht) fill the
same tokens with their own character.

## 1. The metaphor

**The mantel clock is the time machine.** It leads, everything else supports it.

| Moment | What you see | Where |
|---|---|---|
| Welcome | the ticking clock in the dark room, "Go back..." | `components/SplashScreen.tsx` |
| Start | the time machine pulls you into the dial (spiral, rings, light, iris) + sound | `SplashScreen`, `lib/clockSounds.ts` `playWarp` |
| Name + birthday | still in the dark clock room: a paper *ticket to your past* | `components/VerifyGate.tsx` |
| "Set the clock" | the hands race backwards, the room opens like an iris | `VerifyGate`, `App.tsx` (`arrival`) |
| Home | the living room (Stube): where the traveller lives between trips | `components/LivingRoom.tsx` |
| Every stop | the journey bar: a little clock whose hand points at the stop | `components/JourneyBar.tsx` |

The living room, the TV, the record player and the memory book are places
*on* the journey; they never replace the clock as the guide. New screens
should say where they sit on the journey (the journey bar does this for
every stop) rather than introduce a new metaphor.

## 2. The journey

Seven stops, one name each, everywhere (`lib/stations.ts`):

| # | Phase | English | Deutsch | Short |
|---|---|---|---|---|
| 1 | intro | Home | Zuhause | Home / Zuhause |
| 2 | onboarding | Your profile | Dein Profil | Profile / Profil |
| 3 | induction | Your era | Deine Zeit | Era / Zeit |
| 4 | exploration | Explore | Erkunden | Explore / Erkunden |
| 5 | diary | Diary | Tagebuch | Diary / Tagebuch |
| 6 | book | Memory book | Erinnerungsbuch | Book / Buch |
| 7 | finish | Journey’s end | Ankunft | End / Ankunft |

A stop is a *Halt* ("Halt 4 von 7", "Nächster Halt") in German and a *stop*
in English. Never invent another name for a stop in a button or heading.

Every stop has:

1. the **journey bar** on top (where am I, what came before, jump anywhere),
   and its slim pill while scrolling (back / next always one tap away),
2. a **stop header** (`StopHeader`: eyebrow, one title, a calm lead),
3. its content,
4. the **phase nav** at the end (`PhaseNav`): one primary "Next stop: …",
   one quiet secondary back.

Sub-pages of a stop (a Sparte on Explore) show as a breadcrumb in the bar
("Explore › Music"); tapping "Explore" goes back up.

## 3. Tokens

Colours are the `--color-retro-*` tokens in `index.css` (each design
redefines them). Shape, depth and spacing:

| Token | Klassisch | Retro Warm | Nachtschicht |
|---|---|---|---|
| `--rm-radius-card` | 0 | 1rem | 0 |
| `--rm-radius-control` | 0 | pill | 0 |
| `--rm-border-w` / `--rm-border-color` | 2px ink | 1px sepia line | 2px cream |
| `--rm-shadow-card` | 8px hard ink | soft warm | 8px hard black + amber glow |
| `--rm-shadow-float` | 4px hard ink | soft warm | 4px hard black + glow |
| `--rm-accent` | amber-dark | terracotta-dark | amber-light |

Spacing scale: `--rm-space-1` 0.25rem, `-2` 0.5, `-3` 0.75, `-4` 1,
`-6` 1.5, `-8` 2, `-12` 3. Section gaps use 8 or 12, inside cards 4 or 6.

## 4. Type

| Role | Class | Notes |
|---|---|---|
| Eyebrow | `.rm-eyebrow` | 12px, bold, spaced capitals, tan. Says *where* or *what kind*. |
| Title | `.rm-title` | serif of the design, 28–40px, one per screen. |
| Lead | `.rm-lead` | brown, 1.6 line height, max 62 characters wide. |
| Body | – | the design's body font, at least 16px (base 18px). |

No text below 12px.

## 5. Buttons

- **Primary** (one per screen, the next step): `retro-button rm-btn bg-retro-ink text-white`.
  Ink in Klassisch, terracotta pill in Retro Warm, cream on dark in Nachtschicht.
- **Secondary**: `rm-btn rm-btn-secondary`, outlined, paper background.
- **Start-type buttons** in the dark clock room ("Go back...", "Set the
  clock") use `.splash-start`, which wears the chosen design.
- Touch targets at least 44px, primary 48px.

## 6. Cards

`.retro-card`: paper, border and shadow from the tokens. The journey bar
uses `--rm-shadow-float`, a step lighter than content cards.

## 7. Motion and sound

- Arrivals and departures are *iris* openings from the centre
  (`.rm-iris-open`), not cuts or plain fades.
- Clock hands that race backwards (`MantelClock rewinding`) mean "time is
  moving".
- Every sound starts quietly (`lib/startupFade.ts`) and stays in the mids
  for phone speakers; nothing plays when muted.
- Everything has a calm version under `prefers-reduced-motion`.

## Still to bring into the system

Settings, the modal windows (memory question, postcards, feedback), the
start page cards and the hero pages still use their own button and card
styles (README, "Sollte").
