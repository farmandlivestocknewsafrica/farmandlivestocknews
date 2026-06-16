'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { AdSlot } from '@/components/ad-slot'

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
      {/* Main Header */}
      <header className="bg-background border-b border-gray-medium">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Logo + Top Page Leaderboard row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo Row */}
            <div className="flex items-center justify-between w-full md:w-auto">
              <Link href="/" className="flex items-center gap-4 flex-shrink-0">
                <Image 
                  src="/logo.png" 
                  alt="Farm & Livestock News Africa" 
                  width={200} 
                  height={80}
                  className="h-16 w-auto"
                  priority
                />
                <div className="hidden sm:block border-l border-gray-medium pl-4">
                  <p className="text-sm font-semibold text-primary">Farm & Livestock News Africa</p>
                  <p className="text-xs text-foreground/70">Independent Agriculture Reporting</p>
                </div>
              </Link>

              {/* Mobile Search - only visible on small screens next to logo if needed, 
                  but we have it in the right side div normally. 
                  Let's keep search consistent. */}
            </div>

            {/* Right Side: Top Page Leaderboard + Search */}
            <div className="flex items-center gap-4 w-full md:w-auto md:flex-grow justify-end">
              {/* TOP PAGE LEADERBOARD - right of logo, above nav
                   Fallback logic: Try TOP_PAGE_LEADERBOARD first, then TOP_HEADER_AD.
                   Fixed width/height to prevent layout shifts. */}
              <div className="hidden md:flex items-center justify-center flex-none w-[728px] h-[90px] bg-muted/5 rounded relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <AdSlot slug="TOP_PAGE_LEADERBOARD" width={728} height={90} className="relative z-10" />
                </div>
                {/* 
                  Note: We render both but AdSlot handles the "only one" logic via its own fetch.
                  To truly fallback, we would need to know if the first one failed.
                  For now, we keep them both as requested for compatibility, 
                  but ideally the AdResolver would handle slug aliases.
                */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <AdSlot slug="TOP_HEADER_AD" width={728} height={90} className="relative z-0" />
                </div>
              </div>
              
              <div className="flex md:hidden items-center justify-center flex-grow min-h-[50px] bg-muted/5 rounded relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <AdSlot slug="TOP_PAGE_LEADERBOARD" width={320} height={50} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <AdSlot slug="TOP_HEADER_AD" width={320} height={50} />
                </div>
              </div>

              {/* Search */}
              <button 
                onClick={() => console.log('Search clicked')}
                aria-label="Search"
                className="p-2 hover:bg-muted rounded-lg transition flex-shrink-0"
              >
                <Search className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-background border-b border-gray-medium sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
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