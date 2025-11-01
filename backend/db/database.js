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

  // Create indexes for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_session ON users(session_id);
    CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
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
  cleanupOldSessions
};
