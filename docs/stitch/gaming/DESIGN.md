---
name: Retro Hardware Modernist
colors:
  surface: '#f7f9fd'
  surface-dim: '#d8dade'
  surface-bright: '#f7f9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f8'
  surface-container: '#eceef2'
  surface-container-high: '#e6e8ec'
  surface-container-highest: '#e0e2e6'
  on-surface: '#191c1f'
  on-surface-variant: '#5c403c'
  inverse-surface: '#2d3134'
  inverse-on-surface: '#eff1f5'
  outline: '#916f6b'
  outline-variant: '#e6bdb8'
  surface-tint: '#bf0715'
  primary: '#b70011'
  on-primary: '#ffffff'
  primary-container: '#dc2626'
  on-primary-container: '#fff6f5'
  inverse-primary: '#ffb4ab'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#7f4f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#a06500'
  on-tertiary-container: '#fff7f1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb4ab'
  on-primary-fixed: '#410002'
  on-primary-fixed-variant: '#93000b'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f7f9fd'
  on-background: '#191c1f'
  surface-variant: '#e0e2e6'
typography:
  display:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system caters to adult gamers and nostalgic discoverers aged 30–60, channeling the tactile warmth, structured engineering, and playful mechanical charm of classic hardware (DMG Game Boy, European SNES, Mega Drive). Rather than leaning into dark, blurry vaporwave or cliché neon arcade tropes, the system celebrates clean industrial chassis aesthetics: warm matte greys, crisp molded bevels, micro-ribbed cartridge grips, physical LED power nodes, and satisfying mechanical button actions.

The emotional signature is clean nostalgia combined with modern mobile speed—inviting, sturdy, organized, and unmistakably tactile. Pixel-art styling is deployed as deliberate graphical punctuation (accents, emblems, level tags) rather than an illegible body font.

## Colors
The palette balances industrial console plastics with classic hardware pigments:

- **Chassis Background (`#E5E7EB`):** Matte neutral plastic finish reminiscent of late-80s handhelds and consoles.
- **Cartridge Surface (`#FFFFFF`):** High-clarity white deck providing pristine contrast for cover art and catalog lists.
- **Relief Border (`#D1D5DB`):** Bevel and molded contour lines separating tactile plastic pieces.
- **Primary / Power Action (`#DC2626`):** Authentic Nintendo / Game Boy burgundy-red, used for high-impact buttons, system triggers, and "Play / Launch" actions.
- **Secondary / Tech (`#7C3AED`):** SNES cartridge violet, identifying platforms, tech specs, chipsets, and console filters.
- **Tertiary / Trophy (`#F59E0B`):** 1-UP arcade gold, reserved for ratings, achievements, and unlocked collections.
- **Highscore Green (`#10B981`):** LED power-state indicators and verified completion checks.
- **Charcoal Readability (`#111827`):** Primary text ink delivering uncompromising contrast across German typography.
- **Slate Grey (`#4B5563`):** Metadata, release years, hardware manufacturers, and inactive states.

## Typography
To guarantee effortless readability for long compound German game titles (e.g., *Rollenspielabenteuer*, *Action-Geschicklichkeit*) among an audience aged 30–60, high-res geometric clarity takes precedence over decorative pixel fonts for informational hierarchies:

- **Headlines & Structural Titles (`Space Grotesk`):** Delivers clean retro-futuristic geometry reminiscent of vintage Japanese and European instruction manuals and console labeling without losing crisp render fidelity on mobile screens.
- **Body & Controls (`Plus Jakarta Sans`):** Provides generous x-height, open apertures, and ergonomic touch target readability.
- **Retro Pixel Embellishments:** Pixel fonts are strictly restricted to badges, status tags, and score tokens. When applied, render at an exact integer multiple (8px, 16px) with all-caps uppercase styling to avoid anti-aliasing fuzziness.

## Layout & Spacing
The layout follows a tactile column grid adapted for high-frequency mobile browsing:

