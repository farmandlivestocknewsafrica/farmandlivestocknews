'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { AuthUser } from '@/lib/auth/auth-context'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  refreshSession: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      })

      if (!response.ok) {
        setUser(null)
        return
      }

      const data = await response.json()
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } finally {
      setUser(null)
      window.dispatchEvent(new Event('auth:change'))
      router.push('/')
      router.refresh()
    }
  }, [router])

  useEffect(() => {
    setIsLoading(true)
    refreshSession()
  }, [pathname, refreshSession])

  useEffect(() => {
    const handleAuthChange = () => {
      refreshSession()
    }

    window.addEventListener('auth:change', handleAuthChange)
    window.addEventListener('focus', handleAuthChange)

    return () => {
      window.removeEventListener('auth:change', handleAuthChange)
      window.removeEventListener('focus', handleAuthChange)
    }
  }, [refreshSession])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      refreshSession,
      signOut,
    }),
    [user, isLoading, refreshSession, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
