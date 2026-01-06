-- Add subcategory support to categories table
-- Run this in Supabase SQL Editor

-- 1) Add parent_category_id column to categories table
alter table public.categories
add column if not exists parent_category_id uuid references public.categories(id) on delete cascade;

-- 2) Add index for faster parent lookups
create index if not exists idx_categories_parent on public.categories(parent_category_id);

-- 3) Insert subcategories for Breakfast
insert into public.categories (name, slug, display_order, parent_category_id)
select 'Pancakes & Waffles', 'pancakes-waffles', 11, id from public.categories where slug = 'breakfast'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Eggs', 'eggs', 12, id from public.categories where slug = 'breakfast'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Smoothies', 'smoothies', 13, id from public.categories where slug = 'breakfast'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Oatmeal & Cereal', 'oatmeal-cereal', 14, id from public.categories where slug = 'breakfast'
on conflict do nothing;

-- 4) Insert subcategories for Lunch
insert into public.categories (name, slug, display_order, parent_category_id)
select 'Sandwiches', 'sandwiches', 21, id from public.categories where slug = 'lunch'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Salads', 'salads', 22, id from public.categories where slug = 'lunch'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Soups', 'soups', 23, id from public.categories where slug = 'lunch'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Wraps & Bowls', 'wraps-bowls', 24, id from public.categories where slug = 'lunch'
on conflict do nothing;

-- 5) Insert subcategories for Dinner
insert into public.categories (name, slug, display_order, parent_category_id)
select 'Pasta', 'pasta', 31, id from public.categories where slug = 'dinner'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Chicken', 'chicken', 32, id from public.categories where slug = 'dinner'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Beef', 'beef', 33, id from public.categories where slug = 'dinner'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Seafood', 'seafood', 34, id from public.categories where slug = 'dinner'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Vegetarian', 'vegetarian', 35, id from public.categories where slug = 'dinner'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Pizza', 'pizza', 36, id from public.categories where slug = 'dinner'
on conflict do nothing;

-- 6) Insert subcategories for Desserts
insert into public.categories (name, slug, display_order, parent_category_id)
select 'Cakes', 'cakes', 41, id from public.categories where slug = 'dessert'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Cookies', 'cookies', 42, id from public.categories where slug = 'dessert'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Pies & Tarts', 'pies-tarts', 43, id from public.categories where slug = 'dessert'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Ice Cream', 'ice-cream', 44, id from public.categories where slug = 'dessert'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Brownies & Bars', 'brownies-bars', 45, id from public.categories where slug = 'dessert'
on conflict do nothing;

-- 7) Insert subcategories for Snacks
insert into public.categories (name, slug, display_order, parent_category_id)
select 'Dips & Spreads', 'dips-spreads', 51, id from public.categories where slug = 'snacks'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Appetizers', 'appetizers', 52, id from public.categories where slug = 'snacks'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Finger Foods', 'finger-foods', 53, id from public.categories where slug = 'snacks'
on conflict do nothing;

insert into public.categories (name, slug, display_order, parent_category_id)
select 'Energy Bars', 'energy-bars', 54, id from public.categories where slug = 'snacks'
on conflict do nothing;
