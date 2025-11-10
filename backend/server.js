const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SqliteStore = require('better-sqlite3-session-store')(session);
const Database = require('better-sqlite3');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const tmdbRouter = require('./routes/tmdb');
const claudeRouter = require('./routes/claude');
const omdbRouter = require('./routes/omdb');
const ratingsRouter = require('./routes/ratings');

// Import database utilities
const { getOrCreateUser, closeDatabase } = require('./db/database');

// Validate environment variables
if (!process.env.SESSION_SECRET) {
  console.error('FATAL ERROR: SESSION_SECRET environment variable is not set!');
  console.error('Please create a .env file with a secure SESSION_SECRET');
  process.exit(1);
}

if (!process.env.TMDB_API_KEY) {
  console.error('FATAL ERROR: TMDB_API_KEY environment variable is not set!');
  console.error('Please add your TMDB API key to the .env file');
  process.exit(1);
}

// Warn about optional API keys
if (!process.env.CLAUDE_API_KEY || process.env.CLAUDE_API_KEY === 'your_claude_api_key_here') {
  console.warn('⚠️  WARNING: CLAUDE_API_KEY not configured. Image recognition features will not work.');
  console.warn('   Get an API key from: https://console.anthropic.com/');
}

if (!process.env.OMDB_API_KEY || process.env.OMDB_API_KEY === 'your_omdb_api_key_here') {
  console.warn('⚠️  WARNING: OMDB_API_KEY not configured. Movie ratings (IMDb, RT, Metacritic) will not be available.');
  console.warn('   Get a free API key from: https://www.omdbapi.com/apikey.aspx');
}

