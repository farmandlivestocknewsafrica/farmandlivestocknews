
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const VALID_CATEGORIES = [
  'agribusiness',
  'crop_production',
  'livestock_farming',
  'technology_innovation',
  'equipment_mechanisation',
  'nutrition',
  'policy_regulations',
  'veterinary_protection',
] as const

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    const category = searchParams.get('category')
    const rawPage = Number(searchParams.get('page') || '1')
    const rawLimit = Number(searchParams.get('limit') || '20')

    if (
      !Number.isSafeInteger(rawPage) ||
      rawPage < 1 ||
      !Number.isSafeInteger(rawLimit) ||
      rawLimit < 1
    ) {
      return NextResponse.json(
        { error: 'Page and limit must be positive whole numbers.' },
        { status: 400 }
      )
    }

    if (
      category &&
      !VALID_CATEGORIES.includes(
        category as (typeof VALID_CATEGORIES)[number]
      )
    ) {
      return NextResponse.json(
        { error: 'Invalid category.' },
        { status: 400 }
      )
    }

    const page = rawPage
    const limit = Math.min(rawLimit, 50)
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('id', { ascending: false })
      .range(from, to)

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Articles fetch error:', error)

      return NextResponse.json(
        { error: 'Failed to fetch articles from the database.' },
        { status: 500 }
      )
    }

    const total = count ?? 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json(
      {
        articles: data ?? [],
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    console.error('Articles API error:', error)

    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
