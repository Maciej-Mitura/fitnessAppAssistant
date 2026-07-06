-- =============================================================================
-- FitOS — Supabase database schema
-- =============================================================================
-- Run in the Supabase SQL Editor or via `supabase db push` after linking your
-- project. Requires Supabase Auth (auth.users).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. profiles
-- --------------------------------------------------------------------------- 

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text,
  height_cm numeric,
  birth_date date,
  goal text,
  injury_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_user_id_key unique (user_id)
);

create index profiles_user_id_idx on public.profiles (user_id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = user_id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "profiles_delete_own"
  on public.profiles
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2. body_metrics
-- ---------------------------------------------------------------------------

create table public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  weight_kg numeric,
  waist_cm numeric,
  notes text,
  created_at timestamptz not null default now()
);

create index body_metrics_user_id_date_idx on public.body_metrics (user_id, date desc);

alter table public.body_metrics enable row level security;

create policy "body_metrics_select_own"
  on public.body_metrics
  for select
  using (auth.uid() = user_id);

create policy "body_metrics_insert_own"
  on public.body_metrics
  for insert
  with check (auth.uid() = user_id);

create policy "body_metrics_update_own"
  on public.body_metrics
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "body_metrics_delete_own"
  on public.body_metrics
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. macro_targets
-- ---------------------------------------------------------------------------

create table public.macro_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  calories int not null,
  protein_g int not null,
  carbs_g int not null,
  fat_g int not null,
  active_from date not null,
  active_until date,
  created_at timestamptz not null default now(),
  constraint macro_targets_active_until_after_from
    check (active_until is null or active_until >= active_from)
);

create index macro_targets_user_id_active_idx
  on public.macro_targets (user_id, active_from desc);

alter table public.macro_targets enable row level security;

create policy "macro_targets_select_own"
  on public.macro_targets
  for select
  using (auth.uid() = user_id);

create policy "macro_targets_insert_own"
  on public.macro_targets
  for insert
  with check (auth.uid() = user_id);

create policy "macro_targets_update_own"
  on public.macro_targets
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "macro_targets_delete_own"
  on public.macro_targets
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. daily_logs
-- ---------------------------------------------------------------------------

create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  raw_text text not null,
  calories int,
  protein_g int,
  carbs_g int,
  fat_g int,
  ai_summary text,
  ai_feedback text,
  created_at timestamptz not null default now()
);

create index daily_logs_user_id_date_idx on public.daily_logs (user_id, date desc);

alter table public.daily_logs enable row level security;

create policy "daily_logs_select_own"
  on public.daily_logs
  for select
  using (auth.uid() = user_id);

create policy "daily_logs_insert_own"
  on public.daily_logs
  for insert
  with check (auth.uid() = user_id);

create policy "daily_logs_update_own"
  on public.daily_logs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_logs_delete_own"
  on public.daily_logs
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 5. workout_logs
-- ---------------------------------------------------------------------------

create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  workout_type text,
  raw_text text not null,
  ai_summary text,
  fatigue_score int,
  pain_notes text,
  created_at timestamptz not null default now(),
  constraint workout_logs_fatigue_score_range
    check (fatigue_score is null or (fatigue_score >= 1 and fatigue_score <= 10))
);

create index workout_logs_user_id_date_idx on public.workout_logs (user_id, date desc);

alter table public.workout_logs enable row level security;

create policy "workout_logs_select_own"
  on public.workout_logs
  for select
  using (auth.uid() = user_id);

create policy "workout_logs_insert_own"
  on public.workout_logs
  for insert
  with check (auth.uid() = user_id);

create policy "workout_logs_update_own"
  on public.workout_logs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "workout_logs_delete_own"
  on public.workout_logs
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 6. exercise_logs
-- ---------------------------------------------------------------------------

create table public.exercise_logs (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid not null references public.workout_logs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_name text not null,
  sets int,
  reps text,
  weight_kg numeric,
  notes text,
  created_at timestamptz not null default now(),
  constraint exercise_logs_sets_positive check (sets is null or sets > 0)
);

create index exercise_logs_workout_log_id_idx on public.exercise_logs (workout_log_id);
create index exercise_logs_user_id_idx on public.exercise_logs (user_id);

alter table public.exercise_logs enable row level security;

create policy "exercise_logs_select_own"
  on public.exercise_logs
  for select
  using (auth.uid() = user_id);

create policy "exercise_logs_insert_own"
  on public.exercise_logs
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.workout_logs wl
      where wl.id = workout_log_id
        and wl.user_id = auth.uid()
    )
  );

