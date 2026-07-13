"use client";

import React, { use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
import SizeSelector from "@/components/SizeSelector";
import ColorSelector from "@/components/ColorSelector";
import FavoriteButton from "@/components/FavoriteButton";
import DetailsAddToCart from "@/components/DetailsAddToCart";
import { GET_PRODUCT } from "@/graphql/queries";
import styles from "./page.module.css";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data, loading, error } = useQuery<any>(GET_PRODUCT, {
    variables: { id },
    skip: !id,
  });

  // Fallback images
  const FALLBACK_IMAGES = [
    "/images/product-green.png",
    "/images/product-white.png",
    "/images/product-brown.png",
    "/images/product-blue.png"
  ];

  const getProductImage = (thumbnailUrl?: string | null, pid?: string) => {
    const validFiles = ["product-green.png", "product-white.png", "product-brown.png", "product-blue.png", "banner-hoodie.png"];
    if (thumbnailUrl) {
      const filename = thumbnailUrl.split("/").pop() || "";
      if (validFiles.includes(filename)) {
        return thumbnailUrl;
      }
    }
    const idStr = pid || "";
    let sum = 0;
    for (let i = 0; i < idStr.length; i++) {
      sum += idStr.charCodeAt(i);
    }
    return FALLBACK_IMAGES[sum % FALLBACK_IMAGES.length];
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <ProductDetailsHeader />
        <div style={{ padding: "2rem", textAlign: "center" }}>Loading product...</div>
      </div>
    );
  }

  if (error || !data?.product) {
    return (
      <div className={styles.pageWrapper}>
        <ProductDetailsHeader />
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>Product not found.</p>
          <button
            onClick={() => router.back()}
            style={{ marginTop: "1rem", padding: "0.5rem 1.5rem", borderRadius: "8px", border: "1px solid #ccc", cursor: "pointer" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const extractAttributes = (backendAttrs: any[]) => {
    const sizes: string[] = [];
    const colors: string[] = [];
    (backendAttrs || []).forEach((attr: any) => {
      const val = attr.attributeValue;
      if (!val) return;
      const name = val.attribute?.name?.toLowerCase() || val.attribute?.displayName?.toLowerCase() || "";
      if (name.includes("size")) {
        if (val.value && !sizes.includes(val.value)) {
          sizes.push(val.value);
        }
      } else if (name.includes("color")) {
        const colorVal = val.hexCode || val.value;
        if (colorVal && !colors.includes(colorVal)) {
          colors.push(colorVal);
        }
      }
    });
    return {
      sizes: sizes.length > 0 ? sizes : ["M", "L"],
      colors: colors.length > 0 ? colors : ["#768067", "#c08457"],
    };
  };

  const p = data.product;
  const attrs = extractAttributes(p.attributes);
  const product = {
    id: p.id,
    name: p.title,
    subtitle: p.subtitle || "",
    description: p.description || "",
    price: `₹${p.effectivePrice ?? p.price ?? 0}`,
    numericPrice: p.effectivePrice || p.price || 0,
    image: getProductImage(p.thumbnail?.mediaUrl, p.id),
    category: p.categories?.[0]?.id || "",
    categoryName: p.categories?.[0]?.title || "",
    isLiked: false,
    rating: 5.0,
    reviewsCount: 1,
    colors: attrs.colors,
    sizes: attrs.sizes,
    limited: false,
  };

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
            <DetailsAddToCart productId={product.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