- **Grid Architecture:** Single-column stacked layout on mobile (320px–480px), reflowing into a balanced 2-column or 3-column cartridge shelf on tablet and desktop viewports (up to 768px safe mobile web wrapper).
- **Cartridge Rhythms:** Modules simulate swappable media units with consistent 16px (`space-md`) vertical separation, allowing clear thumb boundaries.
- **Edge Containment:** 16px canvas margins on mobile preserve screen borders, replicating the feeling of viewing content within a handheld screen bezel.

## Elevation & Depth
Elevation is achieved mechanically rather than through diffuse atmospheric drop shadows:

- **The Beveled Lip (Cartridge Slot Effect):** Flat top surfaces with hard-edged lower borders (`border-b-4` or `box-shadow: 0 4px 0 0 #D1D5DB`) establish physical, mechanical depth without muddy drop shadows.
- **Pressed State Interaction:** Active elements translate downward along the Y-axis by 2px to 4px on pointer down (`active:translate-y-1 active:border-b-0`), mimicking spring-loaded micro-switches and D-pads.
- **Recessed Insets:** Input fields, search slots, and hardware info trays use subtle inner borders (`box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06)`) on a slightly darkened plastic base (`#F3F4F6`), creating the visual impression of molded battery covers and cartridge bays.
- **Scanline & CRT Texturing:** Restrained 1px horizontal micro-striping (subtle CSS linear gradient at 3% opacity) on image covers creates an authentic cathode-ray monitor feel without obscuring legibility.

## Shapes
Forms balance the gentle ergonomics of handheld electronics with structural tooling:

- **Corner Curvature:** Outer cards and major panels feature a consistent 8px (`rounded-md` / `roundedness: 2`) border radius, mirroring the molded outer plastic corners of late-80s/90s consoles.
- **Cartridge Notches:** Distinctive asymmetric indentations or ribbed top grooves applied to hero cards convey physical game cartridges.
- **LED Modules:** Hardware status icons and online indicators are circular pill caps (`rounded-full`) housed in recessed circular borders.

## Components

### Tactile Action Buttons
- **Primary Buttons:** High-energy burgundy (`#DC2626`) solid background with clean white typography, supported by an extruding darker baseline lip (`border-b-4 border-[#991B1B]`). On hover/tap: button translates 2px down with border-b compressed to 2px, providing authentic arcade microswitch feedback.
- **Secondary Buttons:** Chassis white (`#FFFFFF`) with rich graphite text (`#111827`) and a 1px border outline plus an extruded bottom border (`border-b-4 border-[#D1D5DB]`).
- **Touch Target:** Minimum 48px height across all clickable elements for thumb access.

### Cartridge Cards
- **Base Style:** Rigid white (`#FFFFFF`) background with a 1px contour border (`#D1D5DB`) and a 4px bottom drop ridge (`border-b-4 border-[#D1D5DB]`).
- **Grip Ridge Header:** Subtle horizontal segmented micro-bars along the top or side edge, evoking game cartridge finger grips.
- **Scanline Media Preview:** Game box art and screenshots integrate a fine horizontal line texture overlay with a slight inner border shadow.

### Status Indicators & LED Nodes
- **Power Node:** Circular 8px indicator with an active glowing core (`#10B981` or `#DC2626`) set within a 12px recessed border to replicate hardware LEDs (e.g., "SYSTEM: READY", "BATTERY: FULL").
- **Year & Platform Chips:** High-contrast pill tags (`#7C3AED` tint or `#111827` dark tag) with sharp 2px radii and crisp micro-labels.

### Input Fields & Search Bars
- **Recessed Well:** Background set to chassis-sunken grey (`#F3F4F6`) with a 1px inset border (`#D1D5DB`) and inner shadow.
- **Focus State:** Transitions sharply to `#FFFFFF` with a crisp 2px primary accent border (`#DC2626`) and zero diffuse blur.

### Navigation Deck (Mobile)
- **Bottom Control Dock:** Styled like the chin of a portable console, elevated with a sharp top relief border (`border-t-2 border-[#D1D5DB]`) over warm industrial grey (`#E5E7EB`). Icons incorporate tactile recessed states when active.