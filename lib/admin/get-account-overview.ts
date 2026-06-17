import { createClient } from '@/lib/supabase/server'
import { getUserSessions } from '@/lib/auth/unified-session'
import { getRoleDisplayName } from '@/lib/auth/auth-context'

export interface AdminAccountOverview {
  profile: {
    id: string
    email: string
    full_name: string
    display_name: string | null
    phone: string | null
    bio: string | null
    avatar_url: string | null
    role: string
    roleLabel: string
    is_active: boolean
    email_verified: boolean
    created_at: string
    updated_at: string | null
    recovery_email: string | null
  }
  security: {
    last_login_at: string | null
    last_login_ip: string | null
    last_password_change_at: string | null
    failed_login_attempts: number
    locked_until: string | null
    two_factor_enabled: boolean
    successful_logins_30d: number
    failed_logins_30d: number
    securityScore: number
  }
  sessions: Array<{
    id: string
    device_name: string
    browser: string
    ip_address: string
    created_at: string
    last_activity_at: string
    is_current: boolean
  }>
  loginHistory: Array<{
    id: string
    action: string
    description: string | null
    ip_address: string | null
    user_agent: string | null
    created_at: string
  }>
  activity: Array<{
    id: string
    action: string
    description: string | null
    entity_type: string | null
    ip_address: string | null
    created_at: string
  }>
  notifications: {
    new_users: boolean
    new_articles: boolean
    new_comments: boolean
    system_alerts: boolean
    security_alerts: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    timezone: string
    language: string
  }
  impact: {
    articles_published: number
    logins_this_month: number
    unique_devices: number
  } | null
}

const DEFAULT_NOTIFICATIONS = {
  new_users: true,
  new_articles: true,
  new_comments: true,
  system_alerts: true,
  security_alerts: true,
}

const DEFAULT_APPEARANCE = {
  theme: 'system' as const,
  timezone: 'Africa/Lusaka',
  language: 'en',
}

function computeSecurityScore(account: Record<string, unknown>, twoFactor: boolean): number {
  let score = 40
  if (account.email_verified) score += 15
  if (twoFactor) score += 25
  if (account.last_password_change_at) score += 10
  if ((account.failed_login_attempts as number) === 0) score += 10
  return Math.min(score, 100)
}

export async function getAccountOverview(
  adminId: string,
  currentSessionId: string,
): Promise<AdminAccountOverview | null> {
  const supabase = await createClient()

  const { data: account, error } = await supabase
    .from('admin_accounts')
    .select('*')
    .eq('id', adminId)
    .single()

  if (error || !account) return null

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [sessions, activityRes, loginRes, successLoginsRes, failedLoginsRes, articlesRes, monthLoginsRes] =
    await Promise.all([
      getUserSessions(adminId),
      supabase
        .from('admin_logs')
        .select('id, action, description, entity_type, ip_address, created_at')
        .eq('admin_id', adminId)
        .order('created_at', { ascending: false })
        .limit(25),
      supabase
        .from('admin_logs')
        .select('id, action, description, ip_address, user_agent, created_at')
        .eq('admin_id', adminId)
        .in('action', ['login', 'logout'])
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('admin_logs')
        .select('*', { count: 'exact', head: true })
        .eq('admin_id', adminId)
        .eq('action', 'login')
        .gte('created_at', thirtyDaysAgo),
      supabase
        .from('admin_logs')
        .select('*', { count: 'exact', head: true })
        .eq('admin_id', adminId)
        .eq('action', 'login_failed')
        .gte('created_at', thirtyDaysAgo),
      supabase
        .from('articles')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('admin_logs')
        .select('*', { count: 'exact', head: true })
        .eq('admin_id', adminId)
        .eq('action', 'login')
        .gte('created_at', monthStart.toISOString()),
    ])

  const passwordChangeLog = activityRes.data?.find((l) => l.action === 'password_change')
  const lastPasswordChange =
    account.last_password_change_at || passwordChangeLog?.created_at || null

  const twoFactor = account.two_factor_enabled === true
  const notifications = {
    ...DEFAULT_NOTIFICATIONS,
    ...(account.notification_preferences as Record<string, boolean> | null),
  }
  const appearance = {
    ...DEFAULT_APPEARANCE,
    ...(account.appearance_preferences as Record<string, string> | null),
  }

  const uniqueDevices = new Set(sessions.map((s) => `${s.device_name}-${s.browser}`)).size

  let impact: AdminAccountOverview['impact'] = null
  if (['admin', 'superadmin'].includes(account.role)) {
    impact = {
      articles_published: articlesRes.count ?? 0,
      logins_this_month: monthLoginsRes.count ?? 0,
      unique_devices: uniqueDevices,
    }
  }

  return {
    profile: {
      id: account.id,
      email: account.email,
      full_name: account.full_name || '',
      display_name: account.display_name || null,
      phone: account.phone || null,
      bio: account.bio || null,
      avatar_url: account.avatar_url || null,
      role: account.role,
      roleLabel: getRoleDisplayName(account.role),
      is_active: account.is_active,
      email_verified: account.email_verified,
      created_at: account.created_at,
      updated_at: account.updated_at || null,
      recovery_email: account.recovery_email || null,
    },
    security: {
      last_login_at: account.last_login_at || null,
      last_login_ip: account.last_login_ip || null,
      last_password_change_at: lastPasswordChange,
      failed_login_attempts: account.failed_login_attempts || 0,
      locked_until: account.locked_until || null,
      two_factor_enabled: twoFactor,
      successful_logins_30d: successLoginsRes.count ?? 0,
      failed_logins_30d: failedLoginsRes.count ?? 0,
      securityScore: computeSecurityScore(account, twoFactor),
    },
    sessions: sessions.map((s) => ({
      id: s.id,
      device_name: s.device_name,
      browser: s.browser,
      ip_address: s.ip_address,
      created_at: s.created_at,
      last_activity_at: s.last_activity_at,
      is_current: s.id === currentSessionId,
    })),
    loginHistory: loginRes.data || [],
    activity: activityRes.data || [],
    notifications,
    appearance: appearance as AdminAccountOverview['appearance'],
    impact,
  }
}
