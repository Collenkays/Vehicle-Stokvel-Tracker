-- Create function to get user ID by email from auth.users
-- This allows linking members to authenticated users
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Query auth.users table to find user by email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;

  RETURN user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) TO authenticated;

-- Update existing members to link them to authenticated users by email
UPDATE public.user_stokvel_members usm
SET member_id = au.id
FROM auth.users au
WHERE usm.email = au.email
  AND usm.member_id != au.id;

-- Show results of the update
SELECT
  usm.full_name,
  usm.email,
  usm.member_id as current_member_id,
  au.id as auth_user_id,
  CASE
    WHEN usm.member_id = au.id THEN 'Already Linked'
    ELSE 'Needs Linking'
  END as status
FROM public.user_stokvel_members usm
LEFT JOIN auth.users au ON usm.email = au.email
ORDER BY usm.email;
