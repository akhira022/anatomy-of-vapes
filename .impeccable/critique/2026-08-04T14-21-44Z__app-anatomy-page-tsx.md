---
target: Anatomy 3D UI screenshot / app/anatomy/page.tsx
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
timestamp: 2026-08-04T14-21-44Z
slug: app-anatomy-page-tsx
---
# Critique: Anatomy 3D (`app/anatomy/page.tsx`)

**Authority note:** PRODUCT.md and DESIGN.md were not present. Substituted SDD + design-system tokens + incumbent code + screenshot.

**Method:** dual-agent (A: design review · B: detector)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Count 1/5 shown; not which toxins remain |
| 2 | Match System / Real World | 2 | EN mode labels + EN chemical badges vs TH learning copy |
| 3 | User Control and Freedom | 3 | Dead hamburger; no remaining-toxin list |
| 4 | Consistency and Standards | 2 | Exploded ≈ Toxin Info in code |
| 5 | Error Prevention | 3 | Gate works; disabled CTA still looks primary |
| 6 | Recognition Rather Than Recall | 2 | Spatial memory of 5 dots required |
| 7 | Flexibility and Efficiency | 2 | No keyboard/list alternate to 3D hunting |
| 8 | Aesthetic and Minimalist Design | 2 | Chrome stack competes with learning object |
| 9 | Error Recovery | 2 | Disabled CTA silent; weak recovery copy |
| 10 | Help and Documentation | 2 | No first-run coach for rotate/tap |
| **Total** | | **23/40** | Acceptable |

## Design Specificity Verdict

**LLM:** Recognizably a vape-toxin learning Operate surface (dark danger palette, exploded device, hotspot→popup→post-test gate). Undercut by placeholder cylinders, English chrome, and hierarchy that elevates Post-test over toxin exploration.

**Deterministic scan:** `detect.mjs --json` on anatomy page + related components → `[]` (exit 0). No automated anti-pattern hits; hierarchy/a11y issues are judgment + screenshot/code, not detector rules.

**Visual overlays:** Browser injection skipped in Assessment B (no confirmed mutation/live-server path). Screenshot provided by user used instead.

## Overall Impression

Pedagogy gate is solid; chrome and visual hierarchy fight the learning goal. Biggest opportunity: make “สารพิษที่ยังไม่ได้สำรวจ” the primary signal until 5/5, then elevate Post-test.

## What's Working

1. Post-test locked until all hotspots visited — matches Learn by Interaction.
2. Progressive disclosure: panel blurb → detail popup with myth vs fact.
3. Visited (green) vs unvisited (red pulse) encoding once understood.

## Priority Issues

### [P0] Hierarchy inversion — disabled Post-test is still visual primary
- **Why:** Youth chase the loudest red; skip depth or rage-tap dead control.
- **Fix:** While incomplete, demote advance to outline/ghost; promote progress + next toxin cue. On 5/5, elevate primary CTA + success state.
- **Command:** `/impeccable quieter` (CTA) + `/impeccable layout`

### [P0] Hotspot hit targets too small (~20px)
- **Why:** Fat-finger + orbit conflict → abandoned toxins / blocked progression.
- **Fix:** Hit area ≥44×44; keep visual disc smaller if needed; increase marker size on mobile.
- **Command:** `/impeccable adapt`

### [P1] Mode trio is false complexity
- **Why:** Exploded and Toxin Info both set exploded=true — wasted choices.
- **Fix:** Collapse to Whole vs Exploded (or auto-explode when entering toxin discovery); drop redundant pill.
- **Command:** `/impeccable distill`

### [P1] Progress is count-only, not actionable
- **Why:** At 1/5 learners don’t know which toxins remain.
- **Fix:** Named checklist or “ต่อไป: Formaldehyde” with Thai plain name; live region on visit.
- **Command:** `/impeccable clarify` + `/impeccable layout`

### [P2] Bilingual chrome vs learning content
- **Why:** Extraneous load before health facts land.
- **Fix:** Thai labels for modes/stepper; EN chemical as secondary.
- **Command:** `/impeccable clarify`

## Persona Red Flags

**Thai secondary-school learner (phone):** tiny dots, EN chrome, fake-affordance red Post-test, dead menu → distrust.

**Skeptic peer:** placeholder geometry undercuts “Visualize the Danger”; friction before myth/fact peak.

## Minor Observations

- Unused HotspotPanel; page reinvents thinner panel.
- Camera controls ~32px (under 44px).
- Stepper small primary-red labels likely fail AA for small text.
- Warning gate copy at xs warning — critical message at lowest emphasis.
- Screenshot showed possible “ArrowDown” text artifact; code uses ArrowRight icon — verify build/render.

## Questions to Consider

1. Should Post-test ever be louder than remaining toxins before 5/5?
2. Do Exploded and Toxin Info need to be separate?
3. Is the hero object the device parts or the toxins?
4. Thai plain-language danger names first?
5. What celebration happens on the last hotspot?
