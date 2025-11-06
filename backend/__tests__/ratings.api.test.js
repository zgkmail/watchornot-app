const request = require('supertest');
const express = require('express');
const session = require('express-session');
const ratingsRouter = require('../routes/ratings');
const Database = require('better-sqlite3');
const {
  createTestDatabase,
  cleanupTestDatabase,
  createTestMovie,
  createTestUser,
  seedMovies,
  TEST_DB_PATH
} = require('../testHelpers');

// Mock the database module
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
        DO UPDATE SET
          rating = ?,
          timestamp = ?
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

        genres.forEach(genre => {
          insertGenreStmt.run(userId, movieData.id, genre);
        });
      }
    },

    getUserMovieRatings: (userId) => {
      const stmt = testDb.prepare('SELECT * FROM movie_ratings WHERE user_id = ? ORDER BY timestamp DESC');
      return stmt.all(userId);
    },

    getMovieRating: (userId, movieId) => {
      const stmt = testDb.prepare('SELECT * FROM movie_ratings WHERE user_id = ? AND movie_id = ?');
      return stmt.get(userId, movieId);
    },

    deleteMovieRating: (userId, movieId) => {
      testDb.prepare('DELETE FROM movie_ratings WHERE user_id = ? AND movie_id = ?').run(userId, movieId);
      testDb.prepare('DELETE FROM movie_genre_mappings WHERE user_id = ? AND movie_id = ?').run(userId, movieId);
    },

    getUserGenrePreferences: (userId) => {
      const stmt = testDb.prepare('SELECT * FROM user_genre_preferences WHERE user_id = ? ORDER BY (thumbs_up - thumbs_down) DESC');
      return stmt.all(userId);
    },

    getUserDirectorPreferences: (userId) => {
      const stmt = testDb.prepare('SELECT * FROM user_director_preferences WHERE user_id = ? ORDER BY (thumbs_up - thumbs_down) DESC');
      return stmt.all(userId);
    },

    getUserCastPreferences: (userId) => {
      const stmt = testDb.prepare('SELECT * FROM user_cast_preferences WHERE user_id = ? ORDER BY (thumbs_up - thumbs_down) DESC');
      return stmt.all(userId);
    },

    getMovieGenres: (userId, movieId) => {
      const stmt = testDb.prepare('SELECT genre FROM movie_genre_mappings WHERE user_id = ? AND movie_id = ?');
      return stmt.all(userId, movieId).map(row => row.genre);
    },

    saveMovieGenreMappings: () => {},
    deleteMovieGenreMappings: () => {}
  };
});

// Create Express app for testing
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));
  app.use('/api/ratings', ratingsRouter);
  return app;
}

