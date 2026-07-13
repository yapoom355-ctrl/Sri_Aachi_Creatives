"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import MobileContainer from "@/components/MobileContainer";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
import BottomNav from "@/components/BottomNav";
import { ChevronRight } from "lucide-react";
import { GET_CATEGORIES } from "@/graphql/queries";
import styles from "./page.module.css";

export default function AllCategoriesPage() {
  const router = useRouter();
  const { data, loading, error } = useQuery<any>(GET_CATEGORIES, {
    fetchPolicy: "cache-and-network",
  });

  const getEmoji = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("hoodie")) return "🧥";
    if (t.includes("sneak") || t.includes("shoe")) return "👟";
    if (t.includes("cap") || t.includes("hat")) return "🧢";
    if (t.includes("shirt") || t.includes("tee")) return "👕";
    if (t.includes("watch")) return "⌚";
    if (t.includes("bag")) return "🎒";
    return "🛍️";
  };

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

  const categories = data?.categories?.map((c: any) => ({
    id: c.id,
    name: c.title,
    emoji: getEmoji(c.title),
    count: "Explore", // Or if products count is available we can use it
    gradient: getGradient(c.id),
  })) || [];

  const handleCategorySelect = (id: string) => {
    router.push(`/products?category=${id}`);
  };

  return (
    <MobileContainer>
      <ProductDetailsHeader title="All Categories" />

      <main className={styles.mainContent}>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>Loading categories...</div>
        ) : error ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "red" }}>Failed to load categories.</div>
        ) : categories.length > 0 ? (
          <div className={styles.grid}>
            {categories.map((category: any) => (
              <button
                key={category.id}
                className={styles.card}
                onClick={() => handleCategorySelect(category.id)}
                style={{ background: category.gradient }}
                type="button"
              >
                <div className={styles.emojiContainer}>
                  <span className={styles.emoji}>{category.emoji}</span>
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
        ) : (
          <div style={{ padding: "2rem", textAlign: "center", opacity: 0.5 }}>
            No categories available.
          </div>
        )}
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