create policy "exercise_logs_update_own"
  on public.exercise_logs
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.workout_logs wl
      where wl.id = workout_log_id
        and wl.user_id = auth.uid()
    )
  );

create policy "exercise_logs_delete_own"
  on public.exercise_logs
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 7. training_plans
-- ---------------------------------------------------------------------------

create table public.training_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  goal text,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create index training_plans_user_id_idx on public.training_plans (user_id);
create index training_plans_user_id_active_idx
  on public.training_plans (user_id)
  where is_active = true;

alter table public.training_plans enable row level security;

create policy "training_plans_select_own"
  on public.training_plans
  for select
  using (auth.uid() = user_id);

create policy "training_plans_insert_own"
  on public.training_plans
  for insert
  with check (auth.uid() = user_id);

create policy "training_plans_update_own"
  on public.training_plans
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "training_plans_delete_own"
  on public.training_plans
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 8. progress_photos
-- ---------------------------------------------------------------------------

create table public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  storage_path text not null,
  photo_type text not null,
  notes text,
  ai_observation text,
  created_at timestamptz not null default now(),
  constraint progress_photos_type_check check (
    photo_type in ('front', 'side', 'back', 'other')
  )
);

create index progress_photos_user_id_date_idx on public.progress_photos (user_id, date desc);

alter table public.progress_photos enable row level security;

create policy "progress_photos_select_own"
  on public.progress_photos
  for select
  using (auth.uid() = user_id);

create policy "progress_photos_insert_own"
  on public.progress_photos
  for insert
  with check (auth.uid() = user_id);

create policy "progress_photos_update_own"
  on public.progress_photos
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "progress_photos_delete_own"
  on public.progress_photos
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 9. special_events
-- ---------------------------------------------------------------------------

create table public.special_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  type text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create index special_events_user_id_date_idx on public.special_events (user_id, date desc);

alter table public.special_events enable row level security;

create policy "special_events_select_own"
  on public.special_events
  for select
  using (auth.uid() = user_id);

create policy "special_events_insert_own"
  on public.special_events
  for insert
  with check (auth.uid() = user_id);

create policy "special_events_update_own"
  on public.special_events
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "special_events_delete_own"
  on public.special_events
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 10. planned_workouts
-- ---------------------------------------------------------------------------

create table public.planned_workouts (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.training_plans (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create index planned_workouts_plan_id_idx on public.planned_workouts (plan_id);
create index planned_workouts_user_id_idx on public.planned_workouts (user_id);

alter table public.planned_workouts enable row level security;

create policy "planned_workouts_select_own"
  on public.planned_workouts
  for select
  using (auth.uid() = user_id);

create policy "planned_workouts_insert_own"
  on public.planned_workouts
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.training_plans tp
      where tp.id = plan_id and tp.user_id = auth.uid()
    )
  );

create policy "planned_workouts_update_own"
  on public.planned_workouts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "planned_workouts_delete_own"
  on public.planned_workouts
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 11. planned_exercises
-- ---------------------------------------------------------------------------

create table public.planned_exercises (
  id uuid primary key default gen_random_uuid(),
  planned_workout_id uuid not null references public.planned_workouts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_name text not null,
  sets int,
  reps text,
  weight_kg numeric,
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint planned_exercises_sets_positive check (sets is null or sets > 0)
);

create index planned_exercises_workout_id_idx on public.planned_exercises (planned_workout_id);
create index planned_exercises_user_id_idx on public.planned_exercises (user_id);

alter table public.planned_exercises enable row level security;

create policy "planned_exercises_select_own"
  on public.planned_exercises
  for select
  using (auth.uid() = user_id);

create policy "planned_exercises_insert_own"
  on public.planned_exercises
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.planned_workouts pw
      where pw.id = planned_workout_id and pw.user_id = auth.uid()
    )
  );

create policy "planned_exercises_update_own"
  on public.planned_exercises
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "planned_exercises_delete_own"
  on public.planned_exercises
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 12. progress_photos storage (private bucket)
-- ---------------------------------------------------------------------------
-- Run after creating the progress_photos table. Photos are never public;
-- the app serves them via short-lived signed URLs for the authenticated owner.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'progress-photos',
  'progress-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "progress_photos_storage_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "progress_photos_storage_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "progress_photos_storage_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Migration for existing databases:
-- alter table public.progress_photos add column if not exists notes text;
-- alter table public.progress_photos drop constraint if exists progress_photos_type_check;
-- alter table public.progress_photos add constraint progress_photos_type_check
--   check (photo_type in ('front', 'side', 'back', 'other'));
