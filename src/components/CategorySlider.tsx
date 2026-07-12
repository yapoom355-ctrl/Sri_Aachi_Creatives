"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CategorySlider.module.css";

interface Category {
  id: string;
  name: string;
  emoji: string;
}

const CATEGORIES: Category[] = [
  { id: "hoodie", name: "Hoodie", emoji: "🧥" },
  { id: "sneaker", name: "Sneaker", emoji: "👟" },
  { id: "face-cap", name: "Face Cap", emoji: "🧢" },
  { id: "t-shirt", name: "T-Shirt", emoji: "👕" },
  { id: "watch", name: "Watch", emoji: "⌚" },
];

export default function CategorySlider() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("hoodie");

  const handleCategoryClick = (id: string) => {
    setActiveCategory(id);
    router.push("/products");
  };

  return (
    <div className={styles.sliderContainer}>
      <div className={`${styles.slider} no-scrollbar`}>
        {CATEGORIES.map((category) => {
          const isActive = category.id === activeCategory;
          return (
            <button
              key={category.id}
              className={`${styles.pill} ${isActive ? styles.activePill : styles.inactivePill}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <span className={styles.emojiCircle}>
                {category.emoji}
              </span>
              <span className={styles.name}>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
