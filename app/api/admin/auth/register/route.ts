import { createClient } from '@/lib/supabase/server'
import { hashPassword, validatePassword, generateToken } from '@/lib/auth/password'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Register a new admin account
 * Can only be used if no admin accounts exist (first admin registration)
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json()

    // Validate input
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { message: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { message: 'Password does not meet requirements', errors: passwordValidation.errors },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if any admin accounts exist
    const { data: existingAdmins, error: checkError } = await supabase
      .from('admin_accounts')
      .select('id')
      .limit(1)

    if (checkError) {
      return NextResponse.json(
        { message: 'Error checking admin accounts' },
        { status: 500 }
      )
    }

    // Only allow registration if no admins exist
    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json(
        { message: 'Admin accounts already exist. Contact an administrator.' },
        { status: 403 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)
    const verificationToken = generateToken()

    // Create admin account
    const { data: newAdmin, error: createError } = await supabase
      .from('admin_accounts')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        role: 'superadmin', // First admin is superadmin
        is_active: true,
        email_verified: true, // Approve first admin automatically
        verification_token: null,
        verification_token_expires_at: null
      })
      .select()
      .single()

    if (createError) {
      console.error('[v0] Error creating admin:', createError)
      return NextResponse.json(
        { message: 'Error creating admin account' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Admin account created successfully', adminId: newAdmin.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Registration error:', error)
    return NextResponse.json(
      { message: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
