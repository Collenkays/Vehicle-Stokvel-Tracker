# Diagnostic Steps for Storage Upload Issue

## Current Status
The upload is failing with "Failed to upload proof of payment" error. This is most likely because the storage bucket hasn't been created yet.

## Quick Diagnosis

### Step 1: Check Browser Console
Look at the browser console (F12) for the detailed error message. You should see:
- "Attempting to upload file to: ..."
- "Bucket: proof-of-payments"
- "Supabase storage error: ..."

The error message will tell us exactly what's wrong.

### Step 2: Verify Bucket Exists

**Option A: Via Supabase Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Storage** in sidebar
4. Look for a bucket named `proof-of-payments`
5. If it doesn't exist, click **New bucket**:
   - Name: `proof-of-payments`
   - Public: ✅ **CHECK THIS BOX**
   - Click **Create bucket**

**Option B: Via Test Page** (optional)
1. Open `test-storage.html` in your browser
2. Enter your Supabase URL and Anon Key when prompted
3. Click "List All Buckets"
4. Check if `proof-of-payments` appears in the list

## Most Likely Issues & Solutions

### Issue 1: Bucket Doesn't Exist ⭐ (Most Common)
**Error message**: "Bucket not found" or "does not exist"

**Solution**:
1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `proof-of-payments`
4. Public: ✅ Check this
5. Click "Create bucket"
6. Try uploading again

### Issue 2: Bucket Not Public
**Error message**: "Permission denied" or policy-related error

**Solution**:
1. Go to Supabase Dashboard → Storage
2. Find `proof-of-payments` bucket
3. Click on the bucket
4. Check if "Public" badge is showing
5. If not, go to bucket settings and enable public access

### Issue 3: Wrong Bucket Name
**Error message**: Various errors

**Solution**:
1. Check that bucket name is exactly `proof-of-payments` (with hyphen, no spaces)
2. Case-sensitive: must be lowercase
3. If you named it differently, update `src/lib/storage.ts` line 3

## After Creating the Bucket

1. Refresh your app page
2. Try uploading a file again
3. Check the browser console - you should now see:
   - "File uploaded successfully: ..."
   - "Public URL: https://..."
4. The contribution should save successfully

## Still Having Issues?

Check the browser console output and share the exact error message. The improved error handling will now show exactly what's wrong:

```
Attempting to upload file to: stokvels/xxx/members/yyy/1234567890.jpeg
Bucket: proof-of-payments
File size: 12345 bytes
File type: image/jpeg
Supabase storage error: {error details here}
```

This will tell us exactly what needs to be fixed!
