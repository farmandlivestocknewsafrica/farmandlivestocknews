import { NextResponse } from 'next/server'
import { getCurrentSession, getUserSessions } from '@/lib/auth/unified-session'

export async function GET() {
  try {
    const session = await getCurrentSession()

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await getUserSessions(session.user.id)

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        device_name: s.device_name,
        browser: s.browser,
        ip_address: s.ip_address,
        created_at: s.created_at,
        last_activity_at: s.last_activity_at,
        is_current: s.id === session.sessionId,
      })),
    })
  } catch (error) {
    console.error('[auth] Sessions fetch error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