// Validate production environment configuration
if (process.env.NODE_ENV === 'production') {
  if (!process.env.FRONTEND_URL) {
    console.error('❌ FATAL: FRONTEND_URL environment variable is not set in production!');
    console.error('   This will cause CORS errors and session cookies will not work.');
    console.error('   Set it using: fly secrets set FRONTEND_URL="https://your-frontend-app.fly.dev"');
    process.exit(1);
  }
  console.log(`✓ Production mode: FRONTEND_URL = ${process.env.FRONTEND_URL}`);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy when behind reverse proxy (fly.io, nginx, etc.)
// Set to 1 to trust only the first proxy (fly.io's load balancer)
// This is more secure than 'true' which would allow anyone to spoof X-Forwarded-For
// See: https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1);

// Middleware
app.use(express.json({ limit: '2mb' })); // Limit for base64 images (2MB sufficient for screenshots)
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (after body parser)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;

  console.log(`[${timestamp}] ${method} ${path}`);

  // Log request details for API endpoints
  if (path.startsWith('/api/')) {
    console.log('  Headers:', {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    });

    // Don't log image data (too large), just note if present
    if (req.body && req.body.image) {
      console.log('  Body: { image: <base64 data, length:', req.body.image.length, '> }');
    } else if (req.body && Object.keys(req.body).length > 0) {
      console.log('  Body:', JSON.stringify(req.body, null, 2));
    }
  }

  next();
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In development, allow localhost and local network IPs (with stricter validation)
    if (process.env.NODE_ENV !== 'production') {
      // Allow localhost on any port (but only http, not https in dev)
      if (origin.match(/^http:\/\/localhost(:\d+)?$/)) {
        return callback(null, true);
      }
      // Allow local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      // Verify it's actually a local IP and not something malicious
      if (origin.match(/^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/)) {
        return callback(null, true);
      }

      // Log rejected origin in development for debugging
      console.warn(`⚠️  CORS rejected origin in development: ${origin}`);
    }

    // In production, only allow the configured frontend URL
    const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
    if (origin === allowedOrigin) {
      return callback(null, true);
    }

    // Log rejected origin in production
    console.error(`❌ CORS rejected origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Session configuration with SQLite store
// Use DATABASE_PATH env var if set, otherwise use /data in production, ./db in development
// This matches the logic in db/database.js for consistency
const sessionDbDir = process.env.DATABASE_PATH ||
  (process.env.NODE_ENV === 'production' ? '/data' : path.join(__dirname, 'db'));

const sessionDbPath = path.join(sessionDbDir, 'sessions.db');

// Warn if DATABASE_PATH is not explicitly set in production (using default /data)
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_PATH) {
  console.log('ℹ️  Using default persistent storage: /data (fly.io volume)');
}

const sessionDb = new Database(sessionDbPath);

app.use(
  session({
    store: new SqliteStore({
      client: sessionDb,
      expired: {
        clear: true,
        intervalMs: 900000 // Clean up expired sessions every 15 minutes
      }
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in prod
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  })
);

// Session ID extraction middleware (handles third-party cookie blocking)
// This is a workaround for browsers blocking third-party cookies even with sameSite=none
app.use((req, res, next) => {
  // Check for session ID in custom header first (for browsers that block third-party cookies)
  const customSessionId = req.headers['x-session-id'];

  if (customSessionId && !req.headers.cookie) {
    // Manually set the cookie header so express-session can find the session
    req.headers.cookie = `connect.sid=${customSessionId}`;
    console.log(`[Session] Using X-Session-ID header: ${customSessionId.substring(0, 20)}...`);
  }

  next();
});

// Session debugging middleware (helps diagnose session persistence issues)
app.use((req, res, next) => {
  const isApiRequest = req.path.startsWith('/api/');
  if (isApiRequest) {
    console.log(`[Session] ${req.method} ${req.path}`);
    console.log(`  Session ID: ${req.sessionID || 'NONE'}`);
    console.log(`  Cookie header: ${req.headers.cookie ? 'present' : 'MISSING'}`);
    console.log(`  X-Session-ID header: ${req.headers['x-session-id'] ? 'present' : 'missing'}`);
    console.log(`  User ID: ${req.session?.userId || 'not set'}`);
  }
  next();
});

// Send session ID in response body (workaround for third-party cookie blocking)
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    // Add session ID to all API responses
    if (req.path.startsWith('/api/') && req.sessionID) {
      console.log(`[Session] Adding _sessionId to response: ${req.sessionID.substring(0, 20)}...`);
      const enhancedData = {
        ...data,
        _sessionId: req.sessionID
      };
      return originalJson.call(this, enhancedData);
    }
    return originalJson.call(this, data);
  };
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit API calls to external services
  message: 'Too many API requests, please try again later.'
});

app.use('/api/', limiter);

// Authentication middleware
function ensureAuthenticated(req, res, next) {
  if (!req.sessionID) {
    console.error('[Auth] No session ID found!');
    return res.status(401).json({ error: 'Session not found' });
  }

  // Get or create user based on session ID
  const user = getOrCreateUser(req.sessionID);
  req.session.userId = user.id;

  console.log(`[Auth] User ${user.id} authenticated for session ${req.sessionID}`);

  next();
}

// Apply authentication to all API routes
app.use('/api/', ensureAuthenticated);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'WatchOrNot Backend is running' });
});

// Session info endpoint
app.get('/api/session', (req, res) => {
  res.json({
    sessionId: req.session.id,
    userId: req.session.userId,
    authenticated: true
  });
});

// Routes
app.use('/api/tmdb', strictLimiter, tmdbRouter);
app.use('/api/claude', strictLimiter, claudeRouter);
app.use('/api/omdb', strictLimiter, omdbRouter);
app.use('/api/ratings', ratingsRouter); // No strict limiter for ratings (internal data)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server and capture server instance
const server = app.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let localIp = 'localhost';

  // Find the local network IP
  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        localIp = net.address;
        break;
      }
    }
  }

  console.log('='.repeat(50));
  console.log(`🎬 WatchOrNot Backend Server`);
  console.log('='.repeat(50));
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Database storage: ${sessionDbDir}`);
  console.log(`✓ Trust proxy: 1 (first proxy only)`);

  if (process.env.NODE_ENV === 'production') {
    console.log(`✓ CORS allowed origin: ${process.env.FRONTEND_URL}`);
    console.log(`✓ Session cookies: secure=true, sameSite=none, httpOnly=true`);
  } else {
    console.log(`✓ CORS enabled for development (localhost + local network)`);
    console.log(`✓ Session cookies: secure=false, sameSite=lax, httpOnly=true`);
  }

  console.log(`\n📍 Local:    http://localhost:${PORT}`);
  console.log(`📍 Network:  http://${localIp}:${PORT}`);
  console.log(`\n✓ API endpoint: /api`);
  console.log(`✓ Health check: /health`);
  console.log('='.repeat(50));

  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n💡 To test on iPhone: Use http://${localIp}:3000 in Safari`);
    console.log('='.repeat(50));
  }
});

// Graceful shutdown function
function gracefulShutdown(signal) {
  console.log(`\n${signal} signal received: closing HTTP server and database connections`);

  // Close server first to stop accepting new connections
  server.close(() => {
    console.log('✓ HTTP server closed');

    // Close database connections
    try {
      sessionDb.close();
      console.log('✓ Session database closed');
    } catch (err) {
      console.error('Error closing session database:', err);
    }

    try {
      closeDatabase();
      console.log('✓ Main database closed');
    } catch (err) {
      console.error('Error closing main database:', err);
    }

    console.log('✓ Graceful shutdown complete');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
