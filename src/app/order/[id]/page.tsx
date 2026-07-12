"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import { ChevronLeft, HelpCircle, Check, MapPin, CreditCard } from "lucide-react";
import styles from "./page.module.css";

interface OrderDetails {
  id: string;
  date: string;
  time: string;
  status: string;
  subtotal: string;
  shipping: string;
  total: string;
  address: {
    name: string;
    street: string;
    cityState: string;
    phone: string;
  };
  payment: {
    type: string;
    cardNo: string;
  };
  steps: {
    title: string;
    time?: string;
    completed: boolean;
    active?: boolean;
  }[];
  items: {
    name: string;
    price: string;
    image: string;
    size: string;
    quantity: number;
  }[];
}

const ORDERS_DETAILS_DB: Record<string, OrderDetails> = {
  "ORD-984310": {
    id: "ORD-984310",
    date: "July 10, 2026",
    time: "03:24 PM",
    status: "In Transit",
    subtotal: "$250.00",
    shipping: "$5.00",
    total: "$255.00",
    address: {
      name: "Asha Royden",
      street: "124 Baker Street",
      cityState: "London, NW1 6XE, UK",
      phone: "+44 20 7946 0958",
    },
    payment: {
      type: "Visa",
      cardNo: "•••• 4242",
    },
    steps: [
      { title: "Order Placed", time: "July 10, 03:24 PM", completed: true },
      { title: "Payment Confirmed", time: "July 10, 03:26 PM", completed: true },
      { title: "Processed & Packed", time: "July 10, 06:10 PM", completed: true },
      { title: "In Transit", time: "July 11, 09:00 AM", completed: true, active: true },
      { title: "Delivered", completed: false },
    ],
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
  "ORD-982405": {
    id: "ORD-982405",
    date: "July 02, 2026",
    time: "11:15 AM",
    status: "Delivered",
    subtotal: "$130.00",
    shipping: "$5.00",
    total: "$135.00",
    address: {
      name: "Asha Royden",
      street: "124 Baker Street",
      cityState: "London, NW1 6XE, UK",
      phone: "+44 20 7946 0958",
    },
    payment: {
      type: "Visa",
      cardNo: "•••• 4242",
    },
    steps: [
      { title: "Order Placed", time: "July 02, 11:15 AM", completed: true },
      { title: "Payment Confirmed", time: "July 02, 11:18 AM", completed: true },
      { title: "Processed & Packed", time: "July 02, 02:40 PM", completed: true },
      { title: "Shipped out", time: "July 03, 10:00 AM", completed: true },
      { title: "Delivered", time: "July 05, 04:12 PM", completed: true, active: true },
    ],
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
  "ORD-979920": {
    id: "ORD-979920",
    date: "June 15, 2026",
    time: "06:40 PM",
    status: "Cancelled",
    subtotal: "$120.00",
    shipping: "$0.00",
    total: "$120.00",
    address: {
      name: "Asha Royden",
      street: "124 Baker Street",
      cityState: "London, NW1 6XE, UK",
      phone: "+44 20 7946 0958",
    },
    payment: {
      type: "Visa",
      cardNo: "•••• 4242",
    },
    steps: [
      { title: "Order Placed", time: "June 15, 06:40 PM", completed: true },
      { title: "Cancelled", time: "June 15, 07:10 PM", completed: true, active: true },
    ],
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
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;

  const order = ORDERS_DETAILS_DB[id] || ORDERS_DETAILS_DB["ORD-984310"];

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
        <h2 className={styles.title}>Order Details</h2>
        <button
          onClick={() => alert("Connecting with order customer support chat...")}
          className={styles.iconButton}
          aria-label="Support Help"
        >
          <HelpCircle size={20} strokeWidth={1.8} className={styles.icon} />
        </button>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.responsiveWrapper}>
          
          {/* Left Column - Stepper timeline & Items list */}
          <div className={styles.leftCol}>
            {/* Tracking Stepper */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Tracking Status</h3>
                <span className={styles.orderTag}>{order.id}</span>
              </div>

              <div className={styles.stepper}>
                {order.steps.map((step, idx) => (
                  <div key={idx} className={styles.stepRow}>
                    <div className={styles.indicatorCol}>
                      <div
                        className={`${styles.circle} ${
                          step.completed
                            ? step.active
                              ? styles.circleActive
                              : styles.circleCompleted
                            : styles.circlePending
                        }`}
                      >
                        {step.completed && !step.active && <Check size={12} strokeWidth={3} />}
                        {step.active && <div className={styles.innerDot} />}
                      </div>
                      {idx < order.steps.length - 1 && (
                        <div
                          className={`${styles.line} ${
                            step.completed && order.steps[idx + 1].completed
                              ? styles.lineCompleted
                              : styles.linePending
                          }`}
                        />
                      )}
                    </div>
                    <div className={styles.stepMeta}>
                      <span
                        className={`${styles.stepTitle} ${
                          step.active ? styles.titleActive : ""
                        }`}
                      >
                        {step.title}
                      </span>
                      {step.time && <span className={styles.stepTime}>{step.time}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchased Items List */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Purchased Items</h3>
              <div className={styles.itemsList}>
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
            </div>
          </div>

          {/* Right Column - Address, Payments, Financial details */}
          <div className={styles.rightCol}>
            {/* Delivery address */}
            <div className={styles.card}>
              <div className={styles.sectionHeader}>
                <MapPin size={18} strokeWidth={2} className={styles.sectionIcon} />
                <h3 className={styles.cardTitleInline}>Shipping Address</h3>
              </div>
              <div className={styles.addressMeta}>
                <h4 className={styles.addressName}>{order.address.name}</h4>
                <p className={styles.addressText}>{order.address.street}</p>
                <p className={styles.addressText}>{order.address.cityState}</p>
                <p className={styles.addressPhone}>Phone: {order.address.phone}</p>
              </div>
            </div>

            {/* Payment method */}
            <div className={styles.card}>
              <div className={styles.sectionHeader}>
                <CreditCard size={18} strokeWidth={2} className={styles.sectionIcon} />
                <h3 className={styles.cardTitleInline}>Payment Method</h3>
              </div>
              <div className={styles.paymentMeta}>
                <span className={styles.cardType}>{order.payment.type}</span>
                <span className={styles.cardNo}>{order.payment.cardNo}</span>
              </div>
            </div>

            {/* Cost breakdown */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Price Details</h3>
              <div className={styles.priceSummary}>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Subtotal</span>
                  <span className={styles.priceValue}>{order.subtotal}</span>
                </div>
                <div className={styles.priceRow}>
                  <span className={styles.priceLabel}>Delivery Charges</span>
                  <span className={styles.priceValue}>{order.shipping}</span>
                </div>
                <div className={`${styles.priceRow} ${styles.totalRow}`}>
                  <span className={styles.totalLabel}>Total Amount</span>
                  <span className={styles.totalValue}>{order.total}</span>
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
