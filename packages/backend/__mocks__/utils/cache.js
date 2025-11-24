/**
 * Mock cache for testing
 */

// Mock cache class
class MockCache {
  constructor() {
    // Expose a cache property that mimics LRU cache behavior
    this.cache = {
      get: (key, options) => {
        return null; // Always return null (cache miss or stale miss)
      },
      set: (key, value) => {},
      has: (key) => false,
      clear: (key) => {},
      size: 0
    };
  }

  get(key) {
    return null; // Always return cache miss for consistent tests
  }

  set(key, value, ttl) {
    // No-op for tests
  }

  has(key) {
    return false;
  }

  clear(key) {
    // No-op
  }

  clearAll() {
    // No-op
  }

  size() {
    return 0;
  }

  getMetrics() {
    return {
      name: 'mock-cache',
      enabled: true,
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      errors: 0,
      hitRate: 0,
      hitRatePercent: 0,
      size: 0,
      calculatedSize: 0,
      maxSize: 0,
      memoryUsageMB: 0
    };
  }

  resetMetrics() {
    // No-op
  }

  getInfo() {
    return {
      name: 'mock-cache',
      enabled: true,
      config: {},
      metrics: this.getMetrics()
    };
  }
}

// Create mock instances
const tmdbSearchCache = new MockCache();
const tmdbDetailsCache = new MockCache();
const omdbRatingsCache = new MockCache();

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
      totalHits: 0,
      totalMisses: 0,
      totalMemoryMB: 0
    }
  };
}

function clearAllCaches() {
  tmdbSearchCache.clearAll();
  tmdbDetailsCache.clearAll();
  omdbRatingsCache.clearAll();
}

function resetAllMetrics() {
  // No-op
}

module.exports = {
  tmdbSearchCache,
  tmdbDetailsCache,
  omdbRatingsCache,
  getAllMetrics,
  clearAllCaches,
  resetAllMetrics,
  tmdbCache: tmdbSearchCache,
  omdbCache: omdbRatingsCache,
  CACHE_CONFIG: {}
};
