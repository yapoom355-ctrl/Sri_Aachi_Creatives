const fs = require('fs');

async function registerAppInSaleor() {
  console.log('Authenticating with Saleor backend as Staff Admin...');
  
  // 1. Staff Login
  const loginRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
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
      variables: {
        email: 'sriaachicreatives@gmail.com',
        password: '1234567890',
      },
    }),
  });

  const loginData = await loginRes.json();
  const token = loginData?.data?.tokenCreate?.token;

  if (!token) {
    console.error('Login failed:', loginData);
    process.exit(1);
  }

  console.log('✅ Staff token acquired!');

  // 2. Check existing apps
  console.log('\nChecking currently installed apps...');
  const appsRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify({
      query: `
        query {
          apps(first: 20) {
            edges {
              node {
                id
                name
                isActive
                type
                permissions {
                  code
                  name
                }
              }
            }
          }
        }
      `,
    }),
  });

  const appsData = await appsRes.json();
  const existingApps = appsData?.data?.apps?.edges || [];
  console.log(`Found ${existingApps.length} app(s):`, existingApps.map(e => `${e.node.name} (${e.node.id})`));

  const alreadyRegistered = existingApps.find(e => e.node.name.toLowerCase().includes('shiprocket'));
  if (alreadyRegistered) {
    console.log(`\n🎉 Shiprocket App is ALREADY registered in Saleor backend! ID: ${alreadyRegistered.node.id}`);
    return;
  }

  // 3. Create the Shiprocket App in Saleor Backend
  console.log('\nRegistering "Shiprocket Shipping Integration" in Saleor backend...');
  const createRes = await fetch('https://sriaachicreatives.udayamarketing.in/graphql/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify({
      query: `
        mutation CreateShiprocketApp($input: AppInput!) {
          appCreate(input: $input) {
            authToken
            app {
              id
              name
              isActive
              permissions {
                code
                name
              }
            }
            errors {
              field
              message
              code
            }
          }
        }
      `,
      variables: {
        input: {
          name: 'Shiprocket Shipping Integration',
          permissions: ['MANAGE_ORDERS', 'MANAGE_SHIPPING'],
        },
      },
    }),
  });

  const createData = await createRes.json();
  const appResult = createData?.data?.appCreate;

  if (appResult?.errors && appResult.errors.length > 0) {
    console.error('❌ Failed to register app:', appResult.errors);
  } else if (appResult?.app) {
    console.log('\n========================================================');
    console.log('🎉 SUCCESS! Shiprocket App PUSHED TO SALEOR BACKEND!');
    console.log('========================================================');
    console.log('App ID:', appResult.app.id);
    console.log('App Name:', appResult.app.name);
    console.log('Permissions Granted:', appResult.app.permissions.map(p => p.code).join(', '));
    console.log('Auth Token Generated:', appResult.authToken ? appResult.authToken.slice(0, 20) + '...' : 'N/A');
    console.log('\n👉 Open your Saleor Dashboard > Extensions > Installed to see it live!');
  } else {
    console.log('Response:', createData);
  }
}

registerAppInSaleor().catch(console.error);
