import { NextResponse } from 'next/server'
import { getCurrentSession, logoutAllSessions } from '@/lib/auth/unified-session'
import { clearSessionCookies } from '@/lib/auth/cookie-config'

export async function POST() {
  try {
    const session = await getCurrentSession()

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await logoutAllSessions(session.user.id)

    const response = NextResponse.json(
      { message: 'Logged out from all devices' },
      { status: 200 },
    )
    clearSessionCookies(response)
    return response
  } catch (error) {
    console.error('[auth] Logout all devices error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
