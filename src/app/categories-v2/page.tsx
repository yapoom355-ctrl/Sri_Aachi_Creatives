"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MobileContainer from "@/components/MobileContainer";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
import BottomNav from "@/components/BottomNav";
import { ArrowUpRight } from "lucide-react";
import styles from "./page.module.css";

interface CollectionData {
  id: string;
  name: string;
  count: string;
  image: string;
  gridClass: string;
}

const COLLECTIONS: CollectionData[] = [
  {
    id: "hoodie",
    name: "Hoodies",
    count: "4 Items",
    image: "/images/product-blue.png",
    gridClass: styles.heroCard,
  },
  {
    id: "sneaker",
    name: "Sneakers",
    count: "8 Items",
    image: "/images/product-green.png",
    gridClass: styles.tallCard,
  },
  {
    id: "face-cap",
    name: "Face Caps",
    count: "6 Items",
    image: "/images/banner-hoodie.png",
    gridClass: styles.squareCard1,
  },
  {
    id: "t-shirt",
    name: "T-Shirts",
    count: "12 Items",
    image: "/images/product-white.png",
    gridClass: styles.tallCard2,
  },
  {
    id: "watch",
    name: "Watches",
    count: "4 Items",
    image: "/images/product-brown.png",
    gridClass: styles.squareCard2,
  },
];

export default function CategoriesV2Page() {
  const router = useRouter();

  const handleSelect = (id: string) => {
    router.push("/products");
  };

  return (
    <MobileContainer>
      <ProductDetailsHeader title="Collections" />

      <main className={styles.mainContent}>
        <div className={styles.masonryGrid}>
          {COLLECTIONS.map((col) => (
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
                <span className={styles.itemCount}>{col.count}</span>
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
      </main>

      <BottomNav />
    </MobileContainer>
  );
}
