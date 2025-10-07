-- Check RLS policies on user_stokvels table
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'user_stokvels'
ORDER BY policyname;

-- Test if the user can see the stokvel directly
SELECT set_config('request.jwt.claims', json_build_object('sub', 'a4c14e21-c607-412e-9742-f95748209f73')::text, true);

-- Can the user see the stokvel?
SELECT id, name, owner_id, is_active
FROM public.user_stokvels
WHERE id = '1b159f00-dd81-4130-876d-2bdeb8b7c0e1';

-- Test the inner join query that the app is using
SELECT
  usm.stokvel_id,
  usm.role,
  usm.rotation_order,
  usm.is_active,
  usm.join_date,
  us.id,
  us.name,
  us.owner_id
FROM public.user_stokvel_members usm
INNER JOIN public.user_stokvels us ON us.id = usm.stokvel_id
WHERE usm.member_id = 'a4c14e21-c607-412e-9742-f95748209f73'
  AND usm.is_active = true;
