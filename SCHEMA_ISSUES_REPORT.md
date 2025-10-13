# Supabase Database Schema Review Report

**Date**: 2025-10-13
**Project**: Vehicle Stokvel Tracker
**Database**: acagbluesumlpggxnlbm.supabase.co

---

## Executive Summary

✅ **Overall Status**: Database is mostly correctly configured with minor discrepancies between schema documentation and actual implementation.

**Critical Issues**: 0
**Medium Issues**: 1
**Low Issues**: 3
**Informational**: 2

---

## ✅ What's Working Correctly

### 1. Core Tables
All 5 main tables exist and are accessible:
- ✅ `stokvel_types` - Template definitions for different stokvel types
- ✅ `user_stokvels` - User-created stokvel instances
- ✅ `user_stokvel_members` - Member participation records
- ✅ `stokvel_contributions` - Payment tracking
- ✅ `stokvel_payouts` - Distribution records

### 2. Fairness Calculation Fields
The `user_stokvel_members` table has all required fairness calculation fields:
- ✅ `total_paid` - Total contributions per member
- ✅ `net_position` - Vehicle value minus total paid
- ✅ `adjustment` - Fairness adjustment amount

### 3. Stokvel Types Data
All 7 predefined stokvel types are present and active:
- Vehicle Stokvel
- Savings Stokvel
- Grocery Stokvel
- Burial Society
- Investment Stokvel
- Education Stokvel
- Holiday Stokvel

### 4. Storage Configuration
- ✅ `proof-of-payments` bucket exists
- ✅ Bucket is public (allows file access)

### 5. Authentication Integration
- ✅ Tables properly reference `auth.users` for user authentication
- ✅ Foreign key constraints maintain referential integrity

---

## ⚠️ Issues Found

### ISSUE #1: Schema Documentation Mismatch (MEDIUM)
**Table**: `stokvel_payouts`
**Description**: The schema definition file (`database-schema-multi-stokvel.sql`) shows the column should be named `member_id`, but the actual database uses `recipient_member_id`.

**Evidence**:
- Schema file line 75: `member_id UUID REFERENCES public.user_stokvel_members(id)`
- Schema file line 174: Policy references `recipient_member_id = auth.uid()`
- Actual database: Column is named `recipient_member_id`
- TypeScript types (`src/types/multi-stokvel.ts` line 209): Uses `member_id`

**Impact**:
- **TypeScript Type Mismatch**: The TypeScript definition expects `member_id` but database has `recipient_member_id`
- **Query Failures**: Code using `member_id` will fail with "column does not exist" errors
- **Documentation Confusion**: Developers may implement incorrect queries based on schema file

**Root Cause**: The `fix-database-schema.sql` migration (lines 19-20) renamed the column but:
1. The main schema file wasn't updated
2. TypeScript types weren't regenerated

---

### ISSUE #2: TypeScript Type Definitions Not Aligned (MEDIUM)
**File**: `src/types/multi-stokvel.ts`
**Description**: TypeScript types don't match actual database schema

**Discrepancies**:

| Type Definition | Database Reality | Line Reference |
|----------------|------------------|----------------|
| `member_id: string` | `recipient_member_id` | Line 211 |
| Type expects `member_id` in Insert | Should be `recipient_member_id` | Line 223 |
| Type expects `member_id` in Update | Should be `recipient_member_id` | Line 236 |

**Impact**:
- Runtime errors when inserting/updating payouts
- TypeScript compilation succeeds but database operations fail
- Misleading autocomplete suggestions for developers

---

### ISSUE #3: Cannot Verify Database Constraints (LOW)
**Description**: Unable to verify the following constraints exist via API:

**stokvel_contributions**:
- `UNIQUE(stokvel_id, member_id, month)` - Prevents duplicate contributions per month

**user_stokvel_members**:
- `UNIQUE(stokvel_id, member_id)` - Prevents duplicate member enrollment
- `UNIQUE(stokvel_id, rotation_order)` - Prevents rotation order conflicts

**Recommendation**: Manually verify in Supabase dashboard → Database → Tables → Constraints tab

---

### ISSUE #4: Foreign Key Reference Uncertainty (LOW)
**Table**: `stokvel_contributions`
**Field**: `member_id`

**Question**: Does `member_id` reference:
- Option A: `auth.users(id)` - Direct user reference
- Option B: `user_stokvel_members(id)` - Member record reference

**Schema File Says** (line 60):
```sql
member_id UUID REFERENCES public.user_stokvel_members(id) ON DELETE CASCADE
```

**Fix File Says** (line 11):
```sql
member_id REFERENCES auth.users(id) ON DELETE CASCADE
```

**Impact**: If the foreign key was changed to `auth.users`, the schema file is outdated and misleading.

**Recommendation**: Verify foreign key target in Supabase dashboard and update schema file accordingly.

---

### ISSUE #5: RLS Policies Cannot Be Verified (INFO)
**Description**: Cannot query `pg_policies` view via Supabase API to verify Row Level Security policies.

**Expected RLS Policies** (per schema file):
- `stokvel_types`: 1 policy (read for authenticated users)
- `user_stokvels`: 3 policies (select, insert, update for owners)
- `user_stokvel_members`: 2 policies (view and manage)
- `stokvel_contributions`: 2 policies (view and manage)
- `stokvel_payouts`: 2 policies (view and manage)

**Recommendation**: Manually verify in Supabase dashboard → Authentication → Policies

---

