-- Fix infinite recursion by dropping the problematic policy and using a simpler approach

-- Drop the policy causing infinite recursion
DROP POLICY IF EXISTS "Members can view stokvels they belong to" ON public.user_stokvels;

-- Create a security definer function to check if user is a member
CREATE OR REPLACE FUNCTION public.is_stokvel_member(stokvel_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_stokvel_members
    WHERE user_stokvel_members.stokvel_id = $1
      AND user_stokvel_members.member_id = $2
      AND user_stokvel_members.is_active = true
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_stokvel_member(UUID, UUID) TO authenticated;

-- Now create the policy using the function (no recursion)
CREATE POLICY "Members can view stokvels they belong to"
ON public.user_stokvels
FOR SELECT
USING (
  public.is_stokvel_member(id, auth.uid())
);

-- Verify policies
SELECT
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename IN ('user_stokvels', 'user_stokvel_members')
ORDER BY tablename, policyname;

-- Test the query with RLS context
SELECT set_config('request.jwt.claims', json_build_object('sub', 'a4c14e21-c607-412e-9742-f95748209f73')::text, true);

-- Test if member can see the stokvel
SELECT id, name, owner_id, is_active
FROM public.user_stokvels
WHERE id = '1b159f00-dd81-4130-876d-2bdeb8b7c0e1';

-- Test the full query
SELECT
  usm.stokvel_id,
  usm.role,
  us.id,
  us.name
FROM public.user_stokvel_members usm
INNER JOIN public.user_stokvels us ON us.id = usm.stokvel_id
WHERE usm.member_id = 'a4c14e21-c607-412e-9742-f95748209f73'
  AND usm.is_active = true;

RESET ROLE;
