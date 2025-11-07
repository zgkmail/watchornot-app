# WatchOrNot - Free Production Deployment Plan

## Overview
This plan deploys WatchOrNot to production with **zero cost** using free tiers of modern hosting platforms.

## Architecture Summary
- **Frontend**: React 18 + Vite (Static Site)
- **Backend**: Node.js + Express + SQLite
- **APIs**:
  - TMDB (movie database - free tier: 1000 requests/day)
  - Claude AI (image recognition - paid API with free trial)
  - OMDB (additional ratings - free tier: 1000 requests/day)

---

## 🎯 Recommended Deployment Strategy

### Option A: Render.com (Recommended - Easiest)

**Cost**: FREE forever
**Best for**: Full-stack apps with database needs

#### Frontend (Static Site)
- **Platform**: Render Static Site
- **Free Tier**:
  - 100 GB bandwidth/month
  - Global CDN
  - Automatic SSL
  - Custom domains

#### Backend (Web Service)
- **Platform**: Render Web Service
- **Free Tier**:
  - 750 hours/month (enough for 24/7 operation)
  - 512 MB RAM
  - Automatic SSL
  - Built-in persistent disk for SQLite
  - Auto-deploy from Git
  - **Note**: Spins down after 15 min inactivity (50s cold start)

#### Deployment Steps:
1. Push code to GitHub
2. Connect Render to your repository
3. Create Web Service for backend (auto-detects Node.js)
4. Add environment variables in Render dashboard
5. Enable persistent disk for SQLite database
6. Create Static Site for frontend
7. Update frontend with backend URL

**Pros**:
- Single platform for both frontend/backend
- Persistent SQLite database support
- Zero configuration
- Free custom domains
- Automatic HTTPS

**Cons**:
- Backend sleeps after 15 min inactivity (cold starts)
- Limited to 512 MB RAM

---

### Option B: Vercel + Railway (Alternative)

#### Frontend: Vercel
**Cost**: FREE
- 100 GB bandwidth/month
- Global Edge Network
- Automatic SSL
- Instant rollbacks

#### Backend: Railway
**Cost**: FREE ($5 credit/month, ~500 hours)
- Persistent disk for SQLite
- 512 MB RAM
- No cold starts on free tier
- Automatic SSL

**Pros**:
- Best frontend performance (Vercel Edge)
- Railway keeps backend always warm (within free hours)
- Excellent developer experience

**Cons**:
- Two platforms to manage
- Railway free tier has monthly hour limit

---

### Option C: All-in-One Free Alternatives

#### 1. Fly.io
- **Frontend + Backend**: Single deployment
- **Free Tier**: 3 shared-cpu VMs, 3GB storage
- **Persistent volumes** for SQLite included
- **Pros**: No cold starts, persistent storage, global regions
- **Cons**: Requires Dockerfile, slightly more complex setup

#### 2. Netlify + Render
- **Frontend**: Netlify (100GB bandwidth, auto SSL)
- **Backend**: Render (same as Option A)
- **Similar to Vercel + Railway** but different platforms

---

## 📋 Detailed Implementation: Render.com (Recommended)

### Phase 1: Preparation

#### 1.1 Update Backend for Production
Create `backend/render-build.sh`:
```bash
#!/bin/bash
# Install dependencies
npm install

# Create database directory
mkdir -p db

# Initialize database
node -e "require('./db/database.js')"
```

#### 1.2 Update Backend Configuration
Add to `backend/server.js` (health check endpoint exists already):
```javascript
// Already has /health endpoint
```

#### 1.3 Create `render.yaml` (Infrastructure as Code)
```yaml
services:
  # Backend Service
  - type: web
    name: watchornot-backend
    runtime: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: SESSION_SECRET
        generateValue: true
      - key: TMDB_API_KEY
        sync: false # Set manually in Render dashboard
      - key: CLAUDE_API_KEY
        sync: false # Set manually in Render dashboard
      - key: OMDB_API_KEY
        sync: false # Set manually in Render dashboard
      - key: FRONTEND_URL
        value: https://watchornot.onrender.com # Update after frontend deploy
    disk:
      name: watchornot-data
      mountPath: /opt/render/project/src/backend/db
      sizeGB: 1

  # Frontend Static Site
  - type: web
    name: watchornot-frontend
    runtime: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    envVars:
      - key: NODE_ENV
        value: production
```

