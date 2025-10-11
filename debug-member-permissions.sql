-- DEBUG: Check member addition permissions
-- Run this in Supabase SQL Editor while logged in as the user having issues

-- ============================================
-- STEP 1: Check current user context
-- ============================================
SELECT
    'Current User ID' as check_type,
    auth.uid() as value,
    'This is your authenticated user ID' as description
UNION ALL
SELECT
    'Current User Email' as check_type,
    auth.email() as value,
    'This is your authenticated email' as description
UNION ALL
SELECT
    'Current User Role' as check_type,
    auth.role()::text as value,
    'Should be "authenticated"' as description;

-- ============================================
-- STEP 2: Check if user owns any stokvels
-- ============================================
SELECT
    'User Owned Stokvels' as check_type,
    id::text as stokvel_id,
    name as stokvel_name,
    'You are the owner' as status
FROM public.user_stokvels
WHERE owner_id = auth.uid();

-- ============================================
-- STEP 3: Check if user is admin of any stokvels
-- ============================================
SELECT
    'User Admin Memberships' as check_type,
    usm.stokvel_id::text,
    us.name as stokvel_name,
    usm.role as user_role,
    CASE WHEN usm.is_active THEN 'Active' ELSE 'Inactive' END as status
FROM public.user_stokvel_members usm
JOIN public.user_stokvels us ON us.id = usm.stokvel_id
WHERE usm.member_id = auth.uid()
AND usm.role = 'admin';

-- ============================================
-- STEP 4: Test helper functions
-- ============================================
-- Replace 'YOUR_STOKVEL_ID_HERE' with the actual stokvel ID you're trying to add members to
DO $$
DECLARE
    test_stokvel_id UUID := 'YOUR_STOKVEL_ID_HERE'; -- REPLACE THIS
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Testing helper functions for stokvel: %', test_stokvel_id;
    RAISE NOTICE '========================================';

    -- Test is_stokvel_owner
    IF public.is_stokvel_owner(test_stokvel_id) THEN
        RAISE NOTICE '✓ is_stokvel_owner: TRUE - You are the owner';
    ELSE
        RAISE NOTICE '✗ is_stokvel_owner: FALSE - You are NOT the owner';
    END IF;

    -- Test is_stokvel_admin
    IF public.is_stokvel_admin(test_stokvel_id) THEN
        RAISE NOTICE '✓ is_stokvel_admin: TRUE - You are an admin';
    ELSE
        RAISE NOTICE '✗ is_stokvel_admin: FALSE - You are NOT an admin';
    END IF;

    -- Test can_manage_stokvel_members
    IF public.can_manage_stokvel_members(test_stokvel_id) THEN
        RAISE NOTICE '✓ can_manage_stokvel_members: TRUE - You CAN add members';
    ELSE
        RAISE NOTICE '✗ can_manage_stokvel_members: FALSE - You CANNOT add members';
        RAISE NOTICE '  Reason: You are neither the owner nor an admin of this stokvel';
    END IF;
END $$;

-- ============================================
-- STEP 5: Check existing RLS policies
-- ============================================
SELECT
    'Current RLS Policies' as info,
    policyname as policy_name,
    cmd as operation,
    CASE
        WHEN qual IS NOT NULL THEN 'Has USING clause'
        ELSE 'No USING clause'
    END as using_status,
    CASE
        WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
        ELSE 'No WITH CHECK'
    END as with_check_status
FROM pg_policies
WHERE tablename = 'user_stokvel_members'
ORDER BY cmd, policyname;

-- ============================================
-- STEP 6: Check if functions exist and are accessible
-- ============================================
SELECT
    'Helper Functions' as info,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    CASE
        WHEN p.prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_type,
    CASE
        WHEN pg_catalog.has_function_privilege(auth.uid(), p.oid, 'EXECUTE')
        THEN '✓ Can Execute'
        ELSE '✗ Cannot Execute'
    END as execute_permission
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('is_stokvel_owner', 'is_stokvel_admin', 'can_manage_stokvel_members')
ORDER BY p.proname;

-- ============================================
-- STEP 7: Simulate INSERT permission check
-- ============================================
-- Replace 'YOUR_STOKVEL_ID_HERE' with the actual stokvel ID
SELECT
    'INSERT Permission Check' as test_type,
    CASE
        WHEN public.can_manage_stokvel_members('YOUR_STOKVEL_ID_HERE') THEN
            '✓ PASS - You can add members to this stokvel'
        ELSE
            '✗ FAIL - You cannot add members (not owner or admin)'
    END as result;
