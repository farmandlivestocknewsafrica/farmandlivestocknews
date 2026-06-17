import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { verifyPassword, hashPassword } from '@/lib/auth/password'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return Response.json({ error: 'Current and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return Response.json(
        { error: 'Password must contain uppercase, lowercase, and numbers' },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    const { data: admin, error: fetchError } = await supabase
      .from('admin_accounts')
      .select('password_hash')
      .eq('id', session.adminId)
      .single()

    if (fetchError || !admin) {
      return Response.json({ error: 'Admin account not found' }, { status: 404 })
    }

    const isValid = await verifyPassword(currentPassword, admin.password_hash)
    if (!isValid) {
      return Response.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    const newPasswordHash = await hashPassword(newPassword)
    const now = new Date().toISOString()

    const { error: updateError } = await supabase
      .from('admin_accounts')
      .update({
        password_hash: newPasswordHash,
        last_password_change_at: now,
        updated_at: now,
      })
      .eq('id', session.adminId)

    if (updateError) {
      return Response.json({ error: 'Failed to update password' }, { status: 500 })
    }

    const clientIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    await supabase.from('admin_logs').insert({
      admin_id: session.adminId,
      action: 'password_change',
      description: 'Password changed from account settings',
      ip_address: clientIp,
    })

    return Response.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('[admin] Change password error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
