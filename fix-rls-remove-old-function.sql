-- Remove the old 2-parameter function version

-- First drop policies that might use it
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can view members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Members can view stokvels they belong to" ON public.user_stokvels;
DROP POLICY IF EXISTS "Users can view their own stokvels" ON public.user_stokvels;
DROP POLICY IF EXISTS "Users can view contributions of their stokvels" ON public.stokvel_contributions;
DROP POLICY IF EXISTS "Users can view payouts of their stokvels" ON public.stokvel_payouts;

-- Drop all function versions explicitly
DROP FUNCTION IF EXISTS public.is_stokvel_member(UUID);
DROP FUNCTION IF EXISTS public.is_stokvel_member(UUID, UUID);
DROP FUNCTION IF EXISTS public.is_stokvel_member(UUID, UUID, TEXT);

-- Recreate ONLY the single-parameter version
CREATE FUNCTION public.is_stokvel_member(stokvel_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_id UUID;
    user_email TEXT;
BEGIN
    -- Get current user info
    user_id := auth.uid();
    user_email := auth.email();

    -- Check if user is a member
    RETURN EXISTS (
        SELECT 1
        FROM public.user_stokvel_members
        WHERE stokvel_id = stokvel_uuid
        AND is_active = true
        AND (
            member_id = user_id
            OR LOWER(email) = LOWER(user_email)
        )
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_stokvel_member(UUID) TO authenticated;

-- Recreate all policies
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

CREATE POLICY "Users can view their own stokvels" ON public.user_stokvels
    FOR SELECT USING (
        owner_id = auth.uid()
    );

CREATE POLICY "Members can view stokvels they belong to" ON public.user_stokvels
    FOR SELECT USING (
        public.is_stokvel_member(id)
    );

CREATE POLICY "Users can view contributions of their stokvels" ON public.stokvel_contributions
    FOR SELECT USING (
        stokvel_id IN (SELECT id FROM public.user_stokvels WHERE owner_id = auth.uid())
        OR public.is_stokvel_member(stokvel_id)
    );

CREATE POLICY "Users can view payouts of their stokvels" ON public.stokvel_payouts
    FOR SELECT USING (
        stokvel_id IN (SELECT id FROM public.user_stokvels WHERE owner_id = auth.uid())
        OR public.is_stokvel_member(stokvel_id)
    );

-- Verify only ONE function version exists
SELECT
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'is_stokvel_member';

-- Verify all policies exist
SELECT
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_stokvels', 'user_stokvel_members', 'stokvel_contributions', 'stokvel_payouts')
AND cmd = 'SELECT'
ORDER BY tablename, policyname;
