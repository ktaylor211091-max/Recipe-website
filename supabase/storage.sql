-- Run AFTER you create a Storage bucket named: recipe-images
-- In Supabase Dashboard: Storage → Buckets → New bucket → name "recipe-images"
-- Make it PUBLIC so images have public URLs.

-- Restrict uploads to admins.
-- NOTE: storage policies apply to storage.objects.
-- Safe to re-run: drops then creates.

drop policy if exists "recipe-images: admin upload" on storage.objects;
create policy "recipe-images: admin upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'recipe-images'
  and public.is_admin()
);

drop policy if exists "recipe-images: admin update" on storage.objects;
create policy "recipe-images: admin update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'recipe-images'
  and public.is_admin()
)
with check (
  bucket_id = 'recipe-images'
  and public.is_admin()
);

drop policy if exists "recipe-images: admin delete" on storage.objects;
create policy "recipe-images: admin delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'recipe-images'
  and public.is_admin()
);

-- Public can read recipe images (bucket must be public)
drop policy if exists "recipe-images: public read" on storage.objects;
create policy "recipe-images: public read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'recipe-images');
