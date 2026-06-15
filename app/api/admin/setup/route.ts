import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hashPassword, validatePassword } from '@/lib/auth/password'

/**
 * Create first admin account
 * POST /api/admin/setup
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password, confirmPassword, fullName } = await req.json()

    // Validate input
    if (!email || !password || !confirmPassword || !fullName) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { message: passwordValidation.errors.join('. ') },
        { status: 400 }
      )
    }

    // Validate email format
    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if any admin already exists
    const { data: existingAdmins, error: checkError } = await supabase
      .from('admin_accounts')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error('[v0] Setup check error:', checkError)
      return NextResponse.json(
        { message: 'Database error during setup check' },
        { status: 500 }
      )
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json(
        { message: 'Admin already exists. Setup not available.' },
        { status: 403 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create admin account
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin_accounts')
      .insert({
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        full_name: fullName.trim(),
        role: 'superadmin',
        is_active: true,
        email_verified: true,
        must_change_credentials: false,
        first_login: false
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('[v0] Admin creation error:', insertError)
      return NextResponse.json(
        { message: 'Failed to create admin account' },
        { status: 500 }
      )
    }

    // Log the setup action
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    await supabase
      .from('admin_logs')
      .insert({
        admin_id: newAdmin.id,
        action: 'admin_setup',
        description: 'First admin account created during system setup',
        ip_address: clientIp,
        user_agent: userAgent
      })

    return NextResponse.json({
      message: 'Admin account created successfully',
      success: true
    })
  } catch (error) {
    console.error('[v0] Setup error:', error)
    return NextResponse.json(
      { message: 'An error occurred during setup' },
      { status: 500 }
    )
  }
}
