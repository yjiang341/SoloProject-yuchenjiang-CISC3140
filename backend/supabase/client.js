const { createClient: createSupabaseClient } = require('@supabase/supabase-js')

/**
 * Server-side Supabase client for Express backend
 * Uses service role key for full database access
 */
function createClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }
  
  return createSupabaseClient(supabaseUrl, supabaseServiceKey)
}

module.exports = { createClient }
