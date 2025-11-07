# Deploy to Fly.io (Free with Persistent Storage)

**This guide shows how to deploy WatchOrNot to Fly.io completely FREE with persistent database storage.**

---

## Why Fly.io?

✅ **Free tier includes:**
- 3 shared-cpu VMs (1 per app)
- 3 GB persistent storage
- 160 GB outbound data transfer
- No cold starts (stays warm)
- Better performance than Render free tier

❌ **Downsides:**
- Requires Dockerfile (slightly more complex)
- Need to install Fly CLI

---

## Prerequisites

1. **GitHub account**
2. **API Keys** (see main QUICK_DEPLOY.md for details):
   - TMDB API key (free)
   - Claude API key ($5 free credit)
   - OMDB API key (free)
3. **Credit card** (required for Fly.io verification, but no charges for free tier)
4. **Time**: 45-60 minutes

---

## Step 1: Install Fly CLI (5 minutes)

### macOS / Linux
```bash
curl -L https://fly.io/install.sh | sh
```

### Windows (PowerShell)
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Verify installation
```bash
fly version
```

---

## Step 2: Sign Up and Login (5 minutes)

```bash
# Sign up (opens browser)
fly auth signup

# Or login if you have an account
fly auth login
```

**Note**: You'll need to add a credit card for verification, but you won't be charged for free tier usage.

---

## Step 3: Deploy Backend to Fly.io (15 minutes)

### 3.1 Navigate to backend directory
```bash
cd backend
```

### 3.2 Launch Fly app (interactive setup)
```bash
fly launch
```

**Answer the prompts:**
- **App Name**: `watchornot-backend` (or choose your own unique name)
- **Region**: Choose closest to you (e.g., `iad` for Washington DC)
- **Would you like to set up a Postgresql database?**: **No**
- **Would you like to set up an Upstash Redis database?**: **No**
- **Create .dockerignore from .gitignore?**: **Yes**
- **Would you like to deploy now?**: **No** (we need to add secrets first)

This creates `fly.toml` configuration file.

### 3.3 Create persistent volume for database
```bash
fly volumes create data --size 1
```

**Note**: This creates a 1 GB volume named "data" for your SQLite database (free).

### 3.4 Set environment secrets
```bash
# Generate session secret
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Set all secrets at once
fly secrets set \
  NODE_ENV=production \
  SESSION_SECRET="$SESSION_SECRET" \
  TMDB_API_KEY="your_tmdb_api_key_here" \
  CLAUDE_API_KEY="your_claude_api_key_here" \
  OMDB_API_KEY="your_omdb_api_key_here" \
  FRONTEND_URL="https://watchornot.onrender.com"
```

**Replace** `your_*_api_key_here` with your actual API keys.

**Note**: We'll update `FRONTEND_URL` after deploying the frontend.

### 3.5 Update fly.toml (if needed)

The `fly.toml` file should already be configured correctly, but verify it has:

```toml
[mounts]
  source = "data"
  destination = "/data"
```

**Note**: The database will be stored at `/data/watchornot.db` on the persistent volume.

### 3.6 Deploy!
```bash
fly deploy
```

**Wait 3-5 minutes** for deployment to complete.

### 3.7 Get your backend URL
```bash
fly info
```

Your backend URL will be: `https://watchornot-backend.fly.dev`

### 3.8 Test backend health
```bash
curl https://watchornot-backend.fly.dev/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 123
}
```

---

## Step 4: Deploy Frontend (10 minutes)

**Option A: Fly.io (NEW - Keep everything on Fly.io!)**

Deploy the frontend to Fly.io alongside the backend:

```bash
# From project root
./deploy-frontend-flyio.sh
```

Or manually:
```bash
fly launch --now
fly deploy
```

Your frontend will be at: `https://watchornot-frontend.fly.dev`

📖 **See [DEPLOY_FRONTEND_FLYIO.md](DEPLOY_FRONTEND_FLYIO.md) for detailed instructions.**

**Option B: Render (Alternative)**

Frontend can still use Render's free static site hosting:

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Static Site"**
3. Select your repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Deploy!

**Option C: Vercel (Alternative)**

