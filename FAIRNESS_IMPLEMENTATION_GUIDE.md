# Fairness Calculation and Settlement Implementation Guide

## Overview

This implementation adds a comprehensive fairness calculation and settlement system for vehicle stokvels, ensuring equitable treatment of all members based on their contribution timing and total amount paid.

## Features Implemented

### 1. **Fairness Calculation Engine** (`StokvelLogicEngine.ts`)

#### Core Methods

- **`calculateFairness()`**: Main calculation method
  - Calculates total paid for each member from verified contributions
  - Computes net position: `vehicle_value - total_paid`
  - Calculates average net position across all members
  - Determines adjustment: `average_net_position - member_net_position`
  - Returns comprehensive fairness summary with member calculations

- **`shouldTriggerFairnessCalculation()`**: Cycle completion check
  - Returns true when all active members have received vehicles
  - Used to trigger fairness settlement phase

- **`getContributionAmount()`**: Dynamic contribution calculation
  - Returns initial contribution for members without vehicles
  - Returns post-receipt contribution for members with vehicles

- **`calculateExpectedContribution()`**: Monthly contribution calculator
  - Accounts for joining fee in first month
  - Adjusts based on vehicle receipt status
  - Considers member join date

#### Fairness Formula

```
net_position = vehicle_value - total_paid
average_net_position = SUM(all_net_positions) / member_count
adjustment = average_net_position - member_net_position
```

**Interpretation:**
- **Positive adjustment**: Member should **receive** this amount
- **Negative adjustment**: Member should **pay** this amount

### 2. **Database Schema Updates** (`add-fairness-fields-migration.sql`)

#### New Fields in `user_stokvel_members`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `total_paid` | NUMERIC | 0 | Total contributions made by member |
| `net_position` | NUMERIC | 0 | Vehicle value minus total paid |
| `adjustment` | NUMERIC | 0 | Fairness adjustment amount |

#### Migration Script

```sql
ALTER TABLE user_stokvel_members
ADD COLUMN IF NOT EXISTS total_paid NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_position NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS adjustment NUMERIC DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_user_stokvel_members_fairness
ON user_stokvel_members(stokvel_id, vehicle_received, total_paid);
```

### 3. **FairnessDashboard Component** (`pages/FairnessDashboard.tsx`)

#### Features

1. **Summary Cards**
   - Total Pool Collected
   - Vehicles Distributed (X / Total)
   - Average Net Position
   - Leftover Pot

2. **Cycle Status**
   - Visual indicator of cycle completion
   - Ready/In Progress status with icons

3. **Member Fairness Table**
   - Member name
   - Month received
   - Total paid
   - Net position (color-coded: green for positive, red for negative)
   - Adjustment amount (color-coded)
   - Status badge (Receive/Pay)

4. **Settlement Actions**
   - Recalculate Fairness button
   - Settle Now button (enabled only when cycle complete)
   - Confirmation dialog for settlement

5. **Educational Content**
   - Formula explanation
   - Adjustment interpretation guide

#### Routes

```typescript
/stokvel/:stokvelId/fairness
```

### 4. **Dashboard Integration**

#### Navigation Button
- Appears only for vehicle stokvels (`distribution_type === 'vehicle'`)
- Located in Dashboard header
- Icon: Calculator
- Label: "Fairness Dashboard"

### 5. **Payouts Component Enhancement**

#### Fairness Alert
- Automatically appears when all members have received vehicles
- Green card with CheckCircle icon
- Title: "Cycle Complete - Fairness Settlement Available"
- Explanation of fairness calculation purpose
- Button to navigate to Fairness Dashboard

#### Logic
```typescript
const shouldShowFairnessAlert =
  members && StokvelLogicEngine.shouldTriggerFairnessCalculation(members)
```

### 6. **TypeScript Type Updates** (`types/multi-stokvel.ts`)

#### New Interfaces

