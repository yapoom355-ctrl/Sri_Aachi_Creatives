"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import {
  ChevronLeft,
  CreditCard,
  Plus,
  Wallet,
  Smartphone,
} from "lucide-react";
import styles from "./page.module.css";

// Mock data to illustrate UI functionality
const initialMethods = [
  {
    id: "pm_1",
    type: "credit_card",
    brand: "Visa",
    last4: "4242",
    expiry: "12/28",
    isDefault: true,
  },
  {
    id: "pm_2",
    type: "upi",
    vpa: "riyaa@okicici",
    isDefault: false,
  },
];

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [methods, setMethods] = useState(initialMethods);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this payment method?")) {
      setMethods(methods.filter((m) => m.id !== id));
    }
  };

  const handleSetDefault = (id: string) => {
    setMethods(
      methods.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
  };

  const handleAddPayment = () => {
    alert("Razorpay integration for saving cards/UPI will be opened here.");
  };

  return (
    <MobileContainer>
      {/* Header bar */}
      <header className={styles.header}>
        <button
          onClick={() => router.push("/profile")}
          className={styles.iconButton}
          aria-label="Go back"
        >
          <ChevronLeft size={22} strokeWidth={1.8} />
        </button>
        <h2 className={styles.title}>Payment Methods</h2>
        <div className={styles.iconButton} />
      </header>

      <main className={styles.mainContent}>
        <div className={styles.responsiveWrapper}>
          
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Saved Payment Methods</h3>
            
            {methods.length > 0 ? (
              <div className={styles.cardList}>
                {methods.map((method) => (
                  <div key={method.id} className={styles.paymentCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardLeft}>
                        {method.type === "credit_card" ? (
                          <CreditCard className={styles.cardIcon} size={24} strokeWidth={1.5} />
                        ) : (
                          <Smartphone className={styles.cardIcon} size={24} strokeWidth={1.5} />
                        )}
                        <h4 className={styles.cardType}>
                          {method.type === "credit_card" ? method.brand : "UPI"}
                        </h4>
                      </div>
                      {method.isDefault && (
                        <span className={styles.defaultBadge}>Default</span>
                      )}
                    </div>
                    
                    {method.type === "credit_card" ? (
                      <>
                        <div className={styles.cardNumber}>
                          •••• •••• •••• {method.last4}
                        </div>
                        <div className={styles.cardExpiry}>
                          Expires {method.expiry}
                        </div>
                      </>
                    ) : (
                      <div className={styles.cardNumber} style={{ fontSize: "1rem", letterSpacing: "0.5px" }}>
                        {method.vpa}
                      </div>
                    )}
                    
                    <div className={styles.cardActions}>
                      {!method.isDefault && (
                        <button 
                          className={styles.actionBtn}
                          onClick={() => handleSetDefault(method.id)}
                        >
                          Set as Default
                        </button>
                      )}
                      <button 
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDelete(method.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Wallet size={48} strokeWidth={1} className={styles.emptyIcon} />
                <p className={styles.emptyText}>
                  You haven't saved any payment methods yet.
                </p>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <button className={styles.addButton} onClick={handleAddPayment}>
              <Plus size={20} />
              Add New Payment Method
            </button>
          </div>

        </div>
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
