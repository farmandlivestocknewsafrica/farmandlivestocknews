import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title,
      description,
      issue_date,
      file_type,
      file_size_kb,
      cover_image_url,
      file_url
    } = body

    if (!title || !file_url) {
      return NextResponse.json(
        { message: 'Title and file URL are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('media_kits')
      .insert({
        title,
        description: description || null,
        issue_date: issue_date || null,
        file_url,
        file_type: file_type || null,
        file_size_kb: file_size_kb || null,
        cover_image_url: cover_image_url || null,
        available_for_download: true,
        featured: false,
        status: 'published'
      })
      .select()

    if (error) {
      console.error('[v0] Failed to create media kit:', error)
      return NextResponse.json(
        { message: 'Failed to create media kit' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Media kit created', data })
  } catch (error) {
    console.error('[v0] Error creating media kit:', error)
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('media_kits')
      .select('*')
      .eq('status', 'published')
      .order('issue_date', { ascending: false })

    if (error) {
      console.error('[v0] Failed to fetch media kits:', error)
      return NextResponse.json({ media_kits: [], error: 'Failed to fetch media kits' }, { status: 500 })
    }

    return NextResponse.json({ media_kits: data || [] })
  } catch (error) {
    console.error('[v0] Error fetching media kits:', error)
    return NextResponse.json({ media_kits: [], error: 'An error occurred' }, { status: 500 })
  }
}
