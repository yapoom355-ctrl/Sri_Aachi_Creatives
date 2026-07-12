"use client";

import React from "react";
import ProductCard from "./ProductCard";
import styles from "./ProductGrid.module.css";
import { PRODUCTS } from "@/data/products";

export default function ProductGrid() {
  return (
    <div className={styles.gridContainer}>
      <div className={styles.grid}>
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
