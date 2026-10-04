---
name: RetroMind Zeitreise
colors:
  surface: '#fff8f5'
  surface-dim: '#e5d7ce'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1e8'
  surface-container: '#faebe1'
  surface-container-high: '#f4e6db'
  surface-container-highest: '#eee0d6'
  on-surface: '#211a14'
  on-surface-variant: '#58423c'
  inverse-surface: '#372f28'
  inverse-on-surface: '#fdeee4'
  outline: '#8b716a'
  outline-variant: '#dfc0b7'
  surface-tint: '#a73918'
  primary: '#a43716'
  on-primary: '#ffffff'
  primary-container: '#c54f2c'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb5a0'
  secondary: '#805600'
  on-secondary: '#ffffff'
  secondary-container: '#fdba49'
  on-secondary-container: '#704b00'
  tertiary: '#34645c'
  on-tertiary: '#ffffff'
  tertiary-container: '#4d7d74'
  on-tertiary-container: '#f4fffb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a0'
  on-primary-fixed: '#3b0900'
  on-primary-fixed-variant: '#862201'
  secondary-fixed: '#ffddaf'
  secondary-fixed-dim: '#fdba49'
  on-secondary-fixed: '#281800'
  on-secondary-fixed-variant: '#614000'
  tertiary-fixed: '#baede2'
  tertiary-fixed-dim: '#9ed0c6'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#1d4f47'
  background: '#fff8f5'
  on-background: '#211a14'
  surface-variant: '#eee0d6'
typography:
  headline-xl:
    fontFamily: Epilogue
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Epilogue
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: 0em
  headline-md:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Epilogue
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2.5rem
  margin-mobile: 1.25rem
  space-xs: 0.375rem
  space-sm: 0.75rem
  space-md: 1.25rem
  space-lg: 2rem
  space-xl: 3rem
---

## Brand & Style
The design system embodies a warm, tactile, and nostalgic design language crafted specifically for adults aged 35–75 embarking on memory journeys across past decades. Drawing inspiration from Mid-Century print ephemera, archival photo albums, and timeless editorial typography, the system balances nostalgic charm with contemporary accessibility standards. 

The emotional signature is reassuring, evocative, and dignified—never gimmicky or kitsch. Surfaces feel like archival paper stock and pressed linen, providing high legibility, tactile warmth, and an intuitive hierarchy that accommodates varying visual and motor capabilities.

## Colors
The palette evokes aged paper, warm ceramic glazes, and archival inks. Contrast ratios rigorously surpass WCAG AAA standards for critical text, prioritizing immediate legibility for mature eyes.

- **Primary Canvas (`#F7F3E9`):** Soft, parchment-like cream that eliminates harsh display glare while maintaining high perceptual clarity.
- **Card Surfaces (`#FFFFFF` and `#FFFDF8`):** Off-white editorial surfaces bound by quiet, low-contrast sepia borders (`#E6DAC8`).
- **Primary Ink (`#231C16`):** Deep espresso charcoal delivering uncompromising contrast against light backgrounds.
- **Secondary Ink (`#67584E`):** Warm sepia slate, reserved for metadata, timestamps, and supplementary captions.
- **Primary Accent (`#D95D39` & Hover `#BF4B28`):** Warm terracotta driving primary interactions, active states, and focal calls-to-action.
- **Support Accents:** Golden Amber (`#E8A838`) indicates milestones and highlights, while Vintage Teal (`#4B7B72`) serves informational cues and audio states.

## Typography
Typography bridges retro editorial prestige with modern accessibility. 

- **Display & Headlines (Epilogue):** An expressive sans-serif with subtle geometric warmth and mid-century print character. Bold weights lend clear signposting for section headers, decade markers, and titles.
- **Body & Controls (Plus Jakarta Sans):** A friendly, open-aperture sans-serif designed for legibility at all scales. Generous default sizing (minimum 16px, preferred 18px) and heightened line-height ensure fatigue-free reading for users aged 35–75.

## Layout & Spacing
The layout model enforces calm structure, generous whitespace, and predictable spatial pacing. 

