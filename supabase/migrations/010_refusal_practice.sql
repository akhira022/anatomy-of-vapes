-- Refusal practice completions (standalone from quiz scores)
-- Safe to re-run. Run after 001–009.

create table if not exists public.refusal_practice (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  user_id uuid references public.users (id) on delete set null,
  situation_id text not null,
  selected_phrase text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'refusal_practice_session_situation_key'
  ) then
    alter table public.refusal_practice
      add constraint refusal_practice_session_situation_key
      unique (session_id, situation_id);
  end if;
end $$;

create index if not exists refusal_practice_created_at_idx
  on public.refusal_practice (created_at desc);

create index if not exists refusal_practice_situation_idx
  on public.refusal_practice (situation_id);

alter table public.refusal_practice enable row level security;

revoke all on table public.refusal_practice from anon, authenticated, public;
grant all on table public.refusal_practice to service_role;
grant insert, update on table public.refusal_practice to anon, authenticated;
grant select on table public.refusal_practice to authenticated;

drop policy if exists "anon_insert_refusal_practice" on public.refusal_practice;
drop policy if exists "anon_update_refusal_practice" on public.refusal_practice;
drop policy if exists "auth_select_refusal_practice" on public.refusal_practice;

create policy "anon_insert_refusal_practice"
  on public.refusal_practice for insert
  to anon, authenticated
  with check (true);

create policy "anon_update_refusal_practice"
  on public.refusal_practice for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "auth_select_refusal_practice"
  on public.refusal_practice for select
  to authenticated
  using (true);

create or replace view public.admin_refusal_practice
with (security_invoker = true) as
select
  rp.id,
  rp.session_id,
  rp.user_id,
  u.nickname,
  rp.situation_id,
  rp.selected_phrase,
  rp.created_at,
  rp.updated_at
from public.refusal_practice rp
left join public.users u on u.id = rp.user_id;

revoke all on public.admin_refusal_practice from anon, public;
grant select on public.admin_refusal_practice to authenticated, service_role;
