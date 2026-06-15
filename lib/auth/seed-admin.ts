import { createClient } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/auth/password'

/**
 * Seed admin creation - runs on first deployment if no admin exists
 * Creates a default admin with temporary credentials that must be changed on first login
 */
export async function seedAdminIfNeeded() {
  try {
    const supabase = await createClient()
    
    // Check if any admin account exists
    const { data: existingAdmins, error: checkError } = await supabase
      .from('admin_accounts')
      .select('id')
      .limit(1)
    
    if (checkError) {
      console.error('[v0] Error checking admin accounts:', checkError)
      return
    }
    
    // If admin already exists, skip seeding
    if (existingAdmins && existingAdmins.length > 0) {
      console.log('[v0] Admin account already exists, skipping seed')
      return
    }
    
    // Hash the default password
    const defaultPassword = 'Admin@123'
    const passwordHash = await hashPassword(defaultPassword)
    
    // Create seed admin
    const { error: insertError } = await supabase
      .from('admin_accounts')
      .insert({
        email: 'admin@system.local',
        password_hash: passwordHash,
        full_name: 'System Admin',
        role: 'superadmin',
        is_active: true,
        email_verified: false,
        must_change_credentials: true,
        first_login: true
      })
    
    if (insertError) {
      console.error('[v0] Error creating seed admin:', insertError)
      return
    }
    
    console.log('[v0] Seed admin created successfully')
    console.log('[v0] Default credentials: admin@system.local / Admin@123')
    console.log('[v0] User must change credentials on first login')
  } catch (error) {
    console.error('[v0] Seed admin error:', error)
  }
}
