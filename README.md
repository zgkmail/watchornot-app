# CineSense - Snap & Rate Movies

A modern movie and TV show discovery app with secure backend API key storage. Snap photos of movie titles, get instant details, and build your taste profile!

## Features

- **Image Recognition**: Use your camera or upload images to detect movie/TV show titles
- **Movie Database**: Powered by TMDB API with comprehensive movie and TV show information
- **Taste Profile**: Rate movies to build your personalized taste profile
- **Secure API Keys**: Backend server with encrypted API key storage (AES-256)
- **Session Management**: Automatic user session handling
- **Rate Limiting**: Built-in protection against API abuse

## Architecture

### Frontend
- **Framework**: React 18 (CDN-based)
- **Styling**: Tailwind CSS
- **Build**: No build step required (Babel transpiles in browser)
- **Storage**: localStorage for ratings

### Backend (NEW!)
- **Server**: Node.js + Express.js
- **Database**: SQLite with better-sqlite3
- **Encryption**: AES-256-GCM for API keys
- **Authentication**: Session-based with express-session
- **Security**: Rate limiting, CORS protection

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- A modern web browser
- API keys from:
  - [TMDB](https://www.themoviedb.org/settings/api)
  - [Google Cloud Vision](https://console.cloud.google.com/)

### 1. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Generate encryption keys
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Add the generated keys to .env file
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

### 3. Configure API Keys

1. Open the app in your browser
2. Go to the **Profile** tab
3. Enter your TMDB API key and click "Save TMDB Key"
4. Enter your Google Vision API key and click "Save Vision Key"
5. You're ready to start snapping movies!

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
    ├── routes/
    │   ├── apiKeys.js      # API key management
    │   ├── tmdb.js         # TMDB proxy
    │   └── vision.js       # Vision API proxy
    └── utils/
        └── encryption.js   # AES-256 encryption
```

## API Endpoints

### Backend API

- `GET /health` - Health check
- `GET /api/session` - Session info
- `POST /api/keys` - Store/update API key
- `GET /api/keys` - List configured providers
- `DELETE /api/keys/:provider` - Delete API key
- `GET /api/tmdb/search?query=name` - Search movies/TV
- `GET /api/tmdb/:type/:id` - Get movie/TV details
- `POST /api/vision/detect` - Detect text in image

See [backend/README.md](backend/README.md) for detailed API documentation.

## Security Features

### API Key Protection
- **Encryption at Rest**: AES-256-GCM with PBKDF2 key derivation
- **Unique Salts**: Each key encrypted with unique salt and IV
- **No Client Exposure**: API keys never sent to frontend
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
ENCRYPTION_KEY=your_32_char_encryption_key
SESSION_SECRET=your_session_secret
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

### API keys not saving
- Check backend logs for errors
- Ensure encryption keys are set in `.env`
- Verify database directory has write permissions

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
- Google Cloud Vision API

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
- [Google Cloud Vision](https://cloud.google.com/vision) for OCR
- All open source contributors

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs
3. Check browser console for errors
4. Open an issue on GitHub

---

Built with ❤️ for movie lovers everywhere!
