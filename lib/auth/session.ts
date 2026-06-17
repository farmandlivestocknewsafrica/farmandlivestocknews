import { cookies } from 'next/headers'
import { getCurrentSession } from './unified-session'
import {
  createToken,
  getSessionTokenFromCookies,
  getUserIdFromPayload,
  verifyToken,
} from './token'
import { SESSION_COOKIE_OPTIONS } from './cookie-config'

export interface SessionPayload {
  adminId: string
  email: string
  role: 'editor' | 'moderator' | 'admin' | 'superadmin'
  iat?: number
  exp?: number
}

/**
 * Create a JWT session token (legacy API — prefer createAuthSession).
 */
export async function createSession(
  payload: Omit<SessionPayload, 'iat' | 'exp'>,
): Promise<string> {
  return createToken({
    userId: payload.adminId,
    email: payload.email,
    role: payload.role,
  })
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  const payload = await verifyToken(token)
  if (!payload) return null

  const adminId = getUserIdFromPayload(payload)
  if (!adminId) return null

  return {
    adminId,
    email: payload.email,
    role: payload.role as SessionPayload['role'],
    iat: payload.iat,
    exp: payload.exp,
  }
}

/**
 * Get session from cookies — unified across auth_session and admin_session.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const authSession = await getCurrentSession()
  if (authSession) {
    return {
      adminId: authSession.user.id,
      email: authSession.user.email,
      role: authSession.user.role as SessionPayload['role'],
    }
  }

  const cookieStore = await cookies()
  const token = getSessionTokenFromCookies(cookieStore)
  if (!token) return null

  return verifySession(token)
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('auth_session', token, SESSION_COOKIE_OPTIONS)
  cookieStore.set('admin_session', token, SESSION_COOKIE_OPTIONS)
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('auth_session')
  cookieStore.delete('admin_session')
}

export function hasRole(userRole: string, requiredRole: string): boolean {
  const roles = ['editor', 'moderator', 'admin', 'superadmin']
  const userRoleIndex = roles.indexOf(userRole)
  const requiredRoleIndex = roles.indexOf(requiredRole)

  return userRoleIndex >= requiredRoleIndex
}
