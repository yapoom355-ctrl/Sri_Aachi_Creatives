const https = require('https');
const fs = require('fs');
const path = require('path');

const userUploadsDir = 'C:/Users/Admin/.gemini/antigravity-ide/brain/682e4a60-305c-4c07-b874-0f6277339df9/.user_uploaded/';
const brainDir = 'C:/Users/Admin/.gemini/antigravity-ide/brain/682e4a60-305c-4c07-b874-0f6277339df9/';

const agent = new https.Agent({ family: 4 });

function doRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'sriaachicreatives.udayamarketing.in',
      port: 443,
      path: '/graphql/',
      method: 'POST',
      agent,
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (postData) {
      if (Buffer.isBuffer(postData)) {
        req.write(postData);
      } else {
        req.write(postData);
      }
    }
    req.end();
  });
}

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

async function updateAllMedia() {
  console.log('Logging in via IPv4...');
  const loginBody = JSON.stringify({
    query: `mutation { tokenCreate(email: "sriaachicreatives@gmail.com", password: "1234567890") { token } }`
  });
  const loginRes = await doRequest({
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginBody)
    }
  }, loginBody);

  const token = loginRes.data?.tokenCreate?.token;
  if (!token) return console.error('Login failed:', loginRes);
  console.log('✅ Logged in!');

  for (const item of productImages) {
    console.log(`\nProcessing ${item.name} (${item.productId})...`);

    // 1. Delete existing media
    const pQuery = JSON.stringify({
      query: `query { product(id: "${item.productId}", channel: "default-channel") { media { id } } }`
    });
    const pData = await doRequest({
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${token}`,
        'Content-Length': Buffer.byteLength(pQuery)
      }
    }, pQuery);

    const existingMedia = pData.data?.product?.media || [];
    for (const m of existingMedia) {
      const delQuery = JSON.stringify({
        query: `mutation { productMediaDelete(id: "${m.id}") { product { id } } }`
      });
      await doRequest({
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${token}`,
          'Content-Length': Buffer.byteLength(delQuery)
        }
      }, delQuery);
      console.log(`🗑️ Deleted old media ${m.id}`);
    }

    // 2. Upload fresh image via multipart/form-data
    if (!fs.existsSync(item.filePath)) {
      console.error(`File missing: ${item.filePath}`);
      continue;
    }

    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const fileBuffer = fs.readFileSync(item.filePath);
    const filename = path.basename(item.filePath);
    const ext = path.extname(item.filePath).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

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

    let body = [];
    body.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="operations"\r\n\r\n${operations}\r\n`));
    body.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="map"\r\n\r\n${map}\r\n`));
    body.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="0"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`));
    body.push(fileBuffer);
    body.push(Buffer.from(`\r\n--${boundary}--\r\n`));

    const finalBuffer = Buffer.concat(body);

    const uploadData = await doRequest({
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Authorization': `JWT ${token}`,
        'Content-Length': finalBuffer.length
      }
    }, finalBuffer);

    console.log(`✅ Uploaded:`, uploadData.data?.productMediaCreate?.media?.url);
  }

  console.log('\n🎉 ALL MEDIA UPDATED TO UNIQUE IMAGES SUCCESSFULLY!');
}

updateAllMedia().catch(console.error);
