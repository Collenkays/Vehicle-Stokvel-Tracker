-- Fix RLS policies for user_stokvel_members to allow inserts

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view members of their stokvels" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can manage members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can manage members" ON public.user_stokvel_members;

-- Enable RLS
ALTER TABLE public.user_stokvel_members ENABLE ROW LEVEL SECURITY;

-- Policy for viewing members
CREATE POLICY "Users can view members of their stokvels" ON public.user_stokvel_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        ) OR
        member_id = auth.uid()
    );

-- Policy for inserting members (stokvel owners only)
CREATE POLICY "Stokvel owners can add members" ON public.user_stokvel_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
    );

-- Policy for updating members (stokvel owners only)
CREATE POLICY "Stokvel owners can update members" ON public.user_stokvel_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
    );

-- Policy for deleting/deactivating members (stokvel owners only)
CREATE POLICY "Stokvel owners can delete members" ON public.user_stokvel_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_stokvel_members TO authenticated;
