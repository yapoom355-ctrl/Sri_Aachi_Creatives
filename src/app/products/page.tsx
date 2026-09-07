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
import { resolveProductImage } from "@/utils/productImages";
import { Product } from "@/types";

function ExploreProductsContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  const urlSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const { data, loading } = useQuery<any>(GET_PRODUCTS, { fetchPolicy: "cache-first" });
  const { data: categoryData } = useQuery<any>(GET_CATEGORIES, { fetchPolicy: "cache-first" });

  // Map Saleor products to frontend Product interface
  const PRODUCTS: Product[] = useMemo(() => {
    const rawProducts =
      data?.products?.edges?.map((e: any) => e.node) ||
      (Array.isArray(data?.products) ? data.products : []);

    return rawProducts.map((p: any) => {
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
        isLiked: false,
        colors: ["#768067", "#c08457"],
        sizes: ["M", "L"],
        limited: false,
      };
    });
  }, [data]);

  const rawCategories = useMemo(() => {
    const raw =
      categoryData?.categories?.edges?.map((e: any) => e.node) ||
      (Array.isArray(categoryData?.categories) ? categoryData.categories : []);
    return raw.filter((c: any) => !(c.name || c.title || "").toLowerCase().includes("default category"));
  }, [categoryData]);

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
    ? rawCategories.find((c: any) => c.id === categoryId)?.name || "Products"
    : "All Products";

  return (
    <MobileContainer>
      <ProductDetailsHeader title={`Explore ${activeCategoryName}`} as="h1" />
      
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
