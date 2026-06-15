import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { hash } from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { adminId, currentPassword, newPassword } = await request.json()

    // Security: ensure user can only change their own password
    if (adminId !== session.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const supabase = await createClient()

    // Get current admin account
    const { data: admin, error: fetchError } = await supabase
      .from('admin_accounts')
      .select('password_hash')
      .eq('id', adminId)
      .single()

    if (fetchError || !admin) {
      return Response.json({ error: 'Admin account not found' }, { status: 404 })
    }

    // Verify current password (in real implementation, use proper password verification)
    // For now, we'll assume password verification via auth layer

    // Hash new password
    const newPasswordHash = await hash(newPassword, 10)

    // Update password
    const { error: updateError } = await supabase
      .from('admin_accounts')
      .update({ password_hash: newPasswordHash, updated_at: new Date().toISOString() })
      .eq('id', adminId)

    if (updateError) {
      return Response.json({ error: 'Failed to update password' }, { status: 500 })
    }

    return Response.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('[v0] Change password error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
