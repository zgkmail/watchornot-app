# CineSense - Snap & Rate Movies

A modern movie and TV show discovery app with secure backend API key storage. Snap photos of movie titles, get instant details, and build your taste profile!

## Features

- **Image Recognition**: Use your camera or upload images to detect movie/TV show titles
- **Movie Database**: Powered by TMDB API with comprehensive movie and TV show information
- **Taste Profile**: Rate movies to build your personalized taste profile
- **Secure API Keys**: Backend server keeps API keys secure on the server
- **Session Management**: Automatic user session handling
- **Rate Limiting**: Built-in protection against API abuse
- **Zero Configuration**: No API key input required from users

## Architecture

### Frontend
- **Framework**: React 18 (CDN-based)
- **Styling**: Tailwind CSS
- **Build**: No build step required (Babel transpiles in browser)
- **Storage**: localStorage for ratings

### Backend (NEW!)
- **Server**: Node.js + Express.js
- **Database**: SQLite for session management
- **API Proxy**: Secure proxy for TMDB API
- **Authentication**: Session-based with express-session
- **Security**: Rate limiting, CORS protection, environment-based API keys

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- A modern web browser
- **For server admin**: API key from:
  - [TMDB](https://www.themoviedb.org/settings/api)

### 1. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Generate session secret
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Edit .env and add:
# - Generated SESSION_SECRET
# - Your TMDB_API_KEY
nano .env

# Start the backend server
npm start
```

The backend will run on `http://localhost:3001`

### 2. Setup Frontend

```bash
# Go back to project root
cd ..

# Open index.html in a browser
# On macOS:
open index.html

# On Linux:
xdg-open index.html

# On Windows:
start index.html

# Or use a simple HTTP server (recommended):
python -m http.server 3000
# or
npx http-server -p 3000
```

The frontend will be available at `http://localhost:3000`

### 3. Start Using the App

1. Open the app in your browser (http://localhost:3000)
2. The backend securely handles all API requests
3. Start snapping movies!

## Project Structure

```
cinesense-app/
├── index.html              # Frontend (React app in single file)
├── README.md               # This file
└── backend/
    ├── server.js           # Main Express server
    ├── package.json        # Dependencies
    ├── .env.example        # Environment template
    ├── README.md           # Backend documentation
    ├── db/
    │   ├── database.js     # SQLite setup & queries
    │   └── cinesense.db    # Database (auto-created)
    └── routes/
        ├── tmdb.js         # TMDB proxy
        ├── claude.js       # Claude API proxy
        ├── omdb.js         # OMDB proxy
        └── ratings.js      # Ratings endpoints
```

## API Endpoints

### Backend API

- `GET /health` - Health check
- `GET /api/session` - Session info
- `GET /api/tmdb/search?query=name` - Search movies/TV
- `GET /api/tmdb/:type/:id` - Get movie/TV details

See [backend/README.md](backend/README.md) for detailed API documentation.

## Security Features

### API Key Protection
- **Server-side Storage**: API keys stored in environment variables
- **No Client Exposure**: API keys never sent to frontend
- **Proxy Architecture**: Backend proxies all external API requests
- **Session-based Auth**: Secure HTTP-only cookies

### Rate Limiting
- General endpoints: 100 req/15min per IP
- External API proxies: 30 req/15min per IP

### CORS Protection
- Configurable allowed origins
- Credentials support for sessions

## Development

### Frontend Development
The frontend is a single HTML file with React loaded via CDN. Simply edit `index.html` and refresh your browser.

### Backend Development

```bash
cd backend

# Install dev dependencies
npm install

# Run with auto-reload
npm run dev

# The server will restart on file changes
```

## Configuration

### Backend Environment Variables

Create `backend/.env` with:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your_session_secret
TMDB_API_KEY=your_tmdb_api_key
```

### Frontend Backend URL

In `index.html`, update the backend URL if needed (line ~149):

```javascript
const BACKEND_URL = 'http://localhost:3001';
```

## Deployment

### Frontend
Deploy the `index.html` file to any static hosting:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront

### Backend
Deploy to any Node.js hosting platform:
- Railway
- Render
- Heroku
- DigitalOcean App Platform

**Important**: Update `FRONTEND_URL` in backend `.env` to match your frontend domain.

## Troubleshooting

### Backend not connecting
- Ensure backend is running on port 3001
- Check browser console for CORS errors
- Verify `FRONTEND_URL` matches frontend URL

### API errors
- Check backend logs for detailed error messages
- Ensure API keys are correctly set in backend `.env`
- Verify API keys are valid and have proper permissions

### Session not persisting
- Clear browser cookies and try again
- Ensure `credentials: 'include'` in fetch calls
- Check backend session secret is set

## Technologies Used

### Frontend
- React 18
- Tailwind CSS
- Babel Standalone
- TMDB API
- Claude API (for image recognition)

### Backend
- Node.js
- Express.js
- better-sqlite3
- express-session
- express-rate-limit
- crypto (built-in)
- axios
- cors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or production!

## Acknowledgments

- [TMDB](https://www.themoviedb.org/) for movie data
- [Claude API](https://www.anthropic.com/) for image recognition
- All open source contributors

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs
3. Check browser console for errors
4. Open an issue on GitHub

---

Built with ❤️ for movie lovers everywhere!
