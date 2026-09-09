import { NextResponse } from 'next/server';

/**
 * Saleor App Manifest
 * Conforming to Saleor 3.x App Manifest schema.
 * https://docs.saleor.io/developer/extending/apps/manifest
 */
export async function GET(request: Request) {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const manifest = {
    id: 'in.sriaachicreatives.shiprocket',
    version: '1.0.0',
    name: 'Shiprocket Shipping Extension',
    about: 'Automated order courier dispatch, AWB generation, and shipment tracking via Shiprocket for Sri Aachi Creatives.',
    permissions: ['MANAGE_ORDERS', 'MANAGE_SHIPPING'],
    appUrl: `${baseUrl}/shiprocket`,
    configurationUrl: `${baseUrl}/shiprocket/settings`,
    tokenTargetUrl: `${baseUrl}/api/shiprocket/register`,
    dataPrivacy: 'https://sriaachicreatives.com/privacy',
    dataPrivacyUrl: 'https://sriaachicreatives.com/privacy',
    homepageUrl: 'https://sriaachicreatives.com',
    supportUrl: 'https://sriaachicreatives.com/contact',
    webhooks: [
      {
        name: 'Shiprocket Order Dispatch',
        asyncEvents: ['ORDER_CONFIRMED', 'ORDER_FULLY_PAID'],
        targetUrl: `${baseUrl}/api/shiprocket/webhook`,
        isActive: true,
        query: `
          subscription {
            event {
              ... on OrderConfirmed {
                order {
                  id
                  number
                  created
                  status
                  total {
                    gross {
                      amount
                      currency
                    }
                  }
                  shippingAddress {
                    firstName
                    lastName
                    streetAddress1
                    streetAddress2
                    city
                    countryArea
                    postalCode
                    phone
                  }
                  userEmail
                  lines {
                    id
                    productName
                    variantName
                    quantity
                    unitPrice {
                      gross {
                        amount
                      }
                    }
                  }
                }
              }
            }
          }
        `,
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  });
}
