-- Admin write access: update/delete for authenticated admins (JWT role=admin).
-- Prefer server routes with SUPABASE_SERVICE_ROLE_KEY when available.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;

grant update, delete on table public.users to authenticated;
grant update, delete on table public.consent to authenticated;
grant update, delete on table public.quiz_results to authenticated;
grant update, delete on table public.quiz_answers to authenticated;

drop policy if exists "admin_update_users" on public.users;
drop policy if exists "admin_delete_users" on public.users;
drop policy if exists "admin_update_consent" on public.consent;
drop policy if exists "admin_delete_consent" on public.consent;
drop policy if exists "admin_update_quiz_results" on public.quiz_results;
drop policy if exists "admin_delete_quiz_results" on public.quiz_results;
drop policy if exists "admin_update_quiz_answers" on public.quiz_answers;
drop policy if exists "admin_delete_quiz_answers" on public.quiz_answers;

create policy "admin_update_users"
  on public.users for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin_delete_users"
  on public.users for delete
  to authenticated
  using (public.is_admin());

create policy "admin_update_consent"
  on public.consent for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin_delete_consent"
  on public.consent for delete
  to authenticated
  using (public.is_admin());

create policy "admin_update_quiz_results"
  on public.quiz_results for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin_delete_quiz_results"
  on public.quiz_results for delete
  to authenticated
  using (public.is_admin());

create policy "admin_update_quiz_answers"
  on public.quiz_answers for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin_delete_quiz_answers"
  on public.quiz_answers for delete
  to authenticated
  using (public.is_admin());
