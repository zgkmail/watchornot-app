const express = require('express');
const router = express.Router();
const axios = require('axios');
const { tmdbSearchCache, tmdbDetailsCache } = require('../utils/cache');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Proxy endpoint for TMDB API requests
 * This keeps the actual API key secure on the backend
 */

/**
 * Search for movies/TV shows
 * GET /api/tmdb/search?query=movie_name&media_type=movie|tv
 */
router.get('/search', async (req, res) => {
  try {
    const { query, media_type } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Use API key from environment variables
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'TMDB API key not configured on server. Please contact administrator.' });
    }

    // Validate and determine the search endpoint based on media_type
    let searchEndpoint;

    if (!media_type || media_type === 'multi') {
      searchEndpoint = '/search/multi';
      console.log('🔍 Searching movies and TV shows (multi)');
    } else if (media_type === 'movie') {
      searchEndpoint = '/search/movie';
      console.log('🎬 Searching movies only');
    } else if (media_type === 'tv') {
      searchEndpoint = '/search/tv';
      console.log('📺 Searching TV shows only');
    } else {
      return res.status(400).json({
        error: 'Invalid media_type parameter',
        message: 'media_type must be one of: movie, tv, multi, or omitted'
      });
    }

    // Generate cache key (normalize query to lowercase for better hit rate)
    const cacheKey = `search:${query.toLowerCase().trim()}:${media_type || 'multi'}`;

    // Check cache first
    const startTime = Date.now();
    const cached = tmdbSearchCache.get(cacheKey);

    if (cached) {
      const responseTime = Date.now() - startTime;
      console.log(`[Cache HIT] TMDB search: "${query}" (${responseTime}ms)`);
      return res.json(cached);
    }

    // Cache miss - make request to TMDB API
    console.log(`[Cache MISS] TMDB search: "${query}"`);
    const response = await axios.get(`${TMDB_BASE_URL}${searchEndpoint}`, {
      params: {
        api_key: apiKey,
        query: query
      }
    });

    const totalTime = Date.now() - startTime;
    console.log(`[TMDB API] Search completed in ${totalTime}ms`);

    // Cache the response (24 hours default)
    tmdbSearchCache.set(cacheKey, response.data);

    res.json(response.data);
  } catch (error) {
    console.error('TMDB search error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid TMDB API key. Please check your API key.' });
    }

    res.status(error.response?.status || 500).json({
      error: error.response?.data?.status_message || 'Failed to search TMDB'
    });
  }
});

/**
 * Get details for a specific movie/TV show
 * GET /api/tmdb/:mediaType/:id
 */
router.get('/:mediaType/:id', async (req, res) => {
  try {
    const { mediaType, id } = req.params;

    if (!['movie', 'tv'].includes(mediaType)) {
      return res.status(400).json({ error: 'Invalid media type. Must be "movie" or "tv"' });
    }

    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Use API key from environment variables
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'TMDB API key not configured on server. Please contact administrator.' });
    }

    // Generate cache key
    const cacheKey = `details:${mediaType}:${id}`;

    // Check cache first
    const startTime = Date.now();
    const cached = tmdbDetailsCache.get(cacheKey);

    if (cached) {
      const responseTime = Date.now() - startTime;
      console.log(`[Cache HIT] TMDB details: ${mediaType}/${id} (${responseTime}ms)`);
      return res.json(cached);
    }

    // Cache miss - make request to TMDB API with credits, external_ids, and videos appended
    console.log(`[Cache MISS] TMDB details: ${mediaType}/${id}`);
    const response = await axios.get(`${TMDB_BASE_URL}/${mediaType}/${id}`, {
      params: {
        api_key: apiKey,
        append_to_response: 'credits,external_ids,videos'
      }
    });

    const totalTime = Date.now() - startTime;
    console.log(`[TMDB API] Details completed in ${totalTime}ms`);

    // Cache the response (7 days default)
    tmdbDetailsCache.set(cacheKey, response.data);

    res.json(response.data);
  } catch (error) {
    console.error('TMDB details error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid TMDB API key. Please check your API key.' });
    }

    res.status(error.response?.status || 500).json({
      error: error.response?.data?.status_message || 'Failed to get TMDB details'
    });
  }
});

module.exports = router;
