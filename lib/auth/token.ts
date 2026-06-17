import { jwtVerify, SignJWT } from 'jose'

export const AUTH_COOKIE = 'auth_session'
export const LEGACY_COOKIE = 'admin_session'
export const SESSION_DURATION = 3650 * 24 * 60 * 60 // 10 years in seconds
const ALGORITHM = 'HS256'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production',
)

export interface TokenPayload {
  userId?: string
  adminId?: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export function getUserIdFromPayload(payload: TokenPayload): string {
  return payload.userId || payload.adminId || ''
}

export async function createToken(payload: {
  userId: string
  email: string
  role: string
}): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('3650d')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const verified = await jwtVerify(token, SECRET)
    return verified.payload as TokenPayload
  } catch (error) {
    console.error('[auth] Token verification failed:', error)
    return null
  }
}

export function getSessionTokenFromCookies(
  cookies: { get: (name: string) => { value: string } | undefined },
): string | undefined {
  return cookies.get(AUTH_COOKIE)?.value || cookies.get(LEGACY_COOKIE)?.value
}
