# Deploy to Railway (Free with Persistent Storage)

**Alternative to Fly.io - Easier setup, includes persistent storage**

---

## Why Railway?

✅ **Free tier includes:**
- $5 monthly credit (≈500 execution hours)
- Persistent volumes included
- No cold starts (within free hours)
- Easier than Fly.io (no Dockerfile needed)
- Auto-deploys from GitHub

❌ **Limitations:**
- Only ~500 hours/month (~16-17 hours/day)
- Credit card required for verification

---

## Prerequisites

1. **GitHub account**
2. **API Keys** (see main QUICK_DEPLOY.md)
3. **Credit card** (for verification, no charges for free tier)
4. **Time**: 30 minutes

---

## Step 1: Sign Up for Railway (5 minutes)

1. Go to [railway.app](https://railway.app)
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway to access your GitHub
4. Add credit card for verification (won't be charged on free tier)

---

## Step 2: Deploy Backend (10 minutes)

### 2.1 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `watchornot-app` repository

### 2.2 Configure Service
Railway will detect your Node.js app automatically.

1. Click on the deployed service
2. Go to **"Settings"** tab
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Watch Paths**: `backend/**`

### 2.3 Add Environment Variables
1. Go to **"Variables"** tab
2. Click **"Add Variable"** or **"Raw Editor"**
3. Add the following:

```
NODE_ENV=production
PORT=3001
SESSION_SECRET=<click "Generate" button or paste your own>
TMDB_API_KEY=your_tmdb_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here
OMDB_API_KEY=your_omdb_api_key_here
FRONTEND_URL=https://watchornot.onrender.com
```

**Note**: We'll update `FRONTEND_URL` after deploying frontend.

### 2.4 Add Persistent Volume
1. Go to **"Volumes"** tab
2. Click **"New Volume"**
3. Configure:
   - **Mount Path**: `/app/backend/db`
   - **Size**: 1 GB

Railway will automatically redeploy.

### 2.5 Get Your Backend URL
1. Go to **"Settings"** tab
2. Scroll to **"Domains"**
3. Click **"Generate Domain"**
4. Your URL will be: `https://watchornot-backend-production-XXXX.up.railway.app`

### 2.6 Test Backend
Visit: `https://your-backend-url.railway.app/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 123
}
```

---

## Step 3: Deploy Frontend (10 minutes)

**Use Render, Vercel, or Netlify for frontend** (all have free static site hosting)

### Option A: Render (Recommended)
1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Static Site"**
3. Select your repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Deploy!

Your frontend URL: `https://watchornot.onrender.com`

---

## Step 4: Update Backend CORS (2 minutes)

1. Go back to Railway dashboard
2. Open your backend service
3. Go to **"Variables"** tab
4. Update `FRONTEND_URL` to your actual frontend URL:
   ```
   FRONTEND_URL=https://watchornot.onrender.com
   ```
5. Railway will auto-redeploy (takes 1-2 minutes)

---

## Step 5: Test Your App (3 minutes)

1. Visit your frontend URL
2. Upload an image or search for movies
3. Rate some movies
4. Refresh - ratings should persist! ✅

---

## Railway Management

### View Logs
1. Click on your service
2. Go to **"Deployments"** tab
3. Click latest deployment
4. View logs in real-time

### Monitor Usage
1. Go to project dashboard
2. Check **"Usage"** section
3. See hours used and remaining credit

### Redeploy
Railway auto-deploys when you push to GitHub. Manual redeploy:
1. Go to **"Deployments"** tab
2. Click **"Deploy"** on any previous deployment

---

## Cost Breakdown

| Component | Cost |
|-----------|------|
| Railway Backend | $0 (within free hours) |
| Render Frontend | $0 |
| Database Storage | $0 (included) |
| TMDB API | $0 |
| OMDB API | $0 |
| Claude API | ~$0-5 |
| **Total** | **~$0-5/month** |

**Note**: Railway provides $5 credit (~500 hours). If you exceed this:
- Pay-as-you-go: ~$0.01/hour
- ~$7.50 for 24/7 operation

---

## Troubleshooting

### App not responding
- Check if you're within 500 free hours
- View logs for errors
- Verify environment variables are set

### Database not persisting
- Ensure volume is mounted at `/app/backend/db`
- Check volume status in "Volumes" tab

### Running out of free hours
Options:
1. Add payment method to continue (pay-as-you-go)
2. Switch to Fly.io (no hour limits)
3. Optimize to use fewer hours

---

## Comparison: Railway vs Fly.io

| Feature | Railway | Fly.io |
|---------|---------|--------|
| **Setup** | ⭐ Easy | Medium |
| **Free Hours** | 500/month | Unlimited |
| **Storage** | ✅ 1 GB | ✅ 3 GB |
| **Cold Starts** | ❌ No | ❌ No |
| **Dockerfile** | ❌ Not needed | ✅ Required |
| **Best For** | Quick setup | 24/7 availability |

---

## Next Steps

1. ✅ Backend deployed on Railway with persistent storage
2. ✅ Frontend deployed on Render/Vercel/Netlify
3. ✅ Database persists across deployments
4. ✅ Monitor usage to stay within free tier

**Your app is live!** 🚀

---

## Support

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Project Issues**: Create issue on GitHub

---

**Deployment time**: 30 minutes
**Monthly cost**: ~$0-5 (within free hours)
**Production-ready**: ✅ Yes (within usage limits)
