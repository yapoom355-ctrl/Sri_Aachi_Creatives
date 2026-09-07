"use client";

import React from "react";
import { useQuery } from "@apollo/client/react";
import ProductCard from "./ProductCard";
import styles from "./ProductGrid.module.css";
import { GET_PRODUCTS } from "@/graphql/queries";
import { useCart } from "@/context/CartContext";
import { resolveProductImage } from "@/utils/productImages";

export default function ProductGrid({ wishlistOnly = false }: { wishlistOnly?: boolean }) {
  const { wishlist } = useCart();
  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  }) as any;

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

  const rawProducts =
    data?.products?.edges?.map((e: any) => e.node) ||
    (Array.isArray(data?.products) ? data.products : []);

  let products = rawProducts.map((p: any) => {
    const grossPrice = p.pricing?.priceRange?.start?.gross?.amount ?? p.effectivePrice ?? p.price ?? 0;
    const thumb = p.thumbnail?.url || p.thumbnail?.mediaUrl;
    return {
      id: p.id,
      variantId: p.variants?.[0]?.id,
      name: p.name || p.title || "Product",
      subtitle: p.subtitle || p.category?.name || "",
      description: p.description || "",
      price: `₹${grossPrice}`,
      numericPrice: Number(grossPrice),
      image: resolveProductImage(thumb, `${p.name} ${p.slug}`, p.id),
      category: p.category?.id || p.categories?.[0]?.id || "",
      categoryName: p.category?.name || p.categories?.[0]?.title || "",
      isLiked: wishlist ? wishlist.includes(p.id) : false,
      colors: ["#768067", "#c08457"],
      sizes: ["M", "L"],
      limited: false,
    };
  });

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
