-- One-time script to backfill activities from existing data
-- Run this once in Supabase SQL Editor to populate historical activities

-- 1. Create activities for existing recipes
INSERT INTO public.activities (user_id, activity_type, recipe_id, created_at)
SELECT 
  author_id as user_id,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.recipe_forks 
      WHERE forked_recipe_id = recipes.id
    ) THEN 'recipe_forked'
    ELSE 'recipe_created'
  END as activity_type,
  id as recipe_id,
  created_at
FROM public.recipes
WHERE NOT EXISTS (
  -- Don't create duplicates
  SELECT 1 FROM public.activities 
  WHERE activities.recipe_id = recipes.id 
  AND activities.activity_type IN ('recipe_created', 'recipe_forked')
);

-- 2. Create activities for existing favorites
INSERT INTO public.activities (user_id, activity_type, recipe_id, created_at)
SELECT 
  user_id,
  'recipe_favorited' as activity_type,
  recipe_id,
  created_at
FROM public.favorite_recipes
WHERE NOT EXISTS (
  -- Don't create duplicates
  SELECT 1 FROM public.activities 
  WHERE activities.user_id = favorite_recipes.user_id
  AND activities.recipe_id = favorite_recipes.recipe_id
  AND activities.activity_type = 'recipe_favorited'
);

-- 3. Create activities for existing follows
INSERT INTO public.activities (user_id, activity_type, target_user_id, created_at)
SELECT 
  follower_id as user_id,
  'user_followed' as activity_type,
  following_id as target_user_id,
  created_at
FROM public.user_follows
WHERE NOT EXISTS (
  -- Don't create duplicates
  SELECT 1 FROM public.activities 
  WHERE activities.user_id = user_follows.follower_id
  AND activities.target_user_id = user_follows.following_id
  AND activities.activity_type = 'user_followed'
);

-- 4. Create activities for existing top-level comments
INSERT INTO public.activities (user_id, activity_type, recipe_id, created_at)
SELECT 
  user_id,
  'comment_posted' as activity_type,
  recipe_id,
  created_at
FROM public.recipe_comments
WHERE parent_comment_id IS NULL  -- Only top-level comments
AND NOT EXISTS (
  -- Don't create duplicates
  SELECT 1 FROM public.activities 
  WHERE activities.user_id = recipe_comments.user_id
  AND activities.recipe_id = recipe_comments.recipe_id
  AND activities.activity_type = 'comment_posted'
  AND activities.created_at = recipe_comments.created_at
);

-- Summary: Show how many activities were created
SELECT 
  activity_type,
  COUNT(*) as count
FROM public.activities
GROUP BY activity_type
ORDER BY activity_type;
