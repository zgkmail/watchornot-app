#!/bin/bash

# WatchOrNot App Icon Generator
# Generates all required iOS app icon sizes from SVG source

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}WatchOrNot App Icon Generator${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if ImageMagick or rsvg-convert is installed
if ! command -v convert &> /dev/null && ! command -v rsvg-convert &> /dev/null; then
    echo -e "${RED}Error: Neither ImageMagick nor rsvg-convert found.${NC}"
    echo ""
    echo "Please install one of the following:"
    echo ""
    echo "Option 1 - ImageMagick (recommended):"
    echo "  macOS: brew install imagemagick"
    echo "  Linux: sudo apt-get install imagemagick"
    echo ""
    echo "Option 2 - librsvg:"
    echo "  macOS: brew install librsvg"
    echo "  Linux: sudo apt-get install librsvg2-bin"
    echo ""
    exit 1
fi

# Prompt user to select concept
echo "Available icon concepts:"
echo "  1) Concept 1 - Camera + Film Strip (cinematic)"
echo "  4) Concept 4 - Minimalist W + Camera (RECOMMENDED - clean, scalable)"
echo ""
read -p "Which concept would you like to use? [1/4]: " CONCEPT

case $CONCEPT in
    1)
        SOURCE_SVG="concept-1-camera-filmstrip.svg"
        echo -e "${GREEN}Selected: Concept 1 - Camera + Film Strip${NC}"
        ;;
    4)
        SOURCE_SVG="concept-4-minimalist-w.svg"
        echo -e "${GREEN}Selected: Concept 4 - Minimalist W + Camera (Recommended)${NC}"
        ;;
    *)
        echo -e "${RED}Invalid selection. Using Concept 4 (recommended).${NC}"
        SOURCE_SVG="concept-4-minimalist-w.svg"
        ;;
esac

# Check if source file exists
if [ ! -f "$SOURCE_SVG" ]; then
    echo -e "${RED}Error: Source file '$SOURCE_SVG' not found.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Generating app icons from: $SOURCE_SVG${NC}"
echo ""

# Function to generate PNG from SVG
generate_icon() {
    local size=$1
    local filename=$2

    echo -e "  Generating ${size}x${size} → ${filename}"

    if command -v rsvg-convert &> /dev/null; then
        # Use rsvg-convert (better quality for SVG)
        rsvg-convert -w $size -h $size "$SOURCE_SVG" -o "$filename"
    else
        # Use ImageMagick
        convert -background none -resize ${size}x${size} "$SOURCE_SVG" "$filename"
    fi
}

# Generate all required sizes for iOS
echo "Generating iPhone icons..."
generate_icon 40 "icon-20@2x.png"
generate_icon 60 "icon-20@3x.png"
generate_icon 58 "icon-29@2x.png"
generate_icon 87 "icon-29@3x.png"
generate_icon 80 "icon-40@2x.png"
generate_icon 120 "icon-40@3x.png"
generate_icon 120 "icon-60@2x.png"
generate_icon 180 "icon-60@3x.png"

echo ""
echo "Generating iPad icons..."
generate_icon 20 "icon-20.png"
generate_icon 40 "icon-20@2x-ipad.png"
generate_icon 29 "icon-29.png"
generate_icon 58 "icon-29@2x-ipad.png"
generate_icon 40 "icon-40.png"
generate_icon 80 "icon-40@2x-ipad.png"
generate_icon 76 "icon-76.png"
generate_icon 152 "icon-76@2x.png"
generate_icon 167 "icon-83.5@2x.png"

echo ""
echo "Generating App Store icon..."
generate_icon 1024 "icon-1024.png"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ All icons generated successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Generated files:"
ls -lh icon-*.png 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
echo ""
echo "Next steps:"
echo "  1. Review the generated icons (especially icon-1024.png)"
echo "  2. Update Contents.json with the new filenames"
echo "  3. Open Xcode and verify icons appear correctly"
echo "  4. Test on device at all sizes"
echo ""
echo -e "${BLUE}Tip: Open icon-1024.png to preview the App Store icon:${NC}"
echo "  open icon-1024.png"
echo ""
