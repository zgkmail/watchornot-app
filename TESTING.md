# Testing CineSense Locally

Follow these steps to test the CineSense app on your local computer.

## Prerequisites

1. **Node.js and npm**: Make sure you have Node.js 18+ installed
   ```bash
   node --version
   npm --version
   ```

2. **API Keys**: You'll need to obtain:
   - **TMDB API Key**: https://www.themoviedb.org/settings/api
   - **Google Vision API Key**: https://console.cloud.google.com/

## Step 1: Setup Backend

### 1.1 Navigate to backend directory
```bash
cd backend
```

### 1.2 Install dependencies
```bash
npm install
```

This will install:
- express
- cors
- dotenv
- better-sqlite3
- express-session
- express-rate-limit
- axios
- uuid

### 1.3 Create environment file
```bash
cp .env.example .env
```

### 1.4 Generate session secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (it will be a long hex string).

### 1.5 Edit the .env file
Open `backend/.env` in your text editor and configure:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=paste_your_generated_secret_here
TMDB_API_KEY=paste_your_tmdb_api_key_here
```

**Important**: Replace the placeholder values with your actual keys!

### 1.6 Start the backend server
```bash
npm start
```

You should see:
```
==================================================
🎬 CineSense Backend Server
==================================================
✓ Server running on port 3001
✓ Environment: development
✓ CORS enabled for: http://localhost:3000
✓ API endpoint: http://localhost:3001/api
✓ Health check: http://localhost:3001/health
==================================================
```

**Keep this terminal window open!** The backend needs to keep running.

## Step 2: Setup Frontend

### 2.1 Open a new terminal window
Leave the backend running and open a new terminal.

### 2.2 Navigate to project root
```bash
cd /path/to/cinesense-app
```

### 2.3 Start a simple HTTP server

**Option A: Using Python** (if you have Python installed)
```bash
python3 -m http.server 3000
```

**Option B: Using Node.js http-server**
```bash
npx http-server -p 3000
```

**Option C: Using PHP** (if you have PHP installed)
```bash
php -S localhost:3000
```

### 2.4 Open in browser
Open your browser and navigate to:
```
http://localhost:3000
```

## Step 3: Test the Application

### 3.1 Verify Backend Connection
Open your browser's Developer Tools (F12) and check the Console for any errors.

### 3.2 Test Health Check
In a new terminal, verify the backend is responding:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","message":"CineSense Backend is running"}
```

### 3.3 Test Manual Search
1. Click on the **Snap** tab (camera icon)
2. Click **"Manual Search"**
3. Type a movie name (e.g., "Inception")
4. Click **"Search"** or press Enter
5. You should see movie details appear!

### 3.4 Test Camera/Upload
1. Click **"Open Camera"** (on mobile/webcam) or **"Upload Image"**
2. Take/upload a photo of a movie title screen
3. The app should detect text and search for the movie

### 3.5 Test Rating
1. After a movie appears, click the thumbs up or thumbs down button
2. Go to the **History** tab (clock icon)
3. You should see your rated movie listed
4. Your taste profile progress bar should update

### 3.6 Test Profile
1. Click the **Profile** tab (user icon)
2. You should see your taste profile percentage
3. The API key configuration section should be gone (removed in latest update)

## Step 4: Check Backend Logs

In the terminal where the backend is running, you should see requests like:
```
GET /api/session 200
GET /api/tmdb/search?query=inception 200
```

If you see any errors, check:
- API keys are correctly set in `.env`
- No typos in environment variable names
- Backend is running on port 3001

## Troubleshooting

### Error: "TMDB API key not configured"
- Check that `TMDB_API_KEY` is set in `backend/.env`
- Restart the backend server after changing `.env`
- Verify your TMDB API key is valid

### CORS errors in browser console
- Ensure backend `FRONTEND_URL` is set to `http://localhost:3000`
- Check that you're accessing frontend at exactly `http://localhost:3000` (not 127.0.0.1)
- Restart backend after changing CORS settings

### "Cannot connect to backend"
- Verify backend is running (check terminal)
- Test health endpoint: `curl http://localhost:3001/health`
- Check firewall isn't blocking port 3001

### Database errors
- The database is created automatically in `backend/db/cinesense.db`
- Ensure the backend has write permissions in the `backend/db/` directory
- Delete `cinesense.db` and restart if corrupted

### Session not persisting
- Clear browser cookies and try again
- Check browser console for cookie warnings
- Ensure you're using `http://localhost:3000` (not `file://`)

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads in browser
- [ ] Manual search works
- [ ] Movie details display correctly
- [ ] Rating movies works
- [ ] Rated movies appear in History
- [ ] Taste profile updates
- [ ] Image upload/camera works
- [ ] Backend logs show successful requests

## Next Steps

Once local testing is successful:
- Deploy backend to a hosting service (Railway, Render, Heroku)
- Deploy frontend to static hosting (GitHub Pages, Netlify, Vercel)
- Update `FRONTEND_URL` in production `.env`
- Enable HTTPS for production

## Need Help?

If you encounter issues:
1. Check backend logs for errors
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Try with a different browser
5. Restart both backend and frontend servers
