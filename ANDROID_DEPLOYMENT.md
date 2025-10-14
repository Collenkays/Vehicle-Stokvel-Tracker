# Android Deployment Guide - Vikoba TWA

Complete step-by-step guide to deploy Vikoba as a Trusted Web Activity (TWA) Android app using Bubblewrap.

## 📋 Prerequisites Checklist

### 1. Development Tools
- [ ] **Node.js 14+** installed (check: `node --version`)
- [ ] **npm** installed (check: `npm --version`)
- [ ] **JDK 8+** installed (check: `java -version`)
  - Download: https://adoptium.net/
- [ ] **Android SDK** (auto-installed by Bubblewrap on first build)
- [ ] **Bubblewrap CLI** installed globally
  ```bash
  npm install -g @bubblewrap/cli
  ```

### 2. PWA Requirements
- [x] PWA deployed at: https://www.vikoba.xyz/
- [x] Valid manifest.json at: https://www.vikoba.xyz/manifest.json
- [x] Icons (512x512 maskable) available
- [ ] Service Worker registered and active
- [ ] HTTPS enabled (required for TWA)
- [ ] PWA installable in browser

### 3. Google Play Console
- [ ] Google Play Developer account ($25 one-time fee)
  - Sign up: https://play.google.com/console/signup
- [ ] App created in Play Console
- [ ] App content rating completed
- [ ] Privacy policy URL provided
- [ ] Store listing (screenshots, description) prepared

## 🚀 Initial Setup

### Step 1: Install Bubblewrap CLI
```bash
npm install -g @bubblewrap/cli
bubblewrap --version
```

### Step 2: Validate Your PWA
```bash
npm run android:validate
```

This checks:
- Manifest validity
- Service Worker presence
- HTTPS configuration
- Icon requirements

### Step 3: Initialize TWA Project
```bash
npm run android:init
```

**Configuration prompts:**
- Domain: `www.vikoba.xyz`
- Package name: `xyz.vikoba.app`
- App name: `Vikoba - Vehicle Stokvel Tracker`
- Start URL: `/`
- Display mode: `standalone` (already configured)

**Note:** This creates/updates `twa-manifest.json` (already pre-configured in your repo)

## 🔑 Keystore Generation

### Step 1: Generate Release Keystore
```bash
keytool -genkey -v \
  -keystore android.keystore \
  -alias android \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STRONG_PASSWORD \
  -keypass YOUR_STRONG_PASSWORD
```

**Important prompts to answer:**
- Name: Your name or company name
- Organizational unit: Development
- Organization: Vikoba
- City: Your city
- State: Your province
- Country code: ZA

### Step 2: Extract SHA-256 Fingerprint
```bash
keytool -list -v -keystore android.keystore -alias android -storepass YOUR_PASSWORD
```

Copy the **SHA256 fingerprint** (format: `AA:BB:CC:DD:...`)

### Step 3: Update Digital Asset Links
1. Open `public/.well-known/assetlinks.json`
2. Replace `REPLACE_WITH_YOUR_RELEASE_KEY_SHA256_FINGERPRINT` with your SHA-256 fingerprint
3. Remove colons from fingerprint (e.g., `AA:BB:CC` → `AABBCC`)
4. Deploy updated file to production

### Step 4: Verify Asset Links
After deploying, verify at:
```
https://www.vikoba.xyz/.well-known/assetlinks.json
```

Use Google's Asset Links Tester:
https://developers.google.com/digital-asset-links/tools/generator

## 🏗️ Build Process

### Build Debug APK (Local Testing)
```bash
npm run android:build
```

