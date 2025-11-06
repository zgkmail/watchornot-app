const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure db directory exists
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'cinesense.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

/**
 * Initialize database tables
 */
function initDatabase() {
  // Users table - stores user sessions and credentials
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      session_id TEXT UNIQUE NOT NULL,
      created_at INTEGER NOT NULL,
      last_accessed INTEGER NOT NULL
    )
  `);

  // API Keys table - stores encrypted API keys
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      encrypted_key TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, provider)
    )
  `);

  // Movie ratings table - stores user ratings for movies
  db.exec(`
    CREATE TABLE IF NOT EXISTS movie_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      movie_id TEXT NOT NULL,
      title TEXT NOT NULL,
      genre TEXT,
      year TEXT,
      imdb_rating REAL,
      rotten_tomatoes INTEGER,
      metacritic INTEGER,
      poster TEXT,
      director TEXT,
      cast TEXT,
      rating TEXT CHECK(rating IN ('up', 'down')),
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, movie_id)
    )
  `);

  // Genre preferences table - aggregated genre stats
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_genre_preferences (
      user_id TEXT NOT NULL,
      genre TEXT NOT NULL,
      thumbs_up INTEGER DEFAULT 0,
      thumbs_down INTEGER DEFAULT 0,
      avg_imdb_rating REAL,
      last_updated INTEGER,
      PRIMARY KEY (user_id, genre),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Director preferences table - aggregated director stats
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_director_preferences (
      user_id TEXT NOT NULL,
      director TEXT NOT NULL,
      thumbs_up INTEGER DEFAULT 0,
      thumbs_down INTEGER DEFAULT 0,
      avg_imdb_rating REAL,
      last_updated INTEGER,
      PRIMARY KEY (user_id, director),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Cast preferences table - aggregated cast stats
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_cast_preferences (
      user_id TEXT NOT NULL,
      cast_member TEXT NOT NULL,
      thumbs_up INTEGER DEFAULT 0,
      thumbs_down INTEGER DEFAULT 0,
      avg_imdb_rating REAL,
      last_updated INTEGER,
      PRIMARY KEY (user_id, cast_member),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Movie-Genre junction table - many-to-many relationship
  db.exec(`
    CREATE TABLE IF NOT EXISTS movie_genre_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      movie_id TEXT NOT NULL,
      genre TEXT NOT NULL,
      FOREIGN KEY (user_id, movie_id) REFERENCES movie_ratings(user_id, movie_id) ON DELETE CASCADE
    )
  `);

  // Create indexes for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_session ON users(session_id);
    CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
    CREATE INDEX IF NOT EXISTS idx_movie_ratings_user ON movie_ratings(user_id);
    CREATE INDEX IF NOT EXISTS idx_movie_ratings_timestamp ON movie_ratings(timestamp);
    CREATE INDEX IF NOT EXISTS idx_genre_prefs_user ON user_genre_preferences(user_id);
    CREATE INDEX IF NOT EXISTS idx_director_prefs_user ON user_director_preferences(user_id);
    CREATE INDEX IF NOT EXISTS idx_cast_prefs_user ON user_cast_preferences(user_id);
    CREATE INDEX IF NOT EXISTS idx_genre_mappings_movie ON movie_genre_mappings(user_id, movie_id);
    CREATE INDEX IF NOT EXISTS idx_genre_mappings_genre ON movie_genre_mappings(genre);
  `);

  console.log('Database initialized successfully');

  // Run migration to add director column if needed
  migrateAddDirectorColumn();

  // Run migration to populate genre mappings if needed
  migrateGenreData();
}

/**
 * Migrate to add director column to movie_ratings table
 */
function migrateAddDirectorColumn() {
  try {
    // Check if director column exists
    const columns = db.prepare("PRAGMA table_info(movie_ratings)").all();
    const hasDirectorColumn = columns.some(col => col.name === 'director');

    if (!hasDirectorColumn) {
      console.log('🔄 Adding director column to movie_ratings table...');
      db.exec('ALTER TABLE movie_ratings ADD COLUMN director TEXT');
      console.log('✅ Director column added successfully');
    }
  } catch (error) {
    console.error('Error checking/adding director column:', error);
  }
}

/**
 * Migrate existing genre data to the new junction table
 * This runs once to split comma-separated genres into individual rows
 */
function migrateGenreData() {
  // Check if migration is needed by seeing if any movie has genres but no mappings
  const needsMigration = db.prepare(`
    SELECT COUNT(*) as count FROM movie_ratings mr
    WHERE mr.genre IS NOT NULL AND mr.genre != ''
    AND NOT EXISTS (
      SELECT 1 FROM movie_genre_mappings mgm
      WHERE mgm.user_id = mr.user_id AND mgm.movie_id = mr.movie_id
    )
  `).get();

  if (needsMigration.count === 0) {
    return; // Already migrated
  }

  console.log(`🔄 Migrating ${needsMigration.count} movies to new genre system...`);

  // Get all movies with genres
  const movies = db.prepare(`
    SELECT user_id, movie_id, genre FROM movie_ratings
    WHERE genre IS NOT NULL AND genre != ''
  `).all();

  const insertMapping = db.prepare(`
    INSERT OR IGNORE INTO movie_genre_mappings (user_id, movie_id, genre)
    VALUES (?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    let genresAdded = 0;

    movies.forEach(movie => {
      // Split genres by comma and trim whitespace
      const genres = movie.genre.split(',').map(g => g.trim()).filter(g => g);

      genres.forEach(genre => {
        insertMapping.run(movie.user_id, movie.movie_id, genre);
        genresAdded++;
      });
    });

    console.log(`✅ Migration complete: ${genresAdded} genre mappings created`);
  });

  transaction();

  // Recalculate all genre preferences to ensure accuracy
  console.log('🔄 Recalculating genre preferences...');
  recalculateAllGenrePreferences();
  console.log('✅ Genre preferences updated');
}

/**
 * Save genre mappings for a movie
 */
function saveMovieGenreMappings(userId, movieId, genreString) {
  // Delete existing mappings for this movie
  db.prepare('DELETE FROM movie_genre_mappings WHERE user_id = ? AND movie_id = ?')
    .run(userId, movieId);

  if (!genreString) return;

  // Split genres and insert each one
  const genres = genreString.split(',').map(g => g.trim()).filter(g => g);
  const insertStmt = db.prepare(`
    INSERT INTO movie_genre_mappings (user_id, movie_id, genre)
    VALUES (?, ?, ?)
  `);

  genres.forEach(genre => {
    insertStmt.run(userId, movieId, genre);
  });
}

/**
 * Get all genres for a specific movie
 */
function getMovieGenres(userId, movieId) {
  const stmt = db.prepare(`
    SELECT genre FROM movie_genre_mappings
    WHERE user_id = ? AND movie_id = ?
  `);

  return stmt.all(userId, movieId).map(row => row.genre);
}

/**
 * Delete genre mappings for a movie
 */
function deleteMovieGenreMappings(userId, movieId) {
  db.prepare('DELETE FROM movie_genre_mappings WHERE user_id = ? AND movie_id = ?')
    .run(userId, movieId);
}

/**
 * Recalculate ALL genre preferences for all users
 * Used during migration
 */
function recalculateAllGenrePreferences() {
  // Get all unique user/genre combinations
  const userGenres = db.prepare(`
    SELECT DISTINCT user_id, genre FROM movie_genre_mappings
  `).all();

  userGenres.forEach(({ user_id, genre }) => {
    recalculateGenrePreferences(user_id, genre);
  });

  // Clean up preferences for genres that no longer have any ratings
  db.prepare(`
    DELETE FROM user_genre_preferences
    WHERE NOT EXISTS (
      SELECT 1 FROM movie_genre_mappings mgm
      WHERE mgm.user_id = user_genre_preferences.user_id
      AND mgm.genre = user_genre_preferences.genre
    )
  `).run();
}

/**
 * Get or create a user by session ID
 */
function getOrCreateUser(sessionId) {
  const now = Date.now();

  // Try to find existing user
  let user = db.prepare('SELECT * FROM users WHERE session_id = ?').get(sessionId);

  if (!user) {
    // Create new user
    const { v4: uuidv4 } = require('uuid');
    const userId = uuidv4();

    db.prepare(`
      INSERT INTO users (id, session_id, created_at, last_accessed)
      VALUES (?, ?, ?, ?)
    `).run(userId, sessionId, now, now);

    user = { id: userId, session_id: sessionId, created_at: now, last_accessed: now };
  } else {
    // Update last accessed time
    db.prepare('UPDATE users SET last_accessed = ? WHERE id = ?').run(now, user.id);
  }

  return user;
}

/**
 * Store an encrypted API key for a user
 */
function storeApiKey(userId, provider, encryptedKey) {
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO api_keys (user_id, provider, encrypted_key, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, provider)
    DO UPDATE SET encrypted_key = ?, updated_at = ?
  `);

  stmt.run(userId, provider, encryptedKey, now, now, encryptedKey, now);
}

/**
 * Get an encrypted API key for a user
 */
function getApiKey(userId, provider) {
  const stmt = db.prepare(`
    SELECT encrypted_key FROM api_keys
    WHERE user_id = ? AND provider = ?
  `);

  const result = stmt.get(userId, provider);
  return result ? result.encrypted_key : null;
}

/**
 * Get all API keys for a user (returns providers only, not actual keys)
 */
function getUserApiKeys(userId) {
  const stmt = db.prepare(`
    SELECT provider, created_at, updated_at FROM api_keys
    WHERE user_id = ?
  `);

  return stmt.all(userId);
}

/**
 * Delete an API key
 */
function deleteApiKey(userId, provider) {
  const stmt = db.prepare(`
    DELETE FROM api_keys WHERE user_id = ? AND provider = ?
  `);

  stmt.run(userId, provider);
}

/**
 * Clean up old sessions (older than 30 days)
 */
function cleanupOldSessions() {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

  db.prepare('DELETE FROM users WHERE last_accessed < ?').run(thirtyDaysAgo);

  console.log('Old sessions cleaned up');
}

/**
 * Save or update a movie rating
 */
function saveMovieRating(userId, movieData) {
  const now = Date.now();

  const stmt = db.prepare(`
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
    userId,
    movieData.id,
    movieData.title,
    movieData.genre,
    movieData.year,
    movieData.imdbRating,
    movieData.rottenTomatoes,
    movieData.metacritic,
    movieData.poster,
    movieData.director,
    movieData.cast,
    movieData.rating,
    movieData.timestamp || now,
    movieData.rating,
    now
  );

  // Save individual genre mappings
  if (movieData.genre) {
    saveMovieGenreMappings(userId, movieData.id, movieData.genre);

    // Recalculate preferences for each genre
    const genres = movieData.genre.split(',').map(g => g.trim()).filter(g => g);
    genres.forEach(genre => {
      recalculateGenrePreferences(userId, genre);
    });
  }

  // Recalculate director preferences
  if (movieData.director && movieData.director !== 'N/A') {
    const directors = movieData.director.split(',').map(d => d.trim()).filter(d => d);
    directors.forEach(director => {
      recalculateDirectorPreferences(userId, director);
    });
  }

  // Recalculate cast preferences
  if (movieData.cast && movieData.cast !== 'N/A') {
    try {
      const castMembers = movieData.cast.split(',').map(c => c.trim()).filter(c => c);
      castMembers.forEach(castMember => {
        recalculateCastPreferences(userId, castMember);
      });
    } catch (error) {
      console.error('Error recalculating cast preferences:', error.message);
    }
  }
}

