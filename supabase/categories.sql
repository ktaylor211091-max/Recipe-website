-- Categories table for recipe organization
-- Run this in Supabase SQL Editor

-- 1) Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.categories enable row level security;

-- Allow public read access
create policy "categories: public read"
on public.categories
for select
to authenticated, anon
using (true);

-- Admin-only create, update, delete
create policy "categories: admin insert"
on public.categories
for insert
to authenticated
with check (is_admin());

create policy "categories: admin update"
on public.categories
for update
to authenticated
using (is_admin())
with check (is_admin());

create policy "categories: admin delete"
on public.categories
for delete
to authenticated
using (is_admin());

-- 2) Insert default categories
insert into public.categories (name, slug, display_order) values
  ('Breakfast', 'breakfast', 1),
  ('Lunch', 'lunch', 2),
  ('Dinner', 'dinner', 3),
  ('Desserts', 'dessert', 4),
  ('Snacks', 'snacks', 5),
  ('General', 'general', 6)
on conflict (name) do nothing;

-- 3) Add foreign key to recipes table
-- First, update existing recipes to use a valid category
update public.recipes
set category = 'General'
where category is null or category not in (select name from public.categories);

-- Add category_id column to recipes
alter table public.recipes
add column if not exists category_id uuid references public.categories(id);

-- Populate category_id based on existing category names
update public.recipes r
set category_id = c.id
from public.categories c
where lower(trim(r.category)) = lower(c.name);

-- Set default category for any remaining null values
update public.recipes
set category_id = (select id from public.categories where name = 'General')
where category_id is null;

-- Make category_id required
alter table public.recipes
alter column category_id set not null;

-- Update trigger to maintain updated_at
create or replace function public.update_categories_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger categories_updated_at
before update on public.categories
for each row
execute function public.update_categories_updated_at();

-- Optional: Create index for performance
create index if not exists recipes_category_id_idx on public.recipes(category_id);
