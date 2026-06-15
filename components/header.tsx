'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { AdSlot } from '@/components/ad-slot'

interface Category {
  id: string
  name: string
  slug: string
}

export function Header() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories')
        if (res.ok) {
          const data = await res.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <>
      {/* Main Header */}
      <header className="bg-background border-b border-gray-medium">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Logo Section */}
          <div className="flex items-center justify-between gap-8 mb-4">
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

            {/* Right Side: Ad Slot 1 and Search */}
            <div className="flex items-center gap-6 flex-shrink-0">
              {/* TOP LEADERBOARD BANNER (1) - Hidden on mobile */}
              <div className="hidden lg:block">
                <AdSlot slug="TOP_LEADERBOARD" width={728} height={90} />
              </div>

              {/* Search */}
              <button className="p-2 hover:bg-muted rounded-lg transition flex-shrink-0">
                <Search className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-background border-b border-gray-medium sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 text-xs font-bold overflow-x-auto py-3">
            <Link href="/" className="hover:text-primary whitespace-nowrap transition">HOME</Link>
            {loading ? (
              <div className="text-muted-foreground text-xs">Loading...</div>
            ) : (
              categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/${cat.slug}`}
                  className="hover:text-primary whitespace-nowrap transition"
                >
                  {cat.name.toUpperCase()}
                </Link>
              ))
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
