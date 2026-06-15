import { AdminLayoutWrapper } from '@/components/admin/admin-layout-wrapper'

export const metadata = {
  title: 'Admin Panel - Farm & Livestock News Africa',
  description: 'Manage content and settings',
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminLayoutWrapper>
      {children}
    </AdminLayoutWrapper>
  )
}
