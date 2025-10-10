# Lottery System Implementation Guide

## Overview

The Lottery System provides a fair, transparent, and auditable method for determining member rotation order in stokvels. It supports multiple lottery methods and maintains a complete audit trail for compliance and transparency.

## Features

### 🎲 Lottery Methods

1. **Random Draw** (Cryptographically Secure)
   - Pure random selection using Web Crypto API
   - Equal probability for all eligible members
   - Transparent random seed generation for auditability
   - Fisher-Yates shuffle algorithm for fair distribution

2. **Weighted Lottery** (Merit-Based)
   - Based on member tenure (40% weight by default)
   - Based on contribution history (60% weight by default)
   - Long-standing, consistent members get higher probability
   - Still maintains element of chance for fairness

3. **Manual Assignment**
   - Admin can manually set rotation order
   - Useful for special circumstances or agreements
   - Still recorded in audit trail

### 📊 Key Features

- **Audit Trail**: Complete history of all lottery draws
- **Transparency**: Random seeds and weighting factors recorded
- **Exclusion Rules**: Option to exclude members who already received payouts
- **Export Capability**: Download lottery results as CSV
- **Real-time Updates**: Member rotation orders updated automatically
- **Permission-Based**: Only admins can conduct lottery

## Architecture

### Database Schema

**New Tables:**
```sql
stokvel_lottery_history
├── id (UUID)
├── stokvel_id (FK to user_stokvels)
├── lottery_method (manual|random|weighted)
├── conducted_at (timestamp)
├── conducted_by (FK to auth.users)
├── total_participants (integer)
├── excluded_members (JSONB array)
├── lottery_results (JSONB array)
├── random_seed (text)
├── weighting_config (JSONB)
├── is_active (boolean)
└── notes (text)
```

**Extended Tables:**
```sql
user_stokvels
├── rotation_method (manual|random|weighted) [NEW]
└── last_lottery_date (timestamp) [NEW]
```

### Core Services

#### LotterySystem.ts (`src/services/LotterySystem.ts`)

Main lottery generation engine with:
- `conductLottery()` - Generate lottery with specified method
- `validateLotteryResults()` - Verify lottery fairness
- `exportLotteryToCSV()` - Export results for transparency

**Key Functions:**
```typescript
// Generate lottery
const result = conductLottery(
  stokvelId,
  members,
  {
    method: 'random', // or 'weighted'
    excludeVehicleRecipients: true,
    weightingFactors: {
      tenureWeight: 0.4,
      contributionWeight: 0.6
    }
  },
  conductedBy
)

// Validate results
const validation = validateLotteryResults(result)
if (!validation.isValid) {
  console.error('Issues:', validation.issues)
}
```

### React Hooks

#### useLottery.ts (`src/hooks/useLottery.ts`)

- `useActiveLottery(stokvelId)` - Get current active lottery
- `useLotteryHistory(stokvelId, limit)` - Get lottery history
- `useConductLottery()` - Mutation to conduct and save lottery
- `useCanConductLottery(stokvelId)` - Check admin permissions
- `useStokvelRotationMethod(stokvelId)` - Get current rotation method

### UI Components

#### LotteryDrawDialog (`src/components/LotteryDrawDialog.tsx`)

Interactive dialog for conducting lottery:
1. **Configuration Step**: Select method and options
2. **Drawing Step**: Animated lottery draw
3. **Results Step**: View and confirm results

Features:
- Method selection (Random vs Weighted)
- Exclusion options (exclude vehicle recipients)
- Real-time participant count
- Results preview with ranking
- Export to CSV
- Confirm and apply

#### LotteryHistoryCard (`src/components/LotteryHistoryCard.tsx`)

Audit trail display component:
- Lists all historical lottery draws
- Shows method, date, conductor
- Expandable results view
- Active lottery indicator
- Visual ranking display

## Usage

### 1. Database Setup

Run the SQL migration:
```bash
# In Supabase SQL Editor
psql -f lottery-system-schema.sql
```

Or copy the contents of `lottery-system-schema.sql` into Supabase SQL Editor.

### 2. Conducting a Lottery

**As Stokvel Admin:**

1. Navigate to Members page for your stokvel
2. Click "Conduct Lottery" button (admin only)
3. Select lottery method:
   - **Random**: For equal chance
   - **Weighted**: For merit-based selection
4. Choose options:
   - Exclude members who received vehicles (recommended)
5. Review participant count
6. Click "Conduct Lottery"
7. View animated draw results
8. Confirm and apply to members

### 3. Viewing Lottery History

The Lottery History Card appears on the Members page showing:
- All past lottery draws
- Current active lottery
- Conductor and timestamp
- Number of participants
- Expandable results

### 4. Manual Rotation Order

Admins can still manually set rotation order:
1. Edit member details
2. Set rotation order number
3. System records as "manual" method in history

## Technical Details

### Cryptographic Randomness

The system uses `crypto.getRandomValues()` for secure random generation:

