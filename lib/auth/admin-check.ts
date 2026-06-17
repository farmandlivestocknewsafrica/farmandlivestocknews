import { cookies } from 'next/headers'
import { verifyToken, getSessionTokenFromCookies, getUserIdFromPayload } from '@/lib/auth/token'
import { createClient } from '@/lib/supabase/server'

/**
 * Check if admin is authenticated and has completed credentials setup.
 */
export async function checkAdminAuth() {
  try {
    const cookieStore = await cookies()
    const token = getSessionTokenFromCookies(cookieStore)

    if (!token) {
      return { authenticated: false, needsSetup: false }
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return { authenticated: false, needsSetup: false }
    }

    const userId = getUserIdFromPayload(payload)
    if (!userId) {
      return { authenticated: false, needsSetup: false }
    }

    const supabase = await createClient()
    const { data: admin } = await supabase
      .from('admin_accounts')
      .select('must_change_credentials, first_login')
      .eq('id', userId)
      .single()

    if (!admin) {
      return { authenticated: false, needsSetup: false }
    }

    if (admin.must_change_credentials) {
      return { authenticated: true, needsSetup: true }
    }

    return { authenticated: true, needsSetup: false }
  } catch (error) {
    console.error('[auth] Admin auth check error:', error)
    return { authenticated: false, needsSetup: false }
  }
}

/**
 * Protect a page — returns redirect path if access should be denied.
 */
export async function requireAdminAuth(currentPath: string) {
  const { authenticated, needsSetup } = await checkAdminAuth()

  if (!authenticated) {
    return { redirect: '/admin/login' }
  }

  if (needsSetup && currentPath !== '/admin/force-setup') {
    return { redirect: '/admin/force-setup' }
  }

  return { redirect: null }
}
