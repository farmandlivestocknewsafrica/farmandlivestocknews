'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/AuthProvider'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  redirectTo = '/admin/login',
  fallback,
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(redirectTo)
    }
  }, [isLoading, isAuthenticated, router, redirectTo])

  if (isLoading) {
    return (
      fallback ?? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
