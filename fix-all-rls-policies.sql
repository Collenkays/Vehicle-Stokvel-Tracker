-- Fix all infinite recursion issues in RLS policies

-- First, drop all problematic policies
DROP POLICY IF EXISTS "Users can view their own stokvels" ON public.user_stokvels;
DROP POLICY IF EXISTS "Users can view members of their stokvels" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can manage members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Users can view contributions of their stokvels" ON public.stokvel_contributions;
DROP POLICY IF EXISTS "Stokvel owners and admins can manage contributions" ON public.stokvel_contributions;
DROP POLICY IF EXISTS "Users can view payouts of their stokvels" ON public.stokvel_payouts;
DROP POLICY IF EXISTS "Stokvel owners and admins can manage payouts" ON public.stokvel_payouts;

-- Recreate user_stokvels policies without circular references
CREATE POLICY "Users can view their own stokvels" ON public.user_stokvels
    FOR SELECT USING (
        auth.uid() = owner_id
    );

CREATE POLICY "Users can create stokvels" ON public.user_stokvels
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their stokvels" ON public.user_stokvels
    FOR UPDATE USING (auth.uid() = owner_id);

-- Recreate user_stokvel_members policies without circular references
CREATE POLICY "Users can view members of their stokvels" ON public.user_stokvel_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels 
            WHERE id = stokvel_id AND owner_id = auth.uid()
        ) OR 
        member_id = auth.uid()
    );

CREATE POLICY "Stokvel owners can manage members" ON public.user_stokvel_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels 
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
    );

-- Recreate stokvel_contributions policies without circular references
CREATE POLICY "Users can view contributions of their stokvels" ON public.stokvel_contributions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels 
            WHERE id = stokvel_id AND owner_id = auth.uid()
        ) OR
        member_id = auth.uid()
    );

CREATE POLICY "Stokvel owners and members can manage contributions" ON public.stokvel_contributions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels 
            WHERE id = stokvel_id AND owner_id = auth.uid()
        ) OR
        member_id = auth.uid()
    );

-- Recreate stokvel_payouts policies without circular references
CREATE POLICY "Users can view payouts of their stokvels" ON public.stokvel_payouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels 
            WHERE id = stokvel_id AND owner_id = auth.uid()
        ) OR
        recipient_member_id = auth.uid()
    );

CREATE POLICY "Stokvel owners can manage payouts" ON public.stokvel_payouts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels 
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
    );