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

  // Map orderStatus to user-friendly steps
  const STATUS_STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const cancelledStatuses = ["CANCELLED", "RETURNED", "REFUNDED"];
  const currentStatusIdx = order ? STATUS_STEPS.indexOf(order.orderStatus) : -1;
  const isCancelled = order ? cancelledStatuses.includes(order.orderStatus) : false;

  const steps = isCancelled
    ? [
      { title: "Order Placed", completed: true },
      { title: "Cancelled", completed: true, active: true },
    ]
    : STATUS_STEPS.map((s, idx) => ({
      title: s.charAt(0) + s.slice(1).toLowerCase(),
      completed: currentStatusIdx >= idx,
      active: currentStatusIdx === idx,
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

  const addr = order.deliveryAddress;
  const createdDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <MobileContainer>
      {/* Header */}
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.iconButton} aria-label="Go back">
          <ChevronLeft size={22} strokeWidth={1.8} className={styles.icon} />
        </button>
        <h2 className={styles.title}>Order Details</h2>
        <button
          onClick={() => alert("Connecting with support…")}
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
            </div>

            {/* Items */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Purchased Items</h3>
              <div className={styles.itemsList}>
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className={styles.itemRow}>
                    <div className={styles.itemImageWrapper}>
                      <Image
                        src={item.product?.thumbnail?.mediaUrl ?? "/images/motor-engine-table-3.webp"}
                        alt={item.product?.title ?? "Product"}
                        width={50}
                        height={50}
                        className={styles.itemImage}
                      />
                    </div>
                    <div className={styles.itemMeta}>
                      <h4 className={styles.itemName}>{item.product?.title}</h4>
                      <span className={styles.itemSpecs}>Qty: {item.quantity}</span>
                    </div>
                    <span className={styles.itemPrice}>
                      ₹{((item.product?.effectivePrice ?? item.product?.price ?? 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightCol}>
            {/* Address */}
            {addr && (
              <div className={styles.card}>
                <div className={styles.sectionHeader}>
                  <MapPin size={18} strokeWidth={2} className={styles.sectionIcon} />
                  <h3 className={styles.cardTitleInline}>Shipping Address</h3>
                </div>
                <div className={styles.addressMeta}>
                  <h4 className={styles.addressName}>{addr.customerName}</h4>
                  <p className={styles.addressText}>{addr.addressLine1}</p>
                  <p className={styles.addressText}>{addr.district}, {addr.state} — {addr.pincode}</p>
                  <p className={styles.addressPhone}>Phone: {addr.phoneNumber}</p>
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
                <span className={styles.cardType}>
                  {order.paymentStatus === "PAID" ? "✅ Paid" : order.paymentStatus === "PENDING" ? "⏳ Pending" : order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Price breakdown */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Price Details</h3>
              <div className={styles.priceSummary}>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Subtotal</span>
                  <span className={styles.priceValue}>₹{order.itemTotal?.toFixed(2)}</span>
                </div>
                {order.discountApplied > 0 && (
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>Discount</span>
                    <span className={styles.priceValue} style={{ color: "#22c55e" }}>-₹{order.discountApplied?.toFixed(2)}</span>
                  </div>
                )}
                {order.deliveryFee > 0 && (
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>Delivery</span>
                    <span className={styles.priceValue}>₹{order.deliveryFee?.toFixed(2)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className={styles.priceRow}>
                    <span className={styles.priceLabel}>Tax</span>
                    <span className={styles.priceValue}>₹{order.tax?.toFixed(2)}</span>
                  </div>
                )}
                <div className={`${styles.priceRow} ${styles.totalRow}`}>
                  <span className={styles.totalLabel}>Total</span>
                  <span className={styles.totalValue}>₹{order.grandTotal?.toFixed(2)}</span>
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
