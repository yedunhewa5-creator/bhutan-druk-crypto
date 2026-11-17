---
name: Obsidian Aurum
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#d7c3ae'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#9f8e7a'
  outline-variant: '#524534'
  surface-tint: '#ffb955'
  primary: '#ffc880'
  on-primary: '#452b00'
  primary-container: '#f5a623'
  on-primary-container: '#644000'
  inverse-primary: '#835500'
  secondary: '#ffc640'
  on-secondary: '#402d00'
  secondary-container: '#e3aa00'
  on-secondary-container: '#5a4100'
  tertiary: '#ffc79b'
  on-tertiary: '#4d2600'
  tertiary-container: '#ffa04c'
  on-tertiary-container: '#6f3a00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffddb4'
  primary-fixed-dim: '#ffb955'
  on-primary-fixed: '#291800'
  on-primary-fixed-variant: '#633f00'
  secondary-fixed: '#ffdf9f'
  secondary-fixed-dim: '#f9bd22'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
  code-otp:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0.15em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  margin: 1.25rem
  margin-mobile: 1.25rem
  margin-tablet: 2.5rem
  space-xxs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes an ultra-refined, high-security mobile authentication experience tailored for sovereign wealth management, private asset exchange, and next-generation institutional fintech. It embodies digital sovereignty, bespoke craftsmanship, and effortless cryptographic access. 

The aesthetic is grounded in **Dark Luxury Minimalism with Luminous Tactility**. The visual architecture relies on impenetrable obsidian surfaces, fine-line metallic containment, and micro-luminescent gold highlights. 

Key stylistic principles:
- **Atmospheric Depth:** Deep, non-reflective obsidian and slate-black canvases that reduce optical fatigue while projecting prestige.
- **Controlled Radiance:** Gold and amber accents applied with surgical precision—used exclusively for active focal points, verified states, and primary actions rather than ambient decoration.
- **Architectural Precision:** Razor-thin structural borders, precise spatial metrics, and typographic clarity that convey institutional security.
- **Frictionless Trust:** Biometric triggers, passkey verification, and high-frequency tactile feedback that transform security barriers into frictionless points of delight.

## Colors

The palette revolves around deep carbon bases and metallic gold transitions. Every hue serves an intentional functional and communicative role in the authentication journey.

### Color Tokens & Assignments

- **Surface Base (`#09090B`):** Canvas root. Absorbs perimeter light and establishes a deep, distraction-free field.
- **Surface Layer 1 (`#0F0F12`):** Elevated cards, biometric bottom-sheets, and contextual input clusters.
- **Surface Layer 2 (`#18181B`):** Interactive resting states, passive input fields, and pill backgrounds.
- **Primary Accent (`#F5A623`):** Core authentication calls-to-action, active biometric scanning rings, and brand insignia.
- **Secondary Accent (`#FBBF24`):** Focused states, high-priority toggle selections, and text link hover/press states.
- **Tertiary Accent (`#D97706`):** Deep amber boundary gradients, tactile pressed states, and secondary telemetry.
- **Border Ghost (`#27272A`):** Low-contrast resting boundary for containers and inputs.
- **Border Gold Glow (`rgba(245, 166, 35, 0.35)`): Radiance perimeter applied to active and focused elements.
- **Neutral Foreground Text:**
  - High Contrast (`#FAFAFA`): Critical headlines, authentication codes, and primary labels.
  - Medium Contrast (`#A1A1AA`): Supporting text, field placeholders, and biometric subtext.
  - Muted (`#52525B`): Legal disclaimers, disabled actions, and version metadata.
- **Functional Semantics:**
  - Success (`#10B981`): Biometric match confirmed, hardware key validated.
  - Error (`#F43F5E`): Cryptographic mismatch, rate-limited warning, invalid PIN.

## Typography

Typography establishes institutional confidence through structural tension: **Plus Jakarta Sans** provides structural elegance and geometric warmth across headlines, while **Inter** delivers clinical readability and optical balance across inputs, labels, and cryptographic metrics.

- **Headlines & Onboarding:** Rendered in Plus Jakarta Sans with subtle negative tracking. This tightens letter spacing for an authoritative, editorial finish.
- **Form Labels & Feedback:** Rendered in Inter Medium and Semi-bold. Micro-labels use small uppercase with expanded letter-spacing (`+0.06em`) for immediate scannability under low-light environments.
- **One-Time Passwords & Passkey Prompts:** The dedicated `code-otp` token uses Inter Semi-bold with tabular figures and wide tracking to prevent user entry errors during MFA verification flows.

## Layout & Spacing

The layout model is built on an exact **4px/8px modular rhythm**, structured specifically for mobile-first single-hand authentication patterns. 

- **Canvas Anchoring:** Content centers along the vertical axis, prioritizing thumb-reach accessibility for biometric triggers, PIN pads, and primary submission buttons in the bottom two-thirds of the viewport.
- **Dynamic Padding:** 
  - Standard horizontal margin: `20px` (`1.25rem`) on mobile viewports.
  - Safe-area bottom offsets: Enforced dynamically to protect interaction buttons from gesture bars.
  - Input Stack Spacing: Form elements are separated by `space-md` (`1rem`) to keep hit targets distinct.
