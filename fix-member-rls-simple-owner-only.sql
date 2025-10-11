-- SIMPLE FIX: Allow ONLY stokvel owners to manage members
-- This removes the admin check that might be causing recursion issues
-- Admins can be added later once we verify this works

-- ============================================
-- STEP 1: Drop ALL existing policies
-- ============================================
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can view members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can view members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Owners and admins can view all members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can add members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can add members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can update members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can update members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Owners and admins can update members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can delete members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can delete members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Owners and admins can delete members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Users can view members of their stokvels" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can manage members" ON public.user_stokvel_members;

-- ============================================
-- STEP 2: Create SIMPLE policies (owner-only)
-- ============================================

-- SELECT Policy 1: Users can view their own membership records
CREATE POLICY "Members can view own record"
ON public.user_stokvel_members
FOR SELECT
USING (
    member_id = auth.uid()
);

-- SELECT Policy 2: Stokvel owners can view all members
CREATE POLICY "Owners can view all members"
ON public.user_stokvel_members
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_stokvels
        WHERE id = user_stokvel_members.stokvel_id
        AND owner_id = auth.uid()
    )
);

-- INSERT Policy: ONLY stokvel owners can add members
CREATE POLICY "Owners can add members"
ON public.user_stokvel_members
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_stokvels
        WHERE id = stokvel_id
        AND owner_id = auth.uid()
    )
);

-- UPDATE Policy: ONLY stokvel owners can update members
CREATE POLICY "Owners can update members"
ON public.user_stokvel_members
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.user_stokvels
        WHERE id = stokvel_id
        AND owner_id = auth.uid()
    )
);

-- DELETE Policy: ONLY stokvel owners can delete members
CREATE POLICY "Owners can delete members"
ON public.user_stokvel_members
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.user_stokvels
        WHERE id = stokvel_id
        AND owner_id = auth.uid()
    )
);

-- ============================================
-- STEP 3: Verify the policies
-- ============================================
SELECT
    'Policy Verification' as info,
    policyname,
    cmd as operation,
    CASE
        WHEN qual IS NOT NULL THEN '✓ USING defined'
        ELSE '✗ No USING'
    END as using_clause,
    CASE
        WHEN with_check IS NOT NULL THEN '✓ WITH CHECK defined'
        ELSE '✗ No WITH CHECK'
    END as with_check_clause
FROM pg_policies
WHERE tablename = 'user_stokvel_members'
ORDER BY cmd, policyname;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Simple RLS policies created successfully!';
    RAISE NOTICE 'ONLY stokvel owners can manage members.';
    RAISE NOTICE 'Admin permissions removed to avoid recursion.';
    RAISE NOTICE '========================================';
END $$;
