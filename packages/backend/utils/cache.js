/**
 * Simple in-memory cache for API responses
 * Reduces external API calls and improves response times
 */

class SimpleCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Get an item from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or null if expired/missing
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set an item in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttlMs - Time to live in milliseconds
   */
  set(key, value, ttlMs) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  /**
   * Clear a specific key
   * @param {string} key - Cache key
   */
  clear(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAll() {
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns {number} Number of cached items
   */
  size() {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instances for different cache types
const tmdbCache = new SimpleCache();
const omdbCache = new SimpleCache();

// Run cleanup every 5 minutes
setInterval(() => {
  tmdbCache.cleanup();
  omdbCache.cleanup();
}, 5 * 60 * 1000);

module.exports = {
  tmdbCache,
  omdbCache,
  SimpleCache
};