```bash
# From project root
npx vercel --prod
```

**Option D: Netlify (Alternative)**

```bash
# From project root
npx netlify deploy --prod
```

---

## Step 5: Update Backend CORS (5 minutes)

After deploying frontend, update the backend's `FRONTEND_URL`:

```bash
cd backend

# Update with your actual frontend URL
fly secrets set FRONTEND_URL="https://watchornot.onrender.com"
```

This will automatically redeploy the backend (takes 2-3 minutes).

---

## Step 6: Test Your App (5 minutes)

1. Visit your frontend URL
2. Try uploading a movie poster image
3. Search for movies
4. Rate some movies
5. Refresh page - ratings should persist! ✅

---

## Fly.io Management Commands

### View logs
```bash
cd backend
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

### SSH into your app
```bash
fly ssh console
```

### Check volume
```bash
fly volumes list
```

### Scale (if needed)
```bash
# Scale to always have 1 instance running (uses more resources)
fly scale count 1
```

---

## Cost Breakdown

| Component | Provider | Cost |
|-----------|----------|------|
| Frontend | Render/Vercel/Netlify | $0 |
| Backend | Fly.io | $0 |
| Database (1 GB) | Fly.io Volume | $0 |
| TMDB API | 1000 req/day | $0 |
| OMDB API | 1000 req/day | $0 |
| Claude API | $5 free credit | ~$0-5 |
| **Total** | | **~$0-5/month** |

---

## Troubleshooting

### Deployment fails with "no machines available"
```bash
# Check your machines
fly machines list

# Restart the machine
fly machines restart <machine-id>
```

### Database not persisting
```bash
# Check volume is mounted
fly volumes list

# Should show: data | 1GB | attached
```

### App not accessible
```bash
# Check app status
fly status

# View recent logs
fly logs
```

### Environment variables not working
```bash
# List all secrets
fly secrets list

# Set a specific secret
fly secrets set KEY=value
```

### Need to redeploy
```bash
cd backend
fly deploy
```

---

## Updating Your App

```bash
# Make changes to your code
git add .
git commit -m "Your changes"
git push

# Redeploy to Fly.io
cd backend
fly deploy
```

---

## Monitoring & Maintenance

### Free monitoring with Fly.io dashboard
- Visit: https://fly.io/dashboard
- View metrics, logs, and health status

### Optional: External monitoring
- [UptimeRobot](https://uptimerobot.com) (free) - ping every 5 min
- [Better Stack](https://betterstack.com) (free tier) - error tracking

---

## Scaling & Upgrade Path

### Current free tier
- 1 VM with shared CPU
- 256 MB RAM
- 3 GB storage
- Perfect for MVP and testing

### When to upgrade
- **>1,000 active users**: Scale to 2+ VMs (~$5-10/month)
- **Need more RAM**: Upgrade to 512 MB or 1 GB RAM
- **Need more storage**: Add more volume space
- **Global presence**: Deploy to multiple regions

---

## Comparison: Fly.io vs Render Free Tier

| Feature | Fly.io Free | Render Free |
|---------|-------------|-------------|
| **Persistent Storage** | ✅ 3 GB | ❌ Not available |
| **Cold Starts** | ❌ No cold starts | ⚠️ 50s after 15 min idle |
| **Always On** | ✅ Yes | ⚠️ Sleeps when idle |
| **RAM** | 256 MB | 512 MB |
| **Setup Complexity** | Medium (Dockerfile) | Easy (auto-detect) |
| **Best For** | Production apps | Testing & MVP |

---

## Next Steps

1. ✅ Backend deployed on Fly.io with persistent storage
2. ✅ Frontend deployed on Render/Vercel/Netlify
3. ✅ Database persists across deployments
4. ✅ No cold starts - always responsive

**Your app is now production-ready!** 🚀

---

## Support

- **Fly.io Docs**: https://fly.io/docs
- **Fly.io Community**: https://community.fly.io
- **Project Issues**: Create issue on GitHub

---

**Deployment time**: 45-60 minutes
**Monthly cost**: ~$0-5 (only Claude API)
**Production-ready**: ✅ Yes
