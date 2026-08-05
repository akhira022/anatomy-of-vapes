-- One official quiz result per learner: allow checking without opening SELECT on quiz_results.

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
grant execute on function public.learner_has_quiz_result(uuid) to anon, authenticated;
