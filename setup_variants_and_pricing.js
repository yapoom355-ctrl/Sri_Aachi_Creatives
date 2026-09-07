const fs = require('fs');

async function setupVariantsAndPricing() {
  console.log('1. Logging in as Admin...');
  const loginRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation { tokenCreate(email: "sriaachicreatives@gmail.com", password: "1234567890") { token } }`
    })
  });
  const token = (await loginRes.json()).data.tokenCreate.token;

  const products = [
    { id: 'UHJvZHVjdDoy', name: 'Custom Resin Memory Preservation Block', price: 2499, sku: 'resin-block-sku-1' },
    { id: 'UHJvZHVjdDoz', name: 'Personalized Walnut & Resin Photo Frame', price: 1899, sku: 'photo-frame-sku-1' },
    { id: 'UHJvZHVjdDo0', name: 'Vintage Industrial Piston Desk Lamp', price: 4999, sku: 'piston-lamp-sku-1' },
    { id: 'UHJvZHVjdDo1', name: 'Executive LS V8 Engine Block Coffee Table', price: 28999, sku: 'engine-table-sku-1' },
    { id: 'UHJvZHVjdDo2', name: 'Master Crafted Gearworks Chrono Wall Clock', price: 7499, sku: 'gear-clock-sku-1' }
  ];

  for (const p of products) {
    console.log(`\nConfiguring variant for ${p.name}...`);
    const varRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` },
      body: JSON.stringify({
        query: `
          mutation CreateVar($input: ProductVariantCreateInput!) {
            productVariantCreate(input: $input) {
              productVariant { id name }
              errors { field message }
            }
          }
        `,
        variables: {
          input: {
            product: p.id,
            sku: p.sku,
            name: 'Standard Edition',
            attributes: []
          }
        }
      })
    });
    const varData = await varRes.json();
    let variantId = varData.data?.productVariantCreate?.productVariant?.id;

    if (!variantId) {
      // Fetch existing variants on product
      const pRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` },
        body: JSON.stringify({
          query: `query { product(id: "${p.id}", channel: "default-channel") { variants { id } } }`
        })
      });
      const pData = await pRes.json();
      variantId = pData.data?.product?.variants?.[0]?.id;
    }

    if (variantId) {
      console.log(`✅ Variant ID: ${variantId}`);
      const priceRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` },
        body: JSON.stringify({
          query: `
            mutation UpdateVarPrice($id: ID!, $input: [ProductVariantChannelListingAddInput!]!) {
              productVariantChannelListingUpdate(id: $id, input: $input) {
                variant { id }
                errors { field message }
              }
            }
          `,
          variables: {
            id: variantId,
            input: [
              {
                channelId: 'Q2hhbm5lbDox',
                price: p.price,
                costPrice: Math.round(p.price * 0.5)
              }
            ]
          }
        })
      });
      const priceData = await priceRes.json();
      console.log(`✅ Price set to ₹${p.price}`);
    }
  }

  console.log('\n🎉 ALL PRODUCT VARIANTS AND PRICES CONFIGURED!');
}

setupVariantsAndPricing().catch(console.error);
