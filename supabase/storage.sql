-- Run AFTER you create a Storage bucket named: recipe-images
-- In Supabase Dashboard: Storage → Buckets → New bucket → name "recipe-images"
-- You can leave it PRIVATE; we will use signed URLs later if needed.

-- Restrict uploads to admins.
-- NOTE: storage policies apply to storage.objects.

create policy if not exists "recipe-images: admin upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'recipe-images'
  and public.is_admin()
);

create policy if not exists "recipe-images: admin update"
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

create policy if not exists "recipe-images: admin delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'recipe-images'
  and public.is_admin()
);

-- Public can read recipe images ONLY if you make the bucket public.
-- If the bucket is private, you can remove this policy and use signed URLs.
create policy if not exists "recipe-images: public read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'recipe-images');
