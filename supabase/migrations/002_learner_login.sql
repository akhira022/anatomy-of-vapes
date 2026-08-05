-- Allow learners to look up an existing nickname for login (no password).
-- Returns only id / nickname / grade — never full table scan for anon.

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
grant execute on function public.find_learner_by_nickname(text) to anon, authenticated;

create index if not exists users_nickname_lower_idx
  on public.users (lower(trim(nickname)));
