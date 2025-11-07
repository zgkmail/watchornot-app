# Quick Deployment Guide

This is a simplified guide to deploy WatchOrNot to production in under 30 minutes for FREE.

For the complete deployment plan with alternatives, see [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md).

---

## Prerequisites

1. GitHub account
2. TMDB API key (free) - Get it from: https://www.themoviedb.org/settings/api
3. 30 minutes of your time

---

## Deployment Steps (Render.com - Recommended)

### Step 1: Prepare Your Code (5 minutes)

```bash
# 1. Ensure everything is committed
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Deploy Backend (10 minutes)

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Select your `watchornot-app` repository
4. Configure the service:
   - **Name**: `watchornot-backend`
   - **Runtime**: Node
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `SESSION_SECRET` = [Click "Generate" button]
   - `TMDB_API_KEY` = [Your TMDB API key]
   - `FRONTEND_URL` = `https://watchornot.onrender.com` (we'll update this after frontend is deployed)

6. Enable Persistent Disk:
   - Scroll down to **"Disks"** section
   - Click **"Add Disk"**
   - **Name**: `watchornot-db`
   - **Mount Path**: `/opt/render/project/src/backend/db`
   - **Size**: 1 GB (free)

7. Click **"Create Web Service"**
8. Wait 3-5 minutes for deployment
9. Note your backend URL: `https://watchornot-backend-XXXX.onrender.com`

### Step 3: Deploy Frontend (10 minutes)

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Select your `watchornot-app` repository
3. Configure:
   - **Name**: `watchornot`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Click **"Create Static Site"**
5. Wait 2-3 minutes for deployment
6. Your app is live at: `https://watchornot.onrender.com` 🎉

### Step 4: Update Backend CORS (2 minutes)

1. Go back to your backend service settings
2. Update environment variables:
   - `FRONTEND_URL` = `https://watchornot.onrender.com` (use your actual frontend URL)
3. Click **"Save Changes"**
4. Backend will auto-redeploy (takes 2-3 minutes)

### Step 5: Test Your App (3 minutes)

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
6. Just add your `TMDB_API_KEY` in environment variables

---

## Cost

**Total: $0/month** 🎉

- Render Backend: Free (750 hours/month)
- Render Frontend: Free (100 GB bandwidth/month)
- TMDB API: Free (1000 requests/day)

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
