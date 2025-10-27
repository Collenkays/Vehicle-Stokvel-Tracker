-- Fix RLS policy for user_stokvel_members to allow INSERT operations
-- The issue: FOR ALL USING (...) doesn't apply to INSERT operations
-- Solution: Drop and recreate with both USING and WITH CHECK clauses

-- Drop existing policy
DROP POLICY IF EXISTS "Stokvel owners can manage members" ON public.user_stokvel_members;

-- Create separate policies for better control
-- Policy for INSERT: Allow stokvel owners to add members
CREATE POLICY "Stokvel owners can insert members" ON public.user_stokvel_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
    );

-- Policy for UPDATE: Allow stokvel owners to update members
CREATE POLICY "Stokvel owners can update members" ON public.user_stokvel_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
    );

-- Policy for DELETE: Allow stokvel owners to delete members
CREATE POLICY "Stokvel owners can delete members" ON public.user_stokvel_members
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_stokvels
            WHERE id = stokvel_id AND owner_id = auth.uid()
        )
    );

-- Verify policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'user_stokvel_members'
ORDER BY policyname;
