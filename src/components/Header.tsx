"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
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
      {/* Brand Logo — left */}
      <Link href="/" className={styles.brandLogoLink} aria-label="Sri Aachi Creatives — Home">
        <Image
          src="/images/sri-aachi-logo.png"
          alt="Sri Aachi Creatives"
          width={200}
          height={200}
          className={styles.brandLogo}
          priority
        />
      </Link>

      {/* Action Icons */}
      <div className={styles.actionsContainer}>
        <button
          className={styles.iconButton}
          aria-label="Shopping Cart"
          onClick={handleCartClick}
        >
          <ShoppingBag size={20} strokeWidth={1.8} className={styles.icon} />
          {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
        </button>
        <button className={styles.iconButton} aria-label="Notifications">
          <Bell size={20} strokeWidth={1.8} className={styles.icon} />
          <span className={styles.notificationBadge} />
        </button>
      </div>
    </header>
  );
}

