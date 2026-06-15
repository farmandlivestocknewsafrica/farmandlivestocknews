import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { AccountSettingsClient } from '@/components/admin/account-settings-client'

export default async function AdminAccountSettingsPage() {
  const session = await getSession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your admin account, password, and preferences</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <AccountSettingsClient adminId={session.id} email={session.email} role={session.role} />
      </div>
    </div>
  )
}
