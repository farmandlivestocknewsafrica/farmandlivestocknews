import { getSession } from '@/lib/auth/session'
import { logoutCurrentSession } from '@/lib/auth/unified-session'
import { clearSessionCookies } from '@/lib/auth/cookie-config'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    await logoutCurrentSession()

    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 },
    )

    clearSessionCookies(response)
    return response
  } catch (error) {
    console.error('[auth] Logout error:', error)

    const response = NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 },
    )
    clearSessionCookies(response)
    return response
  }
}
