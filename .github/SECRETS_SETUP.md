# GitHub Secrets Setup Guide

This guide explains how to configure GitHub Secrets for automated Android builds.

## Required Secrets

### 1. `ANDROID_KEYSTORE_BASE64`
**Purpose:** Encrypted keystore file for signing Android app

**How to create:**
```bash
# After generating your android.keystore (see ANDROID_DEPLOYMENT.md)
base64 android.keystore > keystore.base64.txt
```

**How to add to GitHub:**
1. Go to your repository on GitHub
2. Navigate to **Settings > Secrets and variables > Actions**
3. Click **New repository secret**
4. Name: `ANDROID_KEYSTORE_BASE64`
5. Value: Paste the entire contents of `keystore.base64.txt`
6. Click **Add secret**

### 2. `ANDROID_KEYSTORE_PASSWORD`
**Purpose:** Password for the Android keystore

**How to add to GitHub:**
1. Go to **Settings > Secrets and variables > Actions**
2. Click **New repository secret**
3. Name: `ANDROID_KEYSTORE_PASSWORD`
4. Value: Your keystore password (the one you used when running `keytool -genkey`)
5. Click **Add secret**

### 3. `PLAY_STORE_CONFIG_JSON` (Optional - for automated Play Store deployment)
**Purpose:** Service account credentials for Google Play Console API

**How to create:**
1. Go to [Google Play Console](https://play.google.com/console)
2. Navigate to **Setup > API access**
3. Click **Create new service account**
4. Follow the Google Cloud Console link
5. Create a service account with these permissions:
   - Name: `github-actions-deploy`
   - Role: **Service Account User**
6. Create a JSON key for the service account
7. Download the JSON key file
8. In Google Play Console, grant access to the service account:
   - **Releases > Release management** (for uploading builds)
   - Set to **Internal testing** track

**How to add to GitHub:**
1. Go to **Settings > Secrets and variables > Actions**
2. Click **New repository secret**
3. Name: `PLAY_STORE_CONFIG_JSON`
4. Value: Paste the entire contents of the downloaded JSON key file
5. Click **Add secret**

## Verification

After adding secrets, verify they're configured:

1. Go to **Settings > Secrets and variables > Actions**
2. You should see:
   - `ANDROID_KEYSTORE_BASE64`
   - `ANDROID_KEYSTORE_PASSWORD`
   - `PLAY_STORE_CONFIG_JSON` (if using automated deployment)

## Workflow Triggers

The GitHub Actions workflow will run on:

### Automatic Triggers
- **Push to main/master:** Builds release AAB
- **Pull requests:** Builds debug APK
- **Version tags (v*):** Builds release AAB + creates GitHub release + deploys to Play Store

### Manual Trigger
1. Go to **Actions** tab
2. Select **Build Android TWA** workflow
3. Click **Run workflow**
4. Choose release type (debug/release)

## Testing the Workflow

### Test Debug Build (PR)
```bash
git checkout -b test-android-build
git push origin test-android-build
# Create a pull request on GitHub
```

### Test Release Build (Tag)
```bash
git tag v1.0.0
git push origin v1.0.0
# Workflow will build and create a draft release
```

## Security Best Practices

1. **Never commit keystore files** - Always use base64-encoded secrets
2. **Rotate credentials annually** - Update service account keys regularly
3. **Use environment protection** - Set up deployment environments in GitHub
4. **Enable required reviews** - Require approval before deployments
5. **Monitor workflow logs** - Check for credential leaks in logs

## Troubleshooting

### Workflow fails at "Decode keystore"
- Verify `ANDROID_KEYSTORE_BASE64` is correctly encoded
- Re-encode with `base64 android.keystore` (no line breaks)

### Workflow fails at "Build Android App Bundle"
- Check `ANDROID_KEYSTORE_PASSWORD` matches your keystore
- Verify keystore alias is `android` in `twa-manifest.json`

### Play Store deployment fails
- Verify service account has correct permissions
- Check package name matches (`xyz.vikoba.app`)
- Ensure app is created in Play Console

## Environment Variables (Optional)

For additional configuration, you can add these as repository variables:

1. Go to **Settings > Secrets and variables > Actions > Variables tab**
2. Add variables:
   - `ANDROID_VERSION_NAME`: `1.0.0`
   - `ANDROID_VERSION_CODE`: `1`

## Workflow Outputs

### Debug Builds (Pull Requests)
- **Artifact:** `vikoba-debug-apk`
- **Location:** Actions > Workflow run > Artifacts section
- **Retention:** 30 days

### Release Builds (Tags)
- **Artifact:** `vikoba-release-bundle`
- **Location:** Actions > Workflow run > Artifacts section
- **Retention:** 90 days
- **GitHub Release:** Draft release created with APK + AAB attached

### Play Store Deployment (Tags)
- **Track:** Internal Testing
- **Rollout:** 100%
- **Review:** Automatic (after initial app approval)

## Next Steps

1. Generate your Android keystore (see `ANDROID_DEPLOYMENT.md`)
2. Encode and add secrets to GitHub
3. Create a test tag to verify workflow
4. Monitor workflow execution in Actions tab
5. Download artifacts and test on device

---

**Need help?** Check the [GitHub Actions documentation](https://docs.github.com/en/actions) or open an issue.
