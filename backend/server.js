const express = require('express');
const cors = require('cors');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const tmdbRouter = require('./routes/tmdb');
const visionRouter = require('./routes/vision');
const claudeRouter = require('./routes/claude');

// Import database utilities
const { getOrCreateUser } = require('./db/database');

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

if (!process.env.VISION_API_KEY) {
  console.error('FATAL ERROR: VISION_API_KEY environment variable is not set!');
  console.error('Please add your Google Vision API key to the .env file');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
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
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  })
);

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
  if (!req.session.id) {
    return res.status(401).json({ error: 'Session not found' });
  }

  // Get or create user based on session
  const user = getOrCreateUser(req.session.id);
  req.session.userId = user.id;

  next();
}

// Apply authentication to all API routes
app.use('/api/', ensureAuthenticated);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CineSense Backend is running' });
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
app.use('/api/vision', strictLimiter, visionRouter);
app.use('/api/claude', strictLimiter, claudeRouter);

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

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🎬 CineSense Backend Server`);
  console.log('='.repeat(50));
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ CORS enabled for: ${corsOptions.origin}`);
  console.log(`✓ API endpoint: http://localhost:${PORT}/api`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
  });
});
