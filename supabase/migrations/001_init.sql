-- Anatomy of Vapes — initial schema (MVP)
-- Run in Supabase SQL Editor or via CLI: supabase db push

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  grade text not null check (grade in ('ป.4', 'ป.5', 'ป.6', 'ม.1', 'ม.2', 'ม.3')),
  created_at timestamptz not null default now()
);

create table if not exists public.consent (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  accepted boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  pre_score int not null check (pre_score >= 0),
  post_score int not null check (post_score >= 0),
  improvement int generated always as (post_score - pre_score) stored,
  pre_total int not null default 5 check (pre_total > 0),
  post_total int not null default 5 check (post_total > 0),
  created_at timestamptz not null default now()
);

create index if not exists quiz_results_created_at_idx on public.quiz_results (created_at desc);
create index if not exists users_created_at_idx on public.users (created_at desc);

alter table public.users enable row level security;
alter table public.consent enable row level security;
alter table public.quiz_results enable row level security;

-- Anonymous learners can insert their own records
create policy "anon_insert_users"
  on public.users for insert
  to anon, authenticated
  with check (true);

create policy "anon_insert_consent"
  on public.consent for insert
  to anon, authenticated
  with check (true);

create policy "anon_insert_quiz_results"
  on public.quiz_results for insert
  to anon, authenticated
  with check (true);

-- Authenticated admins can read all rows
create policy "auth_select_users"
  on public.users for select
  to authenticated
  using (true);

create policy "auth_select_consent"
  on public.consent for select
  to authenticated
  using (true);

create policy "auth_select_quiz_results"
  on public.quiz_results for select
  to authenticated
  using (true);

-- Helpful view for admin dashboard joins
create or replace view public.admin_results as
select
  qr.id,
  qr.user_id,
  u.nickname,
  u.grade,
  qr.pre_score,
  qr.post_score,
  qr.improvement,
  qr.pre_total,
  qr.post_total,
  qr.created_at
from public.quiz_results qr
join public.users u on u.id = qr.user_id
order by qr.created_at desc;

grant select on public.admin_results to authenticated;
