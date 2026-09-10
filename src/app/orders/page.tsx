"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, ShoppingBag, X, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./page.module.css";

interface OrderItem {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
  customInstructions?: string;
  customImage?: string;
}

interface OrderData {
  id: string;
  number: string;
  date: string;
  created: string;
  status: string;
  statusCategory: "Active" | "Completed" | "Cancelled";
  paymentStatus: string;
  total: string;
  deliveryFee: number;
  customerNote: string;
  items: OrderItem[];
  canCancel: boolean;
}

const CANCEL_REASONS = [
  "Changed my mind",
  "Ordered by mistake / duplicate order",
  "Need to change custom photo or instructions",
  "Need to change delivery address",
  "Delivery timeframe too long",
  "Other reason",
];

export default function MyOrdersPage() {
  const router = useRouter();
  const { isLoggedIn, user, setLoginModalOpen } = useCart();
  const [activeTab, setActiveTab] = useState<"Active" | "Completed" | "Cancelled">("Active");

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cancellation modal state
  const [orderToCancel, setOrderToCancel] = useState<OrderData | null>(null);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [isCancelling, setIsCancelling] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const fetchOrders = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      let placedIds: string[] = [];
      if (typeof window !== "undefined") {
        try {
          placedIds = JSON.parse(localStorage.getItem("placed_order_ids") || "[]");
        } catch {}
      }

      const params = new URLSearchParams();
      if (user?.email) params.append("email", user.email);
      if (user?.phone) params.append("phone", user.phone);
      if (placedIds.length > 0) params.append("orderIds", placedIds.join(","));

      // If user is not logged in and no placed orders exist, avoid unnecessary query
      if (!isLoggedIn && !user?.phone && !user?.email && placedIds.length === 0) {
        setOrders([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load orders from server.");
      }

      setOrders(data.orders || []);
    } catch (err: any) {
      console.error("Fetch orders error:", err);
      setError(err.message || "Unable to fetch orders from database.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, isLoggedIn]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return;

    setIsCancelling(true);
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderToCancel.id,
          reason: cancelReason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not cancel order.");
      }

      // Update in local state immediately so it moves to Cancelled tab
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderToCancel.id
            ? {
                ...o,
                status: "CANCELED",
                statusCategory: "Cancelled",
                canCancel: false,
              }
            : o
        )
      );

      const num = orderToCancel.number;
      setOrderToCancel(null);
      showToast(`Order #${num} cancelled successfully.`);
    } catch (err: any) {
      alert(err.message || "Failed to cancel order. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredOrders = orders.filter((order) => order.statusCategory === activeTab);

  const activeCount = orders.filter((o) => o.statusCategory === "Active").length;
  const completedCount = orders.filter((o) => o.statusCategory === "Completed").length;
  const cancelledCount = orders.filter((o) => o.statusCategory === "Cancelled").length;

  const getStatusClass = (statusCategory: string) => {
    if (statusCategory === "Active") return styles.badgeTransit;
    if (statusCategory === "Completed") return styles.badgeDelivered;
    return styles.badgeCancelled;
  };

  return (
    <MobileContainer>
      {/* Header bar */}
      <header className={styles.header}>
        <button onClick={() => router.back()} className={styles.iconButton} aria-label="Go back">
          <ChevronLeft size={22} strokeWidth={1.8} className={styles.icon} />
        </button>
        <h2 className={styles.title}>My Orders</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => fetchOrders(true)}
            className={styles.iconButton}
            aria-label="Refresh orders"
            disabled={refreshing}
            style={{ opacity: refreshing ? 0.5 : 1 }}
          >
            <RefreshCw size={18} strokeWidth={1.8} className={styles.icon} style={{ animation: refreshing ? "spin 1s linear infinite" : undefined }} />
          </button>
          <button onClick={() => router.push("/cart")} className={styles.iconButton} aria-label="Shopping cart">
            <ShoppingBag size={18} strokeWidth={1.8} className={styles.icon} />
          </button>
        </div>
      </header>

      <main className={styles.mainContent}>
        {/* Filter Tab Buttons */}
        <div className={styles.tabContainer}>
          <button
            onClick={() => setActiveTab("Active")}
            className={`${styles.tabBtn} ${activeTab === "Active" ? styles.tabBtnActive : styles.tabBtnInactive}`}
            type="button"
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab("Completed")}
            className={`${styles.tabBtn} ${activeTab === "Completed" ? styles.tabBtnActive : styles.tabBtnInactive}`}
            type="button"
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setActiveTab("Cancelled")}
            className={`${styles.tabBtn} ${activeTab === "Cancelled" ? styles.tabBtnActive : styles.tabBtnInactive}`}
            type="button"
          >
            Cancelled ({cancelledCount})
          </button>
        </div>

        {/* Content States */}
        {loading ? (
          <div style={{ padding: "3rem 2rem", textAlign: "center", color: "var(--text-secondary)" }}>
            <div style={{ display: "inline-block", width: "24px", height: "24px", border: "2px solid #ccc", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: "12px" }} />
            <p style={{ fontSize: "14px", fontWeight: 500 }}>Connecting to database & loading orders...</p>
          </div>
        ) : error ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#dc2626", background: "#fef2f2", borderRadius: "16px", margin: "1rem 0" }}>
            <AlertTriangle size={28} style={{ margin: "0 auto 8px auto" }} />
            <p style={{ fontSize: "13px", fontWeight: 600 }}>{error}</p>
            <button
              onClick={() => fetchOrders()}
              style={{ marginTop: "12px", padding: "8px 16px", borderRadius: "8px", background: "#111", color: "#fff", border: "none", cursor: "pointer", fontSize: "12px" }}
            >
              Retry
            </button>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className={styles.ordersList}>
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={styles.orderCard}
                onClick={() => router.push(`/order/${order.id}`)}
                style={{ cursor: "pointer" }}
              >
                {/* Header Information */}
                <div className={styles.cardHeader}>
                  <div className={styles.headerLeft}>
                    <span className={styles.orderId}>Order #{order.number}</span>
                    <span className={styles.orderDate}>{order.date}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${getStatusClass(order.statusCategory)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Items Listing Rows */}
                <div className={styles.itemsBlock}>
                  {order.items.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      <div className={styles.itemImageWrapper}>
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                          className={styles.itemImage}
                          unoptimized
                        />
                      </div>
                      <div className={styles.itemMeta}>
                        <h4 className={styles.itemName}>{item.name}</h4>
                        <span className={styles.itemSpecs}>Qty: {item.quantity}</span>
                        {item.customInstructions && (
                          <span style={{ fontSize: "11px", color: "#6366f1", display: "block", marginTop: "2px" }}>
                            ✍️ {item.customInstructions}
                          </span>
                        )}
                      </div>
                      <span className={styles.itemPrice}>{item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Totals & Actions Footer */}
                <div className={styles.cardFooter}>
                  <div className={styles.totalBlock}>
                    <span className={styles.totalLabel}>Total Amount</span>
                    <span className={styles.totalValue}>{order.total}</span>
                  </div>

                  <div className={styles.actionGroup}>
                    {order.canCancel && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOrderToCancel(order);
                          setCancelReason(CANCEL_REASONS[0]);
                        }}
                        className={styles.cancelBtn}
                        type="button"
                      >
                        Cancel Order
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/order/${order.id}`);
                      }}
                      className={styles.actionBtn}
                      type="button"
                    >
                      {order.statusCategory === "Active" ? "Track Order" : "View Details"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No orders found in {activeTab.toLowerCase()} section.</p>
            {!isLoggedIn && (
              <div style={{ marginTop: "1rem" }}>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  Log in to see all past orders placed with your phone or email.
                </p>
                <button
                  onClick={() => setLoginModalOpen(true)}
                  style={{ padding: "8px 20px", borderRadius: "20px", background: "var(--foreground)", color: "var(--background)", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}
                >
                  Log In
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cancellation Confirmation Dialog */}
      {orderToCancel && (
        <div className={styles.modalOverlay} onClick={() => !isCancelling && setOrderToCancel(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Cancel Order #{orderToCancel.number}</h3>
              <button
                disabled={isCancelling}
                onClick={() => setOrderToCancel(null)}
                className={styles.modalCloseBtn}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p>Are you sure you want to cancel this order? Once cancelled, the status will update in the database and the order will move to the <strong>Cancelled</strong> section.</p>

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
                onClick={() => setOrderToCancel(null)}
                className={styles.modalDismissBtn}
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelConfirm}
                className={styles.modalConfirmBtn}
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className={styles.toast}>
          <CheckCircle2 size={16} color="#22c55e" />
          <span>{toastMessage}</span>
        </div>
      )}

      <BottomNav />
    </MobileContainer>
  );
}
