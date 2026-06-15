import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title,
      issue_number,
      publication_date,
      description,
      pages_count,
      cover_image_url,
      pdf_url
    } = body

    if (!title || !issue_number || !publication_date) {
      return NextResponse.json(
        { message: 'Title, issue number, and publication date are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('magazines')
      .insert({
        title,
        issue_number,
        publication_date,
        description: description || null,
        pages_count: pages_count || null,
        cover_image_url: cover_image_url || null,
        pdf_url: pdf_url || null,
        available_for_download: true,
        featured: false
      })
      .select()

    if (error) {
      console.error('[v0] Failed to create magazine:', error)
      return NextResponse.json(
        { message: 'Failed to create magazine' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Magazine created', data })
  } catch (error) {
    console.error('[v0] Error creating magazine:', error)
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
      .from('magazines')
      .select('*')
      .order('publication_date', { ascending: false })

    if (error) {
      console.error('[v0] Failed to fetch magazines:', error)
      return NextResponse.json({ magazines: [], error: 'Failed to fetch magazines' }, { status: 500 })
    }

    return NextResponse.json({ magazines: data || [] })
  } catch (error) {
    console.error('[v0] Error fetching magazines:', error)
    return NextResponse.json({ magazines: [], error: 'An error occurred' }, { status: 500 })
  }
}
