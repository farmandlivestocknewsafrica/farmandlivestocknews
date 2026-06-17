import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import type { AuthUser, AuthSession } from './auth-context'
import {
  AUTH_COOKIE,
  createToken,
  getSessionTokenFromCookies,
  getUserIdFromPayload,
  SESSION_DURATION,
  verifyToken,
} from './token'
import { SESSION_COOKIE_OPTIONS } from './cookie-config'

export interface SessionPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

function parseUserAgent(userAgent: string | null): { deviceName: string; browser: string } {
  const ua = userAgent || 'Unknown'
  let browser = 'Unknown'

  if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Edg/')) browser = 'Edge'
  else if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Safari')) browser = 'Safari'

  const deviceName = /Mobile|Android|iPhone/i.test(ua) ? 'Mobile' : 'Desktop'
  return { deviceName, browser }
}

/**
 * Create and store a new JWT session token with DB tracking.
 */
export async function createAuthSession(
  user: AuthUser,
  metadata?: { userAgent?: string | null; ipAddress?: string | null },
): Promise<string> {
  const token = await createToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  const supabase = await createAdminClient()
  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000)
  const { deviceName, browser } = parseUserAgent(metadata?.userAgent ?? null)

  await supabase.from('admin_sessions').insert({
    admin_id: user.id,
    session_token: token,
    device_name: deviceName,
    browser,
    ip_address: metadata?.ipAddress || 'unknown',
    expires_at: expiresAt.toISOString(),
    is_active: true,
    last_activity_at: new Date().toISOString(),
  })

  return token
}

/**
 * Ensure a legacy JWT without a DB record gets migrated into admin_sessions.
 */
async function ensureSessionRecord(
  token: string,
  userId: string,
  metadata?: { userAgent?: string | null; ipAddress?: string | null },
): Promise<string | null> {
  const supabase = await createAdminClient()

  const { data: existing } = await supabase
    .from('admin_sessions')
    .select('id')
    .eq('session_token', token)
    .eq('is_active', true)
    .maybeSingle()

  if (existing?.id) return existing.id

  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000)
  const { deviceName, browser } = parseUserAgent(metadata?.userAgent ?? null)

  const { data: created, error } = await supabase
    .from('admin_sessions')
    .insert({
      admin_id: userId,
      session_token: token,
      device_name: deviceName,
      browser,
      ip_address: metadata?.ipAddress || 'unknown',
      expires_at: expiresAt.toISOString(),
      is_active: true,
      last_activity_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error || !created) {
    console.error('[auth] Failed to migrate session record:', error)
    return null
  }

  return created.id
}

/**
 * Get current authenticated session from cookies.
 * Reads auth_session and legacy admin_session cookies.
 */
export async function getCurrentSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies()
  const token = getSessionTokenFromCookies(cookieStore)

  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  const userId = getUserIdFromPayload(payload)
  if (!userId) return null

  const supabase = await createAdminClient()
  const { data: user, error } = await supabase
    .from('admin_accounts')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !user || !user.is_active) return null

  let { data: sessionData } = await supabase
    .from('admin_sessions')
    .select('*')
    .eq('session_token', token)
    .eq('is_active', true)
    .maybeSingle()

  if (!sessionData) {
    const sessionId = await ensureSessionRecord(token, userId)
    if (!sessionId) return null

    const { data: migrated } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    sessionData = migrated
  }

  if (!sessionData) return null

  if (new Date(sessionData.expires_at) < new Date()) {
    await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('id', sessionData.id)
    return null
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url,
      is_active: user.is_active,
      email_verified: user.email_verified,
      created_at: user.created_at,
      last_login_at: user.last_login_at,
    },
    sessionId: sessionData.id,
    expiresAt: new Date(sessionData.expires_at),
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE, token, SESSION_COOKIE_OPTIONS)
  cookieStore.set('admin_session', token, SESSION_COOKIE_OPTIONS)
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE)
  cookieStore.delete('admin_session')
}

export async function logoutOtherSessions(userId: string, currentSessionId: string): Promise<void> {
  const supabase = await createAdminClient()

  await supabase
    .from('admin_sessions')
    .update({ is_active: false })
    .eq('admin_id', userId)
    .neq('id', currentSessionId)
}

export async function logoutAllSessions(userId: string): Promise<void> {
  const supabase = await createAdminClient()

  await supabase
    .from('admin_sessions')
    .update({ is_active: false })
    .eq('admin_id', userId)

  await clearAuthCookie()
}

export async function logoutCurrentSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = getSessionTokenFromCookies(cookieStore)

  if (!token) return

  const supabase = await createAdminClient()

  await supabase
    .from('admin_sessions')
    .update({ is_active: false })
    .eq('session_token', token)

  await clearAuthCookie()
}

export async function updateSessionActivity(sessionId: string): Promise<void> {
  const supabase = await createAdminClient()

  await supabase
    .from('admin_sessions')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', sessionId)
}

export async function getUserSessions(userId: string) {
  const supabase = await createAdminClient()

  const { data: sessions } = await supabase
    .from('admin_sessions')
    .select('*')
    .eq('admin_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return sessions || []
}

// Re-export token helpers for middleware and legacy callers
export { verifyToken as verifyAuthToken } from './token'
