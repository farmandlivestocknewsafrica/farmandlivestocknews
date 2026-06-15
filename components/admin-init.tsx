'use client'

import { useEffect } from 'react'

/**
 * Client component that triggers admin initialization on app startup
 * Calls /app/admin/init to seed default admin if database is empty
 */
export function AdminInit() {
  useEffect(() => {
    // Call initialization endpoint once on client startup
    const initAdmin = async () => {
      try {
        const response = await fetch('/admin/init', { method: 'GET' })
        const data = await response.json()
        if (data.status === 'success') {
          console.log('[v0] Admin system initialized')
        }
      } catch (error) {
        // Silently fail - this is just initialization
        console.error('[v0] Admin init attempt:', error)
      }
    }

    // Run initialization
    initAdmin()
  }, [])

  return null
}