/**
 * Get all movie ratings for a user
 */
function getUserMovieRatings(userId) {
  const stmt = db.prepare(`
    SELECT * FROM movie_ratings
    WHERE user_id = ?
    ORDER BY timestamp DESC
  `);

  return stmt.all(userId);
}

/**
 * Get a specific movie rating
 */
function getMovieRating(userId, movieId) {
  const stmt = db.prepare(`
    SELECT * FROM movie_ratings
    WHERE user_id = ? AND movie_id = ?
  `);

  return stmt.get(userId, movieId);
}

/**
 * Delete a movie rating
 */
function deleteMovieRating(userId, movieId) {
  // Get the genres before deleting to update preferences
  const genres = getMovieGenres(userId, movieId);

  const stmt = db.prepare(`
    DELETE FROM movie_ratings
    WHERE user_id = ? AND movie_id = ?
  `);

  stmt.run(userId, movieId);

  // Delete genre mappings (cascade should handle this, but let's be explicit)
  deleteMovieGenreMappings(userId, movieId);

  // Update genre preferences after deletion for each genre
  genres.forEach(genre => {
    recalculateGenrePreferences(userId, genre);
  });
}

/**
 * Recalculate genre preferences from scratch
 * Now uses the junction table to correctly handle multi-genre movies
 */
