'use client'

import { useState } from 'react'
import {
  User,
  Shield,
  Monitor,
  Bell,
  Palette,
  Activity,
  Key,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Smartphone,
  Globe,
  Mail,
  Clock,
  LogOut,
  ChevronRight,
  Fingerprint,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { getPermissionSummary } from '@/lib/auth/auth-context'
import type { AdminAccountOverview } from '@/lib/admin/get-account-overview'

type Section =
  | 'profile'
  | 'security'
  | 'sessions'
  | 'notifications'
  | 'appearance'
  | 'activity'
  | 'api'
  | 'danger'

const NAV: { id: Section; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'sessions', label: 'Sessions', icon: Monitor },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'activity', label: 'Activity Log', icon: Activity },
  { id: 'api', label: 'API Access', icon: Key },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
]

const ACTION_LABELS: Record<string, string> = {
  login: 'Logged in',
  logout: 'Logged out',
  password_change: 'Changed password',
  profile_update: 'Updated profile',
  admin_setup: 'Completed admin setup',
  article_create: 'Created article',
  article_update: 'Updated article',
  article_delete: 'Deleted article',
  ad_create: 'Created ad campaign',
  ad_delete: 'Deleted ad campaign',
}

function formatDateTime(date: string | null | undefined) {
  if (!date) return 'Never'
  return new Date(date).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(name: string, email: string) {
  const source = name.trim() || email
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return source.substring(0, 2).toUpperCase()
}

function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('bg-card border border-border rounded-xl shadow-sm overflow-hidden', className)}>
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  )
}

interface Props {
  data: AdminAccountOverview
}

