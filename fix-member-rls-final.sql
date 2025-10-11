-- FINAL FIX: RLS policies for user_stokvel_members with no recursion
-- This uses SECURITY DEFINER functions to bypass RLS during permission checks

-- ============================================
-- STEP 1: Clean up all existing policies
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
-- STEP 2: Drop and recreate helper functions
-- ============================================
DROP FUNCTION IF EXISTS public.is_stokvel_owner(UUID);
DROP FUNCTION IF EXISTS public.is_stokvel_admin(UUID);
DROP FUNCTION IF EXISTS public.can_manage_stokvel_members(UUID);

-- Function to check if user is the stokvel owner
-- SECURITY DEFINER bypasses RLS, avoiding recursion
CREATE OR REPLACE FUNCTION public.is_stokvel_owner(stokvel_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_stokvels
        WHERE id = stokvel_uuid
        AND owner_id = auth.uid()
    );
END;
$$;

-- Function to check if user is a stokvel admin
-- SECURITY DEFINER bypasses RLS, avoiding recursion
CREATE OR REPLACE FUNCTION public.is_stokvel_admin(stokvel_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_stokvel_members
        WHERE stokvel_id = stokvel_uuid
        AND member_id = auth.uid()
        AND role = 'admin'
        AND is_active = true
    );
END;
$$;

-- Combined function to check if user can manage members
-- Returns true if user is owner OR admin
CREATE OR REPLACE FUNCTION public.can_manage_stokvel_members(stokvel_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN public.is_stokvel_owner(stokvel_uuid)
        OR public.is_stokvel_admin(stokvel_uuid);
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.is_stokvel_owner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_stokvel_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_stokvel_members(UUID) TO authenticated;

-- ============================================
-- STEP 3: Create new RLS policies
-- ============================================

-- SELECT Policy 1: Users can view their own membership records
CREATE POLICY "Users can view their own memberships"
ON public.user_stokvel_members
FOR SELECT
USING (
    member_id = auth.uid()
    OR LOWER(email) = LOWER(COALESCE(auth.email(), ''))
);

-- SELECT Policy 2: Owners and admins can view all members
CREATE POLICY "Owners and admins can view all members"
ON public.user_stokvel_members
FOR SELECT
USING (
    public.can_manage_stokvel_members(stokvel_id)
);

-- INSERT Policy: Owners and admins can add members
CREATE POLICY "Owners and admins can add members"
ON public.user_stokvel_members
FOR INSERT
WITH CHECK (
    public.can_manage_stokvel_members(stokvel_id)
);

-- UPDATE Policy: Owners and admins can update members
CREATE POLICY "Owners and admins can update members"
ON public.user_stokvel_members
FOR UPDATE
USING (
    public.can_manage_stokvel_members(stokvel_id)
);

-- DELETE Policy: Owners and admins can delete members
CREATE POLICY "Owners and admins can delete members"
ON public.user_stokvel_members
FOR DELETE
USING (
    public.can_manage_stokvel_members(stokvel_id)
);

-- ============================================
-- STEP 4: Verify the setup
-- ============================================

-- Verify policies were created correctly
SELECT
    tablename,
    policyname,
    permissive,
    cmd,
    CASE
        WHEN qual IS NOT NULL THEN 'USING clause defined'
        ELSE 'No USING clause'
    END as using_status,
    CASE
        WHEN with_check IS NOT NULL THEN 'WITH CHECK defined'
        ELSE 'No WITH CHECK'
    END as with_check_status
FROM pg_policies
WHERE tablename = 'user_stokvel_members'
ORDER BY cmd, policyname;

-- Verify functions were created correctly
SELECT
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    CASE
        WHEN p.prosecdef THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('is_stokvel_owner', 'is_stokvel_admin', 'can_manage_stokvel_members')
ORDER BY p.proname;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'RLS policies and helper functions successfully configured!';
    RAISE NOTICE 'Users can now add members to stokvels they own or admin.';
END $$;
