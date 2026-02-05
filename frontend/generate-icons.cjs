const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

// Create a simple icon using sharp
const createIcon = async (size) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="80" fill="#e82e04"/>
    <text x="256" y="340" text-anchor="middle" fill="white" font-size="280" font-family="Arial, sans-serif" font-weight="bold">E</text>
  </svg>`;
  
  const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outputPath);
  
  console.log(`Created: icon-${size}x${size}.png`);
};

const generateIcons = async () => {
  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log('Generating PWA icons...\n');
  
  for (const size of sizes) {
    await createIcon(size);
  }
  
  console.log('\n✅ All icons generated successfully!');
};

generateIcons().catch(console.error);
