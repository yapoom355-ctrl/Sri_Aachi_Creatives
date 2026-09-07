const fs = require('fs');

const GRAPHQL_URL = 'https://sriaachicreatives.udayamarketing.in/graphql/';

async function runGql(query, variables, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `JWT ${token}`;
  
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables })
  });
  return await res.json();
}

async function seedCatalog() {
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
    console.error('Failed to log in');
    return;
  }
  console.log('✅ Logged in successfully!');

  // 2. Get Channels
  const channelRes = await runGql(`
    query {
      channels {
        id
        slug
        name
      }
    }
  `, {}, token);
  const channels = channelRes.data?.channels || [];
  const channel = channels[0];
  console.log(`Channel: ${channel.name} (${channel.id})`);

  // 3. Get Product Type
  const prodTypeRes = await runGql(`
    query {
      productTypes(first: 5) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `, {}, token);

  let productTypeId = prodTypeRes.data?.productTypes?.edges?.[0]?.node?.id;

  // 4. Categories to create / verify
  const categories = [
    { name: 'Resin Memory Arts', slug: 'resin-memory-arts' },
    { name: 'Photo Frames', slug: 'photo-frames' },
    { name: 'Industrial Piston Lamps', slug: 'industrial-piston-lamps' },
    { name: 'V8 Engine Tables', slug: 'v8-engine-tables' },
    { name: 'Gearworks Wall Clocks', slug: 'gearworks-wall-clocks' }
  ];

  const categoryMap = {};

  for (const cat of categories) {
    const res = await runGql(`
      mutation CreateCat($input: CategoryInput!) {
        categoryCreate(input: $input) {
          category { id name slug }
          errors { field message }
        }
      }
    `, { input: { name: cat.name, slug: cat.slug } }, token);

    if (res.data?.categoryCreate?.category) {
      categoryMap[cat.slug] = res.data.categoryCreate.category.id;
      console.log(`✅ Category "${cat.name}" ready: ${categoryMap[cat.slug]}`);
    } else {
      // Find existing
      const existing = await runGql(`
        query GetCats {
          categories(first: 50) {
            edges { node { id name slug } }
          }
        }
      `, {}, token);
      const found = existing.data?.categories?.edges?.find(e => e.node.slug === cat.slug || e.node.name === cat.name);
      if (found) {
        categoryMap[cat.slug] = found.node.id;
        console.log(`ℹ️ Category "${cat.name}" found: ${found.node.id}`);
      }
    }
  }

  // 5. Products to create
  const products = [
    {
      name: 'Custom Resin Memory Preservation Block',
      slug: 'resin-memory-preservation-block',
      categorySlug: 'resin-memory-arts',
      price: 2499,
      description: 'Preserve cherished wedding & anniversary memories in handcrafted crystal-clear epoxy resin with florals and gold foil.'
    },
    {
      name: 'Personalized Walnut & Resin Photo Frame',
      slug: 'personalized-walnut-resin-frame',
      categorySlug: 'photo-frames',
      price: 1899,
      description: 'Bespoke walnut wood photo frame with golden resin inlays. Customizable with couples names and anniversary dates.'
    },
    {
      name: 'Vintage Industrial Piston Desk Lamp',
      slug: 'vintage-industrial-piston-lamp',
      categorySlug: 'industrial-piston-lamps',
      price: 4999,
      description: 'Handcrafted artisan desk lamp made from an authentic mechanical piston, gears, and warm vintage Edison bulb.'
    },
    {
      name: 'Executive LS V8 Engine Block Coffee Table',
      slug: 'executive-ls-v8-engine-table',
      categorySlug: 'v8-engine-tables',
      price: 28999,
      description: 'Statement automotive furniture created from a genuine polished V8 engine block with tempered glass tabletop.'
    },
    {
      name: 'Master Crafted Gearworks Chrono Wall Clock',
      slug: 'master-crafted-gearworks-clock',
      categorySlug: 'gearworks-wall-clocks',
      price: 7499,
      description: 'Stunning steampunk mechanical gear clock featuring Roman numerals and authentic industrial gearwork design.'
    }
  ];

  for (const prod of products) {
    const catId = categoryMap[prod.categorySlug] || Object.values(categoryMap)[0];
    console.log(`\nCreating product "${prod.name}"...`);

    const prodRes = await runGql(`
      mutation CreateProduct($input: ProductCreateInput!) {
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

    let createdProduct = prodRes.data?.productCreate?.product;
    if (!createdProduct) {
      // Find existing product by slug
      const pFind = await runGql(`
        query GetP {
          products(first: 50, channel: "${channel.slug}") {
            edges { node { id name slug } }
          }
        }
      `, {}, token);
      createdProduct = pFind.data?.products?.edges?.find(e => e.node.slug === prod.slug)?.node;
    }

    if (!createdProduct) {
      console.error(`Could not create or find product ${prod.name}`);
      continue;
    }

    console.log(`✅ Product ID: ${createdProduct.id}`);

    // Publish to Channel
    await runGql(`
      mutation UpdateProductChannelListing($id: ID!, $input: ProductChannelListingUpdateInput!) {
        productChannelListingUpdate(id: $id, input: $input) {
          product { id }
          errors { field message }
        }
      }
    `, {
      id: createdProduct.id,
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
    console.log(`✅ Published to ${channel.name}`);

    // Create Variant
    const variantRes = await runGql(`
      mutation CreateVariant($input: ProductVariantCreateInput!) {
        productVariantCreate(input: $input) {
          productVariant { id name }
          errors { field message }
        }
      }
    `, {
      input: {
        product: createdProduct.id,
        sku: `${prod.slug}-std`,
        name: 'Standard Edition',
        trackInventory: false
      }
    }, token);

    const variantId = variantRes.data?.productVariantCreate?.productVariant?.id;
    if (variantId) {
      await runGql(`
        mutation UpdateVariantPrice($id: ID!, $input: [ProductVariantChannelListingAddInput!]!) {
          productVariantChannelListingUpdate(id: $id, input: $input) {
            variant { id }
            errors { field message }
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
      console.log(`✅ Variant created with price ₹${prod.price}`);
    }
  }

  console.log('\n🎉 ALL PRODUCTS AND CATEGORIES CREATED & PUBLISHED IN SALEOR STORE!');
}

seedCatalog().catch(console.error);
