-- Learner RPCs (login lookup + one-result check). Safe to re-run.
-- Paste this whole file into Supabase SQL Editor → Run.

create or replace function public.find_learner_by_nickname(p_nickname text)
returns table (
  id uuid,
  nickname text,
  grade text
)
language sql
security definer
set search_path = public
as $$
  select u.id, u.nickname, u.grade::text
  from public.users u
  where lower(trim(u.nickname)) = lower(trim(p_nickname))
  order by u.created_at desc
  limit 1;
$$;

revoke all on function public.find_learner_by_nickname(text) from public;
grant execute on function public.find_learner_by_nickname(text) to anon, authenticated, service_role;

create index if not exists users_nickname_lower_idx
  on public.users (lower(trim(nickname)));

create or replace function public.learner_has_quiz_result(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.quiz_results qr
    where qr.user_id = p_user_id
  );
$$;

revoke all on function public.learner_has_quiz_result(uuid) from public;
grant execute on function public.learner_has_quiz_result(uuid) to anon, authenticated, service_role;

-- Ensure service_role can read admin dashboard if using secret key server-side later
grant all on table public.users to service_role;
grant all on table public.consent to service_role;
grant all on table public.quiz_results to service_role;
grant all on table public.quiz_answers to service_role;
grant select on public.admin_results to service_role, authenticated;
