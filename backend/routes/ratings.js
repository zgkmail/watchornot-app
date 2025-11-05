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
 * Get user tier based on total votes
 * Tier boundaries:
 * - Newcomer: < 5 votes
 * - Explorer: 5-14 votes
 * - Enthusiast: 15-29 votes
 * - Expert: 30-49 votes
 * - Master: 50+ votes
 */
function getUserTier(totalVotes) {
  if (totalVotes >= 50) return 'Master';
  if (totalVotes >= 30) return 'Expert';
  if (totalVotes >= 15) return 'Enthusiast';
  if (totalVotes >= 5) return 'Explorer';
  return 'Newcomer';
}

/**
 * Calculate recommendation badge for a movie
 * Formula: Adjusted Score = IMDb Score + Genre Adjustment + Director Adjustment + Cast Adjustment
 * Badge levels: Perfect Match, Great Pick, Worth a Try, Mixed Feelings, Not Your Style
 * Requires at least 5 rated movies to show badge
 * @param {Object} movie - The movie to calculate badge for
 * @param {string} userId - The user ID
 * @param {string|null} excludeMovieId - Optional movie ID to exclude from calculations (prevents circular dependency)
 */
function calculateRecommendationBadge(movie, userId, excludeMovieId = null) {
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

  // Require at least 5 rated movies before showing badge
  if (ratedMovies.length < 5) {
    return null;
  }

  const tier = getUserTier(ratedMovies.length);

  // Start with IMDb score as base
  let adjustedScore = imdbScore;
  let genreAdjustment = 0;
  let directorAdjustment = 0;
  let castAdjustment = 0;

  // Get genre preferences for the user
  const genrePrefs = getUserGenrePreferences(userId);

  // Genre Adjustment (-3 to +3 points)
  const movieGenres = getMovieGenres(userId, movie.id || movie.movie_id);
  let genresToCheck = movieGenres;
  if (genresToCheck.length === 0 && movie.genre) {
    genresToCheck = movie.genre.split(',').map(g => g.trim()).filter(g => g);
  }

  if (genresToCheck.length > 0) {
    let genreScores = [];

    genresToCheck.forEach(genre => {
      const genrePref = genrePrefs.find(g => g.genre === genre);

      if (genrePref) {
        let thumbsUp = genrePref.thumbs_up;
        let thumbsDown = genrePref.thumbs_down;

        // Exclude current movie from genre counts to prevent circular dependency
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

        const total = thumbsUp + thumbsDown;
        if (total > 0) {
          const positiveRatio = thumbsUp / total;

          // Convert ratio to adjustment score (-3 to +3)
          let genreScore = 0;
          if (positiveRatio >= 0.7) {
            genreScore = 2 + (positiveRatio - 0.7) * 3.33; // 2 to 3
          } else if (positiveRatio >= 0.5) {
            genreScore = (positiveRatio - 0.5) * 10; // 0 to 2
          } else if (positiveRatio >= 0.3) {
            genreScore = (positiveRatio - 0.5) * 5; // -1 to 0
          } else {
            genreScore = -1 + (positiveRatio - 0.3) * 3.33; // -2 to -1
            genreScore = Math.max(-3, genreScore - (0.3 - positiveRatio) * 3.33); // Can go to -3
          }

          genreScores.push(genreScore);
        }
      }
    });

    // Average genre scores
    if (genreScores.length > 0) {
      genreAdjustment = genreScores.reduce((a, b) => a + b, 0) / genreScores.length;
      genreAdjustment = Math.max(-3, Math.min(3, genreAdjustment));
    }
  }

  // TODO: Director Adjustment (-1 to +2) - requires director data in DB
  // TODO: Cast Adjustment (-1 to +2) - requires cast data in DB

  // Calculate final adjusted score
  adjustedScore += genreAdjustment + directorAdjustment + castAdjustment;

  // Determine badge level based on adjusted score
  let badge, description, emoji;
  if (adjustedScore >= 8.0) {
    badge = 'perfect-match';
    emoji = '🎯';
    description = 'This is right up your alley!';
  } else if (adjustedScore >= 6.5) {
    badge = 'great-pick';
    emoji = '⭐';
    description = "You'll probably enjoy this";
  } else if (adjustedScore >= 5.0) {
    badge = 'worth-a-try';
    emoji = '👍';
    description = 'Give it a shot';
  } else if (adjustedScore >= 3.5) {
    badge = 'mixed-feelings';
    emoji = '🤷';
    description = 'Could go either way';
  } else {
    badge = 'not-your-style';
    emoji = '❌';
    description = 'Probably skip this';
  }

  return {
    badge,
    emoji,
    description,
    adjustedScore: Math.round(adjustedScore * 10) / 10,
    adjustments: {
      genre: Math.round(genreAdjustment * 10) / 10,
      director: directorAdjustment,
      cast: castAdjustment
    },
    tier,
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

    // Calculate recommendation badges for each movie (exclude itself from calculation)
    const ratingsWithBadges = ratings.map(movie => {
      const badgeData = calculateRecommendationBadge(movie, req.session.userId, movie.movie_id);
      return {
        ...movie,
        badge: badgeData ? badgeData.badge : null,
        badgeEmoji: badgeData ? badgeData.emoji : null,
        badgeDescription: badgeData ? badgeData.description : null,
        tier: badgeData ? badgeData.tier : null
      };
    });

    res.json({
      ratings: ratingsWithBadges,
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

    // Calculate recommendation badge for this movie (exclude itself from calculation)
    const badgeData = calculateRecommendationBadge(movieData, req.session.userId, movieData.id);

    res.json({
      success: true,
      movieId: movieData.id,
      badge: badgeData ? badgeData.badge : null,
      badgeEmoji: badgeData ? badgeData.emoji : null,
      badgeDescription: badgeData ? badgeData.description : null,
      tier: badgeData ? badgeData.tier : null,
      totalVotes: badgeData ? badgeData.totalVotes : 0
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

    // Calculate recommendation badge (exclude itself from calculation)
    const badgeData = calculateRecommendationBadge(movie, req.session.userId, movie.movie_id);

    res.json({
      ...movie,
      badge: badgeData ? badgeData.badge : null,
      badgeEmoji: badgeData ? badgeData.emoji : null,
      badgeDescription: badgeData ? badgeData.description : null,
      tier: badgeData ? badgeData.tier : null
    });
  } catch (error) {
    console.error('Get movie rating error:', error);
    res.status(500).json({ error: 'Failed to get movie rating' });
  }
});

/**
 * Calculate recommendation badge for a movie (without saving)
 * POST /api/ratings/calculate-badge
 */
router.post('/calculate-badge', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const movieData = req.body;

    // Calculate recommendation badge (exclude itself from calculation to prevent circular dependency)
    const badgeData = calculateRecommendationBadge(movieData, req.session.userId, movieData.id);

    res.json({
      badge: badgeData ? badgeData.badge : null,
      badgeEmoji: badgeData ? badgeData.emoji : null,
      badgeDescription: badgeData ? badgeData.description : null,
      tier: badgeData ? badgeData.tier : null,
      totalVotes: badgeData ? badgeData.totalVotes : 0,
      imdbRating: movieData.imdbRating || movieData.imdb_rating
    });
  } catch (error) {
    console.error('Calculate badge error:', error);
    res.status(500).json({ error: 'Failed to calculate badge' });
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
