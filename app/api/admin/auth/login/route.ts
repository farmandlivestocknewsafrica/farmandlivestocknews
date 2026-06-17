import { createClient } from '@/lib/supabase/server'
import { verifyPassword } from '@/lib/auth/password'
import { createAuthSession } from '@/lib/auth/unified-session'
import { applySessionCookies } from '@/lib/auth/cookie-config'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    const { data: admin, error } = await supabase
      .from('admin_accounts')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !admin) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 },
      )
    }

    if (!admin.is_active) {
      return NextResponse.json(
        { message: 'This account has been deactivated' },
        { status: 403 },
      )
    }

    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      return NextResponse.json(
        { message: 'Account is temporarily locked. Try again later.' },
        { status: 429 },
      )
    }

    const passwordValid = await verifyPassword(password, admin.password_hash)

    if (!passwordValid) {
      const newFailedAttempts = (admin.failed_login_attempts || 0) + 1
      const lockAccount = newFailedAttempts >= 5

      await supabase
        .from('admin_accounts')
        .update({
          failed_login_attempts: newFailedAttempts,
          locked_until: lockAccount
            ? new Date(Date.now() + 30 * 60 * 1000).toISOString()
            : null,
        })
        .eq('id', admin.id)

      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 },
      )
    }

    const clientIp =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    await supabase
      .from('admin_accounts')
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString(),
        last_login_ip: clientIp,
        last_login_user_agent: userAgent,
      })
      .eq('id', admin.id)

    const token = await createAuthSession(
      {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
        avatar_url: admin.avatar_url,
        is_active: admin.is_active,
        email_verified: admin.email_verified,
        created_at: admin.created_at,
        last_login_at: admin.last_login_at,
      },
      { userAgent, ipAddress: clientIp },
    )

    const mustChangeCredentials = admin.must_change_credentials === true

    const response = NextResponse.json(
      {
        message: 'Login successful',
        mustChangeCredentials,
        redirectTo: mustChangeCredentials
          ? '/admin/force-setup'
          : '/admin/dashboard',
      },
      { status: 200 },
    )

    applySessionCookies(response, token)

    await supabase.from('admin_logs').insert({
      admin_id: admin.id,
      action: 'login',
      ip_address: clientIp,
      user_agent: userAgent,
      description: `Logged in from ${clientIp}`,
    })

    return response
  } catch (error) {
    console.error('[auth] Login error:', error)
    return NextResponse.json(
      { message: 'An error occurred. Please try again.' },
      { status: 500 },
    )
  }
}
