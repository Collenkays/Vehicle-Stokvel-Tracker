# Final Fix Steps - Add Storage Policies

## Current Status
✅ Bucket exists: `proof-of-payments`
✅ Bucket is public
❌ No policies created yet ← **This is the issue!**

## Solution: Add Storage Policies

### Option 1: Via SQL Editor (Recommended - 2 minutes)

1. **Open Supabase Dashboard** → **SQL Editor**
2. **Click "New query"**
3. **Copy and paste** the contents of `create-storage-policies.sql`:

```sql
-- Policy 1: Allow authenticated users to INSERT (upload) files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'proof-of-payments');

-- Policy 2: Allow public SELECT (view) access since bucket is public
CREATE POLICY "Public can view files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'proof-of-payments');

-- Policy 3: Allow authenticated users to UPDATE their files
CREATE POLICY "Authenticated users can update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'proof-of-payments');

-- Policy 4: Allow authenticated users to DELETE their files
CREATE POLICY "Authenticated users can delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'proof-of-payments');
```

4. **Click "Run"** (or press Cmd/Ctrl + Enter)
5. **Verify success** - You should see "Success. No rows returned"

### Option 2: Via Storage UI (Alternative - 5 minutes)

1. Go to **Storage** → **Policies** (where you are now)
2. Under **"PROOF-OF-PAYMENTS"** section, click **"New policy"**
3. Create 4 policies manually:

**Policy 1: Upload**
- Policy name: `Authenticated users can upload files`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- USING expression: leave empty
- WITH CHECK expression: `bucket_id = 'proof-of-payments'`

**Policy 2: View**
- Policy name: `Public can view files`
- Allowed operation: `SELECT`
- Target roles: `public`
- USING expression: `bucket_id = 'proof-of-payments'`

**Policy 3: Update**
- Policy name: `Authenticated users can update files`
- Allowed operation: `UPDATE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'proof-of-payments'`

**Policy 4: Delete**
- Policy name: `Authenticated users can delete files`
- Allowed operation: `DELETE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'proof-of-payments'`

## After Adding Policies

1. **Refresh** the Storage → Policies page
2. You should now see **4 policies** listed under "PROOF-OF-PAYMENTS"
3. Go back to your app
4. **Try uploading a contribution** again
5. It should work now! ✅

## Expected Result

After adding the policies:
- ✅ Upload works
- ✅ No permission errors
- ✅ File URL is saved to database
- ✅ "Proof" link opens the uploaded file

## Troubleshooting

### If SQL gives "already exists" error
→ Policies already exist, just refresh the Storage → Policies page

### If upload still fails
1. Check browser console for the exact error message
2. Verify you're logged in (authenticated)
3. Verify the bucket name is `proof-of-payments` (with hyphen)
4. Check that policies show up in Storage → Policies page

### If you see "anonymous" error
→ Make sure you're logged into the app (not anonymous)

## Why This Fixes It

The bucket exists but has **no access policies**, which means:
- ❌ Even authenticated users can't upload
- ❌ The bucket is "public" but has no SELECT policy to view files

Adding these policies:
- ✅ Allows authenticated (logged-in) users to upload files
- ✅ Allows anyone to view files (since bucket is public)
- ✅ Allows authenticated users to manage their files

This is the standard setup for file uploads in Supabase!
