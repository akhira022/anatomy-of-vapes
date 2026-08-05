-- Anatomy of Vapes — initial schema (MVP + quiz_answers)
-- Run in Supabase SQL Editor or via CLI: supabase db push

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  grade text not null check (grade in (
    'มัธยมศึกษาตอนต้น',
    'มัธยมศึกษาตอนปลาย',
    'ปวช',
    'ปวส',
    'นักศึกษา',
    'อื่นๆ'
  )),
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

create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  quiz_result_id uuid not null references public.quiz_results (id) on delete cascade,
  quiz_type text not null check (quiz_type in ('pretest', 'posttest')),
  question_id text not null,
  selected_option_id text not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists quiz_results_created_at_idx on public.quiz_results (created_at desc);
create index if not exists users_created_at_idx on public.users (created_at desc);
create index if not exists quiz_answers_result_idx on public.quiz_answers (quiz_result_id);

alter table public.users enable row level security;
alter table public.consent enable row level security;
alter table public.quiz_results enable row level security;
alter table public.quiz_answers enable row level security;

-- Tighten default privileges: learners insert only; admins select via auth
revoke all on table public.users from anon, authenticated, public;
revoke all on table public.consent from anon, authenticated, public;
revoke all on table public.quiz_results from anon, authenticated, public;
revoke all on table public.quiz_answers from anon, authenticated, public;

grant all on table public.users to service_role;
grant all on table public.consent to service_role;
grant all on table public.quiz_results to service_role;
grant all on table public.quiz_answers to service_role;

grant insert on table public.users to anon, authenticated;
grant insert on table public.consent to anon, authenticated;
grant insert on table public.quiz_results to anon, authenticated;
grant insert on table public.quiz_answers to anon, authenticated;

grant select on table public.users to authenticated;
grant select on table public.consent to authenticated;
grant select on table public.quiz_results to authenticated;
grant select on table public.quiz_answers to authenticated;

-- Recreate policies (idempotent re-runs)
drop policy if exists "anon_insert_users" on public.users;
drop policy if exists "anon_insert_consent" on public.consent;
drop policy if exists "anon_insert_quiz_results" on public.quiz_results;
drop policy if exists "anon_insert_quiz_answers" on public.quiz_answers;
drop policy if exists "auth_select_users" on public.users;
drop policy if exists "auth_select_consent" on public.consent;
drop policy if exists "auth_select_quiz_results" on public.quiz_results;
drop policy if exists "auth_select_quiz_answers" on public.quiz_answers;

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

create policy "anon_insert_quiz_answers"
  on public.quiz_answers for insert
  to anon, authenticated
  with check (true);

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

create policy "auth_select_quiz_answers"
  on public.quiz_answers for select
  to authenticated
  using (true);

-- Admin dashboard join (RLS of underlying tables applies)
create or replace view public.admin_results
with (security_invoker = true) as
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
join public.users u on u.id = qr.user_id;

revoke all on public.admin_results from anon, public;
grant select on public.admin_results to authenticated, service_role;
