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

  // Create indexes for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_session ON users(session_id);
    CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
    CREATE INDEX IF NOT EXISTS idx_movie_ratings_user ON movie_ratings(user_id);
    CREATE INDEX IF NOT EXISTS idx_movie_ratings_timestamp ON movie_ratings(timestamp);
    CREATE INDEX IF NOT EXISTS idx_genre_prefs_user ON user_genre_preferences(user_id);
  `);

  console.log('Database initialized successfully');
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
      rotten_tomatoes, metacritic, poster, cast, rating, timestamp
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    movieData.cast,
    movieData.rating,
    movieData.timestamp || now,
    movieData.rating,
    now
  );

  // Update genre preferences
  if (movieData.genre && movieData.rating) {
    updateGenrePreferences(userId, movieData.genre, movieData.rating, movieData.imdbRating);
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
  // Get the movie before deleting to update genre preferences
  const movie = getMovieRating(userId, movieId);

  const stmt = db.prepare(`
    DELETE FROM movie_ratings
    WHERE user_id = ? AND movie_id = ?
  `);

  stmt.run(userId, movieId);

  // Update genre preferences after deletion
  if (movie && movie.genre) {
    recalculateGenrePreferences(userId, movie.genre);
  }
}

/**
 * Update genre preferences based on rating
 */
function updateGenrePreferences(userId, genre, rating, imdbRating) {
  const now = Date.now();

  // Get current preferences
  const current = db.prepare(`
    SELECT * FROM user_genre_preferences
    WHERE user_id = ? AND genre = ?
  `).get(userId, genre);

  if (current) {
    // Update existing
    const newThumbsUp = rating === 'up' ? current.thumbs_up + 1 : current.thumbs_up;
    const newThumbsDown = rating === 'down' ? current.thumbs_down + 1 : current.thumbs_down;

    db.prepare(`
      UPDATE user_genre_preferences
      SET thumbs_up = ?, thumbs_down = ?, last_updated = ?
      WHERE user_id = ? AND genre = ?
    `).run(newThumbsUp, newThumbsDown, now, userId, genre);
  } else {
    // Insert new
    const thumbsUp = rating === 'up' ? 1 : 0;
    const thumbsDown = rating === 'down' ? 1 : 0;

    db.prepare(`
      INSERT INTO user_genre_preferences (user_id, genre, thumbs_up, thumbs_down, avg_imdb_rating, last_updated)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, genre, thumbsUp, thumbsDown, imdbRating, now);
  }
}

/**
 * Recalculate genre preferences from scratch
 */
function recalculateGenrePreferences(userId, genre) {
  const ratings = db.prepare(`
    SELECT rating, imdb_rating FROM movie_ratings
    WHERE user_id = ? AND genre = ? AND rating IS NOT NULL
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
  getUserGenrePreferences
};
