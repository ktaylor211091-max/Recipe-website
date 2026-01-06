# Subcategories Setup

This update adds support for subcategories to help organize recipes better.

## Database Changes

Run the SQL file `supabase/subcategories.sql` in your Supabase SQL Editor to:
1. Add `parent_category_id` column to the categories table
2. Create subcategories for each main category:
   - **Breakfast**: Pancakes & Waffles, Eggs, Smoothies, Oatmeal & Cereal
   - **Lunch**: Sandwiches, Salads, Soups, Wraps & Bowls
   - **Dinner**: Pasta, Chicken, Beef, Seafood, Vegetarian, Pizza
   - **Desserts**: Cakes, Cookies, Pies & Tarts, Ice Cream, Brownies & Bars
   - **Snacks**: Dips & Spreads, Appetizers, Finger Foods, Energy Bars

## Features

- Main categories still appear in the top navigation
- When creating a recipe, you can select a specific subcategory or use the general category
- Recipes are automatically organized by their category/subcategory
- Improved recipe discovery and filtering

## To Deploy

1. Run `supabase/subcategories.sql` in Supabase SQL Editor
2. Deploy code changes: `git push origin main`
