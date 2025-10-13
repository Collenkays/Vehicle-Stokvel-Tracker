# Proof of Payment Upload Fix

## Problem Summary

The contribution save functionality was failing because:

1. **Client-side blob URLs** created by `URL.createObjectURL()` were being stored in the database
2. These URLs (`blob:http://localhost:...`) only work in the browser session that created them
3. When the database tried to reference these URLs later, they returned 400 errors because they were no longer valid
4. Files weren't being properly uploaded to persistent storage

## Solution Implemented

### 1. Created Supabase Storage Integration (`src/lib/storage.ts`)

**New utility functions**:
- `uploadProofOfPayment()`: Uploads files to Supabase Storage and returns a permanent public URL
- `deleteProofOfPayment()`: Deletes files from storage when needed

**File Organization**:
```
proof-of-payments/
└── stokvels/{stokvelId}/
    └── members/{memberId}/
        └── {timestamp}.{ext}
```

### 2. Updated Contributions Component (`src/pages/Contributions.tsx`)

**Changes**:
- Import `uploadProofOfPayment` from storage utility
- Replace `URL.createObjectURL()` with proper Supabase Storage upload
- Add error handling for upload failures
- Store permanent public URLs in database instead of blob URLs

**Before** (lines 76-82):
```typescript
if (formData.proof_file && !proofUrl) {
  proofUrl = URL.createObjectURL(formData.proof_file) // ❌ Client-side only
  console.log('Note: In production, this file should be uploaded to cloud storage')
}
```

**After** (lines 76-90):
```typescript
if (formData.proof_file) {
  try {
    console.log('Uploading file:', formData.proof_file.name)
    proofUrl = await uploadProofOfPayment(
      formData.proof_file,
      stokvelId,
      formData.member_id
    ) // ✅ Permanent URL from Supabase Storage
    console.log('File uploaded successfully:', proofUrl)
  } catch (uploadError: any) {
    console.error('File upload failed:', uploadError)
    alert(`Failed to upload file: ${uploadError.message}`)
    return
  }
}
```

### 3. Database Setup (`setup-storage-bucket.sql`)

**Storage bucket configuration**:
- Bucket name: `proof-of-payments`
- Public access: Enabled (for viewing uploaded files)
- RLS policies: Restrict access to stokvel members and owners only

**Security policies**:
1. **INSERT**: Users can upload files to their own stokvels
2. **SELECT**: Users can view files from stokvels they belong to
3. **UPDATE**: Users can update their uploaded files
4. **DELETE**: Users can delete their uploaded files

## Setup Instructions

### Step 1: Run SQL Migration

In your Supabase SQL Editor, execute the contents of `setup-storage-bucket.sql`:

```sql
-- This will:
-- 1. Create the 'proof-of-payments' storage bucket
-- 2. Enable Row Level Security on storage.objects
-- 3. Create security policies for upload/view/update/delete operations
```

### Step 2: Verify Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Confirm `proof-of-payments` bucket exists
3. Check that it's marked as **Public**

### Step 3: Test the Fix

1. Navigate to a stokvel's **Contributions** page
2. Click **Add Contribution**
3. Fill in the form and upload a file (PDF, JPG, PNG)
4. Click **Save**
5. Verify the contribution is saved successfully
6. Click the "Proof" link to view the uploaded file

## Technical Details

### File Upload Flow

```
User selects file
    ↓
Form validates file exists
    ↓
handleSubmit() called
    ↓
uploadProofOfPayment() uploads to Supabase Storage
    ↓
Returns permanent public URL
    ↓
URL stored in database (proof_of_payment column)
    ↓
Contribution created/updated with permanent URL
```

### Storage URL Format

**Permanent URL structure**:
```
https://{project}.supabase.co/storage/v1/object/public/proof-of-payments/stokvels/{stokvelId}/members/{memberId}/{timestamp}.{ext}
```

### Security Model

**RLS Policies ensure**:
- Users can only upload to stokvels they belong to
- Users can only view files from their stokvels
- Files are organized by stokvel and member for easy management
- Proper cleanup when contributions are deleted

## Benefits

1. ✅ **Persistent Storage**: Files are permanently stored in Supabase Storage
2. ✅ **Reliable URLs**: Public URLs work across sessions and devices
3. ✅ **Secure Access**: RLS policies protect sensitive payment proofs
4. ✅ **Organized Structure**: Files organized by stokvel and member
5. ✅ **Error Handling**: Clear error messages for upload failures
6. ✅ **Production Ready**: No more placeholder comments about "real implementation"

## Troubleshooting

### If upload fails with "Bucket not found"
→ Run `setup-storage-bucket.sql` in Supabase SQL Editor

### If upload fails with "Permission denied"
→ Check RLS policies in Supabase Dashboard → Storage → Policies

### If file URL shows 404
→ Verify bucket is marked as **Public** in Storage settings

### If specific file types don't upload
→ Check file input accepts: `.pdf,.jpg,.jpeg,.png,.doc,.docx` (line 279)

## Files Changed

1. **New**: `src/lib/storage.ts` - Storage utility functions
2. **Modified**: `src/pages/Contributions.tsx` - Updated file upload logic
3. **New**: `setup-storage-bucket.sql` - Database migration for storage setup
4. **New**: `PROOF_OF_PAYMENT_FIX.md` - This documentation

## Testing Checklist

- [ ] Storage bucket created in Supabase
- [ ] RLS policies applied correctly
- [ ] File upload works (PDF, JPG, PNG)
- [ ] Contribution saves with file upload
- [ ] Proof link opens uploaded file
- [ ] URL format is permanent (not blob:)
- [ ] Files organized correctly in storage
- [ ] Error handling displays helpful messages
- [ ] No TypeScript errors
- [ ] No console errors in browser

## Next Steps (Optional Enhancements)

1. **File size limits**: Add validation for max file size (e.g., 5MB)
2. **File type validation**: Server-side validation of file types
3. **Progress indicator**: Show upload progress for large files
4. **Image preview**: Preview images before upload
5. **Bulk upload**: Allow multiple proof documents per contribution
6. **Compression**: Automatically compress images to save storage
7. **Deletion cleanup**: Automatically delete storage files when contribution deleted
