/**
 * Simple in-memory cache with TTL support
 *
 * Used for caching public tRPC query responses to reduce
 * database load on high-traffic read endpoints.
 */

const cache = new Map<string, { data: any; expiresAt: number }>()

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

export function setCache(key: string, data: any, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

export async function withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const cached = getCached<T>(key)
  if (cached) return cached
  const result = await fn()
  setCache(key, result, ttlMs)
  return result
}

// Cleanup expired entries every 2 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of cache) {
    if (now > entry.expiresAt) cache.delete(key)
  }
}, 120_000).unref()
