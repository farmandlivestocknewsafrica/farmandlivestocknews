/**
 * Unified Authentication Context
 * Shared between public site and CMS
 * Provides user identity, role, and permission checks
 */

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: 'author' | 'editor' | 'admin' | 'superadmin'
  avatar_url?: string
  is_active: boolean
  email_verified: boolean
  created_at: string
  last_login_at?: string
}

export interface AuthSession {
  user: AuthUser
  sessionId: string
  expiresAt: Date
}

/**
 * Role-Based Permission Matrix
 */
const PERMISSIONS: Record<string, string[]> = {
  author: [
    'articles:create',
    'articles:edit_own',
    'articles:view'
  ],
  editor: [
    'articles:create',
    'articles:edit_all',
    'articles:publish',
    'articles:view',
    'articles:delete_own'
  ],
  admin: [
    'articles:create',
    'articles:edit_all',
    'articles:publish',
    'articles:delete_all',
    'articles:view',
    'ads:manage',
    'magazines:manage',
    'settings:view',
    'users:view'
  ],
  superadmin: [
    // All permissions
    'articles:create',
    'articles:edit_all',
    'articles:publish',
    'articles:delete_all',
    'articles:view',
    'ads:manage',
    'magazines:manage',
    'settings:manage',
    'users:manage',
    'users:create',
    'users:suspend',
    'audit:view'
  ]
}

/**
 * Check if user has permission
 */
export function hasPermission(role: string, permission: string): boolean {
  const userPermissions = PERMISSIONS[role] || []
  return userPermissions.includes(permission)
}

/**
 * Check if user can perform action on article
 */
export function canEditArticle(role: string, articleAuthorId: string, userId: string): boolean {
  if (hasPermission(role, 'articles:edit_all')) return true
  if (hasPermission(role, 'articles:edit_own') && articleAuthorId === userId) return true
  return false
}

/**
 * Check if user can delete article
 */
export function canDeleteArticle(role: string, articleAuthorId: string, userId: string): boolean {
  if (hasPermission(role, 'articles:delete_all')) return true
  if (hasPermission(role, 'articles:delete_own') && articleAuthorId === userId) return true
  return false
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: string): string {
  const names: Record<string, string> = {
    author: 'Author',
    editor: 'Editor',
    admin: 'Administrator',
    superadmin: 'Super Administrator'
  }
  return names[role] || role
}

/**
 * Check if role is admin or above
 */
export function isAdminRole(role: string): boolean {
  return ['admin', 'superadmin'].includes(role)
}

/**
 * Check if role is superadmin
 */
export function isSuperAdminRole(role: string): boolean {
  return role === 'superadmin'
}
