const fs = require('fs');

async function updateStockTo40() {
  console.log('1. Logging in as Admin...');
  const loginRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation { tokenCreate(email: "sriaachicreatives@gmail.com", password: "1234567890") { token } }`
    })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.tokenCreate?.token;
  if (!token) {
    console.error("Failed to login", loginData);
    return;
  }
  console.log('✅ Logged in successfully.');

  console.log('2. Fetching Warehouse ID...');
  const warehouseRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` },
    body: JSON.stringify({
      query: `query { warehouses(first: 10) { edges { node { id name } } } }`
    })
  });
  const warehouseData = await warehouseRes.json();
  const warehouseId = warehouseData.data?.warehouses?.edges[0]?.node?.id;
  if (!warehouseId) {
    console.error("No warehouse found");
    return;
  }
  console.log(`✅ Found warehouse: ${warehouseData.data.warehouses.edges[0].node.name} (${warehouseId})`);

  console.log('3. Fetching all products and variants...');
  let hasNextPage = true;
  let endCursor = null;
  const allVariants = [];

  while (hasNextPage) {
    const afterParam = endCursor ? `, after: "${endCursor}"` : '';
    const productsRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` },
      body: JSON.stringify({
        query: `query { products(first: 100${afterParam}, channel: "sri-aachi-creatives") { pageInfo { hasNextPage endCursor } edges { node { id name variants { id name sku } } } } }`
      })
    });
    const productsData = await productsRes.json();
    
    const pageInfo = productsData.data?.products?.pageInfo;
    const edges = productsData.data?.products?.edges || [];
    
    for (const edge of edges) {
      const product = edge.node;
      for (const variant of product.variants || []) {
        allVariants.push({
          productId: product.id,
          productName: product.name,
          variantId: variant.id,
          variantName: variant.name,
          sku: variant.sku
        });
      }
    }
    
    if (pageInfo?.hasNextPage) {
      endCursor = pageInfo.endCursor;
    } else {
      hasNextPage = false;
    }
  }

  console.log(`✅ Found ${allVariants.length} variants across all products.`);

  console.log('4. Updating stock to 40 for all variants...');
  for (const variant of allVariants) {
    console.log(`Updating stock for ${variant.productName} - ${variant.variantName || 'Default'} (${variant.variantId})...`);
    
    // First we check if there's an existing stock. If yes, we can update it or just create new.
    // productVariantStocksCreate takes [StockInput!]
    // If it already exists, productVariantStocksUpdate might be needed.
    // Saleor 3.x uses productVariantStocksCreate/Update, but typically you can just use productVariantStocksCreate to set stock.
    // Wait, let's use productVariantStocksCreate or update. A safer way is to fetch the stock ID first, but actually, 
    // there's a simpler mutation: productVariantStocksCreate will fail if it exists. 
    // Let's just create, if it fails because it exists, we fetch stock ID and update it.
    
    // Actually, another way is to query the variant's stock.
    const varStockRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` },
      body: JSON.stringify({
        query: `query { productVariant(id: "${variant.variantId}", channel: "sri-aachi-creatives") { stocks { id warehouse { id } } } }`
      })
    });
    const varStockData = await varStockRes.json();
    const stocks = varStockData.data?.productVariant?.stocks || [];
    const existingStock = stocks.find(s => s.warehouse.id === warehouseId);

    if (existingStock) {
      // Update existing
      const updateRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` },
        body: JSON.stringify({
          query: `mutation { productVariantStocksUpdate(variantId: "${variant.variantId}", stocks: [{ warehouse: "${warehouseId}", quantity: 40 }]) { productVariant { id } errors { field message } } }`
        })
      });
      const updateData = await updateRes.json();
      if (updateData.data?.productVariantStocksUpdate?.errors?.length > 0) {
        console.error(`❌ Error updating stock:`, updateData.data.productVariantStocksUpdate.errors);
      } else {
        console.log(`✅ Updated stock to 40.`);
      }
    } else {
      // Create new
      const createRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` },
        body: JSON.stringify({
          query: `mutation { productVariantStocksCreate(variantId: "${variant.variantId}", stocks: [{ warehouse: "${warehouseId}", quantity: 40 }]) { productVariant { id } errors { field message } } }`
        })
      });
      const createData = await createRes.json();
      if (createData.data?.productVariantStocksCreate?.errors?.length > 0) {
        console.error(`❌ Error creating stock:`, createData.data.productVariantStocksCreate.errors);
      } else {
        console.log(`✅ Created stock of 40.`);
      }
    }
  }

  console.log('\n🎉 ALL PRODUCTS STOCK SET TO 40!');
}

updateStockTo40().catch(console.error);
