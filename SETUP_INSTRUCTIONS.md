# Quick Setup Instructions for Proof of Payment Upload

## Step 1: Create Storage Bucket (Supabase Dashboard)

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Enter the following details:
   - **Name**: `proof-of-payments`
   - **Public bucket**: ✅ **Check this box** (allows viewing uploaded files)
5. Click **Create bucket**

## Step 2: Configure Storage Policies (Optional - SQL Editor)

If you want to add access control policies, run `setup-storage-simple.sql` in the SQL Editor:

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New query**
3. Copy and paste contents of `setup-storage-simple.sql`
4. Click **Run**

**Note**: The policies in the SQL file allow:
- Authenticated users to upload files
- Anyone to view files (public bucket)
- Authenticated users to update/delete their files

If you skip this step, the default public bucket permissions will work fine.

## Step 3: Test the Fix

1. Go to your app: `http://localhost:5173`
2. Navigate to a stokvel's **Contributions** page
3. Click **Add Contribution**
4. Fill in the form
5. Upload a file (PDF, JPG, PNG)
6. Click **Save**

### Expected Result ✅
- Contribution saves successfully
- No 400 errors in console
- "Proof" link appears and opens the uploaded file
- File URL format: `https://[your-project].supabase.co/storage/v1/object/public/proof-of-payments/...`

### If it fails ❌
- Check console for errors
- Verify bucket name is exactly `proof-of-payments`
- Verify bucket is marked as **Public**
- Check that you're logged in (authenticated)

## Quick Verification

Run this in your browser console on the contributions page:

```javascript
// This should log your Supabase URL
console.log(import.meta.env.VITE_SUPABASE_URL)

// This should show the storage is accessible
fetch(`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/bucket/proof-of-payments`)
  .then(r => r.json())
  .then(console.log)
```

## Troubleshooting

### Error: "Bucket not found"
→ Create the bucket in Supabase Dashboard (Step 1)

### Error: "Failed to upload file"
→ Check that bucket name is `proof-of-payments` (exact match)
→ Verify bucket is marked as **Public**

### Uploaded file shows 404
→ Confirm bucket is **Public** in Storage settings

### Upload works but URL is wrong
→ Check that file uploaded to: `stokvels/{stokvelId}/members/{memberId}/`

## That's it!

The simplest setup is just creating the public bucket in the Supabase Dashboard. The policies are optional for additional security.