function recalculateGenrePreferences(userId, genre) {
  // Get all ratings for movies that have this genre
  const ratings = db.prepare(`
    SELECT DISTINCT mr.rating, mr.imdb_rating
    FROM movie_ratings mr
    JOIN movie_genre_mappings mgm ON mr.user_id = mgm.user_id AND mr.movie_id = mgm.movie_id
    WHERE mr.user_id = ? AND mgm.genre = ? AND mr.rating IS NOT NULL
  `).all(userId, genre);

  if (ratings.length === 0) {
    // Delete if no ratings
    db.prepare(`
      DELETE FROM user_genre_preferences
      WHERE user_id = ? AND genre = ?
    `).run(userId, genre);
    return;
  }

  const thumbsUp = ratings.filter(r => r.rating === 'up').length;
  const thumbsDown = ratings.filter(r => r.rating === 'down').length;
  const avgImdb = ratings.reduce((sum, r) => sum + (r.imdb_rating || 0), 0) / ratings.length;

  db.prepare(`
    INSERT INTO user_genre_preferences (user_id, genre, thumbs_up, thumbs_down, avg_imdb_rating, last_updated)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, genre)
    DO UPDATE SET
      thumbs_up = ?,
      thumbs_down = ?,
      avg_imdb_rating = ?,
      last_updated = ?
  `).run(
    userId, genre, thumbsUp, thumbsDown, avgImdb, Date.now(),
    thumbsUp, thumbsDown, avgImdb, Date.now()
  );
}

