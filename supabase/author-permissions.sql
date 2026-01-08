-- Add policies to allow recipe authors to edit and delete their own recipes
-- Run this in Supabase SQL Editor

-- Allow authors to update their own recipes
create policy "recipes: author update own"
on public.recipes
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

-- Allow authors to delete their own recipes
create policy "recipes: author delete own"
on public.recipes
for delete
to authenticated
using (author_id = auth.uid());
