import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Check if admin system needs setup
 * GET /api/admin/check-setup
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: admins, error } = await supabase
      .from('admin_accounts')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('[v0] Check setup error:', error)
      return NextResponse.json({ 
        needsSetup: true,
        error: 'Database error'
      })
    }
    
    const needsSetup = !admins || admins.length === 0
    
    return NextResponse.json({ 
      needsSetup,
      message: needsSetup ? 'No admin exists, setup required' : 'Admin exists'
    })
  } catch (error) {
    console.error('[v0] Check setup error:', error)
    return NextResponse.json({ 
      needsSetup: true,
      error: 'Check failed'
    })
  }
}
