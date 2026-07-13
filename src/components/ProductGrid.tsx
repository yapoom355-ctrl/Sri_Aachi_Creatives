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
    "/images/product-green.png",
    "/images/product-white.png",
    "/images/product-brown.png",
    "/images/product-blue.png",
  ];

  const getProductImage = (thumbnailUrl?: string | null, id?: string) => {
    const validFiles = ["product-green.png", "product-white.png", "product-brown.png", "product-blue.png", "banner-hoodie.png"];
    if (thumbnailUrl) {
      const filename = thumbnailUrl.split("/").pop() || "";
      if (validFiles.includes(filename)) {
        return thumbnailUrl;
      }
    }
    const idStr = id || "";
    let sum = 0;
    for (let i = 0; i < idStr.length; i++) {
      sum += idStr.charCodeAt(i);
    }
    return FALLBACK_IMAGES[sum % FALLBACK_IMAGES.length];
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
    image: getProductImage(p.thumbnail?.mediaUrl, p.id),
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
