-- Fix RLS policies to avoid infinite recursion
-- Use security definer functions to check permissions

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can view members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can view members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can add members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can add members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can update members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can update members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can delete members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can delete members" ON public.user_stokvel_members;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.is_stokvel_owner(UUID);
DROP FUNCTION IF EXISTS public.is_stokvel_admin(UUID);
DROP FUNCTION IF EXISTS public.can_manage_stokvel_members(UUID);

-- Create helper function to check if user is stokvel owner
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

-- Create helper function to check if user is stokvel admin
-- Uses SECURITY DEFINER to bypass RLS and avoid recursion
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

-- Create combined function for managing members
CREATE OR REPLACE FUNCTION public.can_manage_stokvel_members(stokvel_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    -- Check if user is owner OR admin
    RETURN (
        -- Owner check
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_uuid
            AND owner_id = auth.uid()
        )
        OR
        -- Admin check
        EXISTS (
            SELECT 1 FROM public.user_stokvel_members
            WHERE stokvel_id = stokvel_uuid
            AND member_id = auth.uid()
            AND role = 'admin'
            AND is_active = true
        )
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_stokvel_owner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_stokvel_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_stokvel_members(UUID) TO authenticated;

-- Now create the RLS policies using the security definer functions

-- SELECT Policy 1: Users can view their own membership records
CREATE POLICY "Users can view their own memberships"
ON public.user_stokvel_members
FOR SELECT
USING (
    member_id = auth.uid()
    OR LOWER(email) = LOWER(auth.email())
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

-- Verify the policies were created
SELECT
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies
WHERE tablename = 'user_stokvel_members'
ORDER BY cmd, policyname;

-- Verify the functions were created
SELECT
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('is_stokvel_owner', 'is_stokvel_admin', 'can_manage_stokvel_members')
ORDER BY p.proname;
