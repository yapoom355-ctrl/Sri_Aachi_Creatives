import { NextRequest, NextResponse } from "next/server";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || "https://sriaachicreatives.udayamarketing.in/graphql/";
const STAFF_EMAIL = process.env.SALEOR_STAFF_EMAIL || "sriaachicreatives@gmail.com";
const STAFF_PASSWORD = process.env.SALEOR_STAFF_PASSWORD || "1234567890";
const CHANNEL_ID = "Q2hhbm5lbDoy"; // sri-aachi-creatives
const SHIPPING_METHOD_ID = "U2hpcHBpbmdNZXRob2Q6MQ=="; // Default Shipping

async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(25000) });
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

    // 1. Prepare rich customer note with customization info
    const origin = req.nextUrl?.origin || "https://www.sriaachicreatives.in";
    let fullCustomerNote = `Paid via Razorpay (Payment ID: ${razorpayPaymentId || "Verified"})`;
    fullCustomerNote += `\nDelivery Fee: ₹${Number(deliveryFee) || 0}`;
    const customizedLines = lines.filter((l: any) => l.customInstructions || l.customImage);
    if (customizedLines.length > 0) {
      fullCustomerNote += "\n\n=== CUSTOMIZATION DETAILS ===";
      customizedLines.forEach((l: any, idx: number) => {
        fullCustomerNote += `\n[Item ${idx + 1}: ${l.name || "Custom Product"}]`;
        if (l.customInstructions) fullCustomerNote += `\n✍️ Text: ${l.customInstructions}`;
        if (l.customImage) {
          const fullImg = l.customImage.startsWith("http") ? l.customImage : `${origin}${l.customImage}`;
          fullCustomerNote += `\n🖼️ Photo URL: ${fullImg}`;
        }
      });
    }

    const orderMetadata = [
      { key: "delivery_fee", value: String(Number(deliveryFee) || 0) },
      { key: "shipping_fee", value: String(Number(deliveryFee) || 0) },
      { key: "is_free_delivery", value: String(Number(deliveryFee) === 0) },
      { key: "payment_method", value: "RAZORPAY" },
      { key: "razorpay_payment_id", value: String(razorpayPaymentId || "") },
    ];
    if (customizedLines.length > 0) {
      orderMetadata.push(
        { key: "custom_instructions", value: customizedLines.map((l: any) => l.customInstructions).filter(Boolean).join(" | ") },
        { key: "custom_image_url", value: customizedLines.map((l: any) => l.customImage ? (l.customImage.startsWith("http") ? l.customImage : `${origin}${l.customImage}`) : "").filter(Boolean).join(" | ") },
        { key: "custom_design_data", value: JSON.stringify(customizedLines) },
      );
    }

    // 1. Create draft order
    const draftRes = await fetchWithRetry(GRAPHQL_URL, {
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
                lines {
                  id
                  variant {
                    id
                    sku
                    name
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
        variables: {
          input: {
            channelId: CHANNEL_ID,
            userEmail: userEmail || "customer@sriaachicreatives.in",
            shippingAddress: formattedAddress,
            billingAddress: formattedAddress,
            shippingMethod: SHIPPING_METHOD_ID,
            customerNote: fullCustomerNote,
            metadata: orderMetadata,
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
    const orderNumber = draftData?.data?.draftOrderCreate?.order?.number;
    const createdLines = draftData?.data?.draftOrderCreate?.order?.lines || [];

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Draft order creation failed." }, { status: 500 });
    }

    // 2. Attach Customization metadata to each OrderLine so Gift Shop Customizations extension displays it
    const giftsAppLines: any[] = [];
    for (let i = 0; i < createdLines.length; i++) {
      const createdLine = createdLines[i];
      const matchingInput = lines[i] || lines.find((l: any) => l.variantId === createdLine?.variant?.id);
      if (matchingInput && (matchingInput.customInstructions || matchingInput.customImage)) {
        const fullImg = matchingInput.customImage
          ? (matchingInput.customImage.startsWith("http") ? matchingInput.customImage : `${origin}${matchingInput.customImage}`)
          : "";
        const instructions = matchingInput.customInstructions || "";
        const fileName = matchingInput.customImageName || (fullImg ? fullImg.split("/").pop() : "custom_design.jpg");

        try {
          await fetchWithRetry(GRAPHQL_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `JWT ${staffToken}`,
            },
            body: JSON.stringify({
              query: `
                mutation UpdateLineMetadata($id: ID!, $input: [MetadataInput!]!) {
                  updateMetadata(id: $id, input: $input) {
                    errors { field message }
                  }
                }
              `,
              variables: {
                id: createdLine.id,
                input: [
                  { key: "instructions", value: instructions },
                  { key: "custom_instructions", value: instructions },
                  { key: "file_url", value: fullImg },
                  { key: "custom_image_url", value: fullImg },
                  { key: "file_name", value: fileName },
                  { key: "file_size", value: "1048576" },
                ],
              },
            }),
          });
        } catch (e) {
          console.warn("Could not attach line metadata:", e);
        }

        giftsAppLines.push({
          id: createdLine.id,
          variant: {
            sku: createdLine.variant?.sku || matchingInput.variantId || "GENERIC",
            name: createdLine.variant?.name || matchingInput.name || "Custom Item",
          },
          metadata: [
            { key: "instructions", value: instructions },
            { key: "file_url", value: fullImg },
            { key: "file_name", value: fileName },
            { key: "file_size", value: "1048576" },
          ],
        });
      }
    }

    // 3. Attach order-level metadata (delivery fee, payment method, customization)
    try {
      await fetchWithRetry(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${staffToken}`,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateOrderMetadata($id: ID!, $input: [MetadataInput!]!) {
              updateMetadata(id: $id, input: $input) {
                errors { field message }
              }
            }
          `,
          variables: {
            id: orderId,
            input: orderMetadata,
          },
        }),
      });
    } catch (e) {
      console.warn("Could not attach order metadata:", e);
    }

    // 4. Complete draft order → creates confirmed order
    const completeRes = await fetchWithRetry(GRAPHQL_URL, {
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

    const completedOrder = completeData?.data?.draftOrderComplete?.order;

    // 5. Notify Gift Shop Customizations extension directly as fail-safe guarantee
    if (giftsAppLines.length > 0) {
      try {
        await fetch("https://gifts-app.udayamarketing.in/api/webhooks/order-created", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "saleor-domain": "sriaachicreatives.udayamarketing.in",
            "saleor-event": "order_created",
          },
          body: JSON.stringify({
            order: {
              id: orderId,
              number: orderNumber ? String(orderNumber) : String(completedOrder?.number || ""),
              userEmail: userEmail || "customer@sriaachicreatives.in",
              lines: giftsAppLines,
            },
          }),
          signal: AbortSignal.timeout(5000),
        });
      } catch (err) {
        console.warn("Direct Gift Shop Customizations notification failed:", err);
      }
    }

    // 3. Mark order as fully paid in Saleor
    try {
      await fetchWithRetry(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${staffToken}`,
        },
        body: JSON.stringify({
          query: `
            mutation OrderMarkAsPaid($id: ID!, $transactionReference: String) {
              orderMarkAsPaid(id: $id, transactionReference: $transactionReference) {
                order {
                  id
                  isPaid
                  paymentStatus
                }
                errors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            id: orderId,
            transactionReference: razorpayPaymentId || "RAZORPAY_VERIFIED",
          },
        }),
      });
    } catch (e) {
      console.warn("Could not mark order as paid in Saleor:", e);
    }

    // Dispatches order to Shiprocket in the background without holding up the user's screen
    (async () => {
      try {
        const { createShiprocketOrder, generateShiprocketAWB } = await import('@/lib/shiprocket');
        const { fulfillSaleorOrder } = await import('@/lib/saleorFulfillment');
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
