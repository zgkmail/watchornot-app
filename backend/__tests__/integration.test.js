/**
 * Integration tests for the complete movie rating workflow
 * Tests the full flow: search -> rate -> retrieve -> calculate badge -> delete
 */

const request = require('supertest');
const express = require('express');
const session = require('express-session');
const axios = require('axios');
const Database = require('better-sqlite3');
const ratingsRouter = require('../routes/ratings');
const tmdbRouter = require('../routes/tmdb');
const {
  createTestDatabase,
  cleanupTestDatabase,
  createTestMovie,
  createTestUser,
  mockTMDBSearchResponse,
  mockTMDBMovieDetailsResponse,
  TEST_DB_PATH
} = require('../testHelpers');

// Mock axios for TMDB calls
jest.mock('axios');

// Mock database module
jest.mock('../db/database', () => {
  const testDb = require('better-sqlite3')(require('../testHelpers').TEST_DB_PATH);

  return {
    db: testDb,
    saveMovieRating: (userId, movieData) => {
      const now = Date.now();
      const stmt = testDb.prepare(`
        INSERT INTO movie_ratings (
          user_id, movie_id, title, genre, year, imdb_rating,
          rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, movie_id)
        DO UPDATE SET rating = ?, timestamp = ?
      `);
      stmt.run(
        userId, movieData.id, movieData.title, movieData.genre, movieData.year,
        movieData.imdbRating, movieData.rottenTomatoes, movieData.metacritic,
        movieData.poster, movieData.director, movieData.cast, movieData.rating,
        movieData.timestamp || now, movieData.rating, now
      );

      // Save genre mappings
      if (movieData.genre) {
        testDb.prepare('DELETE FROM movie_genre_mappings WHERE user_id = ? AND movie_id = ?')
          .run(userId, movieData.id);
        const genres = movieData.genre.split(',').map(g => g.trim()).filter(g => g);
        const insertGenreStmt = testDb.prepare('INSERT INTO movie_genre_mappings (user_id, movie_id, genre) VALUES (?, ?, ?)');
        genres.forEach(genre => insertGenreStmt.run(userId, movieData.id, genre));
      }
    },
    getUserMovieRatings: (userId) => {
      return testDb.prepare('SELECT * FROM movie_ratings WHERE user_id = ? ORDER BY timestamp DESC').all(userId);
    },
    getMovieRating: (userId, movieId) => {
      return testDb.prepare('SELECT * FROM movie_ratings WHERE user_id = ? AND movie_id = ?').get(userId, movieId);
    },
    deleteMovieRating: (userId, movieId) => {
      testDb.prepare('DELETE FROM movie_ratings WHERE user_id = ? AND movie_id = ?').run(userId, movieId);
      testDb.prepare('DELETE FROM movie_genre_mappings WHERE user_id = ? AND movie_id = ?').run(userId, movieId);
    },
    getUserGenrePreferences: (userId) => {
      return testDb.prepare('SELECT * FROM user_genre_preferences WHERE user_id = ?').all(userId);
    },
    getUserDirectorPreferences: (userId) => {
      return testDb.prepare('SELECT * FROM user_director_preferences WHERE user_id = ?').all(userId);
    },
    getUserCastPreferences: (userId) => {
      return testDb.prepare('SELECT * FROM user_cast_preferences WHERE user_id = ?').all(userId);
    },
    getMovieGenres: (userId, movieId) => {
      return testDb.prepare('SELECT genre FROM movie_genre_mappings WHERE user_id = ? AND movie_id = ?')
        .all(userId, movieId).map(row => row.genre);
    },
    saveMovieGenreMappings: () => {},
    deleteMovieGenreMappings: () => {}
  };
});

// Create Express app for testing
function createTestApp(userId) {
  const app = express();
  app.use(express.json());
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));

  // Mock session middleware
  app.use((req, res, next) => {
    req.session.userId = userId;
    next();
  });

  app.use('/api/tmdb', tmdbRouter);
  app.use('/api/ratings', ratingsRouter);

  return app;
}

