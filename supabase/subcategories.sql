-- Add subcategory support to categories table
-- Run this in Supabase SQL Editor

-- 1) Add parent_category_id column to categories table
alter table public.categories
add column if not exists parent_category_id uuid references public.categories(id) on delete cascade;

-- 2) Add index for faster parent lookups
create index if not exists idx_categories_parent on public.categories(parent_category_id);

-- 3) Insert subcategories for Breakfast
do $$
declare
  breakfast_id uuid;
begin
  select id into breakfast_id from public.categories where slug = 'breakfast';
  
  insert into public.categories (name, slug, display_order, parent_category_id) values
    ('Pancakes & Waffles', 'pancakes-waffles', 11, breakfast_id),
    ('Eggs', 'eggs', 12, breakfast_id),
    ('Smoothies', 'smoothies', 13, breakfast_id),
    ('Oatmeal & Cereal', 'oatmeal-cereal', 14, breakfast_id)
  on conflict (slug) do nothing;
end $$;

-- 4) Insert subcategories for Lunch
do $$
declare
  lunch_id uuid;
begin
  select id into lunch_id from public.categories where slug = 'lunch';
  
  insert into public.categories (name, slug, display_order, parent_category_id) values
    ('Sandwiches', 'sandwiches', 21, lunch_id),
    ('Salads', 'salads', 22, lunch_id),
    ('Soups', 'soups', 23, lunch_id),
    ('Wraps & Bowls', 'wraps-bowls', 24, lunch_id)
  on conflict (slug) do nothing;
end $$;

-- 5) Insert subcategories for Dinner
do $$
declare
  dinner_id uuid;
begin
  select id into dinner_id from public.categories where slug = 'dinner';
  
  insert into public.categories (name, slug, display_order, parent_category_id) values
    ('Pasta', 'pasta', 31, dinner_id),
    ('Chicken', 'chicken', 32, dinner_id),
    ('Beef', 'beef', 33, dinner_id),
    ('Seafood', 'seafood', 34, dinner_id),
    ('Vegetarian', 'vegetarian', 35, dinner_id),
    ('Pizza', 'pizza', 36, dinner_id)
  on conflict (slug) do nothing;
end $$;

-- 6) Insert subcategories for Desserts
do $$
declare
  dessert_id uuid;
begin
  select id into dessert_id from public.categories where slug = 'dessert';
  
  insert into public.categories (name, slug, display_order, parent_category_id) values
    ('Cakes', 'cakes', 41, dessert_id),
    ('Cookies', 'cookies', 42, dessert_id),
    ('Pies & Tarts', 'pies-tarts', 43, dessert_id),
    ('Ice Cream', 'ice-cream', 44, dessert_id),
    ('Brownies & Bars', 'brownies-bars', 45, dessert_id)
  on conflict (slug) do nothing;
end $$;

-- 7) Insert subcategories for Snacks
do $$
declare
  snacks_id uuid;
begin
  select id into snacks_id from public.categories where slug = 'snacks';
  
  insert into public.categories (name, slug, display_order, parent_category_id) values
    ('Dips & Spreads', 'dips-spreads', 51, snacks_id),
    ('Appetizers', 'appetizers', 52, snacks_id),
    ('Finger Foods', 'finger-foods', 53, snacks_id),
    ('Energy Bars', 'energy-bars', 54, snacks_id)
  on conflict (slug) do nothing;
end $$;
