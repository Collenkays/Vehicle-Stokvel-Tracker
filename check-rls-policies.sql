-- Check RLS policies for user_stokvel_members table
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

-- Check if RLS is enabled
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'user_stokvel_members';

-- Test the actual query that the app is running (replace with actual user ID)
-- First get the user ID
SELECT id, email FROM auth.users WHERE email = 'collenkaunda@gmail.com';

-- Then test the membership query with that ID
-- Replace 'USER_ID_HERE' with the actual ID from above
/*
SELECT
  usm.stokvel_id,
  usm.role,
  usm.rotation_order,
  usm.is_active,
  usm.join_date,
  us.id,
  us.name,
  us.owner_id,
  us.is_active as stokvel_is_active
FROM user_stokvel_members usm
JOIN user_stokvels us ON us.id = usm.stokvel_id
WHERE usm.member_id = 'USER_ID_HERE'
  AND usm.is_active = true;
*/
