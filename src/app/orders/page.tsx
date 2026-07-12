"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, ShoppingBag } from "lucide-react";
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
  status: "In Transit" | "Delivered" | "Cancelled";
  total: string;
  items: OrderItem[];
  statusMessage?: string;
  actionText: string;
}

const ORDERS: OrderData[] = [
  {
    id: "ORD-984310",
    date: "July 10, 2026",
    status: "In Transit",
    total: "$255.00",
    statusMessage: "Departed sorting facility, in transit to hub",
    actionText: "Track Order",
    items: [
      {
        name: "Midnight Bloom Hoodie",
        price: "$120.00",
        image: "/images/product-green.png",
        size: "XXL",
        quantity: 1,
      },
      {
        name: "Prestige Canvas Caps",
        price: "$30.00",
        image: "/images/product-white.png",
        size: "M",
        quantity: 1,
      },
    ],
  },
  {
    id: "ORD-982405",
    date: "July 02, 2026",
    status: "Delivered",
    total: "$135.00",
    actionText: "Write Review",
    items: [
      {
        name: "Crimson Wave Hoodie",
        price: "$120.00",
        image: "/images/product-blue.png",
        size: "XXL",
        quantity: 1,
      },
    ],
  },
  {
    id: "ORD-979920",
    date: "June 15, 2026",
    status: "Cancelled",
    total: "$120.00",
    actionText: "Contact Support",
    items: [
      {
        name: "Forest Green Hoodie",
        price: "$120.00",
        image: "/images/product-white.png",
        size: "L",
        quantity: 1,
      },
    ],
  },
];

export default function MyOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Active" | "Completed" | "Cancelled">("Active");

  const filteredOrders = ORDERS.filter((order) => {
    if (activeTab === "Active") return order.status === "In Transit";
    if (activeTab === "Completed") return order.status === "Delivered";
    return order.status === "Cancelled";
  });

  const getStatusClass = (status: string) => {
    if (status === "In Transit") return styles.badgeTransit;
    if (status === "Delivered") return styles.badgeDelivered;
    return styles.badgeCancelled;
  };

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
        {filteredOrders.length > 0 ? (
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
                    <span className={styles.orderId}>{order.id}</span>
                    <span className={styles.orderDate}>{order.date}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
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
                      alert(`${order.actionText} clicked for ${order.id}`);
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
