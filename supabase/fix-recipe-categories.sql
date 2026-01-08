-- Fix recipe categories: set all recipes to have a valid category name
-- This fixes recipes that were created with invalid category_id values

-- First, update any NULL or invalid categories to "General"
UPDATE public.recipes
SET category = 'General'
WHERE category IS NULL 
   OR category = ''
   OR category NOT IN (
     SELECT name FROM public.categories
   );

-- Verify the update
SELECT COUNT(*), category 
FROM public.recipes 
GROUP BY category
ORDER BY category;
