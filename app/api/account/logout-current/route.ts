import { NextResponse } from 'next/server'
import { logoutCurrentSession } from '@/lib/auth/unified-session'
import { clearSessionCookies } from '@/lib/auth/cookie-config'

export async function POST() {
  try {
    await logoutCurrentSession()

    const response = NextResponse.json(
      { message: 'Logged out from this device' },
      { status: 200 },
    )
    clearSessionCookies(response)
    return response
  } catch (error) {
    console.error('[auth] Logout current device error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
