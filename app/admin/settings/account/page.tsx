import { getSession } from '@/lib/auth/session'
import { getCurrentSession } from '@/lib/auth/unified-session'
import { getAccountOverview } from '@/lib/admin/get-account-overview'
import { AccountCommandCenter } from '@/components/admin/account-command-center'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminAccountSettingsPage() {
  const session = await getSession()
  const authSession = await getCurrentSession()

  if (!session || !authSession) {
    redirect('/admin/login')
  }

  const overview = await getAccountOverview(session.adminId, authSession.sessionId)

  if (!overview) {
    redirect('/admin/login')
  }

  return (
    <div className="max-w-6xl space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Account Command Center</h1>
        <p className="text-muted-foreground mt-1">
          Manage your identity, security, sessions, and platform preferences
        </p>
      </div>

      <AccountCommandCenter data={overview} />
    </div>
  )
}
