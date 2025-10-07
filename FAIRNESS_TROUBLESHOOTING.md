# Fairness Dashboard Troubleshooting Guide

## Issues Fixed

### 1. Route Parameter Mismatch ✅
**Problem**: Component was looking for `id` parameter but route defined `:stokvelId`

**Fix**: Changed all references from `id` to `stokvelId` in `FairnessDashboard.tsx`:
- Line 14: `useParams<{ stokvelId: string }>()`
- Line 38: `.eq('id', stokvelId)`
- Line 52: `.eq('stokvel_id', stokvelId)`
- Line 66: `.eq('stokvel_id', stokvelId)`
- Line 172: Back button navigation

### 2. Supabase Query Errors ✅
**Problem**: 400 Bad Request errors from invalid join syntax

**Fix**: Separated queries in `useDashboard.ts`:
- Query payouts separately
- Query members separately
- Map them together in JavaScript

### 3. Missing Column Reference ✅
**Problem**: Code referenced `vehicle_value` column that doesn't exist

**Fix**: Changed to use `amount_paid` instead of `vehicle_value`

## Current Status

### What Works Now:
✅ Route parameter correctly extracted
✅ No more 400 errors on page load
✅ Console logging added for debugging
✅ Error alerts for user feedback

### What to Check:

1. **Browser Console Logs**
   - Open DevTools → Console
   - Look for these messages:
     ```
     Loading fairness data for stokvel: <id>
     Loaded stokvel: {...}
     Loaded members: [...]
     Loaded contributions: [...]
     Calculating fairness...
     Fairness summary: {...}
     Finished loading, setting loading to false
     ```

2. **Possible Issues**:

   **A. Database Migration Not Run**
   - **Symptom**: Members load but have null values for `total_paid`, `net_position`, `adjustment`
   - **Solution**: Run the migration:
     ```sql
     ALTER TABLE user_stokvel_members
     ADD COLUMN IF NOT EXISTS total_paid NUMERIC DEFAULT 0,
     ADD COLUMN IF NOT EXISTS net_position NUMERIC DEFAULT 0,
     ADD COLUMN IF NOT EXISTS adjustment NUMERIC DEFAULT 0;
     ```

   **B. No Members in Stokvel**
   - **Symptom**: Console shows "Loaded members: []"
   - **Solution**: Add members to the stokvel first

   **C. No Contributions**
   - **Symptom**: Console shows "Loaded contributions: []"
   - **Solution**: This is OK - fairness will calculate with zero contributions

   **D. Stokvel Not Found**
   - **Symptom**: Console shows error "Error loading stokvel"
   - **Solution**: Check that the stokvelId in URL is valid

## Testing Steps

1. **Refresh Browser**
   - Clear browser cache (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
   - This ensures you get the latest code

2. **Navigate to Fairness Dashboard**
   - Option A: Dashboard → Click "Fairness Dashboard" button
   - Option B: Payouts → Click alert (if cycle complete)
   - Option C: Direct URL: `/stokvel/{stokvelId}/fairness`

3. **Check Console**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for the log messages listed above

4. **Expected Behavior**:
   - Loading spinner appears
   - Console logs show data loading
   - Page displays with:
     - Summary cards (pool, vehicles, average, leftover)
     - Cycle status card
     - Member fairness table
     - Settlement actions

## Common Errors & Solutions

### Error: "Cannot read property 'target_amount' of null"
**Cause**: Stokvel not loaded
**Solution**: Check stokvelId in URL is valid

### Error: "Column 'total_paid' does not exist"
**Cause**: Database migration not run
**Solution**: Run the migration SQL script

### Error: Page stays on "Loading fairness data..." forever
**Cause**: JavaScript error preventing setLoading(false)
**Solution**: Check console for errors, likely in calculateFairness()

### Error: "Error loading fairness data: undefined"
**Cause**: Generic error, check console for details
**Solution**: Look at console logs to see which query failed

## Debug Checklist

- [ ] Browser cache cleared
- [ ] Console open to see logs
- [ ] Valid stokvelId in URL
- [ ] Database migration run
- [ ] Members exist in stokvel
- [ ] No JavaScript errors in console
- [ ] Network tab shows successful API calls

## Next Steps if Still Not Working

1. **Share Console Logs**
   - Copy all console output
   - Include any red error messages

2. **Check Network Tab**
   - Open DevTools → Network
   - Filter by "fetch/XHR"
   - Look for failed requests (red)
   - Click on failed request → Response tab
   - Share the error message

3. **Verify Database**
   - Check if `user_stokvel_members` table has fairness columns
   - Check if members exist for the stokvel
   - Check if contributions exist
