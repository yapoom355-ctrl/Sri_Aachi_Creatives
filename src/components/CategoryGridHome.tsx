"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { ChevronRight } from "lucide-react";
import { GET_CATEGORIES } from "@/graphql/queries";
import styles from "./CategoryGridHome.module.css";

export default function CategoryGridHome() {
  const router = useRouter();
  const { data, loading, error } = useQuery<any>(GET_CATEGORIES, {
    fetchPolicy: "cache-first",
  });

  const getGradient = (id: string) => {
    const gradients = [
      "linear-gradient(135deg, #e9e9e7 0%, #dfdfdf 100%)",
      "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
      "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
      "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    ];
    let sum = 0;
    for (let i = 0; i < id.length; i++) {
      sum += id.charCodeAt(i);
    }
    return gradients[sum % gradients.length];
  };

  const categories = useMemo(() => data?.categories?.map((c: any) => ({
    id: c.id,
    name: c.title,
    image: c.thumbnail?.mediaUrl,
    count: "Explore",
    gradient: getGradient(c.id),
  })) || [], [data]);

  const handleCategorySelect = (id: string) => {
    router.push(`/products?category=${id}`);
  };

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading categories...</div>;
  }

  if (error || categories.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: "0 24px", marginBottom: "2rem", width: "100%" }}>
      <h2 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "1rem" }}>Shop by Category</h2>
      <div className={styles.grid}>
        {categories.map((category: any) => (
          <button
            key={category.id}
            className={styles.card}
            onClick={() => handleCategorySelect(category.id)}
            style={{ background: category.gradient }}
            type="button"
          >
            <div className={styles.emojiContainer} style={{ overflow: "hidden", position: "relative" }}>
              {category.image ? (
                <img src={category.image} alt={category.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span className={styles.emoji}>🛍️</span>
              )}
            </div>
            
            <div className={styles.info}>
              <h3 className={styles.name}>{category.name}</h3>
              <span className={styles.count}>{category.count}</span>
            </div>

            <div className={styles.arrowButton}>
              <ChevronRight size={18} className={styles.arrowIcon} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
