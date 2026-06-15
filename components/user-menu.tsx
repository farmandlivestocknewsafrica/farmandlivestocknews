import { getSession } from '@/lib/auth/session'
import { UserMenuClient } from './user-menu-client'
import Link from 'next/link'

export async function UserMenu() {
  const session = await getSession()

  if (!session) {
    return (
      <Link
        href="/admin/login"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm font-medium"
      >
        Login
      </Link>
    )
  }

  return (
    <UserMenuClient
      email={session.email}
      role={session.role}
    />
  )
}
