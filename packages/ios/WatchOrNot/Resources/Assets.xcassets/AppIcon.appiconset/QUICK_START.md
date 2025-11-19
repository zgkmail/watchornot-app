# App Icon Quick Start Guide

## TL;DR - Get Icons in 5 Minutes

### Step 1: Choose Your Design

**Concept 4 - Minimalist W** (RECOMMENDED ⭐)
- Clean, scalable, modern
- File: `concept-4-minimalist-w.svg`
- Best for: Professional brand recognition

**Concept 1 - Camera + Film**
- Cinematic, detailed
- File: `concept-1-camera-filmstrip.svg`
- Best for: Literal movie/camera representation

### Step 2: Generate Icons

```bash
cd packages/ios/WatchOrNot/Resources/Assets.xcassets/AppIcon.appiconset

# Install tool (one time only)
brew install librsvg

# Run generator
./generate-icons.sh

# Choose concept when prompted (recommend: 4)
```

### Step 3: Verify

```bash
# Check generated files
ls -lh icon-*.png

# Preview the App Store icon
open icon-1024.png
```

### Step 4: Test in Xcode

1. Open `WatchOrNot.xcodeproj`
2. Check app icon appears in project settings
3. Build and run on device
4. Verify home screen icon looks good

---

## Don't Have librsvg? Use Online Tool

1. Open `concept-4-minimalist-w.svg` in browser
2. Take screenshot or export to PNG (1024x1024)
3. Upload to https://appicon.co/
4. Download generated zip
5. Extract PNGs to this folder

---

## What You Get

✅ 18 PNG files in all required iOS sizes
✅ Ready for Xcode immediately
✅ App Store compliant (no transparency, correct format)
✅ Optimized for all device displays

---

## Files Created

After running the generator:

```
icon-20.png           (20x20 - iPad notification)
icon-20@2x.png        (40x40 - iPhone notification)
icon-20@2x-ipad.png   (40x40 - iPad notification @2x)
icon-20@3x.png        (60x60 - iPhone notification @3x)
icon-29.png           (29x29 - iPad settings)
icon-29@2x.png        (58x58 - iPhone settings)
icon-29@2x-ipad.png   (58x58 - iPad settings @2x)
icon-29@3x.png        (87x87 - iPhone settings @3x)
icon-40.png           (40x40 - iPad spotlight)
icon-40@2x.png        (80x80 - iPhone spotlight)
icon-40@2x-ipad.png   (80x80 - iPad spotlight @2x)
icon-40@3x.png        (120x120 - iPhone spotlight @3x)
icon-60@2x.png        (120x120 - iPhone app)
icon-60@3x.png        (180x180 - iPhone app @3x)
icon-76.png           (76x76 - iPad app)
icon-76@2x.png        (152x152 - iPad app @2x)
icon-83.5@2x.png      (167x167 - iPad Pro)
icon-1024.png         (1024x1024 - App Store ⭐)
```

---

## Why Concept 4 is Recommended

| Feature | Concept 1 | Concept 4 ⭐ |
|---------|-----------|-------------|
| Scalability | Good | Excellent |
| Recognition | Camera focus | Brand focus |
| Uniqueness | Common theme | Unique |
| Timeless | Good | Excellent |
| Small sizes (20x20) | Busy | Perfect |
| App Store standout | Moderate | High |

**Bottom line:** Concept 4 will look better on users' home screens and age better over time.

---

## Troubleshooting

**"Command not found: rsvg-convert"**
```bash
brew install librsvg
```

**"Icons not in Xcode"**
- Clean build (Cmd+Shift+K)
- Restart Xcode
- Check Contents.json has filenames

**"Want to change colors"**
- Edit the .svg file (it's just text)
- Change hex color codes
- Re-run generator

---

## Next Step After Icons

Once icons are done, move on to:
1. **Screenshots** - Capture 4-6 key app screens
2. **Marketing Copy** - App description and keywords
3. **Privacy Policy** - Required for submission

See the main guide: `/docs/05-ios-specific/app-store-submission.md`

---

Need help? Check:
- `README.md` - Full icon guide with design details
- `DESIGN_CONCEPTS.md` - All concept descriptions and SVG code
- `generate-icons.sh` - The automated generator script
