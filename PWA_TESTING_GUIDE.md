# PWA Testing Guide - Vikoba

## ✅ PWA Implementation Checklist

### What Was Fixed:
1. ✅ Generated all required PWA icons (72x72 to 512x512)
2. ✅ Updated manifest.json with proper icon definitions
3. ✅ Enabled service worker in development mode
4. ✅ Added favicon and Apple touch icons
5. ✅ Service worker implements caching strategies

## 🧪 Testing the PWA Install Prompt

### Desktop (Chrome/Edge)

#### Option 1: Using Chrome DevTools
1. Open the app in Chrome: `http://localhost:5173`
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to **Application** tab → **Manifest** section
4. Check for any errors (should show no errors)
5. Click **"Add to homescreen"** button in DevTools
6. You should see the install prompt

#### Option 2: Using Address Bar
1. Open the app in Chrome: `http://localhost:5173`
2. Look for the **install icon** (⊕) in the address bar
3. Click it to see the install prompt
4. Click **"Install"** to add the app

#### Option 3: Using Chrome Menu
1. Open Chrome menu (⋮)
2. Look for **"Install Vikoba..."** or **"Create shortcut..."**
3. Click to install

### Mobile (Android)

#### Chrome on Android
1. Open the app in Chrome
2. Wait for the **"Add Vikoba to Home screen"** banner at the bottom
3. Or tap Chrome menu (⋮) → **"Add to Home screen"**
4. Follow the prompts to install

### Mobile (iOS/Safari)

**Note:** iOS doesn't support the `beforeinstallprompt` event, so the custom InstallPrompt component won't show.

#### Manual Installation on iOS:
1. Open the app in Safari
2. Tap the **Share** button (box with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Customize the name if desired
5. Tap **"Add"**

## 🔍 Verification Steps

### 1. Check Service Worker Registration
Open DevTools → Application → Service Workers
- Should show `sw.js` as registered
- Status should be "activated and running"

### 2. Check Manifest
Open DevTools → Application → Manifest
- Name: "Vikoba - Vehicle Stokvel Tracker"
- Short name: "Vikoba"
- Start URL: "/"
- Theme color: #3b82f6
- Icons: Should show 8 icons (72x72 to 512x512)

### 3. Check Installability
Open DevTools → Console
- Run: `window.matchMedia('(display-mode: standalone)').matches`
- Should return `false` before install, `true` after install

### 4. Test Offline Capability
1. Install the app
2. Open it as a standalone app
3. Open DevTools → Network tab
4. Set throttling to **"Offline"**
5. Refresh the page
6. The app should still load (from cache)

## 🐛 Troubleshooting

### Install Prompt Not Showing?

#### Check Requirements:
- ✅ HTTPS (or localhost for development)
- ✅ Valid manifest.json with icons
- ✅ Registered service worker
- ✅ Service worker must have a fetch event handler
- ✅ Not already installed

#### Clear and Reset:
```bash
# In Chrome DevTools
1. Application → Clear storage → Clear site data
2. Application → Service Workers → Unregister
3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Check Browser Console:
Look for errors related to:
- Manifest parsing errors
- Service worker registration failures
- Icon loading issues

### Verify Icon Files:
```bash
ls -la public/icons/
# Should show 8 PNG files and 8 SVG files
```

### Test Manifest Directly:
Visit: `http://localhost:5173/manifest.json`
- Should return valid JSON with icons array populated

## 📱 Platform-Specific Notes

### Chrome (Desktop & Android)
- Full PWA support with beforeinstallprompt
- Custom install UI works perfectly
- Shows install button in address bar

### Edge (Desktop)
- Full PWA support (Chromium-based)
- Similar to Chrome experience

### Safari (iOS)
- Limited PWA support
- No beforeinstallprompt event
- Manual installation required
- App runs in standalone mode once installed

### Firefox (Desktop)
- Limited PWA support
- No automatic install prompt
- Can manually add via: Settings → Install site

## 🚀 Production Deployment

### For PWA to work in production:
1. **HTTPS is required** (localhost is exempt)
2. Deploy to a hosting service that supports HTTPS:
   - Vercel (recommended)
   - Netlify
   - Firebase Hosting
   - GitHub Pages

### Deploy to Vercel:
```bash
npm run build
npx vercel --prod
```

### After Deployment:
1. Visit your production URL
2. Test install prompt on desktop Chrome
3. Test on mobile devices
4. Verify offline functionality

## 📊 PWA Audit

### Run Lighthouse Audit:
1. Open DevTools → Lighthouse tab
2. Select "Progressive Web App" category
3. Click "Analyze page load"
4. Should score 90+ for PWA

### Check PWA Criteria:
- ✅ Registers a service worker
- ✅ Responds with 200 when offline
- ✅ Has a web app manifest
- ✅ Has icons for all sizes
- ✅ Configured for a custom splash screen
- ✅ Sets theme color
- ✅ Content sized correctly for viewport
- ✅ Has a `<meta name="viewport">` tag

## 🎯 Expected Behavior

### Before Installation:
- Custom InstallPrompt banner appears at bottom
- Install icon visible in Chrome address bar
- App runs in browser tab

### After Installation:
- App opens in standalone window (no browser UI)
- Has its own icon in app launcher/dock
- Works offline for cached pages
- InstallPrompt banner no longer shows
- Can be uninstalled like native app

## 📝 Notes

- The InstallPrompt component will only show once per user (unless they clear localStorage)
- Service worker caching may cause updates to not appear immediately
- Use "Update on reload" in DevTools during development
- Icons use blue gradient with car design matching app theme
