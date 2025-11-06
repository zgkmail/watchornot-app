# WatchOrNot - One Snap. One Answer.

See a movie on TV? Just snap the title. WatchOrNot gives you a personalized yes-or-no recommendation based on your taste profile—instantly. No more endless scrolling or wondering if that movie is worth your time.

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
- **Framework**: React 18
- **Build Tool**: Vite (fast development & optimized production builds)
- **Styling**: Tailwind CSS (via PostCSS)
- **Bundler**: Vite + esbuild
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

### Option 1: Quick Start Script (Easiest!)

```bash
# Install dependencies (first time only)
npm install
cd backend && npm install && cd ..

# Configure backend (first time only)
cd backend
cp .env.example .env
# Edit .env with your API keys
cd ..

# Start both frontend and backend
./start-dev.sh
```

### Option 2: Manual Setup

### 1. Setup Frontend Dependencies

```bash
# Install frontend dependencies
npm install
```

### 2. Setup Backend

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

### 3. Setup Frontend (in a new terminal)

```bash
# Start the Vite development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 4. Start Using the App

1. Open the app in your browser (http://localhost:3000)
2. The backend securely handles all API requests
3. Start snapping movies!

## Project Structure

```
watchornot-app/
├── index.html              # Main HTML entry point
├── package.json            # Frontend dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── start-dev.sh            # Convenience script to start both servers
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Main React component
│   └── index.css           # Global styles + Tailwind directives
├── README.md               # This file
└── backend/
    ├── server.js           # Main Express server
    ├── package.json        # Backend dependencies
    ├── .env.example        # Environment template
    ├── README.md           # Backend documentation
    ├── db/
    │   ├── database.js     # SQLite setup & queries
    │   └── watchornot.db   # Database (auto-created)
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

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The frontend uses Vite for fast development with hot module replacement (HMR). Edit files in `src/` and see changes instantly.

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

In `src/App.jsx`, update the backend URL if needed:

```javascript
const BACKEND_URL = 'http://localhost:3001';
```

## Mobile Testing

Want to test the app on your iPhone while the servers run on your computer? It's easy!

Both the frontend and backend are configured to work on your local network automatically. Just:

1. Find your computer's IP address (e.g., `192.168.1.5`)
2. Start both servers with `npm run dev` (frontend) and `cd backend && npm start`
3. Open `http://YOUR-IP:3000` on your iPhone's Safari

The app automatically detects the network URL and connects to the backend on the same IP!

📱 **See [MOBILE_TESTING.md](MOBILE_TESTING.md) for detailed instructions.**

## Deployment

### Frontend
Build the production version and deploy to any static hosting:

```bash
# Build for production
npm run build

# The dist/ folder contains your production-ready files
```

Deploy `dist/` folder to:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static hosting service

### Backend
Deploy to any Node.js hosting platform:
- Railway
- Render
- Heroku
- DigitalOcean App Platform

**Important**:
- Update `FRONTEND_URL` in backend `.env` to match your frontend domain
- Set `NODE_ENV=production` in production environment

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
- Vite
- Tailwind CSS
- PostCSS & Autoprefixer

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
