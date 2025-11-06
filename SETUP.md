# Complete Setup Guide - From Clone to Running

This guide walks you through getting the WatchOrNot app running on your local computer from scratch.

## Prerequisites

Before you begin, make sure you have:

1. **Git** installed
   ```bash
   git --version
   ```

2. **Node.js 18+** and **npm** installed
   ```bash
   node --version
   npm --version
   ```

3. **A modern web browser** (Chrome, Firefox, Safari, or Edge)

## Step 1: Get API Key (Do This First!)

You'll need a TMDB API key. Get it now:

### TMDB API Key
1. Go to https://www.themoviedb.org/
2. Create a free account (if you don't have one)
3. Go to Settings > API
4. Request an API key (choose "Developer")
5. Copy your API key (v3 auth key)

**Keep this key handy!** You'll need it in Step 4.

## Step 2: Clone the Repository

Open your terminal and clone the repository:

```bash
# Clone the repository
git clone https://github.com/zgkmail/watchornot-app.git

# Navigate into the project directory
cd watchornot-app

# Switch to the backend branch
git checkout claude/backend-api-key-storage-011CUi1MkeVrAeayyVip2Ysh
```

You should see a folder structure like:
```
watchornot-app/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── README.md
├── SETUP.md (this file)
├── TESTING.md
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   └── index.css
└── backend/
    ├── server.js
    ├── package.json
    ├── .env.example
    └── ...
```

## Step 3: Setup the Backend

### 3.1 Navigate to backend directory
```bash
cd backend
```

### 3.2 Install Node.js dependencies
```bash
npm install
```

This will take 1-2 minutes and install all required packages.

### 3.3 Create environment configuration file
```bash
cp .env.example .env
```

This creates a new `.env` file from the example template.

### 3.4 Generate a secure session secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output a long random string like:
```
a7f3e9b2c4d8e1f0a3b5c7d9e2f4a6b8c1d3e5f7a9b2c4d6e8f1a3b5c7d9e2f4
```

**Copy this string!**

### 3.5 Edit the .env file

Open `backend/.env` in your favorite text editor:

**On macOS:**
```bash
nano .env
# or
open -e .env
```

**On Linux:**
```bash
nano .env
# or
gedit .env
```

**On Windows:**
```bash
notepad .env
```

Replace the placeholder values with your actual keys:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Paste the session secret you generated in step 3.4
SESSION_SECRET=a7f3e9b2c4d8e1f0a3b5c7d9e2f4a6b8c1d3e5f7a9b2c4d6e8f1a3b5c7d9e2f4

# Paste your TMDB API key from step 1
TMDB_API_KEY=your_actual_tmdb_api_key_here
```

**Save and close the file.**

### 3.6 Start the backend server
```bash
npm start
```

You should see output like:
```
==================================================
🎬 WatchOrNot Backend Server
==================================================
✓ Server running on port 3001
✓ Environment: development
✓ CORS enabled for: http://localhost:3000
✓ API endpoint: http://localhost:3001/api
✓ Health check: http://localhost:3001/health
==================================================
```

🎉 **Success!** Your backend is now running!

**⚠️ IMPORTANT: Keep this terminal window open!** The backend needs to stay running.

## Step 4: Setup the Frontend

### 4.1 Open a NEW terminal window

**Don't close the backend terminal!** Open a new terminal window or tab.

### 4.2 Navigate to the project root

```bash
cd /path/to/watchornot-app
```

Replace `/path/to/watchornot-app` with the actual path where you cloned the repo.

### 4.3 Install frontend dependencies

```bash
npm install
```

This will install React, Vite, Tailwind CSS, and other dependencies. Takes about 1-2 minutes.

### 4.4 Start the development server

```bash
npm run dev
```

You should see output like:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

🎉 **Success!** Your frontend development server is now running!

## Step 5: Open in Browser

1. Open your web browser
2. Go to: **http://localhost:3000**

You should see the WatchOrNot app with three tabs at the bottom:
- 📜 History
- 📷 Snap
- 👤 Profile

## Step 6: Test the App!

### Test 1: Manual Search
1. Click on the **Snap** tab (camera icon at bottom)
2. Click the **"Manual Search"** button
3. Type a movie name like **"Inception"** or **"Avatar"**
4. Press Enter or click Search
5. ✅ Movie details should appear with poster, cast, and rating!

### Test 2: Rate a Movie
1. After a movie appears, click the **👍 thumbs up** button
2. The button should turn green briefly
3. Click on the **History** tab (clock icon)
4. ✅ You should see your rated movie in the list!
5. ✅ The "Taste Profile" progress bar should show 1/10 (10%)

### Test 3: Check Backend Connection
Open your browser's Developer Tools:
- **Chrome/Edge**: Press F12 or Ctrl+Shift+I (Cmd+Option+I on Mac)
- **Firefox**: Press F12 or Ctrl+Shift+I (Cmd+Option+I on Mac)

Go to the **Console** tab. You should see:
- ✅ No red error messages
- ✅ Network requests to `localhost:3001` succeeding

### Test 4: Verify Backend Logs
Look at the terminal where the backend is running. You should see logs like:
```
GET /api/session 200
GET /api/tmdb/search?query=inception 200
```

✅ **If you see these, everything is working perfectly!**

## Troubleshooting

### Problem: "FATAL ERROR: TMDB_API_KEY environment variable is not set"

**Solution:**
1. Make sure you saved the `.env` file
2. Check that the API keys are in the correct format (no quotes needed)
3. Restart the backend server (Ctrl+C, then `npm start`)

### Problem: "Cannot connect to backend" in browser

**Solution:**
1. Make sure backend is running (check the backend terminal)
2. Test: `curl http://localhost:3001/health` in a new terminal
3. You should get: `{"status":"ok","message":"WatchOrNot Backend is running"}`

### Problem: CORS error in browser console

**Solution:**
1. Make sure you're accessing `http://localhost:3000` exactly (not `127.0.0.1:3000` or `file://`)
2. Check `FRONTEND_URL` in `backend/.env` is set to `http://localhost:3000`
3. Restart the backend server

### Problem: "Invalid API key" errors

**Solution:**
1. Verify your TMDB API key at https://www.themoviedb.org/settings/api
2. Verify your Vision API key is active and Vision API is enabled
3. Make sure you copied the entire key (no spaces or line breaks)
4. Restart the backend server after changing `.env`

### Problem: Movies don't appear / search doesn't work

**Solution:**
1. Check backend logs for error messages
2. Test TMDB directly: `curl "http://localhost:3001/api/tmdb/search?query=inception"`
3. Make sure both backend and frontend are running
4. Check browser console for JavaScript errors

### Problem: Port 3000 or 3001 already in use

**Solution:**
- For backend: Edit `backend/.env` and change `PORT=3001` to `PORT=3002`
- For frontend: Use a different port like `python3 -m http.server 8000`
- Update `FRONTEND_URL` in backend `.env` to match

## What's Running?

When everything is working, you should have:

1. ✅ **Backend server** running on `http://localhost:3001`
   - Terminal window showing "WatchOrNot Backend Server"
   - Handling API requests to TMDB

2. ✅ **Frontend server** running on `http://localhost:3000`
   - Terminal window showing "Serving HTTP"
   - Serving the index.html React app

3. ✅ **Browser tab** open at `http://localhost:3000`
   - WatchOrNot app interface
   - Ready to snap and rate movies!

## Stopping the App

When you're done testing:

1. **Stop the frontend**: Go to the frontend terminal, press `Ctrl+C`
2. **Stop the backend**: Go to the backend terminal, press `Ctrl+C`

## Next Time You Want to Run the App

You don't need to reinstall or reconfigure! Just:

```bash
# Terminal 1: Start backend
cd watchornot-app/backend
npm start

# Terminal 2: Start frontend
cd watchornot-app
npm run dev

# Then open http://localhost:3000 in browser
```

## Building for Production

To create an optimized production build:

```bash
npm run build
```

This will:
- Compile and optimize your React code
- Process Tailwind CSS and remove unused styles
- Minify and bundle all assets
- Output everything to the `dist/` folder

To preview the production build locally:

```bash
npm run preview
```

## Need More Help?

- Check **MOBILE_TESTING.md** for testing on iPhone/mobile devices
- Check **TESTING.md** for detailed testing scenarios
- Check **backend/README.md** for API documentation
- Check **README.md** for project overview

## Success Checklist

- [x] Cloned the repository
- [x] Obtained TMDB API key
- [x] Installed backend dependencies (`npm install`)
- [x] Created and configured `.env` file
- [x] Backend starts without errors
- [x] Frontend serves successfully
- [x] App opens in browser at http://localhost:3000
- [x] Manual search finds movies
- [x] Rating movies works
- [x] History shows rated movies

🎉 **Congratulations! You're ready to start using WatchOrNot!**
