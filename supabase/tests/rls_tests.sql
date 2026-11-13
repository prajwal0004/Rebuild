-- Run in the Supabase SQL editor AFTER migrations. Everything is rolled back.
-- Success = "NOTICE: ALL RLS TESTS PASSED". Any failure raises an exception.
begin;
do $$
declare
  a uuid := gen_random_uuid(); b uuid := gen_random_uuid();
  n int; hid uuid; ok boolean;
begin
  insert into auth.users (id, instance_id, aud, role, email)
    values (a,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','rls-a@test.local'),
           (b,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','rls-b@test.local');

  -- As user A: own records are accessible
  perform set_config('request.jwt.claims', json_build_object('sub',a,'role','authenticated')::text, true);
  set local role authenticated;
  insert into public.journal_entries (user_id, entry_date, content) values (a, current_date, 'private A');
  insert into public.daily_checkins (user_id, checkin_date, energy_level, mood, stress_level) values (a, current_date, 5, 'Calm', 3);
  select count(*) into n from public.journal_entries;
  assert n = 1, 'T1 FAIL: A cannot read own record';
  select id into hid from public.habits limit 1;
  assert hid is not null, 'T1 FAIL: A cannot read own default habits';

  -- A cannot insert a row owned by B
  ok := false;
  begin insert into public.journal_entries (user_id, entry_date, content) values (b, current_date, 'forged');
  exception when others then ok := true; end;
  assert ok, 'T2 FAIL: A inserted a row owned by B';

  -- B cannot see or touch A's data
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub',b,'role','authenticated')::text, true);
  set local role authenticated;
  select count(*) into n from public.journal_entries; assert n = 0, 'T2 FAIL: B can read A journal';
  select count(*) into n from public.daily_checkins;  assert n = 0, 'T2 FAIL: B can read A check-ins';
  update public.habits set title = 'hijack' where id = hid; get diagnostics n = row_count;
  assert n = 0, 'T2 FAIL: B updated A habit';
  delete from public.habits where id = hid; get diagnostics n = row_count;
  assert n = 0, 'T2 FAIL: B deleted A habit';

  -- A cannot reassign ownership of an existing record
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub',a,'role','authenticated')::text, true);
  set local role authenticated;
  ok := false;
  begin update public.habits set user_id = b where id = hid;
  exception when others then ok := true; end;
  assert ok, 'T4 FAIL: ownership change allowed';

  -- Unauthenticated visitor is blocked
  reset role;
  perform set_config('request.jwt.claims', '', true);
  set local role anon;
  ok := false;
  begin perform count(*) from public.journal_entries;
  exception when insufficient_privilege then ok := true; end;
  assert ok, 'T3 FAIL: anon can query private table';

  reset role;
  raise notice 'ALL RLS TESTS PASSED';
end $$;
rollback;
