-- Database Verification Script
-- Run this in Supabase SQL Editor to check what's been deployed

-- Check if tables exist
SELECT 
  'profiles' as table_name,
  EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') as exists
UNION ALL
SELECT 'recipes', EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'recipes')
UNION ALL
SELECT 'favorite_recipes', EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'favorite_recipes')
UNION ALL
SELECT 'recipe_reviews', EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'recipe_reviews')
UNION ALL
SELECT 'user_follows', EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_follows')
UNION ALL
SELECT 'recipe_comments', EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'recipe_comments')
UNION ALL
SELECT 'activities', EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activities')
UNION ALL
SELECT 'messages', EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages')
UNION ALL
SELECT 'recipe_likes', EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'recipe_likes')
UNION ALL
SELECT 'notifications', EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications')
UNION ALL
SELECT 'recipe_forks', EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'recipe_forks');

-- Check profiles columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check RLS policies on profiles
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles';

-- Check RLS policies on recipe_comments
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'recipe_comments';

-- Check RLS policies on recipe_reviews
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'recipe_reviews';
