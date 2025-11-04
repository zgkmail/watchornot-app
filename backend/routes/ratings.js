const express = require('express');
const router = express.Router();
const {
  saveMovieRating,
  getUserMovieRatings,
  getMovieRating,
  deleteMovieRating,
  getUserGenrePreferences
} = require('../db/database');

/**
 * Calculate personal score for a movie
 * Formula: Personal Score = (IMDb Score × 0.6) + (Taste Match × 0.4)
 * Requires at least 5 rated movies to generate a personal score
 */
function calculatePersonalScore(movie, userId) {
  const imdbScore = movie.imdbRating || movie.imdb_rating || 0;

  // If no IMDb score, return null
  if (!imdbScore) {
    return null;
  }

  // Get all user ratings to check count
  const userRatings = getUserMovieRatings(userId);
  const ratedMovies = userRatings.filter(m => m.rating !== null);

  // Require at least 5 rated movies before showing personal score
  if (ratedMovies.length < 5) {
    return null;
  }

  // Get genre preferences for the user
  const genrePrefs = getUserGenrePreferences(userId);

  // Calculate taste match (0-10 scale)
  let tasteMatch = 5.0; // Start neutral

  // Genre preference match (0-3 points)
  const movieGenre = movie.genre;
  if (movieGenre) {
    const genrePref = genrePrefs.find(g => g.genre === movieGenre);
    if (genrePref) {
      const totalRatings = genrePref.thumbs_up + genrePref.thumbs_down;
      const positiveRatio = genrePref.thumbs_up / totalRatings;

      // Add up to 3 points based on positive ratio
      tasteMatch += (positiveRatio * 3);

      // Subtract up to 2 points if negative ratio is high
      if (positiveRatio < 0.5) {
        tasteMatch -= ((1 - positiveRatio) * 2);
      }
    }
  }

  // Use ratedMovies already fetched above to find similar patterns
  if (ratedMovies.length > 0) {
    // Similar IMDb range preference (0-2 points)
    const imdbRange = Math.floor(imdbScore);
    const similarMovies = ratedMovies.filter(m => {
      const mRating = m.imdb_rating || 0;
      return Math.abs(Math.floor(mRating) - imdbRange) <= 1;
    });

    if (similarMovies.length > 0) {
      const positiveInRange = similarMovies.filter(m => m.rating === 'up').length;
      const ratioInRange = positiveInRange / similarMovies.length;
      tasteMatch += (ratioInRange * 2);
    }

    // Recency bonus: newer movies get slight boost if user likes recent films (0-1 point)
    const currentYear = new Date().getFullYear();
    const movieYear = parseInt(movie.year) || 0;
    if (movieYear >= currentYear - 3) {
      const recentMovies = ratedMovies.filter(m => {
        const mYear = parseInt(m.year) || 0;
        return mYear >= currentYear - 3;
      });

      if (recentMovies.length > 0) {
        const positiveRecent = recentMovies.filter(m => m.rating === 'up').length;
        const recentRatio = positiveRecent / recentMovies.length;
        if (recentRatio > 0.6) {
          tasteMatch += 1;
        }
      }
    }
  }

  // Clamp taste match to 0-10 range
  tasteMatch = Math.max(0, Math.min(10, tasteMatch));

  // Calculate final personal score
  const personalScore = (imdbScore * 0.6) + (tasteMatch * 0.4);

  // Round to 1 decimal place
  return Math.round(personalScore * 10) / 10;
}

/**
 * Get all movie ratings for the current user
 * GET /api/ratings
 */
router.get('/', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const ratings = getUserMovieRatings(req.session.userId);

    // Calculate personal scores for each movie
    const ratingsWithScores = ratings.map(movie => ({
      ...movie,
      personalScore: calculatePersonalScore(movie, req.session.userId)
    }));

    res.json({
      ratings: ratingsWithScores,
      count: ratings.length
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ error: 'Failed to get ratings' });
  }
});

/**
 * Save or update a movie rating
 * POST /api/ratings
 */
router.post('/', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const movieData = req.body;

    if (!movieData.id || !movieData.title) {
      return res.status(400).json({ error: 'Movie ID and title are required' });
    }

    // Save the rating
    saveMovieRating(req.session.userId, movieData);

    // Calculate personal score for this movie
    const personalScore = calculatePersonalScore(movieData, req.session.userId);

    res.json({
      success: true,
      movieId: movieData.id,
      personalScore: personalScore
    });
  } catch (error) {
    console.error('Save rating error:', error);
    res.status(500).json({ error: 'Failed to save rating' });
  }
});

/**
 * Get a specific movie rating and personal score
 * GET /api/ratings/:movieId
 */
router.get('/:movieId', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { movieId } = req.params;
    const movie = getMovieRating(req.session.userId, movieId);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const personalScore = calculatePersonalScore(movie, req.session.userId);

    res.json({
      ...movie,
      personalScore: personalScore
    });
  } catch (error) {
    console.error('Get movie rating error:', error);
    res.status(500).json({ error: 'Failed to get movie rating' });
  }
});

/**
 * Calculate personal score for a movie (without saving)
 * POST /api/ratings/calculate-score
 */
router.post('/calculate-score', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const movieData = req.body;

    const personalScore = calculatePersonalScore(movieData, req.session.userId);

    res.json({
      personalScore: personalScore,
      imdbRating: movieData.imdbRating || movieData.imdb_rating
    });
  } catch (error) {
    console.error('Calculate score error:', error);
    res.status(500).json({ error: 'Failed to calculate score' });
  }
});

/**
 * Delete a movie rating
 * DELETE /api/ratings/:movieId
 */
router.delete('/:movieId', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { movieId } = req.params;

    deleteMovieRating(req.session.userId, movieId);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ error: 'Failed to delete rating' });
  }
});

/**
 * Get user's genre preferences and insights
 * GET /api/ratings/preferences/genres
 */
router.get('/preferences/genres', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const preferences = getUserGenrePreferences(req.session.userId);

    // Calculate insights
    const insights = preferences.map(pref => {
      const total = pref.thumbs_up + pref.thumbs_down;
      const positiveRatio = pref.thumbs_up / total;

      let sentiment = 'neutral';
      if (positiveRatio >= 0.7) sentiment = 'love';
      else if (positiveRatio >= 0.5) sentiment = 'like';
      else if (positiveRatio >= 0.3) sentiment = 'mixed';
      else sentiment = 'dislike';

      return {
        genre: pref.genre,
        thumbsUp: pref.thumbs_up,
        thumbsDown: pref.thumbs_down,
        sentiment: sentiment,
        avgImdbRating: pref.avg_imdb_rating
      };
    });

    res.json({ preferences: insights });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

module.exports = router;
