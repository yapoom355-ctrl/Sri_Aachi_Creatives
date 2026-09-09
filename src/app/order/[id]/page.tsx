"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@apollo/client/react";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, HelpCircle, Check, MapPin, CreditCard, Package } from "lucide-react";
import { GET_ORDER } from "@/graphql/queries";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;

  const { data, loading, error } = useQuery<any>(GET_ORDER, {
    variables: { id },
    skip: !id,
  });

  const order = data?.order;

  // Real Backend Date and Time formatting
  const createdDate = order?.created
    ? new Date(order.created).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  // Realtime Status Tracking from Backend Saleor & Shiprocket
  const isCancelled = order?.status === "CANCELED" || order?.status === "CANCELLED";
  const fulfillments = order?.fulfillments || [];
  const latestFulfillment = fulfillments.length > 0 ? fulfillments[fulfillments.length - 1] : null;
  const hasTracking = Boolean(latestFulfillment?.trackingNumber);
  const isFulfilled = order?.status === "FULFILLED";

  // Step indices: 0: Placed, 1: Confirmed, 2: Processing, 3: Shipped, 4: Delivered
  const STATUS_STEPS = ["Placed", "Confirmed", "Processing", "Shipped", "Delivered"];
  let currentStepIdx = 1; // Any order stored in Saleor is confirmed
  if (isFulfilled || hasTracking) {
    currentStepIdx = 3; // Shipped via courier
  } else if (order?.status === "UNFULFILLED") {
    currentStepIdx = 1; // Confirmed, being processed
  }

  const steps = isCancelled
    ? [
        { title: "Order Placed", completed: true },
        { title: "Cancelled", completed: true, active: true },
      ]
    : STATUS_STEPS.map((name, idx) => ({
        title: name,
        completed: currentStepIdx >= idx,
        active: currentStepIdx === idx,
      }));


  if (loading) {
    return (
      <MobileContainer>
        <div style={{ padding: "3rem", textAlign: "center", opacity: 0.5 }}>Loading order details…</div>
        <BottomNav />
      </MobileContainer>
    );
  }

  if (error || !order) {
    return (
      <MobileContainer>
        <header className={styles.header}>
          <button onClick={() => router.back()} className={styles.iconButton} aria-label="Go back">
            <ChevronLeft size={22} strokeWidth={1.8} className={styles.icon} />
          </button>
          <h2 className={styles.title}>Order Details</h2>
          <div className={styles.iconButton} />
        </header>
        <main className={styles.mainContent}>
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <Package size={48} strokeWidth={1} style={{ opacity: 0.3, marginBottom: "1rem" }} />
            <p>Order not found.</p>
          </div>
        </main>
        <BottomNav />
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      {/* Header */}
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.iconButton} aria-label="Go back">
          <ChevronLeft size={22} strokeWidth={1.8} className={styles.icon} />
        </button>
        <h2 className={styles.title}>Order Details</h2>
        <button
          onClick={() => {
            const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "916366858878";
            window.open(`https://wa.me/${whatsapp}?text=Hi, I need help with my order.`, "_blank");
          }}
          className={styles.iconButton}
          aria-label="Support Help"
        >
          <HelpCircle size={20} strokeWidth={1.8} className={styles.icon} />
        </button>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.responsiveWrapper}>

          {/* Left Column */}
          <div className={styles.leftCol}>
            {/* Tracking Stepper */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Tracking Status</h3>
                <span className={styles.orderTag}>{order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <p style={{ fontSize: "0.72rem", opacity: 0.5, marginBottom: "0.75rem" }}>{createdDate}</p>

              <div className={styles.stepper}>
                {steps.map((step, idx) => (
                  <div key={idx} className={styles.stepRow}>
                    <div className={styles.indicatorCol}>
                      <div
                        className={`${styles.circle} ${step.completed
                            ? step.active
                              ? styles.circleActive
                              : styles.circleCompleted
                            : styles.circlePending
                          }`}
                      >
                        {step.completed && !step.active && <Check size={12} strokeWidth={3} />}
                        {step.active && <div className={styles.innerDot} />}
                      </div>
                      {idx < steps.length - 1 && (
                        <div
                          className={`${styles.line} ${step.completed && steps[idx + 1]?.completed
                              ? styles.lineCompleted
                              : styles.linePending
                            }`}
                        />
                      )}
                    </div>
                    <div className={styles.stepMeta}>
                      <span className={`${styles.stepTitle} ${step.active ? styles.titleActive : ""}`}>
                        {step.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {latestFulfillment?.trackingNumber && (
                <div style={{
                  marginTop: "1.25rem",
                  padding: "0.85rem",
                  background: "#f0fdf4",
                  borderRadius: "8px",
                  border: "1px solid #bbf7d0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#166534" }}>🚚 Shiprocket Courier AWB:</span>
                    <span style={{ fontSize: "0.72rem", color: "#15803d", fontWeight: 700, textTransform: "uppercase" }}>
                      {latestFulfillment.statusDisplay || latestFulfillment.status || "Shipped"}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#14532d", letterSpacing: "1px" }}>
                    {latestFulfillment.trackingNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Purchased Items</h3>
              <div className={styles.itemsList}>
                {(order.lines || order.items || []).map((item: any, idx: number) => (
                  <div key={idx} className={styles.itemRow}>
                    <div className={styles.itemImageWrapper}>
                      <Image
                        src={item.thumbnail?.url || item.product?.thumbnail?.mediaUrl || "/images/motor-engine-table-3.webp"}
                        alt={item.productName || item.product?.title || "Product"}
                        width={50}
                        height={50}
                        className={styles.itemImage}
                      />
                    </div>
                    <div className={styles.itemMeta}>
                      <h4 className={styles.itemName}>{item.productName || item.product?.title || "Item"}</h4>
                      <span className={styles.itemSpecs}>Qty: {item.quantity}</span>

                      {/* Display Customization Details if present */}
                      {item.metadata?.find((m: any) => m.key === "instructions")?.value && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#4338ca",
                            background: "#eef2ff",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            marginTop: "4px",
                            wordBreak: "break-word",
                          }}
                        >
                          ✍️ <strong>Custom Text:</strong>{" "}
                          {item.metadata.find((m: any) => m.key === "instructions").value}
                        </div>
                      )}
                      {item.metadata?.find((m: any) => m.key === "file_url")?.value && (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.75rem",
                            color: "#065f46",
                            background: "#ecfdf5",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            marginTop: "4px",
                          }}
                        >
                          <img
                            src={item.metadata.find((m: any) => m.key === "file_url").value}
                            alt="Custom photo"
                            style={{
                              width: "16px",
                              height: "16px",
                              borderRadius: "2px",
                              objectFit: "cover",
                            }}
                          />
                          <a
                            href={item.metadata.find((m: any) => m.key === "file_url").value}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#065f46", textDecoration: "underline" }}
                          >
                            View Uploaded Photo
                          </a>
                        </div>
                      )}
                    </div>
                    <span className={styles.itemPrice}>
                      ₹{(item.unitPrice?.gross?.amount ? item.unitPrice.gross.amount * item.quantity : 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightCol}>
            {/* Address */}
            {(order.shippingAddress || order.deliveryAddress) && (
              <div className={styles.card}>
                <div className={styles.sectionHeader}>
                  <MapPin size={18} strokeWidth={2} className={styles.sectionIcon} />
                  <h3 className={styles.cardTitleInline}>Shipping Address</h3>
                </div>
                <div className={styles.addressMeta}>
                  <h4 className={styles.addressName}>
                    {order.shippingAddress?.firstName ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ""}` : order.deliveryAddress?.customerName || "Customer"}
                  </h4>
                  <p className={styles.addressText}>{order.shippingAddress?.streetAddress1 || order.deliveryAddress?.addressLine1}</p>
                  <p className={styles.addressText}>
                    {order.shippingAddress?.city || order.deliveryAddress?.district}, {order.shippingAddress?.countryArea || order.deliveryAddress?.state} — {order.shippingAddress?.postalCode || order.deliveryAddress?.pincode}
                  </p>
                  <p className={styles.addressPhone}>Phone: {order.shippingAddress?.phone || order.deliveryAddress?.phoneNumber}</p>
                </div>
              </div>
            )}

            {/* Payment */}
            <div className={styles.card}>
              <div className={styles.sectionHeader}>
                <CreditCard size={18} strokeWidth={2} className={styles.sectionIcon} />
                <h3 className={styles.cardTitleInline}>Payment</h3>
              </div>
              <div className={styles.paymentMeta}>
                <span className={styles.cardType} style={{ fontWeight: 600 }}>
                  {order.isPaid || order.paymentStatus === "FULLY_CHARGED" || order.paymentStatus === "PAID"
                    ? "✅ Paid Online (Razorpay)"
                    : order.paymentStatus === "NOT_CHARGED"
                    ? "💵 Cash on Delivery (Pay upon arrival)"
                    : order.paymentStatus === "PENDING"
                    ? "⏳ Payment Pending"
                    : order.paymentStatus || "Processed"}
                </span>
              </div>
            </div>

            {/* Price breakdown */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Price Details</h3>
              <div className={styles.priceSummary}>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Subtotal</span>
                  <span className={styles.priceValue}>
                    ₹{(order.subtotal?.gross?.amount ?? (order.total?.gross?.amount ? order.total.gross.amount - (order.shippingPrice?.gross?.amount || 0) : 0)).toFixed(2)}
                  </span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Delivery</span>
                  <span className={styles.priceValue} style={{ color: (order.shippingPrice?.gross?.amount || 0) === 0 ? "#16a34a" : "inherit" }}>
                    {(order.shippingPrice?.gross?.amount || 0) === 0 ? "FREE" : `₹${order.shippingPrice.gross.amount.toFixed(2)}`}
                  </span>
                </div>
                <div className={`${styles.priceRow} ${styles.totalRow}`}>
                  <span className={styles.totalLabel}>Total</span>
                  <span className={styles.totalValue}>₹{(order.total?.gross?.amount ?? order.grandTotal ?? 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
