# Member Management Feature - Setup & Troubleshooting Guide

## Overview
The member management feature allows stokvel owners to add, edit, and remove members from their stokvels after creation.

## Setup Instructions

### 1. Database RLS Policies Setup

**IMPORTANT**: You must run this SQL script in your Supabase database to enable member management:

```sql
-- Run this in your Supabase SQL Editor
\i fix-member-policies.sql
```

Or copy and execute the contents of `fix-member-policies.sql` directly in the Supabase SQL Editor.

This script:
- Creates separate policies for SELECT, INSERT, UPDATE, and DELETE operations
- Ensures stokvel owners can add/edit/remove members
- Allows members to view their own membership information

### 2. Verify the Setup

After running the SQL script, verify that the policies are in place:

```sql
-- Check if policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'user_stokvel_members';
```

You should see these policies:
- `Users can view members of their stokvels` (SELECT)
- `Stokvel owners can add members` (INSERT)
- `Stokvel owners can update members` (UPDATE)
- `Stokvel owners can delete members` (DELETE)

## Features

### Add Members
1. Navigate to **My Stokvels** → Select a stokvel → Click the **Settings** button
2. Scroll to the **Stokvel Members** section
3. Click **Add Member**
4. Fill in the required fields:
   - **Full Name**: Member's full name (required)
   - **Email**: Member's email address (required)
   - **Contact Number**: Phone number (optional)
   - **Role**: Admin or Member
   - **Rotation Order**: Position in the rotation sequence
5. Click **Save**

### Edit Members
1. In the Stokvel Members section, click the **Edit** icon next to a member
2. Update the desired fields
3. Click **Save**

### Remove Members
1. In the Stokvel Members section, click the **Delete** icon next to a member
2. Confirm the deletion
3. The member will be soft-deleted (marked as inactive but data is preserved)

## Troubleshooting

### Issue: "Save" button doesn't work

**Possible causes:**

1. **Missing RLS Policies** (Most Common)
   - **Solution**: Run the `fix-member-policies.sql` script in Supabase SQL Editor
   - **Check**: Open browser console (F12) and look for error messages

2. **Missing Required Fields**
   - **Solution**: Ensure both Full Name and Email are filled in
   - The Save button is disabled when required fields are empty

3. **Not the Stokvel Owner**
   - **Solution**: Only the stokvel owner can add/edit members
   - **Check**: Verify you created the stokvel (you should see it in "My Stokvels" tab, not "My Memberships")

4. **Network/Connection Issues**
   - **Solution**: Check your internet connection and Supabase project status
   - **Check**: Look for network errors in browser console

### Issue: Members not appearing after adding

**Possible causes:**

1. **Cache not invalidated**
   - **Solution**: Refresh the page manually
   - The queries should auto-invalidate, but a manual refresh ensures fresh data

2. **Member added to wrong stokvel**
   - **Solution**: Check the stokvelId in the URL matches the intended stokvel

### How to Check for Errors

1. **Open Browser Console**:
   - Chrome/Edge: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)

2. **Look for error messages** when clicking Save:
   - Red error messages indicate what went wrong
   - Common errors:
     - `new row violates row-level security policy` → Run the SQL fix script
     - `duplicate key value` → Member with that email already exists
     - `permission denied` → You're not the stokvel owner
     - `invalid input syntax for type uuid` → Member ID format issue (should be fixed in latest code)

3. **Check Network Tab**:
   - Click the "Network" tab in developer tools
   - Click Save and watch for failed requests (shown in red)
   - Click on the failed request to see details

## Technical Details

### Member ID Assignment

When adding a member:
1. System checks if the email matches a registered user
2. If yes: Uses the user's actual UUID (allows them to log in and see the stokvel)
3. If no: Generates a temporary UUID in format `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
4. Temporary members are tracked but can't log in until they register

**Note**: The `member_id` field must be a valid UUID as the database column is UUID type.

### Database Schema

The `user_stokvel_members` table structure:
```sql
- id: UUID (primary key)
- stokvel_id: UUID (foreign key to user_stokvels)
- member_id: UUID (user ID or temp UUID)
- full_name: VARCHAR
- email: VARCHAR
- contact_number: VARCHAR
- role: ENUM ('admin', 'member')
- rotation_order: INTEGER
- is_active: BOOLEAN
- join_date: TIMESTAMP
- vehicle_received: BOOLEAN
- month_received: VARCHAR
- total_paid: NUMERIC
- net_position: NUMERIC
- adjustment: NUMERIC
```

### API Hooks Used

- `useStokvelMembers(stokvelId)` - Fetches all members for a stokvel
- `useAddStokvelMember()` - Adds a new member
- `useUpdateStokvelMember()` - Updates member information
- `useDeleteStokvelMember()` - Soft deletes a member

## Support

If you continue to experience issues:
1. Check the browser console for specific error messages
2. Verify the RLS policies are correctly set up in Supabase
3. Ensure you're the owner of the stokvel you're trying to manage
4. Check your Supabase project is active and has not exceeded quotas