- **Keypad Matrix:** PIN entry and biometric targets utilize fluid grid units with standard `0.75rem` (`12px`) gutters to eliminate mis-taps.

## Elevation & Depth

Visual hierarchy does not rely on heavy drop shadows. Instead, this design system uses **Tonal Layering with Specular Edge Glows and Surface Translucency**.

1. **Surface 0 (Base):** Solid `#09090B`. The foundational background for initial splash, PIN entry, and master screens.
2. **Surface 1 (Card & Sheet):** `#0F0F12` with a 1px composite outline (`#27272A`). Used for authentication containers, recovery-phrase cards, and security verification sheets.
3. **Surface 2 (Interactive Floating Elements):** `#18181B` with 60% opacity and a `16px` backdrop-filter blur.
4. **Specular Glows & Aurum Elevation:**
   - **Focused/Active State:** Subtle outward ambient illumination (`0px 0px 20px -2px rgba(245, 166, 35, 0.18)`), bordered by a linear gradient shifting from `#F5A623` to `#D97706`.
   - **Biometric Sensor Ring:** Multi-stage concentric pulse glow:
     - Inner ring: `0 0 12px rgba(245, 166, 35, 0.4)`
     - Ambient field: `0 0 32px rgba(217, 119, 6, 0.15)`
   - **Error Shockwave:** Shifts the glow token to `rgba(244, 63, 94, 0.25)` with a 1px border of `#F43F5E`.

## Shapes

The design system employs a **Rounded (Level 2)** geometry balance. This delivers modern precision without looking playful or aggressive:

- **Base Elements (`rounded`, 0.5rem / 8px):** Checkboxes, OTP entry boxes, and micro security tags.
- **Primary Inputs & Cards (`rounded-lg`, 1rem / 16px):** Form fields, passkey prompt cards, and bottom sheet containers.
- **Pills (`rounded-full`, 9999px):** Biometric trigger surfaces, authentication CTAs, and security status indicators.
- **Edge Hairlines:** Structural borders always carry a consistent width of `1px` to maintain a razor-sharp, luxury silhouette.

## Components

### 1. Primary Authentication Button
- **Height & Radius:** 56px, `rounded-full` or `rounded-lg` (16px).
- **Surface:** Smooth diagonal gradient (`135deg, #F5A623 0%, #D97706 100%`).
- **Typography:** `label-lg`, `#09090B` (solid dark-carbon text for maximum optical contrast against gold).
- **States:**
  - *Pressed:* Scale down to `0.98`, background shifts to `#D97706`.
  - *Disabled:* Background `#18181B`, border `1px solid #27272A`, text `#52525B`.
  - *Loading:* Gold spinner with glowing orbital head.

### 2. Form Input Fields
- **Container:** Height 56px, background `#0F0F12`, border `1px solid #27272A`, `rounded-lg`.
- **Typographic Treatment:** Placeholder in `body-md` (`#52525B`), typed text in `body-md` (`#FAFAFA`).
- **Focus Transition:** Border shifts to `#F5A623`, backed by a 4px blur glow (`rgba(245, 166, 35, 0.15)`). The floating label shifts to `label-sm` (`#FBBF24`).
- **Trailing Accessories:** Gold-tinted visibility icons (eye/eye-slash) and hardware key verification icons.

### 3. Biometric / Passkey Verification Hub
- **Trigger Canvas:** Centered, circular target (72px x 72px) with a translucent obsidian core (`#18181B`).
- **Border Treatment:** 1px gold perimeter (`#F5A623`) with radial pulse animation when authenticating.
- **Iconography:** Precision SVG Face ID / Touch ID / FIDO2 Passkey iconography rendered in `#F5A623`.
- **Feedback Ring:** Successful reads trigger a smooth scale-up with an emerald green flare (`#10B981`); failed reads produce a rapid horizontal haptic jitter with a ruby perimeter (`#F43F5E`).

### 4. OTP / PIN Code Digits
- **Geometry:** 6 individual cells, 48px width x 56px height, `rounded-lg`.
- **Resting:** Background `#0F0F12`, border `1px solid #27272A`.
- **Active / Cursor:** Border illuminated with `#F5A623` and a blinking vertical gold bar.
- **Filled:** Solid `#FAFAFA` masked dot or alphanumeric character in `code-otp`.

### 5. Checkboxes & Security Agreement Controls
- **Box Size:** 20px x 20px, `rounded` (4px).
- **Default:** Background `#0F0F12`, border `1px solid #52525B`.
- **Selected:** Background `#F5A623`, border `#F5A623`, checkmark rendered in deep obsidian (`#09090B`).

### 6. Modal / Bottom Sheet Surfaces
- **Structure:** Root anchoring at viewport base with 24px top radii (`rounded-t-2xl`).
- **Handle:** 36px x 4px pill in `#27272A`.
- **Backdrop:** `#000000` with 75% opacity and a `20px` progressive blur.