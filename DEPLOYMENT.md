# WatchOrNot Deployment Guide

This guide provides comprehensive instructions for deploying the WatchOrNot application to various platforms.

## Quick Links

- **Quick Start**: [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - 30-minute deployment guide
- **Platform Comparison**: [DEPLOYMENT_OPTIONS.md](./DEPLOYMENT_OPTIONS.md) - Compare different hosting options
- **Deployment Checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Platform-Specific Guides](#platform-specific-guides)
4. [Post-Deployment](#post-deployment)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. **API Keys** (obtain these first):
   - [TMDB API Key](https://www.themoviedb.org/settings/api) - Required
   - [Anthropic Claude API Key](https://console.anthropic.com/) - Required for image recognition
   - [OMDB API Key](https://www.omdbapi.com/apikey.aspx) - Required for ratings

2. **Accounts** on your chosen platform(s):
   - Fly.io (recommended for full-stack)
   - Vercel/Netlify (frontend only)
   - Render (full-stack alternative)
   - Railway (full-stack alternative)

## Environment Variables

### Backend (.env)
```bash
# Required
SESSION_SECRET=<generate-with-crypto>  # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
TMDB_API_KEY=<your-tmdb-key>

# Optional but recommended
CLAUDE_API_KEY=<your-claude-key>       # For image recognition
OMDB_API_KEY=<your-omdb-key>           # For movie ratings

# Production settings
NODE_ENV=production
PORT=8080                              # Or platform default
FRONTEND_URL=<your-frontend-url>       # For CORS
DATABASE_PATH=/data                    # For persistent storage

# Logging
LOG_LEVEL=info                         # debug | info | warn | error | none
```

### Frontend
```bash
VITE_BACKEND_URL=<your-backend-url>    # Required in production
```

## Platform-Specific Guides

### Fly.io (Recommended)

**Best for**: Full-stack deployment with persistent database

**Guides**:
- Backend: [FLY_DEPLOY.md](./FLY_DEPLOY.md)
- Frontend: [DEPLOY_FRONTEND_FLYIO.md](./DEPLOY_FRONTEND_FLYIO.md)

**Pros**:
- Free tier available
- Persistent volumes for SQLite
- Global CDN
- Easy scaling

**Estimated Cost**: $5-10/month

### Vercel (Frontend) + Fly.io (Backend)

**Best for**: Optimized frontend performance

**Steps**:
1. Deploy backend to Fly.io (see FLY_DEPLOY.md)
2. Deploy frontend to Vercel:
   ```bash
   vercel --prod
   ```
3. Set `VITE_BACKEND_URL` in Vercel dashboard

**Estimated Cost**: Free (Vercel) + $5/month (Fly.io backend)

### Render

**Best for**: Simple full-stack deployment

**Guide**: [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md) - See Render section

**Steps**:
1. Connect GitHub repository
2. Use `render.yaml` for configuration
3. Set environment variables in dashboard

**Estimated Cost**: $7-96/month

### Railway

**Best for**: Developer-friendly deployment

**Guide**: [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)

**Steps**:
1. Install Railway CLI
2. Run `railway init`
3. Deploy with `railway up`

**Estimated Cost**: Pay-as-you-go

### Netlify (Frontend Only)

**Best for**: Static frontend hosting

**Steps**:
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set `VITE_BACKEND_URL` environment variable

**Estimated Cost**: Free tier available

## Post-Deployment

### 1. Health Check
```bash
# Backend
curl https://your-backend-url.com/health

# Expected: {"status":"ok","message":"WatchOrNot Backend is running"}
```

### 2. Test API Endpoints
```bash
# Test TMDB search
curl https://your-backend-url.com/api/tmdb/search?query=inception

# Test session
curl https://your-backend-url.com/api/session
```

### 3. Monitor Logs
- Fly.io: `flyctl logs`
- Render: Check dashboard
- Railway: `railway logs`

### 4. Verify Database
- Check that ratings are persisted
- Test user sessions across restarts
- Verify cleanup runs daily

## Troubleshooting

### Common Issues

**1. CORS Errors**
- Ensure `FRONTEND_URL` matches your actual frontend URL exactly
- Check browser console for rejected origin
- Verify environment variables are set

**2. Database Not Persisting**
- Verify persistent volume is mounted (Fly.io)
- Check `DATABASE_PATH` environment variable
- Ensure `/data` directory has write permissions

**3. API Keys Not Working**
- Verify keys are set in platform environment variables
- Check for typos or extra spaces
- Test keys independently with curl

**4. Build Failures**
- Check Node version (requires 18+)
- Verify all dependencies are installed
- Check build logs for specific errors

**5. Session Issues**
- Verify `SESSION_SECRET` is set
- Check session database is writable
- Ensure cookies are enabled in browser

### Getting Help

1. Check platform-specific guides above
2. Review [DEBUG_GUIDE.md](./DEBUG_GUIDE.md)
3. Check application logs
4. Verify environment variables

## Security Checklist

Before going live:

- [ ] All API keys are set as environment variables (not hardcoded)
- [ ] `SESSION_SECRET` is cryptographically secure
- [ ] `NODE_ENV=production` is set
- [ ] CORS `FRONTEND_URL` is configured correctly
- [ ] Rate limiting is enabled (default: on)
- [ ] HTTPS is enabled (automatic on most platforms)
- [ ] Database backups are configured
- [ ] Monitoring/logging is set up

## Monitoring

### Recommended Metrics

- Response times
- Error rates
- API quota usage (TMDB, Claude, OMDB)
- Database size
- Memory usage

### Log Levels

Set `LOG_LEVEL` environment variable:
- `debug`: Development (verbose)
- `info`: Production default
- `warn`: Warnings only
- `error`: Errors only
- `none`: Disable logging

## Scaling

### Horizontal Scaling
- Fly.io: `flyctl scale count 2`
- Render: Increase instance count in dashboard
- Railway: Auto-scales based on traffic

### Vertical Scaling
- Fly.io: `flyctl scale vm shared-cpu-2x`
- Render: Upgrade instance type
- Railway: Configure resource limits

## Backup Strategy

### Database Backups
1. **Automated**: Use platform backup features
2. **Manual**: Download `/data/watchornot.db` periodically
3. **Frequency**: Daily recommended

### Environment Variables
- Keep `.env.example` updated
- Document all required variables
- Store production values securely (password manager)

## Cost Optimization

1. **Use free tiers** where possible
2. **Cache API responses** (implemented)
3. **Monitor quota usage** for external APIs
4. **Set appropriate rate limits**
5. **Use SQLite** instead of managed databases (saves $5-20/month)

## Additional Resources

- [Setup Guide](./SETUP.md) - Local development setup
- [Testing Guide](./TESTING.md) - How to test the application
- [README](./README.md) - Project overview and features

---

**Last Updated**: 2025-11-10
