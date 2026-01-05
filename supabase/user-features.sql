-- User features: favorites, ratings, reviews
-- Run this in Supabase SQL Editor after schema.sql

-- 1) Favorite recipes table
create table if not exists public.favorite_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, recipe_id)
);

alter table public.favorite_recipes enable row level security;

-- Users can read their own favorites
create policy "favorite_recipes: user can read own"
on public.favorite_recipes
for select
to authenticated
using (auth.uid() = user_id);

-- Users can add favorites
create policy "favorite_recipes: user can insert own"
on public.favorite_recipes
for insert
to authenticated
with check (auth.uid() = user_id);

-- Users can delete their own favorites
create policy "favorite_recipes: user can delete own"
on public.favorite_recipes
for delete
to authenticated
using (auth.uid() = user_id);

-- Index for faster lookups
create index if not exists favorite_recipes_user_id_idx on public.favorite_recipes(user_id);
create index if not exists favorite_recipes_recipe_id_idx on public.favorite_recipes(recipe_id);

-- 2) Recipe ratings and reviews
create table if not exists public.recipe_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  review_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, recipe_id)
);

alter table public.recipe_reviews enable row level security;

-- Anyone can read reviews for published recipes
create policy "recipe_reviews: public read"
on public.recipe_reviews
for select
to authenticated, anon
using (
  exists(
    select 1 from public.recipes
    where id = recipe_id and published = true
  )
);

-- Users can create their own reviews
create policy "recipe_reviews: user can insert own"
on public.recipe_reviews
for insert
to authenticated
with check (auth.uid() = user_id);

-- Users can update their own reviews
create policy "recipe_reviews: user can update own"
on public.recipe_reviews
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Users can delete their own reviews
create policy "recipe_reviews: user can delete own"
on public.recipe_reviews
for delete
to authenticated
using (auth.uid() = user_id);

-- Admins can delete any review
create policy "recipe_reviews: admin can delete"
on public.recipe_reviews
for delete
to authenticated
using (is_admin());

-- Trigger for updated_at
drop trigger if exists set_recipe_reviews_updated_at on public.recipe_reviews;
create trigger set_recipe_reviews_updated_at
before update on public.recipe_reviews
for each row
execute function public.set_updated_at();

-- Index for faster lookups
create index if not exists recipe_reviews_recipe_id_idx on public.recipe_reviews(recipe_id);
create index if not exists recipe_reviews_user_id_idx on public.recipe_reviews(user_id);

-- 3) View for recipe stats (average rating, review count)
create or replace view public.recipe_stats as
select
  r.id as recipe_id,
  count(rv.id) as review_count,
  coalesce(avg(rv.rating), 0) as average_rating,
  count(distinct fav.user_id) as favorite_count
from public.recipes r
left join public.recipe_reviews rv on rv.recipe_id = r.id
left join public.favorite_recipes fav on fav.recipe_id = r.id
where r.published = true
group by r.id;
