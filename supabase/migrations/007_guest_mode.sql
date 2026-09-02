-- Guest mode + age_range demographics
-- Safe to re-run. Run after 001–006.

-- users: age_range + user_type
alter table public.users add column if not exists age_range text;
alter table public.users add column if not exists user_type text not null default 'member';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_age_range_check'
  ) then
    alter table public.users
      add constraint users_age_range_check
      check (age_range is null or age_range in ('13-15', '16-18', '19-24', '25+'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_user_type_check'
  ) then
    alter table public.users
      add constraint users_user_type_check
      check (user_type in ('member', 'guest'));
  end if;
end $$;

-- quiz_results: flow_type + allow post_total = 0 for guest
alter table public.quiz_results add column if not exists flow_type text not null default 'full';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'quiz_results_flow_type_check'
  ) then
    alter table public.quiz_results
      add constraint quiz_results_flow_type_check
      check (flow_type in ('full', 'guest'));
  end if;
end $$;

-- Relax post_total so guest results can store post_total = 0
do $$
declare
  r record;
begin
  for r in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'quiz_results'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%post_total%'
  loop
    execute format('alter table public.quiz_results drop constraint %I', r.conname);
  end loop;

  alter table public.quiz_results
    add constraint quiz_results_post_total_check
    check (post_total >= 0);
end $$;

-- RPCs: return age_range + user_type
-- DROP required: CREATE OR REPLACE cannot change OUT/return row type
drop function if exists public.find_learner_by_email(text);
drop function if exists public.find_learner_by_id(uuid);

create function public.find_learner_by_email(p_email text)
returns table (
  id uuid,
  nickname text,
  grade text,
  email text,
  age_range text,
  user_type text
)
language sql
security definer
set search_path = public
as $$
  select
    u.id,
    u.nickname,
    u.grade::text,
    u.email,
    u.age_range,
    u.user_type
  from public.users u
  where lower(trim(u.email)) = lower(trim(p_email))
  order by u.created_at desc
  limit 1;
$$;

revoke all on function public.find_learner_by_email(text) from public;
grant execute on function public.find_learner_by_email(text) to anon, authenticated, service_role;

create function public.find_learner_by_id(p_user_id uuid)
returns table (
  id uuid,
  nickname text,
  grade text,
  email text,
  age_range text,
  user_type text
)
language sql
security definer
set search_path = public
as $$
  select
    u.id,
    u.nickname,
    u.grade::text,
    u.email,
    u.age_range,
    u.user_type
  from public.users u
  where u.id = p_user_id
  limit 1;
$$;

revoke all on function public.find_learner_by_id(uuid) from public;
grant execute on function public.find_learner_by_id(uuid) to anon, authenticated, service_role;

-- Admin dashboard view
drop view if exists public.admin_results;

create view public.admin_results
with (security_invoker = true) as
select
  qr.id,
  qr.user_id,
  u.nickname,
  u.email,
  u.grade,
  u.age_range,
  u.user_type,
  qr.flow_type,
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
