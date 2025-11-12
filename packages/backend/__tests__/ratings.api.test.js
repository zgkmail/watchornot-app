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
  seedMovies
} = require('../testHelpers');

// Shared test database
let mockTestDb = null;

// Mock the database module
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
        mockTestDb.prepare('DELETE FROM movie_genre_mappings WHERE user_id = ? AND movie_id = ?')
          .run(userId, movieData.id);

        const genres = movieData.genre.split(',').map(g => g.trim()).filter(g => g);
        const insertGenreStmt = mockTestDb.prepare('INSERT INTO movie_genre_mappings (user_id, movie_id, genre) VALUES (?, ?, ?)');

        genres.forEach(genre => {
          insertGenreStmt.run(userId, movieData.id, genre);
        });
      }
    },

    getUserMovieRatings: (userId) => {
      if (!mockTestDb) return [];
      const stmt = mockTestDb.prepare('SELECT * FROM movie_ratings WHERE user_id = ? ORDER BY timestamp DESC');
      return stmt.all(userId);
    },

    getMovieRating: (userId, movieId) => {
      if (!mockTestDb) return null;
      const stmt = mockTestDb.prepare('SELECT * FROM movie_ratings WHERE user_id = ? AND movie_id = ?');
      return stmt.get(userId, movieId);
    },

    deleteMovieRating: (userId, movieId) => {
      if (!mockTestDb) return;
      mockTestDb.prepare('DELETE FROM movie_ratings WHERE user_id = ? AND movie_id = ?').run(userId, movieId);
      mockTestDb.prepare('DELETE FROM movie_genre_mappings WHERE user_id = ? AND movie_id = ?').run(userId, movieId);
    },

    getUserGenrePreferences: (userId) => {
      if (!mockTestDb) return [];
      const stmt = mockTestDb.prepare('SELECT * FROM user_genre_preferences WHERE user_id = ? ORDER BY (thumbs_up - thumbs_down) DESC');
      return stmt.all(userId);
    },

    getUserDirectorPreferences: (userId) => {
      if (!mockTestDb) return [];
      const stmt = mockTestDb.prepare('SELECT * FROM user_director_preferences WHERE user_id = ? ORDER BY (thumbs_up - thumbs_down) DESC');
      return stmt.all(userId);
    },

    getUserCastPreferences: (userId) => {
      if (!mockTestDb) return [];
      const stmt = mockTestDb.prepare('SELECT * FROM user_cast_preferences WHERE user_id = ? ORDER BY (thumbs_up - thumbs_down) DESC');
      return stmt.all(userId);
    },

    getMovieGenres: (userId, movieId) => {
      if (!mockTestDb) return [];
      const stmt = mockTestDb.prepare('SELECT genre FROM movie_genre_mappings WHERE user_id = ? AND movie_id = ?');
      return stmt.all(userId, movieId).map(row => row.genre);
    },

    recalculateGenrePreferences: (userId) => {
      // Simplified mock implementation
      if (!mockTestDb) return;

      mockTestDb.prepare('DELETE FROM user_genre_preferences WHERE user_id = ?').run(userId);

      const genreStats = mockTestDb.prepare(`
        SELECT
          mgm.genre as genre,
          SUM(CASE WHEN mr.rating = 'up' THEN 1 ELSE 0 END) as thumbs_up,
          SUM(CASE WHEN mr.rating = 'down' THEN 1 ELSE 0 END) as thumbs_down,
          AVG(mr.imdb_rating) as avg_imdb_rating
        FROM movie_genre_mappings mgm
        JOIN movie_ratings mr ON mgm.user_id = mr.user_id AND mgm.movie_id = mr.movie_id
        WHERE mgm.user_id = ?
        GROUP BY mgm.genre
      `).all(userId);

      const stmt = mockTestDb.prepare(`
        INSERT INTO user_genre_preferences (user_id, genre, thumbs_up, thumbs_down, avg_imdb_rating, last_updated)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      genreStats.forEach(stat => {
        stmt.run(userId, stat.genre, stat.thumbs_up, stat.thumbs_down, stat.avg_imdb_rating, Date.now());
      });
    },

    recalculateDirectorPreferences: () => {},
    recalculateCastPreferences: () => {},
    saveMovieGenreMappings: () => {},
    deleteMovieGenreMappings: () => {}
  };
});

// Create Express app for testing
function createTestApp(userId) {
  const app = express();
  app.use(express.json());

  // Mock session middleware with user ID
  app.use((req, res, next) => {
    req.session = {
      userId: userId,
      cookie: {}
    };
    next();
  });

  app.use('/api/ratings', ratingsRouter);
  return app;
}

describe('Ratings API Endpoints', () => {
  let app;
  let userId;

  beforeEach(() => {
    // Create fresh test database in memory
    mockTestDb = createTestDatabase(true);

    // Create test user
    const user = createTestUser(mockTestDb);
    userId = user.id;

    // Create test app
    app = createTestApp(userId);
  });

  afterEach(() => {
    if (mockTestDb) {
      mockTestDb.close();
      mockTestDb = null;
    }
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
      seedMovies(mockTestDb, userId, 2);

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
      const seededMovies = seedMovies(mockTestDb, userId, 5, 'up');

      // Add genre mappings for the seeded movies
      seededMovies.forEach(movie => {
        const genres = movie.genre.split(',').map(g => g.trim());
        genres.forEach(genre => {
          mockTestDb.prepare('INSERT OR IGNORE INTO movie_genre_mappings (user_id, movie_id, genre) VALUES (?, ?, ?)')
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
      seedMovies(mockTestDb, userId, 5);

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
      seedMovies(mockTestDb, userId, 10);

      const response = await request(app).get('/api/ratings');

      expect(response.status).toBe(200);
      expect(response.body.ratings).toHaveLength(10);

      // Check that each rating has badge fields
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

      mockTestDb.prepare(`
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

      mockTestDb.prepare(`
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
      seedMovies(mockTestDb, userId, 5, 'up');

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
      seedMovies(mockTestDb, userId, 2);

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
        createTestMovie({ id: '4', genre: 'Drama', rating: 'up', imdb_rating: 9.0 }),
        createTestMovie({ id: '5', genre: 'Comedy', rating: 'down', imdb_rating: 5.0 })
      ];

      movies.forEach(movie => {
        mockTestDb.prepare(`
          INSERT INTO movie_ratings (user_id, movie_id, title, genre, year, imdb_rating, rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          userId, movie.id, movie.title, movie.genre, movie.year,
          movie.imdb_rating, movie.rotten_tomatoes, movie.metacritic,
          movie.poster, movie.director, movie.cast, movie.rating, movie.timestamp
        );

        // Add genre mappings
        const genres = movie.genre.split(',').map(g => g.trim());
        genres.forEach(genre => {
          mockTestDb.prepare('INSERT INTO movie_genre_mappings (user_id, movie_id, genre) VALUES (?, ?, ?)')
            .run(userId, movie.id, genre);
        });
      });

      // Calculate preferences
      const mockDb = require('../db/database');
      mockDb.recalculateGenrePreferences(userId);

      const response = await request(app).get('/api/ratings/preferences/genres');

      expect(response.status).toBe(200);
      expect(response.body.preferences).toBeDefined();
      expect(Array.isArray(response.body.preferences)).toBe(true);
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
        { votes: 0, expectedTier: 'Newcomer' },
        { votes: 3, expectedTier: 'Newcomer' },
        { votes: 5, expectedTier: 'Explorer' },
        { votes: 10, expectedTier: 'Explorer' },
        { votes: 15, expectedTier: 'Enthusiast' },
        { votes: 25, expectedTier: 'Enthusiast' },
        { votes: 30, expectedTier: 'Expert' },
        { votes: 45, expectedTier: 'Expert' },
        { votes: 50, expectedTier: 'Master' },
        { votes: 100, expectedTier: 'Master' }
      ];

      for (const testCase of testCases) {
        // Clear database
        mockTestDb.prepare('DELETE FROM movie_ratings WHERE user_id = ?').run(userId);
        mockTestDb.prepare('DELETE FROM movie_genre_mappings WHERE user_id = ?').run(userId);

        if (testCase.votes > 0) {
          seedMovies(mockTestDb, userId, testCase.votes);
        }

        const movie = createTestMovie({
          id: `test-movie-${testCase.votes}`,
          title: 'Test Movie',
          rating: 'up',
          imdbRating: 8.0
        });

        const response = await request(app)
          .post('/api/ratings')
          .send(movie);

        expect(response.status).toBe(200);

        if (testCase.votes < 5) {
          expect(response.body.badge).toBeNull();
        } else {
          expect(response.body.tier).toBe(testCase.expectedTier);
        }
      }
    });
  });
});
