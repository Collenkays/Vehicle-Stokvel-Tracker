-- Complete cleanup and final fix

-- Drop ALL versions of the function
DROP FUNCTION IF EXISTS public.is_stokvel_member(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS public.is_stokvel_member(UUID);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can view members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Members can view stokvels they belong to" ON public.user_stokvels;
DROP POLICY IF EXISTS "Users can view their own stokvels" ON public.user_stokvels;
DROP POLICY IF EXISTS "Users can view contributions of their stokvels" ON public.stokvel_contributions;
DROP POLICY IF EXISTS "Users can view payouts of their stokvels" ON public.stokvel_payouts;

-- Create the helper function (single parameter version)
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

-- Grant execute permission with specific signature
GRANT EXECUTE ON FUNCTION public.is_stokvel_member(UUID) TO authenticated;

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

-- Verify function exists
SELECT
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'is_stokvel_member';

-- Test with actual data - check if user is member of their stokvels
SELECT
    us.id,
    us.name,
    usm.email as member_email,
    usm.member_id,
    auth.uid() as current_user_id,
    auth.email() as current_user_email,
    public.is_stokvel_member(us.id) as is_member_via_function,
    (usm.member_id = auth.uid() OR LOWER(usm.email) = LOWER(auth.email())) as direct_check
FROM public.user_stokvels us
LEFT JOIN public.user_stokvel_members usm ON us.id = usm.stokvel_id AND usm.is_active = true
WHERE usm.email = auth.email()
LIMIT 5;
