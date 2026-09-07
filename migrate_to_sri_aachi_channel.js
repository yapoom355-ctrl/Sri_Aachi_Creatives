const fs = require('fs');

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
      console.log(`Connection retry ${i + 1}/${retries}...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error('GraphQL request failed after retries');
}

async function migrateChannel() {
  console.log('1. Logging in as Admin...');
  const loginRes = await runGql(`
    mutation TokenCreate($email: String!, $password: String!) {
      tokenCreate(email: $email, password: $password) {
        token
      }
    }
  `, { email: 'sriaachicreatives@gmail.com', password: '1234567890' });

  const token = loginRes.data?.tokenCreate?.token;
  if (!token) {
    console.error('Login failed:', loginRes);
    return;
  }
  console.log('✅ Admin Logged In!');

  // 2. Fetch all channels
  const channelsRes = await runGql(`
    query {
      channels {
        id
        name
        slug
        currencyCode
        isActive
      }
    }
  `, {}, token);

  const channels = channelsRes.data?.channels || [];
  console.log('\nChannels found on server:');
  channels.forEach(c => console.log(` - "${c.name}" (Slug: ${c.slug}, ID: ${c.id}, Currency: ${c.currencyCode})`));

  // Find Sri Aachi Creatives channel (or non-default channel)
  const targetChannel = channels.find(c => 
    c.name.toLowerCase().includes('aachi') || 
    c.slug.toLowerCase().includes('aachi') ||
    c.currencyCode === 'INR'
  ) || channels.find(c => c.slug !== 'default-channel');

  if (!targetChannel) {
    console.error('Target channel not found among:', channels);
    return;
  }

  console.log(`\n🎯 Target Channel: "${targetChannel.name}" (ID: ${targetChannel.id}, Slug: ${targetChannel.slug}, Currency: ${targetChannel.currencyCode})`);

  // 3. Fetch all categories and create clean lookup
  const catsRes = await runGql(`
    query {
      categories(first: 50) {
        edges {
          node {
            id
            name
            slug
          }
        }
      }
    }
  `, {}, token);
  const categories = catsRes.data?.categories?.edges?.map(e => e.node) || [];
  console.log('\nCategories available:', categories.map(c => c.name).join(', '));

  // 4. Default prices by product name keyword
  const priceLookup = {
    'mug': 499,
    'ceramic': 399,
    'magic': 599,
    'heart': 499,
    't-shirt': 699,
    'tshirt': 699,
    'black': 699,
    'white': 799,
    'oversized': 899,
    'preservation': 2499,
    'resin memory': 2499,
    'photo frame': 1899,
    'piston': 4999,
    'lamp': 4999,
    'v8': 28999,
    'table': 28999,
    'clock': 7499,
    'gearworks': 7499
  };

  const getPriceForProduct = (name) => {
    const lower = name.toLowerCase();
    for (const [key, val] of Object.entries(priceLookup)) {
      if (lower.includes(key)) return val;
    }
    return 999;
  };

  // 5. Fetch all products
  const prodsRes = await runGql(`
    query {
      products(first: 100) {
        edges {
          node {
            id
            name
            slug
            category {
              id
              name
              slug
            }
            variants {
              id
              name
              sku
              channelListings {
                channel { id slug }
                price { amount currency }
              }
            }
          }
        }
      }
    }
  `, {}, token);

  const products = prodsRes.data?.products?.edges?.map(e => e.node) || [];
  console.log(`\nFound ${products.length} products to publish to "${targetChannel.name}"...\n`);

  for (const prod of products) {
    console.log(`--------------------------------------------------`);
    console.log(`Processing: "${prod.name}" (${prod.id})`);

    // Assign appropriate category if missing or default
    let targetCatId = prod.category?.id;
    const lowerName = prod.name.toLowerCase();

    if (!targetCatId || prod.category?.name === 'Default Category') {
      let matchedCat = null;
      if (lowerName.includes('mug')) matchedCat = categories.find(c => c.slug.includes('mug'));
      else if (lowerName.includes('t-shirt') || lowerName.includes('shirt')) matchedCat = categories.find(c => c.slug.includes('t-shirt'));
      else if (lowerName.includes('resin') || lowerName.includes('preservation')) matchedCat = categories.find(c => c.slug.includes('resin'));
      else if (lowerName.includes('frame')) matchedCat = categories.find(c => c.slug.includes('frame'));
      else if (lowerName.includes('lamp') || lowerName.includes('piston')) matchedCat = categories.find(c => c.slug.includes('lamp') || c.slug.includes('piston'));
      else if (lowerName.includes('table') || lowerName.includes('v8')) matchedCat = categories.find(c => c.slug.includes('table'));
      else if (lowerName.includes('clock')) matchedCat = categories.find(c => c.slug.includes('clock'));

      if (matchedCat) {
        targetCatId = matchedCat.id;
        await runGql(`
          mutation UpdateProdCategory($id: ID!, $input: ProductInput!) {
            productUpdate(id: $id, input: $input) {
              product { id category { name } }
              errors { field message }
            }
          }
        `, { id: prod.id, input: { category: targetCatId } }, token);
        console.log(`📁 Assigned Category: "${matchedCat.name}"`);
      }
    } else {
      console.log(`📁 Category: "${prod.category.name}"`);
    }

    // Publish product to new channel
    const pubRes = await runGql(`
      mutation PublishToChannel($id: ID!, $input: ProductChannelListingUpdateInput!) {
        productChannelListingUpdate(id: $id, input: $input) {
          product { id }
          errors { field message }
        }
      }
    `, {
      id: prod.id,
      input: {
        updateChannels: [
          {
            channelId: targetChannel.id,
            isPublished: true,
            isAvailableForPurchase: true,
            visibleInListings: true,
            availableForPurchaseAt: new Date().toISOString()
          }
        ]
      }
    }, token);

    if (pubRes.data?.productChannelListingUpdate?.errors?.length) {
      console.warn('Channel listing notice:', pubRes.data.productChannelListingUpdate.errors);
    } else {
      console.log(`✅ Product published in channel "${targetChannel.name}"`);
    }

    // Ensure product has a variant and price in new channel
    const price = getPriceForProduct(prod.name);
    let variant = prod.variants?.[0];

    if (!variant) {
      // Create variant if missing
      console.log(`Creating default variant for "${prod.name}"...`);
      const vRes = await runGql(`
        mutation CreateVar($input: ProductVariantCreateInput!) {
          productVariantCreate(input: $input) {
            productVariant { id name }
            errors { field message }
          }
        }
      `, {
        input: {
          product: prod.id,
          sku: `${prod.slug || 'prod'}-${Date.now().toString().slice(-4)}`,
          name: 'Standard Edition',
          attributes: []
        }
      }, token);
      variant = vRes.data?.productVariantCreate?.productVariant;
    }

    if (variant?.id) {
      // Set price in new channel
      const priceRes = await runGql(`
        mutation UpdateVarPrice($id: ID!, $input: [ProductVariantChannelListingAddInput!]!) {
          productVariantChannelListingUpdate(id: $id, input: $input) {
            variant { id }
            errors { field message }
          }
        }
      `, {
        id: variant.id,
        input: [
          {
            channelId: targetChannel.id,
            price: price,
            costPrice: Math.round(price * 0.5)
          }
        ]
      }, token);

      if (priceRes.data?.productVariantChannelListingUpdate?.errors?.length) {
        console.warn('Price update notice:', priceRes.data.productVariantChannelListingUpdate.errors);
      } else {
        console.log(`💰 Set variant price: ₹${price} (${targetChannel.currencyCode})`);
      }
    }
  }

  console.log(`\n==================================================`);
  console.log(`🎉 ALL PRODUCTS SUCCESSFULLY CONFIGURED FOR "${targetChannel.name}" (${targetChannel.slug})!`);
  console.log(`==================================================\n`);

  // Write target channel slug to a temp file
  fs.writeFileSync('channel_slug.txt', targetChannel.slug);
}

migrateChannel().catch(console.error);
