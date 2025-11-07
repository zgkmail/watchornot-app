# Deployment Checklist ✅

Use this checklist to ensure a smooth deployment.

---

## Pre-Deployment

### 1. Get API Keys
- [ ] Sign up for TMDB account: https://www.themoviedb.org/signup
- [ ] Get TMDB API key: https://www.themoviedb.org/settings/api
- [ ] Test API key locally (in backend/.env)

### 2. Choose Platform
- [ ] Review [DEPLOYMENT_OPTIONS.md](DEPLOYMENT_OPTIONS.md)
- [ ] Choose platform: **Render.com** (recommended) or other
- [ ] Create account on chosen platform(s)

### 3. Repository Setup
- [ ] All changes committed
- [ ] `.env` files NOT in git (check .gitignore)
- [ ] Code pushed to GitHub
- [ ] Repository is public or platform has access

---

## Deployment Steps (Render.com)

### Backend Deployment
- [ ] Create Render account with GitHub
- [ ] Create new Web Service
- [ ] Connect repository
- [ ] Configure build & start commands
- [ ] Add environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
  - [ ] `SESSION_SECRET` (generate new)
  - [ ] `TMDB_API_KEY` (your key)
  - [ ] `FRONTEND_URL` (update after frontend deploy)
- [ ] Add persistent disk (1 GB)
  - [ ] Mount path: `/opt/render/project/src/backend/db`
- [ ] Deploy backend
- [ ] Wait for deployment to complete (3-5 min)
- [ ] Note backend URL

### Frontend Deployment
- [ ] Create Static Site on Render
- [ ] Connect same repository
- [ ] Configure build command
- [ ] Deploy frontend
- [ ] Wait for deployment to complete (2-3 min)
- [ ] Note frontend URL

### Final Configuration
- [ ] Update backend `FRONTEND_URL` with actual frontend URL
- [ ] Redeploy backend (auto after env var change)
- [ ] Wait for backend redeploy (2-3 min)

---

## Testing

### Basic Tests
- [ ] Frontend loads at your URL
- [ ] No console errors in browser
- [ ] Backend health check: `https://your-backend.onrender.com/health`

### Functionality Tests
- [ ] Camera/upload button appears
- [ ] Can upload image (test with movie poster)
- [ ] Search works
- [ ] Can view movie details
- [ ] Can rate movies
- [ ] Ratings persist after refresh

### Mobile Tests (Optional)
- [ ] Test on mobile browser
- [ ] Camera works
- [ ] Responsive layout looks good
- [ ] Touch interactions work

---

## Post-Deployment

### Optional Enhancements
- [ ] Set up UptimeRobot to prevent cold starts
  - Service: https://uptimerobot.com
  - Monitor URL: `https://your-backend.onrender.com/health`
  - Interval: 14 minutes
- [ ] Add custom domain (if desired)
- [ ] Set up analytics (Google Analytics, etc.)
- [ ] Add monitoring (Sentry, LogRocket, etc.)

### Documentation
- [ ] Update README with production URLs
- [ ] Document any environment-specific settings
- [ ] Share app with users! 🎉

---

## Troubleshooting Guide

### Frontend Issues

#### "Can't connect to backend"
- [ ] Check backend URL in browser console logs
- [ ] Verify backend is deployed and running
- [ ] Check CORS settings in backend
- [ ] Verify `FRONTEND_URL` matches actual frontend URL

#### "Page not found" on refresh
- [ ] Ensure static site has redirect rules (included in render.yaml)
- [ ] Check deployment logs

### Backend Issues

#### Health check failing
- [ ] Check backend logs in Render dashboard
- [ ] Verify build completed successfully
- [ ] Check environment variables are set

#### Database errors
- [ ] Verify persistent disk is mounted
- [ ] Check disk path: `/opt/render/project/src/backend/db`
- [ ] Review backend logs for specific errors

#### API key errors
- [ ] Verify TMDB_API_KEY is set correctly
- [ ] Test API key with curl:
  ```bash
  curl "https://api.themoviedb.org/3/movie/550?api_key=YOUR_KEY"
  ```

### Performance Issues

#### Slow initial load (backend)
- [ ] Normal on free tier (50s cold start after 15 min idle)
- [ ] Set up UptimeRobot to keep warm
- [ ] Consider upgrading to paid tier for instant response

#### Slow image processing
- [ ] Normal for large images
- [ ] Consider adding image compression
- [ ] Check Claude API rate limits

---

## Rollback Procedure

If something goes wrong:

1. Check the deployment logs
2. Review environment variables
3. If needed, rollback in Render dashboard:
   - Go to service → "Events"
   - Find last working deployment
   - Click "Redeploy"

---

## Monitoring

### Regular Checks
- [ ] Weekly: Check uptime (Render dashboard or UptimeRobot)
- [ ] Monthly: Review usage (requests, bandwidth)
- [ ] As needed: Check error logs

### Metrics to Watch
- Response times
- Error rates
- API quota usage (TMDB)
- Storage usage (database size)

---

## Upgrade Path

### When to upgrade from free tier:

1. **User complaints about cold starts**
   - Upgrade backend to paid tier: $7/month
   - Gets you: No sleep, 2GB RAM, priority support

2. **High traffic (>10k users/month)**
   - Consider dedicated hosting
   - Add CDN (Cloudflare free tier)
   - Scale database (PostgreSQL)

3. **Need advanced features**
   - Custom domains (free but limited)
   - More compute resources
   - Better monitoring/analytics

---

## Success Criteria ✨

Your deployment is successful when:

- ✅ App loads at production URL
- ✅ All features work (search, rate, view details)
- ✅ No errors in console
- ✅ Data persists across sessions
- ✅ Mobile works (if tested)
- ✅ You can share the link with others!

---

## Next Steps After Deployment

1. **Share your app**: Post on social media, share with friends
2. **Gather feedback**: Ask users to test and report issues
3. **Monitor usage**: Keep an eye on analytics
4. **Plan improvements**: Add features based on feedback
5. **Maintain**: Regular updates and bug fixes

---

## Need Help?

- **Quick Start**: [QUICK_DEPLOY.md](QUICK_DEPLOY.md) - 30 min deployment
- **Full Guide**: [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md) - Complete details
- **Platform Comparison**: [DEPLOYMENT_OPTIONS.md](DEPLOYMENT_OPTIONS.md)
- **Render Support**: https://render.com/docs
- **TMDB API Docs**: https://developers.themoviedb.org/3

---

**Good luck with your deployment! 🚀🎬**
