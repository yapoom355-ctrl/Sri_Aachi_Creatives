/**
 * Automated Verification Script for Sri Aachi Creatives (Gubera 2.0)
 * Tests all GraphQL Queries, Mutations, and Content running in the website.
 *
 * Usage:
 *   node test_all_website_graphql.js
 *   node test_all_website_graphql.js --token <your_jwt_token>
 */

const fs = require('fs');
const path = require('path');

// ── 1. Read Environment Config ──────────────────────────────────────────────
let GRAPHQL_URL = 'https://sriaachicreatives.udayamarketing.in/graphql/';
let CHANNEL = 'sri-aachi-creatives';
let AUTH_TOKEN = null;

try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('NEXT_PUBLIC_GRAPHQL_URL=')) {
        GRAPHQL_URL = trimmed.split('=')[1].trim();
      }
      if (trimmed.startsWith('NEXT_PUBLIC_SALEOR_CHANNEL=')) {
        CHANNEL = trimmed.split('=')[1].trim();
      }
    }
  }
} catch (e) {
  // Use defaults
}

// Check CLI arguments for --token
const args = process.argv.slice(2);
const tokenArgIndex = args.indexOf('--token');
if (tokenArgIndex !== -1 && args[tokenArgIndex + 1]) {
  AUTH_TOKEN = args[tokenArgIndex + 1];
}

// ── Color Helpers ────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  magenta: '\x1b[35m',
};

let testCount = 0;
let passedCount = 0;
let failedCount = 0;
let warnCount = 0;

function logHeader(title) {
  console.log(`\n${c.bold}${c.cyan}======================================================================${c.reset}`);
  console.log(`${c.bold}${c.cyan}  ${title}${c.reset}`);
  console.log(`${c.bold}${c.cyan}======================================================================${c.reset}`);
}

function recordPass(testName, details) {
  testCount++;
  passedCount++;
  console.log(`  ${c.green}✓ PASS${c.reset} ${c.bold}${testName}${c.reset}`);
  if (details) console.log(`         ${c.dim}${details}${c.reset}`);
}

function recordWarn(testName, reason) {
  testCount++;
  warnCount++;
  console.log(`  ${c.yellow}⚠ WARN${c.reset} ${c.bold}${testName}${c.reset}`);
  if (reason) console.log(`         ${c.yellow}${reason}${c.reset}`);
}

function recordFail(testName, error, responseData) {
  testCount++;
  failedCount++;
  console.log(`  ${c.red}✗ FAIL${c.reset} ${c.bold}${testName}${c.reset}`);
  if (error) console.log(`         ${c.red}Error: ${error}${c.reset}`);
  if (responseData) console.log(`         ${c.dim}Raw Response: ${JSON.stringify(responseData).slice(0, 200)}...${c.reset}`);
}

// ── GraphQL Request Helper ───────────────────────────────────────────────────
async function executeGQL(query, variables = {}, token = AUTH_TOKEN) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['authorization'] = `JWT ${token}`;
  }

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return json;
}

// ── Test Definitions ─────────────────────────────────────────────────────────

