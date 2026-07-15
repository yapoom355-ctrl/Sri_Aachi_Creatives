"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./ProductDetailsHeader.module.css";

export default function ProductDetailsHeader({ title = "Product Details", as = "h2" }: { title?: string, as?: "h1" | "h2" }) {
  const router = useRouter();
  const { cartCount, setSidebarOpen } = useCart();

  const handleCartClick = () => {
    if (window.innerWidth < 768) {
      router.push("/cart");
    } else {
      setSidebarOpen(true);
    }
  };

  const TitleTag = as;

  return (
    <header className={styles.header}>
      <button
        onClick={() => window.history.length > 2 ? router.back() : router.push("/")}
        className={styles.iconButton}
        aria-label="Go back"
      >
        <ChevronLeft size={22} strokeWidth={1.8} className={styles.icon} />
      </button>

      <TitleTag className={styles.title}>{title}</TitleTag>

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
