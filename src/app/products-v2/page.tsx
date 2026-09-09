"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client/react";
import MobileContainer from "@/components/MobileContainer";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { GET_PRODUCTS, GET_CATEGORIES } from "@/graphql/queries";
import { resolveProductImage } from "@/utils/productImages";
import { Search, SlidersHorizontal, X } from "lucide-react";
import styles from "./page.module.css";

const PRICE_RANGES = [
  { id: "all", label: "All Prices" },
  { id: "under-1000", label: "Under ₹1,000" },
  { id: "1000-5000", label: "₹1,000 - ₹5,000" },
  { id: "over-5000", label: "Over ₹5,000" },
];

export default function ProductsV2Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [showFilterPanel, setShowFilterPanel] = useState(true);

  // Fetch from GraphQL
  const { data: prodData, loading: prodLoading } = useQuery<any>(GET_PRODUCTS);
  const { data: catData, loading: catLoading } = useQuery<any>(GET_CATEGORIES);

  // Map Categories & Filter out Default Category
  const rawCategories =
    catData?.categories?.edges?.map((e: any) => e.node) ||
    (Array.isArray(catData?.categories) ? catData.categories : []);

  const apiCategories = rawCategories
    .filter((c: any) => {
      const name = (c.name || c.title || "").toLowerCase();
      return name && !name.includes("default category");
    })
    .map((c: any) => ({
      id: (c.name || c.title || "").toLowerCase(),
      name: c.name || c.title || "Category",
      emoji: "🛍️",
    }));
  
  const CATEGORIES = [{ id: "all", name: "All", emoji: "🛍️" }, ...apiCategories];

  // Map Products
  const rawProducts =
    prodData?.products?.edges?.map((e: any) => e.node) ||
    (Array.isArray(prodData?.products) ? prodData.products : []);

  const productsList = rawProducts.map((p: any) => {
    const grossPrice = p.pricing?.priceRange?.start?.gross?.amount ?? p.effectivePrice ?? p.price ?? 0;
    const thumb = p.media?.[0]?.url || p.thumbnail?.url || p.thumbnail?.mediaUrl;
    return {
      id: p.id,
      variantId: p.variants?.[0]?.id,
      name: p.name || p.title || "Product",
      subtitle: p.subtitle || p.category?.name || "",
      description: p.description || "",
      price: `₹${grossPrice}`,
      numericPrice: Number(grossPrice),
      image: resolveProductImage(thumb, `${p.name} ${p.slug}`, p.id),
      category: (p.category?.name || p.categories?.[0]?.title || "").toLowerCase(),
      isLiked: false,
      colors: ["#768067", "#c08457"],
      sizes: ["Standard"],
      limited: false,
    };
  });

  const filteredProducts = productsList.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    let matchesPrice = true;
    if (selectedPriceRange === "under-1000") {
      matchesPrice = product.numericPrice < 1000;
    } else if (selectedPriceRange === "1000-5000") {
      matchesPrice = product.numericPrice >= 1000 && product.numericPrice <= 5000;
    } else if (selectedPriceRange === "over-5000") {
      matchesPrice = product.numericPrice > 5000;
    }

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedPriceRange("all");
  };

  if (prodLoading || catLoading) {
    return (
      <MobileContainer>
        <ProductDetailsHeader title="Catalog Explorer" />
        <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
        <BottomNav />
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <ProductDetailsHeader title="Catalog Explorer" />

      <main className={styles.mainContent}>
        {/* Search bar row */}
        <div className={styles.searchRow}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`${styles.filterToggle} ${showFilterPanel ? styles.filterActive : ""}`}
            aria-label="Toggle filters panel"
          >
            <SlidersHorizontal size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Collapsible filter container */}
        {showFilterPanel && (
          <div className={styles.filterPanel}>
            {/* Categories filter */}
            <div className={styles.filterSection}>
              <h4 className={styles.filterLabel}>Category</h4>
              <div className={`${styles.horizontalSlider} no-scrollbar`}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`${styles.pill} ${selectedCategory === cat.id ? styles.pillActive : styles.pillInactive}`}
                    type="button"
                  >
                    <span className={styles.pillEmoji}>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price filters in INR */}
            <div className={styles.filterSection}>
              <h4 className={styles.filterLabel}>Price Range</h4>
              <div className={`${styles.horizontalSlider} no-scrollbar`}>
                {PRICE_RANGES.map((pr) => (
                  <button
                    key={pr.id}
                    onClick={() => setSelectedPriceRange(pr.id)}
                    className={`${styles.pill} ${selectedPriceRange === pr.id ? styles.pillActive : styles.pillInactive}`}
                    type="button"
                  >
                    <span>{pr.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Clear filters row if active */}
            {(selectedCategory !== "all" || selectedPriceRange !== "all" || searchQuery) && (
              <div className={styles.resetRow}>
                <button onClick={resetFilters} className={styles.resetBtn}>
                  <X size={14} /> Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results summary bar */}
        <div className={styles.resultsBar}>
          <span className={styles.resultsCount}>
            Showing <strong>{filteredProducts.length}</strong> items
          </span>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className={styles.grid}>
            {filteredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No products found matching your active filters.</p>
            <button onClick={resetFilters} className={styles.clearFiltersBtn}>
              Reset Filters
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
