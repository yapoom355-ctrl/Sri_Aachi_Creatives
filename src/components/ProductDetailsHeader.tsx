"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./ProductDetailsHeader.module.css";

export default function ProductDetailsHeader({ title = "Product Details" }: { title?: string }) {
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
      <button
        onClick={() => router.back()}
        className={styles.iconButton}
        aria-label="Go back"
      >
        <ChevronLeft size={22} strokeWidth={1.8} className={styles.icon} />
      </button>
      
      <h2 className={styles.title}>{title}</h2>
      
      <button 
        className={styles.iconButton} 
        aria-label="Shopping Cart"
        onClick={handleCartClick}
      >
        <ShoppingBag size={22} strokeWidth={1.8} className={styles.icon} />
        {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
      </button>
    </header>
  );
}
