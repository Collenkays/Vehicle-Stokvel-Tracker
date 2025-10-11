-- FINAL RLS FIX - Run this in Supabase SQL Editor
-- This works regardless of authentication context
-- Safe to run multiple times (idempotent)

-- ============================================
-- STEP 1: Drop ALL existing policies
-- ============================================
DO $$
BEGIN
    -- Drop all possible policy variations
    DROP POLICY IF EXISTS "Users can view their own memberships" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Members can view own record" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Stokvel owners can view members" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Owners can view all members" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Stokvel owners and admins can view members" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Owners and admins can view all members" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Stokvel owners can add members" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Owners can add members" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Stokvel owners and admins can add members" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Owners and admins can add members" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Stokvel owners can update members" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Owners can update members" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Stokvel owners and admins can update members" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Owners and admins can update members" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Stokvel owners can delete members" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Owners can delete members" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Stokvel owners and admins can delete members" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Owners and admins can delete members" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Users can view members of their stokvels" ON public.user_stokvel_members;
    DROP POLICY IF EXISTS "Stokvel owners can manage members" ON public.user_stokvel_members;

    RAISE NOTICE 'All existing policies dropped';
END $$;

-- ============================================
-- STEP 2: Ensure RLS is enabled
-- ============================================
ALTER TABLE public.user_stokvel_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: Create new simple policies
-- ============================================

-- SELECT Policy 1: Members can view their own record
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
        WHERE user_stokvels.id = user_stokvel_members.stokvel_id
        AND user_stokvels.owner_id = auth.uid()
    )
);

-- INSERT Policy: Stokvel owners can add members
CREATE POLICY "Owners can add members"
ON public.user_stokvel_members
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_stokvels
        WHERE user_stokvels.id = stokvel_id
        AND user_stokvels.owner_id = auth.uid()
    )
);

-- UPDATE Policy: Stokvel owners can update members
CREATE POLICY "Owners can update members"
ON public.user_stokvel_members
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.user_stokvels
        WHERE user_stokvels.id = stokvel_id
        AND user_stokvels.owner_id = auth.uid()
    )
);

-- DELETE Policy: Stokvel owners can delete members
CREATE POLICY "Owners can delete members"
ON public.user_stokvel_members
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.user_stokvels
        WHERE user_stokvels.id = stokvel_id
        AND user_stokvels.owner_id = auth.uid()
    )
);

-- ============================================
-- STEP 4: Verify policies were created
-- ============================================
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'user_stokvel_members';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS Policy Setup Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total policies created: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Policies created:';
    RAISE NOTICE '  - Members can view own record (SELECT)';
    RAISE NOTICE '  - Owners can view all members (SELECT)';
    RAISE NOTICE '  - Owners can add members (INSERT)';
    RAISE NOTICE '  - Owners can update members (UPDATE)';
    RAISE NOTICE '  - Owners can delete members (DELETE)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)';
    RAISE NOTICE '2. Try adding a member in your application';
    RAISE NOTICE '3. If it still fails, check if you are the stokvel owner';
    RAISE NOTICE '========================================';
END $$;

-- Display current policies for verification
SELECT
    tablename,
    policyname,
    cmd as operation
FROM pg_policies
WHERE tablename = 'user_stokvel_members'
ORDER BY cmd, policyname;
