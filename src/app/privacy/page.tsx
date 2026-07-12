"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import styles from "./page.module.css";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <MobileContainer>
      <div className={styles.mainContent}>
        {/* Navigation Header */}
        <header className={styles.header}>
          <button onClick={() => router.back()} className={styles.backButton} aria-label="Back">
            <ChevronLeft size={22} />
          </button>
          <h2 className={styles.title}>Privacy Policy</h2>
          <div className={styles.placeholder} />
        </header>

        {/* Brand Icon and Header */}
        <div className={styles.policyHeader}>
          <div className={styles.iconCircle}>
            <ShieldCheck size={28} />
          </div>
          <p className={styles.lastUpdated}>Last updated: July 2026</p>
        </div>

        {/* Document Content */}
        <div className={styles.documentBody}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>1. Information We Collect</h3>
            <p className={styles.sectionText}>
              We collect information to provide better services to all our users. This includes phone numbers used for verification/login, shipping addresses you manually save to your dashboard settings, and order history transactions. We do not store credit card credentials on our servers.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>2. How We Use Information</h3>
            <p className={styles.sectionText}>
              We use the collected information to process and fulfill your product purchases, verify your identity via OTP validation blocks, manage shipping addresses, and notify you of order status changes.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>3. Information Security</h3>
            <p className={styles.sectionText}>
              We work hard to protect Gubera Shop and our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of information we hold. We restrict access to personal details only to core functions required to execute shipments.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>4. Sharing of Information</h3>
            <p className={styles.sectionText}>
              We do not share personal information with companies, organizations, or individuals outside of Gubera Shop except in limited circumstances such as fulfilling deliveries via courier agencies or meeting legal requirements.
            </p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>5. Contact Information</h3>
            <p className={styles.sectionText}>
              If you have any questions or concerns regarding our Privacy Policy or data security practices, please contact us at <strong>asha.royden@example.com</strong>.
            </p>
          </section>
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
