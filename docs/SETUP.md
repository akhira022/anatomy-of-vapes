# Anatomy of Vapes — setup notes

## 1. Environment

1. Copy `.env.example` to `.env.local`
2. Create a Supabase project and paste URL + anon key
3. (Optional) set `SUPABASE_SERVICE_ROLE_KEY` for server-only tools
4. (Optional) set `NEXT_PUBLIC_GA_ID` for Google Analytics 4

## 2. Database

Run `supabase/migrations/001_init.sql` in the Supabase SQL Editor.

This creates:

- `users`
- `consent`
- `quiz_results` (with generated `improvement`)
- RLS: anon can INSERT; authenticated can SELECT
- view `admin_results`

## 3. Admin auth

1. In Supabase Auth, create an email/password user for the admin
2. Sign in at `/admin/login`

## 4. Placeholders to replace later

- Quiz copy: `data/quiz-questions.ts`
- Hotspot copy: `data/hotspots.ts`
- Myth vs Fact: `data/myths.ts`
- 3D model: swap `components/three/VapeModel.tsx` for `public/models/vape.glb` via `useGLTF`

## 5. Deploy (Vercel)

1. Import the GitHub repo into Vercel
2. Add the same env vars
3. Deploy and open the production URL / QR code
