import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Public client using ANON_KEY
 * Respects RLS
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The "setAll" method was called from a Server Component.
          }
        },
      },
    },
  )
}

/**
 * Admin client using SERVICE_ROLE_KEY
 * Bypasses RLS - USE WITH CAUTION
 */
export async function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceKey) {
    console.warn('[v0] SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to public client.')
    return createClient()
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )
}
