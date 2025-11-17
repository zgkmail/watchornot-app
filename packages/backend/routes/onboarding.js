const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { saveMovieRating, getUserMovieRatings } = require('../db/database');

// Load curated movie pool
const MOVIES_FILE = path.join(__dirname, '../data/onboarding-movies.json');
let moviePool = [];

try {
  const data = fs.readFileSync(MOVIES_FILE, 'utf8');
  const parsed = JSON.parse(data);
  moviePool = parsed.movies;
  console.log(`✓ Loaded ${moviePool.length} onboarding movies`);
} catch (error) {
  console.error('❌ Failed to load onboarding movies:', error.message);
  moviePool = [];
}

/**
 * Get 10 random curated movies for onboarding
 * GET /api/onboarding/movies
 */
router.get('/movies', (req, res) => {
  console.log('\n========== ONBOARDING MOVIES REQUEST ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Session ID:', req.session.id);

  try {
    if (moviePool.length === 0) {
      console.error('❌ Movie pool is empty');
      return res.status(500).json({
        error: 'Onboarding movies not available',
        debug: 'Movie pool failed to load'
      });
    }

    // Shuffle and select 10 movies (to account for skips, user needs to vote on at least 5)
    const shuffled = [...moviePool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 10);

    console.log('✅ Selected 10 movies for onboarding:');
    selected.forEach((movie, i) => {
      console.log(`   ${i + 1}. ${movie.title} (${movie.year}) - ${movie.genres.join(', ')}`);
    });
    console.log('========================================\n');

    res.json({
      movies: selected.map(movie => ({
        id: movie.tmdbId.toString(),
        title: movie.title,
        year: movie.year,
        genres: movie.genres,
        imdbRating: movie.imdbRating,
        director: movie.director,
        cast: movie.cast.join(', '),
        poster: movie.posterPath
      }))
    });
  } catch (error) {
    console.error('❌ Error selecting onboarding movies:', error.message);
    return res.status(500).json({
      error: 'Failed to get onboarding movies',
      debug: {
        message: error.message
      }
    });
  }
});

/**
 * Complete onboarding by batch saving votes
 * POST /api/onboarding/complete
 * Body: { votes: [{ movieId, title, year, genres, imdbRating, director, cast, vote, poster }] }
 */
