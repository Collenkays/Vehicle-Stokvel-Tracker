-- Fix infinite recursion in user_stokvel_members RLS policies

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view members of their stokvels" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can manage members" ON public.user_stokvel_members;

-- Recreate policies without infinite recursion
CREATE POLICY "Users can view members of their stokvels" ON public.user_stokvel_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels 
            WHERE id = stokvel_id AND owner_id = auth.uid()
        ) OR 
        member_id = auth.uid()
    );

CREATE POLICY "Stokvel owners and admins can manage members" ON public.user_stokvel_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels 
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
    );