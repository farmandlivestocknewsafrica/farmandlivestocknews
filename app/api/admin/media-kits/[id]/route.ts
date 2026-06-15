import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await req.json()

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('media_kits')
      .update(body)
      .eq('id', id)
      .select()

    if (error) {
      console.error('[v0] Failed to update media kit:', error)
      return NextResponse.json(
        { message: 'Failed to update media kit' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Media kit updated', data })
  } catch (error) {
    console.error('[v0] Error updating media kit:', error)
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = await createClient()

    const { error } = await supabase
      .from('media_kits')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[v0] Failed to delete media kit:', error)
      return NextResponse.json(
        { message: 'Failed to delete media kit' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Media kit deleted' })
  } catch (error) {
    console.error('[v0] Error deleting media kit:', error)
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    )
  }
}
