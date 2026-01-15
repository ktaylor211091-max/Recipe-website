-- Database Improvements: Constraints, Indexes, and Cascading Deletes
-- Run this file in Supabase SQL Editor to add production-ready database enhancements

-- =============================================
-- 1. ADD CASCADING DELETES FOR DATA INTEGRITY
-- =============================================

-- Drop existing foreign keys and recreate with CASCADE
-- This ensures orphaned records are automatically removed

-- Recipe reviews CASCADE on recipe deletion
ALTER TABLE recipe_reviews
DROP CONSTRAINT IF EXISTS recipe_reviews_recipe_id_fkey,
ADD CONSTRAINT recipe_reviews_recipe_id_fkey 
  FOREIGN KEY (recipe_id) 
  REFERENCES recipes(id) 
  ON DELETE CASCADE;

ALTER TABLE recipe_reviews
DROP CONSTRAINT IF EXISTS recipe_reviews_user_id_fkey,
ADD CONSTRAINT recipe_reviews_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Recipe comments CASCADE on recipe deletion
ALTER TABLE recipe_comments
DROP CONSTRAINT IF EXISTS recipe_comments_recipe_id_fkey,
ADD CONSTRAINT recipe_comments_recipe_id_fkey 
  FOREIGN KEY (recipe_id) 
  REFERENCES recipes(id) 
  ON DELETE CASCADE;

ALTER TABLE recipe_comments
DROP CONSTRAINT IF EXISTS recipe_comments_user_id_fkey,
ADD CONSTRAINT recipe_comments_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Recipe tags CASCADE on recipe deletion
ALTER TABLE recipe_tags
DROP CONSTRAINT IF EXISTS recipe_tags_recipe_id_fkey,
ADD CONSTRAINT recipe_tags_recipe_id_fkey 
  FOREIGN KEY (recipe_id) 
  REFERENCES recipes(id) 
  ON DELETE CASCADE;

ALTER TABLE recipe_tags
DROP CONSTRAINT IF EXISTS recipe_tags_tag_id_fkey,
ADD CONSTRAINT recipe_tags_tag_id_fkey 
  FOREIGN KEY (tag_id) 
  REFERENCES tags(id) 
  ON DELETE CASCADE;

-- Favorites CASCADE on recipe/user deletion
ALTER TABLE favorites
DROP CONSTRAINT IF EXISTS favorites_recipe_id_fkey,
ADD CONSTRAINT favorites_recipe_id_fkey 
  FOREIGN KEY (recipe_id) 
  REFERENCES recipes(id) 
  ON DELETE CASCADE;

