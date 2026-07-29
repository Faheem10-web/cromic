const memoryCache = new Map();

/**
 * Get data from cache if not expired.
 * @param {string} key Cache key.
 * @returns {any|null} The cached data or null if not found/expired.
 */
export const getCache = (key) => {
  // Always bypass in-memory caching during development to guarantee fresh data sync
  if (process.env.NODE_ENV === "development") {
    return null;
  }
  const cached = memoryCache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  if (cached) {
    memoryCache.delete(key); // Clean up expired keys
  }
  return null;
};

/**
 * Set data in cache with a TTL.
 * @param {string} key Cache key.
 * @param {any} data Data to cache.
 * @param {number} ttlMs TTL in milliseconds (default 5 minutes).
 */
export const setCache = (key, data, ttlMs = 300000) => {
  memoryCache.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  });
};

/**
 * Clear cache keys matching a pattern. If pattern is empty, clear all.
 * @param {string} [keyPattern] Key prefix or pattern.
 */
export const clearCache = (keyPattern) => {
  if (!keyPattern) {
    memoryCache.clear();
    console.log("[Cache] In-memory cache cleared completely.");
    return;
  }
  let count = 0;
  for (const key of memoryCache.keys()) {
    if (key.includes(keyPattern)) {
      memoryCache.delete(key);
      count++;
    }
  }
  if (count > 0) {
    console.log(`[Cache] Cleared ${count} keys matching pattern: "${keyPattern}"`);
  }
};
