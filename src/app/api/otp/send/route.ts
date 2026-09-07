import { NextRequest, NextResponse } from "next/server";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || "https://sriaachicreatives.udayamarketing.in/graphql/";
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || "5758f5a0-bb40-4ed7-9ccd-9398c84121dc";
const OTP_DOMAIN = "sriaachicreatives.udayamarketing.in";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = (body.phone || "").replace(/\D/g, "").slice(-10);

    if (phone.length !== 10) {
      return NextResponse.json({ success: false, message: "Invalid mobile number." }, { status: 400 });
    }

    const fullPhone = `+91${phone}`;
    console.log(`\n📱 [OTP Request] Phone: ${fullPhone}\n`);

    // 1. Direct call to OTP Service App with domain parameter
    let otpServiceDispatched = false;
    let errorMessage = "Failed to send OTP.";

    try {
      const directRes = await fetch("https://otp-app.udayamarketing.in/api/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, domain: OTP_DOMAIN }),
      });
      const directData = await directRes.json();
      if (directData?.success) {
        console.log(`📱 [Direct OTP Service] Dispatched to carrier for ${fullPhone}`);
        otpServiceDispatched = true;
      }
    } catch (directErr) {
      console.warn("Direct OTP Service call error:", directErr);
    }

    // 2. Saleor Backend otpRequest mutation
    if (!otpServiceDispatched) {
      try {
        const gqlRes = await fetch(GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-tenant-id": TENANT_ID,
          },
          body: JSON.stringify({
            query: `
              mutation OtpRequest($phone: String!) {
                otpRequest(phone: $phone) {
                  success
                  errors {
                    field
                    message
                    code
                  }
                }
              }
            `,
            variables: { phone: fullPhone },
          }),
        });

        const gqlData = await gqlRes.json();
        const otpResult = gqlData?.data?.otpRequest;
        
        if (otpResult?.success) {
          console.log(`📱 [Saleor OTP] Dispatched via Saleor for ${fullPhone}`);
          otpServiceDispatched = true;
        } else if (otpResult?.errors?.length > 0) {
          errorMessage = otpResult.errors[0].message || errorMessage;
          console.error("Saleor OTP Request Errors:", otpResult.errors);
        }
      } catch (saleorErr) {
        console.warn("Saleor otpRequest fetch failed:", saleorErr);
      }
    }

    if (!otpServiceDispatched) {
      return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent to +91 ${phone}`
    });
  } catch (err) {
    console.error("OTP send error:", err);
    return NextResponse.json({ success: false, message: "Failed to generate OTP." }, { status: 500 });
  }
}
