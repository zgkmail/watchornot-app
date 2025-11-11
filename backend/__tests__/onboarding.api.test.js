const request = require('supertest');
const express = require('express');
const session = require('express-session');
const onboardingRouter = require('../routes/onboarding');
const Database = require('better-sqlite3');
const {
  createTestDatabase,
  cleanupTestDatabase,
  createTestUser
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
    }
  };
});

// Create Express app for testing
function createTestApp(userId = 'test-user-123') {
  const app = express();
  app.use(express.json());

  // Mock session middleware
  app.use((req, res, next) => {
    req.session = {
      id: 'test-session-id',
      userId: userId,
      cookie: {}
    };
    next();
  });

  app.use('/api/onboarding', onboardingRouter);
  return app;
}

describe('Onboarding API Endpoints', () => {
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

  describe('GET /api/onboarding/movies', () => {
    test('should return 5 random curated movies', async () => {
      const response = await request(app).get('/api/onboarding/movies');

      expect(response.status).toBe(200);
      expect(response.body.movies).toBeDefined();
      expect(Array.isArray(response.body.movies)).toBe(true);
      expect(response.body.movies).toHaveLength(5);

      // Check movie structure
      const movie = response.body.movies[0];
      expect(movie).toHaveProperty('id');
      expect(movie).toHaveProperty('title');
      expect(movie).toHaveProperty('year');
      expect(movie).toHaveProperty('genres');
      expect(movie).toHaveProperty('imdbRating');
      expect(movie).toHaveProperty('director');
      expect(movie).toHaveProperty('cast');
      expect(movie).toHaveProperty('poster');

      // Check types
      expect(typeof movie.id).toBe('string');
      expect(typeof movie.title).toBe('string');
      expect(typeof movie.year).toBe('number');
      expect(Array.isArray(movie.genres)).toBe(true);
      expect(typeof movie.imdbRating).toBe('number');
      expect(typeof movie.director).toBe('string');
      expect(typeof movie.cast).toBe('string');
    });

    test('should return different movies on multiple calls', async () => {
      const response1 = await request(app).get('/api/onboarding/movies');
      const response2 = await request(app).get('/api/onboarding/movies');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      const ids1 = response1.body.movies.map(m => m.id).sort();
      const ids2 = response2.body.movies.map(m => m.id).sort();

      // At least some movies should be different (statistically very likely with 50+ movies)
      expect(ids1.join(',')).not.toBe(ids2.join(','));
    });

    test('should return movies with diverse genres', async () => {
      const response = await request(app).get('/api/onboarding/movies');

      expect(response.status).toBe(200);

      // Collect all genres
      const allGenres = new Set();
      response.body.movies.forEach(movie => {
        movie.genres.forEach(genre => allGenres.add(genre));
      });

      // Should have multiple genres represented
      expect(allGenres.size).toBeGreaterThan(3);
    });

    test('should return high-quality movies (IMDb > 7.0)', async () => {
      const response = await request(app).get('/api/onboarding/movies');

      expect(response.status).toBe(200);

      response.body.movies.forEach(movie => {
        expect(movie.imdbRating).toBeGreaterThan(7.0);
      });
    });
  });

  describe('POST /api/onboarding/complete', () => {
    test('should save 5 votes and return Explorer tier', async () => {
      const votes = [
        {
          movieId: '155',
          title: 'The Dark Knight',
          year: 2008,
          genres: ['Action', 'Crime', 'Drama'],
          imdbRating: 9.0,
          director: 'Christopher Nolan',
          cast: 'Christian Bale, Heath Ledger, Aaron Eckhart',
          poster: '/poster1.jpg',
          vote: 'up'
        },
        {
          movieId: '27205',
          title: 'Inception',
          year: 2010,
          genres: ['Action', 'Science Fiction', 'Thriller'],
          imdbRating: 8.8,
          director: 'Christopher Nolan',
          cast: 'Leonardo DiCaprio, Joseph Gordon-Levitt',
          poster: '/poster2.jpg',
          vote: 'up'
        },
        {
          movieId: '13',
          title: 'Forrest Gump',
          year: 1994,
          genres: ['Comedy', 'Drama', 'Romance'],
          imdbRating: 8.8,
          director: 'Robert Zemeckis',
          cast: 'Tom Hanks, Robin Wright',
          poster: '/poster3.jpg',
          vote: 'down'
        },
        {
          movieId: '238',
          title: 'The Godfather',
          year: 1972,
          genres: ['Crime', 'Drama'],
          imdbRating: 9.2,
          director: 'Francis Ford Coppola',
          cast: 'Marlon Brando, Al Pacino',
          poster: '/poster4.jpg',
          vote: 'up'
        },
        {
          movieId: '680',
          title: 'Pulp Fiction',
          year: 1994,
          genres: ['Crime', 'Drama', 'Thriller'],
          imdbRating: 8.9,
          director: 'Quentin Tarantino',
          cast: 'John Travolta, Uma Thurman',
          poster: '/poster5.jpg',
          vote: 'up'
        }
      ];

      const response = await request(app)
        .post('/api/onboarding/complete')
        .send({ votes });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.totalVotes).toBe(5);
      expect(response.body.tier).toBe('Explorer');
      expect(response.body.topGenres).toBeDefined();
      expect(Array.isArray(response.body.topGenres)).toBe(true);
      expect(response.body.savedVotes).toBe(5);
      expect(response.body.processingTime).toBeDefined();
    });

    test('should calculate top genres based on likes', async () => {
      const votes = [
        {
          movieId: '1',
          title: 'Action Movie 1',
          genres: ['Action'],
          vote: 'up',
          year: 2020,
          imdbRating: 8.0,
          director: 'Test',
          cast: 'Test',
          poster: '/test.jpg'
        },
        {
          movieId: '2',
          title: 'Action Movie 2',
          genres: ['Action'],
          vote: 'up',
          year: 2020,
          imdbRating: 8.0,
          director: 'Test',
          cast: 'Test',
          poster: '/test.jpg'
        },
        {
          movieId: '3',
          title: 'Drama Movie',
          genres: ['Drama'],
          vote: 'up',
          year: 2020,
          imdbRating: 8.0,
          director: 'Test',
          cast: 'Test',
          poster: '/test.jpg'
        },
        {
          movieId: '4',
          title: 'Comedy Movie',
          genres: ['Comedy'],
          vote: 'down',
          year: 2020,
          imdbRating: 8.0,
          director: 'Test',
          cast: 'Test',
          poster: '/test.jpg'
        },
        {
          movieId: '5',
          title: 'Horror Movie',
          genres: ['Horror'],
          vote: 'down',
          year: 2020,
          imdbRating: 8.0,
          director: 'Test',
          cast: 'Test',
          poster: '/test.jpg'
        }
      ];

      const response = await request(app)
        .post('/api/onboarding/complete')
        .send({ votes });

      expect(response.status).toBe(200);
      expect(response.body.topGenres).toHaveLength(2);
      expect(response.body.topGenres[0].genre).toBe('Action');
      expect(response.body.topGenres[0].count).toBe(2);
      expect(response.body.topGenres[1].genre).toBe('Drama');
      expect(response.body.topGenres[1].count).toBe(1);
    });

    test('should require authentication', async () => {
      const appNoAuth = createTestApp(null);
      const votes = [
        {
          movieId: '1',
          title: 'Test',
          vote: 'up',
          year: 2020,
          genres: ['Action'],
          imdbRating: 8.0,
          director: 'Test',
          cast: 'Test',
          poster: '/test.jpg'
        }
      ];

      const response = await request(appNoAuth)
        .post('/api/onboarding/complete')
        .send({ votes });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Not authenticated');
    });

    test('should validate votes array is present', async () => {
      const response = await request(app)
        .post('/api/onboarding/complete')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid request');
    });

    test('should validate votes array is not empty', async () => {
      const response = await request(app)
        .post('/api/onboarding/complete')
        .send({ votes: [] });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid request');
    });

    test('should validate each vote has required fields', async () => {
      const invalidVotes = [
        {
          title: 'Missing movieId',
          vote: 'up'
        }
      ];

      const response = await request(app)
        .post('/api/onboarding/complete')
        .send({ votes: invalidVotes });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid vote data');
    });

    test('should validate vote value is up or down', async () => {
      const invalidVotes = [
        {
          movieId: '1',
          title: 'Test',
          vote: 'invalid',
          year: 2020,
          genres: ['Action'],
          imdbRating: 8.0,
          director: 'Test',
          cast: 'Test',
          poster: '/test.jpg'
        }
      ];

      const response = await request(app)
        .post('/api/onboarding/complete')
        .send({ votes: invalidVotes });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid vote value');
    });

    test('should handle partial vote saves gracefully', async () => {
      // Even if one vote fails, others should succeed
      const votes = [
        {
          movieId: '1',
          title: 'Valid Movie',
          vote: 'up',
          year: 2020,
          genres: ['Action'],
          imdbRating: 8.0,
          director: 'Test',
          cast: 'Test',
          poster: '/test.jpg'
        },
        {
          movieId: '2',
          title: 'Another Valid Movie',
          vote: 'down',
          year: 2020,
          genres: ['Drama'],
          imdbRating: 7.5,
          director: 'Test',
          cast: 'Test',
          poster: '/test.jpg'
        }
      ];

      const response = await request(app)
        .post('/api/onboarding/complete')
        .send({ votes });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.savedVotes).toBeGreaterThan(0);
    });

    test('should correctly calculate tier progression', async () => {
      const testCases = [
        { voteCount: 3, expectedTier: 'Newcomer' },
        { voteCount: 5, expectedTier: 'Explorer' },
        { voteCount: 15, expectedTier: 'Enthusiast' },
        { voteCount: 30, expectedTier: 'Expert' },
        { voteCount: 50, expectedTier: 'Master' }
      ];

      for (const testCase of testCases) {
        // Clear database
        mockTestDb.prepare('DELETE FROM movie_ratings WHERE user_id = ?').run(userId);

        // Create votes
        const votes = [];
        for (let i = 0; i < testCase.voteCount; i++) {
          votes.push({
            movieId: `movie-${i}`,
            title: `Movie ${i}`,
            vote: 'up',
            year: 2020,
            genres: ['Action'],
            imdbRating: 8.0,
            director: 'Test',
            cast: 'Test',
            poster: '/test.jpg'
          });
        }

        const response = await request(app)
          .post('/api/onboarding/complete')
          .send({ votes });

        expect(response.status).toBe(200);
        expect(response.body.tier).toBe(testCase.expectedTier);
        expect(response.body.totalVotes).toBe(testCase.voteCount);
      }
    });

    test('should handle genres as array or string', async () => {
      const votes = [
        {
          movieId: '1',
          title: 'Test Array',
          vote: 'up',
          year: 2020,
          genres: ['Action', 'Drama'], // Array format
          imdbRating: 8.0,
          director: 'Test',
          cast: 'Test',
          poster: '/test.jpg'
        },
        {
          movieId: '2',
          title: 'Test String',
          vote: 'up',
          year: 2020,
          genres: 'Comedy, Romance', // String format
          imdbRating: 8.0,
          director: 'Test',
          cast: 'Test',
          poster: '/test.jpg'
        }
      ];

      const response = await request(app)
        .post('/api/onboarding/complete')
        .send({ votes });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.savedVotes).toBe(2);
    });
  });
});
