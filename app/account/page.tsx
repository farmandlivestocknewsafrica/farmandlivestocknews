import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/auth/unified-session'
import { AccountManagementClient } from '@/components/account-management-client'
import { TopBar } from '@/components/top-bar'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata = {
  title: 'Account Settings - Farm & Livestock News',
  description: 'Manage your account, security, and sessions'
}

export default async function AccountPage() {
  const session = await getCurrentSession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <Header />
      
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <AccountManagementClient user={session.user} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
