# CineSense Backend

Secure backend server for CineSense app that handles encrypted API key storage and provides proxy endpoints for TMDB and Google Vision APIs.

## Features

- **Secure API Key Storage**: API keys are encrypted using AES-256-GCM encryption
- **Session-based Authentication**: Automatic user session management
- **Proxy Endpoints**: Backend proxies requests to TMDB and Google Vision APIs
- **Rate Limiting**: Built-in rate limiting to prevent API abuse
- **SQLite Database**: Lightweight database for storing encrypted keys
- **Automatic Cleanup**: Removes old sessions (30+ days) automatically

## Architecture

```
backend/
├── server.js              # Main Express server
├── package.json           # Node.js dependencies
├── .env                   # Environment configuration (create from .env.example)
├── db/
│   ├── database.js        # SQLite database setup and queries
│   └── cinesense.db       # SQLite database file (auto-created)
├── routes/
│   ├── apiKeys.js         # API key management endpoints
│   ├── tmdb.js            # TMDB proxy endpoints
│   └── vision.js          # Google Vision proxy endpoints
└── utils/
    └── encryption.js      # AES-256 encryption utilities
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Generate secure encryption keys:

```bash
# Generate ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Edit `.env` and add your generated keys:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ENCRYPTION_KEY=your_generated_encryption_key_here
SESSION_SECRET=your_generated_session_secret_here
```

**IMPORTANT**: Never commit your `.env` file to version control!

### 3. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001` by default.

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Session Info
```
GET /api/session
```
Returns current session information.

### API Key Management

#### Store/Update API Key
```
POST /api/keys
Content-Type: application/json

{
  "provider": "tmdb" | "vision",
  "apiKey": "your_api_key_here"
}
```

#### Get All API Keys (metadata only)
```
GET /api/keys
```
Returns list of configured providers (not the actual keys).

#### Delete API Key
```
DELETE /api/keys/:provider
```

### TMDB Proxy Endpoints

#### Search Movies/TV Shows
```
GET /api/tmdb/search?query=movie_name
```

#### Get Movie/TV Show Details
```
GET /api/tmdb/:mediaType/:id
```
Where `mediaType` is either "movie" or "tv".

### Google Vision Proxy Endpoint

#### Detect Text in Image
```
POST /api/vision/detect
Content-Type: application/json

{
  "image": "base64_encoded_image_data"
}
```

## Security Features

### Encryption
- Uses AES-256-GCM (Galois/Counter Mode) for maximum security
- Each API key is encrypted with a unique salt and initialization vector
- PBKDF2 key derivation with 100,000 iterations
- Authentication tags prevent tampering

### Authentication
- Session-based authentication using secure HTTP-only cookies
- Automatic session cleanup after 30 days of inactivity
- Each user gets a unique UUID

### Rate Limiting
- General API routes: 100 requests per 15 minutes per IP
- External API proxies: 30 requests per 15 minutes per IP

## Database

The backend uses SQLite for data storage:

- **File location**: `backend/db/cinesense.db`
- **Auto-created** on first run
- **Schema**:
  - `users`: Stores user sessions and IDs
  - `api_keys`: Stores encrypted API keys

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL,
  last_accessed INTEGER NOT NULL
);

-- API Keys table
CREATE TABLE api_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, provider)
);
```

## Development

### Running with Nodemon

For development, use nodemon for automatic restarts:

```bash
npm run dev
```

### Testing the API

Using curl:

```bash
# Health check
curl http://localhost:3001/health

# Store TMDB API key
curl -X POST http://localhost:3001/api/keys \
  -H "Content-Type: application/json" \
  -b cookies.txt -c cookies.txt \
  -d '{"provider":"tmdb","apiKey":"your_tmdb_key"}'

# Search for a movie
curl "http://localhost:3001/api/tmdb/search?query=inception" \
  -b cookies.txt
```

## Production Deployment

### Environment Configuration

1. Set `NODE_ENV=production` in `.env`
2. Use strong encryption keys (32+ characters)
3. Set `FRONTEND_URL` to your production frontend URL
4. Enable HTTPS (secure cookies)

### Recommended Hosting

- **Node.js hosting**: Heroku, Railway, Render, DigitalOcean App Platform
- **Database**: SQLite works for small-medium traffic; consider PostgreSQL for larger scale

### HTTPS Configuration

For production, use a reverse proxy (nginx) or deploy on a platform that provides HTTPS:

```nginx
server {
    listen 443 ssl;
    server_name api.cinesense.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting

### Database errors
- Ensure `backend/db/` directory exists
- Check file permissions on `cinesense.db`

### CORS errors
- Verify `FRONTEND_URL` in `.env` matches your frontend URL
- Ensure `credentials: 'include'` is set in frontend fetch requests

### Session not persisting
- Check cookies are being sent with `credentials: 'include'`
- In production, ensure secure cookies are enabled with HTTPS

### API key not found
- Verify API key was successfully stored (check `POST /api/keys` response)
- Ensure session cookie is being sent with requests

## License

MIT
