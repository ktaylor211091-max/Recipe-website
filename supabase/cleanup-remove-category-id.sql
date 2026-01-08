-- CLEAN UP: Remove category_id column and keep only category (text)
-- This simplifies the category system

-- Step 1: Ensure all recipes have valid text category values
UPDATE public.recipes
SET category = COALESCE(
  (SELECT name FROM public.categories WHERE id = recipes.category_id),
  'General'
)
WHERE category IS NULL OR category = '';

-- Step 2: Drop the category_id column entirely
ALTER TABLE public.recipes DROP COLUMN IF EXISTS category_id;

-- Step 3: Ensure category has a proper default
ALTER TABLE public.recipes 
  ALTER COLUMN category SET DEFAULT 'General',
  ALTER COLUMN category SET NOT NULL;

-- Step 4: Add index for performance
CREATE INDEX IF NOT EXISTS idx_recipes_category ON public.recipes(category);

-- Verify the cleanup
SELECT category, COUNT(*) as count
FROM public.recipes
GROUP BY category
ORDER BY category;
