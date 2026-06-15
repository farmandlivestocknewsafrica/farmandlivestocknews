import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()

    if (session) {
      const supabase = await createClient()
      const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      const userAgent = req.headers.get('user-agent') || 'unknown'

      // Log logout action
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: session.adminId,
          action: 'logout',
          ip_address: clientIp,
          user_agent: userAgent,
          description: `Logged out from ${clientIp}`
        })
    }

    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )

    // Clear session cookie
    response.cookies.delete('admin_session')

    return response
  } catch (error) {
    console.error('[v0] Logout error:', error)
    return NextResponse.json(
      { message: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
