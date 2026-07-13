"use client";

import React from "react";
import MobileContainer from "@/components/MobileContainer";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
import ProductGrid from "@/components/ProductGrid";
import BottomNav from "@/components/BottomNav";
import { useCart } from "@/context/CartContext";
import { Heart } from "lucide-react";

export default function WishlistPage() {
  const { wishlist } = useCart();

  return (
    <MobileContainer>
      <ProductDetailsHeader title="My Wishlist" />
      <main style={{ paddingBottom: "100px", minHeight: "100vh", backgroundColor: "var(--background)" }}>
        {wishlist.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text-secondary)", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Heart size={48} strokeWidth={1} style={{ marginBottom: "16px", color: "var(--border-subtle)" }} />
            <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "var(--text-primary)" }}>Your Wishlist is Empty</h3>
            <p style={{ marginTop: "8px", fontSize: "14px" }}>Tap the heart icon on any product to add it here!</p>
          </div>
        ) : (
          <ProductGrid wishlistOnly={true} />
        )}
      </main>
      <BottomNav />
    </MobileContainer>
  );
}
