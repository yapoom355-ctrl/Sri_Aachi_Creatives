const fs = require('fs');

// Load environment variables manually
if (fs.existsSync('.env')) {
  const envConfig = fs.readFileSync('.env', 'utf8');
  envConfig.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim();
      }
    }
  });
}

async function testBackend() {
  console.log('--- 1. Testing Saleor Staff Authentication ---');
  const email = process.env.SALEOR_STAFF_EMAIL || 'sriaachicreatives@gmail.com';
  const password = process.env.SALEOR_STAFF_PASSWORD || '1234567890';
  
  const res = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        mutation StaffLogin($email: String!, $password: String!) {
          tokenCreate(email: $email, password: $password) {
            token
            errors { field message }
          }
        }
      `,
      variables: { email, password }
    })
  });

  const data = await res.json();
  const token = data?.data?.tokenCreate?.token;
  if (token) {
    console.log('✅ Saleor Staff Auth Token retrieved successfully!');
    console.log('   Token prefix:', token.slice(0, 25) + '...');
  } else {
    console.error('❌ Failed to retrieve Saleor Staff Token:', data);
  }

  console.log('\n--- 2. Checking Shiprocket Configuration ---');
  const srEmail = process.env.SHIPROCKET_EMAIL;
  const srPass = process.env.SHIPROCKET_PASSWORD;
  const srLocation = process.env.SHIPROCKET_PICKUP_LOCATION;

  console.log('   SHIPROCKET_EMAIL:', srEmail ? 'Configured (' + srEmail + ')' : '⚠️ Not set yet in .env');
  console.log('   SHIPROCKET_PASSWORD:', srPass ? 'Configured (*****)' : '⚠️ Not set yet in .env');
  console.log('   SHIPROCKET_PICKUP_LOCATION:', srLocation || 'Primary');

  console.log('\n--- 3. Testing Local Dev Server Endpoints ---');
  try {
    const manifestRes = await fetch('http://localhost:3000/api/shiprocket/manifest');
    if (manifestRes.ok) {
      const manifest = await manifestRes.json();
      console.log('✅ Manifest endpoint accessible: /api/shiprocket/manifest');
      console.log('   App Name:', manifest.name);
      console.log('   App ID:', manifest.id);
      console.log('   Permissions:', manifest.permissions.join(', '));
      console.log('   Webhooks configured:', manifest.webhooks.length);
    } else {
      console.log('ℹ️ Local server responded with status:', manifestRes.status);
    }
  } catch (err) {
    console.log('ℹ️ Next.js dev server status: (restart might be needed if port differs)');
  }
}

testBackend().catch(console.error);
