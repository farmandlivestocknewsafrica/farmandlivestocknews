'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Check } from 'lucide-react'
import { SLOT_CONFIG, AD_SLOTS } from '@/lib/ads/constants'

/**
 * Ad Slot Manager - Display and manage available ad slots
 */
interface SlotDebugInfo {
  slot: string
  candidateCount: number
  selected: { campaignId: string; title: string; priority: number } | null
  reason: string
}

export function AdSlotManager() {
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Record<string, any>>({})
  const [debug, setDebug] = useState<Record<string, SlotDebugInfo>>({})

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoading(true)

        // Fetch slot statistics + live resolution debug in parallel
        const [statsRes, debugRes] = await Promise.all([
          fetch('/api/admin/ad-slots'),
          fetch('/api/admin/ad-slots/debug'),
        ])

        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data.stats || {})
        }

        if (debugRes.ok) {
          const data = await debugRes.json()
          const map: Record<string, SlotDebugInfo> = {}
          for (const s of data.slots || []) {
            map[s.slot] = s
          }
          setDebug(map)
        }

        // Display all available slots
        const slotList = AD_SLOTS.map(slug => ({
          slug,
          ...SLOT_CONFIG[slug],
        }))
        setSlots(slotList)
      } catch (err) {
        console.error('[v0] Error fetching slots:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSlots()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{slots.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Impressions (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.impressions24h || 0).toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {slots.map(slot => (
          <Card key={slot.slug} className="hover:bg-accent/50 transition">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {slot.title}
                    {debug[slot.slug]?.selected ? (
                      <Badge variant="default" className="text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Serving
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Empty
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{slot.description}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs font-medium mb-1">
                    Default Size
                  </div>
                  <div className="font-medium">
                    {slot.defaultWidth} × {slot.defaultHeight}px
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground text-xs font-medium mb-1">
                    Scope
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {slot.scope}
                  </Badge>
                </div>

                <div>
                  <div className="text-muted-foreground text-xs font-medium mb-1">
                    Position
                  </div>
                  <div className="font-mono text-xs">{slot.position}</div>
                </div>

                <div>
                  <div className="text-muted-foreground text-xs font-medium mb-1">
                    Impressions (24h)
                  </div>
                  <div className="font-medium">
                    {(stats[slot.slug]?.impressions || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {debug[slot.slug] && (
                <div className="text-xs pt-2 border-t space-y-1">
                  <div className="text-muted-foreground">
                    <span className="font-medium">Will render:</span>{' '}
                    {debug[slot.slug].selected
                      ? `"${debug[slot.slug].selected!.title}" (priority ${debug[slot.slug].selected!.priority})`
                      : 'Nothing (no eligible campaign)'}
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-medium">Candidates:</span> {debug[slot.slug].candidateCount}
                    {' — '}{debug[slot.slug].reason}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-2 border-t">
                <code className="bg-muted px-2 py-1 rounded">&lt;AdSlot slug="{slot.slug}" /&gt;</code>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-1">To use these slots in your pages:</p>
            <p className="font-mono text-xs bg-black/20 px-2 py-1 rounded mb-2">
              {'import { AdSlot } from "@/components/ad-slot"'}
            </p>
            <p className="font-mono text-xs bg-black/20 px-2 py-1 rounded">
              {'<AdSlot slug="SIDE_AD_LEFT" />'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
