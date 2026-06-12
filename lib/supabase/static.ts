import { createClient } from '@supabase/supabase-js'

/**
 * Creates a static, cookie-free Supabase client.
 * Use this in Server Components for public data fetching.
 * This allows pages to be statically pre-rendered/cached at build time.
 */
export function createStaticClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
