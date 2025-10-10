# PWA Setup Guide for Vikoba

Your Vehicle Stokvel Tracker has been successfully converted to a Progressive Web App (PWA)! 🎉

## What's Been Implemented

### 1. Web App Manifest (`/public/manifest.json`)
- App name, description, and branding
- Theme colors and display mode
- Icon configuration for various sizes
- Categories and screenshots configuration

### 2. Service Worker (`/public/sw.js`)
- **Offline Support**: Cache-first strategy for static assets
- **Network-First API**: Smart caching for Supabase API calls
- **Background Sync**: Offline contribution sync capability
- **Push Notifications**: Ready for future notification features
- **Auto-Updates**: Automatic service worker updates

### 3. PWA Utilities (`/src/utils/pwa.ts`)
- Service worker registration
- Update notifications
- Install prompt handling
- PWA detection utilities

### 4. Install Prompt Component (`/src/components/InstallPrompt.tsx`)
- Beautiful install prompt UI
- User-friendly installation flow
- Dismissible with localStorage tracking

### 5. HTML Meta Tags (`/index.html`)
- Theme color for browser chrome
- Apple mobile web app support
- Mobile-optimized viewport
- Manifest link

## Next Steps

### 1. Generate PWA Icons

You need to create app icons in various sizes. Use one of these methods:

#### Option A: Using PWA Asset Generator (Recommended)
```bash
# Install the tool globally
npm install -g pwa-asset-generator

# Generate icons from your logo (replace 'logo.svg' with your actual logo file)
pwa-asset-generator logo.svg ./public/icons --icon-only --background "#3b82f6" --padding "10%"
```

#### Option B: Online Tools
- [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

Required icon sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### 2. Add Screenshots (Optional but Recommended)

Add app screenshots to improve install experience:

```bash
mkdir -p public/screenshots
# Add desktop-1.png (1280x720)
# Add mobile-1.png (540x720)
```

### 3. Test Your PWA

#### Local Testing
```bash
npm run build
npm run preview
```

Then open Chrome DevTools:
1. Go to Application tab
2. Check "Manifest" section
3. Check "Service Workers" section
4. Use Lighthouse to audit PWA score

#### Production Testing
1. Deploy to production
2. Open in Chrome on mobile
3. Look for "Add to Home Screen" prompt
4. Test offline functionality

### 4. PWA Features to Explore

#### Enable Push Notifications
Update your service worker and add notification logic:
```typescript
import { requestNotificationPermission } from './utils/pwa';

// In your component
const enableNotifications = async () => {
  const permission = await requestNotificationPermission();
  if (permission === 'granted') {
    // Subscribe to push notifications
  }
};
```

#### Background Sync for Offline Contributions
The service worker already has a `sync-contributions` event handler. Integrate with your Supabase logic:

```typescript
// When offline, queue contributions
if (!navigator.onLine) {
  // Store in IndexedDB
  await queueContribution(data);
  // Register sync
  await registration.sync.register('sync-contributions');
}
```

### 5. Optimize Bundle Size

The build shows a large bundle (1.1MB). Consider:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'charts': ['recharts'],
        }
      }
    }
  }
});
```

## PWA Checklist

- [x] Web App Manifest created
- [x] Service Worker implemented
- [x] Meta tags added to HTML
- [x] Install prompt component
- [x] Service worker registration
- [ ] Generate and add app icons
- [ ] Add app screenshots
- [ ] Test on mobile device
- [ ] Achieve 90+ Lighthouse PWA score
- [ ] Configure push notifications (optional)
- [ ] Set up background sync (optional)
- [ ] Optimize bundle size

## Browser Support

Your PWA will work on:
- ✅ Chrome/Edge (Android & Desktop)
- ✅ Safari (iOS 11.3+)
- ✅ Firefox (Android)
- ✅ Samsung Internet

## Deployment Notes

### Vite Configuration
The service worker is only registered in production (`import.meta.env.PROD`). This prevents caching issues during development.

### HTTPS Requirement
PWAs require HTTPS in production. Make sure your hosting supports HTTPS (most modern hosts do by default).

### Caching Strategy
- **Static Assets**: Cache-first (HTML, CSS, JS)
- **API Calls**: Network-first with cache fallback
- **Runtime Cache**: Updated on each successful request

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox (Advanced Service Worker)](https://developer.chrome.com/docs/workbox/)

## Support

If you encounter issues:
1. Check browser console for service worker errors
2. Verify manifest.json is accessible
3. Ensure HTTPS is enabled in production
4. Test in incognito mode to avoid cache issues

Happy PWA building! 🚀
