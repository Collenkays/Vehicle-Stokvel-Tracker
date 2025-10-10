-- Fix RLS using SECURITY DEFINER function to bypass recursion
-- This approach uses a function that runs with elevated privileges

-- First, simplify the RLS policies to be non-recursive
DROP POLICY IF EXISTS "Users can view their own stokvels" ON public.user_stokvels;
DROP POLICY IF EXISTS "Members can view stokvels they belong to" ON public.user_stokvels;
DROP POLICY IF EXISTS "Users can view members of their stokvels" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can view members" ON public.user_stokvel_members;

-- Create the simplest possible policy for user_stokvel_members
-- Just allow users to see records that match their ID or email
CREATE POLICY "Users can view their own memberships" ON public.user_stokvel_members
    FOR SELECT USING (
        member_id = auth.uid()
        OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Allow stokvel owners to see members without any subqueries
CREATE POLICY "Stokvel owners can view members" ON public.user_stokvel_members
    FOR SELECT USING (
        stokvel_id IN (
            SELECT id FROM public.user_stokvels WHERE owner_id = auth.uid()
        )
    );

-- For user_stokvels, use separate policies for owners and members
-- Owner policy (simple, no recursion)
CREATE POLICY "Users can view their own stokvels" ON public.user_stokvels
    FOR SELECT USING (
        owner_id = auth.uid()
    );

-- Member policy - this is the tricky one
-- We'll use a helper function to check membership
CREATE OR REPLACE FUNCTION public.is_stokvel_member(stokvel_uuid UUID, user_uuid UUID, user_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_stokvel_members
        WHERE stokvel_id = stokvel_uuid
        AND is_active = true
        AND (
            member_id = user_uuid
            OR LOWER(email) = LOWER(user_email)
        )
    );
$$;

-- Now create the member viewing policy using the function
CREATE POLICY "Members can view stokvels they belong to" ON public.user_stokvels
    FOR SELECT USING (
        public.is_stokvel_member(
            id,
            auth.uid(),
            (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- Update contributions and payouts policies to use the same pattern
DROP POLICY IF EXISTS "Users can view contributions of their stokvels" ON public.stokvel_contributions;
DROP POLICY IF EXISTS "Users can view payouts of their stokvels" ON public.stokvel_payouts;

CREATE POLICY "Users can view contributions of their stokvels" ON public.stokvel_contributions
    FOR SELECT USING (
        -- Owner of stokvel
        stokvel_id IN (SELECT id FROM public.user_stokvels WHERE owner_id = auth.uid())
        OR
        -- Member of stokvel (using helper function)
        public.is_stokvel_member(
            stokvel_id,
            auth.uid(),
            (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can view payouts of their stokvels" ON public.stokvel_payouts
    FOR SELECT USING (
        -- Owner of stokvel
        stokvel_id IN (SELECT id FROM public.user_stokvels WHERE owner_id = auth.uid())
        OR
        -- Member of stokvel (using helper function)
        public.is_stokvel_member(
            stokvel_id,
            auth.uid(),
            (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_stokvel_member TO authenticated;

-- Verify everything is set up
SELECT
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_stokvels', 'user_stokvel_members', 'stokvel_contributions', 'stokvel_payouts')
AND cmd = 'SELECT'
ORDER BY tablename, policyname;

-- Test the function
SELECT public.is_stokvel_member(
    (SELECT id FROM public.user_stokvels LIMIT 1),
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid())
) as is_member;
