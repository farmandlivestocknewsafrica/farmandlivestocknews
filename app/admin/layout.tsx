import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminLayoutWrapper } from '@/components/admin/admin-layout-wrapper'
import { requireAdminAuth } from '@/lib/auth/admin-check'

export const metadata = {
  title: 'Admin Panel - Farm & Livestock News Africa',
  description: 'Manage content and settings',
}

const PUBLIC_ADMIN_PATHS = [
  '/admin/login',
  '/admin/setup',
  '/admin/register',
  '/admin/forgot-password',
  '/admin/force-setup',
  '/admin/init',
]

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const isPublicPath = PUBLIC_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )

  if (pathname && !isPublicPath) {
    const { redirect: redirectTo } = await requireAdminAuth(pathname)
    if (redirectTo) {
      redirect(redirectTo)
    }
  }

  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
}
