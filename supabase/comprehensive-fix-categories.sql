-- COMPREHENSIVE FIX for recipe categories
-- This script cleans up the dual category column issue and ensures data consistency

-- Step 1: Ensure all recipes have valid text category values from the categories table
UPDATE public.recipes r
SET category = c.name
FROM public.categories c
WHERE r.category_id = c.id
  AND (r.category IS NULL OR r.category = '' OR r.category NOT IN (SELECT name FROM public.categories));

-- Step 2: For any recipes still with invalid categories, set to General
UPDATE public.recipes
SET category = 'General'
WHERE category IS NULL 
   OR category = ''
   OR category NOT IN (SELECT name FROM public.categories);

-- Step 3: Verify all recipes now have valid categories
SELECT category, COUNT(*) as count
FROM public.recipes
GROUP BY category
ORDER BY category;

-- Step 4: Check for any remaining invalid states
SELECT id, title, category, category_id
FROM public.recipes
WHERE category IS NULL 
   OR category NOT IN (SELECT name FROM public.categories)
LIMIT 10;
