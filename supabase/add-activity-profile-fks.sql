-- Add foreign key constraints to activities for profile data
-- This allows us to safely join activities with profiles to show display names

-- Drop existing policies temporarily
drop policy if exists "activities: user can read feed" on public.activities;
drop policy if exists "activities: authenticated can insert" on public.activities;

-- Add foreign key constraints
alter table public.activities
  add constraint activities_user_profile_fk
  foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.activities
  add constraint activities_target_profile_fk
  foreign key (target_user_id) references public.profiles(id) on delete cascade;

-- Recreate RLS policies
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

create policy "activities: authenticated can insert"
on public.activities
for insert
to authenticated
with check (auth.uid() = user_id);
