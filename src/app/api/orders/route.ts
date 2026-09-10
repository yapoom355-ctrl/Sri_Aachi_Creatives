import { NextRequest, NextResponse } from "next/server";

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

function getStatusCategory(status: string): "Active" | "Completed" | "Cancelled" {
  const s = (status || "").toUpperCase();
  if (s === "FULFILLED" || s === "DELIVERED" || s === "COMPLETED") {
    return "Completed";
  }
  if (s === "CANCELED" || s === "CANCELLED" || s === "REFUNDED" || s === "FAILED") {
    return "Cancelled";
  }
  return "Active";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "";
    const phone = searchParams.get("phone") || "";
    const orderIdsParam = searchParams.get("orderIds") || "";
    const explicitIds = orderIdsParam ? orderIdsParam.split(",").map((s) => s.trim()).filter(Boolean) : [];

    return await handleOrdersQuery({ email, phone, orderIds: explicitIds });
  } catch (error: any) {
    console.error("[Orders API GET Error]:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to fetch orders." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email || "";
    const phone = body.phone || "";
    const orderIds = Array.isArray(body.orderIds) ? body.orderIds : [];

    return await handleOrdersQuery({ email, phone, orderIds });
  } catch (error: any) {
    console.error("[Orders API POST Error]:", error);
    return NextResponse.json({ success: false, message: error.message || "Failed to fetch orders." }, { status: 500 });
  }
}

async function handleOrdersQuery({
  email,
  phone,
  orderIds,
}: {
  email: string;
  phone: string;
  orderIds: string[];
}) {
  const staffToken = await getStaffToken();

  const query = `
    query GetOrdersList {
      orders(first: 100, channel: "sri-aachi-creatives", sortBy: { field: CREATION_DATE, direction: DESC }) {
        edges {
          node {
            id
            number
            created
            status
            isPaid
            paymentStatus
            userEmail
            customerNote
            shippingPrice {
              gross {
                amount
                currency
              }
            }
            total {
              gross {
                amount
                currency
              }
            }
            subtotal {
              gross {
                amount
                currency
              }
            }
            shippingAddress {
              firstName
              lastName
              phone
              streetAddress1
              streetAddress2
              city
              postalCode
              countryArea
            }
            metadata {
              key
              value
            }
            fulfillments {
              id
              status
              statusDisplay
              trackingNumber
              created
            }
            lines {
              id
              productName
              quantity
              thumbnail(size: 512) {
                url
                alt
              }
              unitPrice {
                gross {
                  amount
                  currency
                }
              }
              metadata {
                key
                value
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetchWithRetry(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `JWT ${staffToken}`,
    },
    body: JSON.stringify({ query }),
  });

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    console.error("[Orders API GraphQL Error]:", json.errors);
    return NextResponse.json({ success: false, message: json.errors[0]?.message || "GraphQL query failed" }, { status: 500 });
  }

  const rawOrders = json?.data?.orders?.edges?.map((e: any) => e.node) || [];

  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const normalizedEmail = email.trim().toLowerCase();

  const filteredOrders = rawOrders.filter((o: any) => {
    // 1. Check explicit order IDs or order numbers
    if (orderIds.length > 0) {
      if (orderIds.includes(o.id) || orderIds.includes(String(o.number))) {
        return true;
      }
    }

    // 2. Match by email
    const orderEmail = (o.userEmail || "").trim().toLowerCase();
    if (normalizedEmail && orderEmail) {
      if (orderEmail === normalizedEmail) return true;
    }

    // 3. Match by phone
    if (cleanPhone) {
      // Check phone in email format (e.g. 916382863850@sriaachicreatives.in)
      if (orderEmail.includes(cleanPhone)) return true;

      // Check shipping address phone
      const addrPhone = (o.shippingAddress?.phone || "").replace(/\D/g, "").slice(-10);
      if (addrPhone && addrPhone === cleanPhone) return true;
    }

    // If neither email, phone, nor orderIds were passed, return all if explicitly empty
    if (!normalizedEmail && !cleanPhone && orderIds.length === 0) {
      return false;
    }

    return false;
  });

  // Map to clean front-end structure
  const mappedOrders = filteredOrders.map((o: any) => {
    const category = getStatusCategory(o.status);

    // Parse delivery fee from metadata or shippingPrice or note
    const deliveryFeeMeta = o.metadata?.find((m: any) => m.key === "delivery_fee" || m.key === "shipping_fee")?.value;
    let deliveryFee = 0;
    if (deliveryFeeMeta !== undefined && deliveryFeeMeta !== null && deliveryFeeMeta !== "") {
      deliveryFee = Number(deliveryFeeMeta) || 0;
    } else if (o.shippingPrice?.gross?.amount) {
      deliveryFee = Number(o.shippingPrice.gross.amount) || 0;
    }

    const items = (o.lines || []).map((line: any) => {
      const customInstructions = line.metadata?.find((m: any) => m.key === "instructions" || m.key === "custom_instructions")?.value || "";
      const customImage = line.metadata?.find((m: any) => m.key === "file_url" || m.key === "custom_image_url")?.value || "";

      return {
        id: line.id,
        name: line.productName || "Product",
        quantity: line.quantity || 1,
        price: line.unitPrice?.gross?.amount ? `₹${line.unitPrice.gross.amount}` : "₹0",
        numericPrice: Number(line.unitPrice?.gross?.amount || 0),
        image: line.thumbnail?.url || "/images/motor-engine-table-3.webp",
        customInstructions,
        customImage,
      };
    });

    // Formatting date
    const dateFormatted = o.created
      ? new Date(o.created).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
      : "Recent";

    const isRazorpay = Boolean(
      o.isPaid ||
      o.paymentStatus === "FULLY_CHARGED" ||
      o.paymentStatus === "PAID" ||
      o.metadata?.some((m: any) => m.key === "payment_method" && m.value === "RAZORPAY") ||
      o.metadata?.some((m: any) => m.key === "razorpay_payment_id") ||
      (o.customerNote && o.customerNote.toLowerCase().includes("razorpay"))
    );

    return {
      id: o.id,
      number: String(o.number || o.id.slice(0, 8)),
      date: dateFormatted,
      created: o.created,
      status: o.status,
      statusCategory: category,
      isPaid: isRazorpay || Boolean(o.isPaid),
      paymentStatus: isRazorpay ? "FULLY_CHARGED" : (o.paymentStatus || "UNPAID"),
      paymentMethodDisplay: isRazorpay ? "Paid Online (Razorpay)" : "Cash on Delivery",
      total: `₹${o.total?.gross?.amount ?? 0}`,
      numericTotal: Number(o.total?.gross?.amount || 0),
      deliveryFee,
      customerNote: o.customerNote || "",
      shippingAddress: o.shippingAddress,
      fulfillments: o.fulfillments || [],
      items,
      canCancel: category === "Active",
    };
  });

  return NextResponse.json({
    success: true,
    orders: mappedOrders,
    count: mappedOrders.length,
  });
}
