import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const supabase = await createClient()
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (body.notifications) {
      updates.notification_preferences = body.notifications
    }
    if (body.appearance) {
      updates.appearance_preferences = body.appearance
    }
    if (typeof body.two_factor_enabled === 'boolean') {
      updates.two_factor_enabled = body.two_factor_enabled
    }
    if (body.recovery_email !== undefined) {
      updates.recovery_email = body.recovery_email?.trim() || null
    }

    const { error } = await supabase
      .from('admin_accounts')
      .update(updates)
      .eq('id', session.adminId)

    if (error) {
      console.error('[admin] Preferences update error:', error)
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Preferences saved' })
  } catch (error) {
    console.error('[admin] Preferences error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
