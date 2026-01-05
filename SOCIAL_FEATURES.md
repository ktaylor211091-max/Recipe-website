# Social Cooking Platform - Setup Guide

This recipe website has been transformed into a full-featured social cooking platform with user-generated content, following, comments, and activity feeds.

## 🚀 Social Features

### User Profiles
- Custom display names, bios, locations, and website links
- User avatars (auto-generated from initials)
- Recipe counts, follower counts, and following counts
- Public profile pages showing user's recipes

### Recipe Creation
- **Any authenticated user can create recipes** (not just admins)
- Full recipe editor with:
  - Title, category, description
  - Prep time, cook time, servings
  - Ingredients list with quantities
  - Step-by-step instructions
  - Nutritional information
  - Recipe tags
  - Image upload
  - Draft/published toggle
  - Chef's notes and tips

### Social Interactions
- **Follow System**: Follow other cooks to see their activities
- **Comments**: Comment on recipes with nested replies
- **Reviews**: 5-star ratings with written reviews
- **Favorites**: Save recipes to your favorites
- **Activity Feed**: See what your network is cooking
- **Profile Pages**: View other users' recipes and stats

### Activity Feed
Tracks and displays:
- Recipe creation
- Recipe likes
- Recipe favorites
- Comments on recipes
- Recipe reviews
- User follows

## 📦 Database Setup

### Required SQL Migrations

You need to run these SQL files in your Supabase SQL Editor in this order:

1. **supabase/schema.sql** - Base schema (if not already done)
2. **supabase/user-features.sql** - Favorites and reviews
3. **supabase/social-features.sql** - NEW: Social platform features

### What's in social-features.sql

#### Tables Created:
- `profiles` (enhanced) - Added display_name, bio, avatar_url, location, website
- `user_follows` - Follow relationships between users
- `recipe_comments` - Comments and replies on recipes
- `messages` - Direct messaging (UI coming soon)
- `recipe_forks` - Recipe variations (UI coming soon)
- `activities` - Activity feed tracking
- `notifications` - User notifications (UI coming soon)
- `recipe_likes` - Quick likes on recipes

#### Views:
- `user_stats` - Aggregated user statistics
- `recipe_engagement` - Recipe engagement metrics

#### Key Changes:
- **Removed admin-only recipe creation restriction**
- Any authenticated user can now create recipes
- RLS policies updated to allow user-generated content

## 🎯 How to Use

### For Users

1. **Create an Account**
   - Sign up at `/signup`
   - Your profile is automatically created

2. **Create Your First Recipe**
   - Click "Create Recipe" in the navigation
   - Fill out the recipe details
   - Upload an image (optional)
   - Publish or save as draft

3. **Discover & Connect**
   - Browse recipes on the home page
   - Visit other users' profiles
   - Follow cooks you like
   - Comment on and review recipes

4. **Stay Updated**
   - Check the Activity Feed to see what your network is cooking
   - View your profile to see your stats
   - Manage your account and favorites

### For Admins

Admins retain special privileges:
- Access to `/admin/dashboard`
- Can manage categories
- Can edit/delete any recipe
- All regular user features plus admin controls

## 🛣️ Routes

### Public Routes
- `/` - Home page with all recipes
- `/recipes/[slug]` - Recipe detail page
- `/login` - Sign in
- `/signup` - Create account

### Protected Routes (Require Authentication)
- `/account` - User account settings
- `/profile/[id]` - User public profile
- `/create-recipe` - Create new recipe
- `/activity` - Activity feed

### Admin Routes
- `/admin/dashboard` - Admin dashboard
- `/admin/categories` - Manage categories

## 🎨 Design System

### Color Scheme
- **Primary (Emerald)**: Social features, CTAs, recipe creation
- **Neutral**: Base UI, text, borders
- **Blue**: Followers stats
- **Purple**: Following stats

### Components
- Emerald gradients for user avatars
- Hover effects and animations on cards
- Consistent spacing and shadows
- Responsive grid layouts

## 🔧 Technical Details

### Authentication
- Supabase Auth with Row Level Security
- Server-side user sessions
- Protected routes with redirects

### Data Flow
1. **Server Components**: Fetch initial data (recipes, profiles, stats)
2. **Client Components**: Interactive features (follow, comment, like)
3. **Server Actions**: Form submissions (create recipe)
4. **API Routes**: CRUD operations (reviews, favorites)

### File Structure
```
src/app/
├── account/page.tsx          # User account page
├── activity/page.tsx         # Activity feed
├── create-recipe/
│   ├── page.tsx             # Recipe creation form
│   └── actions.ts           # Recipe creation logic
├── profile/[id]/
│   ├── page.tsx             # User profile page
│   └── FollowButton.tsx     # Follow/unfollow button
└── recipes/[slug]/
    ├── page.tsx             # Recipe detail
    ├── RecipeComments.tsx   # Comments section
    ├── RecipeReviews.tsx    # Reviews section
    └── ...other components
```

## 📊 Database Schema Highlights

### Profiles Table
```sql
- id (uuid, FK to auth.users)
- display_name (text)
- bio (text)
- avatar_url (text)
- location (text)
- website (text)
- role (text: 'user' or 'admin')
```

### User Follows Table
```sql
- follower_id (uuid, FK to profiles)
- following_id (uuid, FK to profiles)
- Unique constraint on (follower_id, following_id)
```

### Recipe Comments Table
```sql
- recipe_id (uuid, FK to recipes)
- user_id (uuid, FK to profiles)
- content (text)
- parent_comment_id (uuid, nullable, FK to recipe_comments)
```

### Activities Table
```sql
- user_id (uuid, FK to profiles)
- activity_type (text: 'recipe_created', 'recipe_liked', etc.)
- recipe_id (uuid, nullable)
- target_user_id (uuid, nullable)
- comment_id (uuid, nullable)
```

## 🚨 Important Notes

### Before Deploying
1. **Run the database migrations** in Supabase
2. Ensure environment variables are set
3. Test recipe creation as a regular user
4. Verify RLS policies are working

### Storage Setup
Make sure your Supabase storage bucket `recipe-images` has:
- Public read access
- Authenticated write access
- Appropriate file size limits

### Performance Considerations
- Activity feed limited to 50 recent items
- Comments fetched with recipe to avoid extra queries
- Profile stats calculated on page load
- Consider adding pagination for large datasets

## 🎉 What's Next

Future enhancements to consider:
- Direct messaging UI
- Real-time notifications
- Recipe forking interface
- Search for users
- Trending recipes
- Collections/cookbooks
- Shopping list sharing
- Meal planning
- Recipe difficulty ratings

## 🐛 Troubleshooting

### "Cannot create recipe"
- Check that social-features.sql has been run
- Verify user is authenticated
- Check browser console for errors

### "Comments not showing"
- Ensure recipe_comments table exists
- Check RLS policies allow reading comments
- Verify user_id matches authenticated user

### "Follow button not working"
- Check user_follows table exists
- Verify RLS policies for user_follows
- Check browser network tab for errors

## 📝 License

This project is for educational purposes. Customize as needed!
