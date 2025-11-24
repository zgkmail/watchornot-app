/**
 * Mock persistent cache for testing
 */

class MockPersistentCache {
  constructor() {
    this.enabled = false; // Disabled for tests
  }

  get(key) {
    return null; // Always return cache miss
  }

  set(key, value, ttlMs, apiSource) {
    // No-op for tests
  }

  delete(key) {
    // No-op
  }

  incrementHitCount(key) {
    // No-op
  }

  clearBySource(apiSource) {
    // No-op
  }

  clearAll() {
    // No-op
  }

  cleanup() {
    return 0;
  }

  getStats() {
    return {
      enabled: false,
      totalEntries: 0,
      bySource: {},
      databaseSizeMB: 0,
      mostPopular: []
    };
  }

  close() {
    // No-op
  }
}

// Export singleton instance
module.exports = new MockPersistentCache();
