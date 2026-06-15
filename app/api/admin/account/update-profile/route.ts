import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { adminId, displayName, email } = await request.json()

    // Security: ensure user can only update their own profile
    if (adminId !== session.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const supabase = await createClient()

    // Update profile
    const { error } = await supabase
      .from('admin_accounts')
      .update({
        display_name: displayName,
        email: email,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminId)

    if (error) {
      console.error('[v0] Update profile error:', error)
      return Response.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return Response.json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('[v0] Update profile error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
