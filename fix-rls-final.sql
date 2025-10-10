-- Final fix for RLS - using auth.email() instead of querying auth.users

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can view members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Members can view stokvels they belong to" ON public.user_stokvels;
DROP POLICY IF EXISTS "Users can view their own stokvels" ON public.user_stokvels;
DROP POLICY IF EXISTS "Users can view contributions of their stokvels" ON public.stokvel_contributions;
DROP POLICY IF EXISTS "Users can view payouts of their stokvels" ON public.stokvel_payouts;

-- Drop and recreate the helper function
DROP FUNCTION IF EXISTS public.is_stokvel_member(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION public.is_stokvel_member(stokvel_uuid UUID)
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
            member_id = auth.uid()
            OR LOWER(email) = LOWER(auth.email())
        )
    );
$$;

-- Recreate user_stokvel_members policies
CREATE POLICY "Users can view their own memberships" ON public.user_stokvel_members
    FOR SELECT USING (
        member_id = auth.uid()
        OR LOWER(email) = LOWER(auth.email())
    );

CREATE POLICY "Stokvel owners can view members" ON public.user_stokvel_members
    FOR SELECT USING (
        stokvel_id IN (
            SELECT id FROM public.user_stokvels WHERE owner_id = auth.uid()
        )
    );

-- Recreate user_stokvels policies
CREATE POLICY "Users can view their own stokvels" ON public.user_stokvels
    FOR SELECT USING (
        owner_id = auth.uid()
    );

CREATE POLICY "Members can view stokvels they belong to" ON public.user_stokvels
    FOR SELECT USING (
        public.is_stokvel_member(id)
    );

-- Recreate contributions policy
CREATE POLICY "Users can view contributions of their stokvels" ON public.stokvel_contributions
    FOR SELECT USING (
        stokvel_id IN (SELECT id FROM public.user_stokvels WHERE owner_id = auth.uid())
        OR public.is_stokvel_member(stokvel_id)
    );

-- Recreate payouts policy
CREATE POLICY "Users can view payouts of their stokvels" ON public.stokvel_payouts
    FOR SELECT USING (
        stokvel_id IN (SELECT id FROM public.user_stokvels WHERE owner_id = auth.uid())
        OR public.is_stokvel_member(stokvel_id)
    );

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_stokvel_member TO authenticated;

-- Verify policies
SELECT
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_stokvels', 'user_stokvel_members', 'stokvel_contributions', 'stokvel_payouts')
AND cmd = 'SELECT'
ORDER BY tablename, policyname;

-- Test the function (should return true if you're a member of any stokvel)
SELECT
    us.name,
    public.is_stokvel_member(us.id) as is_member
FROM public.user_stokvels us
LIMIT 5;
