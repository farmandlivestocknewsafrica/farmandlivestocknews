import { TopBar } from '@/components/top-bar'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SidebarBanners } from '@/components/sidebar-banners'

/**
 * SiteShell - Global site layout wrapper (Server Component)
 *
 * Renders the site-wide page structure:
 *   TopBar (branding bar)
 *   Header (logo + TOP_PAGE_LEADERBOARD + search + navigation)
 *   Content (children)
 *   Footer
 *
 * TOP_PAGE_LEADERBOARD is rendered inside the Header component
 * (to the right of the logo, above the nav).
 * HOME_LEADERBOARD_PRIMARY is rendered per-page in the page content.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <Header />
      <div className="flex-1 flex justify-center items-start gap-10 xl:gap-14 2xl:gap-20 px-4 sm:px-6 lg:px-8 w-full">
        <SidebarBanners side="left" />
        <main className="flex-1 max-w-7xl min-w-0 w-full">
          {children}
        </main>
        <SidebarBanners side="right" />
      </div>
      <Footer />
    </div>
  )
}
