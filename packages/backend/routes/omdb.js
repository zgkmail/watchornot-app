const express = require('express');
const router = express.Router();
const axios = require('axios');
const { omdbRatingsCache } = require('../utils/cache');

const OMDB_BASE_URL = 'https://www.omdbapi.com';

/**
 * Test endpoint to verify OMDb API configuration
 * GET /api/omdb/test
 */
router.get('/test', async (req, res) => {
  console.log('\n========== OMDB API TEST ==========');

  try {
    const apiKey = process.env.OMDB_API_KEY;

    if (!apiKey || apiKey === 'your_omdb_api_key_here') {
      return res.status(500).json({
        status: 'error',
        message: 'OMDB_API_KEY not configured',
        debug: 'Set your OMDb API key in backend/.env file'
      });
    }

    console.log('✓ API key found (length:', apiKey.length, ')');
    console.log('📤 Testing OMDb API connection with "Inception"...');

    // Test with Inception
    const response = await axios.get(OMDB_BASE_URL, {
      params: {
        apikey: apiKey,
        i: 'tt1375666', // Inception IMDb ID
      },
      timeout: 10000
    });

    console.log('✅ OMDb API test successful');
    console.log('Response status:', response.status);
    console.log('Movie:', response.data.Title);
    console.log('IMDb Rating:', response.data.imdbRating);
    console.log('Ratings:', JSON.stringify(response.data.Ratings, null, 2));
    console.log('========================================\n');

    return res.json({
      status: 'success',
      message: 'OMDb API is configured correctly',
      details: {
        apiKeyConfigured: true,
        testMovie: response.data.Title,
        imdbRating: response.data.imdbRating,
        ratings: response.data.Ratings
      }
    });
  } catch (error) {
    console.error('❌ OMDb API test failed');
    console.error('Error:', error.message);

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));

      return res.status(500).json({
        status: 'error',
        message: 'OMDb API test failed',
        debug: {
          status: error.response.status,
          message: error.response.data?.Error || error.message,
          details: error.response.data
        }
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'OMDb API test failed',
      debug: {
        message: error.message,
        type: error.constructor.name
      }
    });
  }
});

/**
 * Get ratings for a movie/TV show by IMDb ID
 * GET /api/omdb/ratings/:imdbId
 */
