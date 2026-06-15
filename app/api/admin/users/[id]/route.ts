import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession()

  // Only super admins can update users
  if (!session || session.role !== 'superadmin') {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 403 }
    )
  }

  try {
    const { id } = await params
    const { is_active, role, name } = await req.json()

    const supabase = await createClient()

    const updateData: any = {}
    if (typeof is_active === 'boolean') updateData.is_active = is_active
    if (role) updateData.role = role
    if (name) updateData.name = name

    const { error } = await supabase
      .from('admin_accounts')
      .update(updateData)
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Admin updated successfully' })
  } catch (error) {
    console.error('[v0] Error updating admin:', error)
    return NextResponse.json(
      { message: 'Failed to update admin' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getSession()

  // Only super admins can delete users
  if (!session || session.role !== 'superadmin') {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 403 }
    )
  }

  try {
    const { id } = await params

    // Don't allow deleting yourself
    if (id === session.adminId) {
      return NextResponse.json(
        { message: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('admin_accounts')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Admin deleted successfully' })
  } catch (error) {
    console.error('[v0] Error deleting admin:', error)
    return NextResponse.json(
      { message: 'Failed to delete admin' },
      { status: 500 }
    )
  }
}
