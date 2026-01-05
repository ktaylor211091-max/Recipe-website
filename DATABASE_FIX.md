# 🔍 Complete Database Setup Verification

## Problem
- Reviews not working
- Comments not working

## Root Cause Analysis
You've run `social-features.sql`, but you might be **missing the prerequisite files**:
1. `schema.sql` - Base tables (recipes, profiles)
2. `user-features.sql` - Reviews and favorites
3. `social-features.sql` - Social platform features

## ✅ Step-by-Step Fix

### Step 1: Verify What's Deployed

Open Supabase SQL Editor and run this verification script:

```sql
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
SELECT 'recipe_comments', EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'recipe_comments');
```

**Expected Results:**
- ✅ All should show `exists = true`
- ❌ If any show `false`, that table is missing

---

### Step 2: Run Missing Migrations

Based on verification results, run these files **in order**:

#### A. Base Schema (if `recipes` or `profiles` missing)
**File:** `supabase/schema.sql`

Run this first - it creates:
- ✅ `profiles` table with `role` column
- ✅ `recipes` table
- ✅ `is_admin()` function
- ✅ Basic RLS policies

#### B. User Features (if `recipe_reviews` or `favorite_recipes` missing)
**File:** `supabase/user-features.sql`

Run this second - it creates:
- ✅ `favorite_recipes` table
- ✅ `recipe_reviews` table (THIS IS REQUIRED FOR REVIEWS!)
- ✅ Review RLS policies

#### C. Social Features (already run)
**File:** `social-features.sql`

You already ran this - it creates:
- ✅ `recipe_comments` table
- ✅ `user_follows` table
- ✅ `activities` table
- ✅ Enhanced profile columns
- ✅ Updated RLS policies

---

### Step 3: Fix Profile Reading (Critical!)

The profiles table needs to allow **public reading** for comments/reviews to work.

Check if you have this policy:
```sql
-- Check current policies
SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
```

You should see:
- ✅ `profiles: anyone can read public profiles`

If you see `profiles: user can read self` instead, that's the problem!

**Fix:** Re-run `social-features.sql` which includes:
```sql
drop policy if exists "profiles: user can read self" on public.profiles;
create policy "profiles: anyone can read public profiles"
on public.profiles
for select
to authenticated, anon
using (is_public = true or auth.uid() = id);
```

---

## 🎯 Quick Fix Commands

If tables are missing, run these in Supabase SQL Editor **in this exact order**:

### 1. Base Schema
Copy all content from: `supabase/schema.sql`
Paste and run in SQL Editor

### 2. User Features  
Copy all content from: `supabase/user-features.sql`
Paste and run in SQL Editor

### 3. Social Features (re-run to fix policies)
Copy all content from: `supabase/social-features.sql`
Paste and run in SQL Editor (safe to re-run, has `drop policy if exists`)

---

## 🧪 Test After Deployment

### Test Reviews:
1. Go to any recipe page
2. Scroll to reviews section
3. Click a star rating
4. Enter review text
5. Click "Submit Review"
6. Should see your review appear

### Test Comments:
1. Go to any recipe page
2. Scroll to comments section
3. Type a comment
4. Click "Post Comment"
5. Should see your comment appear immediately

### Common Errors:

**Error: "relation 'public.recipe_reviews' does not exist"**
- ❌ You haven't run `user-features.sql`
- ✅ Run `user-features.sql` in SQL Editor

**Error: Comment posts but doesn't show username**
- ❌ Profile reading policy is wrong
- ✅ Re-run `social-features.sql` to fix profile policy

**Error: "permission denied for table"**
- ❌ RLS policies aren't set up correctly
- ✅ Re-run the relevant SQL file

---

## 📋 Complete Migration Order

For a fresh database, run in this order:

1. **schema.sql** - Base tables and functions
2. **categories.sql** (optional) - If using categories
3. **storage.sql** (optional) - For image uploads
4. **user-features.sql** - Reviews and favorites
5. **social-features.sql** - Social platform

Each file is safe to re-run (uses `create table if not exists` and `drop policy if exists`)

---

## 🔍 Debugging Checklist

- [ ] Run verification script - check all tables exist
- [ ] Check profiles has policy: `anyone can read public profiles`
- [ ] Check recipe_reviews table exists
- [ ] Check recipe_comments table exists
- [ ] Check browser console for errors (F12)
- [ ] Verify you're signed in when testing
- [ ] Try hard refresh (Ctrl+Shift+R)

---

## 💡 Why This Happened

You ran `social-features.sql` which depends on:
- `recipe_reviews` from `user-features.sql`
- `profiles` from `schema.sql`

If those weren't run first, features break!

**Solution:** Run all prerequisite files in order.
