import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('magazines')
      .select('*')
      .order('publication_date', { ascending: false })

    if (error) {
      console.error('[v0] Failed to fetch magazines:', error)
      return NextResponse.json({ magazines: [] }, { status: 500 })
    }

    return NextResponse.json({ magazines: data || [] })
  } catch (error) {
    console.error('[v0] Error fetching magazines:', error)
    return NextResponse.json({ magazines: [] }, { status: 500 })
  }
}
