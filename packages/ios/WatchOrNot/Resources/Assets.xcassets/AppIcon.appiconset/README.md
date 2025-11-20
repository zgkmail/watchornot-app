# WatchOrNot App Icon Guide

## Quick Start

### Option 1: Use the Generator Script (Recommended)

```bash
cd packages/ios/WatchOrNot/Resources/Assets.xcassets/AppIcon.appiconset

# Install dependencies (if needed)
brew install librsvg  # macOS
# or
# sudo apt-get install librsvg2-bin  # Linux

# Run the generator
./generate-icons.sh

# Follow the prompts to select a design concept
```

The script will generate all 17 required icon sizes automatically!

---

### Option 2: Use Online Tool

1. Open the SVG files in this folder:
   - `concept-1-camera-filmstrip.svg` - Cinematic camera/film design
   - `concept-4-minimalist-w.svg` - **RECOMMENDED** - Clean, scalable "W" design

2. Visit one of these online generators:
   - https://appicon.co/
   - https://www.appicon.build/
   - https://makeappicon.com/

3. Upload your chosen SVG (or convert to 1024x1024 PNG first)

4. Download the generated icon set

5. Replace the files in this folder

---

## Design Concepts

### 🎬 Concept 1: Camera + Film Strip
**Visual:** Camera viewfinder with film strip corner accents
- **Style:** Cinematic, professional
- **Colors:** Dark blue/navy background, gold camera, red film accents
- **Best for:** If you want literal movie/camera representation
- **File:** `concept-1-camera-filmstrip.svg`

**Pros:**
- Instantly communicates "movie camera"
- Professional look
- Eye-catching

**Cons:**
- Slightly more complex (might lose detail at 20x20)
- More elements to balance

---

### ✨ Concept 4: Minimalist W + Camera (RECOMMENDED)
**Visual:** Bold "W" lettermark with subtle camera aperture overlay
- **Style:** Modern, minimalist, Apple-esque
- **Colors:** Purple gradient background, white "W"
- **Best for:** Brand recognition, scalability, timeless design
- **File:** `concept-4-minimalist-w.svg`

**Pros:**
- ✅ Perfect scalability (works great at 20x20)
- ✅ Instant brand recognition ("W" for WatchOrNot)
- ✅ Modern and clean
- ✅ Won't look dated in 2-3 years
- ✅ Unique in App Store
- ✅ Professional

