import { NextResponse } from 'next/server'
import { getCurrentSession, logoutOtherSessions } from '@/lib/auth/unified-session'

export async function POST() {
  try {
    const session = await getCurrentSession()

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await logoutOtherSessions(session.user.id, session.sessionId)

    return NextResponse.json({ message: 'Signed out from other sessions' })
  } catch (error) {
    console.error('[auth] Logout other sessions error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
