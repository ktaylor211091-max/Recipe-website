# Category Management System - Setup Instructions

## Overview
I've implemented a complete category management system for your recipe website. Categories are now stored in the database and can be managed through the admin panel.

## What's New

### 1. Database Changes
- New `categories` table with RLS policies
- Default categories: Breakfast, Lunch, Dinner, Desserts, Snacks, General
- Recipes now use `category_id` (foreign key) instead of free-text `category`

### 2. Admin Features
- **Manage Categories** page at `/admin/categories`
- Add, edit, delete, and reorder categories
- Button in admin dashboard to access category management
- Automatic slug generation from category names

### 3. Recipe Forms
- Category dropdown (replaces text input)
- Required field - must select a category
- Works in both create and edit forms

### 4. Navigation
- Dynamic navigation menu populated from database
- Categories shown in display order
- Clicking categories scrolls to that section on homepage

## Setup Steps

### Step 1: Run SQL Migration
You need to run the SQL migration in Supabase to create the categories table:

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/categories.sql`
4. Copy the entire contents
5. Paste into SQL Editor and click **Run**

This will:
- Create the categories table
- Add default categories (Breakfast, Lunch, Dinner, Desserts, Snacks, General)
- Add `category_id` column to recipes table
- Migrate existing recipes to use the new system
- Set up Row Level Security policies

### Step 2: Test Locally (Optional but Recommended)
```powershell
npm run dev
```

1. Visit http://localhost:3000/admin
2. Sign in with your admin account
3. Go to **Manage Categories** 
4. Test adding/editing/deleting categories
5. Create a new recipe and verify the category dropdown works
6. Check that navigation updates automatically

### Step 3: Deploy
Once the SQL migration is complete and you've tested:

```powershell
git add .
git commit -m "Add database-driven category management system"
git push
```

## Features

### Category Management Page
- **Add Category**: Create new categories with custom names
- **Edit Category**: Update name and display order
- **Delete Category**: Remove categories (blocked if recipes exist)
- **Display Order**: Control the order categories appear in navigation and on pages

### Benefits
- ✅ Consistent category names (no more typos or variations)
- ✅ Easy to add new categories without code changes
- ✅ Reorder categories by display order
- ✅ Dropdown prevents invalid categories
- ✅ Can rename categories and all recipes update automatically
- ✅ Dynamic navigation - always in sync with database

### Important Notes
- **Cannot delete categories with recipes**: You must reassign or delete those recipes first
- **General category**: Default fallback category (don't delete)
- **Slugs**: Auto-generated from category names (used in URLs like `/#breakfast`)
- **Display order**: Lower numbers appear first in navigation

## Files Modified
- `supabase/categories.sql` - Database migration
- `src/app/admin/categories/actions.ts` - Server actions for category CRUD
- `src/app/admin/categories/CategoriesClient.tsx` - Category management UI
- `src/app/admin/categories/page.tsx` - Category management page
- `src/app/admin/actions.ts` - Updated recipe actions to use category_id
- `src/app/admin/dashboard/page.tsx` - Added category dropdown, "Manage Categories" button
- `src/app/admin/dashboard/edit/[id]/page.tsx` - Category dropdown in edit form
- `src/app/layout.tsx` - Dynamic navigation from database
- `src/app/page.tsx` - Fetch and pass categories to components
- `src/app/RecipeListClient.tsx` - Use database categories for grouping

## Troubleshooting

### Migration Errors
If the SQL migration fails:
- Check if you already have a `categories` table
- Verify all existing recipes have valid category values
- Check Supabase logs for specific error messages

### Recipe Form Errors
If creating recipes fails:
- Ensure SQL migration completed successfully
- Check that categories exist in the database
- Verify category dropdown has options

### Navigation Not Showing
- Confirm categories exist in database
- Check browser console for errors
- Verify `getCategories()` function returns data

## Next Steps
After deploying, you can:
1. Add more categories as needed through admin panel
2. Reorganize category display order
3. Rename categories (all recipes update automatically)
4. Remove unused categories

The system is now fully dynamic and doesn't require code changes to manage categories!
