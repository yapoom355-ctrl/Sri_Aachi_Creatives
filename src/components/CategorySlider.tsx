"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_CATEGORIES } from "@/graphql/queries";
import styles from "./CategorySlider.module.css";

interface Category {
  id: string;
  name: string;
  emoji: string;
}

export default function CategorySlider() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("hoodie");
  const { data, loading } = useQuery<any>(GET_CATEGORIES);

  const CATEGORIES: Category[] = data?.categories?.map((c: any) => ({
    id: c.id,
    name: c.title,
    emoji: "🛍️",
  })) || [];

  const handleCategoryClick = (id: string) => {
    setActiveCategory(id);
    router.push(`/products?category=${id}`);
  };

  if (loading) {
    return <div className={styles.sliderContainer}><div className={styles.slider}>Loading categories...</div></div>;
  }

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
