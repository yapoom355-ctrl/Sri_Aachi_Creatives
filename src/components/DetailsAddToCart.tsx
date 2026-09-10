"use client";

import React from "react";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import styles from "./DetailsAddToCart.module.css";

interface DetailsAddToCartProps {
  productId: string;
  variantId?: string;
  customInstructions?: string;
  customImage?: string;
  customImageName?: string;
  isCustomizationRequired?: boolean;
  onValidationFailed?: () => void;
  itemDetails?: {
    name?: string;
    subtitle?: string;
    price?: string;
    numericPrice?: number;
    image?: string;
  };
}

export default function DetailsAddToCart({
  productId,
  variantId,
  customInstructions,
  customImage,
  customImageName,
  isCustomizationRequired = false,
  onValidationFailed,
  itemDetails,
}: DetailsAddToCartProps) {
  const { addToCart, cartItems, updateQuantity } = useCart();

  const trimmedInstructions = customInstructions?.trim() || "";
  const activeImage = customImage || "";

  const cartItem = cartItems.find(
    (i) =>
      i.id === productId &&
      (i.customInstructions || "") === trimmedInstructions &&
      (i.customImage || "") === activeImage
  );
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleIncrement = () => {
    // If customization is required (e.g. Coffee Mugs, T-shirts), user must provide text or photo
    if (isCustomizationRequired && !trimmedInstructions && !activeImage) {
      if (onValidationFailed) {
        onValidationFailed();
      }
      return;
    }

    if (quantity === 0) {
      addToCart(productId, 1, {
        ...itemDetails,
        variantId: variantId || undefined,
        customInstructions: trimmedInstructions || undefined,
        customImage: activeImage || undefined,
        customImageName: customImageName || undefined,
      });
    } else {
      updateQuantity(
        productId,
        "M",
        "#000",
        quantity + 1,
        trimmedInstructions,
        activeImage
      );
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      updateQuantity(
        productId,
        "M",
        "#000",
        quantity - 1,
        trimmedInstructions,
        activeImage
      );
    }
  };

  return (
    <div className={`${styles.container} ${quantity > 0 ? styles.active : ""}`}>
      {/* Main Add Button (Qty is 0) */}
      <button
        className={styles.addButton}
        onClick={handleIncrement}
        style={{
          opacity: quantity === 0 ? 1 : 0,
          pointerEvents: quantity === 0 ? "auto" : "none",
          transform: quantity === 0 ? "scale(1)" : "scale(0.95)",
        }}
      >
        <ShoppingBag size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} />
        Add to Cart
      </button>

      {/* Adjust quantity (Qty > 0) */}
      <div
        className={styles.quantityControls}
        style={{
          opacity: quantity > 0 ? 1 : 0,
          pointerEvents: quantity > 0 ? "auto" : "none",
          transform: quantity > 0 ? "scale(1)" : "scale(1.05)",
        }}
      >
        <button
          className={styles.qtyButton}
          onClick={handleDecrement}
          aria-label="Decrease quantity"
        >
          <Minus size={16} strokeWidth={2.5} />
        </button>
        <span className={styles.quantityText}>{quantity}</span>
        <button
          className={styles.qtyButton}
          onClick={handleIncrement}
          aria-label="Increase quantity"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
