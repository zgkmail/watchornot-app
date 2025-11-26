# GitHub Pages Setup Guide

This guide explains how to host the Privacy Policy page on GitHub Pages.

## Quick Start

Your Privacy Policy is located at:
```
docs/privacy/index.html
```

Once GitHub Pages is enabled, it will be accessible at:
```
https://[your-github-username].github.io/watchornot-app/privacy/
```

## Step-by-Step Setup

### 1. Push Your Changes

First, commit and push the privacy policy files:

```bash
git add docs/privacy/index.html docs/_config.yml docs/GITHUB_PAGES_SETUP.md
git commit -m "feat: Add Privacy Policy page for App Store submission"
git push origin main
```

### 2. Enable GitHub Pages

1. Go to your GitHub repository: `https://github.com/[your-username]/watchornot-app`
2. Click on **Settings** (top navigation)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select:
   - **Branch**: `main`
   - **Folder**: `/docs`
5. Click **Save**

### 3. Wait for Deployment

- GitHub Pages will take 1-2 minutes to build and deploy
- You'll see a green checkmark when ready
- Your Privacy Policy will be live at: `https://[your-username].github.io/watchornot-app/privacy/`

### 4. Verify the URL

Test your Privacy Policy page:
```
https://[your-username].github.io/watchornot-app/privacy/
```

## Using the Privacy Policy URL in App Store Connect

When submitting your app to the App Store:

1. Go to **App Information** in App Store Connect
2. Find **Privacy Policy URL** field
3. Enter: `https://[your-username].github.io/watchornot-app/privacy/`
4. Save your changes

## Custom Domain (Optional)

If you want to use a custom domain (e.g., `watchorskip.app`):

1. Purchase a domain from a domain registrar
2. Create a `CNAME` file in the `docs` directory:
   ```bash
   echo "watchorskip.app" > docs/CNAME
   ```
3. Add DNS records at your domain registrar:
   - Type: `CNAME`
   - Name: `www` (or `@` for apex domain)
   - Value: `[your-username].github.io`
4. In GitHub Settings > Pages, enter your custom domain
5. Enable "Enforce HTTPS"

Then your Privacy Policy will be at:
```
https://watchorskip.app/privacy/
```

## Updating the Privacy Policy

To update the privacy policy:

1. Edit `docs/privacy/index.html`
2. Update the "Last Updated" date
3. Commit and push changes:
   ```bash
   git add docs/privacy/index.html
   git commit -m "docs: Update Privacy Policy"
   git push origin main
   ```
4. Changes will be live within 1-2 minutes

## Troubleshooting

### Page Not Found (404)

- Wait 2-3 minutes after enabling GitHub Pages
- Check that `/docs` folder is selected in Settings
- Verify the URL includes `/privacy/` at the end

### Changes Not Showing

- GitHub Pages caches content
- Hard refresh your browser: `Cmd+Shift+R` (Mac) or `Ctrl+F5` (Windows)
- Check the Actions tab for build status

### Custom Domain Not Working

- Verify DNS records are correct (use `dig` or `nslookup`)
- DNS propagation can take up to 48 hours
- Make sure CNAME file contains only the domain name

## Privacy Policy Checklist for App Store

Before submitting to the App Store, verify:

- [ ] Privacy Policy is publicly accessible (no login required)
- [ ] URL uses HTTPS (GitHub Pages provides this automatically)
- [ ] Policy covers all data collection practices
- [ ] Policy mentions third-party services (TMDB, OMDb, Claude, AdMob)
- [ ] Policy explains how users can delete their data
- [ ] Policy is written in English (or your app's primary language)
- [ ] "Last Updated" date is current
- [ ] Contact email is valid and monitored

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [App Store Review Guidelines - Privacy](https://developer.apple.com/app-store/review/guidelines/#privacy)
- [Apple Privacy Policy Requirements](https://developer.apple.com/app-store/app-privacy-details/)

## Support

For questions about this setup, contact: support@watchorskip.app
