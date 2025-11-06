const Database = require('better-sqlite3');
const {
  createTestDatabase,
  cleanupTestDatabase,
  createTestMovie,
  createTestUser,
  seedMovies,
  TEST_DB_PATH,
  SAMPLE_MOVIES
} = require('../testHelpers');

describe('Database Operations', () => {
  let db;
  let userId;

  beforeEach(() => {
    // Create fresh test database
    db = createTestDatabase();
    // Create test user
    const user = createTestUser(db);
    userId = user.id;
  });

  afterEach(() => {
    // Close database and cleanup
    if (db) db.close();
    cleanupTestDatabase();
  });

  describe('Movie Rating CRUD Operations', () => {
    test('should save a new movie rating', () => {
      const movie = createTestMovie({
        id: '27205',
        title: 'Inception',
        genre: 'Action, Science Fiction',
        rating: 'up'
      });

      const stmt = db.prepare(`
        INSERT INTO movie_ratings (user_id, movie_id, title, genre, year, imdb_rating, rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        userId,
        movie.id,
        movie.title,
        movie.genre,
        movie.year,
        movie.imdb_rating,
        movie.rotten_tomatoes,
        movie.metacritic,
        movie.poster,
        movie.director,
        movie.cast,
        movie.rating,
        movie.timestamp
      );

      const result = db.prepare('SELECT * FROM movie_ratings WHERE user_id = ? AND movie_id = ?')
        .get(userId, movie.id);

      expect(result).toBeDefined();
      expect(result.title).toBe('Inception');
      expect(result.rating).toBe('up');
      expect(result.genre).toBe('Action, Science Fiction');
    });

    test('should retrieve all movie ratings for a user', () => {
      // Seed 5 movies
      seedMovies(db, userId, 5);

      const results = db.prepare('SELECT * FROM movie_ratings WHERE user_id = ? ORDER BY timestamp DESC')
        .all(userId);

      expect(results).toHaveLength(5);
      expect(results[0]).toHaveProperty('title');
      expect(results[0]).toHaveProperty('rating');
    });

    test('should update an existing movie rating', () => {
      const movie = createTestMovie({ id: '550', rating: 'up' });

      const insertStmt = db.prepare(`
        INSERT INTO movie_ratings (user_id, movie_id, title, genre, year, imdb_rating, rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertStmt.run(
        userId, movie.id, movie.title, movie.genre, movie.year,
        movie.imdb_rating, movie.rotten_tomatoes, movie.metacritic,
        movie.poster, movie.director, movie.cast, movie.rating, movie.timestamp
      );

      // Update rating from 'up' to 'down'
      const updateStmt = db.prepare(`
        UPDATE movie_ratings SET rating = ?, timestamp = ?
        WHERE user_id = ? AND movie_id = ?
      `);

      const newTimestamp = Date.now();
      updateStmt.run('down', newTimestamp, userId, movie.id);

      const result = db.prepare('SELECT * FROM movie_ratings WHERE user_id = ? AND movie_id = ?')
        .get(userId, movie.id);

      expect(result.rating).toBe('down');
      expect(result.timestamp).toBe(newTimestamp);
    });

    test('should delete a movie rating', () => {
      const movie = createTestMovie({ id: '155' });

      const insertStmt = db.prepare(`
        INSERT INTO movie_ratings (user_id, movie_id, title, genre, year, imdb_rating, rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertStmt.run(
        userId, movie.id, movie.title, movie.genre, movie.year,
        movie.imdb_rating, movie.rotten_tomatoes, movie.metacritic,
        movie.poster, movie.director, movie.cast, movie.rating, movie.timestamp
      );

      // Verify it exists
      let result = db.prepare('SELECT * FROM movie_ratings WHERE user_id = ? AND movie_id = ?')
        .get(userId, movie.id);
      expect(result).toBeDefined();

      // Delete it
      db.prepare('DELETE FROM movie_ratings WHERE user_id = ? AND movie_id = ?')
        .run(userId, movie.id);

      // Verify it's gone
      result = db.prepare('SELECT * FROM movie_ratings WHERE user_id = ? AND movie_id = ?')
        .get(userId, movie.id);
      expect(result).toBeUndefined();
    });

    test('should enforce unique constraint on user_id and movie_id', () => {
      const movie = createTestMovie({ id: '238' });

      const insertStmt = db.prepare(`
        INSERT INTO movie_ratings (user_id, movie_id, title, genre, year, imdb_rating, rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertStmt.run(
        userId, movie.id, movie.title, movie.genre, movie.year,
        movie.imdb_rating, movie.rotten_tomatoes, movie.metacritic,
        movie.poster, movie.director, movie.cast, movie.rating, movie.timestamp
      );

      // Try to insert the same movie again
      expect(() => {
        insertStmt.run(
          userId, movie.id, movie.title, movie.genre, movie.year,
          movie.imdb_rating, movie.rotten_tomatoes, movie.metacritic,
          movie.poster, movie.director, movie.cast, movie.rating, Date.now()
        );
      }).toThrow();
    });
  });

  describe('Genre Mapping Operations', () => {
    test('should save genre mappings for a movie', () => {
      const movie = createTestMovie({
        id: '27205',
        genre: 'Action, Science Fiction, Thriller'
      });

      // First, insert the movie
      db.prepare(`
        INSERT INTO movie_ratings (user_id, movie_id, title, genre, year, imdb_rating, rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId, movie.id, movie.title, movie.genre, movie.year,
        movie.imdb_rating, movie.rotten_tomatoes, movie.metacritic,
        movie.poster, movie.director, movie.cast, movie.rating, movie.timestamp
      );

      // Save genre mappings
      const genres = movie.genre.split(',').map(g => g.trim());
      const insertGenreStmt = db.prepare(`
        INSERT INTO movie_genre_mappings (user_id, movie_id, genre)
        VALUES (?, ?, ?)
      `);

      genres.forEach(genre => {
        insertGenreStmt.run(userId, movie.id, genre);
      });

      // Verify mappings
      const mappings = db.prepare('SELECT genre FROM movie_genre_mappings WHERE user_id = ? AND movie_id = ?')
        .all(userId, movie.id);

      expect(mappings).toHaveLength(3);
      expect(mappings.map(m => m.genre)).toEqual(['Action', 'Science Fiction', 'Thriller']);
    });

    test('should retrieve all genres for a movie', () => {
      const movie = createTestMovie({
        id: '550',
        genre: 'Drama, Thriller'
      });

      // Insert movie
      db.prepare(`
        INSERT INTO movie_ratings (user_id, movie_id, title, genre, year, imdb_rating, rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId, movie.id, movie.title, movie.genre, movie.year,
        movie.imdb_rating, movie.rotten_tomatoes, movie.metacritic,
        movie.poster, movie.director, movie.cast, movie.rating, movie.timestamp
      );

      // Save genre mappings
      const genres = movie.genre.split(',').map(g => g.trim());
      const insertGenreStmt = db.prepare(`
        INSERT INTO movie_genre_mappings (user_id, movie_id, genre)
        VALUES (?, ?, ?)
      `);

      genres.forEach(genre => {
        insertGenreStmt.run(userId, movie.id, genre);
      });

      // Retrieve genres
      const result = db.prepare('SELECT genre FROM movie_genre_mappings WHERE user_id = ? AND movie_id = ?')
        .all(userId, movie.id)
        .map(row => row.genre);

      expect(result).toEqual(['Drama', 'Thriller']);
    });

    test('should delete genre mappings when movie is deleted', () => {
      const movie = createTestMovie({ id: '155' });

      // Insert movie
      db.prepare(`
        INSERT INTO movie_ratings (user_id, movie_id, title, genre, year, imdb_rating, rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId, movie.id, movie.title, movie.genre, movie.year,
        movie.imdb_rating, movie.rotten_tomatoes, movie.metacritic,
        movie.poster, movie.director, movie.cast, movie.rating, movie.timestamp
      );

      // Save genre mappings
      db.prepare('INSERT INTO movie_genre_mappings (user_id, movie_id, genre) VALUES (?, ?, ?)')
        .run(userId, movie.id, 'Action');

      // Delete movie
      db.prepare('DELETE FROM movie_ratings WHERE user_id = ? AND movie_id = ?')
        .run(userId, movie.id);

      // Delete associated genre mappings
      db.prepare('DELETE FROM movie_genre_mappings WHERE user_id = ? AND movie_id = ?')
        .run(userId, movie.id);

      // Verify mappings are gone
      const mappings = db.prepare('SELECT * FROM movie_genre_mappings WHERE user_id = ? AND movie_id = ?')
        .all(userId, movie.id);

      expect(mappings).toHaveLength(0);
    });
  });

  describe('Genre Preferences Calculation', () => {
    test('should calculate genre preferences correctly', () => {
      // Add multiple movies with same genre but different ratings
      const movies = [
        createTestMovie({ id: '1', genre: 'Action', rating: 'up', imdb_rating: 8.5 }),
        createTestMovie({ id: '2', genre: 'Action', rating: 'up', imdb_rating: 8.0 }),
        createTestMovie({ id: '3', genre: 'Action', rating: 'down', imdb_rating: 6.0 }),
      ];

      const insertMovieStmt = db.prepare(`
        INSERT INTO movie_ratings (user_id, movie_id, title, genre, year, imdb_rating, rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertGenreStmt = db.prepare(`
        INSERT INTO movie_genre_mappings (user_id, movie_id, genre)
        VALUES (?, ?, ?)
      `);

      movies.forEach(movie => {
        insertMovieStmt.run(
          userId, movie.id, movie.title, movie.genre, movie.year,
          movie.imdb_rating, movie.rotten_tomatoes, movie.metacritic,
          movie.poster, movie.director, movie.cast, movie.rating, movie.timestamp
        );
        insertGenreStmt.run(userId, movie.id, 'Action');
      });

      // Calculate preferences
      const ratings = db.prepare(`
        SELECT DISTINCT mr.rating, mr.imdb_rating
        FROM movie_ratings mr
        JOIN movie_genre_mappings mgm ON mr.user_id = mgm.user_id AND mr.movie_id = mgm.movie_id
        WHERE mr.user_id = ? AND mgm.genre = ? AND mr.rating IS NOT NULL
      `).all(userId, 'Action');

      const thumbsUp = ratings.filter(r => r.rating === 'up').length;
      const thumbsDown = ratings.filter(r => r.rating === 'down').length;
      const avgImdb = ratings.reduce((sum, r) => sum + (r.imdb_rating || 0), 0) / ratings.length;

      // Save preferences
      db.prepare(`
        INSERT INTO user_genre_preferences (user_id, genre, thumbs_up, thumbs_down, avg_imdb_rating, last_updated)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, 'Action', thumbsUp, thumbsDown, avgImdb, Date.now());

      // Verify
      const prefs = db.prepare('SELECT * FROM user_genre_preferences WHERE user_id = ? AND genre = ?')
        .get(userId, 'Action');

      expect(prefs.thumbs_up).toBe(2);
      expect(prefs.thumbs_down).toBe(1);
      expect(prefs.avg_imdb_rating).toBeCloseTo(7.5, 1);
    });

    test('should handle multiple genres per movie correctly', () => {
      const movie = createTestMovie({
        id: '27205',
        genre: 'Action, Science Fiction',
        rating: 'up',
        imdb_rating: 8.8
      });

      // Insert movie
      db.prepare(`
        INSERT INTO movie_ratings (user_id, movie_id, title, genre, year, imdb_rating, rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId, movie.id, movie.title, movie.genre, movie.year,
        movie.imdb_rating, movie.rotten_tomatoes, movie.metacritic,
        movie.poster, movie.director, movie.cast, movie.rating, movie.timestamp
      );

      // Insert genre mappings
      const genres = ['Action', 'Science Fiction'];
      const insertGenreStmt = db.prepare('INSERT INTO movie_genre_mappings (user_id, movie_id, genre) VALUES (?, ?, ?)');

      genres.forEach(genre => {
        insertGenreStmt.run(userId, movie.id, genre);
      });

      // Calculate preferences for each genre
      genres.forEach(genre => {
        const ratings = db.prepare(`
          SELECT DISTINCT mr.rating, mr.imdb_rating
          FROM movie_ratings mr
          JOIN movie_genre_mappings mgm ON mr.user_id = mgm.user_id AND mr.movie_id = mgm.movie_id
          WHERE mr.user_id = ? AND mgm.genre = ? AND mr.rating IS NOT NULL
        `).all(userId, genre);

        const thumbsUp = ratings.filter(r => r.rating === 'up').length;
        const thumbsDown = ratings.filter(r => r.rating === 'down').length;
        const avgImdb = ratings.reduce((sum, r) => sum + (r.imdb_rating || 0), 0) / ratings.length;

        db.prepare(`
          INSERT INTO user_genre_preferences (user_id, genre, thumbs_up, thumbs_down, avg_imdb_rating, last_updated)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(userId, genre, thumbsUp, thumbsDown, avgImdb, Date.now());
      });

      // Verify both genres have preferences
      const actionPrefs = db.prepare('SELECT * FROM user_genre_preferences WHERE user_id = ? AND genre = ?')
        .get(userId, 'Action');
      const sciFiPrefs = db.prepare('SELECT * FROM user_genre_preferences WHERE user_id = ? AND genre = ?')
        .get(userId, 'Science Fiction');

      expect(actionPrefs.thumbs_up).toBe(1);
      expect(sciFiPrefs.thumbs_up).toBe(1);
      expect(actionPrefs.avg_imdb_rating).toBe(8.8);
      expect(sciFiPrefs.avg_imdb_rating).toBe(8.8);
    });
  });

  describe('Director Preferences Calculation', () => {
    test('should calculate director preferences correctly', () => {
      const movies = [
        createTestMovie({ id: '1', director: 'Christopher Nolan', rating: 'up', imdb_rating: 8.8 }),
        createTestMovie({ id: '2', director: 'Christopher Nolan', rating: 'up', imdb_rating: 9.0 }),
        createTestMovie({ id: '3', director: 'Christopher Nolan', rating: 'down', imdb_rating: 7.0 }),
      ];

      const insertMovieStmt = db.prepare(`
        INSERT INTO movie_ratings (user_id, movie_id, title, genre, year, imdb_rating, rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      movies.forEach(movie => {
        insertMovieStmt.run(
          userId, movie.id, movie.title, movie.genre, movie.year,
          movie.imdb_rating, movie.rotten_tomatoes, movie.metacritic,
          movie.poster, movie.director, movie.cast, movie.rating, movie.timestamp
        );
      });

      // Calculate preferences
      const director = 'Christopher Nolan';
      const ratings = db.prepare(`
        SELECT rating, imdb_rating
        FROM movie_ratings
        WHERE user_id = ? AND director LIKE ? AND rating IS NOT NULL
      `).all(userId, `%${director}%`);

      const thumbsUp = ratings.filter(r => r.rating === 'up').length;
      const thumbsDown = ratings.filter(r => r.rating === 'down').length;
      const avgImdb = ratings.reduce((sum, r) => sum + (r.imdb_rating || 0), 0) / ratings.length;

      db.prepare(`
        INSERT INTO user_director_preferences (user_id, director, thumbs_up, thumbs_down, avg_imdb_rating, last_updated)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, director, thumbsUp, thumbsDown, avgImdb, Date.now());

      // Verify
      const prefs = db.prepare('SELECT * FROM user_director_preferences WHERE user_id = ? AND director = ?')
        .get(userId, director);

      expect(prefs.thumbs_up).toBe(2);
      expect(prefs.thumbs_down).toBe(1);
      expect(prefs.avg_imdb_rating).toBeCloseTo(8.27, 1);
    });
  });

  describe('Cast Preferences Calculation', () => {
    test('should calculate cast preferences correctly', () => {
      const movies = [
        createTestMovie({ id: '1', cast: 'Leonardo DiCaprio, Tom Hardy', rating: 'up', imdb_rating: 8.8 }),
        createTestMovie({ id: '2', cast: 'Leonardo DiCaprio, Marion Cotillard', rating: 'up', imdb_rating: 8.5 }),
        createTestMovie({ id: '3', cast: 'Leonardo DiCaprio, Kate Winslet', rating: 'down', imdb_rating: 7.0 }),
      ];

      const insertMovieStmt = db.prepare(`
        INSERT INTO movie_ratings (user_id, movie_id, title, genre, year, imdb_rating, rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      movies.forEach(movie => {
        insertMovieStmt.run(
          userId, movie.id, movie.title, movie.genre, movie.year,
          movie.imdb_rating, movie.rotten_tomatoes, movie.metacritic,
          movie.poster, movie.director, movie.cast, movie.rating, movie.timestamp
        );
      });

      // Calculate preferences for Leonardo DiCaprio
      const castMember = 'Leonardo DiCaprio';
      const ratings = db.prepare(`
        SELECT rating, imdb_rating
        FROM movie_ratings
        WHERE user_id = ? AND "cast" LIKE ? AND rating IS NOT NULL
      `).all(userId, `%${castMember}%`);

      const thumbsUp = ratings.filter(r => r.rating === 'up').length;
      const thumbsDown = ratings.filter(r => r.rating === 'down').length;
      const avgImdb = ratings.reduce((sum, r) => sum + (r.imdb_rating || 0), 0) / ratings.length;

      db.prepare(`
        INSERT INTO user_cast_preferences (user_id, cast_member, thumbs_up, thumbs_down, avg_imdb_rating, last_updated)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, castMember, thumbsUp, thumbsDown, avgImdb, Date.now());

      // Verify
      const prefs = db.prepare('SELECT * FROM user_cast_preferences WHERE user_id = ? AND cast_member = ?')
        .get(userId, castMember);

      expect(prefs.thumbs_up).toBe(2);
      expect(prefs.thumbs_down).toBe(1);
      expect(prefs.avg_imdb_rating).toBeCloseTo(8.1, 1);
    });
  });

  describe('Test Helpers', () => {
    test('seedMovies should create correct number of movies', () => {
      const count = 10;
      const movies = seedMovies(db, userId, count, 'up');

      expect(movies).toHaveLength(count);

      const dbMovies = db.prepare('SELECT * FROM movie_ratings WHERE user_id = ?').all(userId);
      expect(dbMovies).toHaveLength(count);
    });

    test('seedMovies should use sample movies when available', () => {
      const count = 5;
      const movies = seedMovies(db, userId, count);

      // First 5 should be from SAMPLE_MOVIES
      expect(movies[0].title).toBe(SAMPLE_MOVIES[0].title);
      expect(movies[1].title).toBe(SAMPLE_MOVIES[1].title);
    });

    test('seedMovies should alternate ratings when not specified', () => {
      const count = 10;
      const movies = seedMovies(db, userId, count);

      const upCount = movies.filter(m => m.rating === 'up').length;
      const downCount = movies.filter(m => m.rating === 'down').length;

      expect(upCount).toBe(5);
      expect(downCount).toBe(5);
    });

    test('createTestMovie should generate unique movie IDs', () => {
      const movie1 = createTestMovie();
      const movie2 = createTestMovie();

      expect(movie1.id).not.toBe(movie2.id);
    });
  });

  describe('Data Integrity', () => {
    test('should maintain referential integrity when user is deleted', () => {
      // Create another user to test cascade delete
      const testUser = createTestUser(db, 'cascade-test-user', 'cascadeuser');

      // Add movies for this user
      seedMovies(db, testUser.id, 3);

      // Add genre mappings
      db.prepare('INSERT INTO movie_genre_mappings (user_id, movie_id, genre) VALUES (?, ?, ?)')
        .run(testUser.id, '1', 'Action');

      // Delete user
      db.prepare('DELETE FROM users WHERE id = ?').run(testUser.id);

      // Verify movies are deleted (cascade)
      const movies = db.prepare('SELECT * FROM movie_ratings WHERE user_id = ?').all(testUser.id);
      expect(movies).toHaveLength(0);
    });

    test('should handle NULL ratings gracefully', () => {
      const movie = createTestMovie({ id: '999', rating: 'up' });

      // Insert with NULL for some optional fields
      db.prepare(`
        INSERT INTO movie_ratings (user_id, movie_id, title, genre, year, imdb_rating, rotten_tomatoes, metacritic, poster, director, cast, rating, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId, movie.id, movie.title, null, movie.year,
        null, null, null, movie.poster, null, null, movie.rating, movie.timestamp
      );

      const result = db.prepare('SELECT * FROM movie_ratings WHERE user_id = ? AND movie_id = ?')
        .get(userId, movie.id);

      expect(result).toBeDefined();
      expect(result.genre).toBeNull();
      expect(result.imdb_rating).toBeNull();
    });
  });
});
