'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Admin {
  id: string
  email: string
  name?: string
  role: 'editor' | 'author' | 'admin' | 'superadmin'
  is_active: boolean
  created_at: string
  last_login_at?: string
}

interface AdminUsersListProps {
  admins: Admin[]
}

export function AdminUsersList({ admins }: AdminUsersListProps) {
  const [selectedAdmins, setSelectedAdmins] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  const toggleAdmin = (id: string) => {
    const newSet = new Set(selectedAdmins)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedAdmins(newSet)
  }

  async function toggleActive(adminId: string, currentStatus: boolean) {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${adminId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to update admin:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800'
      case 'admin':
        return 'bg-blue-100 text-blue-800'
      case 'editor':
        return 'bg-green-100 text-green-800'
      case 'author':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 font-semibold text-sm text-foreground">Email</th>
              <th className="text-left px-6 py-3 font-semibold text-sm text-foreground">Name</th>
              <th className="text-left px-6 py-3 font-semibold text-sm text-foreground">Role</th>
              <th className="text-left px-6 py-3 font-semibold text-sm text-foreground">Status</th>
              <th className="text-left px-6 py-3 font-semibold text-sm text-foreground">Last Login</th>
              <th className="text-right px-6 py-3 font-semibold text-sm text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  No administrators found
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id} className="border-b border-border hover:bg-muted/50 transition">
                  <td className="px-6 py-4">
                    <code className="text-sm bg-muted px-2 py-1 rounded">{admin.email}</code>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {admin.name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleColor(admin.role)}`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${admin.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-sm">{admin.is_active ? 'Active' : 'Suspended'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDate(admin.last_login_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/settings/users/${admin.id}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Button>
                      </Link>
                      <button
                        onClick={() => toggleActive(admin.id, admin.is_active)}
                        disabled={isLoading}
                        className="p-2 hover:bg-muted rounded-lg transition disabled:opacity-50"
                        title={admin.is_active ? 'Suspend' : 'Activate'}
                      >
                        {admin.is_active ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
