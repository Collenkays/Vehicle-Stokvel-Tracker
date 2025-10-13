#!/usr/bin/env node
// Apply database migration to fix foreign key constraint
// This script connects directly to PostgreSQL to execute SQL

import pg from 'pg'
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { Client } = pg

// Load environment variables
config()

// Get Supabase connection details from URL
const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Extract project ID from Supabase URL
const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
const connectionString = `postgresql://postgres:[email protected]:5432/postgres`

console.log('🔧 Starting database migration...')
console.log('📍 Project:', projectRef)
console.log('')

async function applyMigration() {
  // Note: For security, we'll use Supabase's REST API approach
  // Direct PostgreSQL connection requires the database password

  console.log('⚠️  Direct PostgreSQL connection requires database password.')
  console.log('📝 Please apply this migration manually in Supabase Dashboard:\n')
  console.log('1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql')
  console.log('2. Copy and paste the following SQL:\n')
  console.log('─'.repeat(80))

  const migrationSQL = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), 'fix-contributions-foreign-key.sql'),
    'utf-8'
  )

  console.log(migrationSQL)
  console.log('─'.repeat(80))
  console.log('\n3. Click "Run" to execute the migration')
  console.log('4. Refresh your application and try adding a contribution\n')
}

applyMigration()
