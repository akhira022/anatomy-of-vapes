-- Learner email registration (Supabase Auth + public.users.email)
-- Safe to re-run. Run after 001–005.

alter table public.users
  add column if not exists email text;

create unique index if not exists users_email_lower_idx
  on public.users (lower(trim(email)))
  where email is not null;

create or replace function public.find_learner_by_email(p_email text)
returns table (
  id uuid,
  nickname text,
  grade text,
  email text
)
language sql
security definer
set search_path = public
as $$
  select u.id, u.nickname, u.grade::text, u.email
  from public.users u
  where lower(trim(u.email)) = lower(trim(p_email))
  order by u.created_at desc
  limit 1;
$$;

revoke all on function public.find_learner_by_email(text) from public;
grant execute on function public.find_learner_by_email(text) to anon, authenticated, service_role;

create or replace function public.find_learner_by_id(p_user_id uuid)
returns table (
  id uuid,
  nickname text,
  grade text,
  email text
)
language sql
security definer
set search_path = public
as $$
  select u.id, u.nickname, u.grade::text, u.email
  from public.users u
  where u.id = p_user_id
  limit 1;
$$;

revoke all on function public.find_learner_by_id(uuid) from public;
grant execute on function public.find_learner_by_id(uuid) to anon, authenticated, service_role;

-- Admin dashboard: include email when present
-- (DROP required: CREATE OR REPLACE cannot insert a column before existing ones)
drop view if exists public.admin_results;

create view public.admin_results
with (security_invoker = true) as
select
  qr.id,
  qr.user_id,
  u.nickname,
  u.email,
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
