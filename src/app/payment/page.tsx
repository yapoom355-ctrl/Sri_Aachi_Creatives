"use client";

import React from "react";
import { useRouter } from "next/navigation";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import {
  ChevronLeft,
  ShieldCheck,
  CreditCard,
  Banknote,
  Lock,
  CheckCircle2,
} from "lucide-react";
import styles from "./page.module.css";

export default function PaymentMethodsPage() {
  const router = useRouter();

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
        <h2 className={styles.title}>Payment Information</h2>
        <div className={styles.iconButton} />
      </header>

      <main className={styles.mainContent}>
        <div style={{ padding: "1.5rem 1rem", maxWidth: "600px", margin: "0 auto" }}>
          {/* Security Banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              borderRadius: "14px",
              padding: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <ShieldCheck size={28} color="#059669" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#065f46", fontWeight: 600 }}>
                100% Safe & Secure Payments
              </h4>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#047857" }}>
                Encrypted via Razorpay 256-bit SSL Banking Standards
              </p>
            </div>
          </div>

          {/* Supported Methods */}
          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
            Available Payment Options at Checkout
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
            {/* Razorpay Online */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.08)",
                background: "#fff",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "#eff6ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2563eb",
                  flexShrink: 0,
                }}
              >
                <CreditCard size={22} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>Razorpay Online Payment</h4>
                <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#666" }}>
                  UPI (GPay, PhonePe, Paytm), Credit/Debit Cards & Netbanking
                </p>
              </div>
            </div>

            {/* Cash on Delivery */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1rem",
                borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.08)",
                background: "#fff",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  background: "#fef3c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#d97706",
                  flexShrink: 0,
                }}
              >
                <Banknote size={22} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>Cash on Delivery (COD)</h4>
                <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#666" }}>
                  Pay cash at your doorstep upon order delivery
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.6rem",
              fontSize: "0.75rem",
              color: "#6b7280",
              lineHeight: 1.5,
              marginBottom: "2rem",
            }}
          >
            <Lock size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>
              We do not store your credit card or debit card numbers on our servers. All financial transactions are directly processed through Razorpay's RBI-compliant PCI-DSS Level 1 gateway.
            </span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/checkout")}
            style={{
              width: "100%",
              padding: "0.95rem",
              borderRadius: "12px",
              background: "#A47449",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.95rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
