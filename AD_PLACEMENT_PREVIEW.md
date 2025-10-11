# Ad Placement Preview

## 🎨 Visual Integration

Your ads have been designed to match your app's aesthetic perfectly:

### Design Features
- ✅ Card-style containers with rounded corners (`rounded-lg`)
- ✅ Border color matches app: `border-gray-200`
- ✅ Background: white (`bg-white`)
- ✅ Padding: `p-4` for comfortable spacing
- ✅ Subtle "Advertisement" label in gray-400
- ✅ Responsive sizing that adapts to screen width

### Color Palette Integration
Your app uses:
- Background: `bg-gray-50`
- Cards: `bg-white` with `border-gray-200`
- Primary: Blue (`#3b82f6`)
- Success: Green (`#10b981`)

Ads blend seamlessly with this color scheme.

## 📍 Current Ad Placements

### 1. Dashboard Page (`/stokvel/:stokvelId/dashboard`)
```
┌─────────────────────────────────────┐
│ Dashboard Title & Actions           │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Stats Cards (4 columns)             │
│ ├─ Total Balance                    │
│ ├─ This Month                       │
│ ├─ Pending Members                  │
│ └─ Completed Payouts                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Next Payout Alert (if applicable)   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📢 ADVERTISEMENT (Display Ad)        │
│                                     │
│ [Responsive Display Ad Here]        │
│                                     │
└─────────────────────────────────────┘
   ↑ Non-intrusive placement
   ↑ Between sections
   ↑ Natural reading flow

┌─────────────────────────────────────┐
│ Charts Section (2 columns)          │
│ ├─ Monthly Contribution Trends      │
│ └─ Payout History                   │
└─────────────────────────────────────┘
```

**Placement Strategy**:
- After key metrics (users have seen important data)
- Before charts (natural break point)
- Full-width responsive ad

### 2. Reports Page (`/stokvel/:stokvelId/reports`)
```
┌─────────────────────────────────────┐
│ Reports Title & Description         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Monthly Report Card                 │
│ - Month selector                    │
│ - Download button                   │
│ - Quick stats                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Financial Summary Card              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Member Report Card                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Quick Statistics Card               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📢 ADVERTISEMENT (Horizontal Banner) │
│                                     │
│ [Horizontal Banner Ad Here]         │
│                                     │
└─────────────────────────────────────┘
   ↑ Bottom of page placement
   ↑ After all report content
   ↑ Horizontal banner format
```

**Placement Strategy**:
- At bottom of page (after all content)
- Horizontal banner format (wide, not tall)
- Users have completed their task before seeing ad

## 🎯 Recommended Additional Placements

### 3. My Stokvels Page (High Traffic)
```tsx
// src/pages/MyStokvels.tsx
import { AdRectangle } from '../components/AdBanner'

// Add between stokvel list and footer:
<AdRectangle slot="YOUR_AD_SLOT_3" />
```

**Why**: Users browse this page frequently when switching stokvels

### 4. Members Page (Medium Traffic)
```tsx
// src/pages/Members.tsx
import { AdDisplay } from '../components/AdBanner'

// Add after member list, before bottom:
<AdDisplay slot="YOUR_AD_SLOT_4" />
```

**Why**: Users spend time reviewing member information

### 5. Stokvel Type Catalog (High Value)
```tsx
// src/pages/StokvelTypeCatalog.tsx
import { AdDisplay } from '../components/AdBanner'

// Add after catalog grid:
<AdDisplay slot="YOUR_AD_SLOT_5" />
```

**Why**: Users browsing templates are in discovery mode

## ❌ Pages to AVOID Ads

### 1. Login/Authentication Pages
- Users need focus to sign in
- Poor user experience
- Against AdSense policies

### 2. Contribution Forms
- Financial transactions in progress
- Could be seen as deceptive
- Users need focus

### 3. Settings Pages
- Configuration workflows
- Interrupts important tasks
- Low engagement anyway

### 4. Create Stokvel Wizard
- Multi-step form in progress
- Breaks user flow
- Could increase abandonment

## 📊 Performance Metrics to Track

### User Experience Metrics
1. **Bounce Rate**: Should not increase significantly
2. **Time on Page**: Should remain stable
3. **Task Completion**: Forms, reports should maintain completion rates
4. **User Complaints**: Monitor feedback about ads

### Revenue Metrics
1. **Page RPM** (Revenue Per 1000 impressions)
   - Dashboard: Expected highest (most traffic)
   - Reports: Expected medium (focused usage)
   - Browse pages: Expected good (discovery mode)

2. **Click-Through Rate (CTR)**
   - Target: 0.5-2% (typical for AdSense)
   - Monitor by placement
   - Optimize underperforming placements

3. **Viewability**
   - Target: >50% (ads actually seen)
   - Dashboard ad: High viewability (scroll position)
   - Bottom ads: Lower viewability (requires scroll)

## 🔄 A/B Testing Recommendations

### Test 1: Ad Density
- **A**: Current (2 ads total across app)
- **B**: Add 1 more ad (3 ads total)
- **Metric**: Revenue vs. engagement

### Test 2: Ad Position on Dashboard
- **A**: Current (above charts)
- **B**: Below charts
- **Metric**: CTR and viewability

### Test 3: Ad Format on Reports
- **A**: Current (horizontal banner)
- **B**: Display ad (rectangle)
- **Metric**: CTR and revenue

## 💡 Best Practices Summary

### ✅ DO
- Place ads between content sections
- Use card-style containers (matches design)
- Label ads clearly ("Advertisement")
- Limit to 2-3 ads per page
- Test different placements
- Monitor user feedback

### ❌ DON'T
- Place ads mid-content (interrupts reading)
- Use pop-ups or overlays
- Place near buttons/CTAs (accidental clicks)
- Overload pages with ads (3+ per page)
- Place on transaction pages
- Click your own ads (policy violation)

## 🎨 Visual Examples

### Well-Integrated Ad (Current Style)
```
┌──────────────────────────────────────┐
│ Advertisement                        │ ← Subtle gray label
├──────────────────────────────────────┤
│                                      │
│  [Google Ad Content Here]            │
│                                      │
│  ┌────────────────────────────┐     │
│  │ Your Ad Creative           │     │
│  │ With Brand Message         │     │
│  │                            │     │
│  │ [Learn More Button]        │     │
│  └────────────────────────────┘     │
│                                      │
└──────────────────────────────────────┘
  ↑ rounded-lg border
  ↑ border-gray-200
  ↑ bg-white
  ↑ p-4 padding
```

### Matches Your Card Design
```
Compare to Dashboard Card:

┌──────────────────────────────────────┐
│ Total Balance                    [↑] │
├──────────────────────────────────────┤
│                                      │
│  R 45,000                            │
│  [Progress Bar: 45%]                 │
│  Target: R 100,000                   │
│                                      │
└──────────────────────────────────────┘

Same visual style!
```

## 🚀 Next Steps

1. [ ] Create ad units in AdSense dashboard
2. [ ] Get ad slot IDs
3. [ ] Replace placeholder IDs in code:
   - `Dashboard.tsx` line 214: `YOUR_AD_SLOT_1`
   - `Reports.tsx` line 323: `YOUR_AD_SLOT_2`
4. [ ] Deploy to production
5. [ ] Wait 24-48 hours for AdSense approval
6. [ ] Monitor performance for 1 week
7. [ ] Adjust placements based on data
8. [ ] Consider adding 1-2 more strategic ads

## 📞 Questions?

Refer to `ADSENSE_SETUP.md` for detailed implementation guide.

---

**Created**: 2025-10-11
**Status**: Ready for deployment
