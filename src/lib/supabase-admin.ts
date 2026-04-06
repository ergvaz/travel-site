import { createClient } from '@supabase/supabase-js'

// Server-only — never import this in client components.
// Lazy getter so the client is only created at request time,
// not during the Next.js build when env vars aren't available.
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
