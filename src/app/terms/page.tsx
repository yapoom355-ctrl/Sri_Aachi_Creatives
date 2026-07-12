"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Scale } from "lucide-react";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import styles from "./page.module.css";

export default function TermsPage() {
  const router = useRouter();

  return (
    <MobileContainer>
      <div className={styles.mainContent}>
        {/* Navigation Header */}
        <header className={styles.header}>
          <button onClick={() => router.back()} className={styles.backButton} aria-label="Back">
            <ChevronLeft size={22} />
          </button>
          <h2 className={styles.title}>Terms & Conditions</h2>
          <div className={styles.placeholder} />
        </header>

        {/* Brand Icon and Header */}
        <div className={styles.policyHeader}>
          <div className={styles.iconCircle}>
            <Scale size={28} />
          </div>
          <p className={styles.lastUpdated}>Last updated: July 2026</p>
        </div>

        {/* Document Content */}
        <div className={styles.documentBody}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>1. Acceptance of Terms</h3>
            <p className={styles.sectionText}>
              By accessing and placing an order with Gubera Shop, you confirm that you are in agreement with and bound by the terms of service contained in the Terms and Conditions outlined below. These terms apply to the entire website and any email or other type of communication between you and Gubera Shop.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>2. Product Availability & Specifications</h3>
            <p className={styles.sectionText}>
              All products listed on our website, including sizes, colors, and designs, are subject to availability. While we make every effort to display the colors of our products as accurately as possible, the actual colors you see will depend on your monitor display.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>3. Pricing & Payment</h3>
            <p className={styles.sectionText}>
              Prices for our products are subject to change without notice. We reserve the right at any time to modify or discontinue any product. We accept standard payment integrations, and you represent that you have the legal right to use all payment methods provided at checkout.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>4. Verification & OTP Login</h3>
            <p className={styles.sectionText}>
              Accessing certain features of the service, including your personal settings and order history, requires authentication via phone verification. You agree to receive OTP verification codes sent to your registered phone number, and you are solely responsible for keeping your credentials confidential.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>5. Contact Information</h3>
            <p className={styles.sectionText}>
              For any questions, clarifications, or support requests regarding these Terms and Conditions, please email us at <strong>asha.royden@example.com</strong>.
            </p>
          </section>
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
