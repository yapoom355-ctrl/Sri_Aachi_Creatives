/**
 * Saleor Order Fulfillment Helper for Sri Aachi Creatives
 * Updates order fulfillments and tracking numbers in Saleor backend.
 */

const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://sriaachicreatives.udayamarketing.in/graphql/';

let cachedStaffToken: string | null = null;
let staffTokenExpiry: number = 0;

/**
 * Get an authenticated staff JWT token to execute backend mutations.
 */
export async function getSaleorStaffToken(): Promise<string | null> {
  const email = process.env.SALEOR_STAFF_EMAIL || 'sriaachicreatives@gmail.com';
  const password = process.env.SALEOR_STAFF_PASSWORD || '1234567890';

  if (cachedStaffToken && Date.now() < staffTokenExpiry) {
    return cachedStaffToken;
  }

  try {
    const res = await fetch(GRAPHQL_URL, {
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
        variables: { email, password },
      }),
    });

    const data = await res.json();
    const token = data?.data?.tokenCreate?.token;
    if (!token) {
      console.error('[Saleor Staff Login Error]', data?.data?.tokenCreate?.errors);
      return null;
    }

    cachedStaffToken = token;
    staffTokenExpiry = Date.now() + 25 * 60 * 1000; // 25 mins
    return cachedStaffToken;
  } catch (error) {
    console.error('[Saleor Staff Login Exception]', error);
    return null;
  }
}

/**
 * Fulfill an order in Saleor with an AWB tracking number.
 */
export async function fulfillSaleorOrder(orderId: string, trackingNumber: string) {
  const token = await getSaleorStaffToken();
  if (!token) {
    return { success: false, message: 'Could not obtain Saleor staff token' };
  }

  // First, fetch order lines so we know what lines to fulfill
  try {
    const orderRes = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify({
        query: `
          query GetOrderLines($id: ID!) {
            order(id: $id) {
              id
              lines {
                id
                quantity
              }
              fulfillments {
                id
                status
                trackingNumber
              }
            }
          }
        `,
        variables: { id: orderId },
      }),
    });

    const orderData = await orderRes.json();
    const order = orderData?.data?.order;
    if (!order) {
      return { success: false, message: 'Order not found in Saleor' };
    }

    const linesToFulfill = (order.lines || []).map((l: any) => ({
      orderLineId: l.id,
      stocks: [{ quantity: l.quantity, warehouse: undefined }],
    }));

    // Call orderFulfill
    const fulfillRes = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}`,
      },
      body: JSON.stringify({
        query: `
          mutation FulfillOrder($orderId: ID!, $input: OrderFulfillInput!) {
            orderFulfill(order: $orderId, input: $input) {
              fulfillments {
                id
                status
                trackingNumber
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
          orderId: order.id,
          input: {
            trackingNumber: trackingNumber,
            notifyCustomer: true,
            allowStockToBeExceeded: true,
            lines: (order.lines || []).map((l: any) => ({
              orderLineId: l.id,
              stocks: [],
            })),
          },
        },
      }),
    });

    const fulfillData = await fulfillRes.json();
    const errors = fulfillData?.data?.orderFulfill?.errors;
    if (errors && errors.length > 0) {
      console.warn('[Saleor Fulfill Warning]', errors);
      return { success: false, errors };
    }

    return {
      success: true,
      fulfillments: fulfillData?.data?.orderFulfill?.fulfillments,
    };
  } catch (error) {
    console.error('[Saleor Fulfill Exception]', error);
    return { success: false, error };
  }
}
