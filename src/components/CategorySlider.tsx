"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_CATEGORIES } from "@/graphql/queries";
import styles from "./CategorySlider.module.css";

interface Category {
  id: string;
  name: string;
  image?: string;
}

export default function CategorySlider() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const { data, loading } = useQuery<any>(GET_CATEGORIES);

  const CATEGORIES: Category[] = [
    { id: "all", name: "All Products" },
    ...(data?.categories?.map((c: any) => ({
      id: c.id,
      name: c.title,
      image: c.thumbnail?.mediaUrl,
    })) || [])
  ];

  const handleCategoryClick = (id: string) => {
    setActiveCategory(id);
    if (id === "all") {
      router.push("/products");
    } else {
      router.push(`/products?category=${id}`);
    }
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
              <span className={styles.emojiCircle} style={{ overflow: "hidden", position: "relative" }}>
                {category.image ? (
                  <img src={category.image} alt={category.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  "🛍️"
                )}
              </span>
              <span className={styles.name}>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
