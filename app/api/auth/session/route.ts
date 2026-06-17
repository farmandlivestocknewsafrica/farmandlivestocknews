import { NextResponse } from 'next/server'
import { getCurrentSession, updateSessionActivity } from '@/lib/auth/unified-session'

export async function GET() {
  try {
    const session = await getCurrentSession()

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    await updateSessionActivity(session.sessionId)

    return NextResponse.json(
      {
        user: session.user,
        sessionId: session.sessionId,
        expiresAt: session.expiresAt.toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      },
    )
  } catch (error) {
    console.error('[auth] Session fetch error:', error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
