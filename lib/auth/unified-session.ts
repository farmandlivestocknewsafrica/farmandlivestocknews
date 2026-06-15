import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'
import { createClient } from '@/lib/supabase/server'
import type { AuthUser, AuthSession } from './auth-context'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')
const ALGORITHM = 'HS256'
const AUTH_COOKIE = 'auth_session' // Shared across both public site and CMS
const SESSION_DURATION = 3650 * 24 * 60 * 60 // 10 years in seconds

export interface SessionPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

/**
 * Create and store a new JWT session token
 */
export async function createAuthSession(user: AuthUser): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('3650d')
    .sign(SECRET)

  // Store session token in database for multi-device tracking
  const supabase = await createClient()
  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000)
  
  await supabase
    .from('admin_sessions')
    .insert({
      admin_id: user.id,
      session_token: token,
      device_name: 'Browser', // Can be enhanced with device detection
      browser: 'Unknown',
      expires_at: expiresAt.toISOString(),
      is_active: true
    })

  return token
}

/**
 * Verify JWT token
 */
export async function verifyAuthToken(token: string): Promise<SessionPayload | null> {
  try {
    const verified = await jwtVerify(token, SECRET)
    return verified.payload as SessionPayload
  } catch (error) {
    console.error('[v0] Token verification failed:', error)
    return null
  }
}

/**
 * Get current authenticated session from cookies
 * Works across both public site and CMS
 */
export async function getCurrentSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE)?.value

  if (!token) return null

  const payload = await verifyAuthToken(token)
  if (!payload) return null

  // Fetch full user data from database
  const supabase = await createClient()
  const { data: user, error } = await supabase
    .from('admin_accounts')
    .select('*')
    .eq('id', payload.userId)
    .single()

  if (error || !user) return null

  // Check if session is still active in database
  const { data: sessionData } = await supabase
    .from('admin_sessions')
    .select('*')
    .eq('session_token', token)
    .eq('is_active', true)
    .single()

  if (!sessionData) return null

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
      last_login_at: user.last_login_at
    },
    sessionId: sessionData.id,
    expiresAt: new Date(sessionData.expires_at)
  }
}

/**
 * Set authenticated session cookie
 * Shared across both public site and CMS
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/' // Shared across entire domain
  })
}

/**
 * Clear authentication cookie
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE)
}

/**
 * Logout from all devices
 */
export async function logoutAllSessions(userId: string): Promise<void> {
  const supabase = await createClient()
  
  // Mark all sessions as inactive
  await supabase
    .from('admin_sessions')
    .update({ is_active: false })
    .eq('admin_id', userId)

  // Clear current session cookie
  await clearAuthCookie()
}

/**
 * Logout from current device
 */
export async function logoutCurrentSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE)?.value

  if (!token) return

  const supabase = await createClient()
  
  // Mark this session as inactive
  await supabase
    .from('admin_sessions')
    .update({ is_active: false })
    .eq('session_token', token)

  // Clear session cookie
  await clearAuthCookie()
}

/**
 * Update last activity timestamp for session
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  const supabase = await createClient()
  
  await supabase
    .from('admin_sessions')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', sessionId)
}

/**
 * Get all active sessions for user
 */
export async function getUserSessions(userId: string) {
  const supabase = await createClient()
  
  const { data: sessions } = await supabase
    .from('admin_sessions')
    .select('*')
    .eq('admin_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return sessions || []
}
