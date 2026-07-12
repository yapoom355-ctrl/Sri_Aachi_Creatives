"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag, Bell } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./Header.module.css";

export default function Header() {
  const router = useRouter();
  const { cartCount, setSidebarOpen } = useCart();

  const handleCartClick = () => {
    if (window.innerWidth < 768) {
      router.push("/cart");
    } else {
      setSidebarOpen(true);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.profileContainer}>
        <Image
          src="/images/profile.png"
          alt="Profile Avatar"
          width={44}
          height={44}
          className={styles.profilePic}
          priority
        />
      </div>
      <div className={styles.actionsContainer}>
        <button 
          className={styles.iconButton} 
          aria-label="Shopping Cart"
          onClick={handleCartClick}
        >
          <ShoppingBag size={22} strokeWidth={1.8} className={styles.icon} />
          {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
        </button>
        <button className={styles.iconButton} aria-label="Notifications">
          <Bell size={22} strokeWidth={1.8} className={styles.icon} />
          <span className={styles.notificationBadge} />
        </button>
      </div>
    </header>
  );
}