### Phase 2: Backend Deployment

#### Step 1: Prepare Repository
```bash
# Ensure .gitignore excludes sensitive files
echo "backend/.env" >> .gitignore
echo "backend/db/*.db" >> .gitignore
echo "backend/db/*.db-*" >> .gitignore
```

#### Step 2: Deploy Backend on Render
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - **Name**: `watchornot-backend`
   - **Runtime**: Node
   - **Root Directory**: `backend`
   - **Build Command**: `npm install` ⚠️ **Important**: Render may auto-suggest `npm install; npm run build` - override it to just `npm install` (backend has no build step)
   - **Start Command**: `npm start`
   - **Plan**: Free

#### Step 3: Add Environment Variables
In Render dashboard, add:
- `NODE_ENV=production`
- `PORT=3001`
- `SESSION_SECRET=[auto-generate in Render]`
- `TMDB_API_KEY=[your TMDB key]`
- `CLAUDE_API_KEY=[your Claude API key]`
- `OMDB_API_KEY=[your OMDB key]`
- `FRONTEND_URL=https://watchornot.onrender.com` (update later)

#### Step 4: Enable Persistent Disk
1. In service settings → "Disks"
2. Add disk:
   - **Name**: `watchornot-db`
   - **Mount Path**: `/opt/render/project/src/backend/db`
   - **Size**: 1 GB (free)

#### Step 5: Deploy
- Click "Create Web Service"
- Wait 3-5 minutes for deployment
- Note the backend URL: `https://watchornot-backend.onrender.com`

### Phase 3: Frontend Deployment

#### Step 1: Update Frontend Config
Update `src/App.jsx`:
```javascript
// Change BACKEND_URL based on environment
const BACKEND_URL = import.meta.env.PROD
  ? 'https://watchornot-backend.onrender.com'
  : 'http://localhost:3001';
```

#### Step 2: Deploy Frontend on Render
1. Click "New +" → "Static Site"
2. Connect same repository
3. Configure:
   - **Name**: `watchornot`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

#### Step 3: Update Backend CORS
Update backend environment variable:
- `FRONTEND_URL=https://watchornot.onrender.com`

#### Step 4: Redeploy Backend
- In backend service, click "Manual Deploy" → "Deploy latest commit"

### Phase 4: Verification

#### Test Checklist:
- [ ] Frontend loads: `https://watchornot.onrender.com`
- [ ] Backend health: `https://watchornot-backend.onrender.com/health`
- [ ] API calls work (check browser console)
- [ ] Image upload works
- [ ] Movie search works
- [ ] Ratings persist across sessions

---

## 💰 Cost Analysis

### Monthly Costs: ~$0-5 (depending on usage)

| Service | Free Tier | Usage | Cost |
|---------|-----------|-------|------|
| Render Backend | 750 hrs/mo | ~730 hrs (24/7) | $0 |
| Render Frontend | 100 GB bandwidth | ~5-10 GB | $0 |
| TMDB API | 1000 req/day | ~100-500/day | $0 |
| OMDB API | 1000 req/day | ~50-200/day | $0 |
| Claude API* | $5 free credit | ~10-50 images/day | ~$0-5/mo |
| SQLite Storage | 1 GB | ~50 MB | $0 |
| **TOTAL** | | | **~$0-5/month** |

**Note**: Claude API is the only paid service, but provides $5 free credit for new accounts.
- Image recognition costs ~$0.03-0.10 per image (depending on size/model)
- $5 covers ~50-150 image recognitions
- After free credit, typical usage: $2-5/month for light usage

### Cost Optimization Tips:
- Limit image recognition to authenticated users
- Cache image recognition results
- Consider switching to free OCR alternatives (Tesseract.js) for basic text detection

