import { NextResponse } from 'next/server';

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://sriaachicreatives.udayamarketing.in/graphql/';
const CHANNEL = process.env.NEXT_PUBLIC_SALEOR_CHANNEL || 'sri-aachi-creatives';

let cachedKey: string | null = null;
let cacheExpiry: number = 0;

/**
 * Dynamically fetch the Razorpay Public Key directly from Saleor Backend
 * No .env required!
 */
export async function GET() {
  if (cachedKey && Date.now() < cacheExpiry) {
    return NextResponse.json({ key: cachedKey, source: 'cache' });
  }

  try {
    // Query Saleor backend payment gateways
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation {
            checkoutCreate(input: {
              channel: "${CHANNEL}",
              lines: [],
              email: "temp@sriaachicreatives.in"
            }) {
              checkout {
                availablePaymentGateways {
                  id
                  name
                  config {
                    field
                    value
                  }
                }
              }
            }
          }
        `,
      }),
    });

    const data = await res.json();
    const gateways = data?.data?.checkoutCreate?.checkout?.availablePaymentGateways || [];
    const razorpayGateway = gateways.find(
      (g: any) =>
        g.id?.toLowerCase().includes('razorpay') ||
        g.name?.toLowerCase().includes('razorpay')
    );

    const apiKeyConfig = razorpayGateway?.config?.find(
      (c: any) => c.field === 'api_key' || c.field === 'public_key' || c.field === 'key_id'
    );

    if (apiKeyConfig?.value) {
      cachedKey = apiKeyConfig.value;
      cacheExpiry = Date.now() + 10 * 60 * 1000; // cache for 10 mins
      return NextResponse.json({ key: cachedKey, source: 'saleor_backend' });
    }
  } catch (error) {
    console.error('[Razorpay Key Fetch Error from Saleor]', error);
  }

  // Fallback to env if backend query fails
  const fallbackKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_TTugxbb85oHrLR';
  return NextResponse.json({ key: fallbackKey, source: 'fallback' });
}
