-- Allow allowlisted admin emails (synced from the app) to pass is_admin(),
-- so edit/delete works without SUPABASE_SERVICE_ROLE_KEY or Auth role=admin.

create table if not exists public.app_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;

revoke all on table public.app_config from anon, authenticated, public;
grant select on table public.app_config to authenticated, service_role;
grant all on table public.app_config to service_role;

drop policy if exists "auth_select_app_config" on public.app_config;
create policy "auth_select_app_config"
  on public.app_config for select
  to authenticated
  using (true);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    or (
      nullif(lower(trim(coalesce(auth.jwt() ->> 'email', ''))), '')
      is not null
      and lower(trim(auth.jwt() ->> 'email')) = (
        select lower(trim(c.value))
        from public.app_config c
        where c.key = 'admin_email'
      )
    ),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;

-- Caller may only sync their own email. The API passes NEXT_PUBLIC_ADMIN_EMAIL
-- when it matches the signed-in admin session.
create or replace function public.sync_admin_email(p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  jwt_email text := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  wanted text := lower(trim(coalesce(p_email, '')));
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if wanted = '' or jwt_email = '' or jwt_email <> wanted then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  insert into public.app_config as c (key, value, updated_at)
  values ('admin_email', wanted, now())
  on conflict (key) do update
    set value = excluded.value,
        updated_at = now();

  return true;
end;
$$;

revoke all on function public.sync_admin_email(text) from public;
grant execute on function public.sync_admin_email(text) to authenticated, service_role;

create or replace function public.assert_is_admin()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden: admin only' using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.assert_is_admin() from public;
grant execute on function public.assert_is_admin() to authenticated, service_role;

drop function if exists public.admin_update_learner(
  uuid, text, text, text, boolean, text, boolean, uuid, int, int, int, int
);

create or replace function public.admin_update_learner(
  p_user_id uuid,
  p_nickname text default null,
  p_grade text default null,
  p_age_range text default null,
  p_clear_age_range boolean default false,
  p_email text default null,
  p_set_email boolean default false,
  p_result_id uuid default null,
  p_pre_score int default null,
  p_post_score int default null,
  p_pre_total int default null,
  p_post_total int default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_is_admin();

  update public.users
  set
    nickname = coalesce(p_nickname, nickname),
    grade = coalesce(p_grade, grade),
    age_range = case
      when p_clear_age_range then null
      when p_age_range is not null then p_age_range
      else age_range
    end,
    email = case
      when p_set_email then nullif(lower(trim(coalesce(p_email, ''))), '')
      else email
    end
  where id = p_user_id;

  if not found then
    raise exception 'user not found';
  end if;

  if p_result_id is not null
     and (
       p_pre_score is not null
       or p_post_score is not null
       or p_pre_total is not null
       or p_post_total is not null
     ) then
    update public.quiz_results
    set
      pre_score = coalesce(p_pre_score, pre_score),
      post_score = coalesce(p_post_score, post_score),
      pre_total = coalesce(p_pre_total, pre_total),
      post_total = coalesce(p_post_total, post_total)
    where id = p_result_id
      and user_id = p_user_id;

    if not found then
      raise exception 'result not found';
    end if;
  end if;
end;
$$;

revoke all on function public.admin_update_learner(
  uuid, text, text, text, boolean, text, boolean, uuid, int, int, int, int
) from public;
grant execute on function public.admin_update_learner(
  uuid, text, text, text, boolean, text, boolean, uuid, int, int, int, int
) to authenticated, service_role;

create or replace function public.admin_delete_learner(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_is_admin();
  delete from public.users where id = p_user_id;
  if not found then
    raise exception 'user not found';
  end if;
end;
$$;

revoke all on function public.admin_delete_learner(uuid) from public;
grant execute on function public.admin_delete_learner(uuid) to authenticated, service_role;

create or replace function public.admin_delete_result(p_result_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_is_admin();
  delete from public.quiz_results where id = p_result_id;
  if not found then
    raise exception 'result not found';
  end if;
end;
$$;

revoke all on function public.admin_delete_result(uuid) from public;
grant execute on function public.admin_delete_result(uuid) to authenticated, service_role;
