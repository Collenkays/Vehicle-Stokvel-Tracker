# SQL Files Cleanup Plan

**Total Files**: 46 SQL files
**Action**: Delete redundant debugging/iterative fix files, keep essential files

---

## ✅ KEEP - Essential Files (7 files)

### Core Schema Files
1. **database-schema-multi-stokvel.sql** ✅
   - Main schema definition
   - Up-to-date with latest fixes
   - Single source of truth

### Applied Migrations
2. **add-fairness-fields-migration.sql** ✅
   - Adds total_paid, net_position, adjustment fields
   - Successfully applied to database

3. **database-settings-migration.sql** ✅
   - Database configuration settings
   - May be needed for fresh installs

### Verification Tools (Created by fixes)
4. **verify-constraints.sql** ✅
   - Manual verification script
   - Checks constraints in Supabase dashboard
   - Part of fix documentation

5. **check-schema.sql** ✅
   - Schema verification queries
   - Useful for ongoing validation

### Storage Setup
6. **setup-storage-bucket.sql** ✅
   - Storage bucket creation
   - Needed for proof of payments

7. **create-storage-policies.sql** ✅
   - Storage bucket policies
   - Security configuration

---

## ❌ DELETE - Redundant Files (39 files)

### Category 1: RLS Debug/Fix Iterations (24 files)
Multiple iterations of RLS policy fixes - keep only the schema file with final policies:

- check-rls-policies.sql
- check-user-stokvels-rls.sql
- cleanup-all-duplicate-policies.sql
- cleanup-duplicate-select-policy.sql
- debug-member-permissions.sql
- fix-all-rls-comprehensive.sql
- fix-all-rls-policies.sql
- fix-infinite-recursion.sql
- fix-member-access-by-email-phone.sql
- fix-member-access-simple.sql
- fix-member-policies.sql
- fix-member-rls-admin-permissions.sql
- fix-member-rls-final.sql
- fix-member-rls-no-recursion.sql
- fix-member-rls-policies-v2.sql
- fix-member-rls-policies.sql
- fix-member-rls-simple-owner-only.sql
- fix-members-view-all-members.sql
- fix-rls-cleanup-and-final.sql
- fix-rls-correct-order.sql
- fix-rls-final.sql
- fix-rls-member-final-v2.sql
- fix-rls-no-recursion.sql
- fix-rls-policies.sql
- fix-rls-remove-old-function.sql
- fix-rls-with-function.sql
- fix-rls-with-helper-function.sql
- fix-user-stokvels-rls.sql
- force-fix-rls-policies.sql
- restore-member-rls-policies.sql
- verify-current-policies.sql

### Category 2: Diagnostic/Debug Files (3 files)
- check-member-count.sql (diagnostic)
- diagnostic-queries.sql (temporary debugging)

### Category 3: Obsolete Schema Files (2 files)
- database-schema.sql (old single-stokvel schema, replaced by multi-stokvel)

### Category 4: Miscellaneous Fixes (4 files)
- create-missing-function.sql (function now in main schema)
- fix-contribution-constraint.sql (constraint now in main schema)
- fix-database-schema.sql (changes incorporated into main schema)
- fix-member-linking.sql (obsolete)
- remove-member-fkey-constraint.sql (obsolete)

### Category 5: Experimental/Unused Features (2 files)
- lottery-system-schema.sql (feature not implemented)
- setup-storage-simple.sql (duplicate of setup-storage-bucket.sql)

---

## Cleanup Strategy

1. Create backup folder for deleted files
2. Move redundant files to backup
3. Keep only 7 essential files
4. Update .gitignore if needed

---

## Final File Structure

```
/
├── database-schema-multi-stokvel.sql    (main schema)
├── add-fairness-fields-migration.sql    (applied migration)
├── database-settings-migration.sql      (config migration)
├── verify-constraints.sql               (verification tool)
├── check-schema.sql                     (verification tool)
├── setup-storage-bucket.sql             (storage setup)
└── create-storage-policies.sql          (storage security)
```

**Result**: 7 files (down from 46)
**Reduction**: 84% fewer files
