const fs = require('fs');
const path = require('path');

const userUploadsDir = 'C:/Users/Admin/.gemini/antigravity-ide/brain/682e4a60-305c-4c07-b874-0f6277339df9/.user_uploaded/';
const brainDir = 'C:/Users/Admin/.gemini/antigravity-ide/brain/682e4a60-305c-4c07-b874-0f6277339df9/';
const GRAPHQL_URL = 'https://sriaachicreatives.udayamarketing.in/graphql/';

const productImages = [
  // ☕ COFFEE MUGS
  {
    productId: 'UHJvZHVjdDo3',
    name: 'Personalized Custom Ceramic Coffee Mug',
    filePath: path.join(brainDir, 'custom_ceramic_mug_1788268643146.jpg')
  },
  {
    productId: 'UHJvZHVjdDo4',
    name: 'Magic Color-Changing Photo Mug',
    filePath: path.join(brainDir, 'magic_coffee_mug_1788267445435.jpg')
  },
  {
    productId: 'UHJvZHVjdDo5',
    name: 'Personalized Couple Heart-Handle Coffee Mug',
    filePath: path.join(brainDir, 'couple_heart_mug_1788268518336.jpg')
  },

  // 👕 CUSTOM T-SHIRTS
  {
    productId: 'UHJvZHVjdDoxMA==',
    name: 'Personalized Custom Photo Black Cotton T-Shirt',
    filePath: path.join(userUploadsDir, 'media_1788267222462.png')
  },
  {
    productId: 'UHJvZHVjdDoxMQ==',
    name: 'Custom Minimalist Organic White T-Shirt',
    filePath: path.join(brainDir, 'custom_white_tshirt_1788267481579.jpg')
  },
  {
    productId: 'UHJvZHVjdDoxMg==',
    name: 'Custom Oversized Streetwear Graphic T-Shirt',
    filePath: path.join(brainDir, 'oversized_streetwear_tshirt_1788268764377.jpg')
  }
];

async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(30000) });
      return res;
    } catch (err) {
      console.log(`Connection retry ${i + 1}/${retries}...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error('Fetch failed after retries');
}

async function updateMedia() {
  console.log('Logging in...');
  const loginRes = await fetchWithRetry(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation { tokenCreate(email: "sriaachicreatives@gmail.com", password: "1234567890") { token } }`
    })
  });
  const token = (await loginRes.json()).data?.tokenCreate?.token;
  if (!token) return console.error('Login failed');
  console.log('✅ Logged in!');

  for (const item of productImages) {
    console.log(`\nProcessing ${item.name} (${item.productId})...`);

    // 1. Fetch existing media
    try {
      const pRes = await fetchWithRetry(GRAPHQL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` },
        body: JSON.stringify({
          query: `query { product(id: "${item.productId}", channel: "default-channel") { media { id } } }`
        })
      });
      const pData = await pRes.json();
      const existingMedia = pData.data?.product?.media || [];

      for (const m of existingMedia) {
        await fetchWithRetry(GRAPHQL_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` },
          body: JSON.stringify({
            query: `mutation { productMediaDelete(id: "${m.id}") { product { id } } }`
          })
        });
        console.log(`🗑️ Deleted old media ${m.id}`);
      }
    } catch (e) {
      console.warn('Could not clean old media:', e.message);
    }

    // 2. Upload fresh unique image
    if (!fs.existsSync(item.filePath)) {
      console.error(`File missing: ${item.filePath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(item.filePath);
    const ext = path.extname(item.filePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    const blob = new Blob([fileBuffer], { type: mimeType });

    const operations = JSON.stringify({
      query: `
        mutation UploadMedia($productId: ID!, $image: Upload!, $alt: String) {
          productMediaCreate(input: { product: $productId, image: $image, alt: $alt }) {
            media { id url }
            errors { field message }
          }
        }
      `,
      variables: { productId: item.productId, image: null, alt: item.name }
    });

    const map = JSON.stringify({ "0": ["variables.image"] });
    const formData = new FormData();
    formData.append('operations', operations);
    formData.append('map', map);
    formData.append('0', blob, path.basename(item.filePath));

    const uploadRes = await fetchWithRetry(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Authorization': `JWT ${token}` },
      body: formData
    });
    const uploadData = await uploadRes.json();
    console.log(`✅ Uploaded fresh image:`, uploadData.data?.productMediaCreate?.media?.url);
  }

  console.log('\n🎉 ALL PRODUCTS NOW HAVE DEDICATED UNIQUE IMAGES!');
}

updateMedia().catch(console.error);
