-- Create missing profiles for existing auth users
-- Run this in Supabase SQL Editor

-- Insert profiles for users that don't have one yet
INSERT INTO public.profiles (id, role, is_public, display_name, created_at)
SELECT 
  au.id,
  'user' as role,
  true as is_public,
  NULL as display_name,
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Show the results
SELECT 
  p.id,
  au.email,
  p.display_name,
  p.is_public,
  p.created_at
FROM public.profiles p
JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC;
