import { NextResponse } from 'next/server';
import { createShiprocketOrder, generateShiprocketAWB } from '@/lib/shiprocket';
import { fulfillSaleorOrder } from '@/lib/saleorFulfillment';

/**
 * Saleor Webhook Handler
 * Receives ORDER_CONFIRMED or ORDER_FULLY_PAID events from Saleor backend.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log('[Saleor Webhook Received]', JSON.stringify(payload).slice(0, 300));

    // Support both subscription event structure and standard webhook structure
    const order = payload.order || payload.event?.order;
    if (!order || !order.id) {
      return NextResponse.json({ received: true, message: 'No order in payload' });
    }

    const shippingAddress = order.shippingAddress || {};
    const customer = {
      firstName: shippingAddress.firstName || 'Customer',
      lastName: shippingAddress.lastName || '',
      email: order.userEmail || 'customer@sriaachicreatives.com',
      phone: shippingAddress.phone || '9999999999',
      streetAddress1: shippingAddress.streetAddress1 || '',
      streetAddress2: shippingAddress.streetAddress2 || '',
      city: shippingAddress.city || 'Chennai',
      state: shippingAddress.countryArea || 'Tamil Nadu',
      postalCode: shippingAddress.postalCode || '600001',
      country: shippingAddress.country?.code || 'IN',
    };

    const items = (order.lines || []).map((line: any) => ({
      name: line.productName || 'Custom Product',
      sku: line.variantName || 'SKU-DEFAULT',
      units: line.quantity || 1,
      selling_price: line.unitPrice?.gross?.amount || 100,
    }));

    const subTotal = order.total?.gross?.amount || 100;
    const isCOD = order.status === 'UNFULFILLED' && !payload.isPrepaid;

    // 1. Dispatch to Shiprocket
    const srResult = await createShiprocketOrder({
      orderId: order.id,
      orderNumber: order.number || order.id,
      paymentMethod: isCOD ? 'COD' : 'Prepaid',
      subTotal,
      customer,
      items,
    });

    if (!srResult.success) {
      console.warn('[Shiprocket Dispatch Failed]', srResult.message);
      return NextResponse.json({
        received: true,
        shiprocketSynced: false,
        message: srResult.message,
      });
    }

    // 2. Generate AWB if shipment created
    if (srResult.shipment_id) {
      const awbResult = await generateShiprocketAWB(srResult.shipment_id);
      if (awbResult.success && awbResult.awbCode) {
        // 3. Fulfill and attach tracking to Saleor
        await fulfillSaleorOrder(order.id, awbResult.awbCode);
        return NextResponse.json({
          received: true,
          shiprocketSynced: true,
          orderId: srResult.order_id,
          awb: awbResult.awbCode,
        });
      }
    }

    return NextResponse.json({
      received: true,
      shiprocketSynced: true,
      orderId: srResult.order_id,
    });
  } catch (error) {
    console.error('[Shiprocket Webhook Exception]', error);
    return NextResponse.json({ error: 'Internal server error processing webhook' }, { status: 500 });
  }
}
