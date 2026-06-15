'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import type { AdForSlot } from '@/lib/types/ads'
import { validateSlotSlug, SLOT_CONFIG } from '@/lib/ads/constants'

interface AdSlotProps {
  slug: string
  width?: number
  height?: number
  className?: string
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

/**
 * AdSlot - Renders one resolved ad for a slot.
 *
 * - Fetches resolved ad from /api/ads/slots/[slug] (server-cached)
 * - Tracks impression via POST /api/ads/impression only when the ad
 *   actually enters the viewport (IntersectionObserver, 50% visible)
 * - Tracks clicks via POST /api/ads/click (debounced)
 * - Renders nothing visible when no campaign exists (no layout break)
 * - React Strict Mode safe (refs guard double-fire)
 */
export function AdSlot({ slug, width, height, className = '' }: AdSlotProps) {
  const [ad, setAd] = useState<AdForSlot | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAttempted = useRef(false)
  const impressionSent = useRef(false)
  const lastClickTime = useRef<number>(0)
  const containerRef = useRef<HTMLButtonElement | null>(null)

  const config = validateSlotSlug(slug) ? SLOT_CONFIG[slug] : null
  const adWidth = width ?? config?.defaultWidth ?? 300
  const adHeight = height ?? config?.defaultHeight ?? 250

  // Fetch resolved ad
  useEffect(() => {
    if (fetchAttempted.current) return
    fetchAttempted.current = true

    if (!validateSlotSlug(slug)) {
      console.error(`[v0] Invalid ad slot: "${slug}"`)
      setLoading(false)
      return
    }

    const fetchAd = async () => {
      try {
        const response = await fetch(`/api/ads/slots/${slug}`, {
          headers: { 'x-session-id': getSessionId() },
        })
        if (!response.ok) throw new Error(response.statusText)
        const data = await response.json()
        setAd(data.ad || null)
      } catch (err) {
        console.error(`[v0] Error fetching ad for slot "${slug}":`, err)
        setAd(null)
      } finally {
        setLoading(false)
      }
    }

    fetchAd()
  }, [slug])

  // Viewport-based impression tracking
  useEffect(() => {
    if (!ad || impressionSent.current) return
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting && !impressionSent.current) {
            impressionSent.current = true
            observer.disconnect()

            fetch('/api/ads/impression', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                campaignId: ad.id,
                slotSlug: slug,
                sessionId: getSessionId(),
              }),
            }).catch(err => console.error('[v0] Failed to track impression:', err))
          }
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [ad, slug])

  if (loading) {
    return (
      <div
        style={{ width: '100%', maxWidth: `${adWidth}px`, height: `${adHeight}px` }}
        className={`bg-muted animate-pulse rounded ${className}`}
        aria-hidden="true"
      />
    )
  }

  // Empty state: render nothing (no layout breaking, no error UI for visitors)
  if (!ad) {
    return null
  }

  function handleClick() {
    const now = Date.now()
    if (now - lastClickTime.current < 1000) return
    lastClickTime.current = now

    fetch('/api/ads/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: ad!.id,
        slotSlug: slug,
        sessionId: getSessionId(),
      }),
    }).catch(err => console.error('[v0] Failed to track click:', err))

    if (ad!.advertiser_url && ad!.advertiser_url !== '#') {
      window.open(ad!.advertiser_url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <button
      ref={containerRef}
      onClick={handleClick}
      type="button"
      className={`relative block overflow-hidden rounded hover:opacity-90 transition mx-auto ${className}`}
      style={{ width: '100%', maxWidth: `${adWidth}px`, height: `${adHeight}px` }}
      title={`${ad.advertiser_name} - ${ad.title}`}
      aria-label={`Advertisement: ${ad.advertiser_name}`}
    >
      <Image
        src={ad.image_url}
        alt={ad.title}
        fill
        className="object-contain"
        sizes={`(max-width: 768px) 100vw, ${adWidth}px`}
        priority={false}
      />
    </button>
  )
}
