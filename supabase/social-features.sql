-- Social Media Features for Recipe Platform
-- Run this after user-features.sql

-- 1) Enhanced user profiles with social info
alter table public.profiles
  add column if not exists display_name text,
  add column if not exists bio text,
  add column if not exists avatar_url text,
  add column if not exists location text,
  add column if not exists website text,
  add column if not exists is_public boolean not null default true;

-- Add public read policy for profiles (needed for comments, follows, etc.)
drop policy if exists "profiles: user can read self" on public.profiles;
drop policy if exists "profiles: anyone can read public profiles" on public.profiles;

create policy "profiles: anyone can read public profiles"
on public.profiles
for select
to authenticated, anon
using (is_public = true or auth.uid() = id);

-- 2) User follows/friendships table
create table if not exists public.user_follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

alter table public.user_follows enable row level security;

-- Drop existing policies
drop policy if exists "user_follows: public read" on public.user_follows;
drop policy if exists "user_follows: user can insert" on public.user_follows;
drop policy if exists "user_follows: user can delete own" on public.user_follows;

-- Anyone can see public follows
create policy "user_follows: public read"
on public.user_follows
for select
to authenticated, anon
using (true);

-- Users can follow others
create policy "user_follows: user can insert"
on public.user_follows
for insert
to authenticated
with check (auth.uid() = follower_id);

-- Users can unfollow
create policy "user_follows: user can delete own"
on public.user_follows
for delete
to authenticated
using (auth.uid() = follower_id);

create index if not exists user_follows_follower_id_idx on public.user_follows(follower_id);
create index if not exists user_follows_following_id_idx on public.user_follows(following_id);

-- 3) Recipe comments
create table if not exists public.recipe_comments (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.recipe_comments(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.recipe_comments enable row level security;

-- Drop existing policies
drop policy if exists "recipe_comments: public read" on public.recipe_comments;
drop policy if exists "recipe_comments: user can insert" on public.recipe_comments;
drop policy if exists "recipe_comments: user can update own" on public.recipe_comments;
drop policy if exists "recipe_comments: user can delete own" on public.recipe_comments;
drop policy if exists "recipe_comments: author can delete" on public.recipe_comments;

-- Anyone can read comments on published recipes
create policy "recipe_comments: public read"
on public.recipe_comments
for select
to authenticated, anon
using (
  exists(
    select 1 from public.recipes
    where id = recipe_id and published = true
  )
);

-- Authenticated users can create comments
create policy "recipe_comments: user can insert"
on public.recipe_comments
for insert
to authenticated
with check (auth.uid() = user_id);

-- Users can update their own comments
create policy "recipe_comments: user can update own"
on public.recipe_comments
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Users can delete their own comments
create policy "recipe_comments: user can delete own"
on public.recipe_comments
for delete
to authenticated
using (auth.uid() = user_id);

-- Admins and recipe authors can delete comments
create policy "recipe_comments: author can delete"
on public.recipe_comments
for delete
to authenticated
using (
  is_admin() or exists(
    select 1 from public.recipes
    where id = recipe_id and author_id = auth.uid()
  )
);

drop trigger if exists set_recipe_comments_updated_at on public.recipe_comments;
create trigger set_recipe_comments_updated_at
before update on public.recipe_comments
for each row
execute function public.set_updated_at();

create index if not exists recipe_comments_recipe_id_idx on public.recipe_comments(recipe_id);
create index if not exists recipe_comments_user_id_idx on public.recipe_comments(user_id);
create index if not exists recipe_comments_parent_comment_id_idx on public.recipe_comments(parent_comment_id);

-- 4) Direct messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  check (sender_id != recipient_id)
);

alter table public.messages enable row level security;

-- Drop existing policies
drop policy if exists "messages: user can read own" on public.messages;
drop policy if exists "messages: user can insert" on public.messages;
drop policy if exists "messages: recipient can update" on public.messages;
drop policy if exists "messages: user can delete own" on public.messages;

-- Users can read messages they sent or received
create policy "messages: user can read own"
on public.messages
for select
to authenticated
using (auth.uid() = sender_id or auth.uid() = recipient_id);

-- Users can send messages
create policy "messages: user can insert"
on public.messages
for insert
to authenticated
with check (auth.uid() = sender_id);

-- Users can update messages they received (mark as read)
create policy "messages: recipient can update"
on public.messages
for update
to authenticated
using (auth.uid() = recipient_id)
with check (auth.uid() = recipient_id);

-- Users can delete messages they sent or received
create policy "messages: user can delete own"
on public.messages
for delete
to authenticated
using (auth.uid() = sender_id or auth.uid() = recipient_id);

create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists messages_recipient_id_idx on public.messages(recipient_id);
create index if not exists messages_created_at_idx on public.messages(created_at desc);

-- 5) Recipe variations/forks
create table if not exists public.recipe_forks (
  id uuid primary key default gen_random_uuid(),
  original_recipe_id uuid not null references public.recipes(id) on delete cascade,
  forked_recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(forked_recipe_id)
);

alter table public.recipe_forks enable row level security;

-- Drop existing policies
drop policy if exists "recipe_forks: public read" on public.recipe_forks;
drop policy if exists "recipe_forks: user can insert" on public.recipe_forks;

