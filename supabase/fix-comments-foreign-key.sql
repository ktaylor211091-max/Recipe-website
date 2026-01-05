-- Fix recipe_comments and messages foreign keys to reference profiles instead of auth.users
-- This enables proper joining with profiles table for display names

-- Fix recipe_comments
alter table public.recipe_comments
  drop constraint if exists recipe_comments_user_id_fkey;

alter table public.recipe_comments
  add constraint recipe_comments_user_id_fkey
  foreign key (user_id)
  references public.profiles(id)
  on delete cascade;

-- Fix messages
alter table public.messages
  drop constraint if exists messages_sender_id_fkey;

alter table public.messages
  add constraint messages_sender_id_fkey
  foreign key (sender_id)
  references public.profiles(id)
  on delete cascade;

alter table public.messages
  drop constraint if exists messages_recipient_id_fkey;

alter table public.messages
  add constraint messages_recipient_id_fkey
  foreign key (recipient_id)
  references public.profiles(id)
  on delete cascade;
