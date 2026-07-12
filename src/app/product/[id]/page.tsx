import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
import SizeSelector from "@/components/SizeSelector";
import ColorSelector from "@/components/ColorSelector";
import FavoriteButton from "@/components/FavoriteButton";
import DetailsAddToCart from "@/components/DetailsAddToCart";
import { PRODUCTS } from "@/data/products";
import styles from "./page.module.css";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  const fullStarsCount = Math.floor(product.rating);

  return (
    <div className={styles.pageWrapper}>
      <ProductDetailsHeader />
      
      <main className={styles.mainContent}>
        {/* Left Column - Product Image */}
        <div className={styles.imageBlock}>
          <div className={styles.imageCard}>
            <Image
              src={product.image}
              alt={product.name}
              width={400}
              height={420}
              className={styles.productImage}
              style={{
                viewTransitionName: `product-image-${product.id}`,
              } as React.CSSProperties}
              priority
            />
            {product.limited && (
              <span className={styles.limitedBadge}>LIMITED</span>
            )}
            <FavoriteButton isLiked={product.isLiked} />
          </div>
        </div>

        {/* Right Column - Product details */}
        <div className={styles.infoBlock}>
          <div className={styles.titlePriceRow}>
            <h1 className={styles.title}>{product.name}</h1>
            <span className={styles.price}>{product.price}</span>
          </div>

          <p className={styles.description}>{product.description}</p>

          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={15}
                  fill={i < fullStarsCount ? "#ffcc00" : "none"}
                  stroke={i < fullStarsCount ? "#ffcc00" : "#d1d1d6"}
                  strokeWidth={2.5}
                />
              ))}
            </div>
            <span className={styles.ratingText}>
              {product.rating} ({product.reviewsCount} reviews)
            </span>
          </div>

          {/* Size & Color Swatches */}
          <div className={styles.optionsRow}>
            <div className={styles.optionSection}>
              <h4 className={styles.optionLabel}>Size</h4>
              <SizeSelector sizes={product.sizes} />
            </div>
            <div className={styles.optionSection}>
              <h4 className={styles.optionLabel}>Color</h4>
              <ColorSelector colors={product.colors} />
            </div>
          </div>

          {/* Checkout Action Button */}
          <div className={styles.actionContainer}>
            <DetailsAddToCart />
          </div>
        </div>
      </main>
    </div>
  );
}