ALTER TABLE favorites
DROP CONSTRAINT IF EXISTS favorites_user_id_fkey,
ADD CONSTRAINT favorites_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Messages CASCADE on user deletion
ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_recipient_id_fkey,
ADD CONSTRAINT messages_recipient_id_fkey 
  FOREIGN KEY (recipient_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Notifications CASCADE on user deletion
ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS notifications_user_id_fkey,
ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Shopping list items CASCADE on user deletion
ALTER TABLE shopping_list_items
DROP CONSTRAINT IF EXISTS shopping_list_items_user_id_fkey,
ADD CONSTRAINT shopping_list_items_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Collections CASCADE on user deletion
ALTER TABLE collections
DROP CONSTRAINT IF EXISTS collections_user_id_fkey,
ADD CONSTRAINT collections_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Collection items CASCADE on collection deletion
ALTER TABLE collection_items
DROP CONSTRAINT IF EXISTS collection_items_collection_id_fkey,
ADD CONSTRAINT collection_items_collection_id_fkey 
  FOREIGN KEY (collection_id) 
  REFERENCES collections(id) 
  ON DELETE CASCADE;

ALTER TABLE collection_items
DROP CONSTRAINT IF EXISTS collection_items_recipe_id_fkey,
ADD CONSTRAINT collection_items_recipe_id_fkey 
  FOREIGN KEY (recipe_id) 
  REFERENCES recipes(id) 
  ON DELETE CASCADE;

-- Activities CASCADE
ALTER TABLE activities
DROP CONSTRAINT IF EXISTS activities_user_id_fkey,
ADD CONSTRAINT activities_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- =============================================
-- 2. ADD CHECK CONSTRAINTS FOR DATA VALIDATION
-- =============================================

-- Recipe ratings must be between 1 and 5
ALTER TABLE recipe_reviews
DROP CONSTRAINT IF EXISTS recipe_reviews_rating_check,
ADD CONSTRAINT recipe_reviews_rating_check 
  CHECK (rating >= 1 AND rating <= 5);

-- Prep and cook time must be positive
ALTER TABLE recipes
DROP CONSTRAINT IF EXISTS recipes_prep_time_check,
ADD CONSTRAINT recipes_prep_time_check 
  CHECK (prep_time_minutes IS NULL OR prep_time_minutes > 0);

ALTER TABLE recipes
DROP CONSTRAINT IF EXISTS recipes_cook_time_check,
ADD CONSTRAINT recipes_cook_time_check 
  CHECK (cook_time_minutes IS NULL OR cook_time_minutes > 0);

-- Servings must be positive
ALTER TABLE recipes
DROP CONSTRAINT IF EXISTS recipes_servings_check,
ADD CONSTRAINT recipes_servings_check 
  CHECK (servings IS NULL OR servings > 0);

-- Nutritional info must be non-negative
ALTER TABLE recipes
DROP CONSTRAINT IF EXISTS recipes_calories_check,
ADD CONSTRAINT recipes_calories_check 
  CHECK (calories IS NULL OR calories >= 0);

ALTER TABLE recipes
DROP CONSTRAINT IF EXISTS recipes_protein_check,
ADD CONSTRAINT recipes_protein_check 
  CHECK (protein_grams IS NULL OR protein_grams >= 0);

ALTER TABLE recipes
DROP CONSTRAINT IF EXISTS recipes_carbs_check,
ADD CONSTRAINT recipes_carbs_check 
  CHECK (carbs_grams IS NULL OR carbs_grams >= 0);

ALTER TABLE recipes
DROP CONSTRAINT IF EXISTS recipes_fat_check,
ADD CONSTRAINT recipes_fat_check 
  CHECK (fat_grams IS NULL OR fat_grams >= 0);

-- =============================================
-- 3. ADD INDEXES FOR BETTER QUERY PERFORMANCE
-- =============================================

-- Recipes table indexes
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_author ON recipes(author_id);
CREATE INDEX IF NOT EXISTS idx_recipes_published ON recipes(published);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_slug ON recipes(slug);

-- Recipe reviews indexes
CREATE INDEX IF NOT EXISTS idx_recipe_reviews_recipe ON recipe_reviews(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_reviews_user ON recipe_reviews(user_id);

-- Recipe comments indexes
CREATE INDEX IF NOT EXISTS idx_recipe_comments_recipe ON recipe_comments(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_comments_user ON recipe_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_comments_parent ON recipe_comments(parent_comment_id);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_recipe ON favorites(recipe_id);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Collections indexes
CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id);

-- =============================================
-- 4. ADD UNIQUE CONSTRAINTS
-- =============================================

-- Prevent duplicate favorites
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_unique 
  ON favorites(user_id, recipe_id);

-- Prevent duplicate reviews (one review per user per recipe)
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipe_reviews_unique 
  ON recipe_reviews(user_id, recipe_id);

-- Prevent duplicate recipe tags
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipe_tags_unique 
  ON recipe_tags(recipe_id, tag_id);

-- Prevent duplicate collection items
CREATE UNIQUE INDEX IF NOT EXISTS idx_collection_items_unique 
  ON collection_items(collection_id, recipe_id);

-- =============================================
-- 5. ADD NOT NULL CONSTRAINTS WHERE APPROPRIATE
-- =============================================

-- Recipe essential fields
ALTER TABLE recipes
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN slug SET NOT NULL,
ALTER COLUMN author_id SET NOT NULL,
ALTER COLUMN published SET NOT NULL,
ALTER COLUMN created_at SET NOT NULL;

-- Profile essential fields
ALTER TABLE profiles
ALTER COLUMN id SET NOT NULL,
ALTER COLUMN created_at SET NOT NULL;

-- Comments essential fields
ALTER TABLE recipe_comments
ALTER COLUMN content SET NOT NULL,
ALTER COLUMN created_at SET NOT NULL;

-- Reviews essential fields
ALTER TABLE recipe_reviews
ALTER COLUMN rating SET NOT NULL,
ALTER COLUMN created_at SET NOT NULL;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check all constraints
SELECT 
  constraint_name,
  table_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
ORDER BY table_name, constraint_type;

-- Check all indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Verify cascading deletes
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
