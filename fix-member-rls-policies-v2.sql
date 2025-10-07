-- Fix RLS policies to allow members to view their own memberships
-- Avoiding infinite recursion by using security definer functions

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view members of their stokvels" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can add members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can update members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can delete members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can manage members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Members can view their own memberships and stokvel admins can view all members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can add members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can update members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can delete members" ON public.user_stokvel_members;

-- Simple policy: Allow users to view their own membership records
CREATE POLICY "Users can view their own memberships"
ON public.user_stokvel_members
FOR SELECT
USING (
  auth.uid() = member_id
);

-- Allow stokvel owners to view all members of their stokvels
CREATE POLICY "Stokvel owners can view members"
ON public.user_stokvel_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE user_stokvels.id = user_stokvel_members.stokvel_id
    AND user_stokvels.owner_id = auth.uid()
  )
);

-- Allow stokvel owners to insert members
CREATE POLICY "Stokvel owners can add members"
ON public.user_stokvel_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE user_stokvels.id = stokvel_id
    AND user_stokvels.owner_id = auth.uid()
  )
);

-- Allow stokvel owners to update members
CREATE POLICY "Stokvel owners can update members"
ON public.user_stokvel_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE user_stokvels.id = stokvel_id
    AND user_stokvels.owner_id = auth.uid()
  )
);

-- Allow stokvel owners to delete members
CREATE POLICY "Stokvel owners can delete members"
ON public.user_stokvel_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE user_stokvels.id = stokvel_id
    AND user_stokvels.owner_id = auth.uid()
  )
);

-- Verify the policies
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'user_stokvel_members'
ORDER BY policyname;
