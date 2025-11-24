/**
 * Enhanced in-memory cache with LRU eviction for API responses
 * Reduces external API calls and improves response times
 */

const { LRUCache } = require('lru-cache');

// Cache configuration
const CACHE_CONFIG = {
  tmdb: {
    search: {
      enabled: process.env.CACHE_ENABLED !== 'false',
      ttl: parseInt(process.env.CACHE_TTL_TMDB_SEARCH || '86400000'), // 24 hours
      max: 500,
      maxSize: 30 * 1024 * 1024 // 30 MB
    },
    details: {
      enabled: process.env.CACHE_ENABLED !== 'false',
      ttl: parseInt(process.env.CACHE_TTL_TMDB_DETAILS || '604800000'), // 7 days
      max: 300,
      maxSize: 40 * 1024 * 1024 // 40 MB
    }
  },
  omdb: {
    ratings: {
      enabled: process.env.CACHE_ENABLED !== 'false',
      ttl: parseInt(process.env.CACHE_TTL_OMDB_RATINGS || '604800000'), // 7 days
      max: 500,
      maxSize: 20 * 1024 * 1024 // 20 MB
    }
  }
};

/**
 * Enhanced cache with metrics tracking
 */
class MetricsCache {
  constructor(name, config) {
    this.name = name;
    this.config = config;
    this.enabled = config.enabled;

    // Initialize LRU cache
    this.cache = new LRUCache({
      max: config.max,
      maxSize: config.maxSize,
      ttl: config.ttl,
      sizeCalculation: (value) => {
        // Estimate size of cached value
        return JSON.stringify(value).length;
      },
      updateAgeOnGet: true, // LRU behavior
      updateAgeOnHas: false
    });

    // Metrics tracking
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      errors: 0
    };

    // Note: LRU Cache doesn't expose eviction events directly
    // We'll track evictions by monitoring size changes
  }

  /**
   * Get an item from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or null if missing
   */
  get(key) {
    if (!this.enabled) {
      this.metrics.misses++;
      return null;
    }

    try {
      const value = this.cache.get(key);

      if (value !== undefined) {
        this.metrics.hits++;
        return value;
      }

      this.metrics.misses++;
      return null;
    } catch (error) {
      this.metrics.errors++;
      console.error(`[${this.name}] Cache get error:`, error.message);
      return null;
    }
  }

  /**
   * Set an item in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttlMs - Optional TTL override in milliseconds
   */
  set(key, value, ttlMs) {
    if (!this.enabled) return;

    try {
      const options = ttlMs ? { ttl: ttlMs } : {};
      this.cache.set(key, value, options);
      this.metrics.sets++;
    } catch (error) {
      this.metrics.errors++;
      console.error(`[${this.name}] Cache set error:`, error.message);
    }
  }

  /**
   * Check if key exists without updating access time
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    if (!this.enabled) return false;
    return this.cache.has(key);
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
    console.log(`[${this.name}] Cache cleared`);
  }

  /**
   * Get cache size
   * @returns {number} Number of cached items
   */
  size() {
    return this.cache.size;
  }

  /**
   * Get cache metrics
   * @returns {object} Cache metrics
   */
  getMetrics() {
    const totalRequests = this.metrics.hits + this.metrics.misses;
    const hitRate = totalRequests > 0 ? this.metrics.hits / totalRequests : 0;

    return {
      name: this.name,
      enabled: this.enabled,
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      sets: this.metrics.sets,
      evictions: this.metrics.evictions,
      errors: this.metrics.errors,
      hitRate: Math.round(hitRate * 100) / 100,
      hitRatePercent: Math.round(hitRate * 100),
      size: this.cache.size,
      calculatedSize: this.cache.calculatedSize,
      maxSize: this.config.maxSize,
      memoryUsageMB: Math.round((this.cache.calculatedSize / (1024 * 1024)) * 100) / 100
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      errors: 0
    };
    console.log(`[${this.name}] Metrics reset`);
  }

  /**
   * Get cache info for debugging
   */
  getInfo() {
    return {
      name: this.name,
      enabled: this.enabled,
      config: {
        ttl: this.config.ttl,
        max: this.config.max,
        maxSize: this.config.maxSize
      },
      metrics: this.getMetrics()
    };
  }
}

// Create cache instances
const tmdbSearchCache = new MetricsCache('tmdb-search', CACHE_CONFIG.tmdb.search);
const tmdbDetailsCache = new MetricsCache('tmdb-details', CACHE_CONFIG.tmdb.details);
const omdbRatingsCache = new MetricsCache('omdb-ratings', CACHE_CONFIG.omdb.ratings);

/**
 * Get all cache metrics
 * @returns {object} Combined metrics from all caches
 */
function getAllMetrics() {
  return {
    tmdb: {
      search: tmdbSearchCache.getMetrics(),
      details: tmdbDetailsCache.getMetrics()
    },
    omdb: {
      ratings: omdbRatingsCache.getMetrics()
    },
    summary: {
      totalHits: tmdbSearchCache.metrics.hits + tmdbDetailsCache.metrics.hits + omdbRatingsCache.metrics.hits,
      totalMisses: tmdbSearchCache.metrics.misses + tmdbDetailsCache.metrics.misses + omdbRatingsCache.metrics.misses,
      totalMemoryMB: Math.round(
        (tmdbSearchCache.cache.calculatedSize +
         tmdbDetailsCache.cache.calculatedSize +
         omdbRatingsCache.cache.calculatedSize) / (1024 * 1024) * 100
      ) / 100
    }
  };
}

/**
 * Clear all caches
 */
function clearAllCaches() {
  tmdbSearchCache.clearAll();
  tmdbDetailsCache.clearAll();
  omdbRatingsCache.clearAll();
  console.log('[Cache] All caches cleared');
}

/**
 * Reset all metrics
 */
function resetAllMetrics() {
  tmdbSearchCache.resetMetrics();
  tmdbDetailsCache.resetMetrics();
  omdbRatingsCache.resetMetrics();
  console.log('[Cache] All metrics reset');
}

// Log cache configuration on startup
console.log('[Cache] Configuration loaded:', {
  enabled: CACHE_CONFIG.tmdb.search.enabled,
  tmdb: {
    search: { ttl: `${CACHE_CONFIG.tmdb.search.ttl / 1000}s`, max: CACHE_CONFIG.tmdb.search.max },
    details: { ttl: `${CACHE_CONFIG.tmdb.details.ttl / 1000}s`, max: CACHE_CONFIG.tmdb.details.max }
  },
  omdb: {
    ratings: { ttl: `${CACHE_CONFIG.omdb.ratings.ttl / 1000}s`, max: CACHE_CONFIG.omdb.ratings.max }
  }
});

module.exports = {
  // Cache instances
  tmdbSearchCache,
  tmdbDetailsCache,
  omdbRatingsCache,

  // Utility functions
  getAllMetrics,
  clearAllCaches,
  resetAllMetrics,

  // Legacy exports (for backward compatibility)
  tmdbCache: tmdbSearchCache,
  omdbCache: omdbRatingsCache,

  // Configuration
  CACHE_CONFIG
};
