import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSession, logoutAllSessions } from '@/lib/auth/unified-session'
import { createClient } from '@/lib/supabase/server'
import { verifyPassword, hashPassword } from '@/lib/auth/password'

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession()

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { current_password, new_password } = await req.json()

    if (!current_password || !new_password) {
      return NextResponse.json({ message: 'Current and new password are required' }, { status: 400 })
    }

    if (new_password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Validate password strength
    const hasUpperCase = /[A-Z]/.test(new_password)
    const hasLowerCase = /[a-z]/.test(new_password)
    const hasNumber = /[0-9]/.test(new_password)

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return NextResponse.json(
        { message: 'Password must contain uppercase, lowercase, and numbers' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get admin account
    const { data: admin, error: fetchError } = await supabase
      .from('admin_accounts')
      .select('password_hash')
      .eq('id', session.user.id)
      .single()

    if (fetchError || !admin) {
      return NextResponse.json({ message: 'Account not found' }, { status: 404 })
    }

    // Verify current password
    const isValid = await verifyPassword(current_password, admin.password_hash)

    if (!isValid) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 401 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(new_password)

    // Update password
    const { error: updateError } = await supabase
      .from('admin_accounts')
      .update({ password_hash: hashedPassword })
      .eq('id', session.user.id)

    if (updateError) {
      return NextResponse.json({ message: 'Failed to update password' }, { status: 500 })
    }

    // Logout all sessions on password change for security
    await logoutAllSessions(session.user.id)

    return NextResponse.json(
      { message: 'Password changed successfully. Please log in again.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
