-- Row Level Security on every user-owned table. Own rows only, via auth.uid().
do $$ declare t text; begin
  foreach t in array array['user_settings','daily_checkins','habits','habit_logs','daily_commitments','meal_logs','exercise_logs','hydration_logs','focus_sessions','journal_entries','weekly_reviews'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on public.%I from anon, public', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('create policy "%1$s_select" on public.%1$I for select to authenticated using (user_id = (select auth.uid()))', t);
    execute format('create policy "%1$s_insert" on public.%1$I for insert to authenticated with check (user_id = (select auth.uid()))', t);
    execute format('create policy "%1$s_update" on public.%1$I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('create policy "%1$s_delete" on public.%1$I for delete to authenticated using (user_id = (select auth.uid()))', t);
  end loop;
end $$;

-- profiles: keyed by id. Created by trigger only (no client INSERT).
alter table public.profiles enable row level security;
alter table public.profiles force row level security;
revoke all on public.profiles from anon, public;
grant select, update, delete on public.profiles to authenticated;
create policy profiles_select on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy profiles_delete on public.profiles for delete to authenticated using (id = (select auth.uid()));

revoke execute on function public.handle_new_user() from public, anon, authenticated;
