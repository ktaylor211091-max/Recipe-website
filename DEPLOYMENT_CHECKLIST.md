# 🚀 Deployment & Testing Checklist

## Step 1: Deploy Database Schema ✅

### In Supabase Dashboard:

1. **Open SQL Editor**: https://supabase.com/dashboard/project/hojzqqefgvvaztkcsiys/sql/new

2. **Copy the entire SQL file**: `supabase/social-features.sql`

3. **Paste and Run** the SQL in the editor

4. **Verify Success**: Check that these tables exist in Table Editor:
   - `user_follows`
   - `recipe_comments`
   - `activities`
   - `recipe_likes`
   - `messages`
   - `recipe_forks`
   - `notifications`

5. **Check profiles table** has new columns:
   - `display_name`
   - `bio`
   - `avatar_url`
   - `location`
   - `website`

---

## Step 2: Test Social Features Locally ✅

### Server Running:
- ✅ Dev server is running at: http://localhost:3000

### Test Checklist:

#### A. User Recipe Creation
- [ ] Go to http://localhost:3000
- [ ] Sign in with your account
- [ ] Click "Create Recipe" in navigation
- [ ] Fill out the recipe form
- [ ] Upload an image (optional)
- [ ] Click "Create Recipe"
- [ ] Verify redirect to new recipe page

#### B. User Profiles
- [ ] Click "Profile" in navigation
- [ ] Verify profile page shows your info
- [ ] Check recipe count, follower count, following count
- [ ] Verify "Edit Profile" button appears (for own profile)

#### C. Follow System
- [ ] Create a second test account (or use existing)
- [ ] Visit another user's profile: http://localhost:3000/profile/[USER_ID]
- [ ] Click "Follow" button
- [ ] Verify button changes to "Following"
- [ ] Check follower count increases

#### D. Comments System
- [ ] Go to any recipe page
- [ ] Scroll to comments section
- [ ] Post a comment
- [ ] Try replying to a comment
- [ ] Edit/delete your own comments

#### E. Activity Feed
- [ ] Click "Activity" in navigation
- [ ] Verify you see activities from people you follow
- [ ] Create a recipe and check if it appears
- [ ] Follow someone and check if it appears

#### F. Reviews (Already Working)
- [ ] Go to any recipe page
- [ ] Scroll to reviews section
- [ ] Leave a 5-star review with text
- [ ] Verify review appears

---

## Step 3: Deploy to Vercel 🚀

### Before Deploying:
- [ ] All tests above pass
- [ ] Database schema is deployed
- [ ] No console errors

### Deployment Commands:

```bash
# Check git status
git status

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Add social cooking platform: user recipes, profiles, follows, comments, activity feed"

# Push to GitHub
git push origin main
```

### After Push:
- Vercel will automatically deploy
- Check deployment at: https://recipe-website-alpha-flax.vercel.app
- Verify all social features work in production

---

## Common Issues & Solutions

### Issue: "Cannot create recipe"
**Solution**: 
- Ensure `social-features.sql` has been run in Supabase
- Check browser console for specific error
- Verify you're signed in

### Issue: "Comments not showing"
**Solution**:
- Run `social-features.sql` if not already done
- Check Table Editor for `recipe_comments` table
- Verify RLS policies allow reading comments

### Issue: "Follow button doesn't work"
**Solution**:
- Ensure `user_follows` table exists
- Check RLS policies in Supabase
- Can't follow yourself (check if viewing own profile)

### Issue: "Activity feed is empty"
**Solution**:
- You need to follow at least one user first
- Create some activities (post recipe, follow someone)
- Check `activities` table has data

### Issue: "Profile page 404"
**Solution**:
- Ensure URL format is: `/profile/[UUID]`
- User ID must be a valid UUID from `auth.users`
- Check user exists in database

---

## Optional Features (If You Want Them)

### Direct Messaging UI
- Database already supports it (`messages` table)
- Would need to create:
  - `/messages` page with inbox
  - Real-time subscriptions for new messages
  - Message composer component

### Recipe Forks/Variations
- Database already supports it (`recipe_forks` table)
- Would need to create:
  - "Fork Recipe" button on recipe pages
  - Shows original recipe and variations
  - Tracks fork relationships

Want me to implement these? Just ask!

---

## Success Criteria ✨

You'll know everything works when:
- ✅ Any user can create and publish recipes
- ✅ Users can follow each other
- ✅ Comments appear on recipe pages with replies
- ✅ Activity feed shows network activities
- ✅ Profile pages display correctly
- ✅ All stats update in real-time

---

## Next Steps After Testing

1. **Invite Beta Users**: Share the link with friends
2. **Create Sample Content**: Post some recipes to seed the platform
3. **Monitor Activity**: Check which features users engage with most
4. **Gather Feedback**: Ask users what they'd like to see next
5. **Iterate**: Add more features based on usage

Happy cooking! 🍳👨‍🍳👩‍🍳
