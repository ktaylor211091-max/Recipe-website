-- Comprehensive feature additions for recipe website
-- Run this in Supabase SQL Editor after categories.sql

-- 1) Add notes/tips and nutritional info to recipes table
alter table public.recipes
add column if not exists notes text,
add column if not exists tips text,
add column if not exists calories integer,
add column if not exists protein_grams decimal(5,1),
add column if not exists carbs_grams decimal(5,1),
add column if not exists fat_grams decimal(5,1),
add column if not exists fiber_grams decimal(5,1);

-- 2) Create tags table
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.tags enable row level security;

create policy "tags: public read"
on public.tags
for select
to authenticated, anon
using (true);

create policy "tags: admin insert"
on public.tags
for insert
to authenticated
with check (is_admin());

create policy "tags: admin delete"
on public.tags
for delete
to authenticated
using (is_admin());

-- Insert common tags
insert into public.tags (name, slug) values
  ('Quick & Easy', 'quick-easy'),
  ('Vegetarian', 'vegetarian'),
  ('Vegan', 'vegan'),
  ('Gluten-Free', 'gluten-free'),
  ('Dairy-Free', 'dairy-free'),
  ('Low-Carb', 'low-carb'),
  ('High-Protein', 'high-protein'),
  ('Kid-Friendly', 'kid-friendly'),
  ('Healthy', 'healthy'),
  ('Comfort Food', 'comfort-food')
on conflict (name) do nothing;

-- 3) Create recipe_tags junction table
create table if not exists public.recipe_tags (
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (recipe_id, tag_id)
);

alter table public.recipe_tags enable row level security;

create policy "recipe_tags: public read"
on public.recipe_tags
for select
to authenticated, anon
using (true);

create policy "recipe_tags: admin all"
on public.recipe_tags
for all
to authenticated
using (is_admin())
with check (is_admin());

-- 4) Create collections table
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.collections enable row level security;

create policy "collections: public read"
on public.collections
for select
to authenticated, anon
using (true);

create policy "collections: admin all"
on public.collections
for all
to authenticated
using (is_admin())
with check (is_admin());

-- 5) Create collection_recipes junction table
create table if not exists public.collection_recipes (
  collection_id uuid not null references public.collections(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  primary key (collection_id, recipe_id)
);

alter table public.collection_recipes enable row level security;

create policy "collection_recipes: public read"
on public.collection_recipes
for select
to authenticated, anon
using (true);

create policy "collection_recipes: admin all"
on public.collection_recipes
for all
to authenticated
using (is_admin())
with check (is_admin());

-- 6) Create ratings table
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  user_name text,
  user_email text,
  created_at timestamptz not null default now()
);

alter table public.ratings enable row level security;

create policy "ratings: public read"
on public.ratings
for select
to authenticated, anon
using (true);

create policy "ratings: anyone insert"
on public.ratings
for insert
to anon, authenticated
with check (true);

create policy "ratings: admin delete"
on public.ratings
for delete
to authenticated
using (is_admin());

-- Create index for rating queries
create index if not exists ratings_recipe_id_idx on public.ratings(recipe_id);

-- 7) Create view for recipe ratings summary
create or replace view public.recipe_ratings_summary as
select 
  recipe_id,
  count(*) as rating_count,
  avg(rating)::decimal(3,2) as average_rating
from public.ratings
group by recipe_id;

-- Grant access to the view
grant select on public.recipe_ratings_summary to anon, authenticated;

-- 8) Create indexes for search performance
-- Note: Standard btree indexes instead of gin for simpler searching
create index if not exists recipes_prep_time_idx on public.recipes(prep_time_minutes);
create index if not exists recipes_cook_time_idx on public.recipes(cook_time_minutes);
create index if not exists recipes_published_idx on public.recipes(published);

-- 9) Create function for simple text search
create or replace function public.search_recipes(search_query text)
returns setof public.recipes
language sql
stable
as $$
  select *
  from public.recipes
  where published = true
  and (
    lower(title) like '%' || lower(search_query) || '%'
    or lower(coalesce(description, '')) like '%' || lower(search_query) || '%'
    or exists (
      select 1 from unnest(ingredients) as ingredient
      where lower(ingredient) like '%' || lower(search_query) || '%'
    )
  )
  order by created_at desc;
$$;
