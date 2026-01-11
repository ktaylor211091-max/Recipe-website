-- Create updated_at trigger function if it doesn't exist
create or replace function set_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Shopping List table
create table if not exists public.shopping_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  recipe_title text,
  recipe_slug text,
  checked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.shopping_list enable row level security;

create policy "shopping_list: user can read own"
on public.shopping_list
for select
to authenticated
using (auth.uid() = user_id);

create policy "shopping_list: user can insert own"
on public.shopping_list
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "shopping_list: user can update own"
on public.shopping_list
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "shopping_list: user can delete own"
on public.shopping_list
for delete
to authenticated
using (auth.uid() = user_id);

create index if not exists shopping_list_user_id_idx
on public.shopping_list (user_id);

-- Trending Recipes view (based on ratings only)
create or replace view trending_recipes as
select 
  r.id,
  r.title,
  r.slug,
  r.author_id,
  r.image_path,
  r.category,
  count(rr.id) as rating_count,
  avg(rr.rating) as avg_rating
from public.recipes r
left join public.recipe_reviews rr on r.id = rr.recipe_id
where r.published = true
group by r.id
having count(rr.id) > 0
order by avg(rr.rating) desc, count(rr.id) desc;

-- Recipe collections table
create table if not exists public.recipe_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recipe_collections enable row level security;

create policy "recipe_collections: public can read public"
on public.recipe_collections
for select
using (is_public = true OR auth.uid() = user_id);

create policy "recipe_collections: user can manage own"
on public.recipe_collections
for all
to authenticated
using (auth.uid() = user_id);

create index if not exists recipe_collections_user_id_idx
on public.recipe_collections (user_id);

-- Collection items table
create table if not exists public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.recipe_collections(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  added_at timestamptz not null default now()
);

alter table public.collection_items enable row level security;

create policy "collection_items: public can read from public collections"
on public.collection_items
for select
using (
  exists (
    select 1 from public.recipe_collections rc
    where rc.id = collection_id and (rc.is_public = true or rc.user_id = auth.uid())
  )
);

create policy "collection_items: user can manage own"
on public.collection_items
for all
to authenticated
using (
  exists (
    select 1 from public.recipe_collections rc
    where rc.id = collection_id and rc.user_id = auth.uid()
  )
);

create index if not exists collection_items_collection_id_idx
on public.collection_items (collection_id);

create index if not exists collection_items_recipe_id_idx
on public.collection_items (recipe_id);

-- Update trigger for shopping_list
drop trigger if exists set_shopping_list_updated_at on public.shopping_list;
create trigger set_shopping_list_updated_at
before update on public.shopping_list
for each row
execute function set_updated_at_column();

-- Update trigger for recipe_collections
drop trigger if exists set_recipe_collections_updated_at on public.recipe_collections;
create trigger set_recipe_collections_updated_at
before update on public.recipe_collections
for each row
execute function set_updated_at_column();
