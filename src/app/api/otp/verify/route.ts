import { NextRequest, NextResponse } from "next/server";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || "https://sriaachicreatives.udayamarketing.in/graphql/";
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || "5758f5a0-bb40-4ed7-9ccd-9398c84121dc";
const OTP_DOMAIN = "sriaachicreatives.udayamarketing.in";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone = (body.phone || "").replace(/\D/g, "").slice(-10);
    const otp = (body.otp || "").trim();

    if (phone.length !== 10) {
      return NextResponse.json({ success: false, message: "Invalid mobile number." }, { status: 400 });
    }
    if (!otp || otp.length !== 6) {
      return NextResponse.json({ success: false, message: "Please enter the 6-digit OTP." }, { status: 400 });
    }

    const fullPhone = `+91${phone}`;

    // 1. Direct call to OTP Service App verify endpoint
    try {
      const directRes = await fetch("https://otp-app.udayamarketing.in/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, otp, domain: OTP_DOMAIN }),
      });
      const directData = await directRes.json();
      if (directRes.ok && directData?.success) {
        console.log(`\n✅ [Direct OTP Verified] User: ${fullPhone}\n`);
        return NextResponse.json({
          success: true,
          token: directData.token || `session-auth-${phone}-${Date.now()}`,
          user: {
            id: null,
            email: `91${phone}@sriaachicreatives.in`,
            firstName: "",
            lastName: "",
            phone: fullPhone,
          },
          source: "otp-service",
        });
      } else if (directData?.error) {
        console.warn("Direct OTP verify returned error:", directData.error);
      }
    } catch (directErr) {
      console.warn("Direct OTP verify error:", directErr);
    }

    // 2. Saleor Backend otpConfirm mutation
    let errorMessage = "OTP verification failed. Please try again or request a new OTP.";
    
    try {
      const gqlRes = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": TENANT_ID,
        },
        body: JSON.stringify({
          query: `
            mutation OtpConfirm($phone: String!, $otp: String!) {
              otpConfirm(phone: $phone, otp: $otp) {
                token
                refreshToken
                csrfToken
                user {
                  id
                  email
                  firstName
                  lastName
                }
                errors {
                  field
                  message
                  code
                }
              }
            }
          `,
          variables: { phone: fullPhone, otp },
        }),
      });

      const gqlData = await gqlRes.json();
      const confirmResult = gqlData?.data?.otpConfirm;

      if (confirmResult?.token || confirmResult?.user) {
        console.log(`\n✅ [Saleor OTP Verified] User: ${confirmResult.user?.email || fullPhone}\n`);
        return NextResponse.json({
          success: true,
          token: confirmResult.token || `session-auth-${phone}-${Date.now()}`,
          user: {
            id: confirmResult.user?.id || null,
            email: confirmResult.user?.email || `91${phone}@sriaachicreatives.in`,
            firstName: confirmResult.user?.firstName || "",
            lastName: confirmResult.user?.lastName || "",
            phone: fullPhone,
          },
          source: "saleor",
        });
      } else if (confirmResult?.errors?.length > 0) {
        errorMessage = confirmResult.errors[0].message || errorMessage;
      }
    } catch (saleorErr) {
      console.warn("Saleor otpConfirm fetch failed:", saleorErr);
    }

    return NextResponse.json({ success: false, message: errorMessage }, { status: 400 });
  } catch (err) {
    console.error("OTP verify error:", err);
    return NextResponse.json({ success: false, message: "Verification failed. Please try again." }, { status: 500 });
  }
}
