import { TopBar } from '@/components/top-bar'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SidebarBanners } from '@/components/sidebar-banners'

/**
 * SiteShell - Global site layout wrapper (Server Component)
 *
 * Layout structure (top to bottom):
 *   TopBar (branding bar)
 *   Header (logo + nav)
 *   Content area: [left banner | main content | right banner]
 *     - Side banners only visible at 2xl (1440px+) to prevent squeezing
 *     - Main content always fills available space with max-w-7xl
 *   Footer
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <Header />
      <div className="flex-1 flex justify-center items-start gap-0 w-full max-w-full mx-auto">
        <SidebarBanners side="left" />
        <main className="flex-1 min-w-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <SidebarBanners side="right" />
      </div>
      <Footer />
    </div>
  )
}