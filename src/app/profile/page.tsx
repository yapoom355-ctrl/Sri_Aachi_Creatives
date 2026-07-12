"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MobileContainer from "@/components/MobileContainer";
import BottomNav from "@/components/BottomNav";
import {
  ChevronLeft,
  Bell,
  ChevronRight,
  ShoppingBag,
  MapPin,
  CreditCard,
  Tag,
  Settings,
  LogOut,
} from "lucide-react";
import styles from "./page.module.css";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  isRed?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      id: "orders",
      label: "My Orders",
      icon: <ShoppingBag size={20} strokeWidth={1.8} />,
    },
    {
      id: "shipping",
      label: "Shipping Addresses",
      icon: <MapPin size={20} strokeWidth={1.8} />,
    },
    {
      id: "payment",
      label: "Payment Methods",
      icon: <CreditCard size={20} strokeWidth={1.8} />,
    },
    {
      id: "promos",
      label: "Promo Codes",
      icon: <Tag size={20} strokeWidth={1.8} />,
      badge: "1 Active",
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={20} strokeWidth={1.8} />,
    },
    {
      id: "logout",
      label: "Log Out",
      icon: <LogOut size={20} strokeWidth={1.8} />,
      isRed: true,
    },
  ];

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
        <h2 className={styles.title}>My Profile</h2>
        <button className={styles.iconButton} aria-label="Notifications">
          <Bell size={22} strokeWidth={1.8} className={styles.icon} />
        </button>
      </header>

      <main className={styles.mainContent}>
        {/* Split grid wrapper for responsive layouts */}
        <div className={styles.responsiveWrapper}>
          
          {/* Left Column - Details */}
          <div className={styles.detailsBlock}>
            {/* User Avatar Card */}
            <div className={styles.userCard}>
              <div className={styles.avatarContainer}>
                <Image
                  src="/images/profile.png"
                  alt="Asha Royden Profile"
                  width={96}
                  height={96}
                  className={styles.avatar}
                  priority
                />
              </div>
              <h3 className={styles.userName}>Asha Royden</h3>
              <p className={styles.userEmail}>asha.royden@example.com</p>
            </div>

            {/* Statistics */}
            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <span className={styles.statValue}>12</span>
                <span className={styles.statLabel}>Orders</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>8</span>
                <span className={styles.statLabel}>Favorites</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statValue}>3</span>
                <span className={styles.statLabel}>Coupons</span>
              </div>
            </div>
          </div>

          {/* Right Column - Options List */}
          <div className={styles.menuBlock}>
            <div className={styles.menuList}>
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className={`${styles.menuItem} ${item.isRed ? styles.menuItemRed : ""}`}
                  onClick={() => {
                    if (item.id === "orders") {
                      router.push("/orders");
                    } else if (item.id === "shipping") {
                      router.push("/addresses");
                    } else if (item.id === "promos") {
                      alert("Your active promo code is: SAVE10");
                    }
                  }}
                  type="button"
                >
                  <div className={styles.itemLeft}>
                    <div className={styles.iconWrapper}>{item.icon}</div>
                    <span className={styles.itemLabel}>{item.label}</span>
                  </div>
                  <div className={styles.itemRight}>
                    {item.badge && <span className={styles.itemBadge}>{item.badge}</span>}
                    <ChevronRight size={18} strokeWidth={1.8} className={styles.chevron} />
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
