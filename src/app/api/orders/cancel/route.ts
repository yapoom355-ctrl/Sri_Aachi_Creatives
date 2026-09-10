import { NextRequest, NextResponse } from "next/server";
import { getShiprocketToken } from "@/lib/shiprocket";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || "https://sriaachicreatives.udayamarketing.in/graphql/";
const STAFF_EMAIL = process.env.SALEOR_STAFF_EMAIL || "sriaachicreatives@gmail.com";
const STAFF_PASSWORD = process.env.SALEOR_STAFF_PASSWORD || "1234567890";

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(20000) });
      return res;
    } catch (err) {
      lastError = err;
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }
  throw lastError;
}

async function getStaffToken(): Promise<string> {
  const res = await fetchWithRetry(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation TokenCreate($email: String!, $password: String!) {
          tokenCreate(email: $email, password: $password) {
            token
            errors {
              field
              message
            }
          }
        }
      `,
      variables: { email: STAFF_EMAIL, password: STAFF_PASSWORD },
    }),
  });
  const data = await res.json();
  const token = data?.data?.tokenCreate?.token;
  if (!token) {
    throw new Error("Could not authenticate with Saleor backend.");
  }
  return token;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { orderId, reason } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required to cancel." }, { status: 400 });
    }

    const staffToken = await getStaffToken();

    // If orderId was passed as a simple number e.g. "11", find its Saleor global ID
    if (!orderId.startsWith("T3JkZXI") && !orderId.includes(":")) {
      const findRes = await fetchWithRetry(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${staffToken}`,
        },
        body: JSON.stringify({
          query: `
            query FindOrderByNumber($number: String!) {
              orders(first: 1, filter: { numbers: [$number] }, channel: "sri-aachi-creatives") {
                edges {
                  node {
                    id
                    status
                  }
                }
              }
            }
          `,
          variables: { number: String(orderId) },
        }),
      });
      const findData = await findRes.json();
      const node = findData?.data?.orders?.edges?.[0]?.node;
      if (node) {
        orderId = node.id;
      }
    }

    // 1. Fetch current order details to get metadata / shiprocket info
    let shiprocketOrderId: string | null = null;
    try {
      const orderRes = await fetchWithRetry(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${staffToken}`,
        },
        body: JSON.stringify({
          query: `
            query GetOrderMetadata($id: ID!) {
              order(id: $id) {
                id
                number
                status
                metadata { key value }
              }
            }
          `,
          variables: { id: orderId },
        }),
      });
      const orderData = await orderRes.json();
      const metadata = orderData?.data?.order?.metadata || [];
      const srMeta = metadata.find((m: any) => m.key === "shiprocket_order_id");
      if (srMeta?.value) {
        shiprocketOrderId = srMeta.value;
      }
    } catch (e) {
      console.warn("Could not prefetch order metadata:", e);
    }

    // 2. Execute Saleor orderCancel mutation
    const cancelRes = await fetchWithRetry(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${staffToken}`,
      },
      body: JSON.stringify({
        query: `
          mutation OrderCancel($id: ID!) {
            orderCancel(id: $id) {
              order {
                id
                number
                status
              }
              errors {
                field
                message
              }
            }
          }
        `,
        variables: { id: orderId },
      }),
    });

    const cancelData = await cancelRes.json();
    const errors = cancelData?.data?.orderCancel?.errors || [];
    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: errors.map((e: any) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const cancelledOrder = cancelData?.data?.orderCancel?.order;
    if (!cancelledOrder) {
      return NextResponse.json(
        { success: false, message: "Order could not be cancelled." },
        { status: 400 }
      );
    }

    // 3. Update cancellation metadata
    try {
      await fetchWithRetry(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${staffToken}`,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateCancelMetadata($id: ID!, $input: [MetadataInput!]!) {
              updateMetadata(id: $id, input: $input) {
                errors { field message }
              }
            }
          `,
          variables: {
            id: orderId,
            input: [
              { key: "cancellation_reason", value: reason || "Cancelled by customer" },
              { key: "cancelled_at", value: new Date().toISOString() },
            ],
          },
        }),
      });
    } catch (e) {
      console.warn("Could not update cancellation metadata:", e);
    }

    // 4. Cancel on Shiprocket if shipment ID exists
    if (shiprocketOrderId) {
      try {
        const srToken = await getShiprocketToken();
        if (srToken) {
          await fetch("https://apiv2.shiprocket.in/v1/external/orders/cancel", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${srToken}`,
            },
            body: JSON.stringify({ ids: [shiprocketOrderId] }),
          });
        }
      } catch (srErr) {
        console.warn("Shiprocket cancellation failed:", srErr);
      }
    }

    return NextResponse.json({
      success: true,
      order: cancelledOrder,
      message: `Order #${cancelledOrder.number} has been cancelled successfully.`,
    });
  } catch (error: any) {
    console.error("[Order Cancel API Exception]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to cancel order." },
      { status: 500 }
    );
  }
}
