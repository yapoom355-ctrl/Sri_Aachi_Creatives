"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import { useCart } from "@/context/CartContext";
import { ChevronLeft, Info, Check, Trash2 } from "lucide-react";
import styles from "./page.module.css";

interface Coupon {
  code: string;
  value: string;
  title: string;
  description: string;
  expiry: string;
}

const COUPONS_DATA: Coupon[] = [
  {
    code: "SAVE10",
    value: "10%",
    title: "Sitewide Discount",
    description: "Get 10% off your entire order. Valid on all hoodies and active sneakers.",
    expiry: "Expires July 20, 2026",
  },
  {
    code: "FREESHIP",
    value: "FREE",
    title: "Free Standard Shipping",
    description: "Free standard home delivery on orders exceeding total purchase values of $100.",
    expiry: "Expires August 01, 2026",
  },
  {
    code: "WELCOME5",
    value: "$5",
    title: "Welcome Coupon",
    description: "Special sign-up gift of $5.00 off for first-time orders across Gubera collections.",
    expiry: "No Expiration Date",
  },
];

export default function CouponsPage() {
  const router = useRouter();
  const { appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const [manualCode, setManualCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const handleManualApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    if (applyCoupon(manualCode)) {
      alert(`Success! Coupon ${manualCode.toUpperCase()} applied.`);
      setManualCode("");
    } else {
      alert("Invalid code! Try 'SAVE10', 'WELCOME5', or 'FREESHIP'");
    }
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
        <h2 className={styles.title}>My Coupons</h2>
        <button
          onClick={() => alert("Promo codes can be applied inside checkout carts.")}
          className={styles.iconButton}
          aria-label="Help Info"
        >
          <Info size={20} strokeWidth={1.8} className={styles.icon} />
        </button>
      </header>

      <main className={styles.mainContent}>
        {/* Manual Input Form */}
        <div className={styles.manualSection}>
          <form onSubmit={handleManualApply} className={styles.manualForm}>
            <input
              type="text"
              placeholder="Enter promo code manually..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className={styles.manualInput}
            />
            <button type="submit" className={styles.manualApplyBtn}>
              Apply
            </button>
          </form>

          {appliedCoupon && (
            <div className={styles.activeCouponAlert}>
              <div className={styles.activeAlertLeft}>
                <Check size={14} className={styles.activeCheck} strokeWidth={3} />
                <span className={styles.activeText}>
                  Active Coupon: <strong>{appliedCoupon}</strong>
                </span>
              </div>
              <button
                onClick={removeCoupon}
                className={styles.removeCouponBtn}
                title="Remove applied coupon"
                type="button"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Coupons Ticket Cards List */}
        <div className={styles.couponsList}>
          {COUPONS_DATA.map((coupon) => {
            const isApplied = appliedCoupon === coupon.code;
            return (
              <div key={coupon.code} className={`${styles.ticketCard} ${isApplied ? styles.ticketCardActive : ""}`}>
                {/* Ticket Punchouts circles */}
                <div className={styles.punchoutLeft} />
                <div className={styles.punchoutRight} />

                {/* Left Side (Value Indicator) */}
                <div className={`${styles.valueSection} ${isApplied ? styles.valueSectionActive : ""}`}>
                  <span className={styles.valueText}>{coupon.value}</span>
                  <span className={styles.valueSub}>OFF</span>
                </div>

                {/* Dashed Separator */}
                <div className={styles.divider} />

                {/* Right Side (Promo Info and Actions) */}
                <div className={styles.infoSection}>
                  <div className={styles.meta}>
                    <h3 className={styles.couponTitle}>{coupon.title}</h3>
                    <p className={styles.description}>{coupon.description}</p>
                    <span className={styles.expiry}>{coupon.expiry}</span>
                  </div>
                  
                  <div className={styles.codeRow}>
                    <div className={styles.codeBox}>
                      <span className={styles.codeText}>{coupon.code}</span>
                    </div>

                    <div className={styles.actionsGroup}>
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className={`${styles.copyBtn} ${copiedCode === coupon.code ? styles.copiedActive : ""}`}
                        type="button"
                      >
                        {copiedCode === coupon.code ? "Copied!" : "Copy"}
                      </button>

                      <button
                        onClick={() => isApplied ? removeCoupon() : applyCoupon(coupon.code)}
                        className={`${styles.applyBtn} ${isApplied ? styles.applyBtnActive : styles.applyBtnInactive}`}
                        type="button"
                      >
                        {isApplied ? "Applied" : "Apply"}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
