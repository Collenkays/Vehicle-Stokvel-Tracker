#!/usr/bin/env node
// Apply database migration using direct SQL execution via PostgREST
import { readFileSync } from 'fs'

// Read environment variables from .env file
const envContent = readFileSync('.env', 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=')
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim()
  }
})

const supabaseUrl = envVars.VITE_SUPABASE_URL
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

console.log('🔧 Applying database migration to fix foreign key constraint...\n')
console.log('📍 Supabase URL:', supabaseUrl)
console.log('')

// SQL statements to execute
const statements = [
  {
    name: 'Drop incorrect constraint',
    sql: 'ALTER TABLE public.stokvel_contributions DROP CONSTRAINT IF EXISTS stokvel_contributions_member_id_fkey;'
  },
  {
    name: 'Add correct constraint',
    sql: 'ALTER TABLE public.stokvel_contributions ADD CONSTRAINT stokvel_contributions_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.user_stokvel_members(id) ON DELETE CASCADE;'
  }
]

async function executeSQL(sql) {
  // Use PostgREST query endpoint to execute SQL
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ sql })
  })

  return response
}

async function runMigration() {
  try {
    for (const statement of statements) {
      console.log(`📝 ${statement.name}...`)

      const response = await executeSQL(statement.sql)

      // Check if the exec_sql function exists
      if (response.status === 404) {
        console.log('⚠️  Direct SQL execution not available via API')
        console.log('📋 Please apply the migration manually:\n')
        console.log('1. Open: https://supabase.com/dashboard/project/acagbluesumlpggxnlbm/sql')
        console.log('2. Run this SQL:\n')
        console.log('─'.repeat(80))
        statements.forEach(s => console.log(s.sql))
        console.log('─'.repeat(80))
        process.exit(1)
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`${statement.name} failed: ${errorText}`)
      }

      console.log(`✅ ${statement.name} completed\n`)
    }

    console.log('🎉 Migration completed successfully!')
    console.log('👉 Please refresh your application and try adding a contribution with an attachment\n')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.log('\n📋 Please apply manually via Supabase Dashboard:')
    console.log('   https://supabase.com/dashboard/project/acagbluesumlpggxnlbm/sql\n')
    process.exit(1)
  }
}

runMigration()