describe('Integration Tests - Complete Movie Rating Workflow', () => {
  let app;
  let db;
  let userId;

  beforeAll(() => {
    process.env.TMDB_API_KEY = 'test-api-key';
  });

  beforeEach(() => {
    db = createTestDatabase();
    const user = createTestUser(db);
    userId = user.id;
    app = createTestApp(userId);
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (db) db.close();
    cleanupTestDatabase();
  });

  afterAll(() => {
    delete process.env.TMDB_API_KEY;
  });

  describe('Complete Workflow: Search -> Rate -> Retrieve -> Badge -> Delete', () => {
    test('should complete full workflow for a single movie', async () => {
      // Step 1: Search for a movie
      const searchMovie = createTestMovie({
        id: '27205',
        title: 'Inception',
        genre: 'Action, Science Fiction, Thriller',
        director: 'Christopher Nolan',
        cast: 'Leonardo DiCaprio, Tom Hardy, Ellen Page',
        imdbRating: 8.8
      });

      axios.get.mockResolvedValueOnce({ data: mockTMDBSearchResponse(searchMovie) });

      const searchResponse = await request(app)
        .get('/api/tmdb/search')
        .query({ query: 'Inception' });

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.results).toHaveLength(1);
      expect(searchResponse.body.results[0].title).toBe('Inception');

      // Step 2: Get movie details
      axios.get.mockResolvedValueOnce({ data: mockTMDBMovieDetailsResponse(searchMovie) });

      const detailsResponse = await request(app)
        .get('/api/tmdb/movie/27205');

      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.id).toBe(27205);
      expect(detailsResponse.body.credits).toBeDefined();

      // Step 3: Rate the movie
      const rateResponse = await request(app)
        .post('/api/ratings')
        .send({
          id: '27205',
          title: 'Inception',
          genre: 'Action, Science Fiction, Thriller',
          year: '2010',
          imdbRating: 8.8,
          director: 'Christopher Nolan',
          cast: 'Leonardo DiCaprio, Tom Hardy, Ellen Page',
          rating: 'up'
        });

      expect(rateResponse.status).toBe(200);
      expect(rateResponse.body.success).toBe(true);

      // Step 4: Retrieve the rating
      const getRatingResponse = await request(app)
        .get('/api/ratings/27205');

      expect(getRatingResponse.status).toBe(200);
      expect(getRatingResponse.body.movie_id).toBe('27205');
      expect(getRatingResponse.body.rating).toBe('up');

      // Step 5: Get all ratings
      const allRatingsResponse = await request(app)
        .get('/api/ratings');

      expect(allRatingsResponse.status).toBe(200);
      expect(allRatingsResponse.body.ratings).toHaveLength(1);
      expect(allRatingsResponse.body.count).toBe(1);

      // Step 6: Delete the rating
      const deleteResponse = await request(app)
        .delete('/api/ratings/27205');

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      // Step 7: Verify deletion
      const verifyDeleteResponse = await request(app)
        .get('/api/ratings/27205');

      expect(verifyDeleteResponse.status).toBe(404);
    });

    test('should handle rating multiple movies and getting recommendations', async () => {
      // Rate 5 action movies with thumbs up
      const actionMovies = [
        { id: '1', title: 'Movie 1', genre: 'Action', rating: 'up', imdbRating: 8.5 },
        { id: '2', title: 'Movie 2', genre: 'Action', rating: 'up', imdbRating: 8.0 },
        { id: '3', title: 'Movie 3', genre: 'Action', rating: 'up', imdbRating: 7.5 },
        { id: '4', title: 'Movie 4', genre: 'Action', rating: 'up', imdbRating: 8.2 },
        { id: '5', title: 'Movie 5', genre: 'Action', rating: 'up', imdbRating: 7.8 }
      ];

      // Rate all movies
      for (const movie of actionMovies) {
        const response = await request(app)
          .post('/api/ratings')
          .send(movie);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }

      // Verify we have 5 ratings
      const allRatingsResponse = await request(app)
        .get('/api/ratings');

      expect(allRatingsResponse.status).toBe(200);
      expect(allRatingsResponse.body.count).toBe(5);

      // Now calculate badge for a new action movie
      // Should get a positive recommendation since we liked all action movies
      const newActionMovie = {
        id: 'new-action',
        title: 'New Action Movie',
        genre: 'Action',
        imdbRating: 8.0
      };

      const badgeResponse = await request(app)
        .post('/api/ratings/calculate-badge')
        .send(newActionMovie);

      expect(badgeResponse.status).toBe(200);
      expect(badgeResponse.body.badge).toBeDefined();
      expect(badgeResponse.body.tier).toBe('Explorer'); // 5 votes = Explorer tier
      expect(badgeResponse.body.totalVotes).toBe(5);
    });

    test('should update rating when voting on same movie twice', async () => {
      const movie = {
        id: '550',
        title: 'Fight Club',
        genre: 'Drama, Thriller',
        rating: 'up',
        imdbRating: 8.8
      };

      // Rate with thumbs up
      const firstResponse = await request(app)
        .post('/api/ratings')
        .send(movie);

      expect(firstResponse.status).toBe(200);
      expect(firstResponse.body.success).toBe(true);

      // Verify rating is 'up'
      let getRatingResponse = await request(app)
        .get('/api/ratings/550');

      expect(getRatingResponse.body.rating).toBe('up');

      // Change rating to thumbs down
      const secondResponse = await request(app)
        .post('/api/ratings')
        .send({ ...movie, rating: 'down' });

      expect(secondResponse.status).toBe(200);
      expect(secondResponse.body.success).toBe(true);

      // Verify rating is now 'down'
      getRatingResponse = await request(app)
        .get('/api/ratings/550');

      expect(getRatingResponse.body.rating).toBe('down');

      // Verify we still only have 1 movie rated
      const allRatingsResponse = await request(app)
        .get('/api/ratings');

      expect(allRatingsResponse.body.count).toBe(1);
    });

    test('should progress through tiers as user rates more movies', async () => {
      const tierTests = [
        { count: 5, expectedTier: 'Explorer' },
        { count: 15, expectedTier: 'Enthusiast' },
        { count: 30, expectedTier: 'Expert' },
        { count: 50, expectedTier: 'Master' }
      ];

      for (const { count, expectedTier } of tierTests) {
        // Clean up previous ratings
        db.prepare('DELETE FROM movie_ratings WHERE user_id = ?').run(userId);

        // Rate movies
        for (let i = 0; i < count; i++) {
          await request(app)
            .post('/api/ratings')
            .send({
              id: `movie-${i}`,
              title: `Movie ${i}`,
              genre: 'Action',
              rating: 'up',
              imdbRating: 8.0
            });
        }

        // Calculate badge for new movie
        const badgeResponse = await request(app)
          .post('/api/ratings/calculate-badge')
          .send({
            id: 'test-movie',
            title: 'Test Movie',
            genre: 'Action',
            imdbRating: 8.0
          });

        expect(badgeResponse.status).toBe(200);
        expect(badgeResponse.body.tier).toBe(expectedTier);
        expect(badgeResponse.body.totalVotes).toBe(count);
      }
    });

    test('should handle mixed genre preferences in recommendations', async () => {
      const movies = [
        // Like Action
        { id: '1', title: 'Action 1', genre: 'Action', rating: 'up', imdbRating: 8.5 },
        { id: '2', title: 'Action 2', genre: 'Action', rating: 'up', imdbRating: 8.0 },
        { id: '3', title: 'Action 3', genre: 'Action', rating: 'up', imdbRating: 7.8 },
        // Dislike Drama
        { id: '4', title: 'Drama 1', genre: 'Drama', rating: 'down', imdbRating: 7.0 },
        { id: '5', title: 'Drama 2', genre: 'Drama', rating: 'down', imdbRating: 6.5 }
      ];

      // Rate all movies
      for (const movie of movies) {
        await request(app)
          .post('/api/ratings')
          .send(movie);
      }

      // Test recommendation for action movie (should be positive)
      const actionBadgeResponse = await request(app)
        .post('/api/ratings/calculate-badge')
        .send({
          id: 'new-action',
          title: 'New Action',
          genre: 'Action',
          imdbRating: 8.0
        });

      expect(actionBadgeResponse.status).toBe(200);
      expect(actionBadgeResponse.body.badge).toBeDefined();

      // Test recommendation for drama movie (should be negative or mixed)
      const dramaBadgeResponse = await request(app)
        .post('/api/ratings/calculate-badge')
        .send({
          id: 'new-drama',
          title: 'New Drama',
          genre: 'Drama',
          imdbRating: 8.0
        });

      expect(dramaBadgeResponse.status).toBe(200);
      expect(dramaBadgeResponse.body.badge).toBeDefined();

      // Action should have higher adjusted score than Drama
      expect(actionBadgeResponse.body.adjustedScore).toBeGreaterThan(
        dramaBadgeResponse.body.adjustedScore
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle TMDB API failures gracefully', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      const searchResponse = await request(app)
        .get('/api/tmdb/search')
        .query({ query: 'Inception' });

      expect(searchResponse.status).toBe(500);
      expect(searchResponse.body.error).toBeDefined();
    });

    test('should handle invalid movie data', async () => {
      const response = await request(app)
        .post('/api/ratings')
        .send({ invalid: 'data' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should handle non-existent movie retrieval', async () => {
      const response = await request(app)
        .get('/api/ratings/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Movie not found');
    });

    test('should handle deletion of non-existent movie', async () => {
      // This should succeed even if movie doesn't exist (idempotent)
      const response = await request(app)
        .delete('/api/ratings/nonexistent-id');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
