"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import MobileContainer from "@/components/MobileContainer";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
import BottomNav from "@/components/BottomNav";
import { ChevronRight } from "lucide-react";
import { GET_CATEGORIES } from "@/graphql/queries";
import { resolveProductImage } from "@/utils/productImages";
import styles from "./page.module.css";

export default function AllCategoriesPage() {
  const router = useRouter();
  const { data, loading, error } = useQuery<any>(GET_CATEGORIES, {
    fetchPolicy: "cache-first",
  });

  const categories = useMemo(() => {
    const raw =
      data?.categories?.edges?.map((e: any) => e.node) ||
      (Array.isArray(data?.categories) ? data.categories : []);

    const filtered = raw.filter((c: any) => {
      const name = (c.name || c.title || "").toLowerCase();
      return name && !name.includes("default category");
    });

    return filtered.map((c: any) => ({
      id: c.id,
      name: c.name || c.title || "Category",
      image: resolveProductImage(c.backgroundImage?.url || c.thumbnail?.mediaUrl, c.name, c.id),
    }));
  }, [data]);

  const handleCategorySelect = (id: string) => {
    router.push(`/products?category=${id}`);
  };

  return (
    <MobileContainer>
      <ProductDetailsHeader title="Shop by Category" as="h1" />

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
