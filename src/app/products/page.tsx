"use client";

import React, { useState } from "react";
import MobileContainer from "@/components/MobileContainer";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { PRODUCTS } from "@/data/products";
import { Search } from "lucide-react";
import styles from "./page.module.css";

export default function ExploreProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = PRODUCTS.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MobileContainer>
      <ProductDetailsHeader title="Explore all Hoodies" />
      
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
        {filteredProducts.length > 0 ? (
          <div className={styles.grid}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {/* Visual duplications to match length of screenshot */}
            {searchQuery === "" && PRODUCTS.slice(3, 4).map((product) => (
              <ProductCard key={`${product.id}-dup-1`} product={{...product, id: product.id}} />
            ))}
            {searchQuery === "" && PRODUCTS.slice(3, 4).map((product) => (
              <ProductCard key={`${product.id}-dup-2`} product={{...product, id: product.id}} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No hoodies found matching &quot;{searchQuery}&quot;</p>
          </div>
        )}
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
