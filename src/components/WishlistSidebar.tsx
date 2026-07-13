"use client";

import React from "react";
import { X, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./WishlistSidebar.module.css";
import ProductGrid from "./ProductGrid";

export default function WishlistSidebar() {
  const {
    wishlist,
    isWishlistSidebarOpen,
    setWishlistSidebarOpen,
  } = useCart();

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`${styles.backdrop} ${isWishlistSidebarOpen ? styles.backdropVisible : ""}`}
        onClick={() => setWishlistSidebarOpen(false)}
      />

      {/* Slide-out Sidebar */}
      <aside className={`${styles.sidebar} ${isWishlistSidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.header}>
          <h2>My Wishlist</h2>
          <button
            className={styles.closeBtn}
            onClick={() => setWishlistSidebarOpen(false)}
            aria-label="Close Wishlist"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <div className={styles.content}>
          {wishlist.length === 0 ? (
            <div className={styles.emptyState}>
              <Heart size={48} strokeWidth={1} style={{ marginBottom: "16px", color: "var(--border-subtle)" }} />
              <h3>Your Wishlist is Empty</h3>
              <p style={{ marginTop: "8px", fontSize: "14px", maxWidth: "250px" }}>
                Tap the heart icon on any product to save it here for later!
              </p>
            </div>
          ) : (
            <div style={{ padding: "16px 0" }}>
              <ProductGrid wishlistOnly={true} />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
