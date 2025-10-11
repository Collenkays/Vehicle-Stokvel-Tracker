# Google AdSense Integration Guide

## ✅ Current Setup

Your app is already configured with Google AdSense:
- **Publisher ID**: `ca-pub-5581720231280472`
- **Script**: Loaded in `index.html`
- **Components**: `AdBanner` component created with aesthetic integration

## 📍 Ad Placements

### Dashboard Page
- **Above Charts**: Responsive display ad between alerts and chart section
- Blends seamlessly with card-based design
- Non-intrusive placement

### Ad Component Features
- ✅ Matches app aesthetic (gray-50 bg, card-style borders)
- ✅ Subtle "Advertisement" label for transparency
- ✅ Responsive sizing
- ✅ TypeScript support
- ✅ Multiple format options (display, horizontal, rectangle)

## 🚀 Next Steps: Create Ad Units

### 1. Log into Google AdSense
Visit: https://adsense.google.com

### 2. Create Ad Units
Navigate to: **Ads** → **By ad unit** → **Display ads**

#### Recommended Ad Units to Create:

**Ad Unit 1: Dashboard Display Ad**
- Name: `Vikoba Dashboard Display`
- Type: Display ad
- Size: Responsive
- Copy the **Ad Slot ID** (format: `1234567890`)

**Ad Unit 2: Content Page Display** (Optional)
- Name: `Vikoba Content Display`
- Type: Display ad
- Size: Responsive

**Ad Unit 3: Horizontal Banner** (Optional)
- Name: `Vikoba Horizontal Banner`
- Type: Display ad
- Size: Horizontal banner

### 3. Update Ad Slot IDs

Replace placeholder slot IDs in your code:

**File**: `src/pages/Dashboard.tsx`

```tsx
// Line 214: Replace YOUR_AD_SLOT_1 with actual slot ID
<AdDisplay slot="1234567890" />
```

## 📱 Adding Ads to Other Pages

### Example: Add to Reports Page

```tsx
// In src/pages/Reports.tsx
import { AdHorizontalBanner } from '../components/AdBanner'

export const Reports = () => {
  return (
    <div className="space-y-6">
      {/* Your content */}

      {/* Ad placement at bottom */}
      <AdHorizontalBanner slot="YOUR_SLOT_ID" />
    </div>
  )
}
```

### Example: Add to Sidebar

```tsx
// In src/components/Layout.tsx
import { AdRectangle } from './AdBanner'

// Add in sidebar between navigation and user profile:
<AdRectangle slot="YOUR_SLOT_ID" />
```

## 🎨 Ad Component Variants

### 1. Display Ad (Responsive)
```tsx
import { AdDisplay } from '../components/AdBanner'

<AdDisplay slot="YOUR_SLOT_ID" />
```
- **Use case**: Content areas, between sections
- **Size**: Auto-adjusts to container

### 2. Horizontal Banner
```tsx
import { AdHorizontalBanner } from '../components/AdBanner'

<AdHorizontalBanner slot="YOUR_SLOT_ID" />
```
- **Use case**: Top/bottom of pages
- **Size**: Wide, ~90px height

### 3. Rectangle Ad
```tsx
import { AdRectangle } from '../components/AdBanner'

<AdRectangle slot="YOUR_SLOT_ID" />
```
- **Use case**: Sidebars, narrow spaces
- **Size**: Max 336px width

### 4. Custom Ad
```tsx
import { AdBanner } from '../components/AdBanner'

<AdBanner
  slot="YOUR_SLOT_ID"
  format="auto"
  responsive={true}
  className="my-8"
  style={{ maxWidth: '728px', margin: '0 auto' }}
/>
```

## 🧪 Testing

### Local Development
- Ads won't show on `localhost` (AdSense policy)
- You'll see empty ad containers with "Advertisement" label

### Production Testing
1. Deploy to production/staging
2. Wait 24-48 hours for AdSense approval
3. Check ad display and click-through

### Verify Integration
```bash
# Check browser console for errors
# Look for: "adsbygoogle.push() error"
```

## ⚠️ Important Notes

### Ad Policies
- ✅ DO place ads between content sections
- ✅ DO label ads clearly (already included)
- ✅ DO use responsive sizing
- ❌ DON'T place too many ads on one page (max 3 recommended)
- ❌ DON'T click your own ads (policy violation)
- ❌ DON'T place ads on sensitive pages (authentication, payment)

### Best Practices
1. **Limit ads per page**: 1-3 ads maximum
2. **Strategic placement**: Between content, not interrupting workflows
3. **Monitor performance**: Track revenue vs. user experience
4. **A/B testing**: Test different placements for optimal balance

### Performance
- Ads load asynchronously (no blocking)
- Minimal impact on page load time
- Uses native lazy loading

## 🔧 Troubleshooting

### Ads Not Showing
1. **Check AdSense account status**: Must be approved
2. **Verify slot IDs**: Must match AdSense dashboard
3. **Check console errors**: Browser dev tools
4. **Wait for approval**: New sites need 24-48 hours
5. **Check site in production**: Ads don't show on localhost

### Common Errors
```
"adsbygoogle.push() error: No slot size for availableWidth=0"
```
**Solution**: Check container width, ensure responsive sizing

```
"AdSense code not found"
```
**Solution**: Verify `index.html` has AdSense script (already included)

### Performance Issues
If ads slow down your app:
1. Reduce number of ad units
2. Use lazy loading for below-fold ads
3. Consider ad-free premium tier

## 📊 Revenue Optimization

### High-Value Pages (Priority for ads)
1. ✅ Dashboard (implemented)
2. Reports page (analytics viewing)
3. Members page (list viewing)
4. Stokvel catalog (browsing)

### Low-Value Pages (Avoid ads)
1. ❌ Login/Authentication
2. ❌ Payment/Contribution forms
3. ❌ Settings pages
4. ❌ Create/Edit workflows

### Optimal Placement Strategy
- **Above the fold**: One ad maximum
- **Between content**: One ad per 2-3 sections
- **Below the fold**: One ad at page bottom

## 🎯 Recommended Next Steps

1. [ ] Create 2-3 ad units in AdSense dashboard
2. [ ] Update slot IDs in `Dashboard.tsx`
3. [ ] Test in production environment
4. [ ] Monitor revenue and user engagement
5. [ ] Add ads to 1-2 more high-traffic pages
6. [ ] Optimize placement based on metrics

## 📞 Support

- **AdSense Help**: https://support.google.com/adsense
- **Implementation Issues**: Check browser console
- **Policy Questions**: AdSense Help Center

---

**Version**: 1.0
**Last Updated**: 2025-10-11
