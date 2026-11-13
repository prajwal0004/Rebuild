-- REBUILD schema. All dates = local calendar DATE; timestamps = TIMESTAMPTZ.
create extension if not exists pgcrypto;

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

-- Blocks any attempt to move a record to another owner.
create or replace function public.prevent_user_id_change() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'user_id is immutable';
  end if;
  return new;
end $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  timezone text not null default 'Asia/Kathmandu',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  bedtime_target time not null default '22:30',
  wakeup_target time not null default '06:30',
  daily_exercise_goal int not null default 30 check (daily_exercise_goal >= 0),
  daily_focus_goal int not null default 60 check (daily_focus_goal >= 0),
  water_goal int not null default 2500 check (water_goal >= 0),
  theme text not null default 'dark' check (theme in ('dark','light','system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null,
  energy_level smallint not null check (energy_level between 1 and 10),
  mood text not null check (mood in ('Happy','Calm','Motivated','Anxious','Lonely','Empty','Frustrated','Sad','Restless','Overwhelmed')),
  stress_level smallint not null check (stress_level between 1 and 10),
  sleep_hours numeric(4,2) check (sleep_hours between 0 and 24),
  physical_condition text,
  fatigue_level smallint check (fatigue_level between 1 and 10),
  hunger_level smallint check (hunger_level between 1 and 10),
  restlessness_level smallint check (restlessness_level between 1 and 10),
  emotional_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, checkin_date)
);

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  description text,
  category text not null check (category in ('Sleep','Nutrition','Exercise','Discipline','Personal Growth')),
  target_value numeric,
  unit text,
  frequency text not null default 'daily' check (frequency in ('daily','weekly')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null,
  log_date date not null,
  completed boolean not null default false,
  value numeric,
  notes text,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date),
  -- composite FK: a log can only point at a habit owned by the same user
  foreign key (habit_id, user_id) references public.habits (id, user_id) on delete cascade
);

create table public.daily_commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  commitment_date date not null,
  title text not null check (length(trim(title)) > 0),
  description text,
  commitment_type text not null check (commitment_type in ('Main Priority','Micro Task','Personal Promise')),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, commitment_date, commitment_type)
);

create table public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_date date not null,
  meal_type text not null check (meal_type in ('Breakfast','Lunch','Dinner','Snack')),
  description text,
  meal_time time,
  notes text,
  created_at timestamptz not null default now()
);

create table public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_date date not null,
  activity_type text not null,
  duration_minutes int not null check (duration_minutes > 0),
  intensity text check (intensity in ('Light','Moderate','Hard')),
  notes text,
  created_at timestamptz not null default now()
);

create table public.hydration_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  water_ml int not null check (water_ml > 0),
  created_at timestamptz not null default now()
);

create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_name text,
  duration_minutes int not null check (duration_minutes > 0),
  session_type text not null check (session_type in ('starter','focus','break','custom')),
  completed boolean not null default false,
  session_date date not null,
  created_at timestamptz not null default now()
);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  title text,
  content text not null default '',
  mood text check (mood in ('Happy','Calm','Motivated','Anxious','Lonely','Empty','Frustrated','Sad','Restless','Overwhelmed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  went_well text,
  difficulties text,
  learned text,
  improvements text,
  next_week_goal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index on public.daily_checkins (user_id, checkin_date desc);
create index on public.habits (user_id, is_active);
create index on public.habit_logs (user_id, log_date desc);
create index on public.daily_commitments (user_id, commitment_date desc);
create index on public.meal_logs (user_id, meal_date desc);
create index on public.exercise_logs (user_id, exercise_date desc);
create index on public.hydration_logs (user_id, log_date desc);
create index on public.focus_sessions (user_id, session_date desc);
create index on public.journal_entries (user_id, entry_date desc);
create index on public.weekly_reviews (user_id, week_start desc);

do $$ declare t text; begin
  foreach t in array array['profiles','user_settings','daily_checkins','journal_entries','weekly_reviews'] loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- user_id immutability (defense in depth beside RLS WITH CHECK)
do $$ declare t text; begin
  foreach t in array array['user_settings','daily_checkins','habits','habit_logs','daily_commitments','meal_logs','exercise_logs','hydration_logs','focus_sessions','journal_entries','weekly_reviews'] loop
    execute format('create trigger lock_user_id before update on public.%I for each row execute function public.prevent_user_id_change()', t);
  end loop;
end $$;

-- New user -> profile + settings + default habits
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  insert into public.user_settings (user_id) values (new.id);
  insert into public.habits (user_id, title, category) values
    (new.id,'Sleep on time','Sleep'),
    (new.id,'Wake up on time','Sleep'),
    (new.id,'Eat breakfast','Nutrition'),
    (new.id,'Eat lunch','Nutrition'),
    (new.id,'Eat dinner','Nutrition'),
    (new.id,'Drink enough water','Nutrition'),
    (new.id,'Exercise','Exercise'),
    (new.id,'Limit unnecessary scrolling','Discipline'),
    (new.id,'Complete an important task','Discipline'),
    (new.id,'Learn something new','Personal Growth');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
