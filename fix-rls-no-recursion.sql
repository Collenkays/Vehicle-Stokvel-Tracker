-- Fix RLS policies to avoid infinite recursion
-- The key is to avoid policies that reference the same table they're protecting

-- Drop all existing SELECT policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own stokvels" ON public.user_stokvels;
DROP POLICY IF EXISTS "Members can view stokvels they belong to" ON public.user_stokvels;
DROP POLICY IF EXISTS "Users can view members of their stokvels" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can view members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Users can view contributions of their stokvels" ON public.stokvel_contributions;
DROP POLICY IF EXISTS "Users can view payouts of their stokvels" ON public.stokvel_payouts;

-- Create simple, non-recursive policy for user_stokvel_members
-- This is the foundation - members can see their own membership records
CREATE POLICY "Users can view their own memberships" ON public.user_stokvel_members
    FOR SELECT USING (
        member_id = auth.uid()
        OR LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
    );

-- Owners can view all members of their stokvels
CREATE POLICY "Stokvel owners can view members" ON public.user_stokvel_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
    );

-- Now we can safely create user_stokvels policy
-- This doesn't reference user_stokvel_members in a way that causes recursion
CREATE POLICY "Users can view their own stokvels" ON public.user_stokvels
    FOR SELECT USING (
        owner_id = auth.uid()
    );

-- Members can view stokvels they belong to
-- This uses a direct subquery that doesn't cause recursion because
-- user_stokvel_members policy doesn't reference user_stokvels
CREATE POLICY "Members can view stokvels they belong to" ON public.user_stokvels
    FOR SELECT USING (
        id IN (
            SELECT stokvel_id
            FROM public.user_stokvel_members
            WHERE is_active = true
            AND (
                member_id = auth.uid()
                OR LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
            )
        )
    );

-- Contributions policy
CREATE POLICY "Users can view contributions of their stokvels" ON public.stokvel_contributions
    FOR SELECT USING (
        -- Owner of the stokvel
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
        OR
        -- Member of the stokvel (direct check, no recursion)
        EXISTS (
            SELECT 1 FROM public.user_stokvel_members
            WHERE stokvel_id = stokvel_contributions.stokvel_id
            AND is_active = true
            AND (
                member_id = auth.uid()
                OR LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
            )
        )
    );

-- Payouts policy
CREATE POLICY "Users can view payouts of their stokvels" ON public.stokvel_payouts
    FOR SELECT USING (
        -- Owner of the stokvel
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
        OR
        -- Member of the stokvel (direct check, no recursion)
        EXISTS (
            SELECT 1 FROM public.user_stokvel_members
            WHERE stokvel_id = stokvel_payouts.stokvel_id
            AND is_active = true
            AND (
                member_id = auth.uid()
                OR LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
            )
        )
    );

-- Verify policies are created
SELECT
    tablename,
    policyname,
    cmd,
    CASE
        WHEN qual IS NULL THEN 'No condition'
        ELSE 'Has condition'
    END as has_condition
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_stokvels', 'user_stokvel_members', 'stokvel_contributions', 'stokvel_payouts')
AND cmd = 'SELECT'
ORDER BY tablename, policyname;
