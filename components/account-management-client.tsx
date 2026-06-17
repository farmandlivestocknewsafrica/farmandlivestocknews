'use client'

import { useState } from 'react'
import { Mail, Lock, LogOut, Loader } from 'lucide-react'
import type { AuthUser } from '@/lib/auth/auth-context'

interface Props {
  user: AuthUser
}

interface ActiveSession {
  id: string
  device_name: string
  browser: string
  ip_address: string
  created_at: string
  last_activity_at: string
}

export function AccountManagementClient({ user }: Props) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions'>('profile')
  const [fullName, setFullName] = useState(user.full_name)
  const [email, setEmail] = useState(user.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [sessions, setSessions] = useState<ActiveSession[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/account/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      setMessage('Profile updated successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to change password')
      }

      setMessage('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error changing password')
    } finally {
      setLoading(false)
    }
  }

  const loadSessions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/account/sessions')
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (err) {
      setError('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoutCurrentDevice = async () => {
    if (confirm('Log out from this device?')) {
      try {
        await fetch('/api/account/logout-current', { method: 'POST' })
        window.location.href = '/admin/login'
      } catch (err) {
        setError('Failed to logout')
      }
    }
  }

  const handleLogoutAllDevices = async () => {
    if (confirm('Log out from all devices? You will need to sign in again.')) {
      try {
        await fetch('/api/account/logout-all', { method: 'POST' })
        window.location.href = '/admin/login'
      } catch (err) {
        setError('Failed to logout from all devices')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile, security, and active sessions</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'security'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Security
        </button>
        <button
          onClick={() => {
            setActiveTab('sessions')
            loadSessions()
          }}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === 'sessions'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Sessions
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {message}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl space-y-6">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2 border border-border rounded-lg bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Email changes require verification</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <input
                type="text"
                value={user.role}
                disabled
                className="w-full px-4 py-2 border border-border rounded-lg bg-muted"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="max-w-2xl space-y-6">
          <form onSubmit={handleChangePassword} className="space-y-4 p-6 border border-border rounded-lg">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </h3>

            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="max-w-2xl space-y-6">
          <div className="p-6 border border-border rounded-lg space-y-4">
            <h3 className="text-lg font-semibold">Active Sessions</h3>
            
            {sessions.length === 0 ? (
              <p className="text-muted-foreground">No active sessions</p>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="p-4 border border-border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{session.device_name}</p>
                        <p className="text-sm text-muted-foreground">{session.browser} • {session.ip_address}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last active: {new Date(session.last_activity_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 pt-4 border-t border-border">
              <button
                onClick={handleLogoutCurrentDevice}
                className="w-full px-4 py-2 border border-destructive text-destructive hover:bg-destructive/10 rounded-lg transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout Current Device
              </button>
              <button
                onClick={handleLogoutAllDevices}
                className="w-full px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout All Devices
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
