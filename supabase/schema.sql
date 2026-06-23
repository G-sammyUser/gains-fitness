-- GAINS production cloud database schema for Supabase.
-- Run this in the Supabase SQL editor for the project dedicated to this website.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  goal text,
  experience text,
  equipment text[] default '{}',
  weekly_goal integer not null default 3 check (weekly_goal between 1 and 7),
  plan text not null default 'Basic' check (plan in ('Basic', 'Pro', 'Elite')),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'annual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_slug text not null,
  workout_title text not null,
  instructor text not null,
  status text not null default 'booked' check (status in ('booked', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (user_id, workout_slug, status)
);

create table if not exists public.workout_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_slug text not null,
  workout_title text not null,
  completed_at timestamptz not null default now()
);

create index if not exists class_bookings_user_id_idx on public.class_bookings(user_id);
create index if not exists workout_completions_user_id_idx on public.workout_completions(user_id);
create index if not exists workout_completions_completed_at_idx on public.workout_completions(completed_at desc);

alter table public.profiles enable row level security;
alter table public.class_bookings enable row level security;
alter table public.workout_completions enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can read own bookings" on public.class_bookings;
create policy "Users can read own bookings"
on public.class_bookings for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create own bookings" on public.class_bookings;
create policy "Users can create own bookings"
on public.class_bookings for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own bookings" on public.class_bookings;
create policy "Users can update own bookings"
on public.class_bookings for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own bookings" on public.class_bookings;
create policy "Users can delete own bookings"
on public.class_bookings for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own completions" on public.workout_completions;
create policy "Users can read own completions"
on public.workout_completions for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create own completions" on public.workout_completions;
create policy "Users can create own completions"
on public.workout_completions for insert
to authenticated
with check ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();