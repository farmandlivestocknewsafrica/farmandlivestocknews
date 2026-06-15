import { createClient } from '@/lib/supabase/server'
import { verifyPassword, hashPassword } from '@/lib/auth/password'
import { createSession, setSessionCookie } from '@/lib/auth/session'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get admin account from database
    const { data: admin, error } = await supabase
      .from('admin_accounts')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !admin) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if account is active
    if (!admin.is_active) {
      return NextResponse.json(
        { message: 'This account has been deactivated' },
        { status: 403 }
      )
    }

    // Check if account is locked (too many failed attempts)
    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      return NextResponse.json(
        { message: 'Account is temporarily locked. Try again later.' },
        { status: 429 }
      )
    }

    // Verify password
    const passwordValid = await verifyPassword(password, admin.password_hash)

    if (!passwordValid) {
      // Increment failed login attempts
      const newFailedAttempts = (admin.failed_login_attempts || 0) + 1
      const lockAccount = newFailedAttempts >= 5

      await supabase
        .from('admin_accounts')
        .update({
          failed_login_attempts: newFailedAttempts,
          locked_until: lockAccount ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null
        })
        .eq('id', admin.id)

      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Reset failed login attempts
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    await supabase
      .from('admin_accounts')
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString(),
        last_login_ip: clientIp,
        last_login_user_agent: userAgent
      })
      .eq('id', admin.id)

    // Create session
    const token = await createSession({
      adminId: admin.id,
      email: admin.email,
      role: admin.role
    })

    // Check if credentials must be changed
    const mustChangeCredentials = admin.must_change_credentials === true

    // Set session cookie
    const response = NextResponse.json(
      { 
        message: 'Login successful',
        mustChangeCredentials,
        redirectTo: mustChangeCredentials ? '/admin/force-setup' : '/admin/dashboard'
      },
      { status: 200 }
    )

    // Set cookie on response
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3650 * 24 * 60 * 60, // 10 years in seconds
      path: '/'
    })

    // Log successful login
    await supabase
      .from('admin_logs')
      .insert({
        admin_id: admin.id,
        action: 'login',
        ip_address: clientIp,
        user_agent: userAgent,
        description: `Logged in from ${clientIp}`
      })

    return response
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json(
      { message: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
