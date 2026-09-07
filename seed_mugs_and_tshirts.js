const fs = require('fs');
const path = require('path');

const userUploadsDir = 'C:/Users/Admin/.gemini/antigravity-ide/brain/682e4a60-305c-4c07-b874-0f6277339df9/.user_uploaded/';
const brainDir = 'C:/Users/Admin/.gemini/antigravity-ide/brain/682e4a60-305c-4c07-b874-0f6277339df9/';
const GRAPHQL_URL = 'https://sriaachicreatives.udayamarketing.in/graphql/';

async function runGql(query, variables, token, retries = 3) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `JWT ${token}`;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(30000)
      });
      return await res.json();
    } catch (e) {
      console.log(`Retry ${i + 1}/${retries}...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error('GraphQL request failed after retries');
}

async function uploadImageToProduct(productId, filePath, alt, token) {
  if (!fs.existsSync(filePath)) {
    console.log(`Image not found: ${filePath}`);
    return;
  }
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
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
    variables: { productId, image: null, alt }
  });

  const map = JSON.stringify({ "0": ["variables.image"] });
  const formData = new FormData();
  formData.append('operations', operations);
  formData.append('map', map);
  formData.append('0', blob, path.basename(filePath));

  try {
    const uploadRes = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Authorization': `JWT ${token}` },
      body: formData,
      signal: AbortSignal.timeout(30000)
    });
    const data = await uploadRes.json();
    console.log(`📸 Image attached for ${alt}:`, data.data?.productMediaCreate?.media?.url);
  } catch (err) {
    console.error('Image upload error:', err);
  }
}

async function seedMugsAndTshirts() {
  console.log('1. Logging in as Admin...');
  const loginRes = await runGql(`
    mutation TokenCreate($email: String!, $password: String!) {
      tokenCreate(email: $email, password: $password) {
        token
      }
    }
  `, { email: 'sriaachicreatives@gmail.com', password: '1234567890' });

  const token = loginRes.data?.tokenCreate?.token;
  if (!token) return console.error('Login failed:', loginRes);
  console.log('✅ Logged in successfully!');

  // Channel
  const channelRes = await runGql(`query { channels { id slug name } }`, {}, token);
  const channel = channelRes.data?.channels?.[0] || { id: 'Q2hhbm5lbDox', slug: 'default-channel' };

  // Product Type
  const ptRes = await runGql(`query { productTypes(first: 5) { edges { node { id name } } } }`, {}, token);
  const productTypeId = ptRes.data?.productTypes?.edges?.[0]?.node?.id;

  // Categories
  const categories = [
    { name: 'Custom Coffee Mugs', slug: 'custom-coffee-mugs' },
    { name: 'Custom T-Shirts', slug: 'custom-t-shirts' }
  ];

  const categoryMap = {};
  for (const cat of categories) {
    const createRes = await runGql(`
      mutation CreateCat($input: CategoryInput!) {
        categoryCreate(input: $input) {
          category { id name slug }
        }
      }
    `, { input: { name: cat.name, slug: cat.slug } }, token);

    let catId = createRes.data?.categoryCreate?.category?.id;
    if (!catId) {
      const getCats = await runGql(`query { categories(first: 50) { edges { node { id name slug } } } }`, {}, token);
      catId = getCats.data?.categories?.edges?.find(e => e.node.slug === cat.slug)?.node?.id;
    }
    categoryMap[cat.slug] = catId;
    console.log(`✅ Category "${cat.name}" ID: ${catId}`);
  }

  // Products
  const newProducts = [
    // ☕ Mugs
    {
      name: 'Personalized Custom Ceramic Coffee Mug',
      slug: 'personalized-custom-ceramic-mug',
      categorySlug: 'custom-coffee-mugs',
      price: 399,
      image: path.join(userUploadsDir, 'media_1788267222469.jpg'),
      sku: 'mug-ceramic-custom-01'
    },
    {
      name: 'Magic Color-Changing Photo Mug',
      slug: 'magic-color-changing-photo-mug',
      categorySlug: 'custom-coffee-mugs',
      price: 599,
      image: path.join(brainDir, 'magic_coffee_mug_1788267445435.jpg'),
      sku: 'mug-magic-custom-02'
    },
    {
      name: 'Personalized Couple Heart-Handle Coffee Mug',
      slug: 'personalized-couple-heart-handle-mug',
      categorySlug: 'custom-coffee-mugs',
      price: 499,
      image: path.join(userUploadsDir, 'media_1788267222469.jpg'),
      sku: 'mug-heart-custom-03'
    },

    // 👕 T-Shirts
    {
      name: 'Personalized Custom Photo Black Cotton T-Shirt',
      slug: 'personalized-photo-black-tshirt',
      categorySlug: 'custom-t-shirts',
      price: 699,
      image: path.join(userUploadsDir, 'media_1788267222462.png'),
      sku: 'tshirt-black-custom-01'
    },
    {
      name: 'Custom Minimalist Organic White T-Shirt',
      slug: 'custom-minimalist-white-tshirt',
      categorySlug: 'custom-t-shirts',
      price: 799,
      image: path.join(brainDir, 'custom_white_tshirt_1788267481579.jpg'),
      sku: 'tshirt-white-custom-02'
    },
    {
      name: 'Custom Oversized Streetwear Graphic T-Shirt',
      slug: 'custom-oversized-streetwear-tshirt',
      categorySlug: 'custom-t-shirts',
      price: 899,
      image: path.join(userUploadsDir, 'media_1788267222462.png'),
      sku: 'tshirt-oversized-custom-03'
    }
  ];

  for (const prod of newProducts) {
    console.log(`\nCreating ${prod.name}...`);
    const catId = categoryMap[prod.categorySlug];

    const prodRes = await runGql(`
      mutation CreateProd($input: ProductCreateInput!) {
        productCreate(input: $input) {
          product { id name slug }
          errors { field message }
        }
      }
    `, {
      input: {
        name: prod.name,
        slug: prod.slug,
        category: catId,
        productType: productTypeId
      }
    }, token);

    let created = prodRes.data?.productCreate?.product;
    if (!created) {
      const pFind = await runGql(`query { products(first: 50, channel: "${channel.slug}") { edges { node { id name slug } } } }`, {}, token);
      created = pFind.data?.products?.edges?.find(e => e.node.slug === prod.slug)?.node;
    }

    if (!created) {
      console.log(`Could not create ${prod.name}`);
      continue;
    }

    console.log(`✅ Product ID: ${created.id}`);

    // Publish to Channel
    await runGql(`
      mutation PublishProd($id: ID!, $input: ProductChannelListingUpdateInput!) {
        productChannelListingUpdate(id: $id, input: $input) {
          product { id }
        }
      }
    `, {
      id: created.id,
      input: {
        updateChannels: [
          {
            channelId: channel.id,
            isPublished: true,
            isAvailableForPurchase: true,
            visibleInListings: true
          }
        ]
      }
    }, token);

    // Create Variant
    const varRes = await runGql(`
      mutation CreateVar($input: ProductVariantCreateInput!) {
        productVariantCreate(input: $input) {
          productVariant { id name }
        }
      }
    `, {
      input: {
        product: created.id,
        sku: prod.sku,
        name: 'Standard',
        attributes: []
      }
    }, token);

    let variantId = varRes.data?.productVariantCreate?.productVariant?.id;
    if (!variantId) {
      const pDetails = await runGql(`query { product(id: "${created.id}", channel: "${channel.slug}") { variants { id } } }`, {}, token);
      variantId = pDetails.data?.product?.variants?.[0]?.id;
    }

    if (variantId) {
      await runGql(`
        mutation UpdatePrice($id: ID!, $input: [ProductVariantChannelListingAddInput!]!) {
          productVariantChannelListingUpdate(id: $id, input: $input) {
            variant { id }
          }
        }
      `, {
        id: variantId,
        input: [
          {
            channelId: channel.id,
            price: prod.price,
            costPrice: Math.round(prod.price * 0.5)
          }
        ]
      }, token);
      console.log(`✅ Set price ₹${prod.price}`);
    }

    // Upload Image
    if (prod.image) {
      await uploadImageToProduct(created.id, prod.image, prod.name, token);
    }
  }

  console.log('\n🎉 ALL COFFEE MUGS & CUSTOM T-SHIRTS CREATED & UPLOADED!');
}

seedMugsAndTshirts().catch(console.error);