- **Grid Architecture:** Desktop views conform to an 8-column layout capped at 1120px to prevent uncomfortably long lines of body copy. Mobile views transition into a fluid single-column stack with ample edge breathing room (`margin-mobile: 1.25rem`).
- **Touch Targets:** Components reserve minimum physical interaction targets of 48px × 48px to support relaxed motor input across touch screens and pointing devices.

## Elevation & Depth
Depth avoids sterile, cold drop shadows in favor of warm, tactile physical layers reminiscent of stacked card stock and bound photo folios.

- **Level 0 (Base Canvas):** Flat `#F7F3E9` background.
- **Level 1 (Default Cards & Interactive Panels):** Crisp surface in `#FFFDF8` or `#FFFFFF`, enclosed by a 1px solid border (`#E6DAC8`) and an ambient, warm-tinted diffused drop shadow (`0 2px 6px rgba(35, 28, 22, 0.05), 0 1px 2px rgba(35, 28, 22, 0.03)`).
- **Level 2 (Hovered / Active Cards & Modals):** Accentuated elevation with a richer warm cast (`0 8px 24px rgba(35, 28, 22, 0.08), 0 2px 6px rgba(35, 28, 22, 0.04)`), paired with a slight -1px vertical lift on pointer interactions.

## Shapes
Geometry is friendly and gentle without turning juvenile. Base cards and structural frames feature a disciplined 16px (`rounded-lg`) corner radius, echoing rounded edge cards and mid-century modern furniture. Micro-elements like tags, status pills, and action buttons adopt full pill radii to visually communicate immediate clickability.

## Components

### Buttons
- **Primary Pill:** Background `#D95D39`, text `#FFFFFF`, minimum height 52px, horizontal padding `space-lg`, pill-rounded (`9999px`). Active/hover transitions smoothly to `#BF4B28`.
- **Secondary Vintage Pill:** Surface `#FFFDF8`, 1.5px border `#D95D39`, text `#D95D39`. Hover state adopts a warm terracotta tint (`rgba(217, 93, 57, 0.08)`).
- **Tertiary / Utility:** Text `#231C16`, subtle background `#E6DAC8` (40% opacity), rounded to 12px with clear underline or icon indicators.

### Cards
- Standard memory and prompt cards utilize `#FFFDF8` surface fill, a 1px `#E6DAC8` structural perimeter border, and 16px corner radius. Internal padding is generous (`space-lg`). Content within follows an unhurried visual hierarchy with deep espresso titles.

### Chips & Decade Tags
- Decade badges (e.g., *1970er*, *1980er*) and category filters feature a pill format, height 36px, with `#F7F3E9` surface and `#67584E` text. Selected state inverts into `#231C16` fill with cream `#F7F3E9` text.

### Decade Progress Stepper
- Horizontal timeline bar styled with a grounded 4px line in `#E6DAC8`. Completed decade nodes display a 28px terracotta circle (`#D95D39`) holding a cream checkmark; the active node pulses with a dual ring (`#D95D39` inner circle with 4px `#E8A838` outer focus glow).

### Audio Status Badge
- Tactile capsule component indicating audio memory availability or playback. Utilizes Vintage Teal (`#4B7B72`) at 15% opacity with an active deep teal indicator dot, high-contrast label (`#4B7B72`), and an intuitive soundwave waveform graphic.

### Form Inputs
- Height 52px, surface `#FFFFFF`, 1.5px border `#E6DAC8`, text `#231C16` (18px font size). Focused fields elevate to a 2px `#D95D39` stroke with an ambient warm glow (`0 0 0 3px rgba(217, 93, 57, 0.2)`).

### Toggles & Checkboxes
- **Toggles:** 56px wide × 32px high pill track. Inactive track `#E6DAC8`, active track `#D95D39`. The sliding handle is a crisp `#FFFFFF` circle (26px) with a subtle drop shadow.
- **Checkboxes:** 24px × 24px square with 6px rounded corners, 2px border in `#67584E`. Active state fills with `#D95D39` displaying a crisp off-white checkmark icon.