import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { AdminUsersList } from '@/components/admin/admin-users-list'
import { Button } from '@/components/ui/button'

export default async function AdminUsersPage() {
  const session = await getSession()

  // Only super admins can access this page
  if (!session || session.role !== 'superadmin') {
    redirect('/admin/login')
  }

  const supabase = await createClient()

  // Fetch all admin accounts
  const { data: admins, error } = await supabase
    .from('admin_accounts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[v0] Error fetching admins:', error)
    notFound()
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Admin Management</h1>
          <p className="text-muted-foreground">Manage administrator accounts and permissions</p>
        </div>
        <Link href="/admin/settings/users/new">
          <Button className="bg-primary hover:opacity-90">Create Admin</Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <AdminUsersList admins={admins || []} />
      </div>
    </div>
  )
}
