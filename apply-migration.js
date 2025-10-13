// Apply database migration to fix foreign key constraint
// This script uses the service role key to execute SQL directly

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  console.log('🔧 Starting database migration...\n')

  try {
    // Step 1: Check current foreign key constraint
    console.log('📋 Step 1: Checking current foreign key constraint...')

    const checkConstraintQuery = `
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name='stokvel_contributions'
        AND kcu.column_name='member_id';
    `

    const { data: currentConstraint, error: checkError } = await supabase.rpc('exec_sql', {
      sql: checkConstraintQuery
    }).select()

    if (checkError) {
      console.log('⚠️  Could not check current constraint (this is ok, continuing...)')
      console.log('   Error:', checkError.message)
    } else {
      console.log('   Current constraint:', currentConstraint)
    }

    // Step 2: Drop the incorrect foreign key constraint
    console.log('\n🗑️  Step 2: Dropping incorrect foreign key constraint...')

    const dropConstraintSQL = `
      ALTER TABLE public.stokvel_contributions
      DROP CONSTRAINT IF EXISTS stokvel_contributions_member_id_fkey;
    `

    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: dropConstraintSQL
    })

    if (dropError) {
      console.error('❌ Failed to drop constraint:', dropError.message)
      throw dropError
    }

    console.log('✅ Constraint dropped successfully')

    // Step 3: Add the correct foreign key constraint
    console.log('\n➕ Step 3: Adding correct foreign key constraint...')

    const addConstraintSQL = `
      ALTER TABLE public.stokvel_contributions
      ADD CONSTRAINT stokvel_contributions_member_id_fkey
      FOREIGN KEY (member_id)
      REFERENCES public.user_stokvel_members(id)
      ON DELETE CASCADE;
    `

    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: addConstraintSQL
    })

    if (addError) {
      console.error('❌ Failed to add constraint:', addError.message)
      throw addError
    }

    console.log('✅ Constraint added successfully')

    // Step 4: Verify the fix
    console.log('\n✅ Step 4: Verifying the fix...')

    const { data: verifyConstraint, error: verifyError } = await supabase.rpc('exec_sql', {
      sql: checkConstraintQuery
    }).select()

    if (verifyError) {
      console.log('⚠️  Could not verify constraint (but migration likely succeeded)')
    } else {
      console.log('   New constraint:', verifyConstraint)

      if (verifyConstraint && verifyConstraint[0]?.foreign_table_name === 'user_stokvel_members') {
        console.log('\n🎉 SUCCESS! Foreign key now correctly points to user_stokvel_members table')
      }
    }

    // Step 5: Check for orphaned contributions
    console.log('\n🔍 Step 5: Checking for orphaned contributions...')

    const checkOrphansSQL = `
      SELECT c.id, c.member_id, c.month, c.amount
      FROM stokvel_contributions c
      LEFT JOIN user_stokvel_members m ON c.member_id = m.id
      WHERE m.id IS NULL
      LIMIT 5;
    `

    const { data: orphans, error: orphanError } = await supabase.rpc('exec_sql', {
      sql: checkOrphansSQL
    }).select()

    if (orphanError) {
      console.log('⚠️  Could not check for orphaned contributions')
    } else if (orphans && orphans.length > 0) {
      console.log('⚠️  Found orphaned contributions (invalid member_id references):')
      console.log('   ', orphans)
      console.log('   You may want to delete these manually')
    } else {
      console.log('✅ No orphaned contributions found')
    }

    console.log('\n✨ Migration completed successfully!')
    console.log('👉 Please refresh your application and try adding a contribution with an attachment')

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error('\nYou may need to apply this migration manually in the Supabase SQL Editor:')
    console.error('1. Go to: https://supabase.com/dashboard/project/acagbluesumlpggxnlbm/sql')
    console.error('2. Paste the contents of fix-contributions-foreign-key.sql')
    console.error('3. Click "Run"')
    process.exit(1)
  }
}

// Run the migration
applyMigration()
