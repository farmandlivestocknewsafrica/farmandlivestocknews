import type { NextResponse } from 'next/server'
import { AUTH_COOKIE, LEGACY_COOKIE, SESSION_DURATION } from './token'

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: SESSION_DURATION,
  path: '/',
}

export function applySessionCookies(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE, token, SESSION_COOKIE_OPTIONS)
  response.cookies.set(LEGACY_COOKIE, token, SESSION_COOKIE_OPTIONS)
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.delete(AUTH_COOKIE)
  response.cookies.delete(LEGACY_COOKIE)
}