export function AccountCommandCenter({ data: initialData }: Props) {
  const [data, setData] = useState(initialData)
  const [section, setSection] = useState<Section>('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [profile, setProfile] = useState({
    full_name: data.profile.full_name,
    display_name: data.profile.display_name || '',
    phone: data.profile.phone || '',
    bio: data.profile.bio || '',
    avatar_url: data.profile.avatar_url || '',
    recovery_email: data.profile.recovery_email || '',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [notifications, setNotifications] = useState(data.notifications)
  const [appearance, setAppearance] = useState(data.appearance)
  const [twoFactor, setTwoFactor] = useState(data.security.two_factor_enabled)

  const permissions = getPermissionSummary(data.profile.role)
  const displayName = data.profile.full_name || data.profile.email.split('@')[0]

  function flash(type: 'success' | 'error', text: string) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/account/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update profile')
      setData((d) => ({
        ...d,
        profile: {
          ...d.profile,
          full_name: profile.full_name,
          display_name: profile.display_name || null,
          phone: profile.phone || null,
          bio: profile.bio || null,
          avatar_url: profile.avatar_url || null,
          recovery_email: profile.recovery_email || null,
        },
      }))
      flash('success', 'Profile updated successfully')
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      flash('error', 'Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to change password')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setData((d) => ({
        ...d,
        security: { ...d.security, last_password_change_at: new Date().toISOString() },
      }))
      flash('success', 'Password changed successfully')
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  async function savePreferences(payload: Record<string, unknown>) {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/account/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to save preferences')
      flash('success', 'Preferences saved')
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setLoading(false)
    }
  }

  async function signOutOthers() {
    if (!confirm('Sign out from all other devices?')) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/account/logout-other-sessions', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Failed to sign out other sessions')
      setData((d) => ({
        ...d,
        sessions: d.sessions.filter((s) => s.is_current),
      }))
      flash('success', 'Signed out from other sessions')
    } catch (err) {
      flash('error', err instanceof Error ? err.message : 'Failed to sign out other sessions')
    } finally {
      setLoading(false)
    }
  }

  async function revokeAllSessions() {
    if (!confirm('Revoke all sessions? You will be logged out everywhere.')) return
    try {
      await fetch('/api/account/logout-all', { method: 'POST' })
      window.location.href = '/admin/login'
    } catch {
      flash('error', 'Failed to revoke sessions')
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={cn(
            'flex items-center gap-3 p-4 rounded-xl border text-sm font-medium',
            message.type === 'success'
              ? 'bg-green-50 text-green-900 border-green-200'
              : 'bg-red-50 text-red-900 border-red-200',
          )}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
            {data.profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {getInitials(displayName, data.profile.email)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-2xl font-serif font-bold text-foreground truncate">{displayName}</h2>
              <Badge>{data.profile.roleLabel}</Badge>
              <Badge variant={data.profile.is_active ? 'secondary' : 'destructive'}>
                {data.profile.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {data.profile.email}
            </p>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Last login: {formatDateTime(data.security.last_login_at)}
              {data.security.last_login_ip && ` · ${data.security.last_login_ip}`}
            </p>
          </div>
          <div className="md:text-right shrink-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Security Score
            </p>
            <p className="text-3xl font-bold text-primary mb-2">{data.security.securityScore}/100</p>
            <Progress value={data.security.securityScore} className="w-40 md:ml-auto" />
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <nav className="lg:w-56 shrink-0 flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                section === id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                id === 'danger' && section !== id && 'text-destructive hover:bg-destructive/10',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {section === 'profile' && (
            <>
              <SectionCard title="Profile Information" description="Your public admin identity">
                <form onSubmit={saveProfile} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <Input
                        value={profile.full_name}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Display Name</label>
                      <Input
                        value={profile.display_name}
                        onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                        placeholder="How your name appears in the CMS"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input value={data.profile.email} disabled className="bg-muted" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <Input
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+260 ..."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-2">Profile Picture URL</label>
                      <Input
                        value={profile.avatar_url}
                        onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-2">Bio (optional)</label>
                      <Textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        placeholder="Short bio for your admin profile"
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </form>
              </SectionCard>

              <SectionCard title="Identity & Authority" description="Account metadata and permissions">
                <InfoRow label="User ID" value={<code className="text-xs">{data.profile.id}</code>} />
                <InfoRow label="Role" value={data.profile.roleLabel} />
                <InfoRow
                  label="Email Verified"
                  value={data.profile.email_verified ? 'Yes' : 'No'}
                />
                <InfoRow label="Created" value={formatDateTime(data.profile.created_at)} />
                <InfoRow label="Last Updated" value={formatDateTime(data.profile.updated_at)} />
                <div className="mt-6">
                  <p className="text-sm font-semibold mb-3">Effective Permissions</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {permissions.map((p) => (
                      <div
                        key={p.label}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                      >
                        <span className="text-sm">{p.label}</span>
                        <Badge variant="outline">{p.access}</Badge>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Permission source: {data.profile.roleLabel} role
                  </p>
                </div>
              </SectionCard>
            </>
          )}

          {section === 'security' && (
            <>
              <SectionCard title="Security Overview" description="Authentication and account protection">
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Last Login', value: formatDateTime(data.security.last_login_at) },
                    {
                      label: 'Last Password Change',
                      value: formatDateTime(data.security.last_password_change_at),
                    },
                    {
                      label: '2FA Status',
                      value: twoFactor ? 'Enabled' : 'Disabled',
                    },
                    {
                      label: 'Failed Login Attempts',
                      value: String(data.security.failed_login_attempts),
                    },
                    {
                      label: 'Successful Logins (30d)',
                      value: String(data.security.successful_logins_30d),
                    },
                    {
                      label: 'Account Lock',
                      value: data.security.locked_until
                        ? `Locked until ${formatDateTime(data.security.locked_until)}`
                        : 'Not locked',
                    },
                  ].map((item) => (
                    <div key={item.label} className="p-4 rounded-lg border border-border bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                      <p className="text-sm font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-start gap-3 flex-1">
                    <Fingerprint className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add an extra layer of security to your admin account.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={twoFactor}
                      onCheckedChange={(checked) => {
                        setTwoFactor(checked)
                        savePreferences({ two_factor_enabled: checked })
                        setData((d) => ({
                          ...d,
                          security: { ...d.security, two_factor_enabled: checked },
                        }))
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {twoFactor ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Recovery Email</label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={profile.recovery_email}
                      onChange={(e) => setProfile({ ...profile, recovery_email: e.target.value })}
                      placeholder="backup@email.com"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={loading}
                      onClick={() =>
                        savePreferences({ recovery_email: profile.recovery_email }).then(() =>
                          setData((d) => ({
                            ...d,
                            profile: { ...d.profile, recovery_email: profile.recovery_email || null },
                          })),
                        )
                      }
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Change Password">
                <form onSubmit={savePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Min 8 chars with uppercase, lowercase, and numbers
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    <Lock className="w-4 h-4 mr-2" />
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </SectionCard>

              <SectionCard title="Login History" description="Recent sign-in activity">
                {data.loginHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No login history recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data.loginHistory.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border"
                      >
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {ACTION_LABELS[log.action] || log.action.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {log.ip_address || 'Unknown IP'}
                            {log.user_agent && ` · ${log.user_agent.slice(0, 40)}...`}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDateTime(log.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </>
          )}

          {section === 'sessions' && (
            <SectionCard
              title="Active Sessions"
              description="Devices currently signed in to your admin account"
            >
              {data.sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active sessions found.</p>
              ) : (
                <div className="space-y-3">
                  {data.sessions.map((session) => (
                    <div
                      key={session.id}
                      className={cn(
                        'flex items-center justify-between gap-4 p-4 rounded-xl border',
                        session.is_current
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-border bg-muted/20',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {session.device_name === 'Mobile' ? (
                          <Smartphone className="w-5 h-5 text-primary" />
                        ) : (
                          <Monitor className="w-5 h-5 text-primary" />
                        )}
                        <div>
                          <p className="text-sm font-medium flex items-center gap-2">
                            {session.browser} — {session.device_name}
                            {session.is_current && (
                              <Badge variant="secondary" className="text-[10px]">
                                This device
                              </Badge>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {session.ip_address} · Last active{' '}
                            {formatDateTime(session.last_activity_at)}
                          </p>
                        </div>
                      </div>
                      {session.is_current && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-border">
                <Button variant="outline" onClick={signOutOthers} disabled={loading}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out Other Sessions
                </Button>
              </div>
            </SectionCard>
          )}

          {section === 'notifications' && (
            <SectionCard
              title="Email Notifications"
              description="Choose what updates you receive by email"
            >
              <div className="space-y-4">
                {(
                  [
                    ['new_users', 'New User Registrations'],
                    ['new_articles', 'New Articles Submitted'],
                    ['new_comments', 'New Comments'],
                    ['system_alerts', 'System Alerts'],
                    ['security_alerts', 'Security Alerts'],
                  ] as const
                ).map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <span className="text-sm font-medium">{label}</span>
                    <Switch
                      checked={notifications[key]}
                      onCheckedChange={(checked) => {
                        const next = { ...notifications, [key]: checked }
                        setNotifications(next)
                        savePreferences({ notifications: next })
                      }}
                    />
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {section === 'appearance' && (
            <SectionCard title="Appearance Preferences">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-3">Theme</p>
                  <div className="flex flex-wrap gap-3">
                    {(['light', 'dark', 'system'] as const).map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => {
                          const next = { ...appearance, theme }
                          setAppearance(next)
                          savePreferences({ appearance: next })
                        }}
                        className={cn(
                          'px-4 py-2 rounded-lg border text-sm font-medium capitalize transition',
                          appearance.theme === theme
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-muted',
                        )}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <Input
                    value={appearance.timezone}
                    onChange={(e) => setAppearance({ ...appearance, timezone: e.target.value })}
                    onBlur={() => savePreferences({ appearance })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={appearance.language}
                    onChange={(e) => {
                      const next = { ...appearance, language: e.target.value }
                      setAppearance(next)
                      savePreferences({ appearance: next })
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                  >
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </SectionCard>
          )}

          {section === 'activity' && (
            <>
              {data.impact && (
                <SectionCard title="Platform Impact" description="Your contribution to Farm & Livestock News Africa">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                      <p className="text-2xl font-bold text-primary">{data.impact.articles_published}</p>
                      <p className="text-xs text-muted-foreground mt-1">Articles on Platform</p>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                      <p className="text-2xl font-bold text-primary">{data.impact.logins_this_month}</p>
                      <p className="text-xs text-muted-foreground mt-1">Logins This Month</p>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                      <p className="text-2xl font-bold text-primary">{data.impact.unique_devices}</p>
                      <p className="text-xs text-muted-foreground mt-1">Unique Devices</p>
                    </div>
                  </div>
                </SectionCard>
              )}

              <SectionCard title="Recent Activity" description="Your audit trail">
                {data.activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {data.activity.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition group"
                      >
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {ACTION_LABELS[log.action] || log.description || log.action}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(log.created_at)}
                            {log.ip_address && ` · ${log.ip_address}`}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </>
          )}

          {section === 'api' && (
            <SectionCard
              title="API & Developer Access"
              description="Personal access tokens for platform integrations"
            >
              <div className="text-center py-12 px-4">
                <Key className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="font-medium text-foreground">Coming Soon</p>
                <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  API keys and personal access tokens will be available when the platform API is
                  launched. You&apos;ll be able to generate, rotate, and revoke keys from here.
                </p>
                <div className="mt-6 grid sm:grid-cols-2 gap-3 max-w-lg mx-auto opacity-50 pointer-events-none">
                  <div className="p-4 rounded-lg border border-dashed border-border text-left">
                    <p className="text-xs font-medium">Production Key</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">flna_prod_••••••••</p>
                  </div>
                  <div className="p-4 rounded-lg border border-dashed border-border text-left">
                    <p className="text-xs font-medium">Development Key</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">flna_dev_••••••••</p>
                  </div>
                </div>
              </div>
            </SectionCard>
          )}

          {section === 'danger' && (
            <SectionCard
              title="Danger Zone"
              description="Irreversible or high-impact account actions"
              className="border-destructive/20"
            >
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border">
                  <div>
                    <p className="font-medium text-sm">Force Logout All Devices</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Revoke every active session including this one.
                    </p>
                  </div>
                  <Button variant="outline" onClick={revokeAllSessions}>
                    <Globe className="w-4 h-4 mr-2" />
                    Revoke All Sessions
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                  <div>
                    <p className="font-medium text-sm text-destructive">Deactivate Account</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Contact a super administrator to deactivate your account.
                    </p>
                  </div>
                  <Button variant="destructive" disabled>
                    Deactivate Account
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                  <div>
                    <p className="font-medium text-sm text-destructive">Delete Account</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Permanently remove your admin account and all associated data.
                    </p>
                  </div>
                  <Button variant="destructive" disabled>
                    Delete Account
                  </Button>
                </div>
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  )
}
