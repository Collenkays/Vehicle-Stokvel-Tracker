# Member Foreign Key Constraint Issue

## Problem

The error `violates foreign key constraint "user_stokvel_members_member_id_fkey"` occurs because:

1. The `user_stokvel_members.member_id` column has a **foreign key constraint** to `auth.users(id)`
2. This means you can **only add members who already have user accounts**
3. Temporary UUIDs are rejected because they don't exist in the `auth.users` table

## Solutions

### Solution 1: Remove Foreign Key Constraint (Recommended)

This allows you to add members who don't have accounts yet.

**Steps:**
1. Run the SQL script in Supabase SQL Editor:
   ```sql
   -- Copy and run the contents of: remove-member-fkey-constraint.sql
   ```

2. This will:
   - Remove the foreign key constraint
   - Allow adding members with temporary UUIDs
   - Still allow adding registered users with their actual IDs

**Pros:**
- ✅ Flexible - add members before they register
- ✅ Matches real-world stokvel management
- ✅ Members can be invited and tracked before joining

**Cons:**
- ⚠️ No database-level validation that member_id is a real user
- ⚠️ Need to handle orphaned member records manually

---

### Solution 2: Only Allow Registered Users

Modify the UI to only allow adding users who already have accounts.

**Implementation:**
1. Add email validation that checks if user exists
2. Show error if user doesn't have an account
3. Provide invitation flow to register first

**Pros:**
- ✅ Database integrity maintained
- ✅ All members are verified users
- ✅ Immediate access after adding

**Cons:**
- ❌ Less flexible
- ❌ Requires all members to register before being added
- ❌ More complex user flow

---

### Solution 3: Hybrid Approach

Create a separate table for "pending members" (invited but not registered).

**Implementation:**
```sql
-- Create pending members table
CREATE TABLE public.pending_stokvel_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stokvel_id UUID REFERENCES public.user_stokvels(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    contact_number TEXT,
    role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    rotation_order INTEGER,
    invited_at TIMESTAMP DEFAULT NOW(),
    invitation_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

-- When user registers and email matches, move to user_stokvel_members
```

**Pros:**
- ✅ Clean separation of pending vs. active members
- ✅ Database integrity maintained
- ✅ Clear workflow for invitations

**Cons:**
- ⚠️ More complex implementation
- ⚠️ Need sync logic when user registers
- ⚠️ Two places to check for members

---

## Recommended Approach

**Use Solution 1 (Remove Foreign Key Constraint)** because:

1. **Simplicity**: Single table, straightforward logic
2. **Flexibility**: Works for both registered and unregistered members
3. **User Experience**: Stokvel owners can add anyone immediately
4. **Real-world**: Matches how stokvels actually work

### Implementation Steps

1. **Run the migration:**
   ```bash
   # In Supabase SQL Editor, run:
   remove-member-fkey-constraint.sql
   ```

2. **Verify it worked:**
   ```sql
   -- Check constraints on the table
   SELECT
       conname as constraint_name,
       contype as constraint_type,
       pg_get_constraintdef(oid) as definition
   FROM pg_constraint
   WHERE conrelid = 'public.user_stokvel_members'::regclass;

   -- You should NOT see a constraint with member_id referencing auth.users
   ```

3. **Test adding a member:**
   - Refresh your browser
   - Try adding a member again
   - It should now work!

4. **Optional - Track registered vs. unregistered:**
   ```sql
   -- Query to find unregistered members
   SELECT
       usm.full_name,
       usm.email,
       usm.member_id,
       CASE
           WHEN au.id IS NULL THEN 'Not Registered'
           ELSE 'Registered'
       END as status
   FROM public.user_stokvel_members usm
   LEFT JOIN auth.users au ON usm.member_id = au.id;
   ```

---

## Migration Script Content

The `remove-member-fkey-constraint.sql` script does:

```sql
-- Remove the foreign key constraint
ALTER TABLE public.user_stokvel_members
DROP CONSTRAINT IF EXISTS user_stokvel_members_member_id_fkey;

-- Add documentation
COMMENT ON COLUMN public.user_stokvel_members.member_id IS
'User ID from auth.users if registered, or temporary UUID if not registered yet';
```

---

## After Migration

Once the constraint is removed:

1. **Registered users**: Use their `auth.users.id` as `member_id`
   - They can log in and see the stokvel
   - Full platform access

2. **Unregistered members**: Get a temporary UUID as `member_id`
   - Tracked in the system
   - Can't log in until they register
   - When they register, you can update their `member_id` or leave it as-is

3. **Future enhancement**: Add logic to automatically link temporary members when they register with matching email

---

## Troubleshooting

### Error persists after running migration

1. **Check if constraint was actually removed:**
   ```sql
   \d public.user_stokvel_members
   -- or
   SELECT * FROM pg_constraint
   WHERE conrelid = 'public.user_stokvel_members'::regclass;
   ```

2. **Ensure you're using the right database:**
   - Verify you're in the correct Supabase project
   - Check you're using the production database (not a backup)

3. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or clear site data completely

### Different error appears

If you see a new error, check:
- Other foreign key constraints on the table
- RLS policies (should already be fixed from earlier)
- Required field validations

---

## Support

If issues persist after removing the constraint:
1. Check browser console for the exact error message
2. Verify the SQL migration ran successfully
3. Check if there are any other constraints on the member_id column
