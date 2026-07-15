"use client";

import React from "react";
import { useQuery } from "@apollo/client/react";
import ProductCard from "./ProductCard";
import styles from "./ProductGrid.module.css";
import { GET_PRODUCTS } from "@/graphql/queries";
import { useCart } from "@/context/CartContext";

export default function ProductGrid({ wishlistOnly = false }: { wishlistOnly?: boolean }) {
  const { wishlist } = useCart();
  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  }) as any;

  const FALLBACK_IMAGES = [
    "/images/resin-art-block.webp",
    "/images/resin-table.webp",
    "/images/photo-frame.webp",
    "/images/motor-engine-table.webp",
    "/images/motor-engine-table-3.webp",
  ];

  const getProductImage = (thumbnailUrl?: string | null, id?: string, index: number = 0) => {
    if (thumbnailUrl) {
      return thumbnailUrl;
    }
    return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  };

  if (loading && !data) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", opacity: 0.5 }}>
        Loading products…
      </div>
    );
  }

  if (error) {
    console.error("ProductGrid error:", error.message);
    if (typeof window !== "undefined" && error.message.includes("tenant")) {
      localStorage.removeItem("token");
      window.location.reload();
    }
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#dc2626", fontSize: "0.85rem" }}>
        ⚠️ Could not load products. Please refresh the page.
      </div>
    );
  }

  let products = data?.products?.map((p: any, index: number) => ({
    id: p.id,
    name: p.title,
    subtitle: p.subtitle || "",
    description: p.description || "",
    price: `₹${p.effectivePrice ?? p.price ?? 0}`,
    numericPrice: p.effectivePrice ?? p.price ?? 0,
    image: getProductImage(p.thumbnail?.mediaUrl, p.id, index),
    category: p.categories?.[0]?.id || "",
    categoryName: p.categories?.[0]?.title || "",
    isLiked: false,
    rating: 5.0,
    reviewsCount: 0,
    colors: ["#768067", "#c08457"],
    sizes: ["M", "L"],
    limited: false,
  })) || [];

  if (wishlistOnly) {
    products = products.filter((product: any) => wishlist.includes(product.id));
  }
  
  // Display all products instead of limiting to 5

  if (products.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", opacity: 0.5 }}>
        No products available.
      </div>
    );
  }

  return (
    <div className={styles.gridContainer}>
      <div className={styles.grid}>
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
