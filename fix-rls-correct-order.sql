-- Complete cleanup with correct drop order - policies first, then functions

-- Step 1: Drop all policies first (they depend on the function)
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can view members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Members can view stokvels they belong to" ON public.user_stokvels;
DROP POLICY IF EXISTS "Users can view their own stokvels" ON public.user_stokvels;
DROP POLICY IF EXISTS "Users can view contributions of their stokvels" ON public.stokvel_contributions;
DROP POLICY IF EXISTS "Users can view payouts of their stokvels" ON public.stokvel_payouts;

-- Step 2: Now drop all function versions
DROP FUNCTION IF EXISTS public.is_stokvel_member(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS public.is_stokvel_member(UUID);

-- Step 3: Create the helper function (single parameter version)
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

-- Step 4: Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_stokvel_member(UUID) TO authenticated;

-- Step 5: Recreate user_stokvel_members policies
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

-- Step 6: Recreate user_stokvels policies
CREATE POLICY "Users can view their own stokvels" ON public.user_stokvels
    FOR SELECT USING (
        owner_id = auth.uid()
    );

CREATE POLICY "Members can view stokvels they belong to" ON public.user_stokvels
    FOR SELECT USING (
        public.is_stokvel_member(id)
    );

-- Step 7: Recreate contributions policy
CREATE POLICY "Users can view contributions of their stokvels" ON public.stokvel_contributions
    FOR SELECT USING (
        stokvel_id IN (SELECT id FROM public.user_stokvels WHERE owner_id = auth.uid())
        OR public.is_stokvel_member(stokvel_id)
    );

-- Step 8: Recreate payouts policy
CREATE POLICY "Users can view payouts of their stokvels" ON public.stokvel_payouts
    FOR SELECT USING (
        stokvel_id IN (SELECT id FROM public.user_stokvels WHERE owner_id = auth.uid())
        OR public.is_stokvel_member(stokvel_id)
    );

-- Verify function exists with correct signature
SELECT
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'is_stokvel_member';

-- Test the function directly with your email
SELECT
    us.id,
    us.name,
    public.is_stokvel_member(us.id) as is_member_check
FROM public.user_stokvels us
WHERE us.id IN (
    SELECT stokvel_id
    FROM public.user_stokvel_members
    WHERE LOWER(email) = LOWER('collenkaunda@gmail.com')
    AND is_active = true
)
LIMIT 5;

-- Debug: Show what auth.email() and auth.uid() return
SELECT
    auth.uid() as current_user_id,
    auth.email() as current_user_email;

-- Debug: Show your actual memberships
SELECT
    usm.stokvel_id,
    us.name as stokvel_name,
    usm.email as member_email,
    usm.member_id,
    usm.is_active,
    LOWER(usm.email) as lowercase_member_email,
    LOWER(auth.email()) as lowercase_current_email,
    LOWER(usm.email) = LOWER(auth.email()) as email_match
FROM public.user_stokvel_members usm
JOIN public.user_stokvels us ON us.id = usm.stokvel_id
WHERE LOWER(usm.email) = LOWER('collenkaunda@gmail.com')
AND usm.is_active = true;
