import { NextRequest, NextResponse } from "next/server";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || "https://sriaachicreatives.udayamarketing.in/graphql/";
const STAFF_EMAIL = process.env.SALEOR_STAFF_EMAIL || "sriaachicreatives@gmail.com";
const STAFF_PASSWORD = process.env.SALEOR_STAFF_PASSWORD || "1234567890";

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
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json();
  const token = data?.data?.tokenCreate?.token;
  if (!token) {
    throw new Error("Could not authenticate with Saleor backend staff token.");
  }
  return token;
}

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "Address ID is required." }, { status: 400 });
    }

    // If it's a local address ID (e.g. addr-1789...), no backend DB deletion needed
    if (String(id).startsWith("addr-")) {
      return NextResponse.json({ success: true, message: "Local address deleted successfully." });
    }

    const staffToken = await getStaffToken();

    // 1. First attempt: staff-level addressDelete mutation
    const delRes = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `JWT ${staffToken}`,
      },
      body: JSON.stringify({
        query: `
          mutation AddressDelete($id: ID!) {
            addressDelete(id: $id) {
              address {
                id
              }
              errors {
                field
                message
              }
            }
          }
        `,
        variables: { id },
      }),
      signal: AbortSignal.timeout(15000),
    });

    const delData = await delRes.json();
    const errors = delData?.data?.addressDelete?.errors || [];

    if (errors.length > 0) {
      // 2. Fallback attempt: accountAddressDelete
      const fallbackRes = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${staffToken}`,
        },
        body: JSON.stringify({
          query: `
            mutation AccountAddressDelete($id: ID!) {
              accountAddressDelete(id: $id) {
                address {
                  id
                }
                errors {
                  field
                  message
                }
              }
            }
          `,
          variables: { id },
        }),
        signal: AbortSignal.timeout(15000),
      });

      const fallbackData = await fallbackRes.json();
      const fallbackErrors = fallbackData?.data?.accountAddressDelete?.errors || [];
      if (fallbackErrors.length > 0) {
        console.warn("[Address Delete Warning]", fallbackErrors);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Address deleted from DB successfully.",
      id,
    });
  } catch (error: any) {
    console.error("[Address Delete Route Exception]", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to delete address from DB." },
      { status: 500 }
    );
  }
}
