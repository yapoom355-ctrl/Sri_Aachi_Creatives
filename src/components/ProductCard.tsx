"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./ProductCard.module.css";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const router = useRouter();
  const { addToCart, cartItems, updateQuantity, wishlist, toggleWishlist } = useCart();
  const liked = wishlist ? wishlist.includes(product.id) : false;
  const [imgSrc, setImgSrc] = useState(product.image || "/images/resin-memory-block.jpg");

  const cartItem = cartItems.find((i) => i.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (quantity === 0) {
      addToCart(product.id, 1, {
        name: product.name,
        subtitle: product.subtitle,
        price: product.price,
        numericPrice: product.numericPrice || parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0,
        image: product.image,
        variantId: (product as any).variantId || (product as any).variants?.[0]?.id,
      });
    } else {
      updateQuantity(product.id, product.sizes?.[0] || "M", product.colors?.[0] || "#000", quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (quantity > 0) {
      updateQuantity(product.id, product.sizes?.[0] || "M", product.colors?.[0] || "#000", quantity - 1);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist(product.id);
  };


  return (
    <div className={styles.card}>
      <Link 
        href={`/product/${product.id}`} 
        className={styles.cardLink}
      >
        <div className={styles.imageWrapper}>
          <Image
            src={imgSrc}
            alt={product.name}
            width={180}
            height={190}
            className={styles.productImage}
            style={{
              viewTransitionName: `product-image-${product.id}`,
            } as React.CSSProperties}
            priority={priority}
            onError={() => setImgSrc("/images/resin-memory-block.jpg")}
          />
        </div>
        <div className={styles.details}>
          <div className={styles.info}>
            <h3 className={styles.title}>{product.name}</h3>
            <p className={styles.subtitle}>{product.subtitle}</p>
            <span className={styles.price}>{product.price}</span>
          </div>
        </div>
      </Link>
      
      {/* Floating Like Action */}
      <button
        className={`${styles.likeButton} ${liked ? styles.liked : ""}`}
        onClick={handleLike}
        aria-label={liked ? "Unlike product" : "Like product"}
      >
        <Heart
          size={14}
          className={styles.heartIcon}
          fill={liked ? "var(--like-active)" : "none"}
          stroke={liked ? "var(--like-active)" : "currentColor"}
          strokeWidth={2}
        />
      </button>

      {/* Floating Cart Action */}
      <div className={styles.cartActionWrapper}>
        <div className={`${styles.cartWrapper} ${quantity > 0 ? styles.expanded : ""}`}>
          <button
            className={styles.cartButton}
            onClick={handleIncrement}
            aria-label="Add to cart"
            style={{
              opacity: quantity === 0 ? 1 : 0,
              pointerEvents: quantity === 0 ? "auto" : "none",
              transform: quantity === 0 ? "scale(1)" : "scale(0.7)",
            }}
          >
            <ShoppingCart size={15} className={styles.cartIcon} strokeWidth={2.5} />
          </button>
          
          <div
            className={styles.quantitySelector}
            style={{
              opacity: quantity > 0 ? 1 : 0,
              pointerEvents: quantity > 0 ? "auto" : "none",
              transform: quantity > 0 ? "scale(1)" : "scale(0.8)",
            }}
          >
            <button
              className={styles.qtyButton}
              onClick={handleDecrement}
              aria-label="Decrease quantity"
            >
              <Minus size={11} strokeWidth={2.5} />
            </button>
            <span className={styles.quantityText}>{quantity}</span>
            <button
              className={styles.qtyButton}
              onClick={handleIncrement}
              aria-label="Increase quantity"
            >
              <Plus size={11} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
