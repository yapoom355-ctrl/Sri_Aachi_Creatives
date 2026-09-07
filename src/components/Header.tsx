"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./Header.module.css";

export default function Header() {
  const router = useRouter();
  const { cartCount, setSidebarOpen, isLoggedIn, setLoginModalOpen } = useCart();

  const handleCartClick = () => {
    if (window.innerWidth < 768) {
      router.push("/cart");
    } else {
      setSidebarOpen(true);
    }
  };

  const handleProfileClick = () => {
    if (isLoggedIn) {
      router.push("/profile");
    } else {
      setLoginModalOpen(true);
    }
  };

  return (
    <header className={styles.header}>
      {/* Brand Logo — left */}
      <Link
        href="/"
        className={styles.brandLogoLink}
        aria-label="Sri Aachi Creatives — Home"
      >
        <Image
          src="/images/sri-aachi-logo.png"
          alt="Sri Aachi Creatives"
          width={400}
          height={400}
          className={styles.brandLogo}
          priority
        />
      </Link>

      {/* Action Icons: User & Shopping Bag (Cart) */}
      <div className={styles.actionsContainer}>
        <button
          className={styles.iconButton}
          aria-label="User Account"
          onClick={handleProfileClick}
          title={isLoggedIn ? "My Profile" : "Sign In / Register"}
        >
          <User size={20} strokeWidth={1.8} className={styles.icon} />
        </button>

        <button
          className={styles.iconButton}
          aria-label="Shopping Cart"
          onClick={handleCartClick}
          title="Cart"
        >
          <ShoppingBag size={20} strokeWidth={1.8} className={styles.icon} />
          {cartCount > 0 && (
            <span className={styles.cartBadge}>{cartCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
