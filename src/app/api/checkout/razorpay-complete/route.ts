import { NextRequest, NextResponse } from "next/server";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || "https://sriaachicreatives.udayamarketing.in/graphql/";
const STAFF_EMAIL = process.env.SALEOR_STAFF_EMAIL || "sriaachicreatives@gmail.com";
const STAFF_PASSWORD = process.env.SALEOR_STAFF_PASSWORD || "1234567890";
const CHANNEL_ID = "Q2hhbm5lbDoy"; // sri-aachi-creatives
const SHIPPING_METHOD_ID = "U2hpcHBpbmdNZXRob2Q6MQ=="; // Default Shipping

async function getStaffToken(): Promise<string> {
  const res = await fetch(GRAPHQL_URL, {
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
    throw new Error("Could not authenticate backend order processor.");
  }
  return token;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, lines, userEmail, razorpayPaymentId, deliveryFee } = body;

    if (!address) {
      return NextResponse.json({ success: false, message: "Delivery address is required." }, { status: 400 });
    }
    if (!lines || lines.length === 0) {
      return NextResponse.json({ success: false, message: "Cart has no items." }, { status: 400 });
    }

    const staffToken = await getStaffToken();

    const nameParts = (address.customerName || "Customer").trim().split(" ");
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "";

    const formattedAddress = {
      firstName,
      lastName,
      streetAddress1: address.addressLine1 || "",
      streetAddress2: address.addressLine2 || "",
      city: address.district || "",
      countryArea: address.state || "",
      postalCode: address.pincode || "",
      country: "IN",
      phone: address.phoneNumber || "",
    };

    // 1. Create draft order
    const draftRes = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${staffToken}`,
      },
      body: JSON.stringify({
        query: `
          mutation DraftOrderCreate($input: DraftOrderCreateInput!) {
            draftOrderCreate(input: $input) {
              order {
                id
                number
              }
              errors {
                field
                message
              }
            }
          }
        `,
        variables: {
          input: {
            channelId: CHANNEL_ID,
            userEmail: userEmail || "customer@sriaachicreatives.in",
            shippingAddress: formattedAddress,
            billingAddress: formattedAddress,
            shippingMethod: SHIPPING_METHOD_ID,
            customerNote: `Paid via Razorpay (Payment ID: ${razorpayPaymentId || "Verified"})`,
            lines: lines.map((l: any) => ({
              variantId: l.variantId,
              quantity: l.quantity || 1,
            })),
          },
        },
      }),
    });

    const draftData = await draftRes.json();
    const draftErrors = draftData?.data?.draftOrderCreate?.errors || [];
    if (draftErrors.length > 0) {
      const msg = draftErrors.map((e: any) => e.message).join(", ");
      return NextResponse.json({ success: false, message: msg }, { status: 400 });
    }

    const orderId = draftData?.data?.draftOrderCreate?.order?.id;
    if (!orderId) {
      return NextResponse.json({ success: false, message: "Draft order creation failed." }, { status: 500 });
    }

    // 2. Complete draft order → creates confirmed order
    const completeRes = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${staffToken}`,
      },
      body: JSON.stringify({
        query: `
          mutation DraftOrderComplete($id: ID!) {
            draftOrderComplete(id: $id) {
              order {
                id
                number
                status
                paymentStatus
                total {
                  gross {
                    amount
                    currency
                  }
                }
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

    const completeData = await completeRes.json();
    const completeErrors = completeData?.data?.draftOrderComplete?.errors || [];
    if (completeErrors.length > 0) {
      const msg = completeErrors.map((e: any) => e.message).join(", ");
      return NextResponse.json({ success: false, message: msg }, { status: 400 });
    }

    // 3. Mark order as fully paid in Saleor
    try {
      await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${staffToken}`,
        },
        body: JSON.stringify({
          query: `
            mutation OrderCapture($orderId: ID!) {
              orderCapture(id: $orderId) {
                order {
                  id
                  paymentStatus
                }
                errors {
                  field
                  message
                }
              }
            }
          `,
          variables: { orderId },
        }),
      });
    } catch {
      // Non-blocking
    }

    const completedOrder = completeData?.data?.draftOrderComplete?.order;

    // Dispatches order to Shiprocket in the background without holding up the user's screen
    (async () => {
      try {
        const { createShiprocketOrder, generateShiprocketAWB } = await import('@/lib/shiprocket');
        const itemsTotal = lines.reduce((sum: number, l: any) => sum + (Number(l.unitPrice || l.price || 0) * Number(l.quantity || 1)), 0);
        const orderBaseTotal = Number(completedOrder?.total?.gross?.amount || itemsTotal || 1);
        const finalSubTotal = Math.round(orderBaseTotal + (Number(deliveryFee) || 0));

        const srRes = await createShiprocketOrder({
          orderId: completedOrder?.id || orderId,
          orderNumber: completedOrder?.number || orderId,
          paymentMethod: 'Prepaid',
          subTotal: finalSubTotal,
          customer: {
            firstName,
            lastName,
            email: userEmail || 'customer@sriaachicreatives.in',
            phone: address.phoneNumber || '',
            streetAddress1: address.addressLine1 || '',
            streetAddress2: address.addressLine2 || '',
            city: address.district || '',
            state: address.state || '',
            postalCode: address.pincode || '',
          },
          items: lines.map((l: any, i: number) => ({
            name: l.productName || l.name || `Product Item ${i + 1}`,
            sku: l.sku || `SKU-${l.variantId?.slice(-6) || i + 1}`,
            units: l.quantity || 1,
            selling_price: l.unitPrice || l.price || 100,
          })),
        });

        if (srRes.success && srRes.shipment_id) {
          const awbRes = await generateShiprocketAWB(srRes.shipment_id);
          if (awbRes.success && awbRes.awbCode) {
            await fulfillSaleorOrder(completedOrder?.id || orderId, awbRes.awbCode);
          }
        }
      } catch (srErr) {
        console.warn('[Shiprocket Background Prepaid Sync Notice]', srErr);
      }
    })();

    return NextResponse.json({
      success: true,
      orderId: completedOrder?.id || orderId,
      orderNumber: completedOrder?.number,
      status: completedOrder?.status,
      paymentStatus: completedOrder?.paymentStatus,
    });
  } catch (err: any) {
    console.error("Razorpay complete route error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Order recording failed." },
      { status: 500 }
    );
  }
}