describe('Ratings API Endpoints', () => {
  let app;
  let db;
  let userId;
  let testSession;

  beforeEach(() => {
    // Create fresh test database
    db = createTestDatabase();

    // Create test user
    const user = createTestUser(db);
    userId = user.id;

    // Create test app
    app = createTestApp();

    // Mock session middleware
    app.use((req, res, next) => {
      req.session.userId = userId;
      next();
    });
    app.use('/api/ratings', ratingsRouter);
  });

  afterEach(() => {
    if (db) db.close();
    cleanupTestDatabase();
  });

  describe('POST /api/ratings', () => {
    test('should save a new movie rating', async () => {
      const movie = createTestMovie({
        id: '27205',
        title: 'Inception',
        genre: 'Action, Science Fiction',
        rating: 'up',
        imdbRating: 8.8
      });

      const response = await request(app)
        .post('/api/ratings')
        .send(movie);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.movieId).toBe('27205');
    });

    test('should return 400 if movie ID is missing', async () => {
      const movie = { title: 'Test Movie' };

      const response = await request(app)
        .post('/api/ratings')
        .send(movie);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Movie ID and title are required');
    });

    test('should return 400 if title is missing', async () => {
      const movie = { id: '123' };

      const response = await request(app)
        .post('/api/ratings')
        .send(movie);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Movie ID and title are required');
    });

    test('should not return badge if user has less than 5 ratings', async () => {
      // Add only 2 movies
      seedMovies(db, userId, 2);

      const movie = createTestMovie({
        id: 'new-movie',
        title: 'New Movie',
        rating: 'up',
        imdbRating: 8.0
      });

      const response = await request(app)
        .post('/api/ratings')
        .send(movie);

      expect(response.status).toBe(200);
      expect(response.body.badge).toBeNull();
    });

    test('should return badge if user has 5+ ratings', async () => {
      // Seed 5 movies first
      const seededMovies = seedMovies(db, userId, 5, 'up');

      // Add genre mappings and preferences for the seeded movies
      seededMovies.forEach(movie => {
        const genres = movie.genre.split(',').map(g => g.trim());
        genres.forEach(genre => {
          db.prepare('INSERT OR IGNORE INTO movie_genre_mappings (user_id, movie_id, genre) VALUES (?, ?, ?)')
            .run(userId, movie.id, genre);
        });
      });

      const newMovie = createTestMovie({
        id: 'new-movie',
        title: 'New Movie',
        genre: 'Action, Drama',
        rating: 'up',
        imdbRating: 8.5
      });

      const response = await request(app)
        .post('/api/ratings')
        .send(newMovie);

      expect(response.status).toBe(200);
      expect(response.body.badge).toBeDefined();
      expect(response.body.badgeEmoji).toBeDefined();
      expect(response.body.tier).toBeDefined();
    });
  });

  describe('GET /api/ratings', () => {
    test('should return all ratings for a user', async () => {
      seedMovies(db, userId, 5);

      const response = await request(app).get('/api/ratings');

      expect(response.status).toBe(200);
      expect(response.body.ratings).toHaveLength(5);
      expect(response.body.count).toBe(5);
    });

    test('should return empty array if user has no ratings', async () => {
      const response = await request(app).get('/api/ratings');

      expect(response.status).toBe(200);
      expect(response.body.ratings).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    test('should include badge data for each rating when user has 5+ ratings', async () => {
      seedMovies(db, userId, 10);

      const response = await request(app).get('/api/ratings');

      expect(response.status).toBe(200);
      expect(response.body.ratings).toHaveLength(10);

      // Check that each rating has badge fields (may be null if < 5 ratings when excluding itself)
      response.body.ratings.forEach(rating => {
        expect(rating).toHaveProperty('badge');
        expect(rating).toHaveProperty('badgeEmoji');
        expect(rating).toHaveProperty('badgeDescription');
        expect(rating).toHaveProperty('tier');
      });
    });
  });

  describe('GET /api/ratings/:movieId', () => {
    test('should return a specific movie rating', async () => {
      const movie = createTestMovie({ id: '550', title: 'Fight Club' });

      db.prepare(`
        INSERT INTO movie_ratings (user_id, movie_id, title, genre, year, imdb_rating, rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId, movie.id, movie.title, movie.genre, movie.year,
        movie.imdb_rating, movie.rotten_tomatoes, movie.metacritic,
        movie.poster, movie.director, movie.cast, movie.rating, movie.timestamp
      );

      const response = await request(app).get('/api/ratings/550');

      expect(response.status).toBe(200);
      expect(response.body.movie_id).toBe('550');
      expect(response.body.title).toBe('Fight Club');
    });

    test('should return 404 if movie not found', async () => {
      const response = await request(app).get('/api/ratings/999999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Movie not found');
    });
  });

  describe('DELETE /api/ratings/:movieId', () => {
    test('should delete a movie rating', async () => {
      const movie = createTestMovie({ id: '155' });

      db.prepare(`
        INSERT INTO movie_ratings (user_id, movie_id, title, genre, year, imdb_rating, rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId, movie.id, movie.title, movie.genre, movie.year,
        movie.imdb_rating, movie.rotten_tomatoes, movie.metacritic,
        movie.poster, movie.director, movie.cast, movie.rating, movie.timestamp
      );

      // Verify it exists
      let getResponse = await request(app).get('/api/ratings/155');
      expect(getResponse.status).toBe(200);

      // Delete it
      const deleteResponse = await request(app).delete('/api/ratings/155');
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);

      // Verify it's gone
      getResponse = await request(app).get('/api/ratings/155');
      expect(getResponse.status).toBe(404);
    });
  });

  describe('POST /api/ratings/calculate-badge', () => {
    test('should calculate badge without saving', async () => {
      // Seed 5 movies
      seedMovies(db, userId, 5, 'up');

      const movie = createTestMovie({
        id: 'test-movie',
        title: 'Test Movie',
        genre: 'Action',
        imdbRating: 8.0
      });

      const response = await request(app)
        .post('/api/ratings/calculate-badge')
        .send(movie);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('badge');
      expect(response.body).toHaveProperty('badgeEmoji');
      expect(response.body).toHaveProperty('tier');
      expect(response.body).toHaveProperty('totalVotes');
      expect(response.body).toHaveProperty('baseScore');
      expect(response.body).toHaveProperty('adjustedScore');
      expect(response.body).toHaveProperty('adjustments');

      // Verify movie was not saved
      const checkResponse = await request(app).get('/api/ratings/test-movie');
      expect(checkResponse.status).toBe(404);
    });

    test('should return null badge if user has less than 5 ratings', async () => {
      // Seed only 2 movies
      seedMovies(db, userId, 2);

      const movie = createTestMovie({
        id: 'test-movie',
        imdbRating: 8.0
      });

      const response = await request(app)
        .post('/api/ratings/calculate-badge')
        .send(movie);

      expect(response.status).toBe(200);
      expect(response.body.badge).toBeNull();
    });
  });

  describe('GET /api/ratings/preferences/genres', () => {
    test('should return genre preferences with insights', async () => {
      // Add movies with different genres and ratings
      const movies = [
        createTestMovie({ id: '1', genre: 'Action', rating: 'up', imdb_rating: 8.5 }),
        createTestMovie({ id: '2', genre: 'Action', rating: 'up', imdb_rating: 8.0 }),
        createTestMovie({ id: '3', genre: 'Action', rating: 'down', imdb_rating: 6.0 }),
        createTestMovie({ id: '4', genre: 'Drama', rating: 'up', imdb_rating: 8.8 }),
      ];

      const insertStmt = db.prepare(`
        INSERT INTO movie_ratings (user_id, movie_id, title, genre, year, imdb_rating, rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      movies.forEach(movie => {
        insertStmt.run(
          userId, movie.id, movie.title, movie.genre, movie.year,
          movie.imdb_rating, movie.rotten_tomatoes, movie.metacritic,
          movie.poster, movie.director, movie.cast, movie.rating, movie.timestamp
        );
      });

      // Calculate and save genre preferences
      const genreData = {
        'Action': { up: 2, down: 1, avgImdb: 7.5 },
        'Drama': { up: 1, down: 0, avgImdb: 8.8 }
      };

      Object.entries(genreData).forEach(([genre, data]) => {
        db.prepare(`
          INSERT INTO user_genre_preferences (user_id, genre, thumbs_up, thumbs_down, avg_imdb_rating, last_updated)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(userId, genre, data.up, data.down, data.avgImdb, Date.now());
      });

      const response = await request(app).get('/api/ratings/preferences/genres');

      expect(response.status).toBe(200);
      expect(response.body.preferences).toBeDefined();
      expect(Array.isArray(response.body.preferences)).toBe(true);

      if (response.body.preferences.length > 0) {
        expect(response.body.preferences[0]).toHaveProperty('genre');
        expect(response.body.preferences[0]).toHaveProperty('thumbsUp');
        expect(response.body.preferences[0]).toHaveProperty('thumbsDown');
        expect(response.body.preferences[0]).toHaveProperty('sentiment');
        expect(response.body.preferences[0]).toHaveProperty('avgImdbRating');
      }
    });

    test('should return empty array if no preferences', async () => {
      const response = await request(app).get('/api/ratings/preferences/genres');

      expect(response.status).toBe(200);
      expect(response.body.preferences).toEqual([]);
    });
  });

  describe('Badge Tier Calculation', () => {
    test('should return correct tier based on vote count', async () => {
      const testCases = [
        { count: 3, expectedTier: null },  // Less than 5, no badge
        { count: 5, expectedTier: 'Explorer' },
        { count: 10, expectedTier: 'Explorer' },
        { count: 15, expectedTier: 'Enthusiast' },
        { count: 30, expectedTier: 'Expert' },
        { count: 50, expectedTier: 'Master' },
      ];

      for (const testCase of testCases) {
        // Clean database
        db.prepare('DELETE FROM movie_ratings WHERE user_id = ?').run(userId);

        // Seed movies
        seedMovies(db, userId, testCase.count);

        const movie = createTestMovie({
          id: 'tier-test',
          imdbRating: 8.0
        });

        const response = await request(app)
          .post('/api/ratings/calculate-badge')
          .send(movie);

        expect(response.status).toBe(200);

        if (testCase.expectedTier === null) {
          expect(response.body.badge).toBeNull();
        } else {
          expect(response.body.tier).toBe(testCase.expectedTier);
        }
      }
    });
  });
});
