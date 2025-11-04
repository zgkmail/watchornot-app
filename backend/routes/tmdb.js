const express = require('express');
const router = express.Router();
const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Proxy endpoint for TMDB API requests
 * This keeps the actual API key secure on the backend
 */

/**
 * Search for movies/TV shows
 * GET /api/tmdb/search?query=movie_name
 */
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

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

    // Make request to TMDB API
    const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
      params: {
        api_key: apiKey,
        query: query
      }
    });

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

    // Make request to TMDB API with credits and external_ids appended
    const response = await axios.get(`${TMDB_BASE_URL}/${mediaType}/${id}`, {
      params: {
        api_key: apiKey,
        append_to_response: 'credits,external_ids'
      }
    });

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
