-- FINAL RLS FIX for user_stokvel_members
-- This removes duplicates and creates proper policies for multi-stokvel architecture

-- ============================================================================
-- STEP 1: Drop ALL existing policies on user_stokvel_members
-- ============================================================================
DROP POLICY IF EXISTS "members_select_policy" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "members_insert_policy" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "members_update_policy" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "members_delete_policy" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can insert members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can update members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can delete members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Users can view members of their stokvels" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can manage members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can insert members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can update members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can delete members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Users can view stokvel members" ON public.user_stokvel_members;

-- ============================================================================
-- STEP 2: Drop and recreate helper functions with correct logic
-- ============================================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS public.is_stokvel_owner(UUID);
DROP FUNCTION IF EXISTS public.is_stokvel_member(UUID);
DROP FUNCTION IF EXISTS public.is_stokvel_admin(UUID);

-- Create function: Check if user is the stokvel owner
CREATE OR REPLACE FUNCTION public.is_stokvel_owner(stokvel_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check user_stokvels table (multi-stokvel architecture)
  RETURN EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE id = stokvel_uuid AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create function: Check if user is a member of the stokvel
CREATE OR REPLACE FUNCTION public.is_stokvel_member(stokvel_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check user_stokvel_members table (multi-stokvel architecture)
  RETURN EXISTS (
    SELECT 1 FROM public.user_stokvel_members
    WHERE stokvel_id = stokvel_uuid
      AND member_id = auth.uid()
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create function: Check if user is an admin of the stokvel
CREATE OR REPLACE FUNCTION public.is_stokvel_admin(stokvel_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check user_stokvel_members table for admin role
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
-- STEP 3: Create clean, non-duplicate policies
-- ============================================================================

-- SELECT: View members if you're owner, admin, or member
CREATE POLICY "user_stokvel_members_select_policy" ON public.user_stokvel_members
    FOR SELECT
    USING (
        is_stokvel_owner(stokvel_id) OR
        is_stokvel_admin(stokvel_id) OR
        is_stokvel_member(stokvel_id)
    );

-- INSERT: Add members if you're owner or admin
CREATE POLICY "user_stokvel_members_insert_policy" ON public.user_stokvel_members
    FOR INSERT
    WITH CHECK (
        is_stokvel_owner(stokvel_id) OR
        is_stokvel_admin(stokvel_id)
    );

-- UPDATE: Update members if you're owner or admin
CREATE POLICY "user_stokvel_members_update_policy" ON public.user_stokvel_members
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
CREATE POLICY "user_stokvel_members_delete_policy" ON public.user_stokvel_members
    FOR DELETE
    USING (
        is_stokvel_owner(stokvel_id) OR
        is_stokvel_admin(stokvel_id)
    );

-- ============================================================================
-- STEP 4: Verify the policies
-- ============================================================================
SELECT
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies
WHERE tablename = 'user_stokvel_members'
ORDER BY cmd, policyname;

-- ============================================================================
-- STEP 5: Test the helper functions (replace with actual IDs from your app)
-- ============================================================================
-- Test with a real stokvel_id from your database
-- SELECT
--     'YOUR_STOKVEL_ID_HERE'::uuid as stokvel_id,
--     is_stokvel_owner('YOUR_STOKVEL_ID_HERE'::uuid) as am_i_owner,
--     is_stokvel_admin('YOUR_STOKVEL_ID_HERE'::uuid) as am_i_admin,
--     is_stokvel_member('YOUR_STOKVEL_ID_HERE'::uuid) as am_i_member,
--     auth.uid() as my_user_id;
