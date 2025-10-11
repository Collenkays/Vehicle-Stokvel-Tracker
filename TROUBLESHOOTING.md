# Troubleshooting Member Addition 403 Error

## Problem
Getting a **403 Forbidden** error when trying to add members to a stokvel with the error:
```
new row violates row-level security policy for table "user_stokvel_members"
```

## Root Cause
The RLS (Row Level Security) policies on the `user_stokvel_members` table are preventing the INSERT operation. This can happen due to:

1. **Recursion in RLS policies** - Policies that query the same table they're protecting
2. **Missing helper functions** - Security definer functions not created or not granted permissions
3. **User context mismatch** - The authenticated user is not the stokvel owner
4. **Stale policies** - Old policies conflicting with new ones

## Diagnostic Steps

### Step 1: Run Debug Query
Open **Supabase SQL Editor** and run `debug-member-permissions.sql`:

1. Replace `'YOUR_STOKVEL_ID_HERE'` with your actual stokvel ID (visible in the browser URL when viewing the stokvel)
2. Run the query
3. Check the output to see:
   - Your current user ID and email
   - Which stokvels you own
   - Whether helper functions exist and work
   - Which RLS policies are active

### Step 2: Check Key Points

**A. Verify you are the stokvel owner:**
```sql
SELECT owner_id, name FROM public.user_stokvels WHERE id = 'YOUR_STOKVEL_ID';
```
Compare `owner_id` with `auth.uid()` from the debug query.

**B. Check if RLS is enabled:**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'user_stokvel_members';
```
Should show `rowsecurity = true`.

**C. List all policies:**
```sql
SELECT policyname, cmd FROM pg_policies
WHERE tablename = 'user_stokvel_members';
```

## Solutions

### Solution 1: Simple Owner-Only Policy (RECOMMENDED)
If you just need stokvel owners to manage members (no admin delegation), run:

```bash
# In Supabase SQL Editor
fix-member-rls-simple-owner-only.sql
```

This removes complex admin checks and allows ONLY the stokvel owner to manage members.

**Pros:**
- ✅ No recursion issues
- ✅ Simple and reliable
- ✅ Sufficient for most use cases

**Cons:**
- ❌ Admins cannot add members (only owners can)

### Solution 2: Full Owner + Admin Support (ADVANCED)
If you need both owners AND admins to manage members, run:

```bash
# In Supabase SQL Editor
fix-member-rls-final.sql
```

This uses SECURITY DEFINER functions to avoid recursion.

**Requirements:**
- ✅ Helper functions must be created
- ✅ Functions must have EXECUTE permissions granted
- ✅ User must be either owner OR admin of the stokvel

### Solution 3: Verify and Recreate
If both solutions fail, there might be stale policies or functions:

1. **Drop all policies manually:**
```sql
DROP POLICY IF EXISTS "Users can view their own memberships" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Owners can view all members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Owners can add members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Owners can update members" ON public.user_stokvel_members;
DROP POLICY IF EXISTS "Owners can delete members" ON public.user_stokvel_members;
-- Add any other policies shown by the debug query
```

2. **Verify RLS is enabled:**
```sql
ALTER TABLE public.user_stokvel_members ENABLE ROW LEVEL SECURITY;
```

3. **Re-run the simple fix:**
```sql
-- Run fix-member-rls-simple-owner-only.sql again
```

## Common Mistakes

### Mistake 1: Running queries without being logged in
The SQL Editor queries must be run **while authenticated** as the user experiencing the issue. Use the Supabase Dashboard's SQL Editor, not a raw SQL client.

### Mistake 2: Wrong stokvel ID
Make sure you're using the correct stokvel ID. You can find it in:
- Browser URL: `/stokvel/{stokvel_id}/members`
- Database: `SELECT id, name FROM public.user_stokvels;`

### Mistake 3: User is not the owner
If you created the stokvel with a different account, you won't be able to add members. Verify:
```sql
SELECT name, owner_id
FROM public.user_stokvels
WHERE id = 'YOUR_STOKVEL_ID';
```

The `owner_id` must match your `auth.uid()`.

### Mistake 4: Helper functions not granted permissions
If using Solution 2 (admin support), verify:
```sql
GRANT EXECUTE ON FUNCTION public.can_manage_stokvel_members(UUID) TO authenticated;
```

## Testing the Fix

After applying a solution:

1. **Clear browser cache** or do a hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
2. **Try adding a member** through the UI
3. **Check browser console** - should see no 403 errors
4. **Verify in database:**
```sql
SELECT * FROM public.user_stokvel_members
WHERE stokvel_id = 'YOUR_STOKVEL_ID'
ORDER BY created_at DESC LIMIT 5;
```

## Still Having Issues?

If none of these solutions work:

1. **Export your current policies:**
```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_stokvel_members';
```

2. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs → Database
   - Look for RLS-related errors

3. **Temporarily disable RLS** (TESTING ONLY, NOT FOR PRODUCTION):
```sql
ALTER TABLE public.user_stokvel_members DISABLE ROW LEVEL SECURITY;
-- Try adding a member
-- Then re-enable:
ALTER TABLE public.user_stokvel_members ENABLE ROW LEVEL SECURITY;
```

If it works with RLS disabled, the issue is definitely in the RLS policies.

## Quick Reference

| File | Purpose | Recommended For |
|------|---------|----------------|
| `debug-member-permissions.sql` | Diagnose permission issues | Everyone - run first |
| `fix-member-rls-simple-owner-only.sql` | Simple owner-only policies | Most users - start here |
| `fix-member-rls-final.sql` | Full owner+admin support | Advanced users needing admin delegation |