```typescript
export interface FairnessCalculationResult {
  member_id: string
  member_name: string
  total_paid: number
  month_received: number
  net_position: number
  adjustment: number
}

export interface FairnessSummary {
  total_pool_collected: number
  total_vehicles_distributed: number
  average_net_position: number
  leftover_pot: number
  member_calculations: FairnessCalculationResult[]
  cycle_complete: boolean
}
```

#### Updated Database Types

```typescript
user_stokvel_members: {
  Row: {
    // ... existing fields
    total_paid: number
    net_position: number
    adjustment: number
  }
  // ... Insert and Update types also updated
}
```

## User Workflow

### Phase 1: Contribution & Payout Cycle

1. Members contribute monthly (R3,500 initially, R8,000 after receiving vehicle)
2. First month includes R1,500 joining fee
3. When balance reaches R100,000, next member in rotation receives vehicle
4. Process repeats until all members have received vehicles

### Phase 2: Fairness Calculation (Automatic)

1. System detects all members have received vehicles
2. Green alert appears on Payouts page
3. Admin can navigate to Fairness Dashboard
4. Dashboard shows:
   - Each member's total contributions
   - Net position (R100,000 - total_paid)
   - Fairness adjustment
   - Whether member should pay or receive

### Phase 3: Settlement

1. Admin reviews fairness calculations
2. Can recalculate if needed
3. Clicks "Settle Now" button
4. Confirmation dialog appears
5. Upon confirmation:
   - All member records updated with fairness adjustments
   - System ready for next cycle or closure

## Example Calculation

### Scenario: 13 Members, R100,000 Vehicle Value

| Member | Month Received | Total Paid | Net Position | Adjustment | Status |
|--------|---------------|------------|--------------|------------|--------|
| Alice  | 1             | R76,500    | R23,500      | -R5,192    | Pay    |
| Bob    | 7             | R85,500    | R14,500      | +R3,808    | Receive|
| Carol  | 13            | R109,500   | -R9,500      | +R27,808   | Receive|

**Calculation:**
- Alice net: R100,000 - R76,500 = R23,500
- Bob net: R100,000 - R85,500 = R14,500
- Carol net: R100,000 - R109,500 = -R9,500
- Average net: (R23,500 + R14,500 - R9,500) / 3 = R9,500 (simplified)
- Alice adjustment: R9,500 - R23,500 = -R14,000 (should pay)
- Bob adjustment: R9,500 - R14,500 = -R5,000 (should pay)
- Carol adjustment: R9,500 - (-R9,500) = R19,000 (should receive)

## Technical Implementation Details

### Error Handling

1. **FairnessDashboard**
   - Loading states with spinner
   - Error messages via alerts
   - Graceful handling of missing data

2. **StokvelLogicEngine**
   - Type safety with TypeScript
   - Default values for edge cases
   - Null/undefined checks

### Performance Optimizations

1. **Database Indexing**
   - Index on `(stokvel_id, vehicle_received, total_paid)`
   - Faster queries for fairness calculations

2. **Memoization**
   - React hooks for data fetching
   - Prevents unnecessary recalculations

### Security Considerations

1. **Authorization**
   - Protected routes using ProtectedRoute component
   - Supabase RLS policies apply

2. **Data Validation**
   - TypeScript type checking
   - Input validation in forms

## Testing Recommendations

### Unit Tests

1. **StokvelLogicEngine.calculateFairness()**
   - Test with various member counts
   - Test with different contribution amounts
   - Test edge cases (all equal, extreme differences)

2. **StokvelLogicEngine.shouldTriggerFairnessCalculation()**
   - Test with all members having vehicles
   - Test with some members without vehicles
   - Test with empty member list

### Integration Tests

1. **FairnessDashboard**
   - Test data loading
   - Test recalculation
   - Test settlement process

2. **Payouts Alert**
   - Test alert appearance on cycle completion
   - Test navigation to fairness dashboard

### End-to-End Tests

