# CineSense Backend

Secure backend server for CineSense app that provides proxy endpoints for TMDB API, keeping API keys secure on the server.

## Features

- **Secure API Key Storage**: API keys stored in server environment variables, never exposed to clients
- **Session-based Authentication**: Automatic user session management
- **Proxy Endpoints**: Backend proxies requests to TMDB API
- **Rate Limiting**: Built-in rate limiting to prevent API abuse
- **SQLite Database**: Lightweight database for user session management
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
└── routes/
    ├── tmdb.js            # TMDB proxy endpoints
    ├── claude.js          # Claude API proxy endpoints
    ├── omdb.js            # OMDB proxy endpoints
    └── ratings.js         # Ratings endpoints
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

Generate a secure session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Edit `.env` and add your configuration:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your_generated_session_secret_here
TMDB_API_KEY=your_tmdb_api_key_here
```

Get your API key:
- **TMDB**: https://www.themoviedb.org/settings/api

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

## Security Features

### API Key Protection
- API keys stored securely in server environment variables
- Keys never exposed to client-side code
- Backend proxies all API requests
- No database storage of sensitive API keys

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

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  created_at INTEGER NOT NULL,
  last_accessed INTEGER NOT NULL
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

# Search for a movie (ensure backend .env has API keys configured)
curl "http://localhost:3001/api/tmdb/search?query=inception" \
  -b cookies.txt -c cookies.txt
```

## Production Deployment

### Environment Configuration

1. Set `NODE_ENV=production` in `.env`
2. Use a strong session secret (32+ characters)
3. Set `FRONTEND_URL` to your production frontend URL
4. Ensure API keys are properly configured
5. Enable HTTPS (secure cookies)

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

### API errors
- Verify API keys are correctly set in backend `.env` file
- Check backend logs for detailed error messages
- Ensure API keys are valid and have proper permissions

## License

MIT
