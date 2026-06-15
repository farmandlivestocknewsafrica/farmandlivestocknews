import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

/**
 * Check if admin is authenticated and has completed credentials setup
 * Used in layouts/pages to protect admin routes
 */
export async function checkAdminAuth() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_session')?.value

    if (!token) {
      return { authenticated: false, needsSetup: false }
    }

    const session = await verifySession(token)
    if (!session) {
      return { authenticated: false, needsSetup: false }
    }

    const supabase = await createClient()
    const { data: admin } = await supabase
      .from('admin_accounts')
      .select('must_change_credentials, first_login')
      .eq('id', session.adminId)
      .single()

    if (!admin) {
      return { authenticated: false, needsSetup: false }
    }

    // If credentials must be changed, return needsSetup flag
    if (admin.must_change_credentials) {
      return { authenticated: true, needsSetup: true }
    }

    return { authenticated: true, needsSetup: false }
  } catch (error) {
    console.error('[v0] Admin auth check error:', error)
    return { authenticated: false, needsSetup: false }
  }
}

/**
 * Protect a page - redirects if not authenticated or needs setup
 */
export async function requireAdminAuth(currentPath: string) {
  const { authenticated, needsSetup } = await checkAdminAuth()

  if (!authenticated) {
    // Not logged in
    return { redirect: '/admin/login' }
  }

  if (needsSetup && currentPath !== '/admin/force-setup') {
    // Logged in but must complete setup
    return { redirect: '/admin/force-setup' }
  }

  // Can access the page
  return { redirect: null }
}
