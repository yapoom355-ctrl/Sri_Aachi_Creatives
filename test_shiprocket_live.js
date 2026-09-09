const fs = require('fs');

// 1. Load .env
if (fs.existsSync('.env')) {
  const envConfig = fs.readFileSync('.env', 'utf8');
  envConfig.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...vals] = trimmed.split('=');
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
}

const email = process.env.SHIPROCKET_EMAIL;
const password = process.env.SHIPROCKET_PASSWORD;
const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary';

async function runLiveTest() {
  console.log('==================================================');
  console.log('   SHIPROCKET LIVE INTEGRATION TEST');
  console.log('==================================================\n');

  if (!email || !password) {
    console.error('❌ Missing credentials! Please enter SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD in .env');
    process.exit(1);
  }

  console.log(`1. Authenticating as: ${email}...`);

  try {
    const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const authData = await authRes.json();

    if (!authRes.ok || !authData.token) {
      console.error('❌ Shiprocket Login Failed:', authData.message || authData);
      process.exit(1);
    }

    console.log('✅ Authentication SUCCESSFUL!');
    console.log('   JWT Token acquired:', authData.token.slice(0, 25) + '...\n');

    const token = authData.token;

    // 2. Test Fetching Pickup Locations
    console.log('2. Checking Pickup Locations in your Shiprocket account...');
    const pickupRes = await fetch('https://apiv2.shiprocket.in/v1/external/settings/company/pickup', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const pickupData = await pickupRes.json();
    const addresses = pickupData?.data?.shipping_address || [];
    console.log(`   Found ${addresses.length} registered pickup address(es):`);
    addresses.forEach((addr, i) => {
      console.log(`   [${i + 1}] Nickname: "${addr.pickup_location}", City: ${addr.city}, State: ${addr.state}, Pin: ${addr.pin_code}`);
    });

    // 3. Create a Test Order in Shiprocket
    const testOrderNumber = `TEST-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const orderDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const validPickup = addresses.length > 0 ? addresses[0].pickup_location : pickupLocation;

    console.log(`\n3. Creating Test Order (#${testOrderNumber}) using pickup location: "${validPickup}"...`);

    const orderPayload = {
      order_id: testOrderNumber,
      order_date: orderDate,
      pickup_location: validPickup,
      channel_id: '',
      comment: 'API Integration Test Order from Sri Aachi Creatives',
      billing_customer_name: 'Test Customer',
      billing_last_name: 'Aachi',
      billing_address: '123 Main Street',
      billing_city: 'Chennai',
      billing_pincode: '600001',
      billing_state: 'Tamil Nadu',
      billing_country: 'India',
      billing_email: 'test@sriaachicreatives.com',
      billing_phone: '9876543210',
      shipping_is_billing: true,
      order_items: [
        {
          name: 'Resin Memory Block (Sample Test)',
          sku: 'SKU-RESIN-TEST',
          units: 1,
          selling_price: 699,
          discount: 0,
          tax: 0,
        },
      ],
      payment_method: 'COD',
      sub_total: 699,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    };

    const createRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    const createData = await createRes.json();

    if (createRes.ok && createData.order_id) {
      console.log('🎉 SUCCESS! Test Order Created in Shiprocket!');
      console.log('   Shiprocket Order ID:', createData.order_id);
      console.log('   Shiprocket Shipment ID:', createData.shipment_id);
      console.log('   Status:', createData.status);
      console.log('\n👉 You can now log into https://app.shiprocket.in/orders to see this order live in your dashboard!');
    } else {
      console.warn('⚠️ Order creation response:', createData);
    }
  } catch (error) {
    console.error('❌ Test Exception:', error);
  }
}

runLiveTest();
