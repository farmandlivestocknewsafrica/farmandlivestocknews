import Link from 'next/link'
import { getCurrentSession } from '@/lib/auth/unified-session'
import { getRoleDisplayName } from '@/lib/auth/auth-context'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

function getInitials(name: string, email: string): string {
  const source = name.trim() || email
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return source.substring(0, 2).toUpperCase()
}

export async function AdminAccountBadge() {
  const session = await getCurrentSession()

  if (!session) return null

  const { full_name, email, role } = session.user
  const displayName = full_name?.trim() || email.split('@')[0]
  const accountType = getRoleDisplayName(role)

  return (
    <Link
      href="/admin/settings/account"
      className={cn(
        'flex items-center gap-3 px-4 py-2 bg-card border border-border rounded-lg shadow-sm',
        'hover:bg-muted/50 hover:border-primary/30 transition-colors'
      )}
      title="Account settings"
    >
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        {full_name?.trim() ? (
          <span className="text-sm font-bold text-primary">{getInitials(full_name, email)}</span>
        ) : (
          <User className="w-4 h-4 text-primary" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground truncate">{accountType}</p>
      </div>
    </Link>
  )
}