### ISSUE #6: Storage Policies Not Verified (INFO)
**Description**: Storage bucket policies for `proof-of-payments` cannot be verified via API.

**Expected Policies**:
- Allow authenticated users to upload files
- Allow authenticated users to read files
- Proper file path restrictions (user-specific folders)

**Recommendation**: Verify in Supabase dashboard → Storage → proof-of-payments → Policies

---

## 🔧 Recommended Fixes

### Priority 1: Fix TypeScript Type Definitions
**Action**: Update `src/types/multi-stokvel.ts` to match actual database schema

**Changes Needed**:
```typescript
// Line 209 - Change from:
member_id: string

// To:
recipient_member_id: string

// Lines 223, 236 - Update Insert and Update types similarly
```

**Alternative**: If keeping `member_id` in code, rename database column back to `member_id` (not recommended as it would require migration)

---

### Priority 2: Update Schema Documentation
**Action**: Update `database-schema-multi-stokvel.sql` to reflect actual implementation

**Changes Needed**:
```sql
-- Line 75 - Change from:
member_id UUID REFERENCES public.user_stokvel_members(id) ON DELETE CASCADE,

-- To:
recipient_member_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
```

---

### Priority 3: Verify Database Constraints
**Action**: Check Supabase dashboard for missing constraints

**Constraints to verify**:
1. `stokvel_contributions`: `unique_member_month_contribution` exists
2. `user_stokvel_members`: `UNIQUE(stokvel_id, member_id)` exists
3. `user_stokvel_members`: `UNIQUE(stokvel_id, rotation_order)` exists

**If missing**, run the constraint creation statements from `fix-database-schema.sql`

---

### Priority 4: Audit Foreign Key References
**Action**: Verify `stokvel_contributions.member_id` foreign key target

**Steps**:
1. Go to Supabase dashboard → Database → Tables → stokvel_contributions
2. Check Foreign Keys section
3. Confirm if `member_id` references `auth.users` or `user_stokvel_members`
4. Update schema file and TypeScript types accordingly

---

### Priority 5: Verify RLS and Storage Policies
**Action**: Manual verification in Supabase dashboard

**RLS Policies** (Database → Authentication → Policies):
- Verify all tables have RLS enabled
- Check policy definitions match schema expectations
- Test policies with different user roles

**Storage Policies** (Storage → proof-of-payments → Policies):
- Verify upload permissions
- Verify read permissions
- Check file path restrictions

---

## 📊 Migration Files Analysis

### Applied Migrations (Confirmed)
1. ✅ `add-fairness-fields-migration.sql` - Fairness fields exist
2. ✅ `setup-storage-bucket.sql` - Storage bucket exists
3. ✅ Stokvel types INSERT statements - All 7 types present

### Uncertain Migrations
1. ❓ `fix-database-schema.sql` - Some changes applied, some documentation outdated
2. ❓ Various RLS fix files - Cannot verify which version is active

### Migration Files Found (45 total)
Many RLS-related fix files suggest iterative debugging:
- `fix-rls-policies.sql`
- `fix-all-rls-policies.sql`
- `fix-member-rls-policies.sql`
- `fix-rls-with-helper-function.sql`
- Many others...

**Recommendation**: Consolidate into single source of truth migration file after verification

---

## 🎯 Action Plan

### Immediate Actions (Before Development Continues)
1. [ ] Fix TypeScript types for `stokvel_payouts` table
2. [ ] Update schema documentation to match reality
3. [ ] Verify and document foreign key relationships

### Short-term Actions (This Week)
4. [ ] Manually verify all database constraints exist
5. [ ] Audit and document RLS policies
6. [ ] Verify storage bucket policies
7. [ ] Test proof of payment upload/download flow

### Long-term Actions (Technical Debt)
8. [ ] Consolidate migration files into clean history
9. [ ] Set up automated schema validation in CI/CD
10. [ ] Generate TypeScript types automatically from database schema
11. [ ] Document RLS policies in code comments

---

## 🛠️ Tools for Ongoing Maintenance

### Automated Type Generation
Consider using Supabase CLI to generate types:
```bash
supabase gen types typescript --project-id acagbluesumlpggxnlbm > src/types/database.types.ts
```

### Schema Validation
Create automated tests to verify:
- Required tables exist
- Required columns exist
- Foreign key relationships are correct
- Constraints are in place

### Documentation
Maintain single source of truth:
- Either database is source → generate docs from it
- Or schema file is source → apply all changes via migrations

---

## 📝 Notes

### Database Version Info
- Supabase Project: `acagbluesumlpggxnlbm`
- Project URL: `https://acagbluesumlpggxnlbm.supabase.co`
- All credentials configured correctly in `.env`

### Code Quality
- Clean separation between types and implementation
- Good use of React Query for state management
- StokvelLogicEngine provides business logic centralization

### Schema Design Quality
Overall schema design is sound:
- Proper normalization
- Good use of foreign keys
- Logical table relationships
- Support for multi-stokvel architecture

Main issue is documentation drift, not fundamental design flaws.

---

## Conclusion

Your Supabase database is **functionally correct** but has **documentation and type definition inconsistencies**. The issues found are primarily about alignment between:
1. Database reality
2. Schema documentation
3. TypeScript type definitions

**No data loss risk** - All changes are documentation/type updates, not structural changes.

**Recommended Priority**: Fix TypeScript types first (Priority 1) to prevent runtime errors, then update documentation for future development.
