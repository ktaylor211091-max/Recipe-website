-- Run this in Supabase SQL Editor
-- Enables admin-only recipe uploads and public recipe reading.

-- 1) Profiles table (user roles)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: user can read self"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles: user can upsert self"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles: user can update self"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Helper function for RLS checks
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- 2) Recipes table
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  author_id uuid not null references auth.users(id) on delete restrict,

  title text not null,
  slug text not null unique,
  description text,
  ingredients text[] not null default '{}',
  steps text[] not null default '{}',

  image_path text,
  published boolean not null default false
);

create index if not exists recipes_published_created_at_idx
on public.recipes (published, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_recipes_updated_at on public.recipes;
create trigger set_recipes_updated_at
before update on public.recipes
for each row
execute function public.set_updated_at();

alter table public.recipes enable row level security;

-- Anyone can read published recipes
create policy "recipes: public read published"
on public.recipes
for select
to anon, authenticated
using (published = true);

-- Admins can read everything
create policy "recipes: admin read all"
on public.recipes
for select
to authenticated
using (public.is_admin());

-- Admins can insert/update/delete
create policy "recipes: admin insert"
on public.recipes
for insert
to authenticated
with check (public.is_admin() and author_id = auth.uid());

create policy "recipes: admin update"
on public.recipes
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "recipes: admin delete"
on public.recipes
for delete
to authenticated
using (public.is_admin());