1. Complete stokvel cycle with sample data
2. Verify fairness calculations match expected values
3. Test settlement process updates database correctly

## Sample Test Data

```sql
-- Create test stokvel with 3 members
INSERT INTO user_stokvels (id, name, target_amount, currency)
VALUES ('test-stokvel-1', 'Test Vehicle Stokvel', 100000, 'ZAR');

-- Create members
INSERT INTO user_stokvel_members (stokvel_id, full_name, rotation_order, vehicle_received, month_received)
VALUES
  ('test-stokvel-1', 'Alice', 1, true, '2024-01'),
  ('test-stokvel-1', 'Bob', 2, true, '2024-07'),
  ('test-stokvel-1', 'Carol', 3, true, '2024-13');

-- Create contributions
-- Alice: 1 month * 5000 + 12 months * 8000 = 101,000
-- Bob: 7 months * 3500 + 6 months * 8000 = 72,500
-- Carol: 13 months * 3500 = 45,500
```

## Configuration Options

### Vehicle Amount

Default: R100,000

To customize:
```typescript
const vehicleAmount = stokvel.target_amount || 100000
```

### Contribution Amounts

Defaults:
- Initial monthly: R3,500
- Post-receipt: R8,000
- Joining fee: R1,500

To customize, update in `StokvelLogicEngine.calculateExpectedContribution()`:
```typescript
joiningFee: number = 1500,
postReceiptContribution: number = 8000
```

## Future Enhancements

1. **Staggered Payments**
   - Allow members to pay adjustments over multiple months
   - Track payment plans

2. **Leftover Pot Distribution**
   - Options to apply leftover funds toward fairness adjustments
   - Proportional distribution to members with positive adjustments

3. **Notifications**
   - Email notifications when fairness calculation is complete
   - SMS alerts for settlement actions

4. **Reporting**
   - PDF export of fairness calculations
   - Historical fairness reports across cycles

5. **Multi-Cycle Support**
   - Track fairness across multiple cycles
   - Cumulative fairness adjustments

## Deployment Checklist

- [ ] Run database migration: `add-fairness-fields-migration.sql`
- [ ] Verify all TypeScript types are updated
- [ ] Test FairnessDashboard with sample data
- [ ] Verify navigation from Dashboard and Payouts
- [ ] Test settlement process end-to-end
- [ ] Update user documentation
- [ ] Train admins on fairness calculation usage
- [ ] Monitor for errors in production

## Support & Documentation

### For Admins

1. Navigate to Payouts page when cycle nears completion
2. Watch for green "Cycle Complete" alert
3. Click "View Fairness Dashboard"
4. Review calculations
5. Click "Settle Now" when ready
6. Coordinate payments/receipts with members

### For Developers

- **Main logic**: `src/services/StokvelLogicEngine.ts`
- **UI component**: `src/pages/FairnessDashboard.tsx`
- **Database migration**: `add-fairness-fields-migration.sql`
- **Types**: `src/types/multi-stokvel.ts`
- **Routes**: `src/App.tsx`

## Troubleshooting

### Issue: Fairness calculations seem incorrect

**Solution**:
1. Verify all contributions are marked as `verified: true`
2. Check `month_received` values are set correctly
3. Ensure `vehicle_received` is `true` for all members
4. Recalculate fairness using the "Recalculate Fairness" button

### Issue: Settlement button is disabled

**Solution**:
1. Confirm all members have `vehicle_received: true`
2. Check `cycle_complete` is `true` in fairness summary
3. Verify there are no members with `is_active: true` and `vehicle_received: false`

### Issue: Navigation to Fairness Dashboard not appearing

**Solution**:
1. Confirm stokvel has `distribution_type: 'vehicle'`
2. Check that `stokvelId` param is present in URL
3. Verify route is correctly configured in `App.tsx`

## License & Credits

Implemented for Vikoba vehicle stokvel management system.
Based on actuarial fairness principles for rotating savings and credit associations (ROSCAs).
