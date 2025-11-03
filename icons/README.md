# CineSense App Icons

This directory contains app icons for the CineSense PWA (Progressive Web App).

## Required Icon Sizes

The following icon sizes are needed for full iOS and Android support:

- `icon-72.png` (72x72) - Android
- `icon-96.png` (96x96) - Android
- `icon-120.png` (120x120) - iOS
- `icon-128.png` (128x128) - Android
- `icon-144.png` (144x144) - Android
- `icon-152.png` (152x152) - iOS
- `icon-180.png` (180x180) - iOS (iPhone)
- `icon-192.png` (192x192) - Android, PWA
- `icon-384.png` (384x384) - Android
- `icon-512.png` (512x512) - Android, PWA (splash screen)

## How to Generate Icons

### Option 1: Use the Icon Generator HTML

1. Open `generate-icons.html` in a web browser
2. Follow the instructions to create icons manually or with ImageMagick

### Option 2: Online Icon Generator

Use a service like [RealFaviconGenerator](https://realfavicongenerator.net/) or [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator):

1. Create a 512x512 source image with the CineSense camera logo
2. Upload to the service
3. Download the generated icons
4. Place them in this directory

### Option 3: ImageMagick Command Line

If you have a source 512x512 PNG image:

```bash
cd icons

# Generate all required sizes
for size in 72 96 120 128 144 152 180 192 384 512; do
  convert source-icon-512.png -resize ${size}x${size} icon-${size}.png
done
```

### Option 4: Node.js Sharp Library

```bash
npm install sharp

# Create a script to generate icons
node generate-icons.js
```

Example `generate-icons.js`:
```javascript
const sharp = require('sharp');
const sizes = [72, 96, 120, 128, 144, 152, 180, 192, 384, 512];

sizes.forEach(size => {
  sharp('source-icon-512.png')
    .resize(size, size)
    .toFile(`icon-${size}.png`)
    .then(() => console.log(`Generated icon-${size}.png`))
    .catch(err => console.error(err));
});
```

## Icon Design Guidelines

- Use a simple, recognizable camera or movie-related icon
- Background: Blue gradient (#1e3a8a to #3b82f6) or solid black (#000000)
- Icon/symbol: White (#ffffff)
- Ensure the icon is visible at small sizes (72x72)
- Leave adequate padding around the icon (safe area: 10% margin)
- For maskable icons (192.png and 512.png), use a 80% safe zone

## Testing Icons

To test your icons:

1. Add icons to this directory
2. Deploy the app to a web server (localhost or production)
3. Open in Mobile Safari (iOS) or Chrome (Android)
4. Add to Home Screen
5. Check that the icon appears correctly

## Placeholder Icons

For development/testing, you can create simple solid color placeholder icons:

```bash
# Create a solid blue 512x512 icon (requires ImageMagick)
convert -size 512x512 xc:'#3b82f6' icon-512.png

# Generate all sizes from this placeholder
for size in 72 96 120 128 144 152 180 192 384; do
  convert icon-512.png -resize ${size}x${size} icon-${size}.png
done
```
