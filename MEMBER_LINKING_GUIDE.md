# Member Linking Guide

This guide helps you link existing stokvel members to authenticated users.

## Problem

Members are added to stokvels by email, but they can't see the stokvels they're part of because the `member_id` in `user_stokvel_members` doesn't match their Supabase Auth user ID.

## Solution

### Step 1: Create the Database Function

Go to your Supabase SQL Editor and run the following SQL:

```sql
-- Create function to get user ID by email from auth.users
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;

  RETURN user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) TO authenticated;
```

### Step 2: Link Existing Members

Run this SQL to update existing members:

```sql
-- Update existing members to link them to authenticated users by email
UPDATE public.user_stokvel_members usm
SET member_id = au.id
FROM auth.users au
WHERE usm.email = au.email
  AND usm.member_id != au.id;
```

### Step 3: Verify the Links

Check which members are properly linked:

```sql
SELECT
  usm.full_name,
  usm.email,
  usm.member_id as current_member_id,
  au.id as auth_user_id,
  au.email as auth_email,
  CASE
    WHEN usm.member_id = au.id THEN '✅ Linked'
    WHEN au.id IS NULL THEN '❌ No Auth User'
    ELSE '⚠️ Needs Linking'
  END as status
FROM public.user_stokvel_members usm
LEFT JOIN auth.users au ON usm.email = au.email
WHERE usm.is_active = true
ORDER BY status, usm.email;
```

### Step 4: Test

1. Log in as a member user (e.g., collenkaunda@gmail.com)
2. Navigate to "My Memberships"
3. You should now see all stokvels where you're a member

## For Future Members

The code has been updated to automatically use the `get_user_id_by_email` function when adding new members. If the email matches an existing user, they'll be properly linked immediately.

## Troubleshooting

### Member still can't see stokvel

1. Check the member's email matches exactly between:
   - `user_stokvel_members.email`
   - `auth.users.email`

2. Verify the member_id is correct:
```sql
SELECT
  usm.email,
  usm.member_id,
  au.id as actual_user_id
FROM user_stokvel_members usm
LEFT JOIN auth.users au ON au.email = usm.email
WHERE usm.email = 'collenkaunda@gmail.com';
```

3. Check if the membership is active:
```sql
SELECT * FROM user_stokvel_members
WHERE email = 'collenkaunda@gmail.com'
AND is_active = true;
```

4. Verify the stokvel is active:
```sql
SELECT us.*, usm.email
FROM user_stokvels us
JOIN user_stokvel_members usm ON us.id = usm.stokvel_id
WHERE usm.email = 'collenkaunda@gmail.com'
AND us.is_active = true;
```

## Manual Fix for Single Member

If you need to manually fix a single member:

```sql
-- Replace with actual values
UPDATE user_stokvel_members
SET member_id = (SELECT id FROM auth.users WHERE email = 'collenkaunda@gmail.com')
WHERE email = 'collenkaunda@gmail.com';
```
