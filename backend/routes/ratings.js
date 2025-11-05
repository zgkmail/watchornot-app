const express = require('express');
const router = express.Router();
const {
  saveMovieRating,
  getUserMovieRatings,
  getMovieRating,
  deleteMovieRating,
  getUserGenrePreferences,
  getMovieGenres
} = require('../db/database');

/**
 * Get progressive weights based on total votes
 * Newer users get more weight on IMDb score for stability
 * Experienced users get more weight on taste profile
 * NOTE: Should only be called when totalVotes >= 5 (personal scores unlocked)
 * Tier boundaries:
 * - Explorer: 5-14 votes
 * - Enthusiast: 15-29 votes
 * - Expert: 30-49 votes
 * - Master: 50+ votes
 */
function getPersonalScoreWeights(totalVotes) {
  if (totalVotes >= 50)  return { imdb: 0.50, taste: 0.50, tier: 'Master' };
  if (totalVotes >= 30)  return { imdb: 0.60, taste: 0.40, tier: 'Expert' };
  if (totalVotes >= 15)  return { imdb: 0.70, taste: 0.30, tier: 'Enthusiast' };
  if (totalVotes >= 5)   return { imdb: 0.85, taste: 0.15, tier: 'Explorer' };

  // Should never reach here - personal scores require >= 5 votes
  // Return null to indicate invalid state
  return null;
}

/**
 * Calculate personal score for a movie with progressive weighting
 * Formula: Personal Score = (IMDb Score × imdbWeight) + (Taste Match × tasteWeight)
 * Weights adjust based on user experience level
 * Requires at least 5 rated movies to generate a personal score
 * @param {Object} movie - The movie to calculate score for
 * @param {string} userId - The user ID
 * @param {string|null} excludeMovieId - Optional movie ID to exclude from calculations (prevents circular dependency)
 */
function calculatePersonalScore(movie, userId, excludeMovieId = null) {
  const imdbScore = movie.imdbRating || movie.imdb_rating || 0;

  // If no IMDb score, return null
  if (!imdbScore) {
    return null;
  }

  // Get all user ratings to check count
  const userRatings = getUserMovieRatings(userId);

  // Filter out the current movie being scored to prevent circular dependency
  const ratedMovies = userRatings.filter(m => {
    return m.rating !== null && (!excludeMovieId || m.movie_id !== excludeMovieId);
  });

  // Require at least 5 rated movies before showing personal score
  // If excluding current movie, we need at least 5 OTHER movies
  if (ratedMovies.length < 5) {
    return null;
  }

  // Get progressive weights based on user experience
  const weights = getPersonalScoreWeights(ratedMovies.length);

  // Safety check - should never happen due to guard above
  if (!weights) {
    return null;
  }

  // Get genre preferences for the user
  const genrePrefs = getUserGenrePreferences(userId);

  // Calculate taste match (0-10 scale)
  let tasteMatch = 5.0; // Start neutral

  // Bayesian smoothing priors to prevent extreme ratios for new users
  const PRIOR_POSITIVE = 1;
  const PRIOR_NEGATIVE = 1;

  // Genre preference match (0-3 points) - now handles multiple genres
  // Get all genres for this movie from the junction table
  const movieGenres = getMovieGenres(userId, movie.id || movie.movie_id);

  // If no genres in junction table yet, fall back to parsing the genre string
  let genresToCheck = movieGenres;
  if (genresToCheck.length === 0 && movie.genre) {
    genresToCheck = movie.genre.split(',').map(g => g.trim()).filter(g => g);
  }

  if (genresToCheck.length > 0) {
    let genreMatchSum = 0;
    let genresMatched = 0;

    genresToCheck.forEach(genre => {
      const genrePref = genrePrefs.find(g => g.genre === genre);

      if (genrePref) {
        let thumbsUp = genrePref.thumbs_up;
        let thumbsDown = genrePref.thumbs_down;

        // If excluding current movie, adjust genre counts to prevent circular dependency
        if (excludeMovieId) {
          const currentMovieGenres = getMovieGenres(userId, excludeMovieId);
          if (currentMovieGenres.includes(genre)) {
            const currentMovie = userRatings.find(m => m.movie_id === excludeMovieId);
            if (currentMovie && currentMovie.rating) {
              if (currentMovie.rating === 'up') thumbsUp = Math.max(0, thumbsUp - 1);
              if (currentMovie.rating === 'down') thumbsDown = Math.max(0, thumbsDown - 1);
            }
          }
        }

        // Apply Bayesian smoothing to prevent extreme ratios
        const smoothedUp = thumbsUp + PRIOR_POSITIVE;
        const smoothedDown = thumbsDown + PRIOR_NEGATIVE;
        const totalRatings = smoothedUp + smoothedDown;

        const positiveRatio = smoothedUp / totalRatings;

        // Calculate contribution for this genre (0-3 points)
        let genreContribution = (positiveRatio * 3);

        // Subtract up to 2 points if negative ratio is high
        if (positiveRatio < 0.5) {
          genreContribution -= ((1 - positiveRatio) * 2);
        }

        genreMatchSum += genreContribution;
        genresMatched++;
      }
    });

    // Average the genre contributions if we found any matches
    if (genresMatched > 0) {
      tasteMatch += (genreMatchSum / genresMatched);
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

  // Calculate final personal score with progressive weights
  const personalScore = (imdbScore * weights.imdb) + (tasteMatch * weights.taste);

  // Round to 1 decimal place and return with metadata
  return {
    score: Math.round(personalScore * 10) / 10,
    weights: {
      imdb: weights.imdb,
      taste: weights.taste,
      imdbPercentage: Math.round(weights.imdb * 100),
      tastePercentage: Math.round(weights.taste * 100)
    },
    tier: weights.tier,
    totalVotes: ratedMovies.length
  };
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

    // Calculate personal scores for each movie (exclude itself from calculation)
    const ratingsWithScores = ratings.map(movie => {
      const scoreData = calculatePersonalScore(movie, req.session.userId, movie.movie_id);
      return {
        ...movie,
        personalScore: scoreData ? scoreData.score : null,
        scoreWeights: scoreData ? scoreData.weights : null,
        tier: scoreData ? scoreData.tier : null
      };
    });

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

    // Calculate personal score for this movie (exclude itself from calculation)
    const scoreData = calculatePersonalScore(movieData, req.session.userId, movieData.id);

    res.json({
      success: true,
      movieId: movieData.id,
      personalScore: scoreData ? scoreData.score : null,
      scoreWeights: scoreData ? scoreData.weights : null,
      tier: scoreData ? scoreData.tier : null,
      totalVotes: scoreData ? scoreData.totalVotes : 0
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

    // Calculate personal score (exclude itself from calculation)
    const scoreData = calculatePersonalScore(movie, req.session.userId, movie.movie_id);

    res.json({
      ...movie,
      personalScore: scoreData ? scoreData.score : null,
      scoreWeights: scoreData ? scoreData.weights : null,
      tier: scoreData ? scoreData.tier : null
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

    // Calculate personal score (exclude itself from calculation to prevent circular dependency)
    const scoreData = calculatePersonalScore(movieData, req.session.userId, movieData.id);

    res.json({
      personalScore: scoreData ? scoreData.score : null,
      scoreWeights: scoreData ? scoreData.weights : null,
      tier: scoreData ? scoreData.tier : null,
      totalVotes: scoreData ? scoreData.totalVotes : 0,
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
