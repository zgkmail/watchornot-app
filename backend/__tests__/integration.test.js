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
  mockTMDBMovieDetailsResponse
} = require('../testHelpers');

// Mock axios for TMDB calls
jest.mock('axios');

// Shared test database
let mockTestDb = null;

// Mock database module
jest.mock('../db/database', () => {
  return {
    get db() {
      return mockTestDb;
    },
    saveMovieRating: (userId, movieData) => {
      if (!mockTestDb) throw new Error('Test database not initialized');

      const now = Date.now();
      const stmt = mockTestDb.prepare(`
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
        mockTestDb.prepare('DELETE FROM movie_genre_mappings WHERE user_id = ? AND movie_id = ?')
          .run(userId, movieData.id);
        const genres = movieData.genre.split(',').map(g => g.trim()).filter(g => g);
        const insertGenreStmt = mockTestDb.prepare('INSERT INTO movie_genre_mappings (user_id, movie_id, genre) VALUES (?, ?, ?)');
        genres.forEach(genre => insertGenreStmt.run(userId, movieData.id, genre));
      }
    },
    getUserMovieRatings: (userId) => {
      if (!mockTestDb) return [];
      return mockTestDb.prepare('SELECT * FROM movie_ratings WHERE user_id = ? ORDER BY timestamp DESC').all(userId);
    },
    getMovieRating: (userId, movieId) => {
      if (!mockTestDb) return null;
      return mockTestDb.prepare('SELECT * FROM movie_ratings WHERE user_id = ? AND movie_id = ?').get(userId, movieId);
    },
    deleteMovieRating: (userId, movieId) => {
      if (!mockTestDb) return;
      mockTestDb.prepare('DELETE FROM movie_ratings WHERE user_id = ? AND movie_id = ?').run(userId, movieId);
      mockTestDb.prepare('DELETE FROM movie_genre_mappings WHERE user_id = ? AND movie_id = ?').run(userId, movieId);
    },
    getUserGenrePreferences: (userId) => {
      if (!mockTestDb) return [];
      return mockTestDb.prepare('SELECT * FROM user_genre_preferences WHERE user_id = ?').all(userId);
    },
    getUserDirectorPreferences: (userId) => {
      if (!mockTestDb) return [];
      return mockTestDb.prepare('SELECT * FROM user_director_preferences WHERE user_id = ?').all(userId);
    },
    getUserCastPreferences: (userId) => {
      if (!mockTestDb) return [];
      return mockTestDb.prepare('SELECT * FROM user_cast_preferences WHERE user_id = ?').all(userId);
    },
    getMovieGenres: (userId, movieId) => {
      if (!mockTestDb) return [];
      return mockTestDb.prepare('SELECT genre FROM movie_genre_mappings WHERE user_id = ? AND movie_id = ?')
        .all(userId, movieId).map(row => row.genre);
    },
    saveMovieGenreMappings: () => {},
    deleteMovieGenreMappings: () => {},
    recalculateGenrePreferences: () => {},
    recalculateDirectorPreferences: () => {},
    recalculateCastPreferences: () => {}
  };
});

// Create Express app for testing
function createTestApp(userId) {
  const app = express();
  app.use(express.json());

  // Mock session middleware
  app.use((req, res, next) => {
    req.session = {
      userId: userId,
      cookie: {}
    };
    next();
  });

  app.use('/api/tmdb', tmdbRouter);
  app.use('/api/ratings', ratingsRouter);

  return app;
}

describe('Integration Tests - Complete Movie Rating Workflow', () => {
  let app;
  let userId;

  beforeAll(() => {
    process.env.TMDB_API_KEY = 'test-api-key';
  });

  beforeEach(() => {
    mockTestDb = createTestDatabase(true);
    const user = createTestUser(mockTestDb);
    userId = user.id;
    app = createTestApp(userId);
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (mockTestDb) {
      mockTestDb.close();
      mockTestDb = null;
    }
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
        .query({ query: 'Inception', year: '2010' });

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.results).toBeDefined();
      expect(searchResponse.body.results.length).toBeGreaterThan(0);

      // Step 2: Rate the movie
      const rateMovie = {
        id: searchMovie.id,
        title: searchMovie.title,
        genre: searchMovie.genre,
        year: '2010',
        rating: 'up',
        imdbRating: searchMovie.imdbRating,
        director: searchMovie.director,
        cast: searchMovie.cast
      };

      const rateResponse = await request(app)
        .post('/api/ratings')
        .send(rateMovie);

      expect(rateResponse.status).toBe(200);
      expect(rateResponse.body.success).toBe(true);
      expect(rateResponse.body.movieId).toBe(searchMovie.id);

      // Step 3: Retrieve the rating
      const retrieveResponse = await request(app)
        .get('/api/ratings');

      expect(retrieveResponse.status).toBe(200);
      expect(retrieveResponse.body.ratings).toHaveLength(1);
      expect(retrieveResponse.body.ratings[0].movie_id).toBe(searchMovie.id);

      // Step 4: Delete the rating
      const deleteResponse = await request(app)
        .delete(`/api/ratings/${searchMovie.id}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      // Step 5: Verify deletion
      const verifyResponse = await request(app)
        .get('/api/ratings');

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.ratings).toHaveLength(0);
    });

    test('should calculate badge after rating 5+ movies', async () => {
      // Rate 5 movies
      const movies = [];
      for (let i = 1; i <= 5; i++) {
        const movie = createTestMovie({
          id: `movie-${i}`,
          title: `Test Movie ${i}`,
          genre: 'Action, Drama',
          rating: 'up',
          imdbRating: 8.0 + (i * 0.1)
        });
        movies.push(movie);

        const rateResponse = await request(app)
          .post('/api/ratings')
          .send(movie);

        expect(rateResponse.status).toBe(200);

        // First 4 movies should not have badges
        if (i < 5) {
          expect(rateResponse.body.badge).toBeNull();
        } else {
          // 5th movie should have badge
          expect(rateResponse.body.badge).toBeDefined();
          expect(rateResponse.body.tier).toBe('Explorer');
        }
      }

      // Verify all ratings have badges when retrieved
      const retrieveResponse = await request(app)
        .get('/api/ratings');

      expect(retrieveResponse.status).toBe(200);
      expect(retrieveResponse.body.ratings).toHaveLength(5);
      retrieveResponse.body.ratings.forEach(rating => {
        expect(rating).toHaveProperty('badge');
        expect(rating).toHaveProperty('tier');
      });
    });

    test('should handle search -> details -> rate workflow', async () => {
      const movie = createTestMovie({
        id: '550',
        title: 'Fight Club',
        genre: 'Drama, Thriller',
        director: 'David Fincher',
        cast: 'Brad Pitt, Edward Norton',
        imdbRating: 8.8
      });

      // Search
      axios.get.mockResolvedValueOnce({ data: mockTMDBSearchResponse(movie) });

      const searchResponse = await request(app)
        .get('/api/tmdb/search')
        .query({ query: 'Fight Club' });

      expect(searchResponse.status).toBe(200);

      // Get details
      axios.get.mockResolvedValueOnce({ data: mockTMDBMovieDetailsResponse(movie) });

      const detailsResponse = await request(app)
        .get('/api/tmdb/movie/550');

      expect(detailsResponse.status).toBe(200);
      expect(detailsResponse.body.id).toBe(550);

      // Rate
      const rateResponse = await request(app)
        .post('/api/ratings')
        .send({
          id: movie.id,
          title: movie.title,
          genre: movie.genre,
          year: movie.year,
          rating: 'up',
          imdbRating: movie.imdbRating,
          director: movie.director,
          cast: movie.cast
        });

      expect(rateResponse.status).toBe(200);
      expect(rateResponse.body.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle duplicate ratings', async () => {
      const movie = createTestMovie({
        id: '155',
        title: 'The Dark Knight',
        rating: 'up',
        imdbRating: 9.0
      });

      // Rate first time
      const firstResponse = await request(app)
        .post('/api/ratings')
        .send(movie);

      expect(firstResponse.status).toBe(200);

      // Rate again with different rating
      movie.rating = 'down';
      const secondResponse = await request(app)
        .post('/api/ratings')
        .send(movie);

      expect(secondResponse.status).toBe(200);

      // Verify only one rating exists (updated)
      const retrieveResponse = await request(app)
        .get('/api/ratings');

      expect(retrieveResponse.status).toBe(200);
      expect(retrieveResponse.body.ratings).toHaveLength(1);
      expect(retrieveResponse.body.ratings[0].rating).toBe('down');
    });

    test('should handle invalid movie data', async () => {
      const invalidMovie = { title: 'No ID Movie' };

      const response = await request(app)
        .post('/api/ratings')
        .send(invalidMovie);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should handle non-existent movie deletion', async () => {
      const response = await request(app)
        .delete('/api/ratings/nonexistent-id');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
