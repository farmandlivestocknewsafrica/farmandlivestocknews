/**
 * Deterministic Ad Placement Engine
 * 
 * Rules:
 * - Insert ads after every N items (configurable)
 * - Never insert two ads consecutively
 * - Never insert ad at position 0
 * - Returns indices where ads should be inserted
 */
export interface AdPlacementConfig {
  itemsPerAd?: number      // Insert ad after every N items (default: 4)
  maxAds?: number          // Maximum ads to inject (default: unlimited)
  startFrom?: number       // Minimum index before first ad (default: 0)
}

export function useAdPlacement(
  itemCount: number,
  config: AdPlacementConfig = {}
) {
  const {
    itemsPerAd = 4,
    maxAds = undefined,
    startFrom = 0
  } = config

  const adIndices = new Set<number>()
  let adCount = 0

  // Insert ads at deterministic positions
  for (let i = itemsPerAd; i < itemCount; i += itemsPerAd + 1) {
    if (i >= startFrom && (!maxAds || adCount < maxAds)) {
      adIndices.add(i)
      adCount++
    }
  }

  return adIndices
}

/**
 * Transform array of items into feed with ads injected
 * 
 * Example:
 * const articles = [a, b, c, d, e, f, g, h]
 * const feed = injectAds(articles, { itemsPerAd: 4 })
 * Result: [a, b, c, d, AD, e, f, g, h]
 */
export function injectAds<T>(
  items: T[],
  config: AdPlacementConfig = {}
): (T | { __isAd: true; id: string })[] {
  const adIndices = useAdPlacement(items.length, config)
  const feed: (T | { __isAd: true; id: string })[] = []
  let adCount = 0

  items.forEach((item, index) => {
    feed.push(item)

    // Check if we need to insert an ad after this item
    if (adIndices.has(index + 1)) {
      feed.push({
        __isAd: true,
        id: `ad-${adCount}`
      })
      adCount++
    }
  })

  return feed
}

/**
 * Type guard for ad items
 */
export function isAdItem(
  item: any
): item is { __isAd: true; id: string } {
  return item && item.__isAd === true
}
