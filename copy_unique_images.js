const fs = require('fs');
const path = require('path');

const userUploadsDir = 'C:/Users/Admin/.gemini/antigravity-ide/brain/682e4a60-305c-4c07-b874-0f6277339df9/.user_uploaded/';
const brainDir = 'C:/Users/Admin/.gemini/antigravity-ide/brain/682e4a60-305c-4c07-b874-0f6277339df9/';
const destDir = path.join(__dirname, 'public/images');

const items = [
  { src: path.join(brainDir, 'custom_ceramic_mug_1788268643146.jpg'), dest: 'mug-ceramic.jpg' },
  { src: path.join(brainDir, 'magic_coffee_mug_1788267445435.jpg'), dest: 'mug-magic.jpg' },
  { src: path.join(brainDir, 'couple_heart_mug_1788268518336.jpg'), dest: 'mug-couple.jpg' },
  { src: path.join(userUploadsDir, 'media_1788267222462.png'), dest: 'tshirt-black-custom.png' },
  { src: path.join(brainDir, 'custom_white_tshirt_1788267481579.jpg'), dest: 'tshirt-white-custom.jpg' },
  { src: path.join(brainDir, 'oversized_streetwear_tshirt_1788268764377.jpg'), dest: 'tshirt-oversized-custom.jpg' }
];

for (const it of items) {
  if (fs.existsSync(it.src)) {
    fs.copyFileSync(it.src, path.join(destDir, it.dest));
    console.log(`✅ Saved ${it.dest} to public/images/`);
  }
}
