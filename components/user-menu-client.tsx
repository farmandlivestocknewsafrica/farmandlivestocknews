'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogOut, Settings, User, Menu, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UserMenuProps {
  email: string
  name?: string
  role: 'author' | 'editor' | 'admin' | 'superadmin' | 'user'
}

export function UserMenuClient({ email, name, role }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const isAdmin = ['admin', 'superadmin', 'editor'].includes(role)
  const displayName = name || email?.split('@')[0] || 'User'

  if (isAdmin) {
    return (
      <Link
        href="/admin/dashboard"
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-foreground/10 transition text-sm font-medium"
        aria-label="Go to admin dashboard"
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline truncate max-w-[150px]">{displayName}</span>
      </Link>
    )
  }

  async function handleLogout() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        window.dispatchEvent(new Event('auth:change'))
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition text-sm font-medium text-foreground"
        aria-label="User menu"
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline truncate max-w-[150px]">{displayName}</span>
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-2">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-border">
            <p className="font-semibold text-sm text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
            <p className="text-xs text-primary capitalize mt-1">{role}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/account"
              className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4" />
              <span>Account Settings</span>
            </Link>

            <button
              onClick={() => {
                setIsOpen(false)
                handleLogout()
              }}
              disabled={isLoading}
              className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-muted transition w-full text-left disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
