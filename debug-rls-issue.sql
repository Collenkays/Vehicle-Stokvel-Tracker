-- Debug RLS policy issue for user_stokvel_members
-- This script helps identify why the INSERT is failing

-- 1. Check current user authentication
SELECT
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- 2. Check if the stokvel exists and who owns it
-- Replace 'YOUR_STOKVEL_ID' with the actual stokvel_id from the error
SELECT
    id,
    name,
    owner_id,
    owner_id = auth.uid() as is_owner
FROM public.user_stokvels
WHERE id = 'YOUR_STOKVEL_ID';

-- 3. Check all RLS policies on user_stokvel_members
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'user_stokvel_members'
ORDER BY cmd, policyname;

-- 4. Test if the policy check would pass
-- Replace 'YOUR_STOKVEL_ID' with actual value
SELECT
    EXISTS (
        SELECT 1 FROM public.user_stokvels
        WHERE id = 'YOUR_STOKVEL_ID' AND owner_id = auth.uid()
    ) as policy_would_pass;

-- 5. Check existing members to see the pattern
SELECT
    id,
    stokvel_id,
    member_id,
    full_name,
    email,
    role,
    is_active
FROM public.user_stokvel_members
WHERE stokvel_id = 'YOUR_STOKVEL_ID'
LIMIT 5;

-- 6. Verify table permissions
SELECT
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'user_stokvel_members';
