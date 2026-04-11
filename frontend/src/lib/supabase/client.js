import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client
 * Used for authentication only
 * Backend API handles all data operations
 */
export const supabase = createBrowserClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
