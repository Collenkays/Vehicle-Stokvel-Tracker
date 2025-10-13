#!/usr/bin/env node
// Apply database migration using Supabase REST API
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

console.log('🔧 Applying database migration...\n')

// Create admin client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  try {
    // Step 1: Drop the incorrect constraint
    console.log('📝 Step 1: Dropping incorrect foreign key constraint...')

    const dropSQL = `
      ALTER TABLE public.stokvel_contributions
      DROP CONSTRAINT IF EXISTS stokvel_contributions_member_id_fkey;
    `

    const { error: dropError } = await supabase.rpc('exec_sql', { query: dropSQL })

    if (dropError && !dropError.message.includes('does not exist')) {
      // Try direct approach
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: dropSQL })
      })

      if (!response.ok) {
        throw new Error(`Failed to drop constraint: ${await response.text()}`)
      }
    }

    console.log('✅ Constraint dropped\n')

    // Step 2: Add the correct constraint
    console.log('📝 Step 2: Adding correct foreign key constraint...')

    const addSQL = `
      ALTER TABLE public.stokvel_contributions
      ADD CONSTRAINT stokvel_contributions_member_id_fkey
      FOREIGN KEY (member_id)
      REFERENCES public.user_stokvel_members(id)
      ON DELETE CASCADE;
    `

    const { error: addError } = await supabase.rpc('exec_sql', { query: addSQL })

    if (addError) {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: addSQL })
      })

      if (!response.ok) {
        throw new Error(`Failed to add constraint: ${await response.text()}`)
      }
    }

    console.log('✅ Constraint added\n')
    console.log('🎉 Migration completed successfully!')
    console.log('👉 Please refresh your application and try adding a contribution\n')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.log('\n📋 Please apply manually via Supabase Dashboard:')
    console.log('   https://supabase.com/dashboard/project/acagbluesumlpggxnlbm/sql\n')
    process.exit(1)
  }
}

runMigration()
