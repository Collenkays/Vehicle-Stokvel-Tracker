import { supabase } from './supabase'

const STORAGE_BUCKET = 'proof-of-payments'

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param stokvelId - The stokvel ID for organizing files
 * @param memberId - The member ID for organizing files
 * @returns The public URL of the uploaded file
 */
export async function uploadProofOfPayment(
  file: File,
  stokvelId: string,
  memberId: string
): Promise<string> {
  try {
    // Create a unique file path: stokvels/{stokvelId}/members/{memberId}/{timestamp}-{filename}
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}.${fileExt}`
    const filePath = `stokvels/${stokvelId}/members/${memberId}/${fileName}`

    console.log('Attempting to upload file to:', filePath)
    console.log('Bucket:', STORAGE_BUCKET)
    console.log('File size:', file.size, 'bytes')
    console.log('File type:', file.type)

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Supabase storage error:', error)

      // Provide specific error messages
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        throw new Error(
          `Storage bucket "${STORAGE_BUCKET}" does not exist. Please create it in Supabase Dashboard:\n` +
          `1. Go to Storage section\n` +
          `2. Click "New bucket"\n` +
          `3. Name: "${STORAGE_BUCKET}"\n` +
          `4. Public: ✓ Check this box\n` +
          `5. Click "Create bucket"`
        )
      } else if (error.message.includes('policy')) {
        throw new Error(
          'Permission denied. Please check storage bucket policies in Supabase Dashboard.'
        )
      } else {
        throw new Error(error.message || 'Unknown storage error')
      }
    }

    console.log('File uploaded successfully:', data.path)

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path)

    console.log('Public URL:', publicUrlData.publicUrl)
    return publicUrlData.publicUrl
  } catch (error: any) {
    console.error('Error uploading file:', error)
    throw error
  }
}

/**
 * Delete a file from Supabase Storage
 * @param fileUrl - The public URL of the file to delete
 */
export async function deleteProofOfPayment(fileUrl: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split(`/${STORAGE_BUCKET}/`)

    if (pathParts.length < 2) {
      console.warn('Invalid file URL format:', fileUrl)
      return
    }

    const filePath = pathParts[1]

    // Delete the file from Supabase Storage
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    // Don't throw error for deletion failures - it's not critical
  }
}