**Cons:**
- Less literal (doesn't scream "movies" immediately)
- Relies on simplicity (some prefer more detail)

**Why I recommend this:** The App Store is full of literal camera/film icons. A clean lettermark will stand out AND scale perfectly to all sizes.

---

## Required Icon Sizes

When you generate icons, you need these exact sizes:

| Size (pt) | Scale | Pixels | Usage | Filename |
|-----------|-------|--------|-------|----------|
| 20x20 | @2x | 40x40 | iPhone Notification | icon-20@2x.png |
| 20x20 | @3x | 60x60 | iPhone Notification | icon-20@3x.png |
| 29x29 | @2x | 58x58 | iPhone Settings | icon-29@2x.png |
| 29x29 | @3x | 87x87 | iPhone Settings | icon-29@3x.png |
| 40x40 | @2x | 80x80 | iPhone Spotlight | icon-40@2x.png |
| 40x40 | @3x | 120x120 | iPhone Spotlight | icon-40@3x.png |
| 60x60 | @2x | 120x120 | iPhone App | icon-60@2x.png |
| 60x60 | @3x | 180x180 | iPhone App | icon-60@3x.png |
| 20x20 | @1x | 20x20 | iPad Notification | icon-20.png |
| 20x20 | @2x | 40x40 | iPad Notification | icon-20@2x-ipad.png |
| 29x29 | @1x | 29x29 | iPad Settings | icon-29.png |
| 29x29 | @2x | 58x58 | iPad Settings | icon-29@2x-ipad.png |
| 40x40 | @1x | 40x40 | iPad Spotlight | icon-40.png |
| 40x40 | @2x | 80x80 | iPad Spotlight | icon-40@2x-ipad.png |
| 76x76 | @1x | 76x76 | iPad App | icon-76.png |
| 76x76 | @2x | 152x152 | iPad App | icon-76@2x.png |
| 83.5x83.5 | @2x | 167x167 | iPad Pro | icon-83.5@2x.png |
| 1024x1024 | @1x | 1024x1024 | **App Store** | icon-1024.png |

**Total:** 18 files needed

---

## Design Requirements (Apple Guidelines)

✅ **Required:**
- No transparency (must have solid background)
- No alpha channel
- RGB color space (not CMYK)
- 72 DPI minimum
- PNG format
- Square (1:1 aspect ratio)

❌ **Avoid:**
- Don't add rounded corners (iOS does this automatically)
- Don't include Apple hardware (iPhone, iPad silhouettes)
- Don't use Apple system icons
- Don't include text (icon should work without it)
- Don't use screenshots or photos
- Don't violate trademarks

💡 **Best Practices:**
- Test at smallest size (20x20) first - if it works there, it works everywhere
- Use simple shapes that are recognizable
- Ensure sufficient contrast
- Make sure icon works in dark and light backgrounds
- Preview on actual device

---

## After Generating Icons

### 1. Update Contents.json

The `Contents.json` file in this directory maps icon files to their sizes. After generating icons, ensure it references your new files correctly.

Example entry:
```json
{
  "filename" : "icon-60@3x.png",
  "idiom" : "iphone",
  "scale" : "3x",
  "size" : "60x60"
}
```

### 2. Verify in Xcode

1. Open `WatchOrNot.xcodeproj` in Xcode
2. Navigate to the project settings → General tab
3. Check "App Icons and Launch Screen" section
4. All icon slots should be filled (no missing icons)

### 3. Test on Device

Build and install on a physical device, then check:
- Home screen icon (60x60 @2x or @3x)
- Settings icon (29x29)
- Spotlight icon (40x40)
- Notification icon (20x20)

Screenshot each size to verify quality.

### 4. Prepare for App Store

The 1024x1024 `icon-1024.png` will be used in:
- App Store listing
- TestFlight
- App Store Connect

Make sure this one looks perfect!

---

## Color Palette Reference

If you want to customize the colors in the SVG files:

### Concept 1 Colors:
- Background gradient: `#1a1a2e` → `#16213e`
- Camera/lens: `#ffd700` (gold)
- Film strips: `#e94560` (red)
- Focus points: `#00d4ff` (cyan)

### Concept 4 Colors (Recommended):
- Background gradient: `#667eea` → `#764ba2` (purple)
- W lettermark: `#ffffff` (white)
- Aperture overlay: white with opacity

To change colors, edit the SVG file and modify the `stop-color` values in the `<linearGradient>` section.

---

## Customization Tips

### Want to tweak the designs?

1. **Edit SVG directly:**
   - SVG files are just text! Open in any text editor
   - Modify colors by changing hex codes
   - Adjust sizes by changing coordinates
   - Save and regenerate

2. **Use a design tool:**
   - Open SVG in Figma (free)
   - Open SVG in Adobe Illustrator
   - Open SVG in Inkscape (free)
   - Make changes visually
   - Export as SVG or PNG

3. **Try color variations:**
   - App Store has millions of blue icons - consider other colors
   - Purple = premium/creative
   - Red = cinema/passion
   - Gold = quality/awards
   - Dark = sophisticated/modern

---

## Testing Checklist

Before submitting to App Store:

- [ ] All 18 icon sizes generated
- [ ] No transparency in any icon
- [ ] 1024x1024 icon is perfect quality
- [ ] Icons visible on both light and dark backgrounds
- [ ] Tested on actual iPhone (not just simulator)
- [ ] Icons look good at 20x20 (smallest size)
- [ ] No pixelation or artifacts
- [ ] Colors match brand identity
- [ ] Unique enough to stand out in App Store

---

## Troubleshooting

### Icons not showing in Xcode?
1. Clean build folder (Cmd+Shift+K)
2. Delete DerivedData folder
3. Restart Xcode
4. Verify Contents.json has correct filenames

### Icons look blurry?
- Make sure you generated from SVG at exact sizes (not scaled from wrong size)
- Use `rsvg-convert` instead of ImageMagick for better quality
- Check that source SVG is clean (no compression artifacts)

### App Store reject icon?
- Verify no transparency (use PNG, not PNG with alpha)
- Check it's exactly 1024x1024 pixels
- Ensure it's RGB color mode (not CMYK)
- Make sure it's under 512 KB file size

### Want to change icon after submission?
- Generate new set
- Update Contents.json
- Increment build number
- Upload new build to App Store Connect
- Icon updates don't require full app review (just new build)

---

## Resources

### Design Tools
- **Figma** (free): https://figma.com
- **Inkscape** (free): https://inkscape.org
- **Sketch** (paid, Mac): https://sketch.com
- **Adobe Illustrator** (paid): https://adobe.com/illustrator

### Icon Generators
- https://appicon.co/ - Upload 1024x1024, get all sizes
- https://www.appicon.build/ - Similar functionality
- https://makeappicon.com/ - Includes Android too

### References
- [Apple Human Interface Guidelines - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [App Icon Generator (Official Specs)](https://developer.apple.com/design/resources/)

---

## Next Steps

1. **Choose a concept** (I recommend Concept 4)
2. **Run the generator script** or use online tool
3. **Review generated icons** (check icon-1024.png especially)
4. **Update Contents.json** (if needed)
5. **Open in Xcode** and verify
6. **Test on device**
7. **Commit to git**

Need to make changes? Just edit the SVG and regenerate!

---

**Questions?** Check the main submission guide at:
`/docs/05-ios-specific/app-store-submission.md`