```typescript
const secureRandom = (): number => {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0] / (0xffffffff + 1)
}
```

### Weighted Lottery Algorithm

Weights are calculated based on:

**Tenure Score:**
```typescript
const tenureMonths = calculateTenureMonths(member.join_date)
const tenureScore = Math.min(tenureMonths / 24, 1) // Max at 24 months
```

**Contribution Score:**
```typescript
const contributionScore = Math.min(member.total_paid / 50000, 1) // Normalize to R50k
```

**Combined Weight:**
```typescript
const weightedScore =
  (tenureScore * 0.4) + (contributionScore * 0.6)
```

### Fisher-Yates Shuffle

Fair shuffling algorithm for random draws:

```typescript
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
```

## Security & Permissions

### Row Level Security (RLS)

**View Lottery History:**
- Users can view lottery history for stokvels they are members of

**Conduct Lottery:**
- Only admins of the stokvel can conduct lottery
- Verified through RLS policies

### Database Functions

**`conduct_lottery()`:**
- SECURITY DEFINER function
- Validates admin permissions
- Deactivates previous lottery
- Applies results to members
- Returns lottery ID

**`get_active_lottery()`:**
- Returns current active lottery
- Includes conductor information

**`get_lottery_history()`:**
- Returns paginated history
- Limited by permissions

## Best Practices

### When to Conduct Lottery

1. **Initial Setup**: When first adding all members
2. **New Cycle**: After completing a full rotation cycle
3. **Major Changes**: When multiple members join/leave
4. **Fairness Concerns**: When manual order causes disputes

### Choosing the Right Method

**Random Draw:**
- ✅ New stokvels with no contribution history
- ✅ Equal treatment priority
- ✅ Maximum transparency and simplicity

**Weighted Lottery:**
- ✅ Established stokvels with history
- ✅ Reward consistent contributors
- ✅ Recognize tenure and loyalty

**Manual:**
- ✅ Special agreements between members
- ✅ Temporary adjustments
- ✅ Small groups with consensus

### Transparency Tips

1. **Announce Before Drawing**: Tell members lottery is happening
2. **Share Results**: Show results after conducting
3. **Export CSV**: Provide downloadable evidence
4. **Keep History**: Never delete lottery records
5. **Document Reasoning**: Add notes explaining why lottery was conducted

## Troubleshooting

### No Eligible Members

**Problem:** "No eligible members for lottery draw"

**Solutions:**
- Check if members are marked as active
- Disable "exclude vehicle recipients" if all received vehicles
- Ensure members have rotation_order = null or will be overwritten

### Validation Errors

**Problem:** "Duplicate rotation orders detected"

**Cause:** Database constraint issue or concurrent modification

**Solutions:**
- Refresh members list
- Re-conduct lottery
- Check for database constraints

### Permission Denied

**Problem:** "Not authorized to conduct lottery"

**Solutions:**
- Verify you are stokvel admin
- Check RLS policies in database
- Ensure membership is active

## Future Enhancements

Potential improvements for future versions:

1. **Notification System**: Email/SMS when lottery is conducted
2. **Member Approval**: Require member votes before applying
3. **Video Recording**: Record lottery draw for transparency
4. **Live Streaming**: Stream lottery draw in real-time
5. **Custom Weighting**: Allow admins to adjust weight factors
6. **Lottery Scheduling**: Schedule automatic lottery at specific dates
7. **Multi-Round**: Support multi-round elimination lottery
8. **Blockchain**: Record lottery on blockchain for immutability

## API Reference

### Database Functions

```sql
-- Conduct lottery and save results
conduct_lottery(
  p_stokvel_id UUID,
  p_lottery_method TEXT,
  p_conducted_by UUID,
  p_lottery_results JSONB,
  p_random_seed TEXT DEFAULT NULL,
  p_weighting_config JSONB DEFAULT NULL,
  p_excluded_members JSONB DEFAULT '[]'::jsonb,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID

-- Get active lottery
get_active_lottery(p_stokvel_id UUID)
RETURNS TABLE (...)

-- Get lottery history
get_lottery_history(
  p_stokvel_id UUID,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (...)

-- Apply lottery results to members
apply_lottery_results(
  p_stokvel_id UUID,
  p_lottery_results JSONB
) RETURNS void
```

### React Hooks

```typescript
// Get active lottery
const { data, isLoading } = useActiveLottery(stokvelId)

// Get history
const { data: history } = useLotteryHistory(stokvelId, 10)

// Conduct lottery
const conductLottery = useConductLottery()
await conductLottery.mutateAsync({
  lotteryResult,
  notes: 'Optional notes'
})

// Check permissions
const { data: canConduct } = useCanConductLottery(stokvelId)
```

## Support

For issues or questions:
1. Check lottery history for error details
2. Review RLS policies in Supabase
3. Check browser console for client-side errors
4. Verify member data integrity

## License

Part of the Vehicle Stokvel Tracker application.
