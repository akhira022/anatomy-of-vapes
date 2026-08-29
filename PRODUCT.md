# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary learners are Thai youth (lower-secondary through university / vocational) who typically arrive on a phone—often via QR—for a short, guided session about e-cigarette risks.

Secondary audiences who also use the product:
- Teachers or facilitators running the session
- Admins / researchers reviewing participation and learning outcomes
- Parents or guardians who may encounter the experience in a family or community context

## Product Purpose

Anatomy of Vapes (ส่องไส้ในบุหรี่ไฟฟ้า) is an interactive 3D web learning experience that helps people understand what is inside an e-cigarette and why the toxins matter. Learners register with PDPA consent, take a pre-test, explore an exploded 3D device through toxin hotspots, take a post-test, and see score improvement. Admins can review aggregate results and export CSV.

Success means learners complete the interaction path, visit the toxin hotspots, and show measurable knowledge change between pre- and post-test—while consent and stored learning data remain appropriate for an education / health-promotion context.

## Positioning

The differentiating mechanism is learning by inspecting the device itself: rotate and explode a 3D model, open toxin hotspots for micro-learning (including myth vs fact), then prove learning with paired pre/post assessment—not a static article, poster, or video alone.

## Operating Context

Typical flow: QR or link → Landing → PDPA + nickname/grade registration → Pre-test → Anatomy 3D (whole / exploded, hotspot popups) → Post-test → Result summary. Admins sign in separately to view dashboard stats and export data. Sessions are expected to be mobile-first, often in classrooms, youth activities, or campaign settings with limited patience and noisy environments.

## Capabilities and Constraints

Confirmed in MVP / current build intent:
- Landing, PDPA consent + registration (nickname, grade)
- Pre-test and post-test (five questions each)
- Interactive 3D model with exploded view and toxin hotspots + detail popups
- Result comparison (pre vs post, improvement)
- Admin dashboard with aggregate stats and CSV export
- AI knowledge assistant (RAG chat) with citations, guardrails, and 3D hotspot deep links
- Supabase-backed storage for users, consent, quiz results, and per-question answers
- Deploy target: Vercel (web)

Out of MVP scope (must not be assumed present): leaderboard / social sharing, heat / X-ray modes, badge / achievement systems, full multi-language product, voice input for chat, persistent chat history in Supabase.

Undecided: formal accessibility standard mandate (e.g. WCAG AA as a hard gate) — not binding unless later confirmed.

## Brand Commitments

- Product name: **Anatomy of Vapes** / Thai framing **ส่องไส้ในบุหรี่ไฟฟ้า**
- Partner / support marks in use: Kiddee iDOL, anti-smoking campaign lockup, Sook Enterprise / ศูนย์สร้างสรรค์สื่อ, ThaiHealth (สสส.) — assets under `docs/logo/logo.png` and `public/images/partners.png`
- Design-system tagline already in project materials: “Explore the truth inside.” Strategic principles already stated in design docs: Learn by Interaction, Visualize the Danger, Mobile First, Evidence-based Learning

## Evidence on Hand

- `docs/Anatomy_of_Vapes_SDD_v1.pdf` — product / technical design document
- `docs/design-system.png` — visual system poster v1.0
- `docs/wireframe.png` — UI wireframes for learner + admin flows
- `docs/logo/logo.png`, `public/images/partners.png` — partner lockups
- Implemented App Router surfaces: `/`, `/register`, `/pretest`, `/anatomy`, `/posttest`, `/result`, `/admin`, `/admin/login`

Do not fabricate testimonials, clinical claims, or partner endorsements beyond what these assets and confirmed copy support.

## Product Principles

1. **Learn by interaction** — understanding comes from exploring the device and toxins, not from reading alone.
2. **Visualize the danger** — make hidden components and toxins concrete and inspectable.
3. **Mobile first** — the primary experience must work in a phone-held session.
4. **Measure learning** — pre/post assessment and improvement are part of the product, not optional garnish.
5. **Consent before data** — PDPA acceptance precedes learning data collection.

## Accessibility & Inclusion

Primary audience includes Thai-language youth on mobile. No formal WCAG level was confirmed as a hard product mandate in init; future work should still prefer readable contrast, adequate touch targets, and meaningful control labels for this audience.
