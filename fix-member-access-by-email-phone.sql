-- Fix RLS policies to allow members to access stokvels via email/phone matching
-- This enables members added by email/phone to see their stokvels when they log in

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own stokvels" ON public.user_stokvels;
DROP POLICY IF EXISTS "Users can view members of their stokvels" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Users can view contributions of their stokvels" ON public.stokvel_contributions;
DROP POLICY IF EXISTS "Users can view payouts of their stokvels" ON public.stokvel_payouts;

-- Recreate user_stokvels policy with email/phone matching
CREATE POLICY "Users can view their own stokvels" ON public.user_stokvels
    FOR SELECT USING (
        -- Owner can see their stokvels
        auth.uid() = owner_id
        OR
        -- Members can see stokvels where they are added (by member_id, email, or phone)
        EXISTS (
            SELECT 1 FROM public.user_stokvel_members usm
            WHERE usm.stokvel_id = id
            AND usm.is_active = true
            AND (
                usm.member_id = auth.uid()
                OR usm.email = auth.email()
                OR (
                    usm.contact_number IS NOT NULL
                    AND usm.contact_number != ''
                    AND (
                        usm.contact_number = (auth.jwt()->>'phone')
                        OR usm.contact_number = (auth.jwt()->'user_metadata'->>'phone')
                        OR usm.contact_number = (auth.jwt()->'user_metadata'->>'contact_number')
                    )
                )
            )
        )
    );

-- Recreate user_stokvel_members policy with email/phone matching
CREATE POLICY "Users can view members of their stokvels" ON public.user_stokvel_members
    FOR SELECT USING (
        -- Stokvel owners can see all members
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
        OR
        -- Users can see members of stokvels they belong to (by member_id, email, or phone)
        EXISTS (
            SELECT 1 FROM public.user_stokvel_members usm
            WHERE usm.stokvel_id = stokvel_id
            AND usm.is_active = true
            AND (
                usm.member_id = auth.uid()
                OR usm.email = auth.email()
                OR (
                    usm.contact_number IS NOT NULL
                    AND usm.contact_number != ''
                    AND (
                        usm.contact_number = (auth.jwt()->>'phone')
                        OR usm.contact_number = (auth.jwt()->'user_metadata'->>'phone')
                        OR usm.contact_number = (auth.jwt()->'user_metadata'->>'contact_number')
                    )
                )
            )
        )
    );

-- Recreate stokvel_contributions policy with email/phone matching
CREATE POLICY "Users can view contributions of their stokvels" ON public.stokvel_contributions
    FOR SELECT USING (
        -- Stokvel owners can see all contributions
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
        OR
        -- Members can see contributions in their stokvels (by member_id, email, or phone)
        EXISTS (
            SELECT 1 FROM public.user_stokvel_members usm
            WHERE usm.stokvel_id = stokvel_id
            AND usm.is_active = true
            AND (
                usm.member_id = auth.uid()
                OR usm.email = auth.email()
                OR (
                    usm.contact_number IS NOT NULL
                    AND usm.contact_number != ''
                    AND (
                        usm.contact_number = (auth.jwt()->>'phone')
                        OR usm.contact_number = (auth.jwt()->'user_metadata'->>'phone')
                        OR usm.contact_number = (auth.jwt()->'user_metadata'->>'contact_number')
                    )
                )
            )
        )
    );

-- Recreate stokvel_payouts policy with email/phone matching
CREATE POLICY "Users can view payouts of their stokvels" ON public.stokvel_payouts
    FOR SELECT USING (
        -- Stokvel owners can see all payouts
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
        OR
        -- Members can see payouts in their stokvels (by member_id, email, or phone)
        EXISTS (
            SELECT 1 FROM public.user_stokvel_members usm
            WHERE usm.stokvel_id = stokvel_id
            AND usm.is_active = true
            AND (
                usm.member_id = auth.uid()
                OR usm.email = auth.email()
                OR (
                    usm.contact_number IS NOT NULL
                    AND usm.contact_number != ''
                    AND (
                        usm.contact_number = (auth.jwt()->>'phone')
                        OR usm.contact_number = (auth.jwt()->'user_metadata'->>'phone')
                        OR usm.contact_number = (auth.jwt()->'user_metadata'->>'contact_number')
                    )
                )
            )
        )
    );

-- Add helpful function to check member access
CREATE OR REPLACE FUNCTION public.check_member_access(p_stokvel_id UUID, p_user_id UUID, p_email TEXT, p_phone TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_stokvel_members
        WHERE stokvel_id = p_stokvel_id
        AND is_active = true
        AND (
            member_id = p_user_id
            OR email = p_email
            OR (contact_number IS NOT NULL AND contact_number != '' AND contact_number = p_phone)
        )
    );
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.check_member_access TO authenticated;

-- Add index for better performance on email and phone lookups
CREATE INDEX IF NOT EXISTS idx_stokvel_members_email ON public.user_stokvel_members(email) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_stokvel_members_contact ON public.user_stokvel_members(contact_number) WHERE is_active = true AND contact_number IS NOT NULL AND contact_number != '';
CREATE INDEX IF NOT EXISTS idx_stokvel_members_member_id ON public.user_stokvel_members(member_id) WHERE is_active = true;

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('user_stokvels', 'user_stokvel_members', 'stokvel_contributions', 'stokvel_payouts')
ORDER BY tablename, policyname;
