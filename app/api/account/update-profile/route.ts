import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSession } from '@/lib/auth/unified-session'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession()

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { full_name } = await req.json()

    if (!full_name || full_name.trim().length === 0) {
      return NextResponse.json({ message: 'Full name is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('admin_accounts')
      .update({ full_name: full_name.trim() })
      .eq('id', session.user.id)

    if (error) {
      console.error('[v0] Error updating profile:', error)
      return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('[v0] Error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
