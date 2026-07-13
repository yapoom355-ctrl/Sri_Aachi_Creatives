// Test what happens when we send empty string vs no auth header
const fetch = require('node-fetch');

async function testProductsNoAuth() {
  const query = `query { products { id title price } }`;
  const res = await fetch('https://gubera-2-0-backend-fastapi-graphql.vercel.app/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': '4c7b9c85-0963-49ba-bd2f-7776a0be4b71',
      // No authorization header at all
    },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  console.log('=== Products WITHOUT auth header ===');
  console.log(JSON.stringify(data, null, 2));
}

async function testProductsEmptyAuth() {
  const query = `query { products { id title price } }`;
  const res = await fetch('https://gubera-2-0-backend-fastapi-graphql.vercel.app/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': '4c7b9c85-0963-49ba-bd2f-7776a0be4b71',
      'authorization': '',  // Empty string - causes "Invalid token format"
    },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  console.log('=== Products WITH empty auth header ===');
  console.log(JSON.stringify(data, null, 2));
}

testProductsNoAuth().then(() => testProductsEmptyAuth()).catch(console.error);