**Output:** `app-release-signed.apk` (despite name, it's signed with your keystore)

### Build Release Bundle (Play Store)
```bash
npm run android:build:bundle
```

**Output:** `app-release-bundle.aab` (Android App Bundle for Play Store)

### Install on Device
```bash
# Connect Android device via USB (enable USB debugging)
adb devices

# Install APK
npm run android:install
```

## 📱 Testing Checklist

### Local Testing
- [ ] App installs successfully on device
- [ ] App icon appears in launcher
- [ ] App opens without Chrome URL bar
- [ ] PWA content loads correctly
- [ ] Navigation works smoothly
- [ ] Authentication flows work
- [ ] Offline functionality works (if implemented)
- [ ] Deep links open in app (not browser)
- [ ] Share targets work (if implemented)

### Digital Asset Links Verification
- [ ] Asset links file accessible at `/.well-known/assetlinks.json`
- [ ] SHA-256 fingerprint matches keystore
- [ ] Package name matches `twa-manifest.json`
- [ ] App opens URLs without "Open in Chrome?" prompt

## 🚢 Play Store Deployment

### Step 1: Prepare Store Listing

**Required assets:**
- App icon: 512x512 PNG (already have in `/public/icons/`)
- Feature graphic: 1024x500 PNG
- Screenshots:
  - Phone: 2-8 screenshots (320-3840px width)
  - Tablet: 2-8 screenshots (optional)
- Short description: Max 80 characters
- Full description: Max 4000 characters
- Category: Finance (already in manifest)

### Step 2: Upload to Play Console

1. Go to https://play.google.com/console
2. Select your app
3. Navigate to **Production > Create new release**
4. Upload `app-release-bundle.aab`
5. Fill in release notes (What's new in this version)
6. Review and roll out

### Step 3: Content Rating
1. Complete questionnaire in Play Console
2. Categories: Finance, User-generated content
3. Apply ratings to app

### Step 4: Submit for Review
- Review all sections (green checkmarks required)
- Submit for review (typically 1-3 days)

## 🔄 Update Process

### Step 1: Update Version
Edit `twa-manifest.json`:
```json
{
  "appVersionName": "1.0.1",  // Semantic version
  "appVersionCode": 2         // Integer, increment each release
}
```

### Step 2: Update PWA
Run `npm run android:update` to sync manifest changes from web app.

### Step 3: Rebuild & Deploy
```bash
npm run android:build:bundle
# Upload new .aab to Play Console
```

## 🛠️ Troubleshooting

### Issue: "App not verified" warning
**Solution:**
- Verify asset links file is deployed and accessible
- Check SHA-256 fingerprint matches
- Wait 24-48 hours for Google verification

### Issue: Build fails with "Android SDK not found"
**Solution:**
```bash
# Bubblewrap will prompt to install SDK on first build
bubblewrap doctor
```

### Issue: APK installs but opens in Chrome Custom Tab
**Solution:**
- Asset links not configured correctly
- SHA-256 fingerprint mismatch
- Domain verification pending

### Issue: Service Worker errors
**Solution:**
- Ensure service worker is registered in `main.tsx`
- Check network tab for SW registration
- Verify HTTPS in production

## 📊 Performance Tips

### Optimize PWA for TWA
- **Enable notifications:** Set `enableNotifications: true` in `twa-manifest.json`
- **Splash screen:** Use `splashScreenFadeOutDuration: 300` for smooth transitions
- **Navigation bar:** Match theme colors to app design
- **Shortcuts:** Add app shortcuts in `twa-manifest.json`

### Monitor Performance
- Use Chrome DevTools for PWA auditing
- Run Lighthouse tests regularly
- Monitor Core Web Vitals
- Test on low-end devices

## 🔐 Security Best Practices

1. **Never commit keystore to git** (already in .gitignore)
2. **Store keystore password securely** (use environment variables in CI/CD)
3. **Backup keystore** (losing it means you can't update your app!)
4. **Use Play App Signing** (recommended for key management)
5. **Enable obfuscation** for production builds

## 📚 Resources

- **Bubblewrap Documentation:** https://github.com/GoogleChromeLabs/bubblewrap
- **TWA Guide:** https://developer.chrome.com/docs/android/trusted-web-activity/
- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **Asset Links Guide:** https://developers.google.com/digital-asset-links/v1/getting-started

## 🎯 Quick Reference Commands

```bash
# Validate PWA
npm run android:validate

# Initialize project
npm run android:init

# Build debug APK
npm run android:build

# Build release bundle
npm run android:build:bundle

# Install on device
npm run android:install

# Update from web manifest
npm run android:update

# Check Bubblewrap health
bubblewrap doctor
```

## 📝 Pre-Deployment Checklist

Before submitting to Play Store:

- [ ] PWA passes Lighthouse PWA audit (90+ score)
- [ ] Service Worker registered and functional
- [ ] Asset links deployed and verified
- [ ] Keystore backed up securely
- [ ] All store assets prepared (icons, screenshots, descriptions)
- [ ] Privacy policy published and linked
- [ ] Content rating completed
- [ ] App tested on multiple Android versions (min SDK 19 = Android 4.4+)
- [ ] Deep linking tested
- [ ] Payment flows tested (if applicable)
- [ ] Error tracking configured (Sentry, Firebase, etc.)

## 🚀 Post-Launch Tasks

- [ ] Monitor crash reports in Play Console
- [ ] Set up automated builds (GitHub Actions)
- [ ] Configure staged rollout (10% → 50% → 100%)
- [ ] Enable pre-launch reports in Play Console
- [ ] Respond to user reviews
- [ ] Track installation metrics
- [ ] Plan update schedule

---

**Need help?** Check the troubleshooting section or visit:
- Bubblewrap Issues: https://github.com/GoogleChromeLabs/bubblewrap/issues
- PWA Support: https://web.dev/progressive-web-apps/
