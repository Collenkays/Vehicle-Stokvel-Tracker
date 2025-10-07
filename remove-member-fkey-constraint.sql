-- Remove foreign key constraint on member_id to allow temporary members
-- This allows adding members who don't have accounts yet

-- Drop the foreign key constraint
ALTER TABLE public.user_stokvel_members
DROP CONSTRAINT IF EXISTS user_stokvel_members_member_id_fkey;

-- The member_id will still be UUID type, but won't require it to exist in auth.users
-- This allows:
-- 1. Adding members who don't have accounts yet (using temporary UUIDs)
-- 2. Adding registered users (using their actual auth.users ID)

-- Optional: Add a check to see if member_id exists in auth.users
-- This won't block the insert, but helps track which members are registered
-- You can later query to find unregistered members

-- Add a comment to document this change
COMMENT ON COLUMN public.user_stokvel_members.member_id IS
'User ID from auth.users if registered, or temporary UUID if not registered yet';

-- Verify the constraint was removed
SELECT
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'public.user_stokvel_members'::regclass
AND conname LIKE '%member_id%';
