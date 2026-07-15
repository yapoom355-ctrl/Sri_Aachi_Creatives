const sharp = require('sharp');
const path = require('path');

const srcDir = 'C:/Users/Admin/.gemini/antigravity-ide/brain/6a86b9e5-d376-467c-8cac-c9f0d52d4afe/';
const destDir = 'c:/Users/Admin/Desktop/Sri_Aachi_Creatives/Gubera_2.0_theme_2/public/images/';

async function convert() {
  const src = 'media__1784032113805.jpg';
  const dest = 'motor-engine-table-3.webp';
  console.log('Converting ' + src + ' to ' + dest);
  await sharp(path.join(srcDir, src))
    .webp({ quality: 80 })
    .toFile(path.join(destDir, dest));
  console.log('Done!');
}
convert().catch(console.error);
