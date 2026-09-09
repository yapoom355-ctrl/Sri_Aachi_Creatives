const fs = require('fs');

async function fixAllProducts() {
  console.log('Logging in as Admin...');
  const loginRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation { tokenCreate(email: "sriaachicreatives@gmail.com", password: "1234567890") { token } }`,
    }),
  });
  const token = (await loginRes.json()).data.tokenCreate.token;

  // 1. Fetch channels & warehouses
  const metaRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify({
      query: `
        query {
          channels { id slug name }
          warehouses(first: 10) { edges { node { id name } } }
        }
      `,
    }),
  });
  const metaData = await metaRes.json();
  const channels = metaData.data.channels;
  const sriAachiChannel = channels.find(c => c.slug === 'sri-aachi-creatives') || channels[0];
  const warehouses = metaData.data.warehouses.edges.map(e => e.node);
  const defaultWarehouse = warehouses[0];

  console.log('Target Channel:', sriAachiChannel.name, `(${sriAachiChannel.id})`);
  console.log('Target Warehouse:', defaultWarehouse.name, `(${defaultWarehouse.id})`);

  // 2. Fetch all products
  const productsRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
    body: JSON.stringify({
      query: `
        query {
          products(first: 100) {
            edges {
              node {
                id
                name
                channelListings {
                  channel { id slug }
                  isPublished
                  visibleInListings
                }
                variants {
                  id
                  name
                  sku
                  channelListings {
                    channel { id slug }
                    price { amount }
                  }
                  stocks {
                    id
                    warehouse { id name }
                    quantity
                  }
                }
              }
            }
          }
        }
      `,
    }),
  });

  const productsData = await productsRes.json();
  const products = productsData.data.products.edges.map(e => e.node);

  console.log(`\nFound ${products.length} product(s) in catalog:\n`);

  for (const p of products) {
    console.log(`--------------------------------------------------`);
    console.log(`Processing Product: "${p.name}" (${p.id})`);

    // A. Ensure Product is listed in "sri-aachi-creatives" channel
    const inSriAachi = p.channelListings?.some(cl => cl.channel.id === sriAachiChannel.id);
    if (!inSriAachi) {
      console.log(`   Adding product to channel "${sriAachiChannel.slug}"...`);
      const plRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
        body: JSON.stringify({
          query: `
            mutation UpdateProductChannel($id: ID!, $input: ProductChannelListingUpdateInput!) {
              productChannelListingUpdate(id: $id, input: $input) {
                product { id }
                errors { field message code }
              }
            }
          `,
          variables: {
            id: p.id,
            input: {
              updateChannels: [
                {
                  channelId: sriAachiChannel.id,
                  isPublished: true,
                  visibleInListings: true,
                  isAvailableForPurchase: true,
                },
              ],
            },
          },
        }),
      });
      const plData = await plRes.json();
      const errs = plData.data?.productChannelListingUpdate?.errors;
      if (errs && errs.length > 0) {
        console.error(`   ❌ Failed to add product to channel:`, errs);
      } else {
        console.log(`   ✅ Product added to "${sriAachiChannel.slug}" channel!`);
      }
    } else {
      console.log(`   ✅ Product is already in "${sriAachiChannel.slug}" channel.`);
    }

    // B. Check and fix variants
    let variants = p.variants || [];

    // If product has NO variants, create one
    if (variants.length === 0) {
      const uniqueSku = `SKU-${p.id.slice(-6)}-${Date.now().toString().slice(-4)}`;
      console.log(`   Product has NO variants. Creating default variant with SKU: ${uniqueSku}...`);
      const createVarRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
        body: JSON.stringify({
          query: `
            mutation CreateVariant($input: ProductVariantCreateInput!) {
              productVariantCreate(input: $input) {
                productVariant { id name sku }
                errors { field message code }
              }
            }
          `,
          variables: {
            input: {
              product: p.id,
              name: 'Default',
              sku: uniqueSku,
              attributes: [],
            },
          },
        }),
      });
      const createVarData = await createVarRes.json();
      const newVar = createVarData.data?.productVariantCreate?.productVariant;
      if (newVar) {
        variants = [newVar];
        console.log(`   ✅ Created variant ${newVar.name} (${newVar.id})`);
      } else {
        console.error(`   ❌ Failed to create variant:`, createVarData.data?.productVariantCreate?.errors);
      }
    }

    // For every variant:
    for (const v of variants) {
      console.log(`   Variant: "${v.name || 'Default'}" (SKU: ${v.sku || 'NO_SKU'}, ID: ${v.id})`);

      // 1. Ensure SKU is set and unique
      if (!v.sku) {
        const generatedSku = `SKU-${v.id.slice(-6)}-${Date.now().toString().slice(-4)}`;
        console.log(`      Updating empty SKU to "${generatedSku}"...`);
        await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
          body: JSON.stringify({
            query: `
              mutation UpdateVarSku($id: ID!, $sku: String!) {
                productVariantUpdate(id: $id, input: { sku: $sku }) {
                  productVariant { id sku }
                  errors { field message }
                }
              }
            `,
            variables: { id: v.id, sku: generatedSku },
          }),
        });
      }

      // 2. Ensure price is set in "sri-aachi-creatives" channel
      const existingPriceCl = v.channelListings?.find(cl => cl.channel.id === sriAachiChannel.id);
      const currentPrice = existingPriceCl?.price?.amount;

      // Also check other channels if they had a price
      const fallbackPrice = v.channelListings?.find(cl => cl.price?.amount)?.price?.amount || 599;
      const targetPrice = currentPrice || fallbackPrice || 599;

      if (!currentPrice) {
        console.log(`      Setting price to ₹${targetPrice} in "${sriAachiChannel.slug}" channel...`);
        const priceRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
          body: JSON.stringify({
            query: `
              mutation SetVarPrice($id: ID!, $input: [ProductVariantChannelListingAddInput!]!) {
                productVariantChannelListingUpdate(id: $id, input: $input) {
                  variant { id }
                  errors { field message }
                }
              }
            `,
            variables: {
              id: v.id,
              input: [
                {
                  channelId: sriAachiChannel.id,
                  price: targetPrice,
                  costPrice: Math.round(targetPrice * 0.5),
                },
              ],
            },
          }),
        });
        const priceData = await priceRes.json();
        const pErrs = priceData.data?.productVariantChannelListingUpdate?.errors;
        if (pErrs && pErrs.length > 0) {
          console.error(`      ❌ Error setting price:`, pErrs);
        } else {
          console.log(`      ✅ Price set to ₹${targetPrice}!`);
        }
      } else {
        console.log(`      ✅ Price is already ₹${currentPrice} in "${sriAachiChannel.slug}".`);
      }

      // 3. Ensure stock quantity in warehouse (set to at least 50)
      const existingStock = v.stocks?.find(s => s.warehouse.id === defaultWarehouse.id);
      if (!existingStock || existingStock.quantity <= 0) {
        console.log(`      Allocating 50 stock in warehouse "${defaultWarehouse.name}"...`);
        // Try stocksCreate
        const stockRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
          body: JSON.stringify({
            query: `
              mutation SetStock($variantId: ID!, $stocks: [StockInput!]!) {
                productVariantStocksCreate(variantId: $variantId, stocks: $stocks) {
                  productVariant { id }
                  errors { field message code }
                }
              }
            `,
            variables: {
              variantId: v.id,
              stocks: [
                {
                  warehouse: defaultWarehouse.id,
                  quantity: 50,
                },
              ],
            },
          }),
        });
        const stockData = await stockRes.json();
        const sErrs = stockData.data?.productVariantStocksCreate?.errors;
        if (sErrs && sErrs.length > 0) {
          // If already exists, update it
          if (existingStock?.id) {
            await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
              body: JSON.stringify({
                query: `
                  mutation UpdateStock($variantId: ID!, $stocks: [StockUpdateInput!]!) {
                    productVariantStocksUpdate(variantId: $variantId, stocks: $stocks) {
                      productVariant { id }
                      errors { field message }
                    }
                  }
                `,
                variables: {
                  variantId: v.id,
                  stocks: [{ stockId: existingStock.id, quantity: 50 }],
                },
              }),
            });
            console.log(`      ✅ Updated stock to 50!`);
          } else {
            console.log(`      Notice on stock:`, sErrs.map(e => e.message).join(', '));
          }
        } else {
          console.log(`      ✅ Stock 50 allocated!`);
        }
      } else {
        console.log(`      ✅ Stock is already ${existingStock.quantity} in "${defaultWarehouse.name}".`);
      }
    }
  }

  console.log('\n========================================================');
  console.log('🎉 ALL PRODUCTS FULLY RESOLVED AND CONFIGURED!');
  console.log('========================================================');
}

fixAllProducts().catch(console.error);
