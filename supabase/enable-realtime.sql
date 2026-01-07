-- Enable real-time for the messages table
-- Run this in Supabase SQL Editor

-- Enable replica identity for messages table (required for real-time)
alter table public.messages replica identity full;

-- The messages table should now broadcast changes to real-time subscribers
-- No additional publication setup is needed - Supabase handles this automatically for tables with RLS

-- Verify that real-time is working by checking in Supabase Dashboard:
-- 1. Go to Database → Replication
-- 2. Make sure "supabase_realtime" publication exists
-- 3. Go to Database → Tables → messages
-- 4. Check that "Enable Realtime" is toggled on
