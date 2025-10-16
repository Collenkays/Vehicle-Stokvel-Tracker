-- Clean up ALL duplicate policies and create fresh ones
-- This removes conflicting policies that may be causing issues

-- ============================================================================
-- STEP 1: Drop ALL existing policies for user_stokvel_members
-- ============================================================================
DROP POLICY IF EXISTS "Users can view members of their stokvels" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can manage members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can insert members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can update members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can delete members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can insert members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can update members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can delete members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Users can view stokvel members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "members_select_policy" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "members_insert_policy" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "members_update_policy" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "members_delete_policy" ON public.user_stokvel_members;

-- ============================================================================
-- STEP 2: Create helper functions for cleaner policies
-- ============================================================================

-- Check if user is the stokvel owner
CREATE OR REPLACE FUNCTION public.is_stokvel_owner(stokvel_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE id = stokvel_uuid AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is a member of the stokvel
CREATE OR REPLACE FUNCTION public.is_stokvel_member(stokvel_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_stokvel_members
    WHERE stokvel_id = stokvel_uuid
      AND member_id = auth.uid()
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is an admin of the stokvel
CREATE OR REPLACE FUNCTION public.is_stokvel_admin(stokvel_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_stokvel_members
    WHERE stokvel_id = stokvel_uuid
      AND member_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- STEP 3: Create clean, simple policies using helper functions
-- ============================================================================

-- SELECT: View members if you're owner, admin, or member
CREATE POLICY "members_select_policy" ON public.user_stokvel_members
    FOR SELECT
    USING (
        is_stokvel_owner(stokvel_id) OR
        is_stokvel_admin(stokvel_id) OR
        is_stokvel_member(stokvel_id)
    );

-- INSERT: Add members if you're owner or admin
CREATE POLICY "members_insert_policy" ON public.user_stokvel_members
    FOR INSERT
    WITH CHECK (
        is_stokvel_owner(stokvel_id) OR
        is_stokvel_admin(stokvel_id)
    );

-- UPDATE: Update members if you're owner or admin
CREATE POLICY "members_update_policy" ON public.user_stokvel_members
    FOR UPDATE
    USING (
        is_stokvel_owner(stokvel_id) OR
        is_stokvel_admin(stokvel_id)
    )
    WITH CHECK (
        is_stokvel_owner(stokvel_id) OR
        is_stokvel_admin(stokvel_id)
    );

-- DELETE: Delete members if you're owner or admin
CREATE POLICY "members_delete_policy" ON public.user_stokvel_members
    FOR DELETE
    USING (
        is_stokvel_owner(stokvel_id) OR
        is_stokvel_admin(stokvel_id)
    );

-- ============================================================================
-- STEP 4: Verify the policies
-- ============================================================================
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'user_stokvel_members'
ORDER BY cmd, policyname;

-- ============================================================================
-- STEP 5: Test authentication (run this in your app's context, not SQL editor)
-- The SQL editor doesn't have user session context
-- ============================================================================
-- This will show NULL in SQL editor but should show your user_id in the app:
SELECT
    auth.uid() as your_user_id,
    auth.role() as your_role;
