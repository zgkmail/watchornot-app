/**
 * Persistent cache layer using SQLite
 * Survives server restarts and provides long-term caching
 */

const Database = require('better-sqlite3');
const path = require('path');

// Determine database path based on environment
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'db');
const cacheDbPath = path.join(dbPath, 'cache.db');

class PersistentCache {
  constructor() {
    this.db = null;
    this.enabled = process.env.PERSISTENT_CACHE_ENABLED !== 'false';

    if (this.enabled) {
      this.initialize();
    }
  }

  /**
   * Initialize database and create tables
   */
  initialize() {
    try {
      this.db = new Database(cacheDbPath, {
        verbose: process.env.NODE_ENV === 'development' ? null : null
      });

      // Enable WAL mode for better concurrency
      this.db.pragma('journal_mode = WAL');

      // Create cache table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS api_cache (
          cache_key TEXT PRIMARY KEY,
          cache_value TEXT NOT NULL,
          expires_at INTEGER NOT NULL,
          created_at INTEGER NOT NULL,
          api_source TEXT NOT NULL,
          hit_count INTEGER DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS idx_expires_at ON api_cache(expires_at);
        CREATE INDEX IF NOT EXISTS idx_api_source ON api_cache(api_source);
        CREATE INDEX IF NOT EXISTS idx_created_at ON api_cache(created_at);
      `);

      console.log('[Persistent Cache] Initialized successfully');
      console.log('[Persistent Cache] Database path:', cacheDbPath);

      // Run initial cleanup
      this.cleanup();
    } catch (error) {
      console.error('[Persistent Cache] Initialization error:', error.message);
      this.enabled = false;
    }
  }

  /**
   * Get an item from persistent cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or null if expired/missing
   */
  get(key) {
    if (!this.enabled || !this.db) return null;

    try {
      const stmt = this.db.prepare(`
        SELECT cache_value, expires_at
        FROM api_cache
        WHERE cache_key = ?
      `);

      const row = stmt.get(key);

      if (!row) {
        return null;
      }

      // Check if expired
      const now = Date.now();
      if (now > row.expires_at) {
        // Delete expired entry
        this.delete(key);
        return null;
      }

      // Increment hit count
      this.incrementHitCount(key);

      // Parse and return cached value
      return JSON.parse(row.cache_value);
    } catch (error) {
      console.error('[Persistent Cache] Get error:', error.message);
      return null;
    }
  }

  /**
   * Set an item in persistent cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttlMs - Time to live in milliseconds
   * @param {string} apiSource - API source identifier (tmdb, omdb, etc.)
   */
  set(key, value, ttlMs, apiSource = 'unknown') {
    if (!this.enabled || !this.db) return;

    try {
      const now = Date.now();
      const expiresAt = now + ttlMs;
      const cacheValue = JSON.stringify(value);

      const stmt = this.db.prepare(`
        INSERT INTO api_cache (cache_key, cache_value, expires_at, created_at, api_source, hit_count)
        VALUES (?, ?, ?, ?, ?, 0)
        ON CONFLICT(cache_key) DO UPDATE SET
          cache_value = excluded.cache_value,
          expires_at = excluded.expires_at,
          created_at = excluded.created_at
      `);

      stmt.run(key, cacheValue, expiresAt, now, apiSource);
    } catch (error) {
      console.error('[Persistent Cache] Set error:', error.message);
    }
  }

  /**
   * Delete an item from persistent cache
   * @param {string} key - Cache key
   */
  delete(key) {
    if (!this.enabled || !this.db) return;

    try {
      const stmt = this.db.prepare('DELETE FROM api_cache WHERE cache_key = ?');
      stmt.run(key);
    } catch (error) {
      console.error('[Persistent Cache] Delete error:', error.message);
    }
  }

  /**
   * Increment hit count for cache analytics
   * @param {string} key - Cache key
   */
  incrementHitCount(key) {
    if (!this.enabled || !this.db) return;

    try {
      const stmt = this.db.prepare(`
        UPDATE api_cache
        SET hit_count = hit_count + 1
        WHERE cache_key = ?
      `);
      stmt.run(key);
    } catch (error) {
      console.error('[Persistent Cache] Increment hit count error:', error.message);
    }
  }

  /**
   * Clear all cache entries for a specific API source
   * @param {string} apiSource - API source identifier (tmdb, omdb, etc.)
   */
  clearBySource(apiSource) {
    if (!this.enabled || !this.db) return;

    try {
      const stmt = this.db.prepare('DELETE FROM api_cache WHERE api_source = ?');
      const result = stmt.run(apiSource);
      console.log(`[Persistent Cache] Cleared ${result.changes} entries for ${apiSource}`);
    } catch (error) {
      console.error('[Persistent Cache] Clear by source error:', error.message);
    }
  }

  /**
   * Clear all cache entries
   */
  clearAll() {
    if (!this.enabled || !this.db) return;

    try {
      const stmt = this.db.prepare('DELETE FROM api_cache');
      const result = stmt.run();
      console.log(`[Persistent Cache] Cleared all ${result.changes} entries`);
    } catch (error) {
      console.error('[Persistent Cache] Clear all error:', error.message);
    }
  }

  /**
   * Clean up expired entries
   * @returns {number} Number of deleted entries
   */
  cleanup() {
    if (!this.enabled || !this.db) return 0;

    try {
      const now = Date.now();
      const stmt = this.db.prepare('DELETE FROM api_cache WHERE expires_at < ?');
      const result = stmt.run(now);

      if (result.changes > 0) {
        console.log(`[Persistent Cache] Cleaned up ${result.changes} expired entries`);
      }

      return result.changes;
    } catch (error) {
      console.error('[Persistent Cache] Cleanup error:', error.message);
      return 0;
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Cache statistics
   */
  getStats() {
    if (!this.enabled || !this.db) {
      return {
        enabled: false,
        totalEntries: 0,
        bySource: {},
        databaseSize: 0
      };
    }

    try {
      // Total entries
      const totalStmt = this.db.prepare('SELECT COUNT(*) as count FROM api_cache');
      const total = totalStmt.get();

      // Entries by source
      const bySourceStmt = this.db.prepare(`
        SELECT api_source, COUNT(*) as count, SUM(hit_count) as total_hits
        FROM api_cache
        GROUP BY api_source
      `);
      const bySource = bySourceStmt.all();

      // Database size (approximate)
      const sizeStmt = this.db.prepare("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()");
      const size = sizeStmt.get();

      // Most popular cache entries
      const popularStmt = this.db.prepare(`
        SELECT cache_key, api_source, hit_count
        FROM api_cache
        ORDER BY hit_count DESC
        LIMIT 10
      `);
      const popular = popularStmt.all();

      return {
        enabled: true,
        totalEntries: total.count,
        bySource: bySource.reduce((acc, row) => {
          acc[row.api_source] = {
            count: row.count,
            totalHits: row.total_hits || 0
          };
          return acc;
        }, {}),
        databaseSizeMB: Math.round((size.size / (1024 * 1024)) * 100) / 100,
        mostPopular: popular
      };
    } catch (error) {
      console.error('[Persistent Cache] Get stats error:', error.message);
      return {
        enabled: true,
        totalEntries: 0,
        bySource: {},
        databaseSize: 0,
        error: error.message
      };
    }
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      console.log('[Persistent Cache] Database closed');
    }
  }
}

// Create singleton instance
const persistentCache = new PersistentCache();

// Cleanup job - run every 6 hours
setInterval(() => {
  persistentCache.cleanup();
}, 6 * 60 * 60 * 1000);

// Graceful shutdown
process.on('SIGTERM', () => {
  persistentCache.close();
});

process.on('SIGINT', () => {
  persistentCache.close();
});

module.exports = persistentCache;
