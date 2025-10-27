-- Comprehensive fix for user_stokvel_members RLS policies
-- This handles both stokvel owners AND stokvel admins

-- Drop all existing policies for user_stokvel_members
DROP POLICY IF EXISTS "Users can view members of their stokvels" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can manage members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can insert members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can update members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can delete members" ON public.user_stokvel_members;

-- ============================================================================
-- SELECT Policy: Users can view members of stokvels they own or are members of
-- ============================================================================
CREATE POLICY "Users can view stokvel members" ON public.user_stokvel_members
    FOR SELECT
    USING (
        -- User is the stokvel owner
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
        OR
        -- User is a member of the stokvel
        member_id = auth.uid()
        OR
        -- User is an admin member of the stokvel
        EXISTS (
            SELECT 1 FROM public.user_stokvel_members AS usm
            WHERE usm.stokvel_id = user_stokvel_members.stokvel_id
              AND usm.member_id = auth.uid()
              AND usm.role = 'admin'
              AND usm.is_active = true
        )
    );

-- ============================================================================
-- INSERT Policy: Stokvel owners and admins can add members
-- ============================================================================
CREATE POLICY "Stokvel owners and admins can insert members" ON public.user_stokvel_members
    FOR INSERT
    WITH CHECK (
        -- User is the stokvel owner
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
        OR
        -- User is an admin member of the stokvel
        EXISTS (
            SELECT 1 FROM public.user_stokvel_members AS usm
            WHERE usm.stokvel_id = user_stokvel_members.stokvel_id
              AND usm.member_id = auth.uid()
              AND usm.role = 'admin'
              AND usm.is_active = true
        )
    );

-- ============================================================================
-- UPDATE Policy: Stokvel owners and admins can update members
-- ============================================================================
CREATE POLICY "Stokvel owners and admins can update members" ON public.user_stokvel_members
    FOR UPDATE
    USING (
        -- User is the stokvel owner
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
        OR
        -- User is an admin member of the stokvel
        EXISTS (
            SELECT 1 FROM public.user_stokvel_members AS usm
            WHERE usm.stokvel_id = user_stokvel_members.stokvel_id
              AND usm.member_id = auth.uid()
              AND usm.role = 'admin'
              AND usm.is_active = true
        )
    )
    WITH CHECK (
        -- Same check for the new data
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.user_stokvel_members AS usm
            WHERE usm.stokvel_id = user_stokvel_members.stokvel_id
              AND usm.member_id = auth.uid()
              AND usm.role = 'admin'
              AND usm.is_active = true
        )
    );

-- ============================================================================
-- DELETE Policy: Stokvel owners and admins can delete members
-- ============================================================================
CREATE POLICY "Stokvel owners and admins can delete members" ON public.user_stokvel_members
    FOR DELETE
    USING (
        -- User is the stokvel owner
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
        OR
        -- User is an admin member of the stokvel
        EXISTS (
            SELECT 1 FROM public.user_stokvel_members AS usm
            WHERE usm.stokvel_id = user_stokvel_members.stokvel_id
              AND usm.member_id = auth.uid()
              AND usm.role = 'admin'
              AND usm.is_active = true
        )
    );

-- ============================================================================
-- Verification Query
-- ============================================================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE
        WHEN qual IS NOT NULL THEN substring(qual::text, 1, 100) || '...'
        ELSE NULL
    END as qual_preview,
    CASE
        WHEN with_check IS NOT NULL THEN substring(with_check::text, 1, 100) || '...'
        ELSE NULL
    END as with_check_preview
FROM pg_policies
WHERE tablename = 'user_stokvel_members'
ORDER BY cmd, policyname;

-- ============================================================================
-- Test Query (run this after creating a member to debug)
-- Replace the UUID values with actual ones from your app
-- ============================================================================
-- SELECT
--     auth.uid() as current_user,
--     auth.role() as current_role,
--     us.id as stokvel_id,
--     us.owner_id,
--     us.owner_id = auth.uid() as is_owner,
--     EXISTS (
--         SELECT 1 FROM public.user_stokvel_members usm
--         WHERE usm.stokvel_id = us.id
--           AND usm.member_id = auth.uid()
--           AND usm.role = 'admin'
--           AND usm.is_active = true
--     ) as is_admin
-- FROM public.user_stokvels us
-- WHERE us.id = 'YOUR_STOKVEL_ID_HERE';
