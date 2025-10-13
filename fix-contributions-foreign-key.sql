-- Fix stokvel_contributions foreign key constraint
-- The constraint is currently pointing to auth.users but should point to user_stokvel_members

-- Step 1: Drop the incorrect foreign key constraint
ALTER TABLE public.stokvel_contributions
DROP CONSTRAINT IF EXISTS stokvel_contributions_member_id_fkey;

-- Step 2: Add the correct foreign key constraint
ALTER TABLE public.stokvel_contributions
ADD CONSTRAINT stokvel_contributions_member_id_fkey
FOREIGN KEY (member_id)
REFERENCES public.user_stokvel_members(id)
ON DELETE CASCADE;

-- Verification query - run this to confirm the fix worked
-- SELECT
--   tc.constraint_name,
--   tc.table_name,
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
--   AND tc.table_schema = kcu.table_schema
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
--   AND ccu.table_schema = tc.table_schema
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_name='stokvel_contributions'
--   AND kcu.column_name='member_id';
