"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import { useCart } from "@/context/CartContext";
import { ChevronLeft, Info, Check, Trash2 } from "lucide-react";
import { GET_COUPONS } from "@/graphql/queries";
import styles from "./page.module.css";

interface Coupon {
  id: string;
  code: string;
  value: string;
  title: string;
  description: string;
  expiry: string;
}

export default function CouponsPage() {
  const router = useRouter();
  const { appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const [manualCode, setManualCode] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data, loading, error } = useQuery(GET_COUPONS, {
    fetchPolicy: "cache-and-network",
  }) as any;

  const rawVouchers =
    data?.vouchers?.edges?.map((e: any) => e.node) ||
    data?.coupons ||
    [];

  const couponsData: Coupon[] = rawVouchers.map((c: any) => ({
    id: c.id,
    code: c.code,
    value: c.discountValue ? (c.type === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`) : "10% OFF",
    title: c.name || c.description || "Special Discount",
    description: c.description || `Use promo code ${c.code} for a special discount.`,
    expiry: c.endDate ? `Expires ${new Date(c.endDate).toLocaleDateString()}` : "Active Now",
  }));

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const handleManualApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const success = await applyCoupon(manualCode);
    if (success) {
      alert(`Success! Coupon ${manualCode.toUpperCase()} applied.`);
      setManualCode("");
    } else {
      alert(`Invalid code!`);
    }
  };

  const handleApplyCoupon = async (code: string) => {
    const success = await applyCoupon(code);
    if (success) {
      alert(`Success! Coupon ${code} applied.`);
    } else {
      alert(`Failed to apply coupon ${code}.`);
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
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", opacity: 0.6 }}>Checking active coupons...</div>
        ) : couponsData.length > 0 ? (
          <div className={styles.couponsList}>
            {couponsData.map((coupon) => {
              const isApplied = appliedCoupon === coupon.code;
              return (
                <div key={coupon.id} className={`${styles.ticketCard} ${isApplied ? styles.ticketCardActive : ""}`}>
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
                          onClick={() => isApplied ? removeCoupon() : handleApplyCoupon(coupon.code)}
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
        ) : (
          <div style={{ padding: "2.5rem 1.5rem", textAlign: "center", color: "#666", fontSize: "0.9rem" }}>
            <p style={{ margin: 0, fontWeight: 600, color: "#111", fontSize: "1rem" }}>Have a coupon or discount code?</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.82rem", color: "#888" }}>
              Enter your promotional code in the box above or apply it during checkout to redeem your savings.
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
