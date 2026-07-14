"use client";

import React, { useState, Suspense, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { useSearchParams } from "next/navigation";
import MobileContainer from "@/components/MobileContainer";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { GET_PRODUCTS, GET_CATEGORIES } from "@/graphql/queries";
import { Search } from "lucide-react";
import styles from "./page.module.css";
import { Product } from "@/types";

function ExploreProductsContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  const urlSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const { data, loading } = useQuery<any>(GET_PRODUCTS, { fetchPolicy: "cache-first" });
  const { data: categoryData } = useQuery<any>(GET_CATEGORIES, { fetchPolicy: "cache-first" });

  // Fallback images
  const FALLBACK_IMAGES = [
    "/images/product-green.png",
    "/images/product-white.png",
    "/images/product-brown.png",
    "/images/product-blue.png"
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

  // Map backend ProductType to frontend Product interface
  const PRODUCTS: Product[] = useMemo(() => {
    return data?.products?.map((p: any, index: number) => ({
      id: p.id,
      name: p.title,
      subtitle: p.subtitle || "",
      description: p.description || "",
      price: `₹${p.effectivePrice ?? p.price ?? 0}`,
      numericPrice: p.effectivePrice || p.price || 0,
      image: getProductImage(p.thumbnail?.mediaUrl, p.id),
      category: p.categories?.[0]?.id || "",
      categoryName: p.categories?.[0]?.title || "",
      isLiked: false,
      rating: 5.0,
      reviewsCount: 1,
      colors: ["#768067", "#c08457"],
      sizes: ["M", "L"],
      limited: false,
    })) || [];
  }, [data]);

  const filteredByCategory = useMemo(() => {
    return categoryId 
      ? PRODUCTS.filter((product) => product.category === categoryId)
      : PRODUCTS;
  }, [PRODUCTS, categoryId]);

  const filteredProducts = useMemo(() => {
    return filteredByCategory.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filteredByCategory, searchQuery]);

  const activeCategoryName = categoryId 
    ? categoryData?.categories?.find((c: any) => c.id === categoryId)?.title || "Products"
    : "All Products";

  return (
    <MobileContainer>
      <ProductDetailsHeader title={`Explore ${activeCategoryName}`} />
      
      <main className={styles.mainContent}>
        {/* Full-width Search Input */}
        <div className={styles.searchContainer}>
          <Search size={20} className={styles.searchIcon} strokeWidth={2} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
        ) : filteredProducts.length > 0 ? (
          <div className={styles.grid}>
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No products found matching your criteria</p>
          </div>
        )}
      </main>

      <BottomNav />
    </MobileContainer>
  );
}

export default function ExploreProductsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>}>
      <ExploreProductsContent />
    </Suspense>
  );
}
