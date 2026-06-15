'use client'

import { usePathname } from 'next/navigation'
import { AdminSidebar } from './admin-sidebar'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isAuthPage, setIsAuthPage] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const authPaths = ['/admin/login', '/admin/setup', '/admin/register', '/admin/forgot-password']
    setIsAuthPage(authPaths.some(path => pathname === path))
  }, [pathname])

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        collapsed ? "ml-20" : "ml-64"
      )}>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
