async function testCheckoutFlow() {
  console.log('Testing End-to-End COD Checkout with Shiprocket Sync...');
  
  const payload = {
    userEmail: 'customer@sriaachicreatives.in',
    customerNote: 'Automated test order with Shiprocket sync',
    address: {
      customerName: 'Kavitha Chinnaswami',
      phoneNumber: '916366858878',
      addressLine1: 'No 45, Gandhi Street',
      addressLine2: 'Near Bus Stand',
      district: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
    },
    lines: [
      {
        variantId: 'UHJvZHVjdFZhcmlhbnQ6MQ==',
        quantity: 1,
        productName: 'Personalized Resin Block',
        price: 699,
      },
    ],
  };

  try {
    const res = await fetch('http://localhost:3000/api/checkout/cod', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('Checkout API Response:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Checkout API error:', err);
  }
}

setTimeout(testCheckoutFlow, 2000);