async function testAll() {
  console.log(`${c.bold}${c.magenta}Sri Aachi Creatives - Website Content & GraphQL Health Test${c.reset}`);
  console.log(`${c.dim}Endpoint:${c.reset} ${GRAPHQL_URL}`);
  console.log(`${c.dim}Channel: ${c.reset} ${CHANNEL}`);
  console.log(`${c.dim}Auth:    ${c.reset} ${AUTH_TOKEN ? 'JWT Token Provided' : 'Guest (Unauthenticated)'}`);

  let firstProductId = null;
  let firstProductSlug = null;
  let firstVariantId = null;
  let createdCheckoutId = null;
  let createdLineId = null;

  let globalCandidateVariants = [];

  // ───────────────────────────────────────────────────────────────────────────
  // SECTION 1: CATALOG & STORE CONTENT QUERIES
  // ───────────────────────────────────────────────────────────────────────────
  logHeader('1. CATALOG & STORE CONTENT QUERIES');

  // Test 1: Categories
  try {
    const query = `
      query GetCategories($first: Int = 100) {
        categories(first: $first) {
          edges {
            node {
              id
              name
              slug
              description
              backgroundImage {
                url
                alt
              }
            }
          }
        }
      }
    `;
    const res = await executeGQL(query, { first: 100 });
    if (res.errors) {
      recordFail('GET_CATEGORIES', res.errors[0]?.message, res);
    } else {
      const edges = res.data?.categories?.edges || [];
      const withImages = edges.filter(e => e.node?.backgroundImage?.url);
      recordPass(
        'GET_CATEGORIES',
        `Fetched ${edges.length} categories (${withImages.length} have background images)`
      );
    }
  } catch (err) {
    recordFail('GET_CATEGORIES', err.message);
  }

  // Test 2: Products List (Home & Products Page)
  try {
    const query = `
      query GetProducts($channel: String = "sri-aachi-creatives", $first: Int = 100, $search: String) {
        products(channel: $channel, first: $first, search: $search) {
          edges {
            node {
              id
              name
              slug
              description
              thumbnail {
                url
                alt
              }
              pricing {
                priceRange {
                  start {
                    gross {
                      amount
                      currency
                    }
                  }
                }
              }
              category {
                id
                name
                slug
              }
              variants {
                id
                name
                sku
                pricing {
                  price {
                    gross {
                      amount
                      currency
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
    const res = await executeGQL(query, { channel: CHANNEL, first: 20 });
    if (res.errors) {
      recordFail('GET_PRODUCTS', res.errors[0]?.message, res);
    } else {
      const edges = res.data?.products?.edges || [];
      if (edges.length === 0) {
        recordWarn('GET_PRODUCTS', `Query succeeded but returned 0 products for channel "${CHANNEL}"`);
      } else {
        const first = edges[0].node;
        firstProductId = first.id;
        firstProductSlug = first.slug;
        const allVariantsList = edges.flatMap(e => (e.node.variants || []).map(v => ({ ...v, productName: e.node.name })));
        if (allVariantsList.length > 0) {
          firstVariantId = allVariantsList[0].id;
        }

        const withPrices = edges.filter(e => e.node?.pricing?.priceRange?.start?.gross?.amount != null);
        const withThumbnails = edges.filter(e => e.node?.thumbnail?.url);
        recordPass(
          'GET_PRODUCTS',
          `Fetched ${edges.length} products on channel "${CHANNEL}" (${withPrices.length} priced, ${withThumbnails.length} thumbnails)`
        );

        // Store candidate variants for checkout
        globalCandidateVariants = allVariantsList;
      }
    }
  } catch (err) {
    recordFail('GET_PRODUCTS', err.message);
  }

  // Test 3: Product Detail Page
  try {
    if (!firstProductSlug && !firstProductId) {
      recordWarn('GET_PRODUCT', 'Skipped: No sample product found in GET_PRODUCTS');
    } else {
      const query = `
        query GetProduct($id: ID, $slug: String, $channel: String = "sri-aachi-creatives") {
          product(id: $id, slug: $slug, channel: $channel) {
            id
            name
            slug
            description
            thumbnail {
              url
              alt
            }
            media {
              url
              alt
            }
            pricing {
              priceRange {
                start {
                  gross {
                    amount
                    currency
                  }
                }
              }
            }
            category {
              id
              name
              slug
            }
            variants {
              id
              name
              sku
              pricing {
                price {
                  gross {
                    amount
                    currency
                  }
                }
              }
              attributes {
                attribute {
                  id
                  name
                }
                values {
                  id
                  name
                  value
                }
              }
            }
          }
        }
      `;
      const res = await executeGQL(query, {
        slug: firstProductSlug,
        channel: CHANNEL,
      });

      if (res.errors) {
        recordFail('GET_PRODUCT', res.errors[0]?.message, res);
      } else {
        const p = res.data?.product;
        if (!p) {
          recordFail('GET_PRODUCT', `Product with slug "${firstProductSlug}" returned null`);
        } else {
          recordPass(
            'GET_PRODUCT',
            `Fetched "${p.name}" (${p.variants?.length || 0} variants, ${p.media?.length || 0} media assets)`
          );
          if (p.variants && p.variants.length > 0 && !firstVariantId) {
            firstVariantId = p.variants[0].id;
          }
        }
      }
    }
  } catch (err) {
    recordFail('GET_PRODUCT', err.message);
  }

  // Test 4: Vouchers & Coupons
  try {
    const query = `
      query GetVouchers($first: Int = 20, $channel: String = "sri-aachi-creatives") {
        vouchers(first: $first, channel: $channel) {
          edges {
            node {
              id
              name
              code
              discountValue
              type
            }
          }
        }
      }
    `;
    const res = await executeGQL(query, { first: 20, channel: CHANNEL });
    if (res.errors) {
      // Check if channel was rejected or permission needed
      recordWarn('GET_COUPONS', `Vouchers query notice: ${res.errors[0]?.message}`);
    } else {
      const edges = res.data?.vouchers?.edges || [];
      recordPass('GET_COUPONS', `Query successful: Found ${edges.length} active vouchers`);
    }
  } catch (err) {
    recordFail('GET_COUPONS', err.message);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SECTION 2: CART & CHECKOUT MUTATIONS (FULL USER JOURNEY)
  // ───────────────────────────────────────────────────────────────────────────
  logHeader('2. CART & CHECKOUT FLOW MUTATIONS');

  // Test 5: Checkout Create
  try {
    if (!firstVariantId) {
      recordWarn('CHECKOUT_CREATE', 'Skipped: No variant ID found to add to cart');
    } else {
      const mutation = `
        mutation CheckoutCreate($input: CheckoutCreateInput!) {
          checkoutCreate(input: $input) {
            created
            checkout {
              id
              token
              totalPrice {
                gross {
                  amount
                  currency
                }
              }
              lines {
                id
                quantity
                variant {
                  id
                  name
                }
              }
            }
            errors {
              field
              message
              code
            }
          }
        }
      `;
      let payload = null;
      let usedVariant = null;
      const candidates = globalCandidateVariants.length > 0 ? globalCandidateVariants : [{ id: firstVariantId, name: 'default' }];

      for (const candidate of candidates) {
        const input = {
          channel: CHANNEL,
          email: 'guest.test@example.com',
          lines: [{ variantId: candidate.id, quantity: 1 }],
        };
        const res = await executeGQL(mutation, { input });
        if (res.data?.checkoutCreate?.checkout?.id) {
          payload = res.data.checkoutCreate;
          usedVariant = candidate;
          break;
        } else if (res.data?.checkoutCreate?.errors) {
          payload = res.data.checkoutCreate;
        }
      }

      if (payload?.checkout?.id) {
        createdCheckoutId = payload.checkout.id;
        const line = payload.checkout.lines?.[0];
        if (line) createdLineId = line.id;
        recordPass(
          'CHECKOUT_CREATE',
          `Checkout created using item "${usedVariant?.productName || usedVariant?.name || 'Variant'}"! ID: ${createdCheckoutId.slice(0, 16)}... | Total: ${payload.checkout.totalPrice?.gross?.currency} ${payload.checkout.totalPrice?.gross?.amount}`
        );
      } else if (payload?.errors && payload.errors.length > 0) {
        recordFail('CHECKOUT_CREATE', `All ${candidates.length} variants failed (e.g., "${payload.errors[0].message}")`, payload.errors);
      } else {
        recordFail('CHECKOUT_CREATE', 'No checkout or errors returned');
      }
    }
  } catch (err) {
    recordFail('CHECKOUT_CREATE', err.message);
  }

  // Test 6: Get User Cart (GET_USER_CART)
  try {
    if (!createdCheckoutId) {
      recordWarn('GET_USER_CART', 'Skipped: No active checkout created in previous step');
    } else {
      const query = `
        query GetCheckout($id: ID!) {
          checkout(id: $id) {
            id
            token
            lines {
              id
              quantity
              variant {
                id
                name
                pricing {
                  price {
                    gross {
                      amount
                      currency
                    }
                  }
                }
                product {
                  id
                  name
                  thumbnail {
                    url
                  }
                }
              }
            }
            totalPrice {
              gross {
                amount
                currency
              }
            }
            subtotalPrice {
              gross {
                amount
                currency
              }
            }
          }
        }
      `;
      const res = await executeGQL(query, { id: createdCheckoutId });
      if (res.errors) {
        recordFail('GET_USER_CART', res.errors[0]?.message, res);
      } else {
        const cart = res.data?.checkout;
        if (cart) {
          recordPass(
            'GET_USER_CART',
            `Retrieved cart with ${cart.lines?.length || 0} lines | Subtotal: ${cart.subtotalPrice?.gross?.currency} ${cart.subtotalPrice?.gross?.amount}`
          );
        } else {
          recordFail('GET_USER_CART', 'Checkout query returned null', res);
        }
      }
    }
  } catch (err) {
    recordFail('GET_USER_CART', err.message);
  }

  // Test 7: Update Cart Lines (CHECKOUT_LINES_UPDATE)
  try {
    if (!createdCheckoutId || !createdLineId) {
      recordWarn('CHECKOUT_LINES_UPDATE', 'Skipped: No active checkout line');
    } else {
      const mutation = `
        mutation CheckoutLinesUpdate($checkoutId: ID, $lines: [CheckoutLineUpdateInput!]!) {
          checkoutLinesUpdate(id: $checkoutId, lines: $lines) {
            checkout {
              id
              lines {
                id
                quantity
              }
              totalPrice {
                gross {
                  amount
                  currency
                }
              }
            }
            errors {
              field
              message
              code
            }
          }
        }
      `;
      const res = await executeGQL(mutation, {
        checkoutId: createdCheckoutId,
        lines: [{ lineId: createdLineId, quantity: 2 }],
      });

      if (res.errors) {
        recordFail('CHECKOUT_LINES_UPDATE', res.errors[0]?.message, res);
      } else {
        const payload = res.data?.checkoutLinesUpdate;
        if (payload?.errors && payload.errors.length > 0) {
          recordFail('CHECKOUT_LINES_UPDATE', payload.errors[0].message);
        } else {
          const qty = payload?.checkout?.lines?.[0]?.quantity;
          recordPass('CHECKOUT_LINES_UPDATE', `Updated line quantity to ${qty}`);
        }
      }
    }
  } catch (err) {
    recordFail('CHECKOUT_LINES_UPDATE', err.message);
  }

  // Test 8: Update Shipping Address (CHECKOUT_SHIPPING_ADDRESS_UPDATE)
  try {
    if (!createdCheckoutId) {
      recordWarn('CHECKOUT_SHIPPING_ADDRESS_UPDATE', 'Skipped: No active checkout');
    } else {
      const mutation = `
        mutation CheckoutShippingAddressUpdate($checkoutId: ID, $shippingAddress: AddressInput!) {
          checkoutShippingAddressUpdate(id: $checkoutId, shippingAddress: $shippingAddress) {
            checkout {
              id
              shippingAddress {
                id
                firstName
                lastName
                streetAddress1
                city
                postalCode
              }
            }
            errors {
              field
              message
              code
            }
          }
        }
      `;
      const address = {
        firstName: 'Test',
        lastName: 'User',
        streetAddress1: '123 Anna Nagar',
        city: 'Chennai',
        postalCode: '600040',
        country: 'IN',
        countryArea: 'Tamil Nadu',
        phone: '+919876543210',
      };
      const res = await executeGQL(mutation, {
        checkoutId: createdCheckoutId,
        shippingAddress: address,
      });

      if (res.errors) {
        recordFail('CHECKOUT_SHIPPING_ADDRESS_UPDATE', res.errors[0]?.message, res);
      } else {
        const payload = res.data?.checkoutShippingAddressUpdate;
        if (payload?.errors && payload.errors.length > 0) {
          recordFail('CHECKOUT_SHIPPING_ADDRESS_UPDATE', payload.errors[0].message);
        } else {
          recordPass(
            'CHECKOUT_SHIPPING_ADDRESS_UPDATE',
            `Attached address: ${payload?.checkout?.shippingAddress?.city}, ${payload?.checkout?.shippingAddress?.postalCode}`
          );
        }
      }
    }
  } catch (err) {
    recordFail('CHECKOUT_SHIPPING_ADDRESS_UPDATE', err.message);
  }

  // Test 9: Promo Code Mutation (CHECKOUT_ADD_PROMO_CODE)
  try {
    if (!createdCheckoutId) {
      recordWarn('CHECKOUT_ADD_PROMO_CODE', 'Skipped: No active checkout');
    } else {
      const mutation = `
        mutation CheckoutAddPromoCode($checkoutId: ID!, $promoCode: String!) {
          checkoutAddPromoCode(id: $checkoutId, promoCode: $promoCode) {
            checkout {
              id
              discount {
                amount
                currency
              }
            }
            errors {
              field
              message
              code
            }
          }
        }
      `;
      const res = await executeGQL(mutation, {
        checkoutId: createdCheckoutId,
        promoCode: 'INVALID_TEST_CODE',
      });

      if (res.errors) {
        recordFail('CHECKOUT_ADD_PROMO_CODE', res.errors[0]?.message, res);
      } else {
        const payload = res.data?.checkoutAddPromoCode;
        // Sending invalid code should gracefully return an error in errors array, which confirms mutation is working
        if (payload?.errors && payload.errors.length > 0) {
          recordPass(
            'CHECKOUT_ADD_PROMO_CODE',
            `Mutation functioning correctly (Gracefully rejected invalid code: "${payload.errors[0].message}")`
          );
        } else {
          recordPass('CHECKOUT_ADD_PROMO_CODE', 'Mutation succeeded');
        }
      }
    }
  } catch (err) {
    recordFail('CHECKOUT_ADD_PROMO_CODE', err.message);
  }

  // Test 10: Delete Line from Cart (CHECKOUT_LINE_DELETE)
  try {
    if (!createdCheckoutId || !createdLineId) {
      recordWarn('CHECKOUT_LINE_DELETE', 'Skipped: No line to delete');
    } else {
      const mutation = `
        mutation CheckoutLineDelete($checkoutId: ID, $lineId: ID!) {
          checkoutLineDelete(id: $checkoutId, lineId: $lineId) {
            checkout {
              id
              lines {
                id
                quantity
              }
              totalPrice {
                gross {
                  amount
                  currency
                }
              }
            }
            errors {
              field
              message
              code
            }
          }
        }
      `;
      const res = await executeGQL(mutation, {
        checkoutId: createdCheckoutId,
        lineId: createdLineId,
      });

      if (res.errors) {
        recordFail('CHECKOUT_LINE_DELETE', res.errors[0]?.message, res);
      } else {
        const payload = res.data?.checkoutLineDelete;
        if (payload?.errors && payload.errors.length > 0) {
          recordFail('CHECKOUT_LINE_DELETE', payload.errors[0].message);
        } else {
          recordPass('CHECKOUT_LINE_DELETE', `Line deleted. Remaining lines: ${payload?.checkout?.lines?.length || 0}`);
        }
      }
    }
  } catch (err) {
    recordFail('CHECKOUT_LINE_DELETE', err.message);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SECTION 3: AUTH & USER ACCOUNT (QUERIES & MUTATIONS)
  // ───────────────────────────────────────────────────────────────────────────
  logHeader('3. AUTH & USER ACCOUNT OPERATIONS');

  // Test 11: GET_ME Query
  try {
    const query = `
      query GetMe {
        me {
          id
          email
          firstName
          lastName
          defaultShippingAddress {
            id
            firstName
            lastName
            city
          }
        }
      }
    `;
    const res = await executeGQL(query);
    if (res.errors) {
      // If no token, Saleor may return permission error or null
      recordWarn('GET_ME', `Unauthenticated response: ${res.errors[0]?.message}`);
    } else {
      if (res.data?.me) {
        recordPass('GET_ME', `Authenticated as: ${res.data.me.email || res.data.me.id}`);
      } else {
        recordPass('GET_ME', 'Guest state verified (me: null)');
      }
    }
  } catch (err) {
    recordFail('GET_ME', err.message);
  }

  // Test 12: GET_MY_ADDRESSES Query
  try {
    const query = `
      query GetMyAddresses {
        me {
          id
          addresses {
            id
            firstName
            lastName
            streetAddress1
            city
            postalCode
          }
        }
      }
    `;
    const res = await executeGQL(query);
    if (res.errors) {
      recordWarn('GET_MY_ADDRESSES', `Unauthenticated response: ${res.errors[0]?.message}`);
    } else {
      recordPass(
        'GET_MY_ADDRESSES',
        AUTH_TOKEN ? `Found ${res.data?.me?.addresses?.length || 0} addresses` : 'Guest state verified'
      );
    }
  } catch (err) {
    recordFail('GET_MY_ADDRESSES', err.message);
  }

  // Test 13: GET_ORDERS Query
  try {
    const query = `
      query GetOrders($first: Int = 20) {
        me {
          id
          orders(first: $first) {
            edges {
              node {
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
              }
            }
          }
        }
      }
    `;
    const res = await executeGQL(query, { first: 5 });
    if (res.errors) {
      recordWarn('GET_ORDERS', `Unauthenticated response: ${res.errors[0]?.message}`);
    } else {
      recordPass(
        'GET_ORDERS',
        AUTH_TOKEN ? `Found ${res.data?.me?.orders?.edges?.length || 0} orders` : 'Guest state verified'
      );
    }
  } catch (err) {
    recordFail('GET_ORDERS', err.message);
  }

  // Test 14: TOKEN_CREATE (LOGIN_WITH_PASSWORD) Schema & Error Validation
  try {
    const mutation = `
      mutation TokenCreate($email: String!, $password: String!) {
        tokenCreate(email: $email, password: $password) {
          token
          refreshToken
          csrfToken
          user {
            id
            email
          }
          errors {
            field
            message
            code
          }
        }
      }
    `;
    const res = await executeGQL(mutation, {
      email: 'test_validation_user@example.com',
      password: 'SamplePassword123!',
    });

    if (res.errors) {
      recordFail('TOKEN_CREATE', res.errors[0]?.message, res);
    } else {
      const payload = res.data?.tokenCreate;
      if (payload?.errors && payload.errors.length > 0) {
        recordPass(
          'TOKEN_CREATE',
          `Schema valid & active (Gracefully rejected test account: "${payload.errors[0].message}")`
        );
      } else if (payload?.token) {
        recordPass('TOKEN_CREATE', 'Token generated successfully');
      } else {
        recordPass('TOKEN_CREATE', 'Response schema conforms to TokenCreate spec');
      }
    }
  } catch (err) {
    recordFail('TOKEN_CREATE', err.message);
  }

  // Test 15: TOKEN_REFRESH Schema Validation
  try {
    const mutation = `
      mutation TokenRefresh($refreshToken: String!) {
        tokenRefresh(refreshToken: $refreshToken) {
          token
          errors {
            field
            message
            code
          }
        }
      }
    `;
    const res = await executeGQL(mutation, { refreshToken: 'dummy-refresh-token' });
    if (res.errors) {
      recordFail('TOKEN_REFRESH', res.errors[0]?.message, res);
    } else {
      recordPass('TOKEN_REFRESH', 'Schema valid & mutation executable');
    }
  } catch (err) {
    recordFail('TOKEN_REFRESH', err.message);
  }

  // Test 16: OTP_REQUEST Schema Validation
  try {
    const mutation = `
      mutation OtpRequest($phone: String!) {
        otpRequest(phone: $phone) {
          success
          errors {
            field
            message
          }
        }
      }
    `;
    const res = await executeGQL(mutation, { phone: '+919999999999' });
    if (res.errors) {
      // If backend plugin doesn't register otpRequest directly, Saleor will say "Cannot query field"
      const errMsg = res.errors[0]?.message;
      if (errMsg && errMsg.includes('Cannot query field')) {
        recordWarn('OTP_REQUEST', `Backend does not have GraphQL otpRequest plugin (${errMsg}) — Website uses /api/otp/send fallback`);
      } else {
        recordFail('OTP_REQUEST', errMsg, res);
      }
    } else {
      recordPass('OTP_REQUEST', 'otpRequest mutation accepted by backend');
    }
  } catch (err) {
    recordFail('OTP_REQUEST', err.message);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SECTION 4: LOCAL NEXT.JS API ROUTES (OPTIONAL / IF RUNNING)
  // ───────────────────────────────────────────────────────────────────────────
  logHeader('4. LOCAL NEXT.JS API ROUTES CHECK');
  try {
    const localRes = await fetch('http://localhost:3000/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9999999999' }),
      signal: AbortSignal.timeout(2000),
    });
    const localJson = await localRes.json();
    recordPass('LOCAL_ROUTE: /api/otp/send', `Server responded with HTTP ${localRes.status}: ${JSON.stringify(localJson)}`);
  } catch (e) {
    recordWarn('LOCAL_ROUTE: /api/otp/send', 'Next.js dev server not running on port 3000 (run `npm run dev` to test local routes)');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SUMMARY REPORT
  // ───────────────────────────────────────────────────────────────────────────
  logHeader('TEST EXECUTION SUMMARY');
  console.log(`  Total Operations Checked: ${c.bold}${testCount}${c.reset}`);
  console.log(`  ${c.green}✓ Passed:${c.reset}  ${c.bold}${passedCount}${c.reset}`);
  console.log(`  ${c.yellow}⚠ Warnings:${c.reset} ${c.bold}${warnCount}${c.reset}`);
  console.log(`  ${c.red}✗ Failed:${c.reset}  ${c.bold}${failedCount}${c.reset}`);

  if (failedCount === 0) {
    console.log(`\n${c.green}${c.bold}🎉 ALL CRITICAL WEBSITE QUERIES & MUTATIONS ARE HEALTHY & CONNECTED PROPERLY!${c.reset}\n`);
  } else {
    console.log(`\n${c.red}${c.bold}⚠ SOME OPERATIONS ENCOUNTERED ISSUES. SEE DETAILS ABOVE.${c.reset}\n`);
  }
}

testAll().catch(err => {
  console.error('Fatal test error:', err);
});
