import { NextResponse } from 'next/server'
import { seedAdminIfNeeded } from '@/lib/auth/seed-admin'

/**
 * This route initializes the admin system by seeding default admin if needed
 * Call this once on first deployment
 * GET /app/admin/init
 */
export async function GET() {
  try {
    await seedAdminIfNeeded()
    return NextResponse.json({ 
      message: 'Admin initialization complete',
      status: 'success'
    })
  } catch (error) {
    console.error('[v0] Admin initialization error:', error)
    return NextResponse.json({ 
      message: 'Initialization failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    }, { status: 500 })
  }
}
