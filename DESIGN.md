---
name: Anatomy of Vapes
description: Dark, danger-forward educational UI for interactive 3D e-cigarette learning.
colors:
  primary: "#E53935"
  primary-hover: "#C62828"
  background: "#080808"
  surface: "#141414"
  surface-2: "#202020"
  card: "#1C1C1C"
  border: "#2A2A2A"
  text-primary: "#FFFFFF"
  text-secondary: "#9CA3AF"
  text-disabled: "#6B7280"
  success: "#22C55E"
  warning: "#F59E0B"
  error: "#EF4444"
  info: "#3B82F6"
  toxic: "#8B5CF6"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(2.25rem, 8vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "Noto Sans Thai, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "Noto Sans Thai, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "24px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  "2xl": "32px"
  "3xl": "48px"
  "4xl": "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "12px 40px"
    height: "56px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "12px 24px"
    height: "44px"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 10px"
    height: "44px"
  badge-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
    height: "20px"
  card-surface:
    backgroundColor: "{colors.card}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

# Design System: Anatomy of Vapes

## Overview

**Creative North Star: "Explore the Truth Inside"**

(Derived from the project's design-system poster tagline and PRODUCT principles—not a new aesthetic invention.)

The visual system is a dark, clinical-danger education interface: near-black voids, restrained charcoal surfaces, and a single sharp red accent that means risk, selection, and primary action. Typography pairs Space Grotesk for brand/headings with Noto Sans Thai for readable Thai body copy. Density is mobile-first and task-oriented—Operate surfaces (quiz, 3D, admin) stay quieter than the Persuade landing hero.

Depth comes from soft card/popup shadows plus intentional red/green glow only on danger or completion signals. Atmosphere on the landing uses soft primary radial light—not decorative grid wallpaper.

**Key Characteristics:**
- Dark-first (`#080808`) educational product UI
- One primary accent red for danger + CTA (use sparingly)
- Dual type: Space Grotesk (EN brand / heads) + Noto Sans Thai (body)
- Soft-radius containers (12–24px), pill for chips/modes
- Signature interactions: hotspot pulse, exploded 3D, glow on danger/success

## Colors

A near-black canvas with one high-energy danger red and a small semantic set for status.

### Primary
- **Signal Red** (`#E53935`): Primary CTAs, active steps, unvisited hotspot markers, focus ring. Hover deepens to **Primary Hover** (`#C62828`).

### Secondary
Omit as a second brand accent. Surfaces use neutrals; semantic colors carry meaning.

### Tertiary
- **Toxic Violet** (`#8B5CF6`): Reserved for toxin/chemical semantic cues only—not general decoration or backgrounds.

### Neutral
- **Void Black** (`#080808`): App background
- **Surface** (`#141414`) / **Surface 2** (`#202020`): Nested panels
- **Card** (`#1C1C1C`): Grouped content panels
- **Border / Input** (`#2A2A2A`): Hairline structure
- **Text Primary** (`#FFFFFF`): Headings and primary copy
- **Text Secondary** (`#9CA3AF`): Supporting copy
- **Text Disabled** (`#6B7280`): Inactive labels

### Semantic
- **Success** (`#22C55E`): Completed hotspot / positive feedback (+ green glow)
- **Warning** (`#F59E0B`): Gate / caution messages
- **Error** (`#EF4444`): Form/validation errors
- **Info** (`#3B82F6`): Informational toasts/status

### Named Rules
**The One Red Rule.** Primary red is for danger signals and the single most important action on a screen—not every active chrome piece at once.

**The No Grid Wallpaper Rule.** Do not use tiled hairline grid-line gradients as decorative page backgrounds; reserve structural lines for real measurement/canvas contexts.

## Typography

**Display Font:** Space Grotesk (with sans-serif fallback)  
**Body Font:** Noto Sans Thai (with sans-serif fallback)  
**Label/Mono Font:** Geist Mono (data/code only when needed)

**Character:** Technical display voice for the English brand name; human Thai body voice for learning and consent copy. Brand display must outrank supporting headlines on Persuade surfaces.

### Hierarchy
- **Display** (700, `clamp(2.25rem, 8vw, 4.5rem)`, ~0.95 lh, -0.03em): Landing brand lockup only
- **Headline** (700, ~30px / `text-3xl`): Section titles, result emphasis
- **Title** (600, ~18px): Card/panel titles, stepper emphasis
- **Body** (400, 16px, relaxed): Thai instructional and educational copy; keep measure readable on phone
- **Label** (500, 14px): Form labels, helper text, badges

### Named Rules
**The Brand-First Rule.** On the landing first viewport, “Anatomy of Vapes” is the loudest type; Thai subtitle and body support it—they do not overpower it.

## Layout

Mobile-first Operate layout: content columns typically `max-w-5xl` centered with `px-4` / `sm:px-6`. Vertical rhythm follows the spacing scale (tight within a control group, generous between sections). Landing hero targets a full first viewport with brand, one supporting line, one CTA, and one visual anchor. Anatomy learning stacks stepper → mode controls → 3D viewport → info/action panel; short phones must keep critical gate copy visible without relying on micro-warning alone.

**The Phone Session Rule.** Design every learner path as if held in one hand in a noisy classroom—large primary controls, minimal competing chrome.

## Elevation & Depth

Hybrid: flat surfaces at rest, soft structural shadows for cards/popups, and colored glow only for danger/completion emphasis.

### Shadow Vocabulary
- **Card** (`0 4px 24px rgba(0, 0, 0, 0.4)`): Resting panels
- **Popup** (`0 8px 32px rgba(0, 0, 0, 0.55)`): Modals / hotspot detail
- **Glow Red** (`0 0 20px rgba(229, 57, 53, 0.45)`): Danger / primary emphasis
- **Glow Green** (`0 0 20px rgba(34, 197, 94, 0.4)`): Completion / success emphasis

### Named Rules
**The Glow-With-Meaning Rule.** Red/green glow is semantic feedback, not ambient decoration on every surface.

## Shapes

Soft modern education UI: small controls ~8–12px radius; learner CTAs and panels often 20–24px (`rounded-2xl`); mode chips and badges use full pill. Prefer continuous rounded rectangles over hard technical bevels. Borders stay 1px `#2A2A2A` for structure—not thick accent side-bars.

## Components

### Buttons
- **Shape:** Comfortably rounded for learner CTAs (~24px on primary path); default system button may be tighter (~8–12px) inside dense admin chrome
- **Primary:** Signal Red fill, white text; hover to Primary Hover; focus ring uses primary/ring
- **Outline / Secondary:** Dark surface + border for secondary actions
- **Disabled:** Reduced opacity must not still read as the loudest object on screen—pair with clearer hierarchy when a CTA is locked

### Chips / Mode pills
- **Style:** Pill; inactive = card/border + secondary text; active = primary fill + white text
- **State:** One active mode at a time; avoid near-duplicate modes that share the same 3D state

### Cards / Containers
- **Corner Style:** ~16–24px
- **Background:** Card `#1C1C1C`
- **Shadow Strategy:** Card shadow at rest
- **Border:** 1px border token
- **Internal Padding:** 16px default (`p-4`), denser on small

### Inputs / Fields
- **Style:** Transparent/dark fill, input border, ~12px radius; registration fields often taller (`h-11`) for touch
- **Focus:** Primary ring
- **Error:** Destructive border + ring; helper text in error red

### Navigation
- Sticky dark header with border; back control ≥40px hit area; learner title in Space Grotesk. Prefer no dead menu affordances.

### Signature: Hotspot marker
Pulsing primary disc for unvisited toxins; success green when visited; larger touch target than the visible disc whenever possible; `prefers-reduced-motion` disables pulse.

### Signature: 3D viewport
Rounded bordered surface panel containing the canvas; floating icon controls on the right with aria-labels; exploded separation reveals toxin hotspots.

## Do's and Don'ts

### Do:
- **Do** keep the first landing viewport to brand + one headline/support line + one CTA + one visual anchor.
- **Do** use Signal Red for danger markers and the true primary action of the moment.
- **Do** write learner-facing instructional copy primarily in Thai; keep English for brand and necessary chemical names as secondary.
- **Do** respect `prefers-reduced-motion` for hotspot pulse and entrance motion.
- **Do** size interactive targets for thumbs (aim 44×44 CSS px on learner-critical controls).

### Don't:
- **Don't** tile decorative CSS grid-line backgrounds on marketing or learning pages.
- **Don't** flood a screen with primary red on tabs, pills, markers, and CTAs simultaneously.
- **Don't** invent partner claims, medical testimonials, or clinical guarantees not in Evidence on Hand.
- **Don't** treat green visited markers as “safe/healthy”—they mean completed exploration in this product.
- **Don't** add purple atmospheric decoration as a general theme; toxic violet is semantic, not wallpaper.