router.get('/ratings/:imdbId', async (req, res) => {
  const startTime = Date.now();
  console.log('\n========== OMDB RATINGS REQUEST ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('IMDb ID:', req.params.imdbId);
  console.log('Session ID:', req.session.id);
  console.log('User ID:', req.session.userId);

  try {
    const { imdbId } = req.params;

    // Validate IMDb ID format
    if (!imdbId || !imdbId.match(/^tt\d{7,8}$/)) {
      console.error('❌ ERROR: Invalid IMDb ID format:', imdbId);
      return res.status(400).json({
        error: 'Invalid IMDb ID format',
        debug: 'IMDb ID should be in format "tt1234567"'
      });
    }

    console.log('✓ IMDb ID validated');

    // Check authentication
    if (!req.session.userId) {
      console.error('❌ ERROR: User not authenticated');
      return res.status(401).json({
        error: 'Not authenticated',
        debug: 'Session does not contain userId'
      });
    }

    console.log('✓ User authenticated');

    // Check API key
    const apiKey = process.env.OMDB_API_KEY;

    if (!apiKey || apiKey === 'your_omdb_api_key_here') {
      console.error('❌ FATAL: OMDB_API_KEY not configured');
      return res.status(500).json({
        error: 'OMDb API key not configured on server. Please contact administrator.',
        debug: 'OMDB_API_KEY environment variable is not set'
      });
    }

    console.log('✓ API key configured (length:', apiKey.length, 'characters)');

    // Generate cache key
    const cacheKey = `ratings:${imdbId}`;

    // Check cache first
    const cached = omdbRatingsCache.get(cacheKey);

    if (cached) {
      const cacheDuration = Date.now() - startTime;
      console.log(`[Cache HIT] OMDb ratings: ${imdbId} (${cacheDuration}ms)`);
      console.log('📊 Cached ratings:', JSON.stringify(cached.ratings, null, 2));
      console.log('========================================\n');
      return res.json(cached);
    }

    // Cache miss - fetch from API
    console.log(`[Cache MISS] OMDb ratings: ${imdbId}`);
    console.log('📤 Fetching ratings from OMDb API...');

    // Make request to OMDb API
    const response = await axios.get(OMDB_BASE_URL, {
      params: {
        apikey: apiKey,
        i: imdbId,
      },
      timeout: 10000
    });

    const duration = Date.now() - startTime;
    console.log('✅ OMDb API responded successfully');
    console.log('Response time:', duration, 'ms');

    // Check if movie was found
    if (response.data.Response === 'False') {
      console.log('⚠️  Movie not found in OMDb:', response.data.Error);
      // Don't cache "not found" responses
      return res.json({
        found: false,
        error: response.data.Error
      });
    }

    // Extract ratings
    const data = response.data;
    const ratings = {
      imdb: {
        rating: data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : null,
        votes: data.imdbVotes !== 'N/A' ? data.imdbVotes : null
      },
      rottenTomatoes: null,
      metacritic: null
    };

    // Parse ratings array
    if (data.Ratings && Array.isArray(data.Ratings)) {
      data.Ratings.forEach(rating => {
        if (rating.Source === 'Rotten Tomatoes') {
          // Convert "87%" to 87
          const match = rating.Value.match(/(\d+)%/);
          if (match) {
            ratings.rottenTomatoes = parseInt(match[1]);
          }
        } else if (rating.Source === 'Metacritic') {
          // Convert "74/100" to 74
          const match = rating.Value.match(/(\d+)\/100/);
          if (match) {
            ratings.metacritic = parseInt(match[1]);
          }
        }
      });
    }

    console.log('📊 Extracted ratings:');
    console.log('   IMDb:', ratings.imdb.rating, '(' + ratings.imdb.votes, 'votes)');
    console.log('   Rotten Tomatoes:', ratings.rottenTomatoes ? ratings.rottenTomatoes + '%' : 'N/A');
    console.log('   Metacritic:', ratings.metacritic ? ratings.metacritic + '/100' : 'N/A');
    console.log('   Director:', data.Director || 'N/A');
    console.log('   Actors:', data.Actors || 'N/A');

    // Prepare response
    const result = {
      found: true,
      title: data.Title,
      year: data.Year,
      director: data.Director !== 'N/A' ? data.Director : null,
      actors: data.Actors !== 'N/A' ? data.Actors : null,
      ratings: ratings,
      responseTime: duration
    };

    // Cache the response (7 days default)
    omdbRatingsCache.set(cacheKey, result);
    console.log('💾 Cached ratings for', imdbId);
    console.log('========================================\n');

    res.json(result);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('\n❌❌❌ OMDB API ERROR ❌❌❌');
    console.error('Duration:', duration, 'ms');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));

      // Handle rate limiting / too many requests
      if (error.response.status === 429) {
        console.error('⚠️  OMDb API rate limit exceeded');

        // Try to serve stale cache if available
        const cacheKey = `ratings:${req.params.imdbId}`;
        const staleCache = omdbRatingsCache.cache.get(cacheKey, { allowStale: true });

        if (staleCache) {
          console.log('📦 Serving stale cache due to rate limit');
          return res.json({
            ...staleCache,
            cached: true,
            cacheWarning: 'Served from cache due to API rate limit'
          });
        }

        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests to OMDb API. Please try again later.',
          debug: {
            status: 429,
            type: 'rate_limit'
          }
        });
      }

      // Handle OMDb specific errors (like daily limit reached)
      if (error.response.data?.Error) {
        const errorMsg = error.response.data.Error.toLowerCase();

        // Check for daily limit error
        if (errorMsg.includes('daily limit') || errorMsg.includes('limit reached') || errorMsg.includes('over quota')) {
          console.error('⚠️  OMDb API daily limit reached');

          // Try to serve stale cache if available
          const cacheKey = `ratings:${req.params.imdbId}`;
          const staleCache = omdbRatingsCache.cache.get(cacheKey, { allowStale: true });

          if (staleCache) {
            console.log('📦 Serving stale cache due to daily limit');
            return res.json({
              ...staleCache,
              cached: true,
              cacheWarning: 'Served from cache due to OMDb daily limit'
            });
          }

          return res.status(429).json({
            error: 'Daily limit reached',
            message: 'OMDb API daily limit has been reached. Ratings unavailable until tomorrow.',
            debug: {
              status: error.response.status,
              type: 'daily_limit',
              details: error.response.data.Error
            }
          });
        }
      }

      return res.status(error.response.status).json({
        error: error.response.data?.Error || 'OMDb API error',
        debug: {
          status: error.response.status,
          details: error.response.data
        }
      });
    } else if (error.request) {
      console.error('❌ No response received from OMDb API');
      return res.status(503).json({
        error: 'Could not reach OMDb API',
        debug: {
          message: 'Network error - no response received',
          error: error.message
        }
      });
    } else {
      console.error('❌ Error setting up request:', error.message);
      return res.status(500).json({
        error: 'Failed to fetch ratings',
        debug: {
          message: error.message,
          type: error.constructor.name
        }
      });
    }
  }
});

module.exports = router;
