import { NextRequest, NextResponse } from "next/server";
import { calculateShiprocketShippingRate } from "@/lib/shiprocket";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cartItems = [], deliveryPincode = "", paymentMethod = "RAZORPAY" } = body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({
        success: true,
        deliveryFee: 0,
        isFreeDelivery: true,
        rule: "EMPTY_CART",
        courierName: "Free Delivery",
        estimatedDays: "3-5 days",
      });
    }

    // ── Rule 1: Live Test Product is strictly FREE DELIVERY (₹0) ───────────────
    const isTestProductOnly =
      cartItems.length > 0 &&
      cartItems.every((item: any) => {
        const id = item.id || item.variantId || "";
        const name = (item.name || item.productName || "").toLowerCase();
        return (
          id === "UHJvZHVjdDoxOA==" ||
          id === "UHJvZHVjdFZhcmlhbnQ6MTc=" ||
          name.includes("live test product")
        );
      });

    if (isTestProductOnly) {
      return NextResponse.json({
        success: true,
        deliveryFee: 0,
        isFreeDelivery: true,
        rule: "TEST_PRODUCT_FREE",
        reason: "Test Product Special Free Delivery",
        courierName: "Special Free Delivery",
        estimatedDays: "1-2 days",
      });
    }

    // ── Rule 2: Balance/Regular Products → Live Shiprocket Serviceability Rate ──
    const cleanPincode = String(deliveryPincode || "").replace(/\D/g, "");
    if (!cleanPincode || cleanPincode.length !== 6) {
      return NextResponse.json({
        success: true,
        deliveryFee: 60,
        isFreeDelivery: false,
        rule: "DEFAULT_ESTIMATE",
        reason: "Enter a valid 6-digit delivery pincode for live courier rate",
        courierName: "Standard Delivery",
        estimatedDays: "3-5 days",
      });
    }

    // Calculate total parcel weight (default 0.4kg per item, minimum 0.5kg)
    const totalWeight = Math.max(
      0.5,
      cartItems.reduce((acc: number, item: any) => acc + (item.quantity || 1) * 0.4, 0)
    );

    const isCod = paymentMethod === "COD";
    const shipResult = await calculateShiprocketShippingRate({
      deliveryPincode: cleanPincode,
      weight: totalWeight,
      isCod,
    });

    return NextResponse.json({
      success: true,
      deliveryFee: shipResult.rate,
      isFreeDelivery: shipResult.rate === 0,
      rule: "SHIPROCKET_LIVE_RATE",
      courierName: shipResult.courierName,
      estimatedDays: `${shipResult.estimatedDays} days`,
      pincode: cleanPincode,
    });
  } catch (error: any) {
    console.error("[Shipping Calculate API Exception]", error);
    return NextResponse.json(
      {
        success: false,
        deliveryFee: 60,
        isFreeDelivery: false,
        rule: "FALLBACK_ERROR",
        message: error?.message || "Failed to calculate live shipping fee",
      },
      { status: 500 }
    );
  }
}
