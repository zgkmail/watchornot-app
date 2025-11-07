# Quick Deployment Guide

⚠️ **IMPORTANT UPDATE**: Render's free tier no longer supports persistent storage (databases).

**Recommended alternatives with FREE persistent storage:**
- **[Fly.io](FLY_DEPLOY.md)** - Best for 24/7 apps, requires Dockerfile
- **[Railway](RAILWAY_DEPLOY.md)** - Easiest setup, 500 free hours/month

For the complete deployment plan with all alternatives, see [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md).

---

## Prerequisites

1. **GitHub account**
2. **API Keys**:
   - TMDB (free) - https://www.themoviedb.org/settings/api
   - Claude AI ($5 free credit) - https://console.anthropic.com/
   - OMDB (free) - https://www.omdbapi.com/apikey.aspx
3. **Time**: 30-45 minutes

---

## ⚠️ Render Free Tier Limitation

**Render removed persistent disk support from free tier**, which means:
- ❌ Your SQLite database won't persist across restarts
- ❌ All user ratings will be lost on every redeploy
- ❌ **Not suitable for production use**

### Your Options:

1. **Fly.io (Recommended)** - See [FLY_DEPLOY.md](FLY_DEPLOY.md)
   - ✅ 3 GB persistent storage (free)
   - ✅ No cold starts
   - ✅ 24/7 availability
   - ⚠️ Requires Dockerfile

2. **Railway** - See [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md)
   - ✅ Persistent storage (free)
   - ✅ Easier setup
   - ⚠️ 500 hours/month limit (~16-17 hrs/day)

3. **Render Paid ($7/month)**
   - ✅ Persistent storage included
   - ✅ No cold starts
   - 💰 $7/month

---

## Original Render Instructions (Not Recommended for Production)

### Step 1: Get API Keys (10 minutes)

Before deploying, obtain all three API keys:

**TMDB API (Free)**
1. Sign up at https://www.themoviedb.org/signup
2. Go to https://www.themoviedb.org/settings/api
3. Request API key (instant approval)

**Claude API ($5 free credit)**
1. Sign up at https://console.anthropic.com/
2. Go to Account Settings → API Keys
3. Create new API key
4. Note: $5 credit covers ~50-150 image recognitions

**OMDB API (Free - 1000/day)**
1. Go to https://www.omdbapi.com/apikey.aspx
2. Select "FREE" plan
3. Verify your email to activate

### Step 2: Prepare Your Code (2 minutes)

```bash
# Ensure everything is committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 3: Deploy Backend (10 minutes)

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Select your `watchornot-app` repository
4. Configure the service:
   - **Name**: `watchornot-backend`
   - **Runtime**: Node
   - **Root Directory**: `backend`
   - **Build Command**: `npm install` (⚠️ Render may suggest `npm install; npm run build` - change it to just `npm install`)
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `SESSION_SECRET` = [Click "Generate" button]
   - `TMDB_API_KEY` = [Your TMDB API key]
   - `CLAUDE_API_KEY` = [Your Claude API key]
   - `OMDB_API_KEY` = [Your OMDB API key]
   - `FRONTEND_URL` = `https://watchornot.onrender.com` (we'll update this after frontend is deployed)

6. ⚠️ **Skip Persistent Disk** (not available on free tier)
   - **WARNING**: Without persistent disk, your database will be deleted on every restart
   - This setup is **only for testing**, not production use

7. Click **"Create Web Service"**
8. Wait 3-5 minutes for deployment
9. Note your backend URL: `https://watchornot-backend-XXXX.onrender.com`

### Step 4: Deploy Frontend (10 minutes)

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Select your `watchornot-app` repository
3. Configure:
   - **Name**: `watchornot`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Click **"Create Static Site"**
5. Wait 2-3 minutes for deployment
6. Your app is live at: `https://watchornot.onrender.com` 🎉

### Step 5: Update Backend CORS (2 minutes)

1. Go back to your backend service settings
2. Update environment variables:
   - `FRONTEND_URL` = `https://watchornot.onrender.com` (use your actual frontend URL)
3. Click **"Save Changes"**
4. Backend will auto-redeploy (takes 2-3 minutes)

### Step 6: Test Your App (3 minutes)

1. Visit `https://watchornot.onrender.com`
2. Try uploading an image or searching for a movie
3. Rate some movies
4. Verify everything works!

---

## Alternative: One-Click Deploy with render.yaml

If you prefer automated setup:

1. Push the `render.yaml` file to your repository
2. Go to Render dashboard
3. Click **"New +"** → **"Blueprint"**
4. Select your repository
5. Render will create both services automatically!
6. Just add your API keys (`TMDB_API_KEY`, `CLAUDE_API_KEY`, `OMDB_API_KEY`) in environment variables

---

## Cost

**Total: ~$0-5/month**

- Render Backend: Free (750 hours/month)
- Render Frontend: Free (100 GB bandwidth/month)
- TMDB API: Free (1000 requests/day)
- OMDB API: Free (1000 requests/day)
- Claude API: $5 free credit, then ~$2-5/month for light usage (~$0.03-0.10 per image)

---

## Important Notes

### Cold Starts
- Free tier backend sleeps after 15 minutes of inactivity
- First request after sleep takes ~50 seconds to wake up
- Subsequent requests are fast

**Solution**: Use [UptimeRobot](https://uptimerobot.com) (free) to ping your backend every 14 minutes to keep it warm:
- Add monitor for: `https://your-backend.onrender.com/health`
- Interval: 14 minutes

### Custom Domain (Optional)
- Both frontend and backend support custom domains for FREE
- Go to service settings → Domains → Add custom domain
- Follow DNS instructions

---

## Updating Your App

After initial deployment, updates are automatic:

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin main

# Render auto-deploys! ✨
# Takes 2-5 minutes
```

---

## Troubleshooting

### Backend Health Check
Visit: `https://your-backend.onrender.com/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123
}
```

### Frontend Can't Reach Backend
1. Check browser console for CORS errors
2. Verify `FRONTEND_URL` environment variable in backend
3. Ensure backend is deployed and running
4. Check backend logs in Render dashboard

### Database Issues
1. Verify persistent disk is mounted at `/opt/render/project/src/backend/db`
2. Check backend logs for database errors
3. Disk should be 1 GB

---

## What's Next?

1. **Monitor**: Set up UptimeRobot to prevent cold starts
2. **Custom Domain**: Add your own domain (optional)
3. **Analytics**: Add Google Analytics or similar (optional)
4. **Share**: Share your app with friends! 🎬

---

## Need Help?

- **Render Documentation**: https://render.com/docs
- **TMDB API Docs**: https://developers.themoviedb.org/3
- **Project README**: See [README.md](README.md)
- **Full Deployment Guide**: See [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md)

---

**Congrats on deploying your app! 🚀**
