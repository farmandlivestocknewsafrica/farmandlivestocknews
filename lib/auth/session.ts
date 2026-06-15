import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')
const ALGORITHM = 'HS256'
const COOKIE_NAME = 'admin_session'
const SESSION_DURATION = 3650 * 24 * 60 * 60 // 10 years in seconds

export interface SessionPayload {
  adminId: string
  email: string
  role: 'editor' | 'moderator' | 'admin' | 'superadmin'
  iat?: number
  exp?: number
}

/**
 * Create a JWT session token
 */
export async function createSession(payload: Omit<SessionPayload, 'iat' | 'exp'>): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('3650d')
    .sign(SECRET)

  return token
}

/**
 * Verify and parse a JWT session token
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const verified = await jwtVerify(token, SECRET)
    return verified.payload as SessionPayload
  } catch (error) {
    console.error('[v0] Session verification failed:', error)
    return null
  }
}

/**
 * Get session from cookies
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null

  return verifySession(token)
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/'
  })
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRole: string): boolean {
  const roles = ['editor', 'moderator', 'admin', 'superadmin']
  const userRoleIndex = roles.indexOf(userRole)
  const requiredRoleIndex = roles.indexOf(requiredRole)

  return userRoleIndex >= requiredRoleIndex
}
