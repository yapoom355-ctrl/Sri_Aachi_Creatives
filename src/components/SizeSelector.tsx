"use client";

import React, { useState } from "react";
import styles from "./SizeSelector.module.css";

interface SizeSelectorProps {
  sizes: string[];
}

export default function SizeSelector({ sizes }: SizeSelectorProps) {
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "S");

  return (
    <div className={styles.container}>
      {sizes.map((size) => {
        const isActive = size === selectedSize;
        return (
          <button
            key={size}
            className={`${styles.sizePill} ${isActive ? styles.active : styles.inactive}`}
            onClick={() => setSelectedSize(size)}
            type="button"
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}
