/**
 * Cloudflare KV Caching Layer
 *
 * Provides edge-cached responses for frequently accessed data.
 * Falls back to in-memory cache for local development.
 *
 * Cloudflare KV Free Tier:
 * - 100,000 reads/day
 * - 1,000 writes/day
 * - 1GB storage
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// In-memory fallback for local dev
const memoryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Get value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  // Cloudflare KV (production)
  if (typeof caches !== 'undefined' && process.env.CF_PAGES) {
    try {
      const cache = caches.default;
      const request = new Request(`https://cache.gitdeploy.ai/${key}`);
      const response = await cache.match(request);
      if (response) {
        const entry = await response.json() as CacheEntry<T>;
        if (entry.expiresAt > Date.now()) {
          return entry.data;
        }
        // Expired — delete
        await cache.delete(request);
      }
    } catch {
      // KV not available, fall through to memory
    }
  }

  // In-memory cache (local dev)
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (entry) {
    if (entry.expiresAt > Date.now()) {
      return entry.data;
    }
    memoryCache.delete(key);
  }

  return null;
}

/**
 * Set value in cache with TTL
 */
export async function cacheSet<T>(key: string, data: T, ttlSeconds = 60): Promise<void> {
  const entry: CacheEntry<T> = {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  };

  // Cloudflare KV (production)
  if (typeof caches !== 'undefined' && process.env.CF_PAGES) {
    try {
      const cache = caches.default;
      const request = new Request(`https://cache.gitdeploy.ai/${key}`);
      const response = new Response(JSON.stringify(entry), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${ttlSeconds}`,
        },
      });
      await cache.put(request, response);
    } catch {
      // KV not available, fall through to memory
    }
  }

  // In-memory cache (local dev)
  memoryCache.set(key, entry);
}

/**
 * Delete value from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  if (typeof caches !== 'undefined' && process.env.CF_PAGES) {
    try {
      const cache = caches.default;
      const request = new Request(`https://cache.gitdeploy.ai/${key}`);
      await cache.delete(request);
    } catch {
      // KV not available
    }
  }

  memoryCache.delete(key);
}

/**
 * Cache wrapper for async functions (memoization with TTL)
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds = 60
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const result = await fn();
  await cacheSet(key, result, ttlSeconds);
  return result;
}
