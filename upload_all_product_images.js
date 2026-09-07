const fs = require('fs');
const path = require('path');

const userUploadsDir = 'C:/Users/Admin/.gemini/antigravity-ide/brain/682e4a60-305c-4c07-b874-0f6277339df9/.user_uploaded/';
const brainDir = 'C:/Users/Admin/.gemini/antigravity-ide/brain/682e4a60-305c-4c07-b874-0f6277339df9/';
const publicImagesDir = path.join(__dirname, 'public/images/');

// 1. Copy images locally to public/images/
const imageMapping = [
  {
    productId: 'UHJvZHVjdDoy', // Resin Memory Block
    name: 'Custom Resin Memory Preservation Block',
    src: path.join(brainDir, 'resin_memory_art_1788263055379.jpg'),
    dest: 'resin-art-block.webp'
  },
  {
    productId: 'UHJvZHVjdDoz', // Photo Frame
    name: 'Personalized Walnut & Resin Photo Frame',
    src: path.join(brainDir, 'photo_frame_1788263097920.jpg'),
    dest: 'photo-frame.webp'
  },
  {
    productId: 'UHJvZHVjdDo0', // Piston Lamp
    name: 'Vintage Industrial Piston Desk Lamp',
    src: path.join(userUploadsDir, 'media_1788262918763.jpg'),
    dest: 'piston-lamp.webp'
  },
  {
    productId: 'UHJvZHVjdDo1', // Engine Table
    name: 'Executive LS V8 Engine Block Coffee Table',
    src: path.join(userUploadsDir, 'media_1788262918797.jpg'),
    dest: 'resin-table.webp'
  },
  {
    productId: 'UHJvZHVjdDo2', // Gear Clock
    name: 'Master Crafted Gearworks Chrono Wall Clock',
    src: path.join(userUploadsDir, 'media_1788262918844.jpg'),
    dest: 'gear-clock.webp'
  }
];

for (const item of imageMapping) {
  if (fs.existsSync(item.src)) {
    fs.copyFileSync(item.src, path.join(publicImagesDir, item.dest));
    console.log(`✅ Saved ${item.dest} locally to public/images/`);
  }
}

// 2. Upload to Saleor GraphQL via multipart request
async function uploadToSaleor() {
  console.log('\nLogging in to Saleor...');
  const loginRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation { tokenCreate(email: "sriaachicreatives@gmail.com", password: "1234567890") { token } }`
    })
  });
  const token = (await loginRes.json()).data?.tokenCreate?.token;
  if (!token) return console.error('Login failed');
  console.log('✅ Logged in!');

  for (const item of imageMapping) {
    if (!fs.existsSync(item.src)) continue;
    console.log(`\nUploading image for: ${item.name} (${item.productId})...`);

    const fileBuffer = fs.readFileSync(item.src);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });

    const operations = JSON.stringify({
      query: `
        mutation UploadMedia($productId: ID!, $image: Upload!, $alt: String) {
          productMediaCreate(input: { product: $productId, image: $image, alt: $alt }) {
            media { id url }
            errors { field message }
          }
        }
      `,
      variables: {
        productId: item.productId,
        image: null,
        alt: item.name
      }
    });

    const map = JSON.stringify({
      "0": ["variables.image"]
    });

    const formData = new FormData();
    formData.append('operations', operations);
    formData.append('map', map);
    formData.append('0', blob, path.basename(item.src));

    try {
      const uploadRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
        method: 'POST',
        headers: {
          'Authorization': `JWT ${token}`
        },
        body: formData
      });
      const data = await uploadRes.json();
      console.log('Upload result:', JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Upload error:', err);
    }
  }

  console.log('\n🎉 ALL PRODUCT PHOTOS UPLOADED TO SALEOR AND SAVED LOCALLY!');
}

uploadToSaleor().catch(console.error);
