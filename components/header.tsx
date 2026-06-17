'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AdPlacement } from '@/components/ad-placement'

interface Category {
  id: string
  name: string
  slug: string
}

export function Header() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const controller = new AbortController()
    
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories', { 
          signal: controller.signal,
          next: { revalidate: 3600 } 
        } as any)
        
        if (res.ok) {
          const data = await res.json()
          setCategories(data.categories || [])
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch categories:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
    return () => controller.abort()
  }, [])

  return (
    <>
      {/* ===== MAIN HEADER ===== */}
      <header className="bg-background border-b border-gray-medium">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          {/* 
            Stable grid layout — three distinct regions:
            Left:   logo (fixed height, does not grow/shrink)
            Center: leaderboard ad (isolated, does not compress siblings)
            Right:  search icon (fixed size)
          */}
          <div className="header-grid">
            {/* ── Left region: Logo ── */}
            <div className="header-logo-block">
              <Link href="/" className="header-logo-link">
                <div className="header-logo-container">
                  <Image 
                    src="/logo.png" 
                    alt="Farm & Livestock News Africa" 
                    fill
                    className="header-logo-img"
                    priority
                  />
                </div>
                <div className="header-logo-text">
                  <p className="header-logo-title">Farm & Livestock News Africa</p>
                  <p className="header-logo-subtitle">Independent Agriculture Reporting</p>
                </div>
              </Link>
            </div>

            {/* ── Center region: Leaderboard ad (isolated) ── */}
            <div className="header-ad-region">
              <div className="header-ad-desktop">
                <AdPlacement slug="TOP_PAGE_LEADERBOARD" width={728} height={90} variant="leaderboard" />
              </div>
              <div className="header-ad-mobile">
                <AdPlacement slug="TOP_PAGE_LEADERBOARD" width={320} height={50} variant="mobile" />
              </div>
            </div>

            {/* ── Right region: Search ── */}
            <div className="header-search-block">
              <button 
                onClick={() => console.log('Search clicked')}
                aria-label="Search"
                className="header-search-btn"
              >
                <Search className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== NAVIGATION ===== */}
      <nav className="bg-background border-b border-gray-medium sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 text-xs font-bold overflow-x-auto py-3 no-scrollbar">
            <Link 
              href="/" 
              className={`whitespace-nowrap transition ${
                pathname === '/' ? 'text-primary' : 'hover:text-primary'
              }`}
            >
              HOME
            </Link>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-16 h-4 bg-muted animate-pulse rounded flex-shrink-0" />
              ))
            ) : (
              categories.map((cat) => {
                const isActive = pathname === `/${cat.slug}`
                return (
                  <Link 
                    key={cat.id} 
                    href={`/${cat.slug}`}
                    className={`whitespace-nowrap transition ${
                      isActive ? 'text-primary' : 'hover:text-primary'
                    }`}
                  >
                    {cat.name.toUpperCase()}
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </nav>
    </>
  )
}