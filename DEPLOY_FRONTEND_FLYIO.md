# Deploy Frontend to Fly.io

This guide shows how to deploy the **WatchOrNot frontend** to Fly.io, alongside the backend that's already running there.

---

## 🎯 What You'll Get

- ✅ Frontend and backend both on Fly.io
- ✅ Fast, globally distributed CDN
- ✅ Automatic HTTPS
- ✅ No cold starts
- ✅ Free tier: 3 shared-cpu VMs

---

## 📋 Prerequisites

1. **Fly CLI installed** (see below)
2. **Fly.io account** (free, credit card required for verification)
3. **Backend already deployed** to Fly.io at `watchornot-backend.fly.dev`

---

## 🚀 Quick Start (5 minutes)

### Option 1: Using the deployment script

```bash
# From project root
./deploy-frontend-flyio.sh
```

The script will:
1. Check if Fly CLI is installed
2. Check if you're logged in
3. Create the app (if needed)
4. Deploy the frontend
5. Show you the URL

### Option 2: Manual deployment

```bash
# 1. Launch the app (first time only)
fly launch --now

# Answer the prompts:
# - App name: watchornot-frontend (or your choice)
# - Region: sjc (or closest to you)
# - Database: No
# - Deploy now: Yes

# 2. For subsequent deployments
fly deploy
```

---

## 📁 Files Created

The following files have been set up for you:

### `Dockerfile`
- Multi-stage build using Node.js and nginx
- Builds the Vite app
- Serves static files via nginx on port 8080

### `fly.toml`
- Fly.io configuration
- Sets `VITE_BACKEND_URL` to point to your backend
- Health check on `/health`
- Auto-scaling configuration

### `nginx.conf`
- Nginx server configuration
- SPA routing (all routes serve `index.html`)
- Gzip compression
- Security headers
- Cache control for static assets

---

## 🔧 Configuration Details

### Backend URL

The frontend is configured to connect to:
```
https://watchornot-backend.fly.dev
```

This is set in `fly.toml` under `[build.args]`:
```toml
[build.args]
  VITE_BACKEND_URL = "https://watchornot-backend.fly.dev"
```

If your backend is at a different URL, update this value in `fly.toml` before deploying.

### Memory & Resources

The frontend uses minimal resources:
- **Memory**: 256 MB
- **CPU**: 1 shared CPU
- **Auto-stop**: Yes (when idle)
- **Auto-start**: Yes (on request)

This should stay well within Fly.io's free tier.

---

## 🔄 Update Backend CORS

After deploying the frontend, update your backend to allow requests from the new frontend URL:

```bash
cd backend
fly secrets set FRONTEND_URL="https://watchornot-frontend.fly.dev"
```

This will automatically redeploy the backend (takes 2-3 minutes).

---

## 📊 Deployment Commands

### Deploy updates
```bash
fly deploy
```

### View logs
```bash
fly logs
```

### Check status
```bash
fly status
```

### Open app in browser
```bash
fly open
```

### Scale (if needed)
```bash
# Keep at least 1 instance always running
fly scale count 1 --min-machines-running 1

# Or allow auto-scaling (default)
fly scale count 1 --min-machines-running 0
```

### SSH into the container (for debugging)
```bash
fly ssh console
```

---

## 🧪 Testing Your Deployment

After deployment:

1. **Visit your frontend**:
   ```
   https://watchornot-frontend.fly.dev
   ```

2. **Test the app**:
   - Upload a movie poster image
   - Search for movies
   - Rate some movies
   - Refresh - ratings should persist!

3. **Check health endpoint**:
   ```bash
   curl https://watchornot-frontend.fly.dev/health
   ```

---

## 💰 Cost Breakdown

| Component | Cost |
|-----------|------|
| Frontend (Fly.io) | $0 |
| Backend (Fly.io) | $0 |
| Database (1 GB volume) | $0 |
| TMDB API (1000 req/day) | $0 |
| OMDB API (1000 req/day) | $0 |
| Claude API ($5 credit) | ~$0-5 |
| **Total** | **~$0-5/month** |

Free tier limits:
- 3 shared-cpu VMs total (1 for frontend, 1 for backend)
- 3 GB persistent storage
- 160 GB outbound data transfer/month

---

## 🐛 Troubleshooting

### Build fails

```bash
# Check build logs
fly logs

# Common issues:
# - Make sure package.json and package-lock.json are committed
# - Verify vite.config.js has correct settings
# - Check that dist folder is created during build
```

### App not accessible

```bash
# Check app status
fly status

# Should show: running

# Check recent logs
fly logs

# Restart the app if needed
fly apps restart watchornot-frontend
```

### Backend connection issues

1. Check that backend URL is correct in `fly.toml`
2. Verify backend is running: `curl https://watchornot-backend.fly.dev/health`
3. Make sure backend CORS is updated with frontend URL

### Environment variables not working

Vite environment variables must be set at **build time**, not runtime. They're configured in `fly.toml` under `[build.args]`:

```toml
[build.args]
  VITE_BACKEND_URL = "https://watchornot-backend.fly.dev"
```

After changing, redeploy:
```bash
fly deploy
```

---

## 🔄 Updating Your App

When you make code changes:

```bash
# 1. Commit your changes
git add .
git commit -m "Your changes"
git push

# 2. Deploy to Fly.io
fly deploy
```

The deployment takes 2-3 minutes and includes:
1. Building the Docker image
2. Installing dependencies
3. Building the Vite app
4. Deploying to Fly.io
5. Health checks

---

## 🌍 Custom Domain (Optional)

To use your own domain:

```bash
# Add a certificate
fly certs add yourdomain.com

# Add DNS records (shown in output):
# - A record: @ -> [Fly.io IP]
# - AAAA record: @ -> [Fly.io IPv6]

# Check certificate status
fly certs show yourdomain.com
```

---

## 📈 Monitoring

### Fly.io Dashboard
- Visit: https://fly.io/dashboard/watchornot-frontend
- View metrics, logs, and deployment history

### Health Checks
The app includes a `/health` endpoint that Fly.io checks every 30 seconds.

### External Monitoring (Optional)
- [UptimeRobot](https://uptimerobot.com) - Free pings every 5 min
- [Better Stack](https://betterstack.com) - Error tracking

---

## 🔒 Security

The nginx configuration includes:
- HTTPS enforcement
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- Gzip compression
- Long-term caching for static assets

---

## 🚀 Production Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend CORS updated with frontend URL
- [ ] Test image upload and movie search
- [ ] Test movie ratings and persistence
- [ ] Check health endpoints
- [ ] Set up monitoring (optional)
- [ ] Configure custom domain (optional)

---

## 📚 Additional Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Fly.io Community Forum](https://community.fly.io/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)

---

## 🆘 Support

If you run into issues:

1. Check the logs: `fly logs`
2. Check the docs: https://fly.io/docs
3. Ask the community: https://community.fly.io
4. Create an issue on GitHub

---

**Deployment time**: 5-10 minutes
**Monthly cost**: ~$0 (free tier)
**Production-ready**: ✅ Yes

Your WatchOrNot app is now fully deployed on Fly.io! 🎉
