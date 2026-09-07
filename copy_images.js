const fs = require('fs');
const path = require('path');

const resinSrc = 'C:/Users/Admin/.gemini/antigravity-ide/brain/682e4a60-305c-4c07-b874-0f6277339df9/resin_memory_art_1788263055379.jpg';
const frameSrc = 'C:/Users/Admin/.gemini/antigravity-ide/brain/682e4a60-305c-4c07-b874-0f6277339df9/photo_frame_1788263097920.jpg';
const destDir = path.join(__dirname, 'public/images');

fs.copyFileSync(resinSrc, path.join(destDir, 'resin-memory-art.jpg'));
fs.copyFileSync(frameSrc, path.join(destDir, 'photo-frame.jpg'));
console.log('Saved images to public/images successfully!');
