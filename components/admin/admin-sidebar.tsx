'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Megaphone, 
  BookOpen, 
  Settings, 
  LogOut,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Shield,
  History,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/articles', icon: FileText, label: 'Articles' },
  { href: '/admin/subscriptions', icon: Users, label: 'Subscribers' },
  { href: '/admin/ad-campaigns', icon: Megaphone, label: 'Ad Campaigns' },
  { href: '/admin/magazines', icon: BookOpen, label: 'Magazines' },
  { href: '/admin/media-kits', icon: Download, label: 'Media Kits' },
  { href: '/admin/logs', icon: History, label: 'Audit Logs' },
  { href: '/admin/settings/account', icon: Settings, label: 'Settings' },
]

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        window.dispatchEvent(new Event('auth:change'))
        router.push('/admin/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-50 flex flex-col",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Brand */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-serif font-bold text-xl text-primary">
            <Shield className="w-8 h-8" />
            <span>Admin Panel</span>
          </Link>
        )}
        {collapsed && (
          <Shield className="w-8 h-8 text-primary mx-auto" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : ''}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-primary hover:bg-primary/10 transition-all font-semibold",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Back to Site" : ''}
        >
          <ExternalLink className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Back to Site</span>}
        </Link>
        
        <button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-all",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-semibold shadow-sm",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? 'Log Out' : ''}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>}
        </button>
      </div>
    </aside>
  )
}
