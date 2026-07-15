const sharp = require('sharp');
const path = require('path');

const srcDir = 'C:/Users/Admin/.gemini/antigravity-ide/brain/6a86b9e5-d376-467c-8cac-c9f0d52d4afe/';
const destDir = 'c:/Users/Admin/Desktop/Sri_Aachi_Creatives/Gubera_2.0_theme_2/public/images/';

const mapping = [
  { src: 'media__1784032297775.jpg', dest: 'resin-art-block.webp' },
  { src: 'media__1784032304728.jpg', dest: 'resin-table.webp' },
  { src: 'media__1784032409353.jpg', dest: 'photo-frame.webp' },
  { src: 'media__1784032312243.jpg', dest: 'motor-engine-table.webp' },
  { src: 'media__1784032319988.jpg', dest: 'motor-engine-table-3.webp' }
];

async function convert() {
  for (const file of mapping) {
    console.log(`Converting ${file.src} to ${file.dest}`);
    await sharp(path.join(srcDir, file.src))
      .webp({ quality: 80 })
      .toFile(path.join(destDir, file.dest));
  }
  console.log('All images converted and overwritten successfully!');
}

convert().catch(console.error);
