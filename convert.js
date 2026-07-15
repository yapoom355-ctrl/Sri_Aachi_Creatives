const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/Admin/.gemini/antigravity-ide/brain/6a86b9e5-d376-467c-8cac-c9f0d52d4afe/';
const destDir = 'c:/Users/Admin/Desktop/Sri_Aachi_Creatives/Gubera_2.0_theme_2/public/images/';

const files = [
  { src: 'media__1784030938120.jpg', dest: 'resin-art-block.webp' },
  { src: 'media__1784030948970.jpg', dest: 'resin-table.webp' },
  { src: 'media__1784030957230.jpg', dest: 'photo-frame.webp' },
  { src: 'media__1784030977153.jpg', dest: 'motor-engine-table.webp' },
  { src: 'media__1784031069811.jpg', dest: 'motor-engine-table-2.webp' }
];

async function convert() {
  for (const file of files) {
    console.log('Converting ' + file.src + ' to ' + file.dest);
    await sharp(path.join(srcDir, file.src))
      .webp({ quality: 80 })
      .toFile(path.join(destDir, file.dest));
  }
  console.log('Done!');
}
convert().catch(console.error);
