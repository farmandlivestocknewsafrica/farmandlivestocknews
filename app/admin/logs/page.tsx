import { createClient } from '@/lib/supabase/server'
import { History, Shield, Home } from 'lucide-react'
import Link from 'next/link'

export default async function AuditLogs() {
  const supabase = await createClient()
  
  const { data: logs, error } = await supabase
    .from('admin_logs')
    .select('*, admin_accounts(email, full_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  const actionColors: { [key: string]: string } = {
    'login': 'bg-blue-100 text-blue-700',
    'logout': 'bg-gray-100 text-gray-700',
    'article_create': 'bg-green-100 text-green-700',
    'article_update': 'bg-yellow-100 text-yellow-700',
    'article_delete': 'bg-red-100 text-red-700',
    'password_change': 'bg-purple-100 text-purple-700',
    'ad_create': 'bg-blue-100 text-blue-700',
    'ad_delete': 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary flex items-center gap-3">
            <History className="w-8 h-8" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground">Track all administrative actions and changes (Last 100 entries)</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition text-sm font-medium"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </div>

      {/* Logs Table */}
      {error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm font-medium border border-destructive/20">
          Error loading logs: {error.message}
        </div>
      ) : logs && logs.length > 0 ? (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date/Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Admin</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Entity</th>
                  <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary uppercase">
                          {((log.admin_accounts as any)?.full_name || 'U').substring(0, 1)}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {(log.admin_accounts as any)?.full_name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${actionColors[log.action] || 'bg-muted text-muted-foreground'}`}>
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium capitalize">{log.entity_type}</p>
                        {log.description && <p className="text-xs text-muted-foreground line-clamp-1">{log.description}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs text-muted-foreground font-mono">
                        {log.ip_address || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          No activity logs found.
        </div>
      )}
    </div>
  )
}
