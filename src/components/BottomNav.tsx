"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, ShoppingCart, Heart, User, LayoutGrid } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./BottomNav.module.css";

// CONFIGURATION TOGGLE:
// - Set to 'true' to use ONLY bottom navigation on all screen sizes.
// - Set to 'false' to use bottom navigation on mobile and top navigation on web/tablet.
export const FORCE_BOTTOM_NAV = false;

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { setSidebarOpen, setWishlistSidebarOpen } = useCart();

  useEffect(() => {
    if (FORCE_BOTTOM_NAV) {
      document.body.classList.add("forced-bottom-nav");
    } else {
      document.body.classList.remove("forced-bottom-nav");
    }
  }, []);

  const getActiveTab = () => {
    if (pathname === "/") return "home";
    if (pathname?.startsWith("/categories")) return "categories";
    if (pathname === "/cart") return "cart";
    if (
      pathname?.startsWith("/profile") ||
      pathname?.startsWith("/orders") ||
      pathname?.startsWith("/order") ||
      pathname?.startsWith("/addresses") ||
      pathname?.startsWith("/coupons")
    ) {
      return "profile";
    }
    if (
      pathname?.startsWith("/wishlist")
    ) {
      return "favorites";
    }
    return "home";
  };

  const activeTab = getActiveTab();

  const handleHomeClick = () => {
    router.push("/");
  };

  const handleCartClick = () => {
    if (window.innerWidth < 768) {
      router.push("/cart");
    } else {
      setSidebarOpen(true);
    }
  };

  const handleCategoriesClick = () => {
    router.push("/categories");
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <div
      className={`${styles.navContainer} ${FORCE_BOTTOM_NAV ? styles.forceBottom : ""}`}
    >
      <nav
        className={`${styles.navBar} ${FORCE_BOTTOM_NAV ? styles.forceBottomBar : ""}`}
      >
        {/* Home Tab */}
        <button
          className={`${styles.navItem} ${activeTab === "home" ? styles.activeItem : styles.inactiveItem}`}
          onClick={handleHomeClick}
          aria-label="Home"
        >
          <Home size={18} strokeWidth={2.5} />
          <span className={styles.navText}>Home</span>
        </button>

        {/* Categories Tab */}
        <button
          className={`${styles.navItem} ${activeTab === "categories" ? styles.activeItem : styles.inactiveItem}`}
          onClick={handleCategoriesClick}
          aria-label="Categories"
        >
          <LayoutGrid size={18} strokeWidth={2.5} />
          <span className={styles.navText}>Categories</span>
        </button>

        {/* Cart Tab */}
        <button
          className={`${styles.navItem} ${activeTab === "cart" ? styles.activeItem : styles.inactiveItem}`}
          onClick={handleCartClick}
          aria-label="Cart"
        >
          <ShoppingCart size={18} strokeWidth={2.5} />
          <span className={styles.navText}>Cart</span>
        </button>

        {/* Favorites Tab */}
        <button
          className={`${styles.navItem} ${activeTab === "favorites" ? styles.activeItem : styles.inactiveItem}`}
          onClick={() => {
            if (window.innerWidth < 768) {
              router.push("/wishlist");
            } else {
              setWishlistSidebarOpen(true);
            }
          }}
          aria-label="Wishlist"
        >
          <Heart size={18} strokeWidth={2.5} />
          <span className={styles.navText}>Wishlist</span>
        </button>

        {/* Profile Tab */}
        <button
          className={`${styles.navItem} ${activeTab === "profile" ? styles.activeItem : styles.inactiveItem}`}
          onClick={handleProfileClick}
          aria-label="Profile"
        >
          <User size={18} strokeWidth={2.5} />
          <span className={styles.navText}>Profile</span>
        </button>
      </nav>
    </div>
  );
}
