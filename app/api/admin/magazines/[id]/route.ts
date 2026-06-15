import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ error: 'Magazine ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('magazines')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[v0] Failed to delete magazine:', error)
      return NextResponse.json({ error: 'Failed to delete magazine' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting magazine:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ error: 'Magazine ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('magazines')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('[v0] Failed to fetch magazine:', error)
      return NextResponse.json({ error: 'Failed to fetch magazine' }, { status: 500 })
    }

    return NextResponse.json({ magazine: data })
  } catch (error) {
    console.error('[v0] Error fetching magazine:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Magazine ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('magazines')
      .update(body)
      .eq('id', id)
      .select()

    if (error) {
      console.error('[v0] Failed to update magazine:', error)
      return NextResponse.json({ error: 'Failed to update magazine' }, { status: 500 })
    }

    return NextResponse.json({ magazine: data?.[0] })
  } catch (error) {
    console.error('[v0] Error updating magazine:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
