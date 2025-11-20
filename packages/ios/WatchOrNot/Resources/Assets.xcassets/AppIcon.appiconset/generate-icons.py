#!/usr/bin/env python3
"""
WatchOrNot App Icon Generator (Python version)
Generates all required iOS app icon sizes from SVG source
"""

import os
import sys
from pathlib import Path

try:
    import cairosvg
except ImportError:
    print("Error: cairosvg not installed")
    print("Install with: pip3 install cairosvg")
    sys.exit(1)


def generate_icon(svg_path, size, output_path):
    """Generate PNG icon from SVG at specified size"""
    print(f"  Generating {size}x{size} → {output_path}")
    cairosvg.svg2png(
        url=str(svg_path),
        write_to=str(output_path),
        output_width=size,
        output_height=size
    )


def main():
    print("=" * 50)
    print("WatchOrNot App Icon Generator")
    print("=" * 50)
    print()

    # Concept options
    concepts = {
        "1": {
            "name": "Concept 1 - Camera + Film Strip (cinematic)",
            "file": "concept-1-camera-filmstrip.svg"
        },
        "4": {
            "name": "Concept 4 - Minimalist W + Camera (RECOMMENDED - clean, scalable)",
            "file": "concept-4-minimalist-w.svg"
        }
    }

    print("Available icon concepts:")
    for key, concept in concepts.items():
        print(f"  {key}) {concept['name']}")
    print()

    # Get user choice
    choice = input("Which concept would you like to use? [1/4]: ").strip()

    if choice not in concepts:
        print(f"Invalid selection. Using Concept 4 (recommended).")
        choice = "4"

    concept = concepts[choice]
    source_svg = Path(concept["file"])

    if not source_svg.exists():
        print(f"Error: Source file '{source_svg}' not found.")
        sys.exit(1)

    print(f"\nSelected: {concept['name']}")
    print(f"Generating app icons from: {source_svg}")
    print()

    # Define all required icon sizes
    icon_sizes = [
        # iPhone
        (40, "icon-20@2x.png"),
        (60, "icon-20@3x.png"),
        (58, "icon-29@2x.png"),
        (87, "icon-29@3x.png"),
        (80, "icon-40@2x.png"),
        (120, "icon-40@3x.png"),
        (120, "icon-60@2x.png"),
        (180, "icon-60@3x.png"),

        # iPad
        (20, "icon-20.png"),
        (40, "icon-20@2x-ipad.png"),
        (29, "icon-29.png"),
        (58, "icon-29@2x-ipad.png"),
        (40, "icon-40.png"),
        (80, "icon-40@2x-ipad.png"),
        (76, "icon-76.png"),
        (152, "icon-76@2x.png"),
        (167, "icon-83.5@2x.png"),

        # App Store
        (1024, "icon-1024.png"),
    ]

    # Generate iPhone icons
    print("Generating iPhone icons...")
    for size, filename in icon_sizes[:8]:
        generate_icon(source_svg, size, Path(filename))

    # Generate iPad icons
    print("\nGenerating iPad icons...")
    for size, filename in icon_sizes[8:17]:
        generate_icon(source_svg, size, Path(filename))

    # Generate App Store icon
    print("\nGenerating App Store icon...")
    size, filename = icon_sizes[17]
    generate_icon(source_svg, size, Path(filename))

    print()
    print("=" * 50)
    print("✓ All icons generated successfully!")
    print("=" * 50)
    print()

    # Show generated files
    print("Generated files:")
    for _, filename in icon_sizes:
        path = Path(filename)
        if path.exists():
            size_kb = path.stat().st_size / 1024
            print(f"  {filename} ({size_kb:.1f} KB)")

    print()
    print("Next steps:")
    print("  1. Review the generated icons (especially icon-1024.png)")
    print("  2. Verify Contents.json references all files")
    print("  3. Open Xcode and verify icons appear correctly")
    print("  4. Test on device at all sizes")
    print()
    print("Tip: Preview the App Store icon:")
    print("  open icon-1024.png")
    print()


if __name__ == "__main__":
    main()
