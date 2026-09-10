"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@apollo/client/react";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, HelpCircle, Check, MapPin, CreditCard, Package, X, AlertOctagon } from "lucide-react";
import { GET_ORDER } from "@/graphql/queries";
import styles from "./page.module.css";

const CANCEL_REASONS = [
  "Changed my mind",
  "Ordered by mistake / duplicate order",
  "Need to change custom photo or instructions",
  "Need to change delivery address",
  "Delivery timeframe too long",
  "Other reason",
];

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;

  const [cancelledOverride, setCancelledOverride] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);

  const { data, loading, error, refetch } = useQuery<any>(GET_ORDER, {
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
  const isCancelled = cancelledOverride || order?.status === "CANCELED" || order?.status === "CANCELLED";
  const fulfillments = order?.fulfillments || [];
  const latestFulfillment = fulfillments.length > 0 ? fulfillments[fulfillments.length - 1] : null;
  const hasTracking = Boolean(latestFulfillment?.trackingNumber);
  const isFulfilled = order?.status === "FULFILLED";

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order?.id || id,
          reason: cancelReason,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || "Failed to cancel order.");
      }

      setCancelledOverride(true);
      setShowCancelModal(false);
      refetch?.();
    } catch (err: any) {
      alert(err.message || "Could not cancel order. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

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

              {!isCancelled && !isFulfilled && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className={styles.cancelBtn}
                  type="button"
                >
                  <AlertOctagon size={16} />
                  Cancel Order
                </button>
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
                {(() => {
                  const isRazorpay = Boolean(
                    order.isPaid ||
                    order.paymentStatus === "FULLY_CHARGED" ||
                    order.paymentStatus === "PAID" ||
                    order.metadata?.some((m: any) => m.key === "payment_method" && m.value === "RAZORPAY") ||
                    order.metadata?.some((m: any) => m.key === "razorpay_payment_id") ||
                    (order.customerNote && order.customerNote.toLowerCase().includes("razorpay"))
                  );

                  const razorpayPaymentId =
                    order.metadata?.find((m: any) => m.key === "razorpay_payment_id")?.value ||
                    (order.customerNote?.match(/Payment ID:\s*([a-zA-Z0-9_]+)/i)?.[1]);

                  if (isRazorpay) {
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span className={styles.cardType} style={{ fontWeight: 600, color: "#16a34a" }}>
                          ✅ Paid Online (Razorpay)
                        </span>
                        {razorpayPaymentId && (
                          <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                            Payment ID: {razorpayPaymentId}
                          </span>
                        )}
                      </div>
                    );
                  }

                  if (order.paymentStatus === "NOT_CHARGED") {
                    return (
                      <span className={styles.cardType} style={{ fontWeight: 600 }}>
                        💵 Cash on Delivery (Pay upon arrival)
                      </span>
                    );
                  }

                  if (order.paymentStatus === "PENDING") {
                    return (
                      <span className={styles.cardType} style={{ fontWeight: 600, color: "#d97706" }}>
                        ⏳ Payment Pending
                      </span>
                    );
                  }

                  return (
                    <span className={styles.cardType} style={{ fontWeight: 600 }}>
                      {order.paymentStatus || "Processed"}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Price breakdown */}
            {(() => {
              const itemsSubtotal =
                order.lines && order.lines.length > 0
                  ? order.lines.reduce(
                      (sum: number, line: any) =>
                        sum + (Number(line.unitPrice?.gross?.amount) || 0) * (Number(line.quantity) || 1),
                      0
                    )
                  : (order.subtotal?.gross?.amount ?? order.total?.gross?.amount ?? 0);

              const deliveryFeeMeta = order.metadata?.find(
                (m: any) => m.key === "delivery_fee" || m.key === "shipping_fee"
              )?.value;

              const isTestProduct = order.lines?.every((line: any) => {
                const name = (line.productName || "").toLowerCase();
                return name.includes("live test product");
              });

              let deliveryAmount = 0;
              if (isTestProduct) {
                deliveryAmount = 0;
              } else if (deliveryFeeMeta !== undefined && deliveryFeeMeta !== null && deliveryFeeMeta !== "") {
                deliveryAmount = Number(deliveryFeeMeta) || 0;
              } else {
                const noteMatch = order.customerNote?.match(/Delivery Fee:\s*₹?(\d+(\.\d+)?)/i);
                if (noteMatch && noteMatch[1]) {
                  deliveryAmount = Number(noteMatch[1]) || 0;
                } else if ((order.shippingPrice?.gross?.amount || 0) > 0) {
                  deliveryAmount = order.shippingPrice.gross.amount;
                } else {
                  deliveryAmount = 73;
                }
              }

              const finalOrderTotal = itemsSubtotal + deliveryAmount;

              return (
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Price Details</h3>
                  <div className={styles.priceSummary}>
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}>Subtotal</span>
                      <span className={styles.priceValue}>₹{itemsSubtotal.toFixed(2)}</span>
                    </div>
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}>Delivery</span>
                      <span
                        className={styles.priceValue}
                        style={{ color: deliveryAmount === 0 ? "#16a34a" : "inherit" }}
                      >
                        {deliveryAmount === 0 ? "FREE" : `₹${deliveryAmount.toFixed(2)}`}
                      </span>
                    </div>
                    <div className={`${styles.priceRow} ${styles.totalRow}`}>
                      <span className={styles.totalLabel}>Total</span>
                      <span className={styles.totalValue}>₹{finalOrderTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      </main>

      {/* Cancellation Confirmation Dialog */}
      {showCancelModal && (
        <div className={styles.modalOverlay} onClick={() => !isCancelling && setShowCancelModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Cancel Order</h3>
              <button
                disabled={isCancelling}
                onClick={() => setShowCancelModal(false)}
                className={styles.modalCloseBtn}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p>
                Are you sure you want to cancel this order? Once cancelled, this will immediately update in the database and stop fulfillment.
              </p>

              <label style={{ display: "block", marginTop: "14px", fontWeight: 600, fontSize: "12px", color: "var(--text-primary)" }}>
                Reason for cancellation:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className={styles.modalSelect}
                disabled={isCancelling}
              >
                {CANCEL_REASONS.map((r, idx) => (
                  <option key={idx} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setShowCancelModal(false)}
                className={styles.modalDismissBtn}
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className={styles.modalConfirmBtn}
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </MobileContainer>
  );
}
