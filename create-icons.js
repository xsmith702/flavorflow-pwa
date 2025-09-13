const fs = require('fs');
const path = require('path');

// Simple 1x1 PNG in base64 (transparent)
const simplePNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==';

// Create a simple colored PNG for each size
function createColoredPNG(size, color) {
  // This is a very basic approach - in production you'd use a proper image library
  // For now, we'll create a minimal PNG that browsers will accept
  const canvas = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${color}" rx="12"/>
    <text x="50%" y="50%" font-family="Arial" font-size="${size * 0.5}" fill="white" text-anchor="middle" dy="0.35em">F</text>
  </svg>`;
  
  return canvas;
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, 'public');

console.log('Creating fallback icon files...');

sizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(publicDir, filename);
  
  // Create a minimal PNG buffer (just the base64 decoded)
  const buffer = Buffer.from(simplePNG, 'base64');
  fs.writeFileSync(filepath, buffer);
  console.log(`Created ${filename}`);
});

console.log('Done! Icons created.');
console.log('Note: These are minimal transparent PNGs. For better icons, use the icon-generator.html page.');
