"use client";

import React from "react";
import { useRouter } from "next/navigation";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import { useCart } from "@/context/CartContext";
import {
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Shield,
  FileText,
  Headphones,
  LogOut,
} from "lucide-react";
import styles from "./page.module.css";

export default function SettingsPage() {
  const router = useRouter();
  const { isLoggedIn, logout } = useCart();

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
        <h2 className={styles.title}>Settings</h2>
        <div className={styles.iconButton} />
      </header>

      <main className={styles.mainContent}>
        <div className={styles.responsiveWrapper}>
          {/* Account Settings */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Account & Delivery</h3>
            <div className={styles.menuList}>
              <button className={styles.menuItem} onClick={() => router.push("/profile")}>
                <div className={styles.itemLeft}>
                  <div className={styles.iconWrapper}>
                    <User size={20} strokeWidth={1.8} />
                  </div>
                  <span className={styles.itemLabel}>Profile Information</span>
                </div>
                <ChevronRight size={18} strokeWidth={1.8} className={styles.chevron} />
              </button>

              <button className={styles.menuItem} onClick={() => router.push("/addresses")}>
                <div className={styles.itemLeft}>
                  <div className={styles.iconWrapper}>
                    <MapPin size={20} strokeWidth={1.8} />
                  </div>
                  <span className={styles.itemLabel}>Shipping Addresses</span>
                </div>
                <ChevronRight size={18} strokeWidth={1.8} className={styles.chevron} />
              </button>
            </div>
          </div>

          {/* Privacy & Legal */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Privacy & Legal</h3>
            <div className={styles.menuList}>
              <button className={styles.menuItem} onClick={() => router.push("/privacy")}>
                <div className={styles.itemLeft}>
                  <div className={styles.iconWrapper}>
                    <Shield size={20} strokeWidth={1.8} />
                  </div>
                  <span className={styles.itemLabel}>Privacy Policy</span>
                </div>
                <ChevronRight size={18} strokeWidth={1.8} className={styles.chevron} />
              </button>

              <button className={styles.menuItem} onClick={() => router.push("/terms")}>
                <div className={styles.itemLeft}>
                  <div className={styles.iconWrapper}>
                    <FileText size={20} strokeWidth={1.8} />
                  </div>
                  <span className={styles.itemLabel}>Terms & Conditions</span>
                </div>
                <ChevronRight size={18} strokeWidth={1.8} className={styles.chevron} />
              </button>
            </div>
          </div>

          {/* Help & Support */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Help & Support</h3>
            <div className={styles.menuList}>
              <button
                className={styles.menuItem}
                onClick={() =>
                  window.open(
                    "https://wa.me/916366858878?text=Hi%20Sri%20Aachi%20Creatives,%20I%20need%20help%20with%20my%20order.",
                    "_blank"
                  )
                }
              >
                <div className={styles.itemLeft}>
                  <div className={styles.iconWrapper}>
                    <Headphones size={20} strokeWidth={1.8} />
                  </div>
                  <span className={styles.itemLabel}>Contact Support (WhatsApp)</span>
                </div>
                <ChevronRight size={18} strokeWidth={1.8} className={styles.chevron} />
              </button>

              {isLoggedIn && (
                <button
                  className={styles.menuItem}
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  style={{ color: "#ef4444" }}
                >
                  <div className={styles.itemLeft}>
                    <div className={styles.iconWrapper} style={{ color: "#ef4444" }}>
                      <LogOut size={20} strokeWidth={1.8} />
                    </div>
                    <span className={styles.itemLabel} style={{ color: "#ef4444" }}>
                      Log Out
                    </span>
                  </div>
                  <ChevronRight size={18} strokeWidth={1.8} className={styles.chevron} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
