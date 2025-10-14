# 🤖 Android App - Quick Start Guide

This is a **quick reference** for building Vikoba as an Android app using Bubblewrap (Trusted Web Activity).

📚 **For detailed instructions, see:** [`ANDROID_DEPLOYMENT.md`](./ANDROID_DEPLOYMENT.md)

## ⚡ Quick Commands

```bash
# Validate your PWA
npm run android:validate

# Initialize Bubblewrap project (first time only)
npm run android:init

# Build debug APK for testing
npm run android:build

# Build release bundle for Play Store
npm run android:build:bundle

# Install on connected Android device
npm run android:install

# Update TWA from web manifest
npm run android:update
```

## 🚀 First-Time Setup (5 Steps)

### 1. Install Bubblewrap CLI
```bash
npm install -g @bubblewrap/cli
```

### 2. Generate Keystore
```bash
keytool -genkey -v \
  -keystore android.keystore \
  -alias android \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### 3. Get SHA-256 Fingerprint
```bash
keytool -list -v -keystore android.keystore -alias android
```

### 4. Update Asset Links
1. Copy SHA-256 fingerprint (remove colons)
2. Edit `public/.well-known/assetlinks.json`
3. Replace `REPLACE_WITH_YOUR_RELEASE_KEY_SHA256_FINGERPRINT`
4. Deploy to production

### 5. Build & Test
```bash
npm run android:build
adb install app-release-signed.apk
```

## 📋 Prerequisites

- [x] Node.js 14+
- [ ] JDK 8+ ([Download](https://adoptium.net/))
- [ ] Bubblewrap CLI (`npm install -g @bubblewrap/cli`)
- [x] PWA deployed at https://www.vikoba.xyz/
- [ ] Android device with USB debugging enabled

## 🎯 What You Get

| Feature | Status |
|---------|--------|
| Play Store distribution | ✅ |
| No URL bar | ✅ |
| Native app appearance | ✅ |
| Push notifications | ✅ |
| Offline functionality | ✅ (if service worker configured) |
| Deep linking | ✅ |
| App shortcuts | ✅ |

## 🔧 Configuration Files

- **`twa-manifest.json`** - TWA configuration (package name, colors, URLs)
- **`public/.well-known/assetlinks.json`** - Domain verification for Android
- **`.github/workflows/android-build.yml`** - Automated builds via GitHub Actions

## 📦 Build Outputs

- **`app-release-signed.apk`** - Debug APK for local testing
- **`app-release-bundle.aab`** - Release bundle for Play Store submission

## 🛠️ Troubleshooting

### "App not verified" warning
- Check asset links file is deployed
- Verify SHA-256 fingerprint matches
- Wait 24-48 hours for verification

### Build fails
```bash
bubblewrap doctor  # Diagnoses common issues
```

### App opens in Chrome instead of standalone
- Asset links misconfigured
- Domain verification pending

## 📚 Full Documentation

- **[ANDROID_DEPLOYMENT.md](./ANDROID_DEPLOYMENT.md)** - Complete deployment guide
- **[.github/SECRETS_SETUP.md](./.github/SECRETS_SETUP.md)** - CI/CD secrets configuration

## 🤝 Need Help?

- Check [Bubblewrap docs](https://github.com/GoogleChromeLabs/bubblewrap)
- Review [TWA guide](https://developer.chrome.com/docs/android/trusted-web-activity/)
- Open an issue on GitHub

---

**Made with ❤️ using Bubblewrap**
