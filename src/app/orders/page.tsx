"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@apollo/client/react";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { GET_ORDERS } from "@/graphql/queries";
import { resolveProductImage } from "@/utils/productImages";
import { useCart } from "@/context/CartContext";
import styles from "./page.module.css";

interface OrderItem {
  name: string;
  price: string;
  image: string;
  size: string;
  quantity: number;
}

interface OrderData {
  id: string;
  date: string;
  status: string;
  total: string;
  items: OrderItem[];
  statusMessage?: string;
  actionText: string;
}

export default function MyOrdersPage() {
  const router = useRouter();
  const { isLoggedIn, setLoginModalOpen } = useCart();
  const [activeTab, setActiveTab] = useState<"Active" | "Completed" | "Cancelled">("Active");

  const { data, loading, error } = useQuery(GET_ORDERS, {
    skip: !isLoggedIn,
    fetchPolicy: "cache-and-network",
  }) as any;

  const getStatusCategory = (backendStatus: string) => {
    const s = backendStatus?.toUpperCase() || "";
    if (s === "DELIVERED" || s === "COMPLETED") return "Completed";
    if (s === "CANCELLED" || s === "REFUNDED" || s === "FAILED") return "Cancelled";
    return "Active";
  };

  const rawOrders =
    data?.me?.orders?.edges?.map((e: any) => e.node) ||
    data?.myOrders ||
    [];

  const mappedOrders: OrderData[] = rawOrders.map((o: any) => ({
    id: o.number || (o.id ? o.id.slice(0, 8) : "Order"),
    date: o.created
      ? new Date(o.created).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : o.createdAt
      ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
      : "Recent",
    status: o.status || o.orderStatus || "Processing",
    statusCategory: getStatusCategory(o.status || o.orderStatus),
    total: `₹${o.total?.gross?.amount ?? o.grandTotal ?? 0}`,
    actionText: getStatusCategory(o.status || o.orderStatus) === "Active" ? "Track Order" : "View Details",
    items: (o.lines || o.items || []).map((item: any) => ({
      name: item.productName || item.product?.title || "Product",
      price: `₹${item.unitPrice?.gross?.amount ?? item.subtotal ?? 0}`,
      image: resolveProductImage(item.thumbnail?.url || item.product?.thumbnail?.mediaUrl, item.productName || item.product?.title, item.id),
      size: "Standard",
      quantity: item.quantity,
    })),
  }));

  const filteredOrders = mappedOrders.filter((order: any) => {
    if (activeTab === "Active") return order.statusCategory === "Active";
    if (activeTab === "Completed") return order.statusCategory === "Completed";
    return order.statusCategory === "Cancelled";
  });

  const getStatusClass = (statusCategory: string) => {
    if (statusCategory === "Active") return styles.badgeTransit;
    if (statusCategory === "Completed") return styles.badgeDelivered;
    return styles.badgeCancelled;
  };

  if (!isLoggedIn) {
    return (
      <MobileContainer>
        <header className={styles.header}>
          <button onClick={() => router.back()} className={styles.iconButton}>
            <ChevronLeft size={22} strokeWidth={1.8} className={styles.icon} />
          </button>
          <h2 className={styles.title}>My Orders</h2>
          <div className={styles.iconButton} />
        </header>
        <main className={styles.mainContent}>
          <div className={styles.emptyState} style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <p>Please log in to view your orders.</p>
            <button
              onClick={() => setLoginModalOpen(true)}
              style={{ marginTop: "1rem", padding: "0.8rem 1.5rem", borderRadius: "8px", background: "#111", color: "#fff" }}
            >
              Log In
            </button>
          </div>
        </main>
        <BottomNav />
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      {/* Header bar */}
      <header className={styles.header}>
        <button
          onClick={() => router.back()}
          className={styles.iconButton}
          aria-label="Go back"
        >
          <ChevronLeft size={22} strokeWidth={1.8} className={styles.icon} />
        </button>
        <h2 className={styles.title}>My Orders</h2>
        <button
          onClick={() => router.push("/cart")}
          className={styles.iconButton}
          aria-label="Shopping cart"
        >
          <ShoppingBag size={20} strokeWidth={1.8} className={styles.icon} />
        </button>
      </header>

      <main className={styles.mainContent}>
        {/* Filter Tab Buttons */}
        <div className={styles.tabContainer}>
          {(["Active", "Completed", "Cancelled"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : styles.tabBtnInactive}`}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Orders Card Stack */}
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>Loading orders...</div>
        ) : error ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>Failed to load orders: {error.message}</div>
        ) : filteredOrders.length > 0 ? (
          <div className={styles.ordersList}>
            {filteredOrders.map((order: any) => (
              <div
                key={order.id}
                className={styles.orderCard}
                onClick={() => router.push(`/order/${order.id}`)}
                style={{ cursor: "pointer" }}
              >

                {/* Header Information */}
                <div className={styles.cardHeader}>
                  <div className={styles.headerLeft}>
                    <span className={styles.orderId}>{order.id}</span>
                    <span className={styles.orderDate}>{order.date}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${getStatusClass(order.statusCategory)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Items Listing Rows */}
                <div className={styles.itemsBlock}>
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className={styles.itemRow}>
                      <div className={styles.itemImageWrapper}>
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                          className={styles.itemImage}
                        />
                      </div>
                      <div className={styles.itemMeta}>
                        <h4 className={styles.itemName}>{item.name}</h4>
                        <span className={styles.itemSpecs}>
                          Size: {item.size} • Qty: {item.quantity}
                        </span>
                      </div>
                      <span className={styles.itemPrice}>{item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Update Log Notes */}
                {order.statusMessage && (
                  <div className={styles.updateLog}>
                    <p className={styles.logText}>
                      <strong>Update:</strong> {order.statusMessage}
                    </p>
                  </div>
                )}

                {/* Totals & Actions Footer */}
                <div className={styles.cardFooter}>
                  <div className={styles.totalBlock}>
                    <span className={styles.totalLabel}>Total Amount</span>
                    <span className={styles.totalValue}>{order.total}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/order/${order.id}`);
                    }}
                    className={styles.actionBtn}
                    type="button"
                  >
                    {order.actionText}
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No orders found in this section.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
