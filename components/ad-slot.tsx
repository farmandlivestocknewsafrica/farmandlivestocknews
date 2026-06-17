'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { AdForSlot } from '@/lib/types/ads'
import { validateSlotSlug, SLOT_CONFIG, AD_ROTATION_INTERVAL_MS } from '@/lib/ads/constants'
import { cn } from '@/lib/utils'

interface AdSlotProps {
  slug: string
  width?: number
  height?: number
  className?: string
  /** Reserve slot dimensions when empty (prevents CLS) */
  reserveSpace?: boolean
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  const key = '__ad_session_id'
  let sessionId = localStorage.getItem(key)
  if (!sessionId) {
    sessionId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    localStorage.setItem(key, sessionId)
  }
  return sessionId
}

function getRotationIndex(slug: string, count: number): number {
  if (count <= 1) return 0
  try {
    const key = `ad-rotation-index:${slug}`
    const stored = sessionStorage.getItem(key)
    const idx = stored ? parseInt(stored, 10) : 0
    return Number.isFinite(idx) ? idx % count : 0
  } catch {
    return 0
  }
}

function setRotationIndex(slug: string, index: number) {
  try {
    sessionStorage.setItem(`ad-rotation-index:${slug}`, String(index))
  } catch {
    /* ignore */
  }
}

/**
 * AdSlot — single fixed container; multiple creatives rotate inside via crossfade.
 * Always in document flow. No viewport overlays.
 */
export function AdSlot({ slug, width, height, className = '', reserveSpace = true }: AdSlotProps) {
  const [ads, setAds] = useState<AdForSlot[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set())

  const impressionSent = useRef<Set<string>>(new Set())
  const lastClickTime = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const config = validateSlotSlug(slug) ? SLOT_CONFIG[slug] : null
  const adWidth = width ?? config?.defaultWidth ?? 300
  const adHeight = height ?? config?.defaultHeight ?? 250
  const isRotating = config?.rotating ?? false

  const visibleAds = ads.filter((ad) => !failedIds.has(ad.id))
  const hasAds = visibleAds.length > 0
  const showRotator = isRotating && visibleAds.length > 1

  const containerStyle = {
    width: '100%',
    maxWidth: `${adWidth}px`,
    height: `${adHeight}px`,
  } as const

  // Fetch all rotation candidates once; refresh pool periodically
  useEffect(() => {
    let cancelled = false

    const fetchAds = async () => {
      try {
        const url = `/api/ads/slots/${slug}?rotate=1`
        const response = await fetch(url, {
          headers: { 'x-session-id': getSessionId() },
          cache: 'no-store',
        })
        if (!response.ok) throw new Error(response.statusText)
        const data = await response.json()
        if (cancelled) return

        const fetched: AdForSlot[] = data.ads || []
        setAds(fetched)

        if (fetched.length > 0) {
          const startIdx = getRotationIndex(slug, fetched.length)
          setActiveIndex(startIdx)
        }
      } catch (err) {
        console.error(`[AdSlot] Error fetching ads for "${slug}":`, err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAds()

    let interval: ReturnType<typeof setInterval> | null = null
    if (isRotating) {
      interval = setInterval(fetchAds, AD_ROTATION_INTERVAL_MS * 2)
    }

    return () => {
      cancelled = true
      if (interval) clearInterval(interval)
    }
  }, [slug, isRotating])

  // Sequential rotation inside fixed container
  useEffect(() => {
    if (!showRotator) return

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % visibleAds.length
        setRotationIndex(slug, next)
        return next
      })
    }, AD_ROTATION_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [showRotator, visibleAds.length, slug])

  // Keep active index in bounds when ads list changes
  useEffect(() => {
    if (activeIndex >= visibleAds.length && visibleAds.length > 0) {
      setActiveIndex(0)
    }
  }, [activeIndex, visibleAds.length])

  // Prefetch next creative
  useEffect(() => {
    if (visibleAds.length < 2) return
    const nextIdx = (activeIndex + 1) % visibleAds.length
    const next = visibleAds[nextIdx]
    if (!next?.image_url) return
    const img = new window.Image()
    img.src = next.image_url
  }, [activeIndex, visibleAds])

  // Impression tracking per visible creative
  useEffect(() => {
    if (!hasAds) return
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const ad = visibleAds[activeIndex]
          if (!ad || impressionSent.current.has(ad.id)) continue

          impressionSent.current.add(ad.id)
          fetch('/api/ads/impression', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaignId: ad.id,
              slotSlug: slug,
              sessionId: getSessionId(),
            }),
          }).catch((err) => console.error('[AdSlot] Impression failed:', err))
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasAds, visibleAds, activeIndex, slug])

  const handleClick = useCallback(
    (ad: AdForSlot) => {
      const now = Date.now()
      if (now - lastClickTime.current < 1000) return
      lastClickTime.current = now

      fetch('/api/ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: ad.id,
          slotSlug: slug,
          sessionId: getSessionId(),
        }),
      }).catch((err) => console.error('[AdSlot] Click failed:', err))

      if (ad.advertiser_url && ad.advertiser_url !== '#') {
        window.open(ad.advertiser_url, '_blank', 'noopener,noreferrer')
      }
    },
    [slug],
  )

  const handleImageError = (adId: string) => {
    setFailedIds((prev) => new Set(prev).add(adId))
  }

  if (loading) {
    return (
      <div
        style={containerStyle}
        className={cn('ad-slot ad-slot--loading bg-muted/40 animate-pulse rounded', className)}
        aria-hidden="true"
      />
    )
  }

  if (!hasAds) {
    if (!reserveSpace) return null
    if (typeof window !== 'undefined' && window.location.search.includes('debug_ads')) {
      return (
        <div
          style={containerStyle}
          className="ad-slot ad-slot--empty border border-dashed border-red-400 rounded flex items-center justify-center text-[10px] text-red-500"
        >
          Empty: {slug}
        </div>
      )
    }
    return (
      <div
        style={containerStyle}
        className={cn('ad-slot ad-slot--empty bg-muted/20 rounded', className)}
        aria-hidden="true"
      />
    )
  }

  const displayAds = showRotator ? visibleAds : [visibleAds[0]]

  return (
    <div
      ref={containerRef}
      className={cn('ad-slot ad-slot--rotator mx-auto', className)}
      style={containerStyle}
      data-ad-slug={slug}
      data-ad-count={visibleAds.length}
    >
      {displayAds.map((ad, i) => {
        const isActive = showRotator ? i === activeIndex : true
        return (
          <button
            key={ad.id}
            type="button"
            onClick={() => handleClick(ad)}
            className={cn(
              'ad-slot__frame block w-full h-full overflow-hidden rounded',
              'hover:opacity-95 transition-opacity duration-300',
              showRotator && 'ad-slot__frame--rotating',
              isActive ? 'ad-slot__frame--active' : 'ad-slot__frame--inactive',
            )}
            title={`${ad.advertiser_name} - ${ad.title}`}
            aria-label={`Advertisement: ${ad.advertiser_name}`}
            aria-hidden={!isActive}
            tabIndex={isActive ? 0 : -1}
          >
            <Image
              src={ad.image_url}
              alt={ad.title}
              fill
              className="object-contain"
              sizes={`(max-width: 768px) 100vw, ${adWidth}px`}
              priority={i === 0}
              unoptimized
              onError={() => handleImageError(ad.id)}
            />
          </button>
        )
      })}
    </div>
  )
}
