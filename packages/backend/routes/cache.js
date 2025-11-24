const express = require('express');
const router = express.Router();
const {
  tmdbSearchCache,
  tmdbDetailsCache,
  omdbRatingsCache,
  getAllMetrics,
  clearAllCaches,
  resetAllMetrics
} = require('../utils/cache');
const persistentCache = require('../utils/persistentCache');

/**
 * Get cache statistics
 * GET /api/cache/stats
 */
router.get('/stats', async (req, res) => {
  try {
    // Authentication check (optional - can be admin-only if needed)
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const inMemoryMetrics = getAllMetrics();
    const persistentStats = persistentCache.getStats();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      inMemoryCache: inMemoryMetrics,
      persistentCache: persistentStats
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({
      error: 'Failed to fetch cache statistics',
      message: error.message
    });
  }
});

/**
 * Clear specific cache
 * DELETE /api/cache/:cacheName
 */
router.delete('/:cacheName', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { cacheName } = req.params;

    switch (cacheName) {
      case 'tmdb-search':
        tmdbSearchCache.clearAll();
        persistentCache.clearBySource('tmdb-search');
        break;
      case 'tmdb-details':
        tmdbDetailsCache.clearAll();
        persistentCache.clearBySource('tmdb-details');
        break;
      case 'omdb-ratings':
        omdbRatingsCache.clearAll();
        persistentCache.clearBySource('omdb-ratings');
        break;
      case 'all':
        clearAllCaches();
        persistentCache.clearAll();
        break;
      case 'persistent-only':
        persistentCache.clearAll();
        break;
      default:
        return res.status(400).json({
          error: 'Invalid cache name',
          validNames: ['tmdb-search', 'tmdb-details', 'omdb-ratings', 'all', 'persistent-only']
        });
    }

    res.json({
      success: true,
      message: `Cache "${cacheName}" cleared successfully`
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

/**
 * Reset cache metrics
 * POST /api/cache/metrics/reset
 */
router.post('/metrics/reset', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    resetAllMetrics();

    res.json({
      success: true,
      message: 'Cache metrics reset successfully'
    });
  } catch (error) {
    console.error('Error resetting metrics:', error);
    res.status(500).json({
      error: 'Failed to reset metrics',
      message: error.message
    });
  }
});

/**
 * Get detailed cache info (debugging)
 * GET /api/cache/info
 */
router.get('/info', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({
      success: true,
      caches: {
        tmdbSearch: tmdbSearchCache.getInfo(),
        tmdbDetails: tmdbDetailsCache.getInfo(),
        omdbRatings: omdbRatingsCache.getInfo()
      }
    });
  } catch (error) {
    console.error('Error fetching cache info:', error);
    res.status(500).json({
      error: 'Failed to fetch cache info',
      message: error.message
    });
  }
});

module.exports = router;
