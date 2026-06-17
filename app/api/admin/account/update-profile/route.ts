import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { full_name, display_name, phone, bio, avatar_url } = await request.json()

    if (!full_name?.trim()) {
      return Response.json({ error: 'Full name is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('admin_accounts')
      .update({
        full_name: full_name.trim(),
        display_name: display_name?.trim() || null,
        phone: phone?.trim() || null,
        bio: bio?.trim() || null,
        avatar_url: avatar_url?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.adminId)

    if (error) {
      console.error('[admin] Update profile error:', error)
      return Response.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    await supabase.from('admin_logs').insert({
      admin_id: session.adminId,
      action: 'profile_update',
      description: 'Updated profile information',
    })

    return Response.json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('[admin] Update profile error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
