"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@apollo/client/react";
import MobileContainer from "@/components/MobileContainer";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
import BottomNav from "@/components/BottomNav";
import { ArrowUpRight } from "lucide-react";
import { GET_CATEGORIES } from "@/graphql/queries";
import { resolveProductImage } from "@/utils/productImages";
import styles from "./page.module.css";

const GRID_CLASSES = [
  styles.heroCard,
  styles.tallCard,
  styles.squareCard1,
  styles.tallCard2,
  styles.squareCard2,
  styles.squareCard1,
  styles.tallCard,
];

export default function CategoriesV2Page() {
  const router = useRouter();
  const { data, loading } = useQuery<any>(GET_CATEGORIES, {
    fetchPolicy: "cache-first",
  });

  const categories = useMemo(() => {
    const raw =
      data?.categories?.edges?.map((e: any) => e.node) ||
      (Array.isArray(data?.categories) ? data.categories : []);

    // Filter out Default Category
    const filtered = raw.filter((c: any) => {
      const name = (c.name || c.title || "").toLowerCase();
      return name && !name.includes("default category");
    });

    return filtered.map((c: any, index: number) => ({
      id: c.id,
      name: c.name || c.title || "Category",
      image: resolveProductImage(c.backgroundImage?.url || c.thumbnail?.mediaUrl, c.name, c.id),
      gridClass: GRID_CLASSES[index % GRID_CLASSES.length],
    }));
  }, [data]);

  const handleSelect = (id: string) => {
    router.push(`/products?category=${id}`);
  };

  return (
    <MobileContainer>
      <ProductDetailsHeader title="Collections" />

      <main className={styles.mainContent}>
        {loading ? (
          <div style={{ padding: "3rem 1rem", textAlign: "center", opacity: 0.6 }}>
            Loading collections...
          </div>
        ) : (
          <div className={styles.masonryGrid}>
            {categories.map((col: any) => (
              <button
                key={col.id}
                className={`${styles.card} ${col.gridClass}`}
                onClick={() => handleSelect(col.id)}
                type="button"
              >
                {/* Background Image Wrapper */}
                <div className={styles.imageWrapper}>
                  <Image
                    src={col.image}
                    alt={col.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={styles.bgImage}
                    priority
                  />
                  <div className={styles.overlay} />
                </div>

                {/* Floating Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.arrowIconWrapper}>
                    <ArrowUpRight size={16} strokeWidth={2.5} className={styles.arrowIcon} />
                  </div>
                </div>

                {/* Bottom Footer Title */}
                <div className={styles.cardFooter}>
                  <h3 className={styles.collectionName}>{col.name}</h3>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
