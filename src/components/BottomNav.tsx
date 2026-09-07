"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, ShoppingCart, Heart, User, LayoutGrid } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./BottomNav.module.css";

export const FORCE_BOTTOM_NAV = true;

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    cartCount,
    setSidebarOpen,
    wishlist,
    setWishlistSidebarOpen,
    isLoggedIn,
    setLoginModalOpen,
  } = useCart();

  useEffect(() => {
    document.body.classList.add("forced-bottom-nav");
    return () => {
      document.body.classList.remove("forced-bottom-nav");
    };
  }, []);

  const getActiveTab = () => {
    if (pathname === "/") return "home";
    if (pathname?.startsWith("/categories")) return "categories";
    if (pathname === "/cart") return "cart";
    if (pathname?.startsWith("/wishlist")) return "wishlist";
    if (
      pathname?.startsWith("/profile") ||
      pathname?.startsWith("/orders") ||
      pathname?.startsWith("/order") ||
      pathname?.startsWith("/addresses") ||
      pathname?.startsWith("/coupons")
    ) {
      return "profile";
    }
    return "home";
  };

  const activeTab = getActiveTab();

  const handleHomeClick = () => {
    router.push("/");
  };

  const handleCategoriesClick = () => {
    router.push("/categories");
  };

  const handleCartClick = () => {
    if (window.innerWidth < 768) {
      router.push("/cart");
    } else {
      setSidebarOpen(true);
    }
  };

  const handleWishlistClick = () => {
    if (window.innerWidth < 768) {
      router.push("/wishlist");
    } else {
      setWishlistSidebarOpen(true);
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
    <div className={styles.navContainer}>
      <nav className={styles.navBar} aria-label="Bottom Navigation">
        {/* 1. Home Tab */}
        <button
          className={`${styles.navItem} ${activeTab === "home" ? styles.activeItem : styles.inactiveItem}`}
          onClick={handleHomeClick}
          aria-label="Home"
          title="Home"
        >
          <Home size={20} strokeWidth={activeTab === "home" ? 2.5 : 2} />
        </button>

        {/* 2. Categories Tab */}
        <button
          className={`${styles.navItem} ${activeTab === "categories" ? styles.activeItem : styles.inactiveItem}`}
          onClick={handleCategoriesClick}
          aria-label="Categories"
          title="Categories"
        >
          <LayoutGrid size={20} strokeWidth={activeTab === "categories" ? 2.5 : 2} />
        </button>

        {/* 3. Cart Tab */}
        <button
          className={`${styles.navItem} ${activeTab === "cart" ? styles.activeItem : styles.inactiveItem}`}
          onClick={handleCartClick}
          aria-label="Cart"
          title="Cart"
        >
          <ShoppingCart size={20} strokeWidth={activeTab === "cart" ? 2.5 : 2} />
          {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
        </button>

        {/* 4. Wishlist Tab */}
        <button
          className={`${styles.navItem} ${activeTab === "wishlist" ? styles.activeItem : styles.inactiveItem}`}
          onClick={handleWishlistClick}
          aria-label="Wishlist"
          title="Wishlist"
        >
          <Heart size={20} strokeWidth={activeTab === "wishlist" ? 2.5 : 2} />
          {wishlist.length > 0 && (
            <span className={styles.badge}>{wishlist.length}</span>
          )}
        </button>

        {/* 5. Profile Tab */}
        <button
          className={`${styles.navItem} ${activeTab === "profile" ? styles.activeItem : styles.inactiveItem}`}
          onClick={handleProfileClick}
          aria-label="Profile"
          title="Profile"
        >
          <User size={20} strokeWidth={activeTab === "profile" ? 2.5 : 2} />
        </button>
      </nav>
    </div>
  );
}