### When You'll Need to Upgrade:
- **Backend**: >10k monthly active users (due to cold starts)
- **TMDB API**: >1000 requests/day (rate limiting)
- **OMDB API**: >1000 requests/day (rate limiting)
- **Claude API**: After free credit exhausted or with heavy image usage
- **Storage**: >1 GB database (unlikely for months)

---

## 🚀 Quick Start Commands

### One-Time Setup
```bash
# 1. Commit current changes
git add .
git commit -m "Prepare for production deployment"
git push origin main

# 2. Get API keys (all free except Claude)
# TMDB: https://www.themoviedb.org/settings/api
# Claude: https://console.anthropic.com/ (paid API, $5 free credit for new accounts)
# OMDB: https://www.omdbapi.com/apikey.aspx (free tier: 1000 requests/day)

# 3. Sign up for Render
# Visit: https://render.com (use GitHub)

# 4. Follow Phase 2 & 3 above
```

### Future Deployments
```bash
# Make changes, then:
git add .
git commit -m "Your changes"
git push origin main

# Render auto-deploys! ✨
```

---

## 🔧 Alternative Free Options Comparison

| Platform | Frontend | Backend | Database | Cold Starts | Bandwidth |
|----------|----------|---------|----------|-------------|-----------|
| **Render** | ✅ CDN | ✅ 750h | ✅ 1GB disk | 50s (15min idle) | 100 GB |
| **Vercel + Railway** | ✅ Edge | ✅ 500h | ✅ 1GB disk | 0s (Railway) | 100 GB |
| **Fly.io** | ✅ Global | ✅ 3 VMs | ✅ 3GB | 0s | Unlimited |
| **Netlify + Render** | ✅ CDN | ✅ 750h | ✅ 1GB disk | 50s | 100 GB |

**Recommendation**: Start with **Render** (easiest), switch to **Fly.io** if cold starts become an issue.

---

## 📊 Monitoring & Maintenance

### Free Monitoring Options:
1. **Render Dashboard**: View logs, metrics, deployments
2. **UptimeRobot**: Free uptime monitoring (50 monitors)
   - Ping your app every 5 min to prevent cold starts
3. **Better Stack**: Free error tracking (50k events/month)

### Preventing Cold Starts (Free):
```bash
# Use UptimeRobot to ping every 14 minutes
# Add monitor: https://watchornot-backend.onrender.com/health
# This keeps your backend warm 24/7 (free)
```

---

## 🔐 Security Checklist

- [ ] Environment variables set (not in code)
- [ ] CORS configured with specific frontend URL
- [ ] Rate limiting enabled (already in code)
- [ ] HTTPS enabled (automatic on Render)
- [ ] API keys never exposed to frontend
- [ ] SQLite database not in git
- [ ] Session secret is strong random string

---

## 📈 Scaling Path (When You Grow)

### Stage 1: Free Tier (0-1k users)
- Current setup works perfectly
- $0/month

### Stage 2: Light Production (1k-10k users)
- Upgrade Render backend to paid tier: $7/month
- No cold starts, always warm
- 512 MB → 2 GB RAM

### Stage 3: Growth (10k-100k users)
- Move to Fly.io or Railway: ~$15-30/month
- Add Redis for session storage
- Add Cloudflare CDN (free)
- Consider PostgreSQL instead of SQLite

### Stage 4: Scale (100k+ users)
- AWS/GCP with auto-scaling: ~$100-500/month
- Separate database server
- Multiple regions
- Load balancing

---

## 🎓 Next Steps

1. **Complete Phase 1-3** (Deploy to Render)
2. **Test thoroughly** (Phase 4 checklist)
3. **Set up monitoring** (UptimeRobot)
4. **Share with users** 🎉
5. **Monitor usage** and upgrade when needed

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **TMDB API Docs**: https://developers.themoviedb.org/3
- **This Repo**: Check README.md for development setup

---

**Estimated Setup Time**: 30-45 minutes
**Monthly Cost**: $0
**Maintenance**: Minimal (auto-deploys from Git)

Good luck with your deployment! 🚀