router.post('/complete', async (req, res) => {
  const startTime = Date.now();
  console.log('\n========== ONBOARDING COMPLETE REQUEST ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Session ID:', req.session.id);
  console.log('User ID:', req.session.userId);

  try {
    const { votes } = req.body;

    // Validate request
    if (!votes || !Array.isArray(votes)) {
      console.error('❌ Invalid request: votes must be an array');
      return res.status(400).json({
        error: 'Invalid request',
        debug: 'votes must be an array'
      });
    }

    if (votes.length === 0) {
      console.error('❌ Invalid request: votes array is empty');
      return res.status(400).json({
        error: 'Invalid request',
        debug: 'votes array cannot be empty'
      });
    }

    // Check authentication
    if (!req.session.userId) {
      console.error('❌ User not authenticated');
      return res.status(401).json({
        error: 'Not authenticated',
        debug: 'Session does not contain userId'
      });
    }

    console.log(`✓ Processing ${votes.length} votes for user ${req.session.userId}`);

    // Validate each vote
    for (const vote of votes) {
      if (!vote.movieId || !vote.title || !vote.vote) {
        console.error('❌ Invalid vote data:', vote);
        return res.status(400).json({
          error: 'Invalid vote data',
          debug: 'Each vote must have movieId, title, and vote (up/down/skip)'
        });
      }

      if (vote.vote !== 'up' && vote.vote !== 'down' && vote.vote !== 'skip') {
        console.error('❌ Invalid vote value:', vote.vote);
        return res.status(400).json({
          error: 'Invalid vote value',
          debug: 'vote must be "up", "down", or "skip"'
        });
      }
    }

    console.log('✓ All votes validated');

    // Save each vote (skip movies that were marked as "skip")
    let savedCount = 0;
    let skippedCount = 0;
    for (const vote of votes) {
      try {
        // Don't save movies that were skipped (haven't seen)
        if (vote.vote === 'skip') {
          skippedCount++;
          console.log(`   → Skipped: ${vote.title} (haven't seen)`);
          continue;
        }

        const movieData = {
          id: vote.movieId,
          title: vote.title,
          genre: Array.isArray(vote.genres) ? vote.genres.join(', ') : vote.genres || '',
          year: vote.year?.toString() || '',
          imdbRating: vote.imdbRating || null,
          rottenTomatoes: vote.rottenTomatoes || null,
          metacritic: vote.metacritic || null,
          poster: vote.poster || '',
          director: vote.director || '',
          cast: vote.cast || '',
          rating: vote.vote,
          timestamp: Date.now()
        };

        saveMovieRating(req.session.userId, movieData);
        savedCount++;
        console.log(`   ✓ Saved vote ${savedCount}: ${vote.title} (${vote.vote})`);
      } catch (error) {
        console.error(`   ❌ Failed to save vote for ${vote.title}:`, error.message);
        // Continue with other votes
      }
    }

    console.log(`✅ Successfully saved ${savedCount}/${votes.length} votes (${skippedCount} skipped)`);

    // Get updated ratings to calculate tier
    const allRatings = getUserMovieRatings(req.session.userId);
    const totalVotes = allRatings.length;

    // Calculate tier
    let tier = 'Newcomer';
    if (totalVotes >= 50) tier = 'Master';
    else if (totalVotes >= 30) tier = 'Expert';
    else if (totalVotes >= 15) tier = 'Enthusiast';
    else if (totalVotes >= 5) tier = 'Explorer';

    // Calculate genre breakdown
    const genreCount = {};
    votes.forEach(vote => {
      if (vote.vote === 'up') {
        const genres = Array.isArray(vote.genres) ? vote.genres : [];
        genres.forEach(genre => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
    });

    // Sort genres by count
    const topGenres = Object.entries(genreCount)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const duration = Date.now() - startTime;
    console.log('📊 Onboarding Results:');
    console.log(`   Total votes: ${totalVotes}`);
    console.log(`   Tier: ${tier}`);
    console.log(`   Top genres: ${topGenres.map(g => `${g.genre} (${g.count})`).join(', ')}`);
    console.log(`   Processing time: ${duration}ms`);
    console.log('========================================\n');

    res.json({
      success: true,
      totalVotes,
      tier,
      topGenres,
      savedVotes: savedCount,
      processingTime: duration
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('\n❌❌❌ ONBOARDING COMPLETE ERROR ❌❌❌');
    console.error('Duration:', duration, 'ms');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);

    return res.status(500).json({
      error: 'Failed to complete onboarding',
      debug: {
        message: error.message,
        type: error.constructor.name
      }
    });
  }
});

/**
 * Get user's onboarding status and stats
 * GET /api/onboarding/status
 */
router.get('/status', (req, res) => {
  try {
    // Check authentication
    if (!req.session.userId) {
      return res.status(401).json({
        error: 'Not authenticated'
      });
    }

    // Get all user ratings
    const allRatings = getUserMovieRatings(req.session.userId);

    // Calculate stats
    const upvotes = allRatings.filter(r => r.rating === 'up').length;
    const downvotes = allRatings.filter(r => r.rating === 'down').length;
    const skips = 0; // Skips are not saved to the database
    const totalVotes = allRatings.length;

    // Determine if onboarding is complete (at least 5 rated movies)
    const hasCompletedOnboarding = totalVotes >= 5;

    res.json({
      hasCompletedOnboarding,
      totalVotes,
      upvotes,
      downvotes,
      skips
    });
  } catch (error) {
    console.error('Get onboarding status error:', error);
    res.status(500).json({
      error: 'Failed to get onboarding status'
    });
  }
});

module.exports = router;
