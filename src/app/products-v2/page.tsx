"use client";

import React, { useState } from "react";
import MobileContainer from "@/components/MobileContainer";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { PRODUCTS } from "@/data/products";
import { Search, SlidersHorizontal, X } from "lucide-react";
import styles from "./page.module.css";

const CATEGORIES = [
  { id: "all", name: "All", emoji: "🛍️" },
  { id: "hoodie", name: "Hoodies", emoji: "🧥" },
  { id: "sneaker", name: "Sneakers", emoji: "👟" },
  { id: "face-cap", name: "Face Caps", emoji: "🧢" },
  { id: "watch", name: "Watches", emoji: "⌚" },
];

const SIZES = ["All", "S", "M", "L", "XL", "XXL"];

const PRICE_RANGES = [
  { id: "all", label: "All Prices" },
  { id: "under-50", label: "Under $50" },
  { id: "50-100", label: "$50 - $100" },
  { id: "over-100", label: "Over $100" },
];

export default function ProductsV2Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSize, setSelectedSize] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [showFilterPanel, setShowFilterPanel] = useState(true);

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSize = selectedSize === "All" || product.sizes.includes(selectedSize);
    
    let matchesPrice = true;
    if (selectedPriceRange === "under-50") {
      matchesPrice = product.numericPrice < 50;
    } else if (selectedPriceRange === "50-100") {
      matchesPrice = product.numericPrice >= 50 && product.numericPrice <= 100;
    } else if (selectedPriceRange === "over-100") {
      matchesPrice = product.numericPrice > 100;
    }

    return matchesSearch && matchesCategory && matchesSize && matchesPrice;
  });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSize("All");
    setSelectedPriceRange("all");
  };

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

            {/* Size filters */}
            <div className={styles.filterSection}>
              <h4 className={styles.filterLabel}>Size</h4>
              <div className={styles.sizesRow}>
                {SIZES.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`${styles.sizeBtn} ${selectedSize === sz ? styles.sizeActive : styles.sizeInactive}`}
                    type="button"
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Price filters */}
            <div className={styles.filterSection}>
              <h4 className={styles.filterLabel}>Price Range</h4>
              <div className={styles.priceRow}>
                {PRICE_RANGES.map((pr) => (
                  <button
                    key={pr.id}
                    onClick={() => setSelectedPriceRange(pr.id)}
                    className={`${styles.priceBtn} ${selectedPriceRange === pr.id ? styles.priceActive : styles.priceInactive}`}
                    type="button"
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Action */}
            {(selectedCategory !== "all" || selectedSize !== "All" || selectedPriceRange !== "all" || searchQuery !== "") && (
              <button onClick={resetFilters} className={styles.resetButton} type="button">
                Clear Filters <X size={12} strokeWidth={3} style={{ marginLeft: 6 }} />
              </button>
            )}
          </div>
        )}

        {/* Feedback metadata */}
        <div className={styles.resultsInfo}>
          <span className={styles.resultsText}>
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? "result" : "results"}
          </span>
        </div>

        {/* Dynamic products list grid */}
        {filteredProducts.length > 0 ? (
          <div className={styles.grid}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No products match selected filters.</p>
            <button onClick={resetFilters} className={styles.emptyResetBtn}>
              Reset filters
            </button>
          </div>
        )}
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
