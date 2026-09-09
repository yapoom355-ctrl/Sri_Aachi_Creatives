/**
 * Shiprocket API Client for Sri Aachi Creatives
 * Handles authentication, adhoc order creation, AWB generation, and shipment tracking.
 */

interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: string;
}

export interface CreateShiprocketOrderParams {
  orderId: string;
  orderNumber: string | number;
  orderDate?: string;
  paymentMethod: 'COD' | 'Prepaid';
  subTotal: number;
  customer: {
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
    streetAddress1: string;
    streetAddress2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  items: ShiprocketOrderItem[];
  dimensions?: {
    length?: number;
    breadth?: number;
    height?: number;
    weight?: number; // in kg
  };
}

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Obtain or reuse a valid JWT Bearer token from Shiprocket.
 */
export async function getShiprocketToken(): Promise<string | null> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    console.warn('[Shiprocket] SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD not configured in .env');
    return null;
  }

  // Return cached token if still valid (tokens are valid for 10 days; we cache for 7 days)
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  try {
    const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.token) {
      console.error('[Shiprocket Auth Error]', data);
      return null;
    }

    cachedToken = data.token;
    tokenExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    return cachedToken;
  } catch (error) {
    console.error('[Shiprocket Auth Exception]', error);
    return null;
  }
}

/**
 * Push an order directly to Shiprocket using the Adhoc Order API.
 */
export async function createShiprocketOrder(params: CreateShiprocketOrderParams) {
  const token = await getShiprocketToken();
  if (!token) {
    return {
      success: false,
      isConfigured: false,
      message: 'Shiprocket API credentials missing or invalid in .env',
    };
  }

  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary';
  const now = new Date();
  const formattedDate = params.orderDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const payload = {
    order_id: String(params.orderNumber || params.orderId),
    order_date: formattedDate,
    pickup_location: pickupLocation,
    channel_id: '',
    comment: `Sri Aachi Creatives Order #${params.orderNumber}`,
    billing_customer_name: params.customer.firstName,
    billing_last_name: params.customer.lastName || '',
    billing_address: params.customer.streetAddress1,
    billing_address_2: params.customer.streetAddress2 || '',
    billing_city: params.customer.city,
    billing_pincode: params.customer.postalCode,
    billing_state: params.customer.state,
    billing_country: params.customer.country || 'India',
    billing_email: params.customer.email || 'customer@sriaachicreatives.com',
    billing_phone: params.customer.phone.replace(/[^0-9]/g, '').slice(-10),
    shipping_is_billing: true,
    order_items: params.items.map((item, idx) => ({
      name: item.name,
      sku: item.sku || `SKU-${idx + 1}`,
      units: item.units || 1,
      selling_price: item.selling_price,
      discount: item.discount || 0,
      tax: item.tax || 0,
      hsn: item.hsn || '',
    })),
    payment_method: params.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: 0,
    sub_total: params.subTotal,
    length: params.dimensions?.length || 10,
    breadth: params.dimensions?.breadth || 10,
    height: params.dimensions?.height || 10,
    weight: params.dimensions?.weight || 0.5,
  };

  try {
    const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[Shiprocket Create Order Error]', data);
      return {
        success: false,
        isConfigured: true,
        error: data,
        message: data.message || 'Failed to create order in Shiprocket',
      };
    }

    return {
      success: true,
      isConfigured: true,
      order_id: data.order_id,
      shipment_id: data.shipment_id,
      status: data.status,
      statusCode: data.status_code,
      data,
    };
  } catch (error) {
    console.error('[Shiprocket Create Order Exception]', error);
    return {
      success: false,
      isConfigured: true,
      error,
      message: 'Network error communicating with Shiprocket',
    };
  }
}

/**
 * Generate AWB and assign a courier to a shipment.
 */
export async function generateShiprocketAWB(shipmentId: number | string, courierId?: number | string) {
  const token = await getShiprocketToken();
  if (!token) return { success: false, message: 'Shiprocket not authenticated' };

  try {
    const body: Record<string, any> = { shipment_id: shipmentId };
    if (courierId) body.courier_id = courierId;

    const res = await fetch('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok || data.awb_assign_status !== 1) {
      console.warn('[Shiprocket AWB Assignment Notice]', data);
      return {
        success: false,
        data,
        message: data.message || 'Courier/AWB could not be automatically assigned yet',
      };
    }

    const awbCode = data.response?.data?.awb_code;
    const courierName = data.response?.data?.courier_name;

    return {
      success: true,
      awbCode,
      courierName,
      data,
    };
  } catch (error) {
    console.error('[Shiprocket Generate AWB Exception]', error);
    return { success: false, error };
  }
}

/**
 * Track shipment live by AWB code.
 */
export async function trackShiprocketShipment(awbCode: string) {
  const token = await getShiprocketToken();
  if (!token) return { success: false, message: 'Shiprocket not authenticated' };

  try {
    const res = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/awb/${encodeURIComponent(awbCode)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    return {
      success: res.ok,
      data,
    };
  } catch (error) {
    console.error('[Shiprocket Tracking Exception]', error);
    return { success: false, error };
  }
}
