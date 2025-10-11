# Google Authentication Setup Guide

## Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Configure the OAuth consent screen if prompted:
     - User Type: External (for testing)
     - App name: "Vehicle Stokvel Tracker" (or "Vikoba")
     - User support email: Your email
     - Developer contact: Your email
   - Application type: "Web application"
   - Name: "Stokvel Tracker Web"
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for local development)
     - Your production domain (when deployed)
   - Authorized redirect URIs:
     - `https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback`
     - Replace `YOUR_SUPABASE_PROJECT` with your actual Supabase project reference

5. Copy the **Client ID** and **Client Secret**

## Step 2: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" in the list and click to configure
4. Enable "Sign in with Google"
5. Fill in the configuration:

   **Client ID**: Paste your Google OAuth Client ID
   - **IMPORTANT**: Remove any spaces from the Client ID
   - Example format: `123456789-abc123xyz.apps.googleusercontent.com`

   **Client Secret**: Paste your Google OAuth Client Secret
   - This should be a long string of characters

   **Callback URL**: This should be auto-filled
   - Format: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

6. **Skip nonce checks**: Leave this OFF (more secure)
7. **Allow users without an email**: Leave this OFF (we want email addresses)
8. Click "Save"

## Step 3: Add Environment Variables (Optional)

If you need to reference these in your app, add to `.env.local`:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

**Note**: The client secret should NEVER be exposed in frontend code. Supabase handles this securely on the backend.

## Step 4: Update Your Code

The following changes have been made to support Google authentication:

### 1. AuthContext (`src/contexts/AuthContext.tsx`)
- Added `signInWithGoogle()` method
- Supports OAuth provider flow

### 2. Login Page (`src/pages/Login.tsx`)
- Added "Continue with Google" button
- Professional styling with Google branding

## Testing the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the login page
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authorizing, you'll be redirected back to your app and automatically signed in

## Troubleshooting

### "Client IDs should not contain spaces"
- **Solution**: Copy the Client ID carefully without any extra spaces
- Verify by pasting into a text editor first
- The format should be: `123456789-abc123xyz.apps.googleusercontent.com`

### "Redirect URI mismatch"
- **Solution**: Ensure the redirect URI in Google Console exactly matches Supabase's callback URL
- Format: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

### "This app isn't verified"
- **Solution**: During development, click "Advanced" > "Go to [App Name] (unsafe)"
- For production, submit your app for Google verification

### "Access blocked: Authorization Error"
- **Solution**: Make sure Google+ API is enabled in Google Cloud Console
- Check that your OAuth consent screen is properly configured

### Users can sign in but data doesn't save
- **Solution**: Check your Supabase RLS policies
- Ensure the `auth.uid()` function is used correctly in policies
- Users table should auto-create on first sign-in via database trigger

## Security Best Practices

1. **Never commit** `.env.local` to version control
2. **Never expose** the Client Secret in frontend code
3. **Always use HTTPS** in production
4. **Verify email addresses** for critical operations
5. **Implement rate limiting** for auth endpoints
6. **Monitor OAuth usage** in Google Cloud Console

## Production Deployment Checklist

- [ ] Update authorized origins in Google Console with production domain
- [ ] Update redirect URIs with production Supabase URL
- [ ] Submit app for Google verification (if needed)
- [ ] Test OAuth flow in production environment
- [ ] Set up monitoring for auth failures
- [ ] Configure session duration in Supabase settings