create policy "recipe_forks: public read"
on public.recipe_forks
for select
to authenticated, anon
using (true);

create policy "recipe_forks: user can insert"
on public.recipe_forks
for insert
to authenticated
with check (
  exists(
    select 1 from public.recipes
    where id = forked_recipe_id and author_id = auth.uid()
  )
);

create index if not exists recipe_forks_original_idx on public.recipe_forks(original_recipe_id);
create index if not exists recipe_forks_forked_idx on public.recipe_forks(forked_recipe_id);

-- 6) Activity feed
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type in ('recipe_created', 'recipe_forked', 'recipe_favorited', 'user_followed', 'comment_posted')),
  recipe_id uuid references public.recipes(id) on delete cascade,
  target_user_id uuid references auth.users(id) on delete cascade,
  metadata jsonb,
  created_at timestamptz not null default now()
);

alter table public.activities enable row level security;

-- Drop existing policies
drop policy if exists "activities: user can read feed" on public.activities;
drop policy if exists "activities: authenticated can insert" on public.activities;

-- Users can see activities from people they follow + their own
create policy "activities: user can read feed"
on public.activities
for select
to authenticated
using (
  user_id = auth.uid() or
  exists(
    select 1 from public.user_follows
    where follower_id = auth.uid() and following_id = user_id
  )
);

-- System can insert activities
create policy "activities: authenticated can insert"
on public.activities
for insert
to authenticated
with check (auth.uid() = user_id);

create index if not exists activities_user_id_idx on public.activities(user_id);
create index if not exists activities_created_at_idx on public.activities(created_at desc);
create index if not exists activities_recipe_id_idx on public.activities(recipe_id);

-- 7) Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('follow', 'comment', 'like', 'message', 'mention')),
  from_user_id uuid references auth.users(id) on delete cascade,
  recipe_id uuid references public.recipes(id) on delete cascade,
  comment_id uuid references public.recipe_comments(id) on delete cascade,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

-- Drop existing policies
drop policy if exists "notifications: user can read own" on public.notifications;
drop policy if exists "notifications: user can update own" on public.notifications;
drop policy if exists "notifications: system can insert" on public.notifications;

create policy "notifications: user can read own"
on public.notifications
for select
to authenticated
using (auth.uid() = user_id);

create policy "notifications: user can update own"
on public.notifications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "notifications: system can insert"
on public.notifications
for insert
to authenticated
with check (true);

create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_created_at_idx on public.notifications(created_at desc);
create index if not exists notifications_is_read_idx on public.notifications(is_read);

-- 8) Recipe likes (in addition to favorites)
create table if not exists public.recipe_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, recipe_id)
);

alter table public.recipe_likes enable row level security;

-- Drop existing policies
drop policy if exists "recipe_likes: public read" on public.recipe_likes;
drop policy if exists "recipe_likes: user can insert" on public.recipe_likes;
drop policy if exists "recipe_likes: user can delete own" on public.recipe_likes;

create policy "recipe_likes: public read"
on public.recipe_likes
for select
to authenticated, anon
using (true);

create policy "recipe_likes: user can insert"
on public.recipe_likes
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "recipe_likes: user can delete own"
on public.recipe_likes
for delete
to authenticated
using (auth.uid() = user_id);

create index if not exists recipe_likes_user_id_idx on public.recipe_likes(user_id);
create index if not exists recipe_likes_recipe_id_idx on public.recipe_likes(recipe_id);

-- 9) Update recipes table to allow user-generated content
-- Remove admin-only restrictions, allow any authenticated user to create
drop policy if exists "recipes: admin insert" on public.recipes;
drop policy if exists "recipes: admin update" on public.recipes;
drop policy if exists "recipes: admin delete" on public.recipes;
drop policy if exists "recipes: user can insert own" on public.recipes;
drop policy if exists "recipes: user can update own" on public.recipes;
drop policy if exists "recipes: user can delete own" on public.recipes;
drop policy if exists "recipes: admin can do all" on public.recipes;

create policy "recipes: user can insert own"
on public.recipes
for insert
to authenticated
with check (auth.uid() = author_id);

create policy "recipes: user can update own"
on public.recipes
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy "recipes: user can delete own"
on public.recipes
for delete
to authenticated
using (auth.uid() = author_id);

-- Admins can still do everything
create policy "recipes: admin can do all"
on public.recipes
for all
to authenticated
using (is_admin())
with check (is_admin());

-- 10) Views for stats
create or replace view public.user_stats as
select
  u.id as user_id,
  count(distinct r.id) as recipe_count,
  count(distinct f.follower_id) as follower_count,
  count(distinct ff.following_id) as following_count,
  count(distinct l.id) as total_likes_received
from auth.users u
left join public.recipes r on r.author_id = u.id and r.published = true
left join public.user_follows f on f.following_id = u.id
left join public.user_follows ff on ff.follower_id = u.id
left join public.recipe_likes l on l.recipe_id in (select id from public.recipes where author_id = u.id)
group by u.id;

create or replace view public.recipe_engagement as
select
  r.id as recipe_id,
  count(distinct l.user_id) as like_count,
  count(distinct c.id) as comment_count
from public.recipes r
left join public.recipe_likes l on l.recipe_id = r.id
left join public.recipe_comments c on c.recipe_id = r.id
where r.published = true
group by r.id;
