import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Icon sizes needed for the manifest
const sizes = [72, 96, 120, 128, 144, 152, 180, 192, 384, 512];

// Read the source SVG file
const svgPath = join(__dirname, 'icons', 'icon-source.svg');
const svgBuffer = readFileSync(svgPath);

// Generate all icon sizes
async function generateIcons() {
  console.log('Generating icons...\n');

  for (const size of sizes) {
    const outputPath = join(__dirname, 'icons', `icon-${size}.png`);

    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated icon-${size}.png (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate icon-${size}.png:`, error.message);
    }
  }

  console.log('\n✓ All icons generated successfully!');
}

generateIcons().catch(console.error);
