/**
 * Simple logging utility with environment-based log levels
 *
 * LOG_LEVEL environment variable controls verbosity:
 * - debug: All logs (development default)
 * - info: Info, warn, error
 * - warn: Warn and error only
 * - error: Error only
 * - none: No logs
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4
};

// Get log level from environment, default to 'info' in production, 'debug' in development
const currentLogLevel = process.env.LOG_LEVEL ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const currentLevel = LOG_LEVELS[currentLogLevel] || LOG_LEVELS.info;

const logger = {
  debug: (...args) => {
    if (currentLevel <= LOG_LEVELS.debug) {
      console.log('[DEBUG]', ...args);
    }
  },

  info: (...args) => {
    if (currentLevel <= LOG_LEVELS.info) {
      console.log('[INFO]', ...args);
    }
  },

  warn: (...args) => {
    if (currentLevel <= LOG_LEVELS.warn) {
      console.warn('[WARN]', ...args);
    }
  },

  error: (...args) => {
    if (currentLevel <= LOG_LEVELS.error) {
      console.error('[ERROR]', ...args);
    }
  },

  // Always log, regardless of level (for critical messages)
  always: (...args) => {
    console.log(...args);
  }
};

module.exports = logger;
