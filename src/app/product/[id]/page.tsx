"use client";

import React, { use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
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
    "/images/resin-art-block.webp",
    "/images/resin-table.webp",
    "/images/photo-frame.webp",
    "/images/motor-engine-table.webp",
    "/images/motor-engine-table-3.webp"
  ];

  const getProductImage = (thumbnailUrl?: string | null, pid?: string) => {
    if (thumbnailUrl) {
      return thumbnailUrl;
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
        <main className={styles.mainContent}>
          <div className={styles.imageBlock}>
            <div className={styles.imageCard} style={{ background: "#f0f0f0", height: "420px", width: "100%", borderRadius: "20px", animation: "pulse 1.5s infinite" }} />
          </div>
          <div className={styles.infoBlock}>
            <div style={{ background: "#f0f0f0", height: "32px", width: "70%", marginBottom: "1rem", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
            <div style={{ background: "#f0f0f0", height: "24px", width: "30%", marginBottom: "2rem", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
            <div style={{ background: "#f0f0f0", height: "100px", width: "100%", marginBottom: "2rem", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
            <div style={{ background: "#f0f0f0", height: "50px", width: "100%", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
          </div>
        </main>
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
            onClick={() => window.history.length > 2 ? router.back() : router.push("/products")}
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

          {/* Size & Color Swatches Removed */}
          {/* Checkout Action Button */}
          <div className={styles.actionContainer}>
            <DetailsAddToCart productId={product.id} />
          </div>
        </div>
      </main>
    </div>
  );
}
