import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { getSessionTokenFromCookies } from '@/lib/auth/token'
import { verifySession } from '@/lib/auth/session'
import { clearSessionCookies } from '@/lib/auth/cookie-config'
import { logoutCurrentSession } from '@/lib/auth/unified-session'

export async function POST(request: NextRequest) {
  try {
    // Verify admin is logged in
    const token = getSessionTokenFromCookies(request.cookies)
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const session = await verifySession(token)
    if (!session) {
      return NextResponse.json({ message: 'Invalid session' }, { status: 401 })
    }

    const supabase = await createClient()
    const { action, currentPassword, newPassword, newEmail, password } = await request.json()

    // Get current admin
    const { data: admin, error: fetchError } = await supabase
      .from('admin_accounts')
      .select('*')
      .eq('id', session.adminId)
      .single()

    if (fetchError || !admin) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 })
    }

    // Check if admin needs to change credentials
    if (!admin.must_change_credentials) {
      return NextResponse.json({ message: 'Credentials change not required' }, { status: 400 })
    }

    if (action === 'change-password') {
      // Verify current password
      const isPasswordValid = await verifyPassword(currentPassword, admin.password_hash)
      if (!isPasswordValid) {
        return NextResponse.json({ message: 'Current password is incorrect' }, { status: 401 })
      }

      // Validate new password
      if (newPassword.length < 8) {
        return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 })
      }

      if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        return NextResponse.json({ 
          message: 'Password must contain uppercase, lowercase, and number' 
        }, { status: 400 })
      }

      // Hash new password
      const passwordHash = await hashPassword(newPassword)

      // Update password
      const { error: updateError } = await supabase
        .from('admin_accounts')
        .update({ password_hash: passwordHash })
        .eq('id', admin.id)

      if (updateError) {
        console.error('[v0] Password update error:', updateError)
        return NextResponse.json({ message: 'Failed to update password' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Password updated successfully' })
    }

    if (action === 'change-email') {
      // Verify password
      const isPasswordValid = await verifyPassword(password, admin.password_hash)
      if (!isPasswordValid) {
        return NextResponse.json({ message: 'Password is incorrect' }, { status: 401 })
      }

      // Check if email is already in use
      const { data: existingEmail } = await supabase
        .from('admin_accounts')
        .select('id')
        .eq('email', newEmail)
        .neq('id', admin.id)
        .single()

      if (existingEmail) {
        return NextResponse.json({ message: 'Email is already in use' }, { status: 400 })
      }

      // Update email and clear force-setup flags
      const { error: updateError } = await supabase
        .from('admin_accounts')
        .update({ 
          email: newEmail,
          must_change_credentials: false,
          first_login: false,
          email_verified: false
        })
        .eq('id', admin.id)

      if (updateError) {
        console.error('[v0] Email update error:', updateError)
        return NextResponse.json({ message: 'Failed to update email' }, { status: 500 })
      }

      // Invalidate session after email change — user must re-login
      await logoutCurrentSession()
      const response = NextResponse.json({ message: 'Email updated successfully' })
      clearSessionCookies(response)
      return response
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('[v0] Force setup error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