/**
 * Get user genre preferences
 */
function getUserGenrePreferences(userId) {
  const stmt = db.prepare(`
    SELECT * FROM user_genre_preferences
    WHERE user_id = ?
    ORDER BY (thumbs_up - thumbs_down) DESC
  `);

  return stmt.all(userId);
}

/**
 * Recalculate director preferences from scratch
 */
function recalculateDirectorPreferences(userId, director) {
  // Get all ratings for movies with this director
  const ratings = db.prepare(`
    SELECT rating, imdb_rating
    FROM movie_ratings
    WHERE user_id = ? AND "director" LIKE ? AND rating IS NOT NULL
  `).all(userId, `%${director}%`);

  if (ratings.length === 0) {
    // Delete if no ratings
    db.prepare(`
      DELETE FROM user_director_preferences
      WHERE user_id = ? AND director = ?
    `).run(userId, director);
    return;
  }

  const thumbsUp = ratings.filter(r => r.rating === 'up').length;
  const thumbsDown = ratings.filter(r => r.rating === 'down').length;
  const avgImdb = ratings.reduce((sum, r) => sum + (r.imdb_rating || 0), 0) / ratings.length;

  db.prepare(`
    INSERT INTO user_director_preferences (user_id, director, thumbs_up, thumbs_down, avg_imdb_rating, last_updated)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, director)
    DO UPDATE SET
      thumbs_up = ?,
      thumbs_down = ?,
      avg_imdb_rating = ?,
      last_updated = ?
  `).run(
    userId, director, thumbsUp, thumbsDown, avgImdb, Date.now(),
    thumbsUp, thumbsDown, avgImdb, Date.now()
  );
}

/**
 * Get user director preferences
 */
function getUserDirectorPreferences(userId) {
  const stmt = db.prepare(`
    SELECT * FROM user_director_preferences
    WHERE user_id = ?
    ORDER BY (thumbs_up - thumbs_down) DESC
  `);

  return stmt.all(userId);
}

/**
 * Recalculate cast preferences from scratch
 */
function recalculateCastPreferences(userId, castMember) {
  // Get all ratings for movies with this cast member
  const ratings = db.prepare(`
    SELECT rating, imdb_rating
    FROM movie_ratings
    WHERE user_id = ? AND "cast" LIKE ? AND rating IS NOT NULL
  `).all(userId, `%${castMember}%`);

  if (ratings.length === 0) {
    // Delete if no ratings
    db.prepare(`
      DELETE FROM user_cast_preferences
      WHERE user_id = ? AND cast_member = ?
    `).run(userId, castMember);
    return;
  }

  const thumbsUp = ratings.filter(r => r.rating === 'up').length;
  const thumbsDown = ratings.filter(r => r.rating === 'down').length;
  const avgImdb = ratings.reduce((sum, r) => sum + (r.imdb_rating || 0), 0) / ratings.length;

  db.prepare(`
    INSERT INTO user_cast_preferences (user_id, cast_member, thumbs_up, thumbs_down, avg_imdb_rating, last_updated)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, cast_member)
    DO UPDATE SET
      thumbs_up = ?,
      thumbs_down = ?,
      avg_imdb_rating = ?,
      last_updated = ?
  `).run(
    userId, castMember, thumbsUp, thumbsDown, avgImdb, Date.now(),
    thumbsUp, thumbsDown, avgImdb, Date.now()
  );
}

/**
 * Get user cast preferences
 */
function getUserCastPreferences(userId) {
  const stmt = db.prepare(`
    SELECT * FROM user_cast_preferences
    WHERE user_id = ?
    ORDER BY (thumbs_up - thumbs_down) DESC
  `);

  return stmt.all(userId);
}

// Initialize database on module load
initDatabase();

// Run cleanup daily
setInterval(cleanupOldSessions, 24 * 60 * 60 * 1000);

module.exports = {
  db,
  getOrCreateUser,
  storeApiKey,
  getApiKey,
  getUserApiKeys,
  deleteApiKey,
  cleanupOldSessions,
  saveMovieRating,
  getUserMovieRatings,
  getMovieRating,
  deleteMovieRating,
  getUserGenrePreferences,
  getUserDirectorPreferences,
  getUserCastPreferences,
  getMovieGenres,
  saveMovieGenreMappings,
  deleteMovieGenreMappings
};
