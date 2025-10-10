-- Simplified RLS policy fix for member access by email/phone
-- This version uses a simpler approach that's guaranteed to work

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view their own stokvels" ON public.user_stokvels;

-- Create a simplified policy that allows viewing stokvels where user is owner OR member
CREATE POLICY "Users can view their own stokvels" ON public.user_stokvels
    FOR SELECT USING (
        -- Owner can see their stokvels
        auth.uid() = owner_id
        OR
        -- Members can see stokvels where they are listed (by ID or email)
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

-- Also update the user_stokvel_members policy for consistency
DROP POLICY IF EXISTS "Users can view members of their stokvels" ON public.user_stokvel_members;

CREATE POLICY "Users can view members of their stokvels" ON public.user_stokvel_members
    FOR SELECT USING (
        -- Stokvel owners can see all members
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
        OR
        -- Users can see members if they are also a member (by ID or email)
        stokvel_id IN (
            SELECT stokvel_id
            FROM public.user_stokvel_members usm2
            WHERE usm2.is_active = true
            AND (
                usm2.member_id = auth.uid()
                OR LOWER(usm2.email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
            )
        )
    );

-- Update contributions policy
DROP POLICY IF EXISTS "Users can view contributions of their stokvels" ON public.stokvel_contributions;

CREATE POLICY "Users can view contributions of their stokvels" ON public.stokvel_contributions
    FOR SELECT USING (
        -- Stokvel owners can see all contributions
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
        OR
        -- Members can see contributions
        stokvel_id IN (
            SELECT stokvel_id
            FROM public.user_stokvel_members
            WHERE is_active = true
            AND (
                member_id = auth.uid()
                OR LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
            )
        )
    );

-- Update payouts policy
DROP POLICY IF EXISTS "Users can view payouts of their stokvels" ON public.stokvel_payouts;

CREATE POLICY "Users can view payouts of their stokvels" ON public.stokvel_payouts
    FOR SELECT USING (
        -- Stokvel owners can see all payouts
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
        OR
        -- Members can see payouts
        stokvel_id IN (
            SELECT stokvel_id
            FROM public.user_stokvel_members
            WHERE is_active = true
            AND (
                member_id = auth.uid()
                OR LOWER(email) = LOWER((SELECT email FROM auth.users WHERE id = auth.uid()))
            )
        )
    );

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE tablename IN ('user_stokvels', 'user_stokvel_members', 'stokvel_contributions', 'stokvel_payouts')
AND cmd = 'SELECT'
ORDER BY tablename, policyname;
