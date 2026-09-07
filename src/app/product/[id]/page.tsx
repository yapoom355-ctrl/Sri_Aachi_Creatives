"use client";

import React, { use, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Star,
  Sparkles,
  UploadCloud,
  Trash2,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { useQuery } from "@apollo/client/react";
import ProductDetailsHeader from "@/components/ProductDetailsHeader";
import FavoriteButton from "@/components/FavoriteButton";
import DetailsAddToCart from "@/components/DetailsAddToCart";
import { GET_PRODUCT } from "@/graphql/queries";
import { resolveProductImage } from "@/utils/productImages";
import styles from "./page.module.css";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Customization State ──────────────────────────────────────────────────
  const [customInstructions, setCustomInstructions] = useState("");
  const [customImage, setCustomImage] = useState<string>("");
  const [customImageName, setCustomImageName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data, loading, error } = useQuery<any>(GET_PRODUCT, {
    variables: { id },
    skip: !id,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setUploadError("Image size must be under 15MB");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || "Failed to upload file");
      }

      setCustomImage(resData.url);
      setCustomImageName(resData.fileName || file.name);
    } catch (err: any) {
      console.error("Upload error:", err);
      // Fallback: Read as data URL so the user still has their photo preview and attachment
      const reader = new FileReader();
      reader.onload = () => {
        setCustomImage(reader.result as string);
        setCustomImageName(file.name);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
      // reset input value so re-uploading the same file works
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setCustomImage("");
    setCustomImageName("");
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <ProductDetailsHeader />
        <main className={styles.mainContent}>
          <div className={styles.imageBlock}>
            <div
              className={styles.imageCard}
              style={{
                background: "#f0f0f0",
                height: "420px",
                width: "100%",
                borderRadius: "20px",
                animation: "pulse 0.8s infinite",
              }}
            />
          </div>
          <div className={styles.infoBlock}>
            <div
              style={{
                background: "#f0f0f0",
                height: "32px",
                width: "70%",
                marginBottom: "1rem",
                borderRadius: "8px",
                animation: "pulse 0.8s infinite",
              }}
            />
            <div
              style={{
                background: "#f0f0f0",
                height: "24px",
                width: "30%",
                marginBottom: "2rem",
                borderRadius: "8px",
                animation: "pulse 0.8s infinite",
              }}
            />
            <div
              style={{
                background: "#f0f0f0",
                height: "100px",
                width: "100%",
                marginBottom: "2rem",
                borderRadius: "8px",
                animation: "pulse 0.8s infinite",
              }}
            />
            <div
              style={{
                background: "#f0f0f0",
                height: "50px",
                width: "100%",
                borderRadius: "8px",
                animation: "pulse 0.8s infinite",
              }}
            />
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
            onClick={() =>
              window.history.length > 2 ? router.back() : router.push("/products")
            }
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const p = data.product;
  const grossPrice =
    p.pricing?.priceRange?.start?.gross?.amount ?? p.effectivePrice ?? p.price ?? 0;
  const thumb = p.thumbnail?.url || p.media?.[0]?.url || p.thumbnail?.mediaUrl;

  const product = {
    id: p.id,
    name: p.name || p.title || "Product",
    subtitle: p.subtitle || p.category?.name || "",
    description: p.description || "",
    price: `₹${grossPrice}`,
    numericPrice: Number(grossPrice),
    image: resolveProductImage(thumb, `${p.name} ${p.slug}`, p.id),
    category: p.category?.id || p.categories?.[0]?.id || "",
    categoryName: p.category?.name || p.categories?.[0]?.title || "",
    isLiked: false,
    limited: false,
  };

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
              style={
                {
                  viewTransitionName: `product-image-${product.id}`,
                } as React.CSSProperties
              }
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

          {/* ── Customization & Personalization Section ── */}
          <div className={styles.customizationCard}>
            <div className={styles.customizationHeader}>
              <div className={styles.customizationTitle}>
                <Sparkles size={16} color="#6366f1" />
                <span>Customization & Personalization</span>
              </div>
              <span className={styles.customizationBadge}>FREE</span>
            </div>

            {/* Field 1: Text / Name / Message */}
            <div className={styles.customFieldGroup}>
              <label className={styles.customFieldLabel} htmlFor="custom-instructions">
                1. Custom Name / Text / Message
              </label>
              <textarea
                id="custom-instructions"
                className={styles.customTextInput}
                placeholder="Enter names, date, quote, or printing instructions (e.g. Priya & Rahul 14.02.2024)..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={2}
              />
            </div>

            {/* Field 2: Photo / Artwork Upload */}
            <div className={styles.customFieldGroup}>
              <label className={styles.customFieldLabel}>
                2. Attach Photo or Design (Optional)
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/png, image/jpeg, image/webp"
                style={{ display: "none" }}
              />

              {customImage ? (
                <div className={styles.previewContainer}>
                  <div className={styles.previewLeft}>
                    <img
                      src={customImage}
                      alt="Custom upload preview"
                      className={styles.previewThumb}
                    />
                    <div className={styles.previewInfo}>
                      <span className={styles.previewName}>
                        {customImageName || "Uploaded Image"}
                      </span>
                      <span className={styles.previewStatus}>
                        <CheckCircle2
                          size={12}
                          style={{ display: "inline", marginRight: "4px" }}
                        />
                        Ready for printing
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.removeImageBtn}
                    onClick={handleRemoveImage}
                    title="Remove Photo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div
                  className={styles.uploadDropzone}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className={styles.uploadDropzoneContent}>
                    {isUploading ? (
                      <>
                        <Loader2
                          size={24}
                          className="animate-spin"
                          color="#6366f1"
                        />
                        <span className={styles.uploadMainText}>
                          Uploading image...
                        </span>
                      </>
                    ) : (
                      <>
                        <UploadCloud size={24} color="#6366f1" />
                        <span className={styles.uploadMainText}>
                          Click to upload your photo or design
                        </span>
                        <span className={styles.uploadSubText}>
                          Supports JPG, PNG, WEBP (Max 15MB)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {uploadError && (
                <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "4px" }}>
                  {uploadError}
                </p>
              )}
            </div>

            <div className={styles.customizationHelper}>
              <Sparkles size={13} color="#8b5cf6" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>
                Our craftsmen will align and print your custom text and photo with premium HD finish.
              </span>
            </div>
          </div>

          {/* Checkout Action Button */}
          <div className={styles.actionContainer}>
            <DetailsAddToCart
              productId={product.id}
              variantId={p.variants?.[0]?.id}
              customInstructions={customInstructions}
              customImage={customImage}
              customImageName={customImageName}
              itemDetails={{
                name: product.name,
                subtitle: product.subtitle,
                price: product.price,
                numericPrice: product.numericPrice,
                image: product.image,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
