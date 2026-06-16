'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, ArrowRight, TrendingUp, History, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  author: string
  published_at: string
  featured_image_url: string
  view_count: number
}

interface SearchResponse {
  results: SearchResult[]
  suggestions: string[]
  trending: string[]
}

export function SearchExperience() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [trending, setTrending] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Save recent search
  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setSuggestions([])
      setIsLoading(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data: SearchResponse = await res.json()
        setResults(data.results)
        setSuggestions(data.suggestions)
        setTrending(data.trending || [])
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setQuery('')
    setActiveIndex(-1)
  }, [])

  const handleSelectResult = (slug: string) => {
    saveRecentSearch(query)
    router.push(`/articles/${slug}`)
    handleClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') handleClose()
    
    const totalItems = results.length + suggestions.length
    if (totalItems === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        setQuery(suggestions[activeIndex])
        setActiveIndex(-1)
      } else if (activeIndex >= suggestions.length) {
        const result = results[activeIndex - suggestions.length]
        handleSelectResult(result.slug)
      }
    }
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, handleClose])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 100)
        }}
        className="p-2 hover:bg-muted rounded-lg transition flex-shrink-0"
        aria-label="Search"
      >
        <Search className="w-5 h-5 text-foreground" />
      </button>

      {/* Full-screen / Dropdown Overlay */}
      {isOpen && (
        <div className={`fixed inset-0 z-[100] bg-background md:absolute md:inset-auto md:right-0 md:top-0 md:w-[600px] md:mt-2 md:rounded-xl md:shadow-2xl md:border md:border-border overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 flex flex-col`}>
          {/* Header / Input Area */}
          <div className="p-4 border-b border-border flex items-center gap-4">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search articles, topics, authors..."
              className="flex-1 bg-transparent border-none outline-none text-lg font-medium placeholder:text-muted-foreground"
            />
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : query && (
              <button onClick={() => setQuery('')} className="p-1 hover:bg-muted rounded-full">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="md:hidden p-2 text-primary font-semibold"
            >
              Cancel
            </button>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto max-h-[80vh] md:max-h-[600px] custom-scrollbar">
            {!query ? (
              <div className="p-6 space-y-8">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                      <History className="w-3 h-3" /> Recent Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setQuery(s)}
                          className="px-3 py-1.5 bg-muted hover:bg-primary/10 hover:text-primary rounded-full text-sm transition"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Topics */}
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" /> Trending Searches
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {['Maize Prices in Zambia', 'Cattle Disease Outbreak', 'Livestock Feed Quality', 'Agricultural Export News'].map((t, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(t)}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition text-left text-sm group"
                      >
                        <span>{t}</span>
                        <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="p-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(s)}
                        className={`w-full text-left p-2 rounded-md transition text-sm ${activeIndex === i ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
                      >
                        <span className="font-semibold">{query}</span>
                        {s.toLowerCase().replace(query.toLowerCase(), '')}
                      </button>
                    ))}
                  </div>
                )}

                {/* Article Results */}
                {results.length > 0 ? (
                  <div className="p-2 space-y-1">
                    <h3 className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Articles</h3>
                    {results.map((article, i) => (
                      <button
                        key={article.id}
                        onClick={() => handleSelectResult(article.slug)}
                        className={`w-full flex gap-4 p-3 rounded-xl transition text-left ${activeIndex === i + suggestions.length ? 'bg-primary/10' : 'hover:bg-muted'}`}
                      >
                        <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          {article.featured_image_url && (
                            <Image
                              src={article.featured_image_url}
                              alt={article.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-primary uppercase mb-0.5">{article.category}</p>
                          <h4 className="font-bold text-sm leading-snug line-clamp-2">{article.title}</h4>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(article.published_at).toLocaleDateString()} • {article.view_count || 0} views
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : !isLoading && (
                  <div className="p-12 text-center">
                    <p className="text-muted-foreground mb-4">No results found for "{query}"</p>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase">Try searching for:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {['Cattle', 'Maize', 'Farming', 'Prices'].map(tag => (
                          <button key={tag} onClick={() => setQuery(tag)} className="text-primary hover:underline text-sm font-medium">{tag}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer - Only visible on desktop if results exist */}
          {results.length > 0 && (
            <div className="hidden md:flex p-3 bg-muted/50 border-t border-border justify-between items-center text-[10px] text-muted-foreground px-4">
              <div className="flex gap-3">
                <span><kbd className="px-1 border rounded bg-background">↑↓</kbd> Navigate</span>
                <span><kbd className="px-1 border rounded bg-background">Enter</kbd> Select</span>
                <span><kbd className="px-1 border rounded bg-background">Esc</kbd> Close</span>
              </div>
              <p>AI-Ranked Results</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
