-- Fix RLS policies to allow members to view their own memberships
-- The issue is that the current policies don't allow members to see stokvels they're part of

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view members of their stokvels" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can add members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can update members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners can delete members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Stokvel owners and admins can manage members" ON public.user_stokvel_members;

-- Create comprehensive policy for viewing members
-- This allows:
-- 1. Members to see their own membership records
-- 2. Stokvel owners to see all members of their stokvels
-- 3. Admins of a stokvel to see all members of that stokvel
CREATE POLICY "Members can view their own memberships and stokvel admins can view all members"
ON public.user_stokvel_members
FOR SELECT
USING (
  -- Allow users to see their own membership records
  auth.uid() = member_id
  OR
  -- Allow stokvel owners to see all members
  EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE user_stokvels.id = user_stokvel_members.stokvel_id
    AND user_stokvels.owner_id = auth.uid()
  )
  OR
  -- Allow stokvel admins to see all members
  EXISTS (
    SELECT 1 FROM public.user_stokvel_members usm
    WHERE usm.stokvel_id = user_stokvel_members.stokvel_id
    AND usm.member_id = auth.uid()
    AND usm.role = 'admin'
    AND usm.is_active = true
  )
);

-- Create policy for inserting members (only stokvel owners and admins)
CREATE POLICY "Stokvel owners and admins can add members"
ON public.user_stokvel_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE user_stokvels.id = stokvel_id
    AND user_stokvels.owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_stokvel_members usm
    WHERE usm.stokvel_id = user_stokvel_members.stokvel_id
    AND usm.member_id = auth.uid()
    AND usm.role = 'admin'
    AND usm.is_active = true
  )
);

-- Create policy for updating members (only stokvel owners and admins)
CREATE POLICY "Stokvel owners and admins can update members"
ON public.user_stokvel_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE user_stokvels.id = stokvel_id
    AND user_stokvels.owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_stokvel_members usm
    WHERE usm.stokvel_id = user_stokvel_members.stokvel_id
    AND usm.member_id = auth.uid()
    AND usm.role = 'admin'
    AND usm.is_active = true
  )
);

-- Create policy for deleting/deactivating members (only stokvel owners and admins)
CREATE POLICY "Stokvel owners and admins can delete members"
ON public.user_stokvel_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_stokvels
    WHERE user_stokvels.id = stokvel_id
    AND user_stokvels.owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_stokvel_members usm
    WHERE usm.stokvel_id = user_stokvel_members.stokvel_id
    AND usm.member_id = auth.uid()
    AND usm.role = 'admin'
    AND usm.is_active = true
  )
);

-- Verify the policies
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'user_stokvel_members'
ORDER BY policyname;

-- Test the query with RLS
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO 'a4c14e21-c607-412e-9742-f95748209f73';

SELECT
  usm.stokvel_id,
  usm.member_id,
  usm.email,
  usm.role,
  usm.is_active
FROM public.user_stokvel_members usm
WHERE usm.member_id = 'a4c14e21-c607-412e-9742-f95748209f73'
  AND usm.is_active = true;

RESET ROLE;
