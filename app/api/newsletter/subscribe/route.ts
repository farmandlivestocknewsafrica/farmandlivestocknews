import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { message: 'Valid email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (existing) {
      return NextResponse.json(
        { message: 'Already subscribed', subscribed: true },
        { status: 200 }
      )
    }

    // Subscribe user
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        is_active: true,
        subscribed_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('[v0] Newsletter subscription error:', error)
      return NextResponse.json(
        { message: 'Failed to subscribe' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Successfully subscribed',
      subscribed: true,
      data
    })
  } catch (error) {
    console.error('[v0] Newsletter error:', error)
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    )
  }
}
